"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WishlistItem {
  id: string;
  name?: string;
  title?: string;
  price: number;
  image_url?: string;
  thumbnail?: string;
  [key: string]: unknown;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (product: WishlistItem) => string;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: WishlistItem) => {
    let action = "added";
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        action = "removed";
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
    return action;
  };

  const isInWishlist = (id: string) => wishlist.some((p) => p.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside a WishlistProvider");
  return ctx;
};
