import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { createOrder } from "../services/api";
import { toast } from "sonner";
import { ShoppingBag, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

const Checkout = () => {

  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guestEmail, setGuestEmail] = useState(user?.email || "");

  const handleCheckoutBackend = async (reference) => {
    setProcessing(true);

    try {
        const response = await fetch('http://localhost:5000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference,
                guestEmail,
                userId: user?.id || null,
                cart,
                totalAmount: totalPrice
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Server rejected verification");
        }

        // INVALIDATE CACHE so the homepage forces a background refresh and shows the updated stock!
        queryClient.invalidateQueries({ queryKey: ['products'] });

        setSuccess(true);
        clearCart();
        toast.success("Order fully secured! 🎉 Redirecting...", { duration: 4000 });
        
        // Explicitly bounce the user away so they don't feel stuck on the checkout URL
        setTimeout(() => {
            navigate(user ? '/dashboard' : '/');
        }, 3500);

    } catch (error) {
        console.error("Checkout failed:", error);
        toast.error(`Order Error: ${error.message || 'An unexpected problem occurred'}`);
    } finally {
        setProcessing(false);
    }
  };

  React.useEffect(() => {
    if (!document.getElementById('paystack-script')) {
        const script = document.createElement('script');
        script.id = 'paystack-script';
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        document.head.appendChild(script);
    }
  }, []);

  const triggerPayment = () => {
    if (!guestEmail.includes('@')) return toast.warning("Please enter a valid email address for your receipt.");
    if (cart.length === 0) return toast.warning("Your cart is empty.");
    if (!window.PaystackPop) return toast.error("Payment gateway is loading, please wait a second...");

    const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: guestEmail,
        amount: Math.round(totalPrice * 100),
        currency: 'KES',
        reference: (new Date()).getTime().toString(),
        callback: function(response) {
            toast.success("Payment Received! Finalizing order on the server...");
            handleCheckoutBackend(response.reference);
        },
        onClose: function() {
            toast.error("Payment window closed. Order not fully completed.");
        }
    });
    handler.openIframe();
  };

  if (cart.length === 0 && !success) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="bg-slate-100 p-6 rounded-full inline-block text-slate-400">
            <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 max-w-md">Looks like you haven't added anything to your cart yet. Discover our premium collection!</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-md shadow-red-500/20 transition-all flex items-center gap-2" onClick={() => navigate('/')}>
            Start Shopping <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="text-green-500 mb-2">
            <CheckCircle size={80} strokeWidth={1.5} />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Order Confirmed!</h2>
            <p className="text-slate-500 mb-6 max-w-md">Your secure payment was completely processed. We've sent a digital receipt to <span className="font-semibold text-slate-700">{guestEmail}</span>.</p>
        </div>
        <div className="flex gap-4">
            {user && (
                <button className="bg-slate-900 border border-slate-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition-colors" onClick={() => navigate('/dashboard')}>
                    View Orders
                </button>
            )}
            <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors" onClick={() => navigate('/')}>
                Continue Shopping
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">Secure Checkout</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Summary */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
                {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 hidden sm:block">
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-slate-700">{item.name || item.title}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 rounded-md">Qty: {item.qty}</span>
                    </div>
                    <span className="font-semibold">Ksh {(item.price * item.qty).toFixed(2)}</span>
                </div>
                ))}
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">Ksh {totalPrice.toFixed(2)}</span>
            </div>
        </div>

        {/* Right: Payment details */}
        <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Email</label>
                <input 
                    type="email" 
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="Enter email for receipt"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white placeholder-slate-400"
                    disabled={!!user}
                />
                {user && <p className="text-xs text-slate-500 mt-2">Using the primary email address for your account.</p>}
            </div>
            
            <button 
                onClick={triggerPayment} 
                disabled={processing || cart.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30 text-lg"
            >
                {processing ? 'Processing Server...' : `Pay Ksh ${totalPrice.toFixed(2)}`}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-green-500"/> Secured by Paystack
            </p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;