"use client";

import Link from "next/link";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmartImage } from "@/components/shared/smart-image";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/modules/orders/hooks/use-cart";
import { formatTaka } from "@/utils/format-currency";
import type { Product } from "../types/product.types";

export function ProductCard({ product }: { product: Product }) {
  const { lang, dict } = useLanguage();
  const { addToCart, removeFromCart, getQuantity } = useCart();

  const quantity = getQuantity(product._id);
  const hasDiscount = product.discountPrice != null && product.discountPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100)
    : 0;
  const name = lang === "en" ? product.nameEn : product.nameBn;
  const unit = lang === "en" ? product.unitEn : product.unitBn;
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    const added = addToCart(product);
    if (!added) {
      toast.error(
        lang === "en"
          ? `Only ${product.stock} in stock`
          : `স্টকে মাত্র ${product.stock}টি আছে`
      );
      return;
    }
    toast.success(lang === "en" ? `Added ${product.nameEn}` : `${product.nameBn} কার্টে যোগ হয়েছে`);
  };

  return (
    <Card className="group relative gap-0 overflow-hidden p-3 transition-shadow hover:shadow-md">
      {hasDiscount && (
        <Badge className="absolute top-2 left-2 z-10 bg-brand text-brand-foreground">
          {discountPercent}% {dict.off}
        </Badge>
      )}
      <Link
        href={`/products/${product.slug}`}
        className="relative block h-36 w-full overflow-hidden rounded-lg bg-muted"
        title={dict.viewDetails}
      >
        <SmartImage
          src={product.image}
          alt={name}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant={product.isVeg ? "success" : "warning"} className="text-[10px]">
            {product.isVeg ? dict.vegTag : dict.nonVegTag}
          </Badge>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
          {name}
        </Link>
        <span className="text-xs text-muted-foreground">{unit}</span>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="leading-tight">
            <span className="text-base font-bold">
              {formatTaka(product.discountPrice ?? product.price, lang)}
            </span>
            {hasDiscount && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                {formatTaka(product.price, lang)}
              </span>
            )}
          </div>

          {outOfStock ? (
            <Badge variant="destructive">{dict.outOfStock}</Badge>
          ) : quantity === 0 ? (
            <Button size="sm" onClick={handleAdd}>
              <Plus /> {dict.addToCart}
            </Button>
          ) : (
            <div className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                onClick={() => removeFromCart(product._id)}
                aria-label="Decrease quantity"
              >
                <Minus />
              </Button>
              <span className="w-4 text-center text-sm font-bold">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                onClick={handleAdd}
                aria-label="Increase quantity"
              >
                <Plus />
              </Button>
            </div>
          )}
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-[11px] font-medium text-destructive">
            {lang === "en" ? `Only ${product.stock} left!` : `মাত্র ${product.stock}টি বাকি!`}
          </span>
        )}
      </div>
    </Card>
  );
}
