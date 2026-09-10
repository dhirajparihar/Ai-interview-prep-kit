import mongoose, { Schema, Document, Model } from "mongoose";
import { KitData } from "@/lib/validation/kitSchema";

export interface IKit extends Document {
  userId: string;
  fingerprint: string;
  status: "generating" | "completed" | "failed";
  generationStage?: string;
  error?: {
    code: string;
    message: string;
  } | null;
  kit: KitData;
  createdAt: Date;
  updatedAt: Date;
}

const KitSchema = new Schema<IKit>(
  {
    userId: { type: String, required: true, index: true },
    fingerprint: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "completed",
    },
    generationStage: { type: String },
    error: {
      code: { type: String },
      message: { type: String },
    },
    kit: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const KitModel: Model<IKit> =
  mongoose.models.Kit || mongoose.model<IKit>("Kit", KitSchema);
