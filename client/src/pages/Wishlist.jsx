import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your wishlist is empty 💔</h2>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product);
    toast.success(`${product.name || product.title} added to cart ✅`);
  };

  return (
    <div className="container wishlist-page">
      <h2>My Wishlist ❤️</h2>
      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <div key={product.id} className="wishlist-item">
            <img src={product.image_url || product.thumbnail} alt={product.name || product.title} className="wishlist-thumb" />
            <div className="wishlist-info">
              <h3>{product.name || product.title}</h3>
              <p>${product.price}</p>
            </div>
            <div className="wishlist-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => toggleWishlist(product)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
