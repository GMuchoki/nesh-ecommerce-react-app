import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="site-header">
            <div className="header-innner container">
                <Link to="/" className="brand">NeshStore</Link>
                <nav className="header-nav">
                    <Link to="/">Home</Link>
                    <Link to="/cart" className="cart-link">Cart</Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;