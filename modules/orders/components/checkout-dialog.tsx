"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { formatTaka } from "@/utils/format-currency";
import type { PublicPaymentOptions } from "@/modules/settings/types/setting.types";
import { placeOrder } from "../actions/order.actions";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "../schemas/order-form.schema";
import type { Order, PaymentMethod } from "../types/order.types";
import { useCart } from "../hooks/use-cart";

type Step = "details" | "gateway" | "success";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentOptions: PublicPaymentOptions;
};

export function CheckoutDialog({ open, onOpenChange, paymentOptions }: CheckoutDialogProps) {
  const { lang, dict } = useLanguage();
  const { items, total, clearCart, setOpen: setCartOpen, rememberOrder } = useCart();

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<PaymentMethod>(
    paymentOptions.isCoDEnabled ? "cod" : "bkash"
  );
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [walletNumber, setWalletNumber] = useState("");
  const [walletPin, setWalletPin] = useState("");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerEmail: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CheckoutFormValues) =>
      placeOrder({
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        paymentMethod: method,
        ...values,
      }),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      setPlacedOrder(result.data);
      rememberOrder(result.data.orderCode);
      clearCart();
      setCartOpen(false);
      setStep("success");
      toast.success(dict.paymentSuccess);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleDetailsSubmit = form.handleSubmit((values) => {
    if (method === "cod") {
      mutate(values);
    } else {
      setStep("gateway"); // simulated wallet/card gateway, then place the order
    }
  });

  const handleGatewayConfirm = () => {
    void form.handleSubmit((values) => mutate(values))();
  };

  const resetAndClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep("details");
      setPlacedOrder(null);
      setWalletNumber("");
      setWalletPin("");
    }
  };

  const methods: Array<{
    id: PaymentMethod;
    label: string;
    icon: typeof Banknote;
    enabled: boolean;
  }> = [
    { id: "cod", label: dict.cashOnDelivery, icon: Banknote, enabled: paymentOptions.isCoDEnabled },
    { id: "bkash", label: dict.bKashWallet, icon: Wallet, enabled: paymentOptions.isBkashEnabled },
    { id: "nagad", label: dict.nagadWallet, icon: Smartphone, enabled: paymentOptions.isBkashEnabled },
    { id: "card", label: dict.creditCard, icon: CreditCard, enabled: true },
  ];

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>{dict.choosePayment}</DialogTitle>
              <DialogDescription>
                {lang === "en"
                  ? `Grand total ${formatTaka(total, lang)} — delivery in ~10 minutes.`
                  : `সর্বমোট ${formatTaka(total, lang)} — ডেলিভারি ~১০ মিনিটে।`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2">
              {methods
                .filter((m) => m.enabled)
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-left text-xs font-bold transition-all",
                      method === m.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                        : "hover:bg-accent"
                    )}
                  >
                    <m.icon className="size-4 text-primary" />
                    {m.label}
                  </button>
                ))}
            </div>

            <form id="checkout-form" onSubmit={handleDetailsSubmit}>
              <FieldGroup className="gap-4">
                <Controller
                  name="customerName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-name">{dict.yourName}</FieldLabel>
                      <Input {...field} id="checkout-name" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="customerPhone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="checkout-phone">
                          {lang === "en" ? "Mobile number" : "মোবাইল নম্বর"}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="checkout-phone"
                          inputMode="numeric"
                          placeholder="01XXXXXXXXX"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="customerEmail"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="checkout-email">
                          {lang === "en" ? "Email (invoice)" : "ইমেইল (ইনভয়েস)"}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="checkout-email"
                          type="email"
                          placeholder={lang === "en" ? "Optional" : "ঐচ্ছিক"}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="customerAddress"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-address">
                        {lang === "en" ? "Delivery address" : "ডেলিভারি ঠিকানা"}
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="checkout-address"
                        rows={2}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button type="submit" size="lg" disabled={isPending || items.length === 0}>
                  {isPending && <Loader2 className="animate-spin" />}
                  {method === "cod"
                    ? `${dict.placeOrder} — ${formatTaka(total, lang)}`
                    : lang === "en"
                      ? "Continue to payment"
                      : "পেমেন্টে এগিয়ে যান"}
                </Button>
              </FieldGroup>
            </form>
          </>
        )}

        {step === "gateway" && (
          <>
            <DialogHeader>
              <DialogTitle>{dict.paymentSimTitle}</DialogTitle>
              <DialogDescription>{dict.bKashPrompt}</DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="gateway-number">
                  {method === "card"
                    ? lang === "en"
                      ? "Card number"
                      : "কার্ড নম্বর"
                    : lang === "en"
                      ? "Wallet number"
                      : "ওয়ালেট নম্বর"}
                </FieldLabel>
                <Input
                  id="gateway-number"
                  inputMode="numeric"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  placeholder={method === "card" ? "4321 8876 5432 1098" : "01XXXXXXXXX"}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="gateway-pin">{dict.enterOTP}</FieldLabel>
                <Input
                  id="gateway-pin"
                  type="password"
                  inputMode="numeric"
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value)}
                  placeholder="••••••"
                />
              </Field>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                  {lang === "en" ? "Back" : "পেছনে"}
                </Button>
                <Button
                  className="flex-1"
                  disabled={isPending || walletNumber.length < 6 || walletPin.length < 4}
                  onClick={handleGatewayConfirm}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {dict.submitOTP}
                </Button>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                {lang === "en"
                  ? "Sandbox gateway — no real charge is made."
                  : "স্যান্ডবক্স গেটওয়ে — কোনো প্রকৃত লেনদেন হবে না।"}
              </p>
            </FieldGroup>
          </>
        )}

        {step === "success" && placedOrder && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-6 text-primary" />
                {dict.paymentSuccess}
              </DialogTitle>
              <DialogDescription>
                {lang === "en"
                  ? "Your order is confirmed and being packed right now."
                  : "আপনার অর্ডার নিশ্চিত হয়েছে এবং এখনই প্যাক করা হচ্ছে।"}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border bg-muted/40 p-4 text-center">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Order ID
              </span>
              <p className="mt-1 font-mono text-2xl font-black">{placedOrder.orderCode}</p>
              <p className="mt-2 text-sm font-bold text-primary">
                {formatTaka(placedOrder.total, lang)} · {placedOrder.paymentMethod.toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg">
                <Link
                  href={`/track/${placedOrder.orderCode}`}
                  onClick={() => resetAndClose(false)}
                >
                  {dict.orderTracking}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => resetAndClose(false)}>
                {dict.close}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
