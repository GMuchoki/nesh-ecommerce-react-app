"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    discount_percentage?: number;
    stock_quantity?: number;
    reviews?: { rating: number }[];
    [key: string]: unknown;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const discountPercent = Math.round(product.discount_percentage || 0);
  const originalPrice = (product.price / (1 - (product.discount_percentage || 0) / 100)).toFixed(2);
  const liked = isInWishlist(product.id);

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
      : "New";

  const handleWishlistClick = () => {
    const wasLiked = isInWishlist(product.id);
    toggleWishlist(product);
    if (wasLiked) {
      toast.warning(`${product.name} removed from wishlist 💔`);
    } else {
      toast.success(`${product.name} added to wishlist ❤️`);
    }
  };

  return (
    <article className="product-card">
      <div className="product-thumbnail-container">
        <Link href={`/product/${product.id}`}>
          <img src={product.image_url} alt={product.name} />
        </Link>
        <div className="discount-badge">-{discountPercent}%</div>
        <button className="wishlist-btn" onClick={handleWishlistClick} aria-label="Add to wishlist">
          {liked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4757"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="#333" fill="none" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          )}
        </button>
      </div>
      <div className="product-body">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price-section">
          <p className="product-current-price">Ksh {product.price}</p>
          {discountPercent > 0 && <span className="product-original-price">Ksh {originalPrice}</span>}
        </div>
        <div className="product-rating-section text-sm text-slate-600 flex items-center justify-between mt-3">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Star size={14} className="fill-orange-400 text-orange-400" /> {avgRating}
          </span>
          <span className="product-stock-info font-medium">{product.stock_quantity ?? 0} in stock</span>
        </div>
      </div>
    </article>
  );
}
