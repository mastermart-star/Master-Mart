"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export function BrandLogo() {
  const { lang, dict } = useLanguage();

  return (
    <Link href="/" className="group flex items-center gap-2.5 select-none">
      <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-white shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="size-6 fill-none text-brand"
          stroke="currentColor"
          strokeWidth="9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M 20,25 L 50,52 L 80,25 L 80,56 A 14,14 0 0,1 66,70 L 34,70 A 14,14 0 0,1 20,56 Z" />
          <circle cx="34" cy="85" r="7.5" className="fill-brand stroke-none" />
          <circle cx="66" cy="85" r="7.5" className="fill-brand stroke-none" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="flex items-center text-lg font-black tracking-tight sm:text-xl">
          {lang === "en" ? (
            <>
              Master<span className="ml-1 text-brand">Mart</span>
            </>
          ) : (
            <>
              মাস্টার<span className="ml-1 text-brand">মার্ট</span>
            </>
          )}
          <span className="ml-2 hidden shrink-0 animate-pulse rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground sm:inline-block">
            {dict.deliveryTime}
          </span>
        </span>
        <span className="block text-[9px] font-bold tracking-widest text-muted-foreground sm:text-[10px]">
          {lang === "en" ? "FAST COMMERCE" : "দ্রুতগতির সুপারশপ"}
        </span>
      </span>
    </Link>
  );
}
