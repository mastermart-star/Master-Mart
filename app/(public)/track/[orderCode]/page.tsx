import type { Metadata } from "next";
import { OrderTracker } from "@/modules/orders";

/**
 * Live order tracking. Deliberately DYNAMIC (ƒ): order codes are created at
 * runtime so there is nothing for generateStaticParams to return, and live
 * status must never be frozen into cached HTML. The page ships a thin shell;
 * the client tracker polls /api/orders/[orderCode] every 4 seconds.
 */
export const metadata: Metadata = { title: "Order Tracking", robots: { index: false } };

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <OrderTracker orderCode={decodeURIComponent(orderCode).toUpperCase()} />
    </main>
  );
}
