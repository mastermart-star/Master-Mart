"use server";

import { randomInt } from "node:crypto";
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
import { siteConfig } from "@/core/config";
import { toPlain } from "@/utils/to-plain";
import { buildSearchOr } from "@/utils/build-search-or";
// Deliberate exception to the barrel rule: Mongoose models are server-only and
// cannot ride the client-safe module barrel. Server code imports them directly.
import { ProductModel } from "@/modules/products/models/product.model";
import { OrderModel } from "../models/order.model";
import { placeOrderSchema, updateOrderStatusSchema } from "../schemas/order.schema";
import { sendOrderEmail } from "../utils/order-email";
import { ORDER_STATUS_PROGRESS, type Order, type OrderStatus } from "../types/order.types";

// ── Invalidation ────────────────────────────────────────────────────────────
function revalidateOrder() {
  revalidatePath("/admin"); // dashboard metrics
  revalidatePath("/admin/orders");
  revalidatePath("/"); // stock counters on the storefront
  revalidatePath("/(public)/products/[slug]", "page"); // stock on detail pages
}

function generateOrderCode(): string {
  return `MM-${randomInt(100000, 999999)}`;
}

// ── Reads ───────────────────────────────────────────────────────────────────

/**
 * PUBLIC read for the tracking page. The order code is an unguessable
 * capability — whoever placed the order received it. Deliberately not
 * session-gated (guest checkout has no session).
 */
export async function getOrderByCode(orderCode: string): Promise<Order> {
  await connectDB();
  const code = orderCode.trim().toUpperCase();
  if (!/^MM-\d{6}$/.test(code)) throw new AppError(400, "Invalid order code");
  const doc = await OrderModel.findOne({ orderCode: code }).lean();
  if (!doc) throw new AppError(404, "Order not found");
  return toPlain<Order>(doc);
}

/** Admin list. Authenticated, paginated, searchable. */
export async function getOrders(
  options: PaginationOptions & { status?: OrderStatus } = {}
): Promise<PaginatedResult<Order>> {
  await requireRole("admin");
  await connectDB();
  const { search = "", status, ...rest } = options;
  const or = buildSearchOr(["orderCode", "customerName", "customerPhone"], search);
  const filter: Record<string, unknown> = or ? { $or: or } : {};
  if (status) filter.status = status;
  return paginate<Order>(OrderModel, filter, rest);
}

// ── Mutations ───────────────────────────────────────────────────────────────

/**
 * PUBLIC mutation — guest checkout, deliberately unauthenticated.
 * Prices, totals and stock are computed server-side from product references;
 * the client can only choose WHAT to buy, never what it costs.
 */
export async function placeOrder(input: unknown): Promise<ActionResult<Order>> {
  try {
    await connectDB();
    const data = placeOrderSchema.parse(input);

    // Merge duplicate product lines before stock math.
    const wanted = new Map<string, number>();
    for (const item of data.items) {
      validateObjectId(item.productId, "product ID");
      wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + item.quantity);
    }

    const products = await ProductModel.find({ _id: { $in: [...wanted.keys()] } });
    if (products.length !== wanted.size) {
      throw new AppError(400, "Some products in your cart no longer exist");
    }

    const items = products.map((p) => {
      const quantity = wanted.get(String(p._id)) ?? 0;
      if (p.stock < quantity) {
        throw new AppError(409, `Only ${p.stock} × "${p.nameEn}" left in stock`);
      }
      return {
        productId: String(p._id),
        slug: p.slug,
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        unitEn: p.unitEn,
        unitBn: p.unitBn,
        image: p.image,
        price: p.discountPrice ?? p.price,
        quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { deliveryFee: baseFee, freeDeliveryThreshold, defaultEtaMinutes } =
      siteConfig.commerce;
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseFee;
    const total = subtotal + deliveryFee;

    // Guarded decrement — refuses to go below zero even under concurrency.
    for (const item of items) {
      const res = await ProductModel.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (res.modifiedCount === 0) {
        throw new AppError(409, `"${item.nameEn}" just sold out — please update your cart`);
      }
    }

    const doc = await OrderModel.create({
      orderCode: generateOrderCode(),
      items,
      subtotal,
      deliveryFee,
      total,
      status: "preparing",
      stepProgress: ORDER_STATUS_PROGRESS.preparing,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      etaMinutes: defaultEtaMinutes,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerEmail: data.customerEmail || undefined,
    });

    const order = toPlain<Order>(doc.toObject());
    await sendOrderEmail(order); // never throws
    revalidateOrder();
    return ok(order);
  } catch (error) {
    return fail(error, "Failed to place the order");
  }
}

/** Admin-only status pipeline. Transition to on_the_way dispatches the courier. */
export async function updateOrderStatus(
  id: string,
  input: unknown
): Promise<ActionResult<Order>> {
  try {
    await requireRole("admin");
    await connectDB();
    validateObjectId(id, "order ID");
    const data = updateOrderStatusSchema.parse(input);

    const order = await OrderModel.findById(id);
    if (!order) throw new AppError(404, "Order not found");

    order.status = data.status;
    order.stepProgress = ORDER_STATUS_PROGRESS[data.status];
    if (data.paymentStatus) order.paymentStatus = data.paymentStatus;
    if (data.status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "success";
    }

    // Steadfast courier dispatch simulation (same behavior as the old server).
    if (data.status === "on_the_way" && !order.courierTrackingId) {
      const trackingId = `STDFST-${randomInt(100000, 999999)}`;
      order.courierTrackingId = trackingId;
      order.courierTrackingUrl = `https://steadfast.com.bd/tracking/${trackingId}`;
      order.driverName = "Md. Rakib Rahman (Steadfast Rider)";
      order.driverPhone = "01712-345678";
      order.driverPhoto =
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
    }

    await order.save();
    const plain = toPlain<Order>(order.toObject());
    await sendOrderEmail(plain); // status update notification, never throws
    revalidateOrder();
    return ok(plain);
  } catch (error) {
    return fail(error, "Failed to update order status");
  }
}
