# 🛍️ HiveNest — Full-Stack E-Commerce Platform

A modern, full-featured e-commerce web application built with **React**, **Node.js/Express**, **Prisma ORM**, and **SQLite** (local) / **PostgreSQL or MySQL** (production).

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the App](#-running-the-app)
- [Default Admin Account](#-default-admin-account)
- [Deployment Guide](#-deployment-guide)
- [Optional Integrations](#-optional-integrations)

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
| Database (Local) | SQLite |
| Database (Production) | PostgreSQL / MySQL |
| Authentication | JWT (Access + Refresh tokens), Google OAuth |
| Email | Nodemailer (Gmail SMTP) |
| Image Storage | Local `/uploads` folder (or Cloudinary) |
| Icons | Lucide React |

---

## 📁 Project Structure

```
HiveNest-Fullstack/
├── backend/                  # Express API server
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Sample data seeder
│   │   └── dev.db            # SQLite database (local)
│   ├── src/
│   │   ├── config/           # App configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Helpers (JWT, email, cloudinary)
│   │   └── server.ts         # Entry point
│   ├── uploads/              # Local uploaded images
│   └── .env                  # Backend environment variables
│
└── frontend/                 # React application
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

## 🚀 Local Development Setup

### Prerequisites

Make sure you have these installed:

- **Node.js** v18 or higher → https://nodejs.org
- **npm** v8 or higher (comes with Node.js)
- **Git** → https://git-scm.com

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/HiveNest-Fullstack.git
cd HiveNest-Fullstack
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `backend/.env` and set at minimum:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET=any_random_32_character_string_here
JWT_REFRESH_SECRET=another_random_32_character_string_here
```

Run database setup:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### Step 3 — Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 4 — Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

Open browser → `http://localhost:5173` ✅

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 5000) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `DATABASE_URL` | ✅ | Database connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES` | ❌ | Access token expiry (default: `15m`) |
| `JWT_REFRESH_EXPIRES` | ❌ | Refresh token expiry (default: `7d`) |
| `SMTP_HOST` | ❌ | Email SMTP host (default: smtp.gmail.com) |
| `SMTP_USER` | ❌ | Gmail address for sending emails |
| `SMTP_PASS` | ❌ | Gmail App Password (not your login password) |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth Client Secret |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name (for cloud image upload) |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID (same as backend) |

---

## 🗄️ Database Setup

### Local (SQLite) — Default for Development

No installation needed. SQLite file is created automatically at `backend/prisma/dev.db`.

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed sample data (products, categories, admin user)
npm run db:seed

# Optional: Open Prisma Studio to view data in browser
npm run db:studio
```

### Production (PostgreSQL or MySQL)

Change `DATABASE_URL` in `.env`:

**PostgreSQL:**
```env
DATABASE_URL="postgresql://username:password@host:5432/hivenest"
```

**MySQL:**
```env
DATABASE_URL="mysql://username:password@host:3306/hivenest"
```

Also change `provider` in `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   # or "mysql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate deploy
npm run db:seed
```

---

## 🔐 Default Admin Account

After running the seed command, a default admin account is created:

| Field | Value |
|---|---|
| Email | `admin@hivenest.com` |
| Password | `Admin@123` |
| Role | `SUPER_ADMIN` |

> ⚠️ **Change the admin password immediately after first login in production.**

To make any existing user an admin, update the database:
```bash
cd backend
npx prisma studio
```
Find the user → change `role` to `ADMIN` or `SUPER_ADMIN` → Save.

---

## 🌐 Deployment Guide

You can deploy this app on any hosting provider that supports Node.js. Below are general steps that work on most platforms (Railway, Render, Heroku, DigitalOcean, VPS, etc.).

---

### Backend Deployment

#### Step 1 — Build the backend

```bash
cd backend
npm run build
```
This compiles TypeScript to JavaScript in the `dist/` folder.

#### Step 2 — Set environment variables on your host

Set all variables from `backend/.env.example` on your hosting platform's environment/config section:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/hivenest
JWT_ACCESS_SECRET=strong_random_secret_min_32_chars
JWT_REFRESH_SECRET=another_strong_random_secret
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

#### Step 3 — Start command

```bash
npm start
# runs: node dist/server.js
```

#### Step 4 — Run migrations on production database

```bash
npx prisma migrate deploy
npm run db:seed
```

---

### Frontend Deployment

#### Step 1 — Set environment variables

```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id  # optional
```

#### Step 2 — Build the frontend

```bash
cd frontend
npm run build
```
This creates a `dist/` folder with static HTML/CSS/JS files.

#### Step 3 — Deploy

Upload the `frontend/dist/` folder to any **static hosting** service:
- Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any web server

Make sure your hosting serves `index.html` for all routes (SPA routing). Most platforms do this automatically, or add a `_redirects` file:

```
/* /index.html 200
```

---

### Important: CORS Configuration

After deployment, update these values:

**Backend `.env`:**
```env
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
```

---

## 🔧 Optional Integrations

### Gmail SMTP (Email Sending)

1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Go to → App Passwords → create one for "Mail"
3. Use that 16-character password as `SMTP_PASS` in `.env`

```env
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### Google OAuth (Social Login)

1. Go to https://console.cloud.google.com
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID → Web Application
4. Add authorized origins: `http://localhost:5173` (dev), `https://yourdomain.com` (prod)
5. Add redirect URIs if needed

```env
# Backend
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Frontend
VITE_GOOGLE_CLIENT_ID=your_client_id
```

### Cloudinary (Cloud Image Storage)

By default, product images are stored in the local `backend/uploads/` folder. For production, use Cloudinary so images persist across deployments.

1. Sign up free at https://cloudinary.com
2. Get your credentials from the dashboard

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/google` | Google OAuth login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/auth/verify-email` | Verify email |
| GET | `/api/v1/auth/me` | Get current user |
| PATCH | `/api/v1/auth/me` | Update profile |
| POST | `/api/v1/auth/me/address` | Add address |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | Get all products (with filters) |
| GET | `/api/v1/products/home` | Home page data |
| GET | `/api/v1/products/search?q=query` | Search products |
| GET | `/api/v1/products/:slug` | Get single product |
| POST | `/api/v1/products` | Create product (Admin) |
| PATCH | `/api/v1/products/:id` | Update product (Admin) |
| DELETE | `/api/v1/products/:id` | Delete product (Admin) |

### Cart, Orders, Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cart` | Get cart |
| POST | `/api/v1/cart` | Add to cart |
| PATCH | `/api/v1/cart/:id` | Update cart item |
| DELETE | `/api/v1/cart/:id` | Remove cart item |
| GET | `/api/v1/wishlist` | Get wishlist |
| POST | `/api/v1/wishlist/toggle` | Toggle wishlist item |
| GET | `/api/v1/orders` | Get user orders |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders/:id` | Get order detail |
| POST | `/api/v1/orders/:id/cancel` | Cancel order |

---

## 🐛 Common Issues

**Port already in use:**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
kill $(lsof -t -i:5000)
```

**Prisma client not generated:**
```bash
cd backend
npx prisma generate
```

**Database migration failed:**
```bash
cd backend
npx prisma migrate reset   # WARNING: deletes all data
npx prisma migrate dev
npm run db:seed
```

**Images not showing in development:**
Make sure both frontend and backend are running. The Vite dev server proxies `/uploads` to `localhost:5000`.

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

<div align="center">
  <strong>Built with 🩶 — HiveNest E-Commerce Platform</strong>
</div>
