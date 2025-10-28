import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <CartProvider>
        <App />
    </CartProvider>
);