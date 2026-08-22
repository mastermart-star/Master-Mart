import { AppError } from "@/core/errors";
import { getOrderByCode } from "@/modules/orders";

/**
 * PUBLIC single-order read for live tracking. The unguessable order code is
 * the capability — only someone who placed (or was sent) the order has it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await params;
    const order = await getOrderByCode(decodeURIComponent(orderCode));
    return Response.json(order);
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : "Internal server error";
    if (status === 500) console.error("GET /api/orders/[orderCode]", error);
    return Response.json({ error: message }, { status });
  }
}
