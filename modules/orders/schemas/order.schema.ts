import * as z from "zod";

/**
 * Server contract for placing an order. The client sends product REFERENCES
 * and quantities only — prices, totals and stock checks are computed on the
 * server (never trust a client-side total).
 */
export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty")
    .max(100),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(6).max(20),
  customerAddress: z.string().min(5).max(500),
  customerEmail: z.email().optional().or(z.literal("")),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["placed", "preparing", "on_the_way", "delivered"]),
  paymentStatus: z.enum(["pending", "success", "failed"]).optional(),
});
