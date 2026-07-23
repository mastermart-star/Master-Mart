// Seeds the PostgreSQL database with the app's default catalog & reviews.
// Uses the `pg` driver directly (no Prisma engine binary required), so this
// works anywhere Node + Postgres connectivity works — including offline/CI
// sandboxes that can't reach Prisma's engine-binary CDN.
//
// Usage: npx tsx prisma/seed.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { PRODUCTS, INITIAL_REVIEWS } from '../src/data.ts';

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log(`[Seed] Connecting to ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count > 0) {
    console.log(`[Seed] products table already has ${rows[0].count} rows — skipping product seed.`);
  } else {
    console.log(`[Seed] Inserting ${PRODUCTS.length} products...`);
    for (const p of PRODUCTS) {
      await pool.query(
        `INSERT INTO products
          (id, name_en, name_bn, category, price, unit_en, unit_bn, rating, image,
           discount_price, stock, is_veg, description_en, description_bn)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id, p.nameEn, p.nameBn, p.category, p.price, p.unitEn, p.unitBn,
          p.rating ?? 4.5, p.image, p.discountPrice ?? null, p.stock, p.isVeg ?? false,
          p.descriptionEn ?? null, p.descriptionBn ?? null
        ]
      );
    }
    console.log('[Seed] Products inserted.');
  }

  const { rows: reviewRows } = await pool.query('SELECT COUNT(*)::int AS count FROM reviews');
  if (reviewRows[0].count > 0) {
    console.log(`[Seed] reviews table already has ${reviewRows[0].count} rows — skipping review seed.`);
  } else {
    console.log(`[Seed] Inserting ${INITIAL_REVIEWS.length} reviews...`);
    for (const r of INITIAL_REVIEWS) {
      await pool.query(
        `INSERT INTO reviews (id, product_id, user_name, rating, comment, date)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.productId, r.userName, r.rating, r.comment, r.date]
      );
    }
    console.log('[Seed] Reviews inserted.');
  }

  const productCount = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  const reviewCount = await pool.query('SELECT COUNT(*)::int AS count FROM reviews');
  console.log(`[Seed] Done. products=${productCount.rows[0].count} reviews=${reviewCount.rows[0].count}`);

  await pool.end();
}

main().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
