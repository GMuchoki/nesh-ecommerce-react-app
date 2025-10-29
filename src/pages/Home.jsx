import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => res.json())
      .then((data) => {
        // Normalize data: always return array of strings
        const normalized = data.map((item) =>
          typeof item === "string"
            ? item
            : item.slug || item.name || ""
        );
        setCategories(normalized.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  // Load products (all or by category)
  useEffect(() => {
    setLoading(true);
    let url =
      category === "all"
        ? "https://dummyjson.com/products?limit=100"
        : `https://dummyjson.com/products/category/${category}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [category]);

  // Filter by search
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;
  if (error) return <div className="container">Error loading products.</div>;

  return (
    <div className="container">
      {/* 🔍 Search & Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search products..."
          className="w-full md:w-1/2 p-2 border rounded-md focus:outline-none focus:ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category filter */}
        <select
          className="p-2 border rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {String(c).charAt(0).toUpperCase() + String(c).slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* 🛍 Product Grid */}
      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
