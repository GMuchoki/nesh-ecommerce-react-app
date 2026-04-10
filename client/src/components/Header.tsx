"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { Menu, X, User, LogOut, ShoppingBag, Heart, Sun, Moon, Search } from "lucide-react";

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          Nesh<span className="brand-dot">.</span>Store
        </Link>

        {/* Desktop Nav */}
        <nav className={`header-nav ${menuOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-1 w-full sm:w-auto mt-3 sm:mt-0`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="nav-icon-btn relative">
            <Heart size={18} />
          </Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="nav-icon-btn relative">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
          </Link>

          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5">
                <User size={15} /> Account
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-1.5">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary ml-1">
              <User size={15} /> Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button className="sm:hidden p-2 text-current" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{ background: "none", border: "none" }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
