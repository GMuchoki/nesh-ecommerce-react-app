import React, { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then(res => setProducts(res.products))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) return <div className="container">Error Loading Products.</div>;

  return (
    <div className="product-grid container">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Home;