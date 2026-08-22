import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { getProducts, productKeys } from "@/modules/products";
import { ProductsTable } from "@/modules/admin";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const queryClient = getQueryClient();
  const params = { page: 1, limit: 10, search: "" };

  await queryClient.prefetchQuery({
    queryKey: productKeys.list(params), // SAME key the client component uses
    queryFn: () => getProducts(params), // server action is fine HERE (server side)
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Products</h1>
        <p className="text-sm text-muted-foreground">
          Catalog management — changes revalidate the public storefront instantly.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsTable />
      </HydrationBoundary>
    </div>
  );
}
