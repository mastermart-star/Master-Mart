import { AppError } from "@/core/errors";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/** Never leak an internal error message to the client in production. */
export function fail(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof AppError) return { success: false, error: error.message };
  console.error(fallback, error);
  return { success: false, error: fallback };
}

export type PaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
};

export type PaginatedResult<T> = {
  docs: T[];
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
