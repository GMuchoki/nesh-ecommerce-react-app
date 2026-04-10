"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { getProducts, getCategories } from "@/lib/api";

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full md:w-1/2 p-2 border rounded-md focus:outline-none focus:ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="p-2 border rounded-md" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c: string, i: number) => (
            <option key={i} value={c}>{String(c).charAt(0).toUpperCase() + String(c).slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="product-grid">
        {filtered.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filtered.map((product: any) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="text-center text-gray-500 py-10">No products match your search.</div>
        )}
      </div>
    </div>
  );
}
