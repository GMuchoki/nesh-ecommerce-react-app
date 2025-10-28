import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {

  const { cart, updateQty, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.thumbnail} alt={item.title} className="cart-thumb" />
            <div className="cart-meta">
              <h3>{item.title}</h3>
              <p>${item.price} each</p>
              <label>
                Qty
                <input type="number" min="1" value={item.qty} onChange={e => updateQty(item.id, Number(e.target.value))} />
              </label>
            </div>
            <div className="cart-actions">
              <p>${(item.price * item.qty).toFixed(2)}</p>
              <button className="btn btn-primary" onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <h3>Summary</h3>
        <p>Total: <strong>${totalPrice.toFixed(2)}</strong></p>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </aside>
    </div>
  );
};

export default Cart;