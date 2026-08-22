"use client";

import Link from "next/link";
import { Bike, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "../hooks/use-cart";

/**
 * Shows the visitor's own recent orders (remembered in localStorage) with
 * quick links to their live tracking pages.
 */
export function ActiveOrdersStrip() {
  const { lang, dict } = useLanguage();
  const { myOrderCodes, forgetOrder } = useCart();

  if (myOrderCodes.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-sm font-bold tracking-widest text-muted-foreground uppercase">
        🔴 {dict.recentOrdersLabel}
      </h3>
      <div className="flex flex-wrap gap-2">
        {myOrderCodes.map((code) => (
          <div
            key={code}
            className="flex items-center gap-1 rounded-xl border bg-card py-1 pr-1 pl-3 shadow-xs"
          >
            <Bike className="size-4 text-primary" />
            <Link
              href={`/track/${code}`}
              className="text-xs font-black hover:text-primary hover:underline"
            >
              #{code}
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 text-muted-foreground"
              onClick={() => forgetOrder(code)}
              aria-label={lang === "en" ? "Dismiss tracking" : "ট্র্যাকিং বন্ধ করুন"}
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
