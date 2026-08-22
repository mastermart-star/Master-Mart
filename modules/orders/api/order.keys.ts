import type { PaginationOptions } from "@/core/types";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (p: PaginationOptions & { status?: string }) => [...orderKeys.lists(), p] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (orderCode: string) => [...orderKeys.details(), orderCode] as const,
};
