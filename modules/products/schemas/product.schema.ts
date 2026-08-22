import * as z from "zod"; // Zod 4: plain "zod", NOT "zod/v4"
import { SLUG_PATTERN } from "@/utils/slug";
import { CATEGORY_IDS } from "../constants/categories";

/** Server/DB contract — used by Server Actions. */
export const createProductSchema = z.object({
  slug: z.string().regex(SLUG_PATTERN, "Invalid slug"),
  nameEn: z.string().min(2, "English name must be at least 2 characters").max(200),
  nameBn: z.string().min(1, "Bengali name is required").max(200),
  category: z.string().refine((c) => CATEGORY_IDS.includes(c), "Unknown category"),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive().nullable().optional(),
  unitEn: z.string().min(1).max(50),
  unitBn: z.string().min(1).max(50),
  rating: z.number().min(0).max(5).default(4.5),
  image: z.string().min(1, "Image is required"),
  stock: z.number().int().min(0),
  isVeg: z.boolean().default(false),
  descriptionEn: z.string().max(2000).optional(),
  descriptionBn: z.string().max(2000).optional(),
});

export const updateProductSchema = createProductSchema.partial();
