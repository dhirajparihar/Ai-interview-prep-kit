import { connectToDatabase } from "@/lib/db/mongoose";
import { KitModel, IKit } from "@/lib/models/Kit";
import { KitPipeline, calculateFingerprint } from "@/lib/pipeline/kitPipeline";
import { QuestionGenerator } from "@/lib/questions/questionGenerator";
import { allocateSchedule } from "@/lib/scheduling/scheduleAllocator";
import { validateKit, KitData, Question } from "@/lib/validation/kitSchema";

export interface CreateKitInput {
  userId: string;
  jd: string;
  companyUrl: string;
  days: number;
}

export class KitService {
  private pipeline = new KitPipeline();

  public async getKitsForUser(userId: string): Promise<IKit[]> {
    await connectToDatabase();
    const kits = await KitModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return kits as unknown as IKit[];
  }

  public async getKitById(userId: string, kitId: string): Promise<IKit | null> {
    await connectToDatabase();
    const kit = await KitModel.findOne({ _id: kitId, userId }).lean();
    return kit as IKit | null;
  }

  public async createOrGetExistingKit(
    input: CreateKitInput,
    onProgress?: (stage: string, percent: number) => void
  ): Promise<IKit> {
    await connectToDatabase();
    const fingerprint = calculateFingerprint(input.jd, input.companyUrl);

    // Section 24: Check idempotency / duplicate submission
    const existing = await KitModel.findOne({ userId: input.userId, fingerprint });
    if (existing && existing.status === "completed") {
      return existing;
    }

    const newKitDoc = new KitModel({
      userId: input.userId,
      fingerprint,
      status: "generating",
      generationStage: "Starting generation...",
      kit: {
        source: {
          company: "",
          company_url: input.companyUrl,
          role: "",
          location: "",
          jd_chars: input.jd.length,
          researched_at: new Date().toISOString(),
          pages_used: [],
        },
        company_brief: { summary: "", what_they_do: "", sources: [], state: "generated" },
        role: { title: "", seniority: "", responsibilities: [], requirements: [], state: "generated" },
        questions: [],
        flashcards: [],
        schedule: { days_available: input.days, days: [] },
        coverage: { uncovered_requirement_ids: [], passes: 1 },
      },
    });

    await newKitDoc.save();

    try {
      const kitData = await this.pipeline.run({
        jd: input.jd,
        companyUrl: input.companyUrl,
        days: input.days,
        onProgress: async (stage, percent) => {
          newKitDoc.generationStage = stage;
          await KitModel.updateOne(
            { _id: newKitDoc._id },
            { $set: { generationStage: stage } }
          );
          if (onProgress) onProgress(stage, percent);
        },
      });

      newKitDoc.status = "completed";
      newKitDoc.kit = kitData;
      await newKitDoc.save();

      return newKitDoc;
    } catch (err) {
      newKitDoc.status = "failed";
      newKitDoc.error = {
        code: "GENERATION_FAILED",
        message: err instanceof Error ? err.message : "Kit generation failed",
      };
      await newKitDoc.save();
      throw err;
    }
  }

  public async deleteKit(userId: string, kitId: string): Promise<boolean> {
    await connectToDatabase();
    const res = await KitModel.deleteOne({ _id: kitId, userId });
    return res.deletedCount > 0;
  }

  public async updateKit(
    userId: string,
    kitId: string,
    updatedKitData: KitData
  ): Promise<IKit | null> {
    await connectToDatabase();
    const validated = validateKit(updatedKitData);
    const updated = await KitModel.findOneAndUpdate(
      { _id: kitId, userId },
      { $set: { kit: validated } },
      { new: true }
    );
    return updated;
  }

  public async updateQuestion(
    userId: string,
    kitId: string,
    questionId: string,
    data: Partial<Question>
  ): Promise<IKit | null> {
    await connectToDatabase();
    const kitDoc = await KitModel.findOne({ _id: kitId, userId });
    if (!kitDoc) return null;

    const questions = kitDoc.kit.questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          ...data,
          state: "edited" as const, // Section 18: Mark as edited to survive regeneration
        };
      }
      return q;
    });

    kitDoc.kit.questions = questions;
    kitDoc.markModified("kit");
    await kitDoc.save();
    return kitDoc;
  }

  public async regenerateCategory(
    userId: string,
    kitId: string,
    category: "technical" | "behavioural" | "system-design" | "company-fit"
  ): Promise<IKit | null> {
    await connectToDatabase();
    const kitDoc = await KitModel.findOne({ _id: kitId, userId });
    if (!kitDoc) return null;

    const kitData: KitData = kitDoc.kit;
    const qGen = new QuestionGenerator();

    const newGeneratedQuestions = await qGen.generateQuestionsForCategory(
      category,
      kitData.role.requirements,
      {
        companyName: kitData.source.company,
        hiringText: kitData.company_brief.what_they_do,
        discussionText: "",
      }
    );

    // Section 18: Preserve edited/pinned questions, replace ONLY purely generated questions in this category
    const preservedQuestions = kitData.questions.filter(
      (q) =>
        q.category !== category ||
        q.state === "edited" ||
        q.state === "pinned"
    );

    const mergedQuestions = [...preservedQuestions, ...newGeneratedQuestions];
    kitData.questions = mergedQuestions;

    // Recalculate schedule deterministically with updated question set
    kitData.schedule = allocateSchedule(
      kitData.role.requirements,
      mergedQuestions,
      kitData.schedule.days_available
    );

    kitDoc.markModified("kit");
    await kitDoc.save();
    return kitDoc;
  }

  public async reorderQuestions(
    userId: string,
    kitId: string,
    questionIdsOrder: string[]
  ): Promise<IKit | null> {
    await connectToDatabase();
    const kitDoc = await KitModel.findOne({ _id: kitId, userId });
    if (!kitDoc) return null;

    const questionMap = new Map<string, Question>();
    kitDoc.kit.questions.forEach((q) => questionMap.set(q.id, q));

    const reordered: Question[] = [];
    questionIdsOrder.forEach((id) => {
      const q = questionMap.get(id);
      if (q) reordered.push(q);
    });

    kitDoc.kit.questions.forEach((q) => {
      if (!questionIdsOrder.includes(q.id)) {
        reordered.push(q);
      }
    });

    kitDoc.kit.questions = reordered;
    kitDoc.kit.schedule = allocateSchedule(
      kitDoc.kit.role.requirements,
      reordered,
      kitDoc.kit.schedule.days_available
    );

    kitDoc.markModified("kit");
    await kitDoc.save();
    return kitDoc;
  }
}
