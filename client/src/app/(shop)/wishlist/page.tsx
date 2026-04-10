"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (product: any) => {
    addToCart({ ...product, qty: 1 });
    toggleWishlist(product);
    toast.success(`${product.name || product.title} moved to cart`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty-icon">
          <Heart size={36} />
        </div>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love to your wishlist and come back to them anytime.</p>
        <Link href="/" className="wishlist-empty-cta">
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {/* Header */}
      <div className="wishlist-header">
        <div>
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Link href="/" className="wishlist-back-link">
          <ArrowLeft size={15} /> Continue Shopping
        </Link>
      </div>

      {/* Wishlist Items */}
      <div className="wishlist-items">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {wishlist.map((product: any) => (
          <div key={product.id} className="wishlist-card">
            {/* Product Image */}
            <Link href={`/product/${product.id}`}>
              <img
                src={product.image_url || product.thumbnail || "/placeholder.png"}
                alt={product.name || product.title}
                className="wishlist-card-img"
              />
            </Link>

            {/* Product Info */}
            <div className="wishlist-card-info">
              <Link href={`/product/${product.id}`} className="wishlist-card-name">
                {product.name || product.title}
              </Link>
              {product.category && (
                <p className="wishlist-card-category">{product.category}</p>
              )}
              <p className="wishlist-card-price">
                Ksh {Number(product.price).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="wishlist-card-actions">
              <button className="wishlist-add-btn" onClick={() => handleAddToCart(product)}>
                <ShoppingCart size={15} /> Add to Cart
              </button>
              <button
                className="wishlist-remove-btn"
                onClick={() => toggleWishlist(product)}
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
