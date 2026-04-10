"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your wishlist is empty 💔</h2>
        <Link href="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toggleWishlist(product);
    toast.success(`${product.name || product.title} added to cart ✅`);
  };

  return (
    <div className="container wishlist-page">
      <h2>My Wishlist ❤️</h2>
      <div className="wishlist-grid">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {wishlist.map((product: any) => (
          <div key={product.id} className="wishlist-item">
            <img src={product.image_url || product.thumbnail} alt={product.name || product.title} className="wishlist-thumb" />
            <div className="wishlist-info">
              <h3>{product.name || product.title}</h3>
              <p>Ksh {product.price}</p>
            </div>
            <div className="wishlist-actions">
              <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
              <button className="btn btn-secondary" onClick={() => toggleWishlist(product)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
