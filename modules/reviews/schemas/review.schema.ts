import * as z from "zod";

/** Server contract — also exactly what the review form collects. */
export const createReviewSchema = z.object({
  productId: z.string().min(1),
  userName: z.string().min(2, "Enter your name").max(80),
  rating: z.number().int().min(1, "Pick a rating").max(5),
  comment: z.string().min(3, "Write a short comment").max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
