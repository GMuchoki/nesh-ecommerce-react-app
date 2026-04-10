"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { getProducts, getCategories } from "@/lib/api";
import { ArrowRight, Search, Sparkles, Truck, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (data: string[]) => data.filter(Boolean),
  });

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  });

  const filtered = products.filter((p: { name?: string; title?: string }) =>
    (p.name || p.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  if (isLoading) return <Loader />;
  if (isError) return <div className="container">Error loading products.</div>;

  return (
    <div className="container">
      {/* ── Hero Banner ── */}
      <section className="hero-section">
        <h1 className="hero-title">
          Premium Tech.<br />
          <span style={{ color: "#ef4444" }}>Delivered.</span>
        </h1>
        <p className="hero-subtitle">
          Discover curated electronics from world-class brands. Fast shipping across Kenya with M-Pesa & card checkout.
        </p>
        <button className="hero-cta" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
          Shop Now <ArrowRight size={18} />
        </button>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-value">500+</div>
            <div className="hero-stat-label">Products</div>
          </div>
          <div>
            <div className="hero-stat-value">24hr</div>
            <div className="hero-stat-label">Delivery</div>
          </div>
          <div>
            <div className="hero-stat-value">100%</div>
            <div className="hero-stat-label">Authentic</div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <div className="flex flex-wrap items-center justify-center gap-8 mb-10 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-2"><Truck size={18} /> Free Shipping Over Ksh 5,000</span>
        <span className="flex items-center gap-2"><ShieldCheck size={18} /> Secure Checkout</span>
        <span className="flex items-center gap-2"><Sparkles size={18} /> Authentic Products</span>
      </div>

      {/* ── Search & Filter ── */}
      <div id="products" className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="search-bar" style={{ maxWidth: "480px", width: "100%" }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c: string, i: number) => (
            <option key={i} value={c}>{String(c).charAt(0).toUpperCase() + String(c).slice(1)}</option>
          ))}
        </select>
      </div>

      {/* ── Section Header ── */}
      <div className="section-header">
        <h2 className="section-title">Trending Now</h2>
        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{filtered.length} products</span>
      </div>

      {/* ── Product Grid ── */}
      <div className="product-grid">
        {filtered.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filtered.map((product: any, index: number) => (
            <div key={product.id} className="animation-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="text-center py-16" style={{ color: "var(--text-muted)", gridColumn: "1 / -1" }}>
            <p className="text-lg font-semibold mb-2">No products found</p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
