# 🛍️ HiveNest — Full-Stack E-Commerce Platform

A modern, full-featured e-commerce web application built with **React**, **Node.js/Express**, **Prisma ORM**, and **SQLite**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Setup Guide](#-local-setup-guide)
- [Default Admin Account](#-default-admin-account)
- [Making Someone a Super Admin](#-making-someone-a-super-admin)
- [Environment Variables Reference](#-environment-variables-reference)
- [Common Issues](#-common-issues)

---

## ✨ Features

### Customer Side
- 🔐 Authentication — Register, Login, Google OAuth, Email Verification
- 🛒 Shopping Cart — Add, remove, update quantities
- ❤️ Wishlist — Save favourite products
- 📦 Checkout — Address management, COD / Card payment
- 🎟️ Coupons — Discount codes with percentage/fixed amounts
- 📝 Orders — Track order status (Pending → Shipped → Delivered)
- ⭐ Reviews — Rate and review products
- 🔍 Search — Real-time product search
- 📱 Responsive — Mobile-first design

### Admin Panel (`/admin`)
- 📊 Dashboard — Revenue, orders, users analytics
- 🛍️ Products — Add, edit, delete with image upload
- 📋 Orders — Update order status, confirm payment, add tracking number
- 👥 Users — Manage user roles and status
- 🏷️ Categories — Create and manage product categories
- 📝 Blogs — Write and publish blog posts
- 🎟️ Coupons — Create and manage discount coupons
- 📦 Inventory — Track and update stock levels

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| State Management | Zustand, TanStack Query |
| Animations | Framer Motion |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | SQLite (no installation needed) |
| Authentication | JWT (Access + Refresh tokens) |
| Email | Nodemailer (Gmail SMTP) |
| Image Storage | Local `/uploads` folder |
| Icons | Lucide React |

---

## �️ Prerequisites

Install these **once** on the client's laptop:

1. **Node.js v18+** → https://nodejs.org (download LTS version)
2. **Git** → https://git-scm.com

To verify installation, open Command Prompt and run:
```
node --version
npm --version
git --version
```
All three should print a version number.

---

## 🚀 Local Setup Guide

### Step 1 — Get the Project

```bash
git clone https://github.com/your-username/HiveNest-Fullstack.git
cd HiveNest-Fullstack
```

Or just copy the project folder to the laptop and open a terminal inside `HiveNest-Fullstack`.

---

### Step 2 — Backend Setup

Open a terminal and run:

```bash
cd backend
npm install
```

The `.env` file is already configured for local development. No changes needed.

Run database setup (only needed **once**):

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

> `db:seed` creates sample products, categories, blogs, and the admin account.

---

### Step 3 — Frontend Setup

Open a **second terminal** (keep the first one open) and run:

```bash
cd frontend
npm install
```

The `.env` file is already configured. No changes needed.

---

### Step 4 — Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see: `🚀 HiveNest API running on port 5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

Open browser → **http://localhost:5173** ✅

---

## � Default Admin Account

After running `npm run db:seed`, the admin account is created automatically:

| Field | Value |
|---|---|
| Email | `admin@hivenest.com` |
| Password | `Admin@1234` |
| Role | `SUPER_ADMIN` |

Login at: **http://localhost:5173/admin**

---

## 👑 Making Someone a Super Admin

You have two options:

### Option A — Use Prisma Studio (GUI)

```bash
cd backend
npx prisma studio
```

This opens a browser at `http://localhost:5555`.

1. Click on the **User** table
2. Find the user you want to promote
3. Click on their row
4. Change the `role` field to `SUPER_ADMIN`
5. Click **Save 1 change**

### Option B — Direct Database Edit

```bash
cd backend
npx prisma db execute --stdin <<EOF
UPDATE User SET role = 'SUPER_ADMIN' WHERE email = 'client@example.com';
EOF
```

Replace `client@example.com` with the actual email.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

These are already set for local development:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET=your_super_secret_access_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_min_32_chars
```

Optional (needed for email sending):
```env
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
```

> To get a Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HiveNest
```

---

## � Common Issues

### "Port already in use"
```bash
# Windows — find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Prisma client not generated"
```bash
cd backend
npx prisma generate
```

### "No products showing on homepage"
Make sure the seed ran successfully:
```bash
cd backend
npm run db:seed
```

### "Images not loading"
Make sure **both** backend and frontend terminals are running at the same time.

### Database reset (deletes all data, use carefully)
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

---

## 📁 Project Structure

```
HiveNest-Fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Sample data seeder
│   │   └── dev.db            # SQLite database (auto-created)
│   ├── src/
│   │   ├── config/           # App configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Helpers (JWT, email, cloudinary)
│   │   └── server.ts         # Entry point
│   ├── uploads/              # Uploaded images stored here
│   └── .env                  # Backend environment variables
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── hooks/            # Custom React hooks
    │   ├── store/            # Zustand state stores
    │   ├── services/         # API service calls
    │   └── types/            # TypeScript types
    └── .env                  # Frontend environment variables
```

---

<div align="center">
  <strong>Built with 🩶 — HiveNest E-Commerce Platform</strong>
</div>
