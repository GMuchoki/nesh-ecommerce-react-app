import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductsById, getProductReviews, submitReview, getProducts } from "../services/api";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Star, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus, ThumbsUp, MessageSquare } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Component State
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Clear");
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
  if (isError || !product) return <div className="container py-20 text-center font-bold text-slate-500">Product Not found.</div>;

  const handleAdd = () => {
    addToCart({ id: product.id, title: product.name, price: product.price, thumbnail: product.image_url, variant: selectedColor }, Number(qty));
    navigate('/cart');
  };
  
  const handleBuyNow = () => {
    addToCart({ id: product.id, title: product.name, price: product.price, thumbnail: product.image_url, variant: selectedColor }, Number(qty));
    navigate('/checkout'); // Assuming a fast direct guest checkout route
  }

  const whatsappNumber = "254700127598";
  const message = `Hi, I want to order the ${product.name} for Ksh ${product.price} each. Quantity: ${qty}.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.warning("You must be logged in to leave a review.");
    if (rating < 1 || rating > 5) return toast.warning("Please provide a valid rating.");
    reviewMutation.mutate({ product_id: product.id, user_id: user.id, rating, comment });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "5.0";

  // MOCK DATA for AliExpress clone layout
  const mockColors = [
      { name: "Clear", hex: "#f0f0f0" },
      { name: "Matte Black", hex: "#222222" },
      { name: "Titanium Gray", hex: "#7a7a7a" }
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        
        {/* TOP METADATA & BREADCRUMBS */}
        <div className="flex gap-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="capitalize hover:text-red-500 transition-colors cursor-pointer">{product.category}</span>
            <span>/</span>
            <span className="text-slate-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* --- MAIN HERO SECTION --- */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          
          {/* Left: Image Gallery */}
          <div className="lg:w-4/12 xl:w-5/12 flex gap-4">
              {/* Thumbnail strip mockup */}
              <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                  <div className="w-16 h-16 rounded-md border-2 border-red-500 p-1 flex items-center justify-center overflow-hidden cursor-pointer">
                      <img src={product.image_url} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  {[2, 3, 4].map(idx => (
                      <div key={idx} className="w-16 h-16 rounded-md border border-slate-200 hover:border-slate-400 bg-slate-50 overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-all">
                           <img src={product.image_url} alt={`alt-${idx}`} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                  ))}
              </div>
              {/* Main Image */}
              <div className="bg-slate-50 rounded-xl flex-1 aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center p-4 border border-slate-100 overflow-hidden">
                <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-500 cursor-zoom-in" />
              </div>
          </div>

          {/* Center: Product Information & Purchase Area */}
          <div className="lg:w-5/12 flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-snug mb-3">
                {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                        <Star key={star} size={16} className={star <= Math.round(Number(avgRating)) ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                    ))}
                    <span className="font-bold text-slate-800 ml-1">{avgRating}</span>
                </div>
                <div className="text-slate-400 text-sm">{reviews.length} Reviews</div>
                <div className="text-slate-400 text-sm">|</div>
                <div className="text-slate-400 text-sm">{product.sales_count || 0} sold</div>
            </div>
            
            <div className="bg-orange-50/50 rounded-xl p-4 mb-6 border border-orange-100">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl lg:text-4xl font-black text-red-600">${product.price.toFixed(2)}</span>
                    {product.discount_percentage > 0 && (
                        <span className="text-sm text-slate-400 line-through">
                            ${(product.price / (1 - product.discount_percentage/100)).toFixed(2)}
                        </span>
                    )}
                </div>
                <div className="text-sm text-slate-500">Tax excluded, add at checkout if applicable</div>
            </div>

            {/* Visual Color Picker */}
            <div className="mb-6">
                <div className="text-sm font-semibold text-slate-800 mb-3">
                    Color: <span className="text-slate-600 font-normal">{selectedColor}</span>
                </div>
                <div className="flex gap-3">
                    {mockColors.map(color => (
                        <button 
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all ${selectedColor === color.name ? 'border-red-500 shadow-sm' : 'border-slate-200 hover:border-slate-400'}`}
                        >
                            <img src={product.image_url} className="w-8 h-8 object-contain mix-blend-multiply opacity-80" alt={color.name} />
                            <div className="absolute inset-0 opacity-20" style={{backgroundColor: color.hex}}></div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-dotted border-slate-300 py-6 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-800 w-16">Quantity:</span>
                        <div className="flex items-center bg-white border border-slate-300 rounded-full overflow-hidden h-9 w-28">
                            <button 
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="w-8 flex justify-center items-center h-full hover:bg-slate-100 transition-colors text-slate-600"
                            ><Minus size={16}/></button>
                            <input 
                                type="number" 
                                value={qty} 
                                readOnly
                                className="w-full text-center font-semibold text-sm outline-none"
                            />
                            <button 
                                onClick={() => setQty(Math.min(product.stock_quantity || 99, qty + 1))}
                                className="w-8 flex justify-center items-center h-full hover:bg-slate-100 transition-colors text-slate-600"
                            ><Plus size={16}/></button>
                        </div>
                        <span className="text-xs text-slate-500">{product.stock_quantity ?? 0} available</span>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex gap-3">
                            <button onClick={handleBuyNow} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-red-500/20 transition-all text-sm uppercase tracking-wide">
                                Buy Now
                            </button>
                            <button onClick={handleAdd} className="flex-1 bg-orange-100 hover:bg-orange-200 text-red-600 font-bold py-3.5 px-6 rounded-full border border-orange-200 transition-all text-sm uppercase tracking-wide">
                                Add to Cart
                            </button>
                        </div>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold py-3.5 px-6 rounded-full shadow-sm transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            <img src="https://ik.imagekit.io/aaugzuprk/whatsapp-svgrepo-com%20(1).png?updatedAt=1758664354208" alt="WhatsApp" className="w-5 h-5 brightness-0 invert" />
                            Order from WhatsApp
                        </a>
                    </div>
                </div>
            </div>
          </div>

          {/* Right: Security & Shipping Promises */}
          <div className="lg:w-3/12 xl:w-2/12">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 space-y-6 lg:sticky lg:top-8">
                <div>
                    <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">Service Commitment</h4>
                    <div className="flex items-start gap-3 mt-3">
                        <Truck size={18} className="text-slate-800 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-slate-800">Fast Shipping</p>
                            <p className="text-xs text-slate-500 mt-0.5">Delivery guaranteed within 3 business days</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                        <RotateCcw size={18} className="text-slate-800 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-slate-800">Return & Refund Policy</p>
                            <p className="text-xs text-slate-500 mt-0.5">Free return within 15 days for any reason.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                        <ShieldCheck size={18} className="text-slate-800 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold text-slate-800">Security & Privacy</p>
                            <p className="text-xs text-slate-500 mt-0.5">Safe payments: We do not share your details.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>

        {/* --- SCROLLING TAB INTERFACE --- */}
        <div className="mt-16 bg-white shrink-0">
            {/* Tab Header Line */}
            <div className="flex gap-8 border-b border-slate-200 text-sm uppercase font-bold tracking-wider mb-8 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('reviews')} 
                    className={`pb-4 whitespace-nowrap border-b-2 transition-all ${activeTab === 'reviews' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Customer Reviews ({reviews.length})
                </button>
                <button 
                    onClick={() => setActiveTab('specifications')} 
                    className={`pb-4 whitespace-nowrap border-b-2 transition-all ${activeTab === 'specifications' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Specifications
                </button>
                <button 
                    onClick={() => setActiveTab('description')} 
                    className={`pb-4 whitespace-nowrap border-b-2 transition-all ${activeTab === 'description' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Description
                </button>
                <button 
                    onClick={() => setActiveTab('similar')} 
                    className={`pb-4 whitespace-nowrap border-b-2 transition-all ${activeTab === 'similar' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Similar Products
                </button>
            </div>

            {/* TAB CONTENT: DESCRIPTION */}
            {activeTab === 'description' && (
                <div className="max-w-4xl py-4 animation-fadeIn">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Product Overview</h3>
                    <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{product.description}</p>
                    {/* Mock Marketing Imagery */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl aspect-video px-12 py-8 flex flex-col items-center justify-center text-center border border-slate-100">
                            <ShieldCheck size={48} strokeWidth={1} className="text-red-500 mb-4" />
                            <h4 className="font-bold text-slate-800 text-xl mb-2">Military Grade Drop Protection</h4>
                            <p className="text-slate-500 text-sm">Tested to withstand drops from 10ft onto concrete surfaces.</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl aspect-video px-12 py-8 flex flex-col items-center justify-center text-center border border-slate-100">
                            <Star size={48} strokeWidth={1} className="text-red-500 mb-4" />
                            <h4 className="font-bold text-slate-800 text-xl mb-2">Crystal Clear Hybrid Material</h4>
                            <p className="text-slate-500 text-sm">Anti-yellowing polymer keeps your device looking pristine for longer.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SPECIFICATIONS */}
            {activeTab === 'specifications' && (
                <div className="max-w-4xl py-4 animation-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Technical Details</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-200">
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-600 w-1/3">Item Category</td>
                                    <td className="px-6 py-4 text-slate-800 capitalize">{product.category}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-semibold text-slate-600">Material</td>
                                    <td className="px-6 py-4 text-slate-800">Premium High-Durability Components</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-600">Features</td>
                                    <td className="px-6 py-4 text-slate-800 text-sm">Anti-Scratch, Lightweight, Premium Build</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-semibold text-slate-600">Brand Quality</td>
                                    <td className="px-6 py-4 text-slate-800">NeshStore Verified Original</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-600">Package Included</td>
                                    <td className="px-6 py-4 text-slate-800">Original Packaging x1, Instructions Manual</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
                <div className="max-w-5xl py-4 animation-fadeIn">
                    
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Write Review Column */}
                        <div className="md:w-1/3">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sticky top-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Review this product</h3>
                                <p className="text-sm text-slate-500 mb-6">Share your thoughts with other customers</p>
                                
                                {!user ? (
                                    <Link to="/login" className="w-full block text-center bg-white border border-slate-300 text-slate-800 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        Sign in to write review
                                    </Link>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div className="flex gap-1 justify-center mb-4">
                                            {[1,2,3,4,5].map(s => (
                                                <button key={s} type="button" onClick={() => setRating(s)} className="hover:scale-110 transition-transform focus:outline-none">
                                                    <Star size={32} className={s <= rating ? "fill-orange-400 text-orange-400" : "text-slate-300"} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm" 
                                            rows="3" 
                                            placeholder="What did you like or dislike?"
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        <button disabled={reviewMutation.isPending} type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors disabled:bg-slate-400 text-sm">
                                            {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Read Reviews Column */}
                        <div className="md:w-2/3">
                            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                                <div className="text-5xl font-black text-slate-900">{avgRating}</div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={18} className={s <= Math.round(Number(avgRating)) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500">{reviews.length} product ratings</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <MessageSquare size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                                        <p>No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0 group">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center font-bold text-slate-600 shadow-inner">
                                                    {(review.profiles?.full_name || "A").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                        {review.profiles?.full_name || "Verified Customer"}
                                                        {review.profiles?.role === 'admin' && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Staff</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-200"} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[11px] text-slate-400">{new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pl-12">
                                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                                    {review.comment}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                                                        <ThumbsUp size={14} /> Helpful (0)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB CONTENT: SIMILAR PRODUCTS */}
            {activeTab === 'similar' && (
                <div className="py-4 animation-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">You may also like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-20">
                        {similarProducts.filter(p => p.id !== product.id).slice(0, 5).map(item => (
                            <Link key={item.id} to={`/product/${item.id}`} className="block bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md hover:border-red-200 transition-all group">
                                <div className="aspect-square bg-slate-50 overflow-hidden p-4 flex items-center justify-center relative">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                    {item.discount_percentage > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            -{Math.round(item.discount_percentage)}%
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-white">
                                    <h4 className="text-xs font-semibold text-slate-700 line-clamp-2 mb-1">{item.name}</h4>
                                    <p className="text-sm font-black text-red-600">${item.price}</p>
                                </div>
                            </Link>
                        ))}
                        {similarProducts.filter(p => p.id !== product.id).length === 0 && (
                            <div className="col-span-full text-slate-400 italic">No similar products available.</div>
                        )}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;

