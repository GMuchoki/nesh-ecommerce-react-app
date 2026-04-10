"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyPaystackPayment } from "@/lib/api";
import { ShoppingBag, CheckCircle, ArrowRight, ShieldCheck, CreditCard, Lock } from "lucide-react";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guestEmail, setGuestEmail] = useState(user?.email || "");

  const handleCheckoutBackend = async (reference: string) => {
    setProcessing(true);
    try {
      await verifyPaystackPayment({
        reference,
        guestEmail,
        userId: user?.id || null,
        cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSuccess(true);
      clearCart();
      toast.success("Order confirmed! Redirecting...", { duration: 4000 });
      setTimeout(() => { router.push(user ? "/dashboard" : "/"); }, 3500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected problem occurred";
      toast.error(`Order Error: ${message}`);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const triggerPayment = () => {
    if (!guestEmail.includes("@")) return toast.warning("Please enter a valid email for your receipt.");
    if (cart.length === 0) return toast.warning("Your cart is empty.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).PaystackPop) return toast.error("Payment gateway loading, please wait...");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: guestEmail,
      amount: Math.round(totalPrice * 100),
      currency: "KES",
      reference: new Date().getTime().toString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: function (response: any) {
        toast.success("Payment received! Verifying...");
        handleCheckoutBackend(response.reference);
      },
      onClose: function () {
        toast.error("Payment cancelled.");
      },
    });
    handler.openIframe();
  };

  // Empty cart state
  if (cart.length === 0 && !success) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", textAlign: "center" }}>
        <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "9999px", color: "var(--text-muted)" }}><ShoppingBag size={48} strokeWidth={1.5} /></div>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "360px" }}>Add items to your cart first.</p>
        </div>
        <button onClick={() => router.push("/")} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>
          Start Shopping <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", textAlign: "center" }}>
        <CheckCircle size={72} strokeWidth={1.5} style={{ color: "#22c55e" }} />
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Order Confirmed!</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "400px" }}>Your payment was processed. A receipt has been sent to <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{guestEmail}</span>.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {user && <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ padding: "0.625rem 1.5rem" }}>View Orders</button>}
          <button onClick={() => router.push("/")} style={{
            padding: "0.625rem 1.5rem", borderRadius: "9999px", border: "1px solid var(--border-color)",
            background: "var(--bg-card)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem"
          }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "960px" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Lock size={20} /> Secure Checkout</span>
      </h1>

      <div className="checkout-layout">
        {/* Order Summary */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", fontSize: "1rem" }}>Order Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "0.5rem", overflow: "hidden", background: "var(--bg-secondary)", flexShrink: 0 }}>
                    {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.8125rem" }}>{item.name || item.title}</span>
                    <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--text-muted)" }}>Qty: {item.qty}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem" }}>Ksh {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Total</span>
            <span style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--accent)" }}>Ksh {totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "var(--card-shadow)", height: "fit-content" }}>
          <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={18} /> Payment
          </h3>
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Email for Receipt</label>
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" className="form-input" disabled={!!user} />
            {user && <p style={{ color: "var(--text-muted)", fontSize: "0.6875rem", marginTop: "0.375rem" }}>Using your account email.</p>}
          </div>
          <button onClick={triggerPayment} disabled={processing || cart.length === 0} className="btn-primary" style={{
            width: "100%", justifyContent: "center", padding: "0.875rem", borderRadius: "0.75rem", fontSize: "1rem",
            opacity: processing ? 0.6 : 1, cursor: processing ? "not-allowed" : "pointer"
          }}>
            {processing ? "Processing..." : `Pay Ksh ${totalPrice.toLocaleString()}`}
          </button>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.6875rem", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <ShieldCheck size={14} style={{ color: "#22c55e" }} /> Secured by Paystack · SSL Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
