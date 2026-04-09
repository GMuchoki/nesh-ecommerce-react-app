import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
            gcTime: 1000 * 60 * 30,   // Cache persists for 30 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <App />
                    <Toaster position="top-center" richColors />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    </QueryClientProvider>
);