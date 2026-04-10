"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading || (user && profile === null)) return null;

  // Block staff from the storefront
  if (user && profile && profile.role !== "member") {
    const adminRoute = process.env.NEXT_PUBLIC_ADMIN_SECRET_ROUTE || "admin";
    const posRoute = process.env.NEXT_PUBLIC_POS_SECRET_ROUTE || "pos";
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 font-sans p-4 text-center">
        <div className="p-10 bg-white shadow-2xl rounded-3xl max-w-sm w-full border border-slate-100">
          <h1 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-wide">Session Blocked</h1>
          <p className="text-slate-500 mb-8 text-sm font-medium">You are currently authenticated as an internal employee. Public retail modules are strictly restricted to customer accounts.</p>
          <div className="flex flex-col gap-3">
            {profile.role === "admin" && (
              <a href={`/${adminRoute}`} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all uppercase tracking-widest text-xs text-center">Return to Command Center</a>
            )}
            {profile.role === "salesperson" && (
              <a href={`/${posRoute}`} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs text-center">Return to Cashier Till</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
