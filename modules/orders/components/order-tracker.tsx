"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Bike,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Navigation,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/shared/smart-image";
import { useLanguage } from "@/hooks/use-language";
import { formatTaka } from "@/utils/format-currency";
import { fetchOrderByCode } from "../api/order.api";
import { orderKeys } from "../api/order.keys";
import type { Order } from "../types/order.types";

/**
 * Live tracking — a client-driven poll against /api/orders/[orderCode].
 * The server is the single source of truth for order status; the admin
 * pipeline moves it forward and this widget reflects it within 4 seconds.
 */
export function OrderTracker({ orderCode }: { orderCode: string }) {
  const { lang, dict } = useLanguage();

  const { data: order, isPending, isError } = useQuery({
    queryKey: orderKeys.detail(orderCode),
    queryFn: () => fetchOrderByCode(orderCode),
    refetchInterval: (query) =>
      query.state.data?.status === "delivered" ? false : 4000,
  });

  if (isPending) {
    return (
      <Card className="gap-4 p-5">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  if (isError || !order) {
    return (
      <Card className="items-center p-10 text-center">
        <p className="text-sm font-bold">
          {lang === "en"
            ? `Order ${orderCode} was not found.`
            : `অর্ডার ${orderCode} খুঁজে পাওয়া যায়নি।`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {lang === "en"
            ? "Double-check the tracking link from your invoice."
            : "আপনার ইনভয়েসের ট্র্যাকিং লিংকটি আবার যাচাই করুন।"}
        </p>
      </Card>
    );
  }

  const steps = [
    { label: dict.orderPlaced, threshold: 10 },
    { label: dict.orderPrepared, threshold: 25 },
    { label: dict.onTheWay, threshold: 65 },
    { label: dict.delivered, threshold: 100 },
  ];

  return (
    <Card className="gap-0 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 animate-pulse items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bike className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-black">{dict.orderTracking}</h3>
            <p className="text-xs text-muted-foreground">Order ID: #{order.orderCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/api/invoice/${order.orderCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText />
              {lang === "en" ? "Invoice" : "ইনভয়েস"}
            </a>
          </Button>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2">
            <Clock className="size-4 text-primary" />
            <div>
              <span className="block text-[10px] tracking-widest text-muted-foreground uppercase">
                {dict.eta}
              </span>
              <span className="text-sm font-black">
                {order.status === "delivered"
                  ? lang === "en"
                    ? "Arrived!"
                    : "পৌঁছেছে!"
                  : `~${order.etaMinutes} ${lang === "en" ? "mins" : "মিনিট"}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mt-6 grid grid-cols-4 gap-2">
        <div className="absolute top-4 right-4 left-4 -z-0 h-1 rounded-full bg-muted" />
        <div
          className="absolute top-4 left-4 -z-0 h-1 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(96, order.stepProgress)}%` }}
        />
        {steps.map((step, i) => {
          const reached = order.stepProgress >= step.threshold;
          return (
            <div key={step.label} className="z-10 flex flex-col items-center text-center">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  reached
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {reached && step.threshold === 100 ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="mt-2 block text-xs font-bold">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Delivered banner / status message */}
      <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-center">
        {order.status === "delivered" ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="size-8 text-primary" />
            <span className="text-sm font-extrabold">
              {lang === "en" ? "Package Delivered!" : "পণ্য পৌঁছে গিয়েছে!"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {lang === "en"
                ? "Thanks for ordering with Master Mart"
                : "মাস্টার মার্টের সাথে থাকার জন্য ধন্যবাদ"}
            </span>
          </div>
        ) : (
          <p className="text-sm font-bold">
            {order.status === "preparing" ? dict.orderPreparation : dict.driverAssigned}
          </p>
        )}
      </div>

      {/* Courier dispatch banner */}
      {order.courierTrackingId && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-sky-900/40 dark:bg-sky-950/20">
          <div>
            <Badge className="bg-sky-600 text-white">Steadfast Courier</Badge>
            <h4 className="mt-1.5 text-xs font-black">
              {lang === "en"
                ? "Package Dispatched via Courier API"
                : "কুরিয়ার সিস্টেমে পার্সেল পাঠানো হয়েছে"}
            </h4>
            <span className="mt-0.5 block text-[11px] font-bold text-muted-foreground">
              Tracking ID:{" "}
              <strong className="font-mono text-foreground">{order.courierTrackingId}</strong>
            </span>
          </div>
          {order.courierTrackingUrl && (
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700" asChild>
              <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer">
                {lang === "en" ? "Track Live" : "লাইভ ট্র্যাক"}
                <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Rider card */}
      {order.driverName && order.status !== "delivered" && (
        <div className="mt-5 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {order.driverPhoto && (
                <div className="relative size-12 overflow-hidden rounded-full border">
                  <SmartImage
                    src={order.driverPhoto}
                    alt={order.driverName}
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div>
                <span className="block text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                  {lang === "en" ? "Your Delivery Hero" : "আপনার ডেলিভারি হিরো"}
                </span>
                <span className="text-sm font-extrabold">{order.driverName}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-600">
                  <Award className="size-3 fill-current" />
                  Rating: 4.9 (420 deliveries)
                </span>
              </div>
            </div>
            {order.driverPhone && (
              <Button size="icon" asChild>
                <a href={`tel:${order.driverPhone}`} aria-label="Call rider">
                  <Phone />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="mt-5 space-y-3 rounded-xl border p-4">
        <h4 className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
          {lang === "en" ? "Order summary" : "অর্ডার সারাংশ"}
        </h4>
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-xs">
            <span className="font-bold">
              {lang === "en" ? item.nameEn : item.nameBn}{" "}
              <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="font-black">{formatTaka(item.price * item.quantity, lang)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold">{dict.deliveryFee}</span>
          <span className="font-black">{formatTaka(order.deliveryFee, lang)}</span>
        </div>
        <div className="flex items-center justify-between text-sm font-black">
          <span>{dict.totalAmount}</span>
          <span className="text-primary">{formatTaka(order.total, lang)}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Navigation className="size-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-muted-foreground">
            {order.customerAddress}
          </span>
        </div>
      </div>
    </Card>
  );
}
