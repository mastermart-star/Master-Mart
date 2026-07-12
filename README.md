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

## ⚙️ Configuring Firebase Database

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

*Crafted with precision for a smooth, reliable, and premium shopping experience.*
