import { connectToDatabase } from "@/lib/db/mongoose";
import { KitModel, IKit } from "@/lib/models/Kit";
import { PracticeProgressModel } from "@/lib/models/PracticeProgress";
import { Requirement, Question } from "@/lib/validation/kitSchema";

export interface WeakSpotRequirement {
  requirement: Requirement;
  avgConfidence: number;
  totalCards: number;
  priority: "must" | "nice";
  status: "CRITICAL" | "NEEDS_WORK" | "MASTEDED";
}

export interface WeakSpotsReport {
  overallReadinessScore: number;
  weakestRequirements: WeakSpotRequirement[];
  lowConfidenceQuestions: Question[];
  recommendedActionItems: string[];
}

export class WeakSpotsService {
  public async generateWeakSpotsReport(
    userId: string,
    kitId: string
  ): Promise<WeakSpotsReport | null> {
    await connectToDatabase();

    const kitDoc = (await KitModel.findOne({ _id: kitId, userId }).lean()) as unknown as IKit | null;
    if (!kitDoc) return null;

    const requirements = kitDoc.kit.role.requirements || [];
    const questions = kitDoc.kit.questions || [];
    const flashcards = kitDoc.kit.flashcards || [];

    const progressRecords = await PracticeProgressModel.find({
      userId,
      kitId,
    }).lean();

    const cardConfidenceMap = new Map<string, number>();
    progressRecords.forEach((r) => {
      cardConfidenceMap.set(r.cardId, r.confidence);
    });

    const weakRequirements: WeakSpotRequirement[] = [];
    let totalScoreSum = 0;
    let countedCards = 0;

    requirements.forEach((req) => {
      const linkedCards = flashcards.filter((f) =>
        f.requirement_ids.includes(req.id)
      );

      let confSum = 0;
      let cardCount = 0;

      linkedCards.forEach((c) => {
        const conf = cardConfidenceMap.get(c.id);
        if (conf !== undefined) {
          confSum += conf;
          cardCount++;
          totalScoreSum += conf;
          countedCards++;
        }
      });

      const avgConf = cardCount > 0 ? confSum / cardCount : 1; // Default to 1 (low) if unpracticed

      let status: "CRITICAL" | "NEEDS_WORK" | "MASTEDED" = "NEEDS_WORK";
      if (avgConf < 1.8) {
        status = req.priority === "must" ? "CRITICAL" : "NEEDS_WORK";
      } else if (avgConf >= 2.5) {
        status = "MASTEDED";
      }

      weakRequirements.push({
        requirement: req,
        avgConfidence: Number(avgConf.toFixed(1)),
        totalCards: linkedCards.length,
        priority: req.priority,
        status,
      });
    });

    // Sort weak requirements: CRITICAL first, then lower average confidence
    weakRequirements.sort((a, b) => {
      if (a.status === "CRITICAL" && b.status !== "CRITICAL") return -1;
      if (a.status !== "CRITICAL" && b.status === "CRITICAL") return 1;
      return a.avgConfidence - b.avgConfidence;
    });

    // Find questions linked to weakest requirements
    const weakReqIds = new Set(
      weakRequirements.slice(0, 3).map((w) => w.requirement.id)
    );
    const lowConfidenceQuestions = questions.filter((q) =>
      q.requirement_ids.some((id) => weakReqIds.has(id))
    );

    const overallReadinessScore =
      countedCards > 0
        ? Math.round((totalScoreSum / (countedCards * 3)) * 100)
        : 0;

    const actionItems: string[] = [];
    if (weakRequirements.length > 0 && weakRequirements[0].status === "CRITICAL") {
      actionItems.push(
        `Focus immediately on MUST requirement: "${weakRequirements[0].requirement.text}"`
      );
    }
    actionItems.push("Review low-confidence flashcards in Practice Mode.");
    actionItems.push("Practice system design and technical answer outlines out loud.");

    return {
      overallReadinessScore,
      weakestRequirements: weakRequirements.slice(0, 5),
      lowConfidenceQuestions: lowConfidenceQuestions.slice(0, 5),
      recommendedActionItems: actionItems,
    };
  }
}
