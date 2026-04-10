# NeshStore — Premium E-Commerce Platform

NeshStore is a modern, high-performance e-commerce platform built with Next.js 15, React seamlessly integrated with Supabase and featuring a premium, glassmorphism-inspired design system. It includes a user-facing retail storefront and secure enterprise modules (Admin Dashboard and POS Terminal).

## 🚀 Key Features

### Storefront
- **Premium UI/UX:** Built with a custom, theme-aware CSS variable system supporting automatic Light and Dark modes. Features rich micro-animations, blur-backdrop navbars, and modern layout conventions.
- **Product Discovery:** Advanced product browsing, high-quality image galleries, and detailed product specifications.
- **Seamless Cart & Checkout:** Real-time cart state management using React Context. Fast and secure checkout powered by server-side verification.
- **Payment Integrations:** 
  - M-Pesa STK Push (via Safaricom Daraja API)
  - Paystack (Card Payments)
- **Wishlist & User Accounts:** Secure user authentication with Supabase to manage orders and saved products.

### Secure Backend (Route Handlers)
All sensitive business logic is safely executed server-side via Next.js Route Handlers (`/app/api/...`), completely replacing the need for a separate legacy Express server:
- `api/verify-payment`: Securely validates cart totals against the database to prevent client-side price tampering before initializing Paystack transactions.
- `api/mpesa/push`: Direct integration with Safaricom Daraja API.
- `api/admin/*`: Enterprise provisioning and reporting modules secured by Supabase Service Roles.

### Enterprise Modules
- **Admin Command Center:** Real-time analytics, inventory matrix, order fulfillment hub, and CRM database.
- **POS Terminal:** A specialized iPad-optimized view for physical store salespeople to process walk-in orders.
- *Note:* Access is strictly guarded by role-based Row Level Security (RLS) policies.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Styling:** Custom CSS with robust CSS variables + Tailwindcss typography classes (`app/globals.css`)
- **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL + GoTrue Auth)
- **State Management:** React Context (`CartContext`, `AuthContext`, `ThemeContext`, `WishlistContext`) + React Query (`@tanstack/react-query`)
- **Icons:** Lucide React

## ⚙️ Local Development setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and configure the following variables:
   ```env
   # Public Variables (Client-safe)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Secret Variables (Server-only)
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PAYSTACK_SECRET_KEY=your_paystack_secret
   
   # Optional: Secret App Routes
   NEXT_PUBLIC_ADMIN_SECRET_ROUTE=red-command-center-x9
   NEXT_PUBLIC_POS_SECRET_ROUTE=nexus-pos-terminal
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📐 Architecture Notes

- **Theme Persistence:** Theme preference is stored in `localStorage` ensuring an uninterrupted experience.
- **Route Protection:** Unauthorized users attempting to access enterprise nodes or authenticated paths are automatically intercepted by global context hooks and middlewares.
- **Optimistic UI:** Uses specialized React Query mutations for fast interactions like leaving product reviews and wishlist management.
