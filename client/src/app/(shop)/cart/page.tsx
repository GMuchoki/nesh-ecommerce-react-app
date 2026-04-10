"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2>Your cart is empty</h2>
        <p>Discover our premium collection and find something you love.</p>
        <Link href="/" className="cart-empty-cta">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div>
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cart.length} {cart.length === 1 ? "item" : "items"}</p>
        </div>
        <Link href="/" className="cart-back-link">
          <ArrowLeft size={15} /> Continue Shopping
        </Link>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-card">
              <div className="cart-card-main">
                <div className="cart-card-img-wrap">
                  <img src={item.image_url || item.thumbnail} alt={item.name || item.title} className="cart-card-img" />
                </div>
                <div className="cart-card-info">
                  <h3 className="cart-card-name">{item.name || item.title}</h3>
                  <p className="cart-card-unit-price">Ksh {item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="cart-card-right">
                <div className="cart-qty-controls">
                  <button onClick={() => updateQty(item.id, Math.max(1, (item.qty ?? 1) - 1))} className="cart-qty-btn">
                    <Minus size={14} />
                  </button>
                  <span className="cart-qty-value">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, (item.qty ?? 1) + 1)} className="cart-qty-btn">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="cart-card-total">
                  Ksh {(item.price * (item.qty ?? 1)).toLocaleString()}
                </span>
                <button onClick={() => removeFromCart(item.id)} className="cart-remove-btn" title="Remove item">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3 className="cart-summary-title">Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal ({cart.length} items)</span>
            <span className="cart-summary-value">Ksh {totalPrice.toLocaleString()}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className="cart-summary-free">Free</span>
          </div>
          <div className="cart-summary-total-row">
            <span className="cart-summary-total-label">Total</span>
            <span className="cart-summary-total-value">Ksh {totalPrice.toLocaleString()}</span>
          </div>
          <button onClick={() => router.push("/checkout")} className="btn-primary cart-checkout-btn">
            Proceed to Checkout <ArrowRight size={16} />
          </button>
          <button onClick={clearCart} className="cart-clear-btn">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
