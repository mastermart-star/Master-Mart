import type { Category } from "../types/product.types";

/**
 * Fixed storefront taxonomy — deliberately config, not database rows.
 * Icon names map to lucide icons in `components/category-icon.tsx`.
 */
export const CATEGORIES: Category[] = [
  { id: "all", nameEn: "All Items", nameBn: "সব পণ্য", icon: "Grid", color: "from-emerald-500 to-teal-600" },
  { id: "vegetables-fruits", nameEn: "Vegetables & Fruits", nameBn: "শাকসবজি ও ফলমূল", icon: "Apple", color: "from-green-500 to-emerald-600" },
  { id: "fish-meat", nameEn: "Chicken, Meat & Fish", nameBn: "মুরগি, মাংস ও মাছ", icon: "Fish", color: "from-rose-500 to-red-600" },
  { id: "dairy-bread-eggs", nameEn: "Dairy, Bread & Eggs", nameBn: "দুগ্ধজাত ও ডিম", icon: "Cookie", color: "from-amber-400 to-orange-500" },
  { id: "snacks-munchies", nameEn: "Snacks & Munchies", nameBn: "স্ন্যাক্স ও চিপস", icon: "Dessert", color: "from-red-400 to-pink-500" },
  { id: "cold-drinks", nameEn: "Drinks & Juices", nameBn: "ঠান্ডা পানীয় ও জুস", icon: "CupSoda", color: "from-cyan-400 to-blue-500" },
  { id: "staples", nameEn: "Atta, Rice & Dal", nameBn: "আটা, চাল ও ডাল", icon: "Wheat", color: "from-yellow-500 to-amber-600" },
  { id: "personal-care", nameEn: "Personal Care", nameBn: "ব্যক্তিগত যত্ন", icon: "Sparkles", color: "from-purple-400 to-indigo-500" },
  { id: "masala-oil-more", nameEn: "Masala, Oil & More", nameBn: "মসলা, তেল ও অনন্য", icon: "Flame", color: "from-orange-500 to-amber-600" },
  { id: "organic-health", nameEn: "Organic & Healthy Living", nameBn: "অর্গানিক ও স্বাস্থ্যকর খাদ্য", icon: "Leaf", color: "from-emerald-400 to-emerald-700" },
  { id: "pet-care", nameEn: "Pet Care", nameBn: "পোষা প্রাণীর যত্ন", icon: "PawPrint", color: "from-blue-400 to-indigo-600" },
  { id: "household", nameEn: "Household", nameBn: "গৃহস্থালী সামগ্রী", icon: "Home", color: "from-slate-400 to-slate-600" },
];

export const CATEGORY_IDS = CATEGORIES.filter((c) => c.id !== "all").map((c) => c.id);
