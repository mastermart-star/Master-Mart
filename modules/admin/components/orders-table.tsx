"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  fetchOrders,
  orderKeys,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/modules/orders";
import { formatTaka } from "@/utils/format-currency";

const STATUS_META: Record<OrderStatus, { label: string; variant: "secondary" | "warning" | "default" | "success" }> = {
  placed: { label: "Placed", variant: "secondary" },
  preparing: { label: "Preparing", variant: "warning" },
  on_the_way: { label: "On the way", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  placed: "preparing",
  preparing: "on_the_way",
  on_the_way: "delivered",
  delivered: null,
};

export function OrdersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  const params = {
    page,
    limit: 10,
    search: debouncedSearch,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data, isPending } = useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => fetchOrders(params), // Route Handler, NOT the server action
    placeholderData: keepPreviousData,
    refetchInterval: 5000, // live order feed
  });

  const { mutate: advance, isPending: isAdvancing } = useMutation({
    mutationFn: ({ order, status }: { order: Order; status: OrderStatus }) =>
      updateOrderStatus(order._id, { status }),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(
        result.data.status === "on_the_way"
          ? `Courier dispatched — ${result.data.courierTrackingId}`
          : `Order ${result.data.orderCode} → ${STATUS_META[result.data.status].label}`
      );
    },
    onError: () => toast.error("Something went wrong"),
  });

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
            placeholder="Search by order code, customer or phone…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="on_the_way">On the way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
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
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.docs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.docs.map((order) => {
                  const next = NEXT_STATUS[order.status];
                  return (
                    <TableRow key={order._id}>
                      <TableCell>
                        <span className="font-mono text-xs font-bold">{order.orderCode}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {new Date(order.createdAtUtc).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold">{order.customerName}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {order.customerPhone}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.items.reduce((n, i) => n + i.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-xs font-black">
                        {formatTaka(order.total)}
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-bold uppercase">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`block text-[10px] font-bold ${
                            order.paymentStatus === "success"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_META[order.status].variant}>
                          {STATUS_META[order.status].label}
                        </Badge>
                        {order.courierTrackingId && (
                          <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                            {order.courierTrackingId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" className="size-8" asChild>
                            <a
                              href={`/api/invoice/${order.orderCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Printable invoice"
                            >
                              <FileText />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={`/track/${order.orderCode}`} title="Tracking page">
                              <ExternalLink />
                            </Link>
                          </Button>
                          {next && (
                            <Button
                              size="sm"
                              disabled={isAdvancing}
                              onClick={() => advance({ order, status: next })}
                            >
                              {isAdvancing && <Loader2 className="animate-spin" />}
                              → {STATUS_META[next].label}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.totalDocs} orders
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
    </div>
  );
}
