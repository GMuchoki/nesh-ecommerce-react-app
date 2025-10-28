import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header = () => {

    const { itemCount } = useCart();

    return (
        <header className="site-header">
            <div className="header-innner container">
                <Link to="/" className="brand">NeshStore</Link>
                <nav className="header-nav">
                    <Link to="/">Home</Link>
                    <Link to="/cart" className="cart-link">Cart({itemCount})</Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;