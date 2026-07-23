-- Master Mart — PostgreSQL schema (mirrors prisma/schema.prisma exactly)
-- Use this if you ever need to create the tables without running
-- `npx prisma db push` (e.g. in an offline/CI environment that can't
-- reach Prisma's engine-binary CDN). Column names match the Prisma
-- @map()/@@map() directives 1:1, so `npx prisma db push` and this file
-- are interchangeable/idempotent against the same database.

CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,
    name_en         TEXT NOT NULL,
    name_bn         TEXT NOT NULL,
    category        TEXT NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    unit_en         TEXT NOT NULL,
    unit_bn         TEXT NOT NULL,
    rating          DECIMAL(3,2) NOT NULL DEFAULT 4.5,
    image           TEXT NOT NULL,
    discount_price  DECIMAL(10,2),
    stock           INTEGER NOT NULL,
    is_veg          BOOLEAN NOT NULL DEFAULT FALSE,
    description_en  TEXT,
    description_bn  TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id                    TEXT PRIMARY KEY,
    items                 TEXT NOT NULL,
    subtotal              DECIMAL(10,2) NOT NULL,
    delivery_fee          DECIMAL(10,2) NOT NULL,
    total                 DECIMAL(10,2) NOT NULL,
    status                TEXT NOT NULL,
    payment_method        TEXT NOT NULL,
    payment_status        TEXT NOT NULL,
    timestamp             TEXT NOT NULL,
    eta_minutes           INTEGER NOT NULL,
    driver_name           TEXT,
    driver_phone          TEXT,
    driver_photo          TEXT,
    step_progress         INTEGER NOT NULL DEFAULT 0,
    customer_name         TEXT,
    customer_phone        TEXT,
    customer_address      TEXT,
    customer_email        TEXT,
    courier_tracking_id   TEXT,
    courier_tracking_url  TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    product_id  TEXT NOT NULL,
    user_name   TEXT NOT NULL,
    rating      DECIMAL(3,2) NOT NULL,
    comment     TEXT NOT NULL,
    date        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
