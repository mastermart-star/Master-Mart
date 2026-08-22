# Master Mart — Next.js 16 App Router

The Master-Mart grocery storefront, rebuilt from the Vite + Express + Prisma/SQLite
monolith into the architecture defined by `nextjs-starter-guide/CLAUDE.md` and
`BOOTSTRAP.md`: **Next.js 16 (App Router) · MongoDB + Mongoose 9 · Better Auth ·
Tailwind v4 + shadcn/ui · TanStack Query · React Hook Form + Zod 4**.

## Quick start

```bash
# 1. Configure environment (defaults target local MongoDB)
cp .env.example .env        # then fill in BETTER_AUTH_SECRET, ADMIN_PASSWORD, …

# 2. Make sure MongoDB is running locally (mongodb://127.0.0.1:27017)
```

### With Yarn

```bash
yarn install

# Port your old data (database.json first, gaps filled from data.ts)
# and create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD:
yarn seed

# Develop
yarn dev

# Full gate before any commit (typecheck → lint → build):
yarn check
```

### With npm

```bash
npm install

# Port your old data (database.json first, gaps filled from data.ts)
# and create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD:
npm run seed

# Develop
npm run dev

# Full gate before any commit (typecheck → lint → build):
npm run check
```

### With Bun

```bash
bun install

# Port your old data (database.json first, gaps filled from data.ts)
# and create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD:
bun run seed

# Develop
bun run dev

# Full gate before any commit (typecheck → lint → build):
bun run check
```

Log into `/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

## Architecture map

| Where | What |
| --- | --- |
| `app/` | Route shells only. `(public)` is statically prerendered; `admin/` is dynamic (session); `api/` holds route handlers for client-driven reads, upload, invoice, health. |
| `modules/products,orders,reviews,settings,admin` | The actual application: Mongoose model, dual Zod schemas (DB vs form), `"use server"` actions, TanStack query-key factory + fetchers, domain components, public barrel `index.ts`. |
| `core/` | Infrastructure: `config/site.ts` (ALL branding — rebrand happens here), `config/env.ts` (the only `process.env` reader, server-only), `db/`, `errors/`, `types/`. |
| `components/ui` | shadcn-style primitives. `components/shared` — header, footer, hero, support bubble. |
| `lib/` | Better Auth server/client/guards, query client, mailer, cloudinary, EN/BN dictionary. |
| `proxy.ts` | Optimistic redirect for `/admin` — NOT a security boundary; every action re-checks `requireRole()`. |
| `scripts/seed.ts` | Standalone tsx seeder (no `@/*` alias by design). |

## Rendering contract (verify on every build)

```
○ /                    static — catalog fetched at build, revalidated by mutations
○ /login               static shell
● /products/[slug]     SSG via generateStaticParams
ƒ /admin/**, /api/**   dynamic — session/API (expected)
ƒ /track/[orderCode]   dynamic BY DESIGN — live data, client polls /api/orders/[code]
```

Every product/order/review/settings mutation calls `revalidatePath` for each
route that renders its data — edit a product in the admin and the public page
updates without a restart. Test that loop after `yarn build && yarn start`,
`npm run build && npm run start`, or `bun run build && bun run start`.

## Deliberate decisions (vs. the old app)

- **Cart & language are client-only** (localStorage + context, never cookies) so
  public routes stay static.
- **Order tracking is server-driven.** The old app auto-simulated delivery in the
  browser; now the admin pipeline (Placed → Preparing → On the way → Delivered)
  is the source of truth, and `on_the_way` triggers the simulated Steadfast
  dispatch. The tracker polls every 4 s.
- **Orders are placed by product reference.** Prices, totals, delivery fee and
  stock checks are computed server-side; the client can never set a price.
- **Settings are split** — chat support is public; bKash/courier credentials are
  admin-only and never reach the storefront (the old app sent them to every
  browser).
- **Payment gateways stay simulated** (sandbox dialog), same as before. The
  bKash/SSLCommerz init endpoints were placeholders and can be added as real
  integrations later inside `modules/orders`.
- **Emails**: order confirmation/status invoices via SMTP when `SMTP_*` is set,
  console log otherwise. Cloudinary uploads fall back to base64 data URLs when
  `CLOUDINARY_*` is unset.

## Deployment (Coolify + Nixpacks)

`nixpacks.toml` is in place. Follow CLAUDE.md §12 — in particular set stable
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
(= `siteConfig.siteUrl` exactly), mark build-time env vars, keep a single
replica, and make sure MongoDB is reachable **during** the build.
