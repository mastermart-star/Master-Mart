import mongoose, { type Model } from "mongoose";
import { AppError } from "@/core/errors";
import { toPlain } from "@/utils/to-plain";
import type { PaginatedResult, PaginationOptions } from "@/core/types";

export function validateObjectId(id: string, label = "ID"): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, `Invalid ${label} format`);
  }
}

export async function paginate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  filter: Record<string, unknown>,
  { page = 1, limit = 10, sortBy = "createdAtUtc", sortOrder = "desc" }: PaginationOptions
): Promise<PaginatedResult<T>> {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

  const [docs, totalDocs] = await Promise.all([
    model
      .find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalDocs / safeLimit) || 1;

  return {
    docs: toPlain<T[]>(docs),
    page: safePage,
    limit: safeLimit,
    totalDocs,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}
