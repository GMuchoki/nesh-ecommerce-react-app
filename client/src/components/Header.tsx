"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-innner container">
        <Link href="/" className="brand">NeshStore</Link>
        <button className="menu-toggle sm:hidden p-2 text-red-500" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className={`header-nav ${menuOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto mt-3 sm:mt-0`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 font-medium text-slate-800 hover:text-red-500 transition-colors mx-0 sm:ml-2">
                <User size={16} /> My Account
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors mx-0 px-0 bg-transparent border-0 font-medium">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-sm font-semibold !text-white hover:!text-white border-0 shadow-sm ml-0 sm:ml-2">
              <User size={16} /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
