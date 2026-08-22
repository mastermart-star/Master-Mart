import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  nameEn: string;
  nameBn: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  unitEn: string;
  unitBn: string;
  rating: number;
  image: string;
  stock: number;
  isVeg: boolean;
  descriptionEn?: string;
  descriptionBn?: string;
  createdAtUtc: Date;
  updatedAtUtc: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    unitEn: { type: String, required: true, trim: true },
    unitBn: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    image: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isVeg: { type: Boolean, default: false },
    descriptionEn: { type: String, trim: true },
    descriptionBn: { type: String, trim: true },
  },
  // Renamed timestamps make the UTC contract visible at every call site.
  { timestamps: { createdAt: "createdAtUtc", updatedAt: "updatedAtUtc" } }
);

// Index every field you filter or sort on — added with the query, not later.
ProductSchema.index({ category: 1, createdAtUtc: -1 });
ProductSchema.index({ createdAtUtc: -1 });

// models.X ?? model(...) guard is required: HMR re-evaluates this module.
// Third arg pins the collection name — never rely on pluralization.
export const ProductModel =
  (models.Product as mongoose.Model<IProduct>) ??
  model<IProduct>("Product", ProductSchema, "Product");
