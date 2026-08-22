import Link from "next/link";
import { redirect } from "next/navigation";
import { siteConfig } from "@/core/config";
import { getSession } from "@/lib/auth-guards";
import { AdminNav } from "@/modules/admin";

/**
 * Admin shell — inherently DYNAMIC (reads the session cookie). That is
 * expected; the session is read here, as high as possible, and pages below
 * stream through loading.tsx. Note: this render-time gate is UX, not the
 * security boundary — every action/route handler re-checks requireRole().
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="text-lg font-black">
            {siteConfig.name} <span className="text-primary">Admin</span>
          </Link>
          <div className="text-right">
            <span className="block text-xs font-bold">{session.user.name}</span>
            <span className="block text-[11px] text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
