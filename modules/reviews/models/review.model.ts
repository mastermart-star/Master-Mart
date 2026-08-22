import mongoose, { Schema, model, models } from "mongoose";

export interface IReview extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAtUtc: Date;
  updatedAtUtc: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: "createdAtUtc", updatedAt: "updatedAtUtc" } }
);

ReviewSchema.index({ productId: 1, createdAtUtc: -1 });

export const ReviewModel =
  (models.Review as mongoose.Model<IReview>) ??
  model<IReview>("Review", ReviewSchema, "Review");
