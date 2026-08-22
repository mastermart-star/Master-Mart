import { AppError } from "@/core/errors";
import { getOrders, type OrderStatus } from "@/modules/orders";

const STATUSES: OrderStatus[] = ["placed", "preparing", "on_the_way", "delivered"];

export async function GET(request: Request) {
  try {
    // getOrders() calls requireRole("admin") internally — the full order list
    // (names, phones, addresses) is admin data. Public tracking uses
    // /api/orders/[orderCode] instead.
    const sp = new URL(request.url).searchParams;
    const statusParam = sp.get("status");
    const result = await getOrders({
      page: Number(sp.get("page") ?? 1),
      limit: Number(sp.get("limit") ?? 10),
      sortBy: sp.get("sortBy") ?? "createdAtUtc",
      sortOrder: (sp.get("sortOrder") as "asc" | "desc") ?? "desc",
      search: sp.get("search") ?? "",
      ...(statusParam && STATUSES.includes(statusParam as OrderStatus)
        ? { status: statusParam as OrderStatus }
        : {}),
    });
    return Response.json(result);
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : "Internal server error";
    if (status === 500) console.error("GET /api/orders", error);
    return Response.json({ error: message }, { status });
  }
}
