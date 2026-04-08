import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Menu, X } from "lucide-react";

const Header = () => {

    const { itemCount } = useCart();

    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <header className="site-header">
            <div className="header-innner container">
                <Link to="/" className="brand">NeshStore</Link>

                {/* Hamburger Button (visible only on mobile) */}
                <button
                className="menu-toggle sm:hidden p-2 text-red-500"
                onClick={toggleMenu}
                aria-label="Toggle menu"
                >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation */}
                <nav
                className={`header-nav ${
                    menuOpen ? "flex" : "hidden"
                } sm:flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto mt-3 sm:mt-0`}
                >
                <Link to="/" onClick={() => setMenuOpen(false)}>
                    Home
                </Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                    Wishlist
                </Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                    Cart ({itemCount})
                </Link>
                </nav>

{/*                 <nav className="header-nav">
                    <Link to="/">Home</Link>
                    <Link to="/wishlist" className="nav-link">Wishlist</Link>
                    <Link to="/cart" className="cart-link">Cart({itemCount})</Link>
                </nav> */}
            </div>
        </header>
    );
}

export default Header;