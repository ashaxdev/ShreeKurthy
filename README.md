# SSRK Trending Collections — Full E-Commerce Platform

A complete, production-ready e-commerce website built for **SSRK Trending Collections** boutique, with a customer storefront and a full admin dashboard.

Built with: **Next.js 14 (App Router) + TypeScript + MongoDB (Mongoose) + Tailwind CSS**

---

## ✨ What's included

**Storefront (customer-facing)**
- Mobile-responsive, minimalist design using your brand colors (maroon red, gold, green)
- Homepage with hero banner carousel, categories, featured/new/best-seller sections, "Shop by Reels"
- Product listing with filters: category, **size**, price range, search, sorting
- Single product page with **color variant selector** — each color has its own image set, sizes, and prices
- Cart, coupon codes, checkout (Razorpay online payment + Cash on Delivery)
- Order confirmation, order history, **PDF invoice download**
- **Track Order by phone number** (no login required) — `/track-order`
- Customer reviews with **photo upload**, star ratings, verified-purchase badge
- Wishlist, account page with saved addresses
- SEO: dynamic sitemap.xml, robots.txt, meta tags, Open Graph

**Admin Dashboard** (`/admin`)
- Dashboard with revenue charts, order status breakdown, top products (Recharts)
- Product management: create/edit products with **multiple color variants**, each with its own **images, sizes, prices, stock**
- Category management with image upload
- Order management: update status, add courier/tracking info, generate invoice PDF
- Inventory dashboard: low-stock & out-of-stock alerts, CSV export
- Coupon management (percentage / fixed, usage limits, expiry)
- Banner management for homepage hero slides
- "Shop by Reels" video upload and product tagging
- Review moderation: approve/reject customer reviews, **or post reviews directly as admin** (with name, rating, photos)
- Sales reports: daily / weekly / monthly / custom range, **export CSV & Excel**
- Customer list with order count & lifetime spend

---

## 🧰 Prerequisites

You will need free or paid accounts for:

1. **MongoDB Atlas** (database) — [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier works)
2. **Cloudinary** (image & video hosting) — [cloudinary.com](https://cloudinary.com) (free tier works) — see step-by-step below
3. **Razorpay** (payments) — [razorpay.com](https://razorpay.com) (use Test Mode keys to start)
4. **Node.js 18+** installed on your machine or hosting provider

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Connect → Drivers**, copy the connection string
3. Replace `<username>`, `<password>`, and add a database name, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ssrk_collections?retryWrites=true&w=majority
   ```
4. In Atlas, go to **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`) so your hosting provider can connect.

### 3. Set up Cloudinary (for product images, banners, and reel videos)

This is how the admin panel's image/video upload buttons work — uploads go straight to Cloudinary's CDN.

1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. On your **Cloudinary Dashboard** (after login), you'll see a **Product Environment Credentials** box showing:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. Copy these three values into your `.env.local` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. That's it — no further configuration needed. The app uploads images to folders like `ssrk/products`, `ssrk/categories`, `ssrk/banners`, `ssrk/reels`, `ssrk/reviews` automatically, and Cloudinary auto-optimizes/resizes them.
5. **Free tier limits**: 25 GB storage + 25 GB monthly bandwidth — generous for a boutique store. Upgrade only if you scale up significantly.

> Cloudinary handles all "upload product image", "upload reel video", "upload review photo" actions throughout the site — both in the admin panel and on the customer-facing review form.

### 4. Set up Razorpay (payment gateway)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key** (use Test Mode while developing)
3. Copy the **Key ID** and **Key Secret** into `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   ```
4. When ready to go live, switch to **Live Mode** keys in the same place and update `.env.local` (or your hosting provider's environment variables).
5. Customers can also choose **Cash on Delivery** — this works without any Razorpay setup.

### 5. Configure environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string_min_32_characters
NEXTAUTH_SECRET=another_long_random_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@ssrkcollections.com
ADMIN_PASSWORD=ChooseAStrongPassword123
```

(SMTP email settings are optional — only needed if you wire up order confirmation emails later.)

### 6. Create your admin account + starter categories

```bash
npm run seed
```

This creates the admin login (using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`) and six starter categories (Sarees, Kurtis, Lehengas, Salwar Suits, Western Wear, Accessories) which you can edit or delete from the admin panel.

### 7. Run the development server

```bash
npm run dev
```

Visit:
- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin) — log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### 8. Add your first products

In the admin panel → **Products → Add Product**:
1. Fill in name, category, description, base price, MRP
2. Under **Color Variants**, click **Add Color** for each color (e.g. Maroon, Royal Blue)
3. Upload images for that specific color
4. Under that color, click **Add Size** to add each size with its own price, MRP, and stock count
5. Repeat for more colors — this is what powers the "select color → images and sizes change" behavior on the product page

---

## 📦 Deploying to production

The easiest option is **Vercel** (made by the creators of Next.js):

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, paste in everything from your `.env.local`
4. Deploy — Vercel handles builds automatically
5. Update `NEXT_PUBLIC_SITE_URL` to your real domain once live, and switch Razorpay to Live Mode keys

Alternative hosts: Railway, Render, or any Node.js host that supports Next.js 14.

---

## 🗂️ Project structure

```
src/
  app/
    api/              → All backend API routes (products, orders, auth, payments, reports, etc.)
    admin/             → Admin dashboard pages
    shop/              → Customer storefront pages (products, cart, checkout, account, orders)
    login, register/   → Auth pages
    track-order/       → Phone-number order tracking
  components/
    admin/             → Admin layout, product form
    shop/              → Product card, reels section
    layout/            → Storefront header/footer
  models/              → Mongoose schemas (User, Product, Order, Category, Coupon, Banner, Reel, Review)
  lib/                 → DB connection, JWT auth, Cloudinary, API helpers
scripts/
  seed.js              → Creates admin account + starter categories
```

---

## 🔐 Security notes

- Passwords are hashed with bcrypt before storage
- JWT tokens are stored in HTTP-only cookies
- All admin API routes verify the JWT role is `admin` before allowing writes
- Change `JWT_SECRET` and `ADMIN_PASSWORD` to strong, unique values before going live

---

## 🛠️ Extending this project

This codebase is intentionally readable and modular so you (or any developer) can extend it:
- Add SMTP email notifications on order placement (Nodemailer is already installed)
- Add a `Settings` model to make store name/address/phone editable from the admin panel instead of hardcoded
- Add Shiprocket/Delhivery API integration for live courier tracking
- Add a password-change endpoint (the admin Settings page UI is ready, just needs the API route)

---

## 📞 Store Information (pre-filled in the code)

- **Store name**: SSRK Trending Collections
- **Address**: No.20 Vasantham Nagar, Thimmavaram, Chengalpet - 603101
- **Phone**: 9994333728 / 9171070722
- **Email**: ss@ssrkcollections.com

You can find and edit these in `src/components/layout/ShopLayout.tsx` (footer/header) and `src/app/page.tsx` (homepage store-info section).
