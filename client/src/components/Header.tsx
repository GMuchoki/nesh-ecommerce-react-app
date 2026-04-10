"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ShoppingBag, Heart, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Left: Logo */}
        <Link href="/" className="brand">
          Nesh<span className="brand-dot">.</span>Store
        </Link>

        {/* Center/Right: Desktop Nav — hidden on mobile */}
        <nav className="header-nav header-nav-desktop">
          <Link href="/">Home</Link>
          <Link href="/wishlist" className="nav-icon-btn">
            <Heart size={18} />
          </Link>
          <Link href="/cart" className="nav-icon-btn">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
          </Link>

          <button onClick={toggleTheme} className="nav-icon-btn" aria-label="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <>
              <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <User size={15} /> Account
              </Link>
              <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ marginLeft: "0.25rem" }}>
              <User size={15} /> Sign In
            </Link>
          )}
        </nav>

        {/* Right: Mobile controls — visible on mobile only */}
        <div className="header-mobile-controls">
          <button onClick={toggleTheme} className="nav-icon-btn" aria-label="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link href="/cart" className="nav-icon-btn">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
          </Link>
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav className="mobile-menu-nav">
          <Link href="/" className="mobile-menu-link">
            Home
          </Link>
          <Link href="/wishlist" className="mobile-menu-link">
            <Heart size={18} /> Wishlist
          </Link>
          <Link href="/cart" className="mobile-menu-link">
            <ShoppingBag size={18} /> Cart
            {itemCount > 0 && <span className="mobile-badge">{itemCount}</span>}
          </Link>

          <div className="mobile-menu-divider" />

          {user ? (
            <>
              <Link href="/dashboard" className="mobile-menu-link">
                <User size={18} /> My Account
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-menu-link" style={{ width: "100%", textAlign: "left" }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.875rem", borderRadius: "0.75rem", marginTop: "0.5rem" }}>
              <User size={16} /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
