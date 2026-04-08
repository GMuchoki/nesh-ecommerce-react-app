import React, { createContext, useContext, useEffect, useState } from "react";


const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const raw = localStorage.getItem("cart");
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
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

    const addToCart = (product, qty = 1) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.map(p => 
                    p.id === product.id 
                    ? { ...p, qty: p.qty + qty} // copy existing product, update qty
                    : p
                );
            }
            return [...prev, { ...product, qty }]; // copy old cart + add new product
        });
    };

    const updateQty = (id, qty) => {
        setCart(prev => prev.map(p => (p.id === id ? {...p, qty} : p)));
    }

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(p => p.id !== id));
    };

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0);

    const itemCount = cart.reduce((s, p) => s + (p.qty || 1), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, totalPrice, itemCount }}>
            {children}
        </CartContext.Provider>
    )
};


export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("UseCart must be inside a CartProvider");
    return ctx;
};