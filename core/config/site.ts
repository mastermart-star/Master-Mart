const phone = "01613476659"; // local digits, stored exactly once
const hotline = "01911628059";
const countryCode = "+880";

export const siteConfig = {
  slug: "master-mart",
  name: "Master Mart",
  nameBn: "মাস্টার মার্ট",
  legalName: "Master Mart Ltd.",
  parentBrand: "Bismillah Traders",
  tagline: "10 Minute Superfast Delivery",
  taglineBn: "১০ মিনিটে সুপারফাস্ট ডেলিভারি",
  description:
    "Master Mart — instant 10-minute grocery delivery in Dhaka. Fresh vegetables, fish, meat, dairy, snacks and daily essentials at your door.",
  siteUrl: "https://master-mart.example.com",

  contact: {
    phone,
    hotline,
    countryCode,
    email: "support@master-mart.com",
    ordersEmail: "orders@master-mart.com",
    address: "House 196/4, West Dhanmondi, Dhaka",
    addressBn: "হাউজ ১৯৬/৪, পশ্চিম ধানমন্ডি, ঢাকা",
    hub: "Dhanmondi Hub",
    hubBn: "ধানমন্ডি হাব",
  },

  social: {
    facebook: "https://www.facebook.com/MasterMart007",
  },

  commerce: {
    currency: "BDT",
    currencySymbol: "৳",
    deliveryFee: 80,
    freeDeliveryThreshold: 1000,
    defaultEtaMinutes: 10,
  },

  htmlLang: "bn",
  ogLocale: "bn_BD",
  themeColor: "#059669",
} as const;

// Derive every format here. NEVER add format variants to the object above,
// and never format a phone number inline in a component.
export const phoneDisplay = `${phone.slice(0, 5)}-${phone.slice(5)}`;
export const phoneInternational = `${countryCode}${phone.replace(/^0/, "")}`;
export const hotlineDisplay = `${hotline.slice(0, 5)}-${hotline.slice(5)}`;
export const whatsappLink = `https://wa.me/${phoneInternational.replace("+", "")}`;
export const telLink = `tel:${phoneInternational}`;

export type SiteConfig = typeof siteConfig;
