import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {

  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = () => {
    setProcessing(true);

    //Simulate an API Call
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      clearCart();
    }, 1000);
  };

  if (cart.length === 0 && !success) {
    return (
      <div className="container">
        <h2>No items to checkout</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go shopping</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <h2>Thank you! ✅</h2>
        <p>Your payment was successful (simulated).</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h2>Checkout</h2>
      <div className="checkout-summary">
        {cart.map(item => (
          <div key={item.id} className="checkout-item">
             <span>{item.title} × {item.qty}</span>
             <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p className="checkout-total">Total: <strong>${totalPrice.toFixed(2)}</strong></p>

      <div className="checkout-actions">
        <button className="btn btn-primary" onClick={handleCheckout} disabled={processing}>{processing ? 'Processing...' : 'Pay (simulate)'}</button>
      </div>
    </div>
  );
};

export default Checkout;