import { Hero } from "@/components/shared/hero";
import { ActiveOrdersStrip } from "@/modules/orders";
import { Catalog, getPublishedProducts } from "@/modules/products";

// Build FAILS if anything in this subtree touches a request-time API — the
// cheapest possible regression test against accidental dynamic rendering.
export const dynamic = "error";

export default async function HomePage() {
  // .catch(() => []) so a cold or unreachable database cannot fail the build.
  // Check the build log — this can silently publish an empty catalog.
  const products = await getPublishedProducts().catch(() => []);

  return (
    <main>
      <Hero />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <ActiveOrdersStrip />
        <Catalog products={products} />
      </div>
    </main>
  );
}
