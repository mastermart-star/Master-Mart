"use client";

import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/modules/orders/hooks/use-cart";
import { formatTaka } from "@/utils/format-currency";
import type { Product } from "../types/product.types";

/** Client purchase controls for the (otherwise static) product detail page. */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const { lang, dict } = useLanguage();
  const { addToCart, removeFromCart, getQuantity, setOpen } = useCart();
  const quantity = getQuantity(product._id);

  const handleAdd = () => {
    if (!addToCart(product)) {
      toast.error(
        lang === "en" ? `Only ${product.stock} in stock` : `স্টকে মাত্র ${product.stock}টি আছে`
      );
    }
  };

  if (product.stock <= 0) {
    return <Badge variant="destructive">{dict.outOfStock}</Badge>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {quantity === 0 ? (
        <Button size="lg" onClick={handleAdd}>
          <Plus /> {dict.addToCart} — {formatTaka(product.discountPrice ?? product.price, lang)}
        </Button>
      ) : (
        <>
          <div className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground">
            <Button
              size="icon"
              variant="ghost"
              className="size-10 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
              onClick={() => removeFromCart(product._id)}
              aria-label="Decrease quantity"
            >
              <Minus />
            </Button>
            <span className="w-6 text-center font-black">{quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-10 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
              onClick={handleAdd}
              aria-label="Increase quantity"
            >
              <Plus />
            </Button>
          </div>
          <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
            {dict.cartHeader} →
          </Button>
        </>
      )}
    </div>
  );
}
