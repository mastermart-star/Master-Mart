/**
 * Database seeder — run with `npm run seed` (tsx).
 *
 * Standalone script: tsconfig excludes scripts/, so NO `@/*` alias here —
 * relative imports only (see BOOTSTRAP.md §3).
 *
 * What it does:
 *  1. Seeds products + reviews from scripts/seed-data.json
 *     (your live database.json ported first, gaps filled from data.ts).
 *  2. Creates the admin user via Better Auth using ADMIN_EMAIL/ADMIN_PASSWORD.
 */
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { ProductModel } from "../modules/products/models/product.model";
import { ReviewModel } from "../modules/reviews/models/review.model";

const MONGODB_URL = process.env.MONGODB_URL ?? "mongodb://127.0.0.1:27017/master-mart";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@master-mart.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type LegacyProduct = {
  id: string;
  nameEn: string;
  nameBn: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  unitEn: string;
  unitBn: string;
  rating?: number;
  image: string;
  stock: number;
  isVeg?: boolean;
  descriptionEn?: string;
  descriptionBn?: string;
};

type LegacyReview = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

// Same slug rules as utils/slug.ts (duplicated deliberately — no alias here).
function generateSlug(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .slice(0, 100)
    .replace(/^-+|-+$/g, "");
}

async function seedCatalog(): Promise<Map<string, string>> {
  const raw = fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8");
  const data = JSON.parse(raw) as { products: LegacyProduct[]; reviews: LegacyReview[] };

  const legacyToNewId = new Map<string, string>();
  const usedSlugs = new Set<string>(
    (await ProductModel.find({}).select("slug").lean()).map((d) => d.slug as string)
  );

  let created = 0;
  let skipped = 0;

  for (const p of data.products) {
    let slug = generateSlug(p.nameEn) || `product-${p.id}`;
    const existing = await ProductModel.findOne({ slug }).lean();
    if (existing) {
      legacyToNewId.set(p.id, String(existing._id));
      skipped++;
      continue;
    }
    let candidate = slug;
    let n = 2;
    while (usedSlugs.has(candidate)) candidate = `${slug}-${n++}`;
    slug = candidate;
    usedSlugs.add(slug);

    const doc = await ProductModel.create({
      slug,
      nameEn: p.nameEn,
      nameBn: p.nameBn,
      category: p.category,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      unitEn: p.unitEn,
      unitBn: p.unitBn,
      rating: p.rating ?? 4.5,
      image: p.image,
      stock: p.stock,
      isVeg: p.isVeg ?? false,
      descriptionEn: p.descriptionEn || undefined,
      descriptionBn: p.descriptionBn || undefined,
    });
    legacyToNewId.set(p.id, String(doc._id));
    created++;
  }
  console.log(`[seed] Products: ${created} created, ${skipped} already existed.`);

  let reviewsCreated = 0;
  for (const r of data.reviews) {
    const productId = legacyToNewId.get(r.productId);
    if (!productId) continue;
    const exists = await ReviewModel.findOne({
      productId,
      userName: r.userName,
      comment: r.comment,
    }).lean();
    if (exists) continue;
    await ReviewModel.create({
      productId,
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
    });
    reviewsCreated++;
  }
  console.log(`[seed] Reviews: ${reviewsCreated} created.`);

  return legacyToNewId;
}

async function seedAdmin(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    console.warn(
      "[seed] ADMIN_PASSWORD not set in .env — skipping admin user creation.\n" +
        "       Set ADMIN_EMAIL / ADMIN_PASSWORD and re-run `npm run seed`."
    );
    return;
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("[seed] ADMIN_PASSWORD must be at least 8 characters.");
  }

  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  const db = client.db();

  const existing = await db.collection("user").findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== "admin") {
      await db.collection("user").updateOne({ email: ADMIN_EMAIL }, { $set: { role: "admin" } });
      console.log(`[seed] Promoted existing user ${ADMIN_EMAIL} to admin.`);
    } else {
      console.log(`[seed] Admin user ${ADMIN_EMAIL} already exists.`);
    }
    await client.close();
    return;
  }

  // A minimal Better Auth instance so the password hash matches the app's.
  const auth = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: "string", required: true, defaultValue: "user", input: false },
      },
    },
  });

  await auth.api.signUpEmail({
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "Store Admin" },
  });
  // role has input:false (unsettable from any signup payload) — promote directly.
  await db.collection("user").updateOne({ email: ADMIN_EMAIL }, { $set: { role: "admin" } });
  console.log(`[seed] Admin user created: ${ADMIN_EMAIL}`);
  await client.close();
}

async function main() {
  console.log(`[seed] Connecting to ${MONGODB_URL} …`);
  await mongoose.connect(MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
  await seedCatalog();
  await mongoose.disconnect();
  await seedAdmin();
  console.log("[seed] Done ✔");
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exitCode = 1;
});
