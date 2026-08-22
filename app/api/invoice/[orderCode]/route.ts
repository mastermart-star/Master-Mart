import { AppError } from "@/core/errors";
import { getOrderByCode } from "@/modules/orders";
// Server-only util import (not in the barrel — it never crosses to a client).
import { buildPrintableInvoice } from "@/modules/orders/utils/invoice-html";

/** Printable HTML receipt. Public by capability — the order code is unguessable. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await params;
    const order = await getOrderByCode(decodeURIComponent(orderCode));
    return new Response(buildPrintableInvoice(order), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    if (status === 500) console.error("GET /api/invoice/[orderCode]", error);
    return new Response("<h1>Order invoice not found.</h1>", {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
