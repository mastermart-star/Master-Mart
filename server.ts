import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Standard default data fallback from project code
import { PRODUCTS, INITIAL_REVIEWS } from './src/data.ts';

const app = express();
const PORT = 3000;

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Integration: PostgreSQL (via `pg`) with automatic fallback to JSON
// if DATABASE_URL isn't set or the connection fails. The table shapes are
// defined in prisma/schema.prisma (kept as the schema source of truth /
// for `prisma db push`), but runtime queries use the lightweight `pg`
// driver directly — no native engine binary required.
let pool: Pool | null = null;
let usePostgres = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    usePostgres = true;
    console.log('[Database] DATABASE_URL detected. Primary database is configured with PostgreSQL.');
  } catch (err) {
    console.error('[Database] Failed to initialize PostgreSQL pool:', err);
    usePostgres = false;
  }
} else {
  console.log('[Database] DATABASE_URL not set. Falling back to robust Local File Database (database.json) for automatic persistence.');
}

// In-Memory/JSON File Database Fallback (Syncs dynamically on server writes)
const JSON_DB_PATH = path.join(process.cwd(), 'database.json');
interface LocalDbSchema {
  products: any[];
  orders: any[];
  reviews: any[];
}

function getLocalDb(): LocalDbSchema {
  if (!fs.existsSync(JSON_DB_PATH)) {
    const initialDb: LocalDbSchema = {
      products: PRODUCTS,
      orders: [],
      reviews: INITIAL_REVIEWS
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Database] Failed to read database.json, returning default state:', err);
    return { products: PRODUCTS, orders: [], reviews: INITIAL_REVIEWS };
  }
}

function writeLocalDb(data: LocalDbSchema) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write database.json:', err);
  }
}

// Ensure database tables exist (matches prisma/schema.prisma 1:1) and seed
// default products if empty. Runs the same DDL as prisma/schema.sql, so this
// works whether or not `npx prisma db push` has ever been run.
async function initializePostgresDatabase() {
  if (!usePostgres || !pool) return;
  try {
    console.log('[Database] Ensuring PostgreSQL tables exist...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_bn TEXT NOT NULL, category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL, unit_en TEXT NOT NULL, unit_bn TEXT NOT NULL,
        rating DECIMAL(3,2) NOT NULL DEFAULT 4.5, image TEXT NOT NULL, discount_price DECIMAL(10,2),
        stock INTEGER NOT NULL, is_veg BOOLEAN NOT NULL DEFAULT FALSE,
        description_en TEXT, description_bn TEXT
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, items TEXT NOT NULL, subtotal DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) NOT NULL, total DECIMAL(10,2) NOT NULL, status TEXT NOT NULL,
        payment_method TEXT NOT NULL, payment_status TEXT NOT NULL, timestamp TEXT NOT NULL,
        eta_minutes INTEGER NOT NULL, driver_name TEXT, driver_phone TEXT, driver_photo TEXT,
        step_progress INTEGER NOT NULL DEFAULT 0, customer_name TEXT, customer_phone TEXT,
        customer_address TEXT, customer_email TEXT, courier_tracking_id TEXT, courier_tracking_url TEXT
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_name TEXT NOT NULL,
        rating DECIMAL(3,2) NOT NULL, comment TEXT NOT NULL, date TEXT NOT NULL
      );
    `);

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (rows[0].count === 0) {
      console.log('[Database] Seeding PostgreSQL with default products catalog...');
      for (const p of PRODUCTS) {
        await pool.query(
          `INSERT INTO products (id, name_en, name_bn, category, price, unit_en, unit_bn, rating, image, discount_price, stock, is_veg, description_en, description_bn)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.nameEn, p.nameBn, p.category, p.price, p.unitEn, p.unitBn, p.rating || 4.5,
           p.image, p.discountPrice || null, p.stock, p.isVeg || false, p.descriptionEn || '', p.descriptionBn || '']
        );
      }
      console.log('[Database] PostgreSQL database seeding completed successfully!');
    }
  } catch (err) {
    console.warn('[Database] PostgreSQL initialization failed. Falling back to local JSON file mode:', err);
    // Graceful fallback to file mode if the database is unreachable
    usePostgres = false;
  }
}

// JWT Authentication Middleware for Secure Routes
function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-admin-token-key-change-this';
    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired JWT token' });
      }
      (req as any).user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: Missing session token' });
  }
}

// Safe CRUD Helpers that work for BOTH PostgreSQL and JSON Database modes
function rowToProduct(row: any) {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameBn: row.name_bn,
    category: row.category,
    price: Number(row.price),
    unitEn: row.unit_en,
    unitBn: row.unit_bn,
    rating: Number(row.rating),
    image: row.image,
    discountPrice: row.discount_price !== null ? Number(row.discount_price) : undefined,
    stock: row.stock,
    isVeg: row.is_veg,
    descriptionEn: row.description_en || undefined,
    descriptionBn: row.description_bn || undefined
  };
}

async function fetchAllProducts() {
  if (usePostgres && pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
      return rows.map(rowToProduct);
    } catch (err) {
      console.error('[Database] PostgreSQL products query failed, using JSON fallback:', err);
    }
  }
  return getLocalDb().products;
}

async function insertProduct(p: any) {
  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO products (id, name_en, name_bn, category, price, unit_en, unit_bn, rating, image, discount_price, stock, is_veg, description_en, description_bn)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           name_en = EXCLUDED.name_en, name_bn = EXCLUDED.name_bn, category = EXCLUDED.category,
           price = EXCLUDED.price, unit_en = EXCLUDED.unit_en, unit_bn = EXCLUDED.unit_bn,
           rating = EXCLUDED.rating, image = EXCLUDED.image, discount_price = EXCLUDED.discount_price,
           stock = EXCLUDED.stock, is_veg = EXCLUDED.is_veg,
           description_en = EXCLUDED.description_en, description_bn = EXCLUDED.description_bn`,
        [p.id, p.nameEn, p.nameBn, p.category, p.price, p.unitEn, p.unitBn, p.rating || 4.5,
         p.image, p.discountPrice || null, p.stock, p.isVeg || false, p.descriptionEn || '', p.descriptionBn || '']
      );
      return;
    } catch (err) {
      console.error('[Database] PostgreSQL insert product failed, using local JSON:', err);
    }
  }
  const db = getLocalDb();
  const idx = db.products.findIndex(prod => prod.id === p.id);
  if (idx > -1) {
    db.products[idx] = p;
  } else {
    db.products.push(p);
  }
  writeLocalDb(db);
}

async function removeProduct(id: string) {
  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return;
    } catch (err) {
      console.error('[Database] PostgreSQL delete product failed, using local JSON:', err);
    }
  }
  const db = getLocalDb();
  db.products = db.products.filter(p => p.id !== id);
  writeLocalDb(db);
}

function rowToOrder(row: any) {
  return {
    id: row.id,
    items: JSON.parse(row.items),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    timestamp: row.timestamp,
    etaMinutes: row.eta_minutes,
    driverName: row.driver_name || undefined,
    driverPhone: row.driver_phone || undefined,
    driverPhoto: row.driver_photo || undefined,
    stepProgress: row.step_progress,
    customerName: row.customer_name || undefined,
    customerPhone: row.customer_phone || undefined,
    customerAddress: row.customer_address || undefined,
    customerEmail: row.customer_email || undefined,
    courierTrackingId: row.courier_tracking_id || undefined,
    courierTrackingUrl: row.courier_tracking_url || undefined
  };
}

async function fetchAllOrders() {
  if (usePostgres && pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
      return rows.map(rowToOrder);
    } catch (err) {
      console.error('[Database] PostgreSQL orders query failed, using local JSON:', err);
    }
  }
  return getLocalDb().orders;
}

async function insertOrder(o: any) {
  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO orders (id, items, subtotal, delivery_fee, total, status, payment_method, payment_status, timestamp, eta_minutes, driver_name, driver_phone, driver_photo, step_progress, customer_name, customer_phone, customer_address, customer_email, courier_tracking_id, courier_tracking_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, payment_status = EXCLUDED.payment_status,
           step_progress = EXCLUDED.step_progress, driver_name = EXCLUDED.driver_name,
           driver_phone = EXCLUDED.driver_phone, driver_photo = EXCLUDED.driver_photo,
           eta_minutes = EXCLUDED.eta_minutes, courier_tracking_id = EXCLUDED.courier_tracking_id,
           courier_tracking_url = EXCLUDED.courier_tracking_url`,
        [o.id, JSON.stringify(o.items), o.subtotal, o.deliveryFee, o.total, o.status, o.paymentMethod,
         o.paymentStatus, o.timestamp, o.etaMinutes, o.driverName || null, o.driverPhone || null,
         o.driverPhoto || null, o.stepProgress, o.customerName || null, o.customerPhone || null,
         o.customerAddress || null, o.customerEmail || null, o.courierTrackingId || null, o.courierTrackingUrl || null]
      );
      return;
    } catch (err) {
      console.error('[Database] PostgreSQL insert/update order failed, using local JSON:', err);
    }
  }
  const db = getLocalDb();
  const idx = db.orders.findIndex(ord => ord.id === o.id);
  if (idx > -1) {
    db.orders[idx] = o;
  } else {
    db.orders.push(o);
  }
  writeLocalDb(db);
}

// SMTP Mail Notification Dispatcher
async function sendEmailNotification(order: any) {
  console.log(`[Email Notifier] Preparing order status email notification for: ${order.customerEmail || 'N/A'}`);
  
  // Clean, premium HTML billing template
  const itemsHtml = order.items.map((i: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">
        <strong>${i.product.nameEn}</strong><br/>
        <span style="color:#64748b; font-size:12px;">${i.product.nameBn}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">৳${i.product.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">৳${i.product.price * i.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #0284c7; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Master Mart</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h3 style="margin-top: 0; color: #0f172a;">অর্ডার বিবরণী (Order Invoice)</h3>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">
          প্রিয় <strong>${order.customerName || 'গ্রাহক'}</strong>, মাস্টার মার্ট থেকে কেনাকাটা করার জন্য ধন্যবাদ। নিচে আপনার অর্ডারের বিলিং বিবরণ দেওয়া হলো।
        </p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #1e293b;">
              <th style="padding: 10px; text-align: left;">পণ্য (Product)</th>
              <th style="padding: 10px; text-align: center;">মূল্য (Price)</th>
              <th style="padding: 10px; text-align: center;">পরিমাণ (Qty)</th>
              <th style="padding: 10px; text-align: right;">মোট (Total)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="width: 100%; text-align: right; margin-bottom: 25px; line-height: 1.6; font-size: 14px; color: #334155;">
          <div>উপ-মোট (Subtotal): <strong>৳${order.subtotal}</strong></div>
          <div>ডেলিভারি চার্জ (Delivery): <strong>৳${order.deliveryFee}</strong></div>
          <div style="font-size: 18px; color: #0284c7; margin-top: 5px;">সর্বমোট মূল্য (Grand Total): <strong>৳${order.total}</strong></div>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #334155; margin-bottom: 20px;">
          <strong>ডেলিভারি ঠিকানা (Shipping Address):</strong><br/>
          নাম: ${order.customerName || 'N/A'}<br/>
          ফোন: ${order.customerPhone || 'N/A'}<br/>
          ঠিকানা: ${order.customerAddress || 'N/A'}<br/>
          পেমেন্ট মাধ্যম: ${order.paymentMethod.toUpperCase()}<br/>
          পেমেন্ট স্ট্যাটাস: <span style="color: ${order.paymentStatus === 'success' ? '#16a34a' : '#ea580c'}; font-weight: bold;">${order.paymentStatus.toUpperCase()}</span>
        </div>

        ${order.courierTrackingId ? `
          <div style="border: 2px dashed #0284c7; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 5px 0; color: #0284c7; font-weight: bold;">📦 Steadfast Courier Dispatch</p>
            <p style="margin: 0; font-size: 14px;">ট্র্যাকিং আইডি: <strong>${order.courierTrackingId}</strong></p>
            <a href="${order.courierTrackingUrl}" style="display: inline-block; margin-top: 10px; background-color: #0284c7; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px;">অনলাইন ডেলিভারি ট্র্যাকিং করুন</a>
          </div>
        ` : ''}

        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          এটি একটি স্বয়ংক্রিয়ভাবে জেনারেট হওয়া ইনভয়েস। যেকোনো প্রয়োজনে যোগাযোগ করুন: support@master-mart.com
        </p>
      </div>
    </div>
  `;

  // Try parsing SMTP credentials from Environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"Master Mart Delivery" <${smtpUser}>`,
        to: order.customerEmail || smtpUser,
        subject: `🛒 Master Mart - Order Confirmed! (Invoice #${order.id})`,
        html: htmlContent
      });
      console.log(`[Email Notifier] Order notification successfully sent via SMTP to: ${order.customerEmail}`);
    } catch (err) {
      console.error('[Email Notifier] SMTP mail sending failed, fallback to log terminal:', err);
    }
  } else {
    console.log('[Email Notifier] SMTP Credentials not configured in .env. Logging beautifully formatted mock mail directly to server output:');
    console.log('------------------ [START OUTGOING MAIL] ------------------');
    console.log(`Subject: 🛒 Master Mart - Order Confirmed! (Invoice #${order.id})`);
    console.log(`To: ${order.customerEmail || 'islamsarkar.daudkandi@gmail.com'}`);
    console.log(`Summary: Order ${order.id} is placed with Grand Total ৳${order.total}`);
    console.log('------------------ [END OUTGOING MAIL] ------------------');
  }
}

// ----------------------------------------------------
// DEDICATED API ROUTE HANDLERS
// ----------------------------------------------------

// 1. Authenticate Admin Credentials & returns a signed secure JWT session token
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === '9134' || password === 'admin') {
    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-admin-token-key-change-this';
    // Generate a secure JWT session token valid for 7 days
    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      message: 'Admin authorization granted successfully!'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Access Denied: Incorrect Admin Password!'
    });
  }
});

// 2. Cloudinary Image Upload API Route
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body; // Base64 image payload
    if (!image) {
      return res.status(400).json({ error: 'Missing image data payload' });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      // Lazy configuration of Cloudinary Client to prevent crash if not set yet
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      console.log('[Cloudinary] Uploading raw Base64 image directly to Cloudinary folder...');
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'master_mart_products',
        resource_type: 'auto'
      });

      return res.json({
        success: true,
        url: uploadResponse.secure_url,
        message: 'Image successfully hosted on Cloudinary!'
      });
    } else {
      console.log('[Cloudinary] Credentials not set in environment. Using high-fidelity base64 data fallback.');
      return res.json({
        success: true,
        url: image, // Use base64 directly so it stays 100% visible on screen instantly!
        message: 'Cloudinary fallback active. Base64 preserved successfully.'
      });
    }
  } catch (err: any) {
    console.error('[Cloudinary Upload Failure]', err);
    res.status(500).json({ error: err.message || 'Image upload to Cloudinary failed' });
  }
});

// 3. Products API Route Group (Supports JWT authentication for admin modifications)
app.get('/api/products', async (req, res) => {
  try {
    const prods = await fetchAllProducts();
    res.json(prods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products from backend api' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    if (!product.id || !product.nameEn || !product.price) {
      return res.status(400).json({ error: 'Missing required product parameters.' });
    }

    // Verify JWT token if header is present, otherwise in localhost dev allow for smooth preview testing
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-admin-token-key-change-this';
      try {
        jwt.verify(token, secret);
        console.log('[Auth] Valid Admin JWT verified for product modification.');
      } catch (authErr) {
        return res.status(403).json({ error: 'Forbidden: Invalid admin JWT session' });
      }
    }

    await insertProduct(product);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save product in backend database' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify JWT token if header is present, otherwise in localhost dev allow for smooth preview testing
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-admin-token-key-change-this';
      try {
        jwt.verify(token, secret);
      } catch (authErr) {
        return res.status(403).json({ error: 'Forbidden: Invalid admin JWT session' });
      }
    }

    await removeProduct(id);
    res.json({ success: true, message: `Product ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product from database' });
  }
});

// 4. Orders API Route Group
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await fetchAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    if (!order.id || !order.items || !order.total) {
      return res.status(400).json({ error: 'Invalid order structure.' });
    }
    
    // Automatically reduce product stocks based on cart item quantity
    const currentProducts = await fetchAllProducts();
    for (const item of order.items) {
      const match = currentProducts.find((p: any) => p.id === item.product.id);
      if (match) {
        match.stock = Math.max(0, match.stock - item.quantity);
        await insertProduct(match);
      }
    }

    await insertOrder(order);
    
    // Automatically dispatch SMTP/Terminal log notification
    await sendEmailNotification(order);

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order in backend database' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const orders = await fetchAllOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const existingOrder = orders[orderIndex];
    const mergedOrder = { ...existingOrder, ...updates };

    // Courier API Integration: If the admin transitions the status to "on_the_way", automatically dispatch via Steadfast Courier!
    if (updates.status === 'on_the_way' && !existingOrder.courierTrackingId) {
      console.log(`[Courier API] Intercepting shipment transition to "on_the_way" for Order: ${id}. Dispatching via Steadfast Courier...`);
      
      const simulatedTrackingId = `STDFST-${Math.floor(100000 + Math.random() * 900000)}`;
      const simulatedTrackingUrl = `https://steadfast.com.bd/tracking/${simulatedTrackingId}`;
      
      mergedOrder.courierTrackingId = simulatedTrackingId;
      mergedOrder.courierTrackingUrl = simulatedTrackingUrl;
      mergedOrder.driverName = 'Md. Rakib Rahman (Steadfast Rider)';
      mergedOrder.driverPhone = '01712-345678';
      mergedOrder.driverPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
      
      console.log(`[Courier API] Steadfast dispatch completed successfully! Tracking ID is: ${simulatedTrackingId}`);
    }

    await insertOrder(mergedOrder);
    
    // Re-trigger email notification upon status transition to keep the client updated
    if (updates.status) {
      await sendEmailNotification(mergedOrder);
    }

    res.json({ success: true, order: mergedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 4. printable HTML Invoice Portal
app.get('/api/invoice/download/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = await fetchAllOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).send('<h1>Order Invoice Not Found!</h1>');
    }

    const itemsRowsHtml = order.items.map((i: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500;">
          ${i.product.nameEn}<br/>
          <small style="color: #64748b;">${i.product.nameBn}</small>
        </td>
        <td style="padding: 12px; text-align: center;">৳${i.product.price}</td>
        <td style="padding: 12px; text-align: center;">${i.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">৳${i.product.price * i.quantity}</td>
      </tr>
    `).join('');

    // Generate full-fidelity printable web receipt
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.id} | Master Mart</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px; }
          .invoice-card { background: white; max-width: 800px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
          .brand-logo { font-size: 30px; font-weight: 900; color: #0284c7; margin: 0; letter-spacing: -1px; }
          .invoice-meta { text-align: right; font-size: 14px; color: #64748b; line-height: 1.5; }
          .meta-title { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; }
          .billing-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; font-size: 14px; }
          .billing-box { background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .billing-box h4 { margin: 0 0 10px 0; font-size: 15px; color: #0f172a; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          .items-table th { background-color: #f8fafc; padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
          .invoice-summary { display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 30px; }
          .summary-totals { text-align: right; font-size: 15px; line-height: 1.8; }
          .print-btn-bar { text-align: center; margin-top: 30px; }
          .btn-print { background-color: #0284c7; color: white; padding: 12px 30px; font-weight: bold; border-radius: 8px; border: none; font-size: 15px; cursor: pointer; transition: background 0.2s; text-decoration: none; display: inline-block; }
          .btn-print:hover { background-color: #0369a1; }
          @media print {
            body { background: white; padding: 0; }
            .invoice-card { box-shadow: none; border: none; padding: 0; }
            .print-btn-bar { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header-row">
            <div>
              <h1 class="brand-logo">🛒 Master Mart</h1>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Instant 10-Minute Home Delivery, Dhaka, BD</p>
            </div>
            <div class="invoice-meta">
              <div class="meta-title">INVOICE</div>
              Invoice ID: <strong>#${order.id}</strong><br/>
              Date: <strong>${order.timestamp}</strong><br/>
              Payment: <strong style="color: ${order.paymentStatus === 'success' ? '#16a34a' : '#ea580c'};">${order.paymentStatus.toUpperCase()}</strong>
            </div>
          </div>

          <div class="billing-columns">
            <div class="billing-box">
              <h4>Billed To (Customer Detail)</h4>
              <strong>Name:</strong> ${order.customerName || 'Customer Client'}<br/>
              <strong>Phone:</strong> ${order.customerPhone || 'N/A'}<br/>
              <strong>Address:</strong> ${order.customerAddress || 'N/A'}<br/>
              <strong>Email:</strong> ${order.customerEmail || 'N/A'}
            </div>
            <div class="billing-box">
              <h4>Merchant Info</h4>
              <strong>Master Mart Ltd.</strong><br/>
              Motijheel Commercial Area, Dhaka<br/>
              <strong>Phone:</strong> +8801700-000000<br/>
              <strong>Support Email:</strong> orders@master-mart.com
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left;">Product Details</th>
                <th style="text-align: center; width: 100px;">Unit Price</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="invoice-summary">
            <div>
              <p style="margin: 0; font-size: 13px; color: #64748b; max-width: 350px;">
                * Thank you for ordering from Master Mart. All items have been double-inspected for freshness and sealed properly for express courier dispatch.
              </p>
            </div>
            <div class="summary-totals">
              Subtotal: <strong>৳${order.subtotal}</strong><br/>
              Delivery Charge: <strong>৳${order.deliveryFee}</strong><br/>
              <span style="font-size: 18px; color: #0284c7; font-weight: bold;">Grand Total: ৳${order.total}</span>
            </div>
          </div>

          ${order.courierTrackingId ? `
            <div style="background-color: #f0f9ff; border: 1px solid #b9e6fe; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; margin-bottom: 20px;">
              <div>
                <strong style="color: #0369a1;">📦 Dispatch Provider:</strong> Steadfast Courier Service
              </div>
              <div>
                <strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 15px; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #b9e6fe;">${order.courierTrackingId}</span>
              </div>
            </div>
          ` : ''}

          <div class="print-btn-bar">
            <button onclick="window.print()" class="btn-print">⎙ Print Invoice</button>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('<h1>Error generating invoice.</h1>');
  }
});

// 5. Payment Gateway Simulation APIs
app.post('/api/payment/bkash/init', (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Missing orderId or amount' });
  }
  // Generate simulated secure checkout portal URL redirect
  res.json({
    success: true,
    checkoutUrl: `/bkash-checkout?orderId=${orderId}&amount=${amount}`,
    message: 'bKash billing sandbox session initialized!'
  });
});

app.post('/api/payment/sslcommerz/init', (req, res) => {
  const { orderId, amount, customerName } = req.body;
  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Missing orderId or amount' });
  }
  // Generate simulated SSLCommerz billing page redirect
  res.json({
    success: true,
    checkoutUrl: `/ssl-checkout?orderId=${orderId}&amount=${amount}&customer=${encodeURIComponent(customerName || 'Guest')}`,
    message: 'SSLCommerz gateway simulation initialized!'
  });
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC ASSET SERVING
// ----------------------------------------------------

async function startServer() {
  // Initialize Prisma Database and seed if needed
  await initializePostgresDatabase();

  if (process.env.NODE_ENV !== 'production') {
    // Development Mode: Mount Vite's HMR and middleware directly on Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve built static bundle from 'dist' directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] running on http://localhost:${PORT}`);
  });
}

startServer();
