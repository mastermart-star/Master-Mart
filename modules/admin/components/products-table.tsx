"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/shared/smart-image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import {
  CATEGORIES,
  deleteProduct,
  fetchProducts,
  productKeys,
  ProductFormDialog,
  type Product,
} from "@/modules/products";
import { formatTaka } from "@/utils/format-currency";

export function ProductsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const params = { page, limit: 10, search: debouncedSearch };

  const { data, isPending } = useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params), // Route Handler, NOT the server action
    placeholderData: keepPreviousData,
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });

  const categoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.nameEn ?? id;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> Add product
        </Button>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.docs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.docs.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <SmartImage
                            src={product.image}
                            alt={product.nameEn}
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block max-w-48 truncate text-xs font-bold">
                            {product.nameEn}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {product.unitEn}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{categoryName(product.category)}</TableCell>
                    <TableCell>
                      <span className="text-xs font-black">
                        {formatTaka(product.discountPrice ?? product.price)}
                      </span>
                      {product.discountPrice != null && (
                        <span className="ml-1 text-[10px] text-muted-foreground line-through">
                          {formatTaka(product.price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock === 0
                            ? "destructive"
                            : product.stock <= 5
                              ? "warning"
                              : "success"
                        }
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">⭐ {product.rating}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            setEditing(product);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${product.nameEn}`}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() => {
                            if (window.confirm(`Delete "${product.nameEn}"?`)) {
                              remove(product._id);
                            }
                          }}
                          aria-label={`Delete ${product.nameEn}`}
                        >
                          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.totalDocs} products
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
    </div>
  );
}
