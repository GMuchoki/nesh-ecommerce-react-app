import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";

const Header = () => {

    const { itemCount } = useCart();
    const { user, profile, logout } = useAuth();

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
                {user ? (
                    <>
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 font-medium text-slate-800 hover:text-red-500 transition-colors mx-0 sm:ml-2">
                            <User size={16} /> My Account
                        </Link>
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors mx-0 px-0 bg-transparent border-0 font-medium">
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-sm font-semibold !text-white hover:!text-white border-0 shadow-sm ml-0 sm:ml-2">
                        <User size={16} /> Sign In
                    </Link>
                )}
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