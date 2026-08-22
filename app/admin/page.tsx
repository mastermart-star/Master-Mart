import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, StatsCards } from "@/modules/admin";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live storefront metrics, straight from the database.
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {stats.activeOrders} active order{stats.activeOrders === 1 ? "" : "s"} waiting
              on the pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/admin/orders">
                Manage orders <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              {stats.lowStockProducts} product{stats.lowStockProducts === 1 ? "" : "s"} low
              on stock (≤5 left).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/admin/products">
                Manage catalog <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Payments, courier credentials and chat support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/admin/settings">
                Configure <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
