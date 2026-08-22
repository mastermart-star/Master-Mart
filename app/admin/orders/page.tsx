import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { getOrders, orderKeys } from "@/modules/orders";
import { OrdersTable } from "@/modules/admin";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const queryClient = getQueryClient();
  const params = { page: 1, limit: 10, search: "" };

  // Prefetch on the server so the client renders instantly with no waterfall.
  await queryClient.prefetchQuery({
    queryKey: orderKeys.list(params), // SAME key the client component uses
    queryFn: () => getOrders(params), // server action is fine HERE (server side)
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Advance the pipeline: Placed → Preparing → On the way (courier dispatch) →
          Delivered.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OrdersTable />
      </HydrationBoundary>
    </div>
  );
}
