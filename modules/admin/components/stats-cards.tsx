import {
  Banknote,
  Bike,
  MessageSquareText,
  PackageCheck,
  ShoppingBasket,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatTaka } from "@/utils/format-currency";
import type { AdminStats } from "../actions/admin.actions";

/** Server-renderable stat tiles for the admin overview. */
export function StatsCards({ stats }: { stats: AdminStats }) {
  const tiles = [
    {
      label: "Total revenue",
      value: formatTaka(stats.totalRevenue),
      icon: Banknote,
      accent: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Active orders",
      value: String(stats.activeOrders),
      icon: Bike,
      accent: "text-sky-600 bg-sky-500/10",
    },
    {
      label: "Delivered orders",
      value: `${stats.deliveredOrders} / ${stats.totalOrders}`,
      icon: PackageCheck,
      accent: "text-violet-600 bg-violet-500/10",
    },
    {
      label: "Products in catalog",
      value: String(stats.totalProducts),
      icon: ShoppingBasket,
      accent: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Low stock (≤5)",
      value: String(stats.lowStockProducts),
      icon: TriangleAlert,
      accent: "text-rose-600 bg-rose-500/10",
    },
    {
      label: "Customer reviews",
      value: String(stats.totalReviews),
      icon: MessageSquareText,
      accent: "text-teal-600 bg-teal-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <Card key={tile.label} className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tile.accent}`}
            >
              <tile.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-black">{tile.value}</p>
              <p className="truncate text-[11px] font-semibold text-muted-foreground">
                {tile.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
