import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/core/config";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-6xl">🛒</span>
      <h1 className="text-3xl font-black">404 — Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist. Head back to the {siteConfig.name}{" "}
        storefront to keep shopping.
      </p>
      <Button asChild>
        <Link href="/">Back to the store</Link>
      </Button>
    </main>
  );
}
