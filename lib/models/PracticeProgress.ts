import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPracticeProgress extends Document {
  userId: string;
  kitId: string;
  cardId: string;
  confidence: number; // 1 (Low), 2 (Medium), 3 (High)
  attemptsCount: number;
  lastReviewedAt: Date;
}

const PracticeProgressSchema = new Schema<IPracticeProgress>(
  {
    userId: { type: String, required: true, index: true },
    kitId: { type: String, required: true, index: true },
    cardId: { type: String, required: true },
    confidence: { type: Number, required: true, min: 1, max: 3 },
    attemptsCount: { type: Number, default: 1 },
    lastReviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PracticeProgressSchema.index({ userId: 1, kitId: 1, cardId: 1 }, { unique: true });

export const PracticeProgressModel: Model<IPracticeProgress> =
  mongoose.models.PracticeProgress ||
  mongoose.model<IPracticeProgress>("PracticeProgress", PracticeProgressSchema);
