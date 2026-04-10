"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: string;
  name?: string;
  title?: string;
  price: number;
  qty: number;
  image_url?: string;
  thumbnail?: string;
  [key: string]: unknown;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Failed writing cart to local storage", error);
    }
  }, [cart]);

  const addToCart = (product: CartItem, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0);
  const itemCount = cart.reduce((s, p) => s + (p.qty || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside a CartProvider");
  return ctx;
};
