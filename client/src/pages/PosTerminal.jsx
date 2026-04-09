import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getProducts, createOrder } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Search, ShoppingBag, Plus, Minus, Trash2, X, CheckCircle } from "lucide-react";

const PosTerminal = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");

    // Verify Authorization
    useEffect(() => {
        if (!profile || profile.role !== 'salesperson') {
            toast.error("Unauthorized: POS Terminal access restricted.");
            navigate("/");
        }
    }, [profile, navigate]);

    // Load POS Inventory
    useEffect(() => {
        getProducts()
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    }, []);

    const filtered = products.filter(p => 
        (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(p => {
            if (p.id === id) {
                const newQty = Math.max(1, p.qty + delta);
                return { ...p, qty: newQty };
            }
            return p;
        }));
    }

    const remove = (id) => setCart(prev => prev.filter(p => p.id !== id));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.warning("Terminal cart is empty!");
        setIsProcessing(true);

        try {
            await createOrder({
                customer_id: user.id, // Salesperson ringing it up
                guest_email: customerEmail || "walk-in@store.local",
                total_amount: total,
                pos_walkin: true,
                status: 'delivered'
            }, cart);
            
            // Invalidate global products cache so the web store sees the updated stock
            queryClient.invalidateQueries({ queryKey: ['products'] });
            
            // Refresh POS local inventory memory seamlessly
            const newInventory = await getProducts();
            setProducts(newInventory);

            toast.success("Order processed successfully!");
            setCart([]);
            setCustomerEmail("");
        } catch (error) {
            console.error("Checkout failed", error);
            // Fallback for schema mismatch
            if (error?.message?.includes("total_amount")) {
                toast.error("Schema mismatch: Trying fallback order insert...");
            } else {
                toast.error(error?.message || "Failed to process order");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (profile?.role !== 'salesperson') return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex flex-col bg-gray-50 overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="text-red-500" />
                    <h1 className="text-xl font-bold tracking-tight">NeshStore <span className="font-light text-slate-400">| POS Terminal</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-300">
                        Cashier: <span className="font-semibold text-white">{profile.full_name || user.email}</span>
                    </div>
                    <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </header>

            {/* Main Terminal Area */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left: Product Catalog */}
                <div className="w-2/3 flex flex-col border-r border-slate-200 bg-white">
                    <div className="p-4 border-b border-slate-100 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by name or SKU..." 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(product => (
                                <button 
                                    key={product.id} 
                                    onClick={() => addToCart(product)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-red-300 hover:shadow-md transition-all text-left flex flex-col h-full group"
                                >
                                    <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">No Img</div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight flex-1">{product.name}</h3>
                                    <div className="mt-2 flex justify-between items-end w-full">
                                        <span className="font-bold text-red-600">Ksh {product.price}</span>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Stock: {product.stock_quantity ?? 0}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {filtered.length === 0 && (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                No products found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Active Order Ledger */}
                <div className="w-1/3 flex flex-col bg-white">
                    <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50">
                        <h2 className="font-bold text-lg text-slate-800">Current Order</h2>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <ShoppingBag size={48} strokeWidth={1} />
                                <p>Terminal is empty.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-slate-800 text-sm leading-tight pr-2">{item.name}</h4>
                                                <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-slate-800">Ksh {(item.price * item.qty).toFixed(2)}</span>
                                                
                                                {/* Qty Controls */}
                                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><Minus size={14}/></button>
                                                    <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checkout Box */}
                    <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Customer Email (Optional)</label>
                            <input 
                                type="email" 
                                value={customerEmail}
                                onChange={e => setCustomerEmail(e.target.value)}
                                placeholder="Walk-in customer"
                                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500 font-medium">Total Balance</span>
                            <span className="text-3xl font-bold text-slate-900">Ksh {total.toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/30"
                        >
                            {isProcessing ? "Processing..." : (
                                <>
                                    <CheckCircle size={20} />
                                    Charge ${total.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PosTerminal;
