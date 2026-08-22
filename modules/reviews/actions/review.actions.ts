"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/core/db/connect";
import { validateObjectId } from "@/core/db/utils";
import { AppError } from "@/core/errors";
import { ok, fail, type ActionResult } from "@/core/types";
import { toPlain } from "@/utils/to-plain";
// Server-only model import — deliberate exception to the client-safe barrel.
import { ProductModel } from "@/modules/products/models/product.model";
import { ReviewModel } from "../models/review.model";
import { createReviewSchema } from "../schemas/review.schema";
import type { Review } from "../types/review.types";

// ── Reads ───────────────────────────────────────────────────────────────────

/** Build-time read for product pages and the storefront review wall. */
export async function getProductReviews(productId: string): Promise<Review[]> {
  await connectDB();
  const docs = await ReviewModel.find({ productId })
    .sort({ createdAtUtc: -1 })
    .limit(50)
    .lean();
  return toPlain<Review[]>(docs);
}

export async function getRecentReviews(limit = 12): Promise<Review[]> {
  await connectDB();
  const docs = await ReviewModel.find({})
    .sort({ createdAtUtc: -1 })
    .limit(Math.min(50, limit))
    .lean();
  return toPlain<Review[]>(docs);
}

// ── Mutations ───────────────────────────────────────────────────────────────

/** PUBLIC mutation — customers review without an account (guest storefront). */
export async function createReview(input: unknown): Promise<ActionResult<Review>> {
  try {
    await connectDB();
    const data = createReviewSchema.parse(input);
    validateObjectId(data.productId, "product ID");

    const product = await ProductModel.findById(data.productId);
    if (!product) throw new AppError(404, "Product not found");

    const doc = await ReviewModel.create(data);

    // Refresh the product's aggregate rating.
    const agg = await ReviewModel.aggregate<{ avg: number }>([
      { $match: { productId: data.productId } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avg = agg[0]?.avg;
    if (avg) {
      product.rating = Math.round(avg * 10) / 10;
      await product.save();
    }

    revalidatePath("/");
    revalidatePath(`/products/${product.slug}`);
    return ok(toPlain<Review>(doc.toObject()));
  } catch (error) {
    return fail(error, "Failed to submit the review");
  }
}
