"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", textAlign: "center" }}>
        <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "9999px", color: "var(--text-muted)" }}>
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "360px" }}>Discover our premium collection and find something you love.</p>
        </div>
        <Link href="/" className="btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.9375rem" }}>
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2rem" }}>Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {cart.map((item) => (
            <div key={item.id} style={{
              background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1rem", padding: "1.25rem",
              display: "flex", alignItems: "center", gap: "1rem", boxShadow: "var(--card-shadow)", transition: "all 0.2s ease"
            }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "0.75rem", overflow: "hidden", background: "var(--bg-secondary)", flexShrink: 0 }}>
                <img src={item.image_url || item.thumbnail} alt={item.name || item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.name || item.title}</h3>
                <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.875rem" }}>Ksh {item.price.toLocaleString()}</p>
              </div>
              {/* Qty controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-secondary)", borderRadius: "0.5rem", padding: "0.25rem" }}>
                <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} style={{ width: "32px", height: "32px", border: "none", background: "var(--bg-card)", borderRadius: "0.375rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 700, fontSize: "0.875rem", minWidth: "24px", textAlign: "center", color: "var(--text-primary)" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: "32px", height: "32px", border: "none", background: "var(--bg-card)", borderRadius: "0.375rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
                  <Plus size={14} />
                </button>
              </div>
              <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.9375rem", minWidth: "fit-content" }}>
                Ksh {(item.price * item.qty).toLocaleString()}
              </span>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "var(--text-muted)", transition: "color 0.2s" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1rem", padding: "1.5rem",
          boxShadow: "var(--card-shadow)", height: "fit-content", position: "sticky", top: "100px"
        }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <span>Subtotal ({cart.length} items)</span>
            <span style={{ fontWeight: 600 }}>Ksh {totalPrice.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <span>Shipping</span>
            <span style={{ fontWeight: 600, color: "#22c55e" }}>Free</span>
          </div>
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>Total</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--accent)" }}>Ksh {totalPrice.toLocaleString()}</span>
          </div>
          <button onClick={() => router.push("/checkout")} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.875rem", borderRadius: "0.75rem", fontSize: "0.9375rem" }}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
          <button onClick={clearCart} style={{
            width: "100%", marginTop: "0.75rem", padding: "0.75rem", borderRadius: "0.75rem",
            background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-muted)",
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
