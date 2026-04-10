"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductsById, getProductReviews, submitReview, getProducts } from "@/lib/api";
import Loader from "@/components/Loader";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, ThumbsUp, MessageSquare, ChevronRight, ShoppingBag, Zap, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const [qty, setQty] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: product, isLoading: productLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductsById(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviews(id),
  });

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['products', product?.category],
    queryFn: () => getProducts(product?.category),
    enabled: !!product?.category
  });

  React.useEffect(() => {
    if (product?.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  const activePrice = selectedVariant?.price || product?.price || 0;
  const activeStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const activeImage = selectedVariant?.image_url || product?.image_url;

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      toast.success("Review published!");
      setComment("");
      setRating(5);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to submit review.");
    }
  });

  if (productLoading) return <Loader />;
  if (isError || !product) return <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>Product not found.</div>;

  const handleAdd = () => {
    addToCart({ id: product.id, title: product.name, price: activePrice, thumbnail: activeImage, variant: selectedVariant?.name || null }, Number(qty));
    router.push('/cart');
  };

  const handleBuyNow = () => {
    addToCart({ id: product.id, title: product.name, price: activePrice, thumbnail: activeImage, variant: selectedVariant?.name || null }, Number(qty));
    router.push('/checkout');
  };

  const whatsappNumber = "254700127598";
  const message = `Hi, I want to order the ${product?.name} ${selectedVariant ? `(${selectedVariant.name})` : ''} for Ksh ${activePrice} each. Quantity: ${qty}.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.warning("You must be logged in to leave a review.");
    if (rating < 1 || rating > 5) return toast.warning("Please provide a valid rating.");
    reviewMutation.mutate({ product_id: product.id, user_id: user.id, rating, comment });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : "5.0";
  const productVariants = product?.variants || [];
  const liked = isInWishlist(product.id);

  const tabs = [
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "specifications", label: "Specifications" },
    { key: "description", label: "Description" },
    { key: "similar", label: "Similar Products" },
  ];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <div className="container" style={{ maxWidth: "1280px", padding: "0 1.5rem" }}>

        {/* Breadcrumbs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--text-muted)", padding: "1.25rem 0", fontWeight: 500 }}>
          <Link href="/" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>Home</Link>
          <ChevronRight size={14} />
          <span style={{ textTransform: "capitalize" }}>{product.category}</span>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* ─── Main Product Section ─── */}
        <div className="pdp-layout">

          {/* Left: Image */}
          <div className="pdp-gallery">
            {/* Thumbnail strip */}
            <div className="pdp-thumbs">
              <div className="pdp-thumb active">
                <img src={activeImage} alt="thumb" />
              </div>
              {[2, 3, 4].map(idx => (
                <div key={idx} className="pdp-thumb">
                  <img src={activeImage} alt={`alt-${idx}`} style={{ opacity: 0.6 }} />
                </div>
              ))}
            </div>
            {/* Main Image */}
            <div className="pdp-main-image">
              <img src={activeImage} alt={product.name} />
            </div>
          </div>

          {/* Center: Product Info */}
          <div className="pdp-info">
            {product.brand && (
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.375rem" }}>
                {product.brand}
              </div>
            )}
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "0.75rem" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={15} className={star <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : ""} style={star > Math.round(Number(avgRating)) ? { color: "var(--border-color)" } : {}} />
                ))}
                <span style={{ fontWeight: 700, color: "var(--text-primary)", marginLeft: "0.25rem", fontSize: "0.875rem" }}>{avgRating}</span>
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{reviews.length} Reviews</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{product.sales_count || 0} sold</span>
            </div>

            {/* Price Block */}
            <div className="pdp-price-block">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent)" }}>Ksh {Number(activePrice).toLocaleString()}</span>
                {product.discount_percentage > 0 && (
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                    Ksh {(activePrice / (1 - product.discount_percentage / 100)).toFixed(0)}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, background: "rgba(239,68,68,0.1)", color: "var(--accent)", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>
                    -{Math.round(product.discount_percentage)}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tax excluded · Add at checkout if applicable</div>
            </div>

            {/* Variants */}
            {productVariants.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  Variant: <span style={{ fontWeight: 400 }}>{selectedVariant?.name}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {productVariants.map((variant: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className="pdp-variant-btn"
                      data-active={selectedVariant?.name === variant.name ? "true" : undefined}
                    >
                      {variant.image_url && <img src={variant.image_url} alt={variant.name} style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }} />}
                      <span>{variant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Actions */}
            <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", width: "60px" }}>Qty:</span>
                <div style={{ display: "flex", alignItems: "center", background: "var(--bg-secondary)", borderRadius: "0.5rem", padding: "0.125rem", border: "1px solid var(--border-color)" }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", borderRadius: "0.375rem", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(activeStock || 99, qty + 1))} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", borderRadius: "0.375rem", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>
                    <Plus size={14} />
                  </button>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{activeStock} available</span>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  <button onClick={handleBuyNow} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "0.875rem", borderRadius: "0.75rem", fontSize: "0.9375rem", fontWeight: 700 }}>
                    <Zap size={16} /> Buy Now
                  </button>
                  <button onClick={handleAdd} className="pdp-secondary-btn" style={{ flex: 1 }}>
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                </div>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    background: "#25D366", color: "#fff", fontWeight: 700, fontSize: "0.8125rem", padding: "0.75rem",
                    borderRadius: "0.75rem", border: "none", cursor: "pointer", transition: "all 0.2s", textDecoration: "none"
                  }}>
                    <img src="https://ik.imagekit.io/aaugzuprk/whatsapp-svgrepo-com%20(1).png?updatedAt=1758664354208" alt="WhatsApp" style={{ width: "18px", height: "18px", filter: "brightness(0) invert(1)" }} />
                    Order via WhatsApp
                  </a>
                  <button
                    onClick={() => { toggleWishlist(product); toast.success(liked ? "Removed from wishlist" : "Added to wishlist ❤️"); }}
                    style={{
                      width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.75rem",
                      cursor: "pointer", transition: "all 0.2s", flexShrink: 0
                    }}
                  >
                    <Heart size={18} fill={liked ? "#ef4444" : "none"} color={liked ? "#ef4444" : "var(--text-muted)"} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trust Sidebar */}
          <div className="pdp-sidebar">
            <div className="pdp-trust-card">
              <h4 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)", fontSize: "0.875rem" }}>
                Service Commitment
              </h4>
              {[
                { icon: <Truck size={18} />, title: "Fast Shipping", desc: "Delivery within 3 business days" },
                { icon: <RotateCcw size={18} />, title: "Return & Refund", desc: "Free return within 15 days" },
                { icon: <ShieldCheck size={18} />, title: "Security & Privacy", desc: "Safe payments, we don't share details" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: i < 2 ? "1rem" : 0 }}>
                  <div style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }}>{item.icon}</div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.8125rem" }}>{item.title}</p>
                    <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Tab Section ─── */}
        <div style={{ marginTop: "3rem" }}>
          <div className="pdp-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pdp-tab ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === 'description' && (
            <div className="animation-fadeIn" style={{ maxWidth: "800px", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Product Overview</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9375rem", whiteSpace: "pre-wrap" }}>{product.description}</p>
              <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { icon: <ShieldCheck size={40} strokeWidth={1} />, title: "Military Grade Protection", desc: "Tested to withstand drops from 10ft." },
                  { icon: <Star size={40} strokeWidth={1} />, title: "Crystal Clear Material", desc: "Anti-yellowing polymer for lasting clarity." }
                ].map((f, i) => (
                  <div key={i} style={{
                    background: "var(--bg-secondary)", borderRadius: "1rem", padding: "2rem", textAlign: "center",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ color: "var(--accent)", marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>{f.icon}</div>
                    <h4 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>{f.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {activeTab === 'specifications' && (
            <div className="animation-fadeIn" style={{ maxWidth: "800px", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Technical Details</h3>
              {product.specifications ? (
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "1rem", padding: "1.5rem" }}>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{product.specifications}</p>
                </div>
              ) : (
                <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <table style={{ width: "100%", fontSize: "0.875rem", textAlign: "left", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        { label: "Category", value: product.category },
                        { label: "Material", value: "Premium High-Durability Components" },
                        { label: "Features", value: "Anti-Scratch, Lightweight, Premium Build" },
                        { label: "Brand", value: product.brand || "NeshStore Verified" },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: i < 3 ? "1px solid var(--border-color)" : "none" }}>
                          <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--text-muted)", width: "35%", background: i % 2 === 0 ? "var(--bg-secondary)" : "transparent" }}>{row.label}</td>
                          <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-primary)", textTransform: row.label === "Category" ? "capitalize" : "none", background: i % 2 === 0 ? "var(--bg-secondary)" : "transparent" }}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="animation-fadeIn" style={{ maxWidth: "960px", padding: "1.5rem 0" }}>
              <div className="pdp-reviews-layout">
                {/* Write Review */}
                <div>
                  <div className="pdp-trust-card" style={{ position: "sticky", top: "80px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>Review this product</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Share your thoughts with other customers</p>

                    {!user ? (
                      <Link href="/login" className="pdp-secondary-btn" style={{ display: "flex", justifyContent: "center", textDecoration: "none" }}>
                        Sign in to write review
                      </Link>
                    ) : (
                      <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center", marginBottom: "0.5rem" }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} type="button" onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", transition: "transform 0.15s" }}>
                              <Star size={28} className={s <= rating ? "fill-amber-400 text-amber-400" : ""} style={s > rating ? { color: "var(--text-muted)" } : {}} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="What did you like or dislike?"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          required
                          style={{ resize: "vertical" }}
                        />
                        <button disabled={reviewMutation.isPending} type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem" }}>
                          {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Read Reviews */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)" }}>{avgRating}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={16} className={s <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : ""} style={s > Math.round(Number(avgRating)) ? { color: "var(--border-color)" } : {}} />
                        ))}
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{reviews.length} ratings</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {reviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                        <MessageSquare size={48} strokeWidth={1} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                        <p>No reviews yet. Be the first to share your experience!</p>
                      </div>
                    ) : (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      reviews.map((review: any) => (
                        <div key={review.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center",
                              background: "var(--bg-secondary)", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.8125rem"
                            }}>
                              {(review.profiles?.full_name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                {review.profiles?.full_name || "Verified Customer"}
                                {review.profiles?.role === 'admin' && <span style={{ background: "var(--accent)", color: "#fff", fontSize: "0.5625rem", padding: "0.125rem 0.375rem", borderRadius: "0.25rem", textTransform: "uppercase", fontWeight: 700 }}>Staff</span>}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
                                <div style={{ display: "flex" }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={11} className={i < review.rating ? "fill-amber-400 text-amber-400" : ""} style={i >= review.rating ? { color: "var(--border-color)" } : {}} />
                                  ))}
                                </div>
                                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.7, paddingLeft: "2.75rem" }}>{review.comment}</p>
                          <div style={{ paddingLeft: "2.75rem", marginTop: "0.5rem" }}>
                            <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                              <ThumbsUp size={12} /> Helpful (0)
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Similar Products */}
          {activeTab === 'similar' && (
            <div className="animation-fadeIn" style={{ padding: "1.5rem 0 3rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>You may also like</h3>
              <div className="product-grid">
                {similarProducts.filter((p: { id: string }) => p.id !== product.id).slice(0, 4).map((item: { id: string; [key: string]: unknown }) => (
                  <ProductCard key={item.id} product={item as Parameters<typeof ProductCard>[0]['product']} />
                ))}
                {similarProducts.filter((p: { id: string }) => p.id !== product.id).length === 0 && (
                  <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)", fontStyle: "italic" }}>No similar products available.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
