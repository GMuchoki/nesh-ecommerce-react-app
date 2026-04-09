import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductsById, getProductReviews, submitReview } from "../services/api";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Star } from "lucide-react";

const ProductDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [qty, setQty] = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Cached queries
  const { data: product, isLoading: productLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductsById(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviews(id),
  });

  // Mutation: submit a review and auto-refresh the review list
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
  if (isError || !product) return <div className="container">Product Not found.</div>;

  const handleAdd = () => {
    addToCart({ id: product.id, title: product.name, price: product.price, thumbnail: product.image_url }, Number(qty));
    navigate('/cart');
  };

  const whatsappNumber = "254700127598";
  const message = `Hi, I want to order the ${product.name} for Ksh ${product.price} each. Quantity: ${qty}.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.warning("You must be logged in to leave a review.");
    if (rating < 1 || rating > 5) return toast.warning("Please provide a valid rating.");
    
    reviewMutation.mutate({
        product_id: product.id,
        user_id: user.id,
        rating,
        comment
    });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "No Ratings Yet";

  return (
    <div className="container px-4 py-8 max-w-5xl">
        <div className="product-detail">
          <div className="detail-left">
            <img src={product.image_url} alt={product.name} className="detail-thumb" />
          </div>
          <div className="detail-right">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
                <p className="text-red-500 font-bold uppercase tracking-wider text-sm">{product.category}</p>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Star size={16} className={reviews.length > 0 ? "fill-orange-400 text-orange-400" : ""} /> 
                    {avgRating} ({reviews.length} Reviews)
                </div>
            </div>
            
            <p className="text-4xl font-black text-slate-900 mb-6">${product.price}</p>
            <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>

            <div className="actions border-t border-slate-100 pt-6">
              <label className="font-semibold text-slate-700 flex items-center gap-4 mb-4">
                Quantity
                <input type="number" min="1" max={product.stock_quantity || 100} value={qty} onChange={e => setQty(e.target.value)} className="w-20 p-2 border border-slate-300 rounded-md text-center"/>
              </label>
              <div className="flex gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn whatsapp-button flex-1 justify-center whitespace-nowrap"
                >
                  <img
                    src="https://ik.imagekit.io/aaugzuprk/whatsapp-svgrepo-com%20(1).png?updatedAt=1758664354208"
                    alt="WhatsApp"
                  />
                  Buy via WhatsApp
                </a>
                <button className="bg-slate-900 hover:bg-black text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all flex-1 whitespace-nowrap" onClick={handleAdd}>Add to Cart</button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Form Side */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Write a Review</h3>
                    {!user ? (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                            <p className="text-slate-600 mb-4">You must be logged in to leave a review.</p>
                            <Link to="/login" className="text-red-600 font-bold hover:underline">Log in securely</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-2">Rating</label>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            onClick={() => setRating(star)} 
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star size={28} className={star <= rating ? "fill-orange-400 text-orange-400" : "text-slate-300"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-2">Comment</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" 
                                    rows="4" 
                                    placeholder="What did you think of this product?"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button disabled={reviewMutation.isPending} type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors disabled:bg-slate-400">
                                {reviewMutation.isPending ? "Publishing..." : "Submit Review"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Ledger Side */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-slate-500 italic p-6 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            There are no reviews for this product yet.
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                        {(review.profiles?.full_name || "A").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {review.profiles?.full_name || "Anonymous User"}
                                            {review.profiles?.role === 'admin' && <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Staff</span>}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"} />
                                            ))}
                                            <span className="text-xs text-slate-400 ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm ml-12">
                                    {review.comment}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductDetail;

