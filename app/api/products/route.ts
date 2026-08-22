import { AppError } from "@/core/errors";
import { getProducts } from "@/modules/products";

export async function GET(request: Request) {
  try {
    // getProducts() calls requireRole("admin") internally.
    // A route handler is a public URL — never assume the caller came from your UI.
    const sp = new URL(request.url).searchParams;
    const result = await getProducts({
      page: Number(sp.get("page") ?? 1),
      limit: Number(sp.get("limit") ?? 10),
      sortBy: sp.get("sortBy") ?? "createdAtUtc",
      sortOrder: (sp.get("sortOrder") as "asc" | "desc") ?? "desc",
      search: sp.get("search") ?? "",
    });
    return Response.json(result);
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : "Internal server error";
    if (status === 500) console.error("GET /api/products", error);
    return Response.json({ error: message }, { status });
  }
}
