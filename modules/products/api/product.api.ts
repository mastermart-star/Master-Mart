import type { PaginatedResult, PaginationOptions } from "@/core/types";
import type { Product } from "../types/product.types";

/**
 * Client reads go through a Route Handler, NOT a Server Action.
 * Server Actions dispatch serially per client, so parallel useQuery calls
 * queue behind each other. (TanStack Query documents this explicitly.)
 */
export async function fetchProducts(
  params: PaginationOptions
): Promise<PaginatedResult<Product>> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  );
  const res = await fetch(`/api/products?${qs}`);
  if (!res.ok) throw new Error((await res.text()) || "Failed to load products");
  return res.json();
}
