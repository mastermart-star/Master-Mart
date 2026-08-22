"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "../constants/categories";
import type { Product } from "../types/product.types";
import { CategoryIcon } from "./category-icon";
import { ProductCard } from "./product-card";

/**
 * Interactive storefront catalog. Receives the FULL product list as a prop
 * from the static page (fetched at build/revalidate time) and filters
 * client-side — no request-time API touched, the route stays static.
 */
export function Catalog({ products }: { products: Product[] }) {
  const { lang, dict } = useLanguage();
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = categoryId === "all" || p.category === categoryId;
      const matchesSearch =
        !q ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameBn.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryId, debouncedSearch]);

  const activeCategory = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Categories sidebar */}
      <div className="space-y-4 lg:col-span-1">
        <Card className="gap-0 p-4">
          <h2 className="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {dict.categoriesHeader}
          </h2>

          {/* Desktop list */}
          <div className="hidden gap-2 lg:flex lg:flex-col">
            {CATEGORIES.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold tracking-wide uppercase transition-all",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <span
                    className={cn(
                      "rounded-md bg-linear-to-tr p-1.5 text-white",
                      cat.color
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="size-4" />
                  </span>
                  <span>{lang === "en" ? cat.nameEn : cat.nameBn}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto size-3.5",
                      selected ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Mobile grid */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 pt-1 sm:grid-cols-6 lg:hidden">
            {CATEGORIES.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSearch("");
                  }}
                  className="group flex w-full cursor-pointer flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full border transition-all",
                      selected
                        ? cn(
                            "bg-linear-to-tr text-white ring-2 ring-primary ring-offset-2 ring-offset-background",
                            cat.color
                          )
                        : "bg-muted text-foreground hover:bg-accent"
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "line-clamp-2 min-h-8 px-0.5 text-[10px] leading-tight font-bold",
                      selected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {lang === "en" ? cat.nameEn : cat.nameBn}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Promise card */}
        <Card className="hidden gap-2 border-primary/20 bg-linear-to-tr from-slate-900 to-slate-800 p-5 text-white lg:flex dark:from-slate-950 dark:to-slate-900">
          <span className="w-fit rounded-md border border-primary/25 bg-primary/15 px-2.5 py-1 text-[10px] font-black tracking-wider text-primary uppercase">
            {lang === "en" ? "Master Mart Promise" : "মাস্টার মার্ট প্রতিশ্রুতি"}
          </span>
          <h4 className="flex items-center gap-1.5 text-base font-black">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {lang === "en" ? "Quality Refined" : "মানসম্পন্ন বাছায়ের নিশ্চয়তা"}
          </h4>
          <p className="text-xs leading-relaxed text-slate-300">
            {lang === "en"
              ? "If any of our vegetable or fruit produce turns bad, we will refund inside 1 hour, no questions asked!"
              : "আমাদের শাকসবজি বা মালের মান পছন্দ না হলে ১ ঘণ্টার মধ্যে রিটার্ন সুবিধা! কোনো প্রশ্ন করা হবে না।"}
          </p>
        </Card>
      </div>

      {/* Products */}
      <div className="space-y-6 lg:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black">
              {activeCategory
                ? lang === "en"
                  ? activeCategory.nameEn
                  : activeCategory.nameBn
                : dict.allProducts}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lang === "en"
                ? `Showing ${filtered.length} instant grocery matches`
                : `আপনার জন্য ${filtered.length}টি পণ্য মজুত রয়েছে`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="items-center border-dashed p-16 text-center">
            <p className="text-sm text-muted-foreground italic">{dict.noProducts}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setCategoryId("all");
              }}
            >
              {lang === "en" ? "Reset Filters" : "ফিল্টার রিসেট করুন"}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
