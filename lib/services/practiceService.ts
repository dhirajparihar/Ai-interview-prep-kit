import { connectToDatabase } from "@/lib/db/mongoose";
import { PracticeProgressModel } from "@/lib/models/PracticeProgress";
import { KitModel, IKit } from "@/lib/models/Kit";
import { Flashcard } from "@/lib/validation/kitSchema";

export interface PracticeSessionCard extends Flashcard {
  confidence?: number;
  attemptsCount?: number;
  lastReviewedAt?: string;
}

export class PracticeService {
  public async getPracticeDeck(
    userId: string,
    kitId: string
  ): Promise<PracticeSessionCard[]> {
    await connectToDatabase();
    const kitDoc = (await KitModel.findOne({ _id: kitId, userId }).lean()) as unknown as IKit | null;
    if (!kitDoc) return [];

    const flashcards: Flashcard[] = kitDoc.kit.flashcards || [];
    const progressRecords = await PracticeProgressModel.find({
      userId,
      kitId,
    }).lean();

    const progressMap = new Map<string, { confidence: number; attemptsCount: number; lastReviewedAt: Date }>();
    progressRecords.forEach((rec) => {
      progressMap.set(rec.cardId, {
        confidence: rec.confidence,
        attemptsCount: rec.attemptsCount,
        lastReviewedAt: rec.lastReviewedAt,
      });
    });

    const deck: PracticeSessionCard[] = flashcards.map((card) => {
      const prog = progressMap.get(card.id);
      return {
        ...card,
        confidence: prog?.confidence ?? 0, // 0 = unreviewed
        attemptsCount: prog?.attemptsCount ?? 0,
        lastReviewedAt: prog?.lastReviewedAt ? prog.lastReviewedAt.toISOString() : undefined,
      };
    });

    // Sort deck: unreviewed (0) first, then low confidence (1) -> medium (2) -> high (3)
    deck.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));

    return deck;
  }

  public async recordConfidence(
    userId: string,
    kitId: string,
    cardId: string,
    confidence: number
  ): Promise<boolean> {
    await connectToDatabase();

    await PracticeProgressModel.findOneAndUpdate(
      { userId, kitId, cardId },
      {
        $set: {
          confidence,
          lastReviewedAt: new Date(),
        },
        $inc: { attemptsCount: 1 },
      },
      { upsert: true, new: true }
    );

    return true;
  }
}
