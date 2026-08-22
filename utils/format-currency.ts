import { siteConfig } from "@/core/config";

const BN_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function toBengaliDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[d] ?? d);
}

export function formatTaka(amount: number, lang: "en" | "bn" = "en"): string {
  const rounded = Math.round(amount * 100) / 100;
  const digits = lang === "bn" ? toBengaliDigits(rounded) : String(rounded);
  return `${siteConfig.commerce.currencySymbol}${digits}`;
}
