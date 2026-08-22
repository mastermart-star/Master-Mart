import * as z from "zod";
import { CATEGORY_IDS } from "../constants/categories";

/** Only what the admin types in the product form (slug is derived server-side on create). */
export const productFormSchema = z
  .object({
    nameEn: z.string().min(2, "English name must be at least 2 characters").max(200),
    nameBn: z.string().min(1, "Bengali name is required").max(200),
    category: z.string().refine((c) => CATEGORY_IDS.includes(c), "Pick a category"),
    price: z.coerce.number<number>().positive("Price must be positive"),
    discountPrice: z
      .union([z.coerce.number<number>().positive(), z.literal(""), z.null()])
      .optional(),
    unitEn: z.string().min(1, "Unit (EN) is required").max(50),
    unitBn: z.string().min(1, "Unit (BN) is required").max(50),
    image: z.string().min(1, "Add a product image"),
    stock: z.coerce.number<number>().int().min(0),
    isVeg: z.boolean(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionBn: z.string().max(2000).optional(),
  })
  .refine(
    (v) =>
      v.discountPrice === "" ||
      v.discountPrice == null ||
      Number(v.discountPrice) < v.price,
    { message: "Discount price must be lower than the price", path: ["discountPrice"] }
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;
