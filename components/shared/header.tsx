"use client";

import Link from "next/link";
import { Bike, Languages, Lock, MapPin, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { CartSheet } from "@/modules/orders";
import type { PublicPaymentOptions } from "@/modules/settings/types/setting.types";
import { BrandLogo } from "./brand-logo";

export function Header({ paymentOptions }: { paymentOptions: PublicPaymentOptions }) {
  const { lang, dict, toggleLang } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      {/* Promo strip */}
      <div className="bg-primary px-4 py-1.5 text-center text-[11px] font-semibold text-primary-foreground sm:text-xs">
        <span className="mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
          <span className="flex items-center gap-1.5">
            <Bike className="size-4 animate-bounce" />
            {dict.tagline}
          </span>
          <span className="hidden opacity-60 sm:inline">|</span>
          <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black tracking-wide text-brand-foreground uppercase">
            🎁{" "}
            {lang === "en"
              ? "FREE Delivery on ৳1000+"
              : "৳১০০০+ অর্ডারে ফ্রি ডেলিভারি (৳৮০ ছাড়)"}
          </span>
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b bg-background/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <div className="hidden max-w-xs items-center gap-1.5 border-l pl-4 lg:flex">
              <MapPin className="size-4 shrink-0 text-primary" />
              <div className="truncate text-left text-xs">
                <span className="block font-extrabold">
                  {lang === "en" ? "Home Delivery" : "হোম ডেলিভারি"}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {dict.deliveryAddress}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login" title={lang === "en" ? "Admin Portal" : "এডমিন প্যানেল"}>
                <Lock />
                <span className="hidden sm:inline">
                  {lang === "en" ? "Login" : "লগইন"}
                </span>
              </Link>
            </Button>

            <Button variant="outline" size="sm" onClick={toggleLang} title="Change language">
              <Languages />
              <span className="hidden sm:inline">{lang === "en" ? "বাংলা" : "English"}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              <Sun className="hidden dark:block" />
              <Moon className="dark:hidden" />
            </Button>

            <CartSheet paymentOptions={paymentOptions} />
          </div>
        </div>
      </header>
    </>
  );
}
