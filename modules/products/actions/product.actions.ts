"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/core/db/connect";
import { paginate, validateObjectId } from "@/core/db/utils";
import { AppError } from "@/core/errors";
import {
  ok,
  fail,
  type ActionResult,
  type PaginationOptions,
  type PaginatedResult,
} from "@/core/types";
import { requireRole } from "@/lib/auth-guards";
import { toPlain } from "@/utils/to-plain";
import { buildSearchOr } from "@/utils/build-search-or";
import { generateSlug, normalizeSlug } from "@/utils/slug";
import { ProductModel } from "../models/product.model";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";
import type { Product } from "../types/product.types";

// ── Invalidation ────────────────────────────────────────────────────────────
// Every route that renders product data. Kept next to the mutations that use it.
function revalidateProduct(slug?: string) {
  revalidatePath("/"); // homepage catalog
  revalidatePath("/(public)/products/[slug]", "page"); // all product detail pages
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/products/${slug}`);
}

// ── Reads: return the value, throw on failure ───────────────────────────────

/** Build-time read for the public storefront. Static until revalidatePath fires. */
export async function getPublishedProducts(): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({}).sort({ createdAtUtc: -1 }).lean();
  return toPlain<Product[]>(docs);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  await connectDB();
  const doc = await ProductModel.findOne({ slug: normalizeSlug(slug) }).lean();
  if (!doc) throw new AppError(404, "Product not found");
  return toPlain<Product>(doc);
}

export async function getProductSlugs(): Promise<string[]> {
  await connectDB();
  const docs = await ProductModel.find({}).select("slug").lean();
  return docs.map((d) => d.slug as string);
}

/** Admin list. Authenticated, paginated, searchable. */
export async function getProducts(
  options: PaginationOptions = {}
): Promise<PaginatedResult<Product>> {
  await requireRole("admin");
  await connectDB();
  const { search = "", ...rest } = options;
  const or = buildSearchOr(["nameEn", "nameBn", "slug", "category"], search);
  return paginate<Product>(ProductModel, or ? { $or: or } : {}, rest);
}

// ── Mutations: return ActionResult, never throw across the boundary ─────────

export async function createProduct(input: unknown): Promise<ActionResult<Product>> {
  try {
    await requireRole("admin"); // 1. authenticate + authorize
    await connectDB();
    const raw = input as Record<string, unknown>;
    const data = createProductSchema.parse({
      ...raw,
      slug: normalizeSlug(
        typeof raw.slug === "string" && raw.slug
          ? raw.slug
          : generateSlug(String(raw.nameEn ?? ""))
      ),
    }); // 2. validate (shape only)

    const exists = await ProductModel.exists({ slug: data.slug });
    if (exists) throw new AppError(409, "A product with that name already exists");

    const doc = await ProductModel.create(data); // 3. do the work
    revalidateProduct(data.slug); // 4. invalidate
    return ok(toPlain<Product>(doc.toObject())); // 5. shaped return
  } catch (error) {
    return fail(error, "Failed to create product");
  }
}

export async function updateProduct(
  id: string,
  input: unknown
): Promise<ActionResult<Product>> {
  try {
    await requireRole("admin");
    await connectDB();
    validateObjectId(id, "product ID");
    const data = updateProductSchema.parse(input);
    if (data.slug) data.slug = normalizeSlug(data.slug);

    const updated = await ProductModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) throw new AppError(404, "Product not found");

    revalidateProduct(updated.slug as string);
    return ok(toPlain<Product>(updated));
  } catch (error) {
    return fail(error, "Failed to update product");
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  try {
    await requireRole("admin");
    await connectDB();
    validateObjectId(id, "product ID");
    const deleted = await ProductModel.findOneAndDelete({ _id: id }).lean();
    if (!deleted) throw new AppError(404, "Product not found");
    revalidateProduct(deleted.slug as string);
    return ok(null);
  } catch (error) {
    return fail(error, "Failed to delete product");
  }
}
