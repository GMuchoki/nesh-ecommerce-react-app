import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "sonner";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <CartProvider>
        <WishlistProvider>
            <App />
            <Toaster position="top-center" richColors />
        </WishlistProvider>
    </CartProvider>
);