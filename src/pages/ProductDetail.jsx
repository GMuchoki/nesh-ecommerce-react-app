import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductsById } from "../services/api";
import Loader from "../components/Loader";

const ProductDetail = () => {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    getProductsById(id)
    .then((data) => setProduct(data))
    .catch((err) => setError(err))
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !product) return <div className="container">Product Not found.</div>;

  return (
    <div className="container product-detail">
      <div className="detail-left">
        <img src={product.thumbnail} alt={product.title} className="detail-thumb" />
      </div>
      <div className="detail-right">
        <h1>{product.title}</h1>
        <p className="muted">{product.brand} — {product.category}</p>
        <p className="price">${product.price}</p>
        <p>{product.description}</p>

        <div className="actions">
          <label>
            Qty:
            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}/>
          </label>
          <div className="product-action-buttons">
            <Link to="/checkout" className="btn btn-primary">Checkout</Link>
            <button className="btn btn-secondary">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
