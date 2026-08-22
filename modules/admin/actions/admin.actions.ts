"use server";

import { connectDB } from "@/core/db/connect";
import { requireRole } from "@/lib/auth-guards";
// Server-only model imports — deliberate exception to the client-safe barrels.
import { OrderModel } from "@/modules/orders/models/order.model";
import { ProductModel } from "@/modules/products/models/product.model";
import { ReviewModel } from "@/modules/reviews/models/review.model";

export type AdminStats = {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  totalReviews: number;
};

/** Dashboard metrics. Authenticated, computed in the database. */
export async function getAdminStats(): Promise<AdminStats> {
  await requireRole("admin");
  await connectDB();

  const [
    totalOrders,
    activeOrders,
    deliveredOrders,
    revenueAgg,
    totalProducts,
    lowStockProducts,
    totalReviews,
  ] = await Promise.all([
    OrderModel.countDocuments({}),
    OrderModel.countDocuments({ status: { $ne: "delivered" } }),
    OrderModel.countDocuments({ status: "delivered" }),
    OrderModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    ProductModel.countDocuments({}),
    ProductModel.countDocuments({ stock: { $lte: 5 } }),
    ReviewModel.countDocuments({}),
  ]);

  return {
    totalOrders,
    activeOrders,
    deliveredOrders,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalProducts,
    lowStockProducts,
    totalReviews,
  };
}
