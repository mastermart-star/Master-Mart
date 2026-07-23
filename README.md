# 🛒 Master Mart

**Master Mart** is a high-fidelity, Blinkit-style instant delivery e-commerce platform built with React, Vite, and Tailwind CSS. It features a fully responsive design optimized for a simulated mobile app view, full-text searching, localized dark mode toggles, instant order delivery tracking, customer reviews, card & bKash mobile banking integrations, and a robust admin dashboard.

---

## ✨ Features

- **⚡ Instant Blinkit-Style Commerce**: Sleek shopping experience with rapid item additions, animated cart drawers, and beautiful image assets.
- **🛠️ Robust Admin Panel**: Manage products (add, edit, delete), view active orders, and update real-time delivery status tracking.
- **🔥 Dual-Sync Database Engine**: Integrates natively with **Google Firebase Firestore** for real-time order and inventory tracking, with automatic silent fallback to **local browser storage** when offline or restricted.
- **🗺️ Interactive Order Tracking**: Visual step-by-step progress tracker for active orders with simulated instant updates.
- **💳 Payment Integration**: Dynamic checkout modals supporting bKash, Card, and Cash on Delivery payments.
- **🌓 Dynamic Dark Mode**: Elegant user-toggleable themes optimized for day and night shopping.

---

## 🚀 Local Development Setup

To run Master Mart on your computer locally, follow these steps:

### 1. Prerequisite
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or higher is recommended).

### 2. Clone and Install Dependencies
```bash
# Clone the repository (if downloaded via GitHub export)
# Or unzip your downloaded ZIP file and navigate into the folder
cd master-mart

# Install npm dependencies
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will run on [http://localhost:3000](http://localhost:3000) or another available port shown in your terminal.

### 4. Build for Production
To bundle the application into highly-optimized static files for web servers (Vercel, Netlify, Cloudflare Pages, GitHub Pages):
```bash
npm run build
```
This will generate a `dist/` directory containing the optimized HTML, JS, and CSS files.

---

## 🐘 Using PostgreSQL Locally

By default (no `DATABASE_URL` set) Master Mart runs against a local `database.json` file — handy for a quick preview, but not persistent/shared. To use a real PostgreSQL database instead:

1. Install PostgreSQL and create a database + user:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   sudo -u postgres psql -c "CREATE USER mart_user WITH PASSWORD 'mart_secure_password_9134';"
   sudo -u postgres psql -c "CREATE DATABASE master_mart OWNER mart_user;"
   ```
2. Copy `.env.example` to `.env` and set `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://mart_user:mart_secure_password_9134@localhost:5432/master_mart"
   ```
3. Start the app as usual — `npm run dev`. On first boot the server automatically creates the `products`, `orders`, and `reviews` tables and seeds the default product catalog. No separate migration command is required.

Prefer a hosted database instead of running Postgres yourself? [Neon](https://neon.tech) and [Supabase](https://supabase.com) both have a generous free tier — just paste the connection string they give you into `DATABASE_URL`.

**Note on Prisma:** `prisma/schema.prisma` (and `prisma/schema.sql`) describe the table structure and are there if you want to use Prisma's tooling (`npx prisma studio`, `npx prisma db push`, migrations, etc.) — but the running app talks to PostgreSQL directly via the `pg` driver, so you don't need to run any Prisma command for the app itself to work.

---

Master Mart automatically loads its Firebase configuration from `firebase-applet-config.json` at the root of the project.

If you are hosting this project on your own domain (e.g. Vercel or GitHub Pages) and want your product database to be fully synchronized across all browsers, you should link your own personal Google Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. In your project settings, add a new **Web App** to get your SDK configurations.
4. Replace the values inside `firebase-applet-config.json` with your project configurations:
   ```json
   {
     "projectId": "your-firebase-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "storageBucket": "your-project-id.firebasestorage.app",
     "messagingSenderId": "your-sender-id"
   }
   ```
5. Enable **Firestore Database** in production or test mode in your Firebase Console.

---

## 🌐 Deploying to GitHub & Hosting

### Option A: Using Google AI Studio Export (Easiest)
1. In the Google AI Studio project page, click on the **Settings/Export** button in the top right menu.
2. Select **Export to GitHub** or **Push to GitHub**.
3. Authorize your GitHub account and select/create a repository to upload the code directly!

### Option B: Manual Git Commands
If you downloaded the code as a ZIP file:
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Master Mart"

# Create a new repository on github.com and link it
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push code to GitHub
git push -u origin main
```

---

## 🌐 Deploying to a VPS or Cloud Host (Node.js + PostgreSQL)

Master Mart's database layer talks to **PostgreSQL** directly via the lightweight `pg` driver (no native ORM engine binary required at runtime), so it deploys cleanly anywhere Node.js can run — a VPS, Render, Railway, Fly.io, or a managed Postgres provider like **Neon** or **Supabase**.

### 1. Prerequisites on your server
Make sure you have **Node.js (v18+)**, **PostgreSQL**, **Nginx**, and **Git** installed:
```bash
# Update package list & install tools
sudo apt update
sudo apt install -y git curl nginx postgresql postgresql-contrib

# Install Node.js v18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Configure PostgreSQL Database
Log into PostgreSQL as the postgres user and create a database and role:
```bash
sudo -u postgres psql

-- Create the master_mart database
CREATE DATABASE master_mart;

-- Create a dedicated user
CREATE USER mart_user WITH PASSWORD 'mart_secure_password_9134';
GRANT ALL PRIVILEGES ON DATABASE master_mart TO mart_user;
\c master_mart
GRANT ALL ON SCHEMA public TO mart_user;
\q
```

Prefer a managed database instead of self-hosting? [Neon](https://neon.tech) and [Supabase](https://supabase.com) both offer a free PostgreSQL instance and hand you a ready-to-use `DATABASE_URL`.

### 3. Clone & Configure Environment Variables
Clone your exported project repository on the server, navigate to it, and create your production `.env` file:
```bash
cd /var/www
git clone <your-repo-link> master-mart
cd master-mart

# Install production dependencies
npm install

# Create .env file with your PostgreSQL connection string & other keys
nano .env
```
Inside the `.env` file, populate these variables:
```env
PORT=3000
NODE_ENV=production

# PostgreSQL connection string
DATABASE_URL="postgresql://mart_user:mart_secure_password_9134@localhost:5432/master_mart"

# Admin Authentication Secret
ADMIN_JWT_SECRET="mart-admin-jwt-token-9134-secret"
JWT_SECRET="mart-session-secret"

# Cloudinary Credentials (For dynamic image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Payment gateway sandbox settings
BKASH_APP_KEY="sandbox_app_key"
BKASH_APP_SECRET="sandbox_app_secret"
BKASH_USERNAME="sandbox_username"
BKASH_PASSWORD="sandbox_password"

SSLCOMMERZ_STORE_ID="sandbox_store_id"
SSLCOMMERZ_STORE_PASSWORD="sandbox_store_password"
SSLCOMMERZ_IS_SANDBOX="true"
```

### 4. Create the Database Tables
The server automatically creates its tables (and seeds the default product catalog) the first time it starts, as long as `DATABASE_URL` is set — no separate migration step required. If you'd rather create them explicitly up front, run the bundled SQL file:
```bash
psql "$DATABASE_URL" -f prisma/schema.sql
```
`prisma/schema.prisma` is kept in the project as the schema's source of truth (handy if you ever want to use `npx prisma db push`, `prisma studio`, or Prisma migrations), but the running app itself doesn't require the Prisma CLI or its engine binaries at all.

### 5. Build and Start Node Express Server
Build the optimized frontend assets and bundle the backend using PM2 to manage the node process persistently:
```bash
# Build frontend + server CJS bundle
npm run build

# Install PM2 globally
sudo npm install -g pm2

# Start the bundled app and save process to restart on VPS reboot
pm2 start dist/server.cjs --name "master-mart"
pm2 save
pm2 startup
```

### 6. Set Up Nginx Reverse Proxy
To make Master Mart accessible to the internet via your domain or public server IP, configure Nginx as a reverse proxy:
```bash
sudo nano /etc/nginx/sites-available/master-mart
```
Paste this Nginx block:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com <YOUR_SERVER_IP>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the Nginx config and restart the web server:
```bash
sudo ln -s /etc/nginx/sites-available/master-mart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

*Crafted with precision for a smooth, reliable, and premium shopping experience.*
