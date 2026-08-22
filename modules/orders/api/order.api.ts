import type { PaginatedResult, PaginationOptions } from "@/core/types";
import type { Order } from "../types/order.types";

/** Admin orders table + background polling (Route Handler, not a Server Action). */
export async function fetchOrders(
  params: PaginationOptions & { status?: string }
): Promise<PaginatedResult<Order>> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  );
  const res = await fetch(`/api/orders?${qs}`);
  if (!res.ok) throw new Error((await res.text()) || "Failed to load orders");
  return res.json();
}

/** Public live-tracking poll for a single order by its code. */
export async function fetchOrderByCode(orderCode: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}`);
  if (!res.ok) throw new Error((await res.text()) || "Order not found");
  return res.json();
}
