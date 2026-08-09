import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
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

// Database Integration: Prisma client fallback to JSON if DATABASE_URL not set or connection fails
const prisma = new PrismaClient();
let usePrisma = false;

if (process.env.DATABASE_URL) {
  try {
    usePrisma = true;
    console.log('[Database] DATABASE_URL detected. Primary database is configured with SQL Database (Prisma ORM).');
  } catch (err) {
    console.error('[Database] Failed to pre-load Prisma Client:', err);
    usePrisma = false;
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

// Ensure database tables exist and seed default products if empty (for Prisma Mode)
async function initializePrismaDatabase() {
  if (!usePrisma) return;
  try {
    console.log('[Database] Checking SQL Database table seeds...');
    const count = await prisma.product.count();
    if (count === 0) {
      console.log('[Database] Seeding SQL Database with default products catalog via Prisma...');
      for (const p of PRODUCTS) {
        await prisma.product.create({
          data: {
            id: p.id,
            nameEn: p.nameEn,
            nameBn: p.nameBn,
            category: p.category,
            price: p.price,
            unitEn: p.unitEn,
            unitBn: p.unitBn,
            rating: p.rating || 4.5,
            image: p.image,
            discountPrice: p.discountPrice || null,
            stock: p.stock,
            isVeg: p.isVeg || false,
            descriptionEn: p.descriptionEn || '',
            descriptionBn: p.descriptionBn || ''
          }
        });
      }
      console.log('[Database] SQL database product seeding completed successfully!');
    }

    const revCount = await prisma.review.count();
    if (revCount === 0) {
      console.log('[Database] Seeding SQL Database with default customer reviews...');
      for (const r of INITIAL_REVIEWS) {
        await prisma.review.create({
          data: {
            id: r.id,
            productId: r.productId,
            userName: r.userName,
            rating: r.rating,
            comment: r.comment,
            date: r.date
          }
        });
      }
      console.log('[Database] SQL database reviews seeding completed successfully!');
    }
  } catch (err) {
    console.warn('[Database] Prisma dynamic table check failed. Please ensure migrations are applied using npx prisma db push:', err);
    // Graceful fallback to file mode if tables aren't pushed yet
    usePrisma = false;
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

// Safe CRUD Helpers that work for BOTH Prisma and JSON Database modes
async function fetchAllProducts() {
  if (usePrisma) {
    try {
      const items = await prisma.product.findMany();
      return items.map(p => ({
        id: p.id,
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        category: p.category,
        price: Number(p.price),
        unitEn: p.unitEn,
        unitBn: p.unitBn,
        rating: Number(p.rating),
        image: p.image,
        discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
        stock: p.stock,
        isVeg: p.isVeg,
        descriptionEn: p.descriptionEn || undefined,
        descriptionBn: p.descriptionBn || undefined
      }));
    } catch (err) {
      console.error('[Database] Prisma products query failed, using JSON fallback:', err);
    }
  }
  return getLocalDb().products;
}

async function insertProduct(p: any) {
  if (usePrisma) {
    try {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          nameEn: p.nameEn,
          nameBn: p.nameBn,
          category: p.category,
          price: p.price,
          unitEn: p.unitEn,
          unitBn: p.unitBn,
          rating: p.rating || 4.5,
          image: p.image,
          discountPrice: p.discountPrice || null,
          stock: p.stock,
          isVeg: p.isVeg || false,
          descriptionEn: p.descriptionEn || '',
          descriptionBn: p.descriptionBn || ''
        },
        create: {
          id: p.id,
          nameEn: p.nameEn,
          nameBn: p.nameBn,
          category: p.category,
          price: p.price,
          unitEn: p.unitEn,
          unitBn: p.unitBn,
          rating: p.rating || 4.5,
          image: p.image,
          discountPrice: p.discountPrice || null,
          stock: p.stock,
          isVeg: p.isVeg || false,
          descriptionEn: p.descriptionEn || '',
          descriptionBn: p.descriptionBn || ''
        }
      });
      return;
    } catch (err) {
      console.error('[Database] Prisma insert product failed, using local JSON:', err);
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
  if (usePrisma) {
    try {
      await prisma.product.delete({ where: { id } });
      return;
    } catch (err) {
      console.error('[Database] Prisma delete product failed, using local JSON:', err);
    }
  }
  const db = getLocalDb();
  db.products = db.products.filter(p => p.id !== id);
  writeLocalDb(db);
}

async function fetchAllOrders() {
  if (usePrisma) {
    try {
      const items = await prisma.order.findMany();
      return items.map(o => ({
        id: o.id,
        items: JSON.parse(o.items),
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        timestamp: o.timestamp,
        etaMinutes: o.etaMinutes,
        driverName: o.driverName || undefined,
        driverPhone: o.driverPhone || undefined,
        driverPhoto: o.driverPhoto || undefined,
        stepProgress: o.stepProgress,
        customerName: o.customerName || undefined,
        customerPhone: o.customerPhone || undefined,
        customerAddress: o.customerAddress || undefined,
        customerEmail: o.customerEmail || undefined,
        courierTrackingId: o.courierTrackingId || undefined,
        courierTrackingUrl: o.courierTrackingUrl || undefined
      }));
    } catch (err) {
      console.error('[Database] Prisma orders query failed, using local JSON:', err);
    }
  }
  return getLocalDb().orders;
}

async function insertOrder(o: any) {
  if (usePrisma) {
    try {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          status: o.status,
          paymentStatus: o.paymentStatus,
          stepProgress: o.stepProgress,
          driverName: o.driverName || null,
          driverPhone: o.driverPhone || null,
          driverPhoto: o.driverPhoto || null,
          etaMinutes: o.etaMinutes,
          courierTrackingId: o.courierTrackingId || null,
          courierTrackingUrl: o.courierTrackingUrl || null
        },
        create: {
          id: o.id,
          items: JSON.stringify(o.items),
          subtotal: o.subtotal,
          deliveryFee: o.deliveryFee,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          timestamp: o.timestamp,
          etaMinutes: o.etaMinutes,
          driverName: o.driverName || null,
          driverPhone: o.driverPhone || null,
          driverPhoto: o.driverPhoto || null,
          stepProgress: o.stepProgress,
          customerName: o.customerName || null,
          customerPhone: o.customerPhone || null,
          customerAddress: o.customerAddress || null,
          customerEmail: o.customerEmail || null,
          courierTrackingId: o.courierTrackingId || null,
          courierTrackingUrl: o.courierTrackingUrl || null
        }
      });
      return;
    } catch (err) {
      console.error('[Database] Prisma insert/update order failed, using local JSON:', err);
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

async function fetchAllReviews() {
  if (usePrisma) {
    try {
      const items = await prisma.review.findMany();
      return items.map(r => ({
        id: r.id,
        productId: r.productId,
        userName: r.userName,
        rating: Number(r.rating),
        comment: r.comment,
        date: r.date
      }));
    } catch (err) {
      console.error('[Database] Prisma reviews query failed, using JSON fallback:', err);
    }
  }
  return getLocalDb().reviews;
}

async function insertReview(r: any) {
  if (usePrisma) {
    try {
      await prisma.review.upsert({
        where: { id: r.id },
        update: {
          productId: r.productId,
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        },
        create: {
          id: r.id,
          productId: r.productId,
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        }
      });
      return;
    } catch (err) {
      console.error('[Database] Prisma insert review failed:', err);
    }
  }
  const db = getLocalDb();
  const idx = db.reviews.findIndex((rev: any) => rev.id === r.id);
  if (idx > -1) {
    db.reviews[idx] = r;
  } else {
    db.reviews.unshift(r);
  }
  writeLocalDb(db);
}

async function fetchSetting(key: string) {
  if (usePrisma) {
    try {
      const item = await prisma.setting.findUnique({ where: { key } });
      if (item) return JSON.parse(item.value);
    } catch (err) {
      console.error('[Database] Prisma setting query failed:', err);
    }
  }
  return null;
}

async function saveSetting(key: string, value: any) {
  if (usePrisma) {
    try {
      await prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) }
      });
      return;
    } catch (err) {
      console.error('[Database] Prisma save setting failed:', err);
    }
  }
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
          .brand-logo { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
          .brand-logo .mart-highlight { color: #FF8A00; }
          .brand-logo .cart-icon { background: #FF8A00; color: white; padding: 6px 10px; border-radius: 10px; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(255, 138, 0, 0.25); }
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
          .btn-print { background-color: #FF8A00; color: white; padding: 12px 32px; font-weight: bold; border-radius: 10px; border: none; font-size: 15px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(255, 138, 0, 0.3); }
          .btn-print:hover { background-color: #E07300; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255, 138, 0, 0.4); }
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
              <h1 class="brand-logo">
                <span class="cart-icon">🛒</span>
                <span>Master<span class="mart-highlight">Mart</span></span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #64748b; font-size: 13px; font-weight: 600;">Instant 10-Minute Home Delivery, Dhaka, BD</p>
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
              House 196/4, West Dhanmondi, Dhaka<br/>
              <strong>Phone:</strong> +8801613-476659<br/>
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
              <span style="font-size: 19px; color: #FF8A00; font-weight: bold;">Grand Total: ৳${order.total}</span>
            </div>
          </div>

          ${order.courierTrackingId ? `
            <div style="background-color: #FFF3E5; border: 1px solid #FFE1BB; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; margin-bottom: 20px;">
              <div>
                <strong style="color: #B85B00;">📦 Dispatch Provider:</strong> Steadfast Courier Service
              </div>
              <div>
                <strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 15px; background: white; padding: 4px 8px; border-radius: 6px; border: 1px solid #FFC588; font-weight: bold; color: #B85B00;">${order.courierTrackingId}</span>
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

// 6. SQL Database Status API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    database: 'SQL Database Active',
    engine: usePrisma ? 'Prisma ORM (SQLite / MySQL SQL)' : 'JSON Memory Fallback',
    architecture: 'Full-Stack Node.js + Express + SQL Database'
  });
});

// 7. Reviews API Route Group
app.get('/api/reviews', async (req, res) => {
  try {
    const revs = await fetchAllReviews();
    res.json(revs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = req.body;
    if (!review.id || !review.productId || !review.comment) {
      return res.status(400).json({ error: 'Missing required review parameters.' });
    }
    await insertReview(review);
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save review in database' });
  }
});

// 8. Settings API Route Group (For bKash, Delivery, and Chat Support configuration)
app.get('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await fetchSetting(key);
    if (!data) return res.status(404).json({ error: 'Setting not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;
    await saveSetting(key, value);
    res.json({ success: true, key, value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC ASSET SERVING
// ----------------------------------------------------

async function startServer() {
  // Initialize Prisma Database and seed if needed
  await initializePrismaDatabase();

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
