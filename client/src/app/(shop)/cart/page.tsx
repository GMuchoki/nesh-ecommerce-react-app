"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your cart is empty</h2>
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image_url || item.thumbnail} alt={item.name || item.title} className="cart-thumb" />
            <div className="cart-meta">
              <h3>{item.name || item.title}</h3>
              <p>Ksh {item.price} each</p>
              <label>Qty <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, Number(e.target.value))} /></label>
            </div>
            <div className="cart-actions">
              <p>Ksh {(item.price * item.qty).toFixed(2)}</p>
              <a className="btn remove-item-cart" onClick={() => removeFromCart(item.id)}>Remove</a>
            </div>
          </div>
        ))}
      </div>
      <aside className="cart-summary">
        <h3>Summary</h3>
        <p>Total: <strong>Ksh {totalPrice.toFixed(2)}</strong></p>
        <div className="cart-summary-action-btns">
          <a className="btn btn-primary" onClick={() => router.push("/checkout")}>Proceed to Checkout</a>
          <a className="btn btn-secondary" onClick={clearCart}>Clear Cart</a>
        </div>
      </aside>
    </div>
  );
}
