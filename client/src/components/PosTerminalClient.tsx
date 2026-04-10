"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getProducts, createOrder, pushSTK, verifySTK } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Search, ShoppingBag, Plus, Minus, Trash2, X, CheckCircle, Smartphone } from "lucide-react";

export default function PosTerminalClient() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cart, setCart] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [mpesaPhone, setMpesaPhone] = useState("");
    const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (!profile || profile.role !== "salesperson") {
            toast.error("Unauthorized: POS Terminal access restricted.");
            router.push("/");
        }
    }, [profile, router]);

    useEffect(() => {
        getProducts().then((data) => setProducts(data)).catch((err) => console.error(err));
    }, []);

    const filtered = products.filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase()));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addToCart = (product: any) => {
        setCart((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p)));
    };

    const remove = (id: string) => setCart((prev) => prev.filter((p) => p.id !== id));
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const finalizeSystemOrder = async () => {
        setIsProcessing(true);
        try {
            await createOrder({ customer_id: null, sales_person_id: user!.id, guest_email: customerEmail || "walk-in@store.local", total_amount: total, pos_walkin: true, status: "delivered" }, cart);
            queryClient.invalidateQueries({ queryKey: ["products"] });
            const newInventory = await getProducts();
            setProducts(newInventory);
            toast.success("Sale Recorded & Commission Logged!");
            setCart([]);
            setCustomerEmail("");
            setMpesaPhone("");
            setCheckoutRequestId(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to process order.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
            setIsVerifying(false);
        }
    };

    const handleTerminalAction = async () => {
        if (cart.length === 0) return toast.warning("Terminal cart is empty!");
        if (paymentMethod === "MPesa") {
            if (!mpesaPhone.trim() || mpesaPhone.length < 9) return toast.warning("Provide a valid customer Safaricom number.");
            setIsProcessing(true);
            try {
                const res = await pushSTK(mpesaPhone, total);
                setCheckoutRequestId(res.CheckoutRequestID);
                toast.success("STK Push triggered! Device unlocked.");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "STK Push failed.";
                toast.error(message);
            } finally {
                setIsProcessing(false);
            }
            return;
        }
        finalizeSystemOrder();
    };

    const handleVerifyDaraja = async () => {
        if (!checkoutRequestId) return;
        setIsVerifying(true);
        try {
            const res = await verifySTK(checkoutRequestId);
            if (res.status === "paid") {
                toast.success("Safaricom Verified! Payment acquired.");
                finalizeSystemOrder();
            } else if (res.status === "pending") {
                toast.info("Customer has not yet typed PIN.");
            } else {
                toast.error(`Daraja Report: ${res.message}`);
                setCheckoutRequestId(null);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Network Error contacting Daraja";
            toast.error(message);
        } finally {
            setTimeout(() => setIsVerifying(false), 2000);
        }
    };

    if (profile?.role !== "salesperson") return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex flex-col bg-gray-50 overflow-hidden font-sans">
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="text-red-500" />
                    <h1 className="text-xl font-bold tracking-tight">NeshStore <span className="font-light text-slate-400">| POS Terminal</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-300">Cashier: <span className="font-semibold text-white">{profile.full_name || user?.email}</span></div>
                    <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 flex flex-col border-r border-slate-200 bg-white">
                    <div className="p-4 border-b border-slate-100 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input type="text" placeholder="Search by name or SKU..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {filtered.map((product: any) => (
                                <button key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-red-300 hover:shadow-md transition-all text-left flex flex-col h-full group">
                                    <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No Img</div>}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight flex-1">{product.name}</h3>
                                    <div className="mt-2 flex justify-between items-end w-full">
                                        <span className="font-bold text-red-600">Ksh {product.price}</span>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Stock: {product.stock_quantity ?? 0}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {filtered.length === 0 && <div className="flex h-full items-center justify-center text-slate-400">No products found.</div>}
                    </div>
                </div>
                <div className="w-1/3 flex flex-col bg-white">
                    <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50"><h2 className="font-bold text-lg text-slate-800">Current Order</h2></div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3"><ShoppingBag size={48} strokeWidth={1} /><p>Terminal is empty.</p></div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">{item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}</div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start"><h4 className="font-semibold text-slate-800 text-sm leading-tight pr-2">{item.name}</h4><button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-slate-800">Ksh {(item.price * item.qty).toFixed(2)}</span>
                                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><Minus size={14} /></button>
                                                    <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-200 rounded-md text-slate-600"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Payment Method</label>
                            <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setCheckoutRequestId(null); }} className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-slate-700">
                                <option value="Cash">Cash (Manual Trust)</option>
                                <option value="Card">PDQ Terminal (Card/Till)</option>
                                <option value="MPesa">Safaricom Express (STK Push)</option>
                            </select>
                        </div>
                        {paymentMethod === "MPesa" && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 block">Customer M-PESA Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                                    <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-sans font-bold text-slate-800" disabled={!!checkoutRequestId} />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-6 pt-2 border-t border-slate-200">
                            <span className="text-slate-500 font-medium">Total Balance</span>
                            <span className="text-3xl font-bold text-slate-900">Ksh {total.toFixed(2)}</span>
                        </div>
                        {!checkoutRequestId ? (
                            <button onClick={handleTerminalAction} disabled={cart.length === 0 || isProcessing} className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg ${paymentMethod === "MPesa" ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" : "bg-red-600 hover:bg-red-700 shadow-red-500/30 disabled:bg-slate-300"}`}>
                                {isProcessing ? "Transacting..." : (<><CheckCircle size={20} />{paymentMethod === "MPesa" ? "Trigger M-PESA Pin" : `Commit Ksh ${total.toFixed(2)} Revenue`}</>)}
                            </button>
                        ) : (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
                                <div className="text-sm font-semibold text-center text-slate-600 animate-pulse flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Phone Buzzing...</div>
                                <button onClick={handleVerifyDaraja} disabled={isVerifying} className="w-full bg-slate-900 border border-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors">{isVerifying ? "Contacting Safaricom..." : "Verify Payment Status"}</button>
                                <button onClick={() => setCheckoutRequestId(null)} className="w-full text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors">Cancel STK & Reset Drawer</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
