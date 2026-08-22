"use client";

import { useState } from "react";
import { Info, Minus, Plus, ShieldCheck, ShoppingBag, Timer, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/shared/smart-image";
import { useLanguage } from "@/hooks/use-language";
import { formatTaka } from "@/utils/format-currency";
import type { PublicPaymentOptions } from "@/modules/settings/types/setting.types";
import { useCart } from "../hooks/use-cart";
import { CheckoutDialog } from "./checkout-dialog";

export function CartSheet({ paymentOptions }: { paymentOptions: PublicPaymentOptions }) {
  const { lang, dict } = useLanguage();
  const {
    items,
    isOpen,
    setOpen,
    addToCart,
    removeFromCart,
    totalQuantity,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryThreshold,
    baseDeliveryFee,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const freeProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="relative">
            <ShoppingBag />
            <span className="hidden sm:inline">
              {totalQuantity > 0
                ? `${totalQuantity} ${lang === "en" ? "Items" : "টি পণ্য"}`
                : lang === "en"
                  ? "Cart"
                  : "কার্ট"}
            </span>
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-black text-brand-foreground">
                {totalQuantity}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>{dict.cartHeader}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/40 p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-28 text-center">
                <ShoppingBag className="size-12 animate-pulse text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground italic">
                  {dict.emptyCart}
                </p>
              </div>
            ) : (
              <>
                {/* Free delivery progress */}
                <div className="rounded-xl border border-primary/20 bg-card p-3.5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Truck className="size-4 text-primary" />
                      {subtotal >= freeDeliveryThreshold
                        ? lang === "en"
                          ? "🎉 You unlocked FREE Delivery!"
                          : "🎉 আপনি ফ্রি ডেলিভারি আনলক করেছেন!"
                        : lang === "en"
                          ? `Add ${formatTaka(freeDeliveryThreshold - subtotal, lang)} more for FREE Delivery`
                          : `আর ${formatTaka(freeDeliveryThreshold - subtotal, lang)} যোগ করলেই ফ্রি ডেলিভারি`}
                    </span>
                    <span className="text-[11px] font-extrabold text-primary">
                      {subtotal >= freeDeliveryThreshold
                        ? lang === "en"
                          ? `${formatTaka(baseDeliveryFee, lang)} Saved`
                          : `${formatTaka(baseDeliveryFee, lang)} মওকুফ`
                        : `${freeProgress}%`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${freeProgress}%` }}
                    />
                  </div>
                </div>

                {/* ETA card */}
                <div className="flex items-center gap-3.5 rounded-xl border bg-card p-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Timer className="size-5 text-primary" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold">
                      {lang === "en"
                        ? "Delivery in 8–12 minutes"
                        : "৮-১২ মিনিটের মধ্যে ডেলিভারি"}
                    </h4>
                    <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                      {lang === "en"
                        ? `Shipment of ${totalQuantity} item${totalQuantity > 1 ? "s" : ""}`
                        : `${totalQuantity}টি পণ্যের শিপমেন্ট`}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4 rounded-xl border bg-card p-4">
                  {items.map((item, index) => {
                    const price = item.product.discountPrice ?? item.product.price;
                    return (
                      <div key={item.product._id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            <SmartImage
                              src={item.product.image}
                              alt={lang === "en" ? item.product.nameEn : item.product.nameBn}
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <h4 className="text-xs leading-snug font-extrabold">
                              {lang === "en" ? item.product.nameEn : item.product.nameBn}
                            </h4>
                            <span className="mt-0.5 block text-[10px] font-semibold text-muted-foreground">
                              {lang === "en" ? item.product.unitEn : item.product.unitBn}
                            </span>
                            <span className="mt-1 block text-xs font-black">
                              {formatTaka(price, lang)}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 rounded-md bg-primary text-primary-foreground">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                              onClick={() => removeFromCart(item.product._id)}
                              aria-label="Decrease quantity"
                            >
                              <Minus />
                            </Button>
                            <span className="w-4 text-center text-xs font-black">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                              onClick={() => addToCart(item.product)}
                              aria-label="Increase quantity"
                            >
                              <Plus />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill details */}
                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <h4 className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                    {lang === "en" ? "Bill details" : "বিল বিবরণী"}
                  </h4>
                  <div className="space-y-2.5 text-xs font-medium">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{dict.subtotal}</span>
                      <span className="font-black">{formatTaka(subtotal, lang)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        {dict.deliveryFee}
                        <Info className="size-3 text-muted-foreground" />
                      </span>
                      {deliveryFee === 0 && subtotal > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground line-through">
                            {formatTaka(baseDeliveryFee, lang)}
                          </span>
                          <Badge variant="success" className="text-[10px]">
                            {lang === "en" ? "FREE" : "ফ্রি"}
                          </Badge>
                        </span>
                      ) : (
                        <span className="font-black">{formatTaka(deliveryFee, lang)}</span>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm font-black">
                      <span>{dict.totalAmount}</span>
                      <span className="text-primary">{formatTaka(total, lang)}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation policy */}
                <div className="rounded-xl border bg-card p-4">
                  <Badge variant="secondary" className="mb-2 text-[10px] uppercase">
                    {lang === "en" ? "Cancellation Policy" : "অর্ডার বাতিলকরণ নীতিমালা"}
                  </Badge>
                  <p className="text-[11px] leading-relaxed font-semibold text-muted-foreground">
                    {lang === "en"
                      ? "Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable."
                      : "একবার প্যাকেজিং সম্পন্ন হলে অর্ডার বাতিল করা যাবে না। অনাকাঙ্ক্ষিত বিলম্বের ক্ষেত্রে, প্রযোজ্য হলে রিফান্ড প্রদান করা হবে।"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="border-t p-4">
            <Button
              className="w-full"
              size="lg"
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              <ShieldCheck />
              {dict.placeOrder}
              {items.length > 0 && (
                <span className="ml-1 border-l border-primary-foreground/40 pl-2 font-black">
                  {formatTaka(total, lang)}
                </span>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        paymentOptions={paymentOptions}
      />
    </>
  );
}
