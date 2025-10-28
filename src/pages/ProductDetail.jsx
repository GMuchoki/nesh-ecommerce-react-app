import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductsById } from "../services/api";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  const handleAdd = () => {
    addToCart({ id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail }, Number(qty));
    navigate('/cart');
  };

  const whatsappNumber = "254700127598";
  const message = `Hi, I want to order the ${product.title} for Ksh ${product.price} each. Quantity: ${qty}.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

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
            {/* <Link to="/checkout" className="btn btn-primary">Buy now</Link> */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <img
                src="https://ik.imagekit.io/aaugzuprk/whatsapp-svgrepo-com%20(1).png?updatedAt=1758664354208"
                alt="WhatsApp"
                className="w-5 h-5"
              />
              Buy via WhatsApp
            </a>
            <button className="btn btn-secondary" onClick={handleAdd}>Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

