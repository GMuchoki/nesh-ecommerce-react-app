import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="site-header">
            <div className="header-innner container">
                <Link to="/" className="logo">NeshStore</Link>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/cart">Cart</Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;