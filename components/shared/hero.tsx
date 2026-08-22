"use client";

import { useLanguage } from "@/hooks/use-language";

export function Hero() {
  const { lang } = useLanguage();

  return (
    <section className="border-b bg-linear-to-r from-yellow-100 to-amber-50 px-4 py-6 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8">
        <div className="max-w-xl text-left">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold tracking-wide text-primary uppercase">
            🚀 {lang === "en" ? "Instant Grocery Express" : "মিনিটে বাজার ডেলিভারি"}
          </span>
          <h2 className="mt-3 text-2xl leading-tight font-black md:text-3xl">
            {lang === "en" ? "Master Mart Delivery" : "মাস্টার মার্ট ইনস্ট্যান্ট ডেলিভারি"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "en"
              ? "Say goodbye to long superstore lines. Restock fresh potatoes, tomatoes, dairy butter, snacks & hot beverages in just 10 minutes!"
              : "আর নয় সুপারস্টোরে লম্বা লাইনে দাঁড়িয়ে অপেক্ষা করা। মাত্র ১০ মিনিটে আপনার বাসায় পৌঁছে যাবে তাজা শাকসবজি, দুগ্ধজাত খাবার ও দৈনন্দিন মুদি বাজার!"}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
            <span className="block text-xl font-black text-primary md:text-2xl">
              {lang === "en" ? "10 Min" : "১০ মি."}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              {lang === "en" ? "Super ETA" : "গড় সময়"}
            </span>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
            <span className="block text-xl font-black text-primary md:text-2xl">
              {lang === "en" ? "100%" : "১০০%"}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              {lang === "en" ? "Fresh Sourced" : "অর্গানিক তাজা"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
