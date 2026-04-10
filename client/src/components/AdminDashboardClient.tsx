"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getProducts, getAllOrders, getCustomers, getBrands } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Users, ShoppingBag, Box, Tags, LogOut, LayoutDashboard } from "lucide-react";

import AnalyticsTab from "@/components/admin/AnalyticsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import CRMTab from "@/components/admin/CRMTab";
import InventoryTab from "@/components/admin/InventoryTab";
import BrandsTab from "@/components/admin/BrandsTab";
import TeamTab from "@/components/admin/TeamTab";

export default function AdminDashboardClient() {
    const { profile, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("analytics");

    const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
    const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ["admin_orders"], queryFn: () => getAllOrders() });
    const { data: customers = [], isLoading: customersLoading } = useQuery({ queryKey: ["admin_customers"], queryFn: () => getCustomers() });
    const { data: brands = [], isLoading: brandsLoading } = useQuery({ queryKey: ["brands"], queryFn: () => getBrands() });

    useEffect(() => {
        if (profile && profile.role !== "admin") {
            toast.error("Unauthorized: Admin access restricted.");
            router.push("/");
        }
    }, [profile, router]);

    if (!profile || profile.role !== "admin") return null;

    const handleLogout = async () => {
        await logout();
        router.push("/");
        toast.success("Enterprise Session Terminated.");
    };

    const TABS = [
        { id: "analytics", label: "Analytics Engine", icon: LayoutDashboard },
        { id: "orders", label: "Fulfillment Hub", icon: ShoppingBag },
        { id: "inventory", label: "Stock Matrix", icon: Box },
        { id: "brands", label: "Brand Vault", icon: Tags },
        { id: "team", label: "Sales Operatives", icon: ShieldCheck },
        { id: "customers", label: "CRM Database", icon: Users },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case "analytics": return <AnalyticsTab orders={orders} customers={customers} products={products} />;
            case "orders": return <OrdersTab orders={orders} isLoading={ordersLoading} />;
            case "customers": return <CRMTab customers={customers} isLoading={customersLoading} />;
            case "inventory": return <InventoryTab products={products} isLoading={productsLoading} brands={brands} />;
            case "brands": return <BrandsTab brands={brands} isLoading={brandsLoading} />;
            case "team": return <TeamTab orders={orders} />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans">
            <aside className="w-72 bg-[#0f172a] text-white flex flex-col flex-shrink-0 shadow-2xl z-20">
                <div className="p-8 border-b border-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Command<span className="text-red-500">Center</span></h1>
                            <p className="text-[11px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">NeshStore Admin</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto px-5 py-8 space-y-2">
                    {TABS.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${activeTab === tab.id ? "bg-red-500 text-white shadow-lg shadow-red-500/20 translate-x-1" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:translate-x-1"}`}>
                            <div className="flex items-center gap-3 w-full">
                                <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-slate-500"} />
                                {tab.label}
                            </div>
                            {activeTab === tab.id && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]"></div>}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-800/50 bg-[#0b1120]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">{profile.email?.charAt(0).toUpperCase()}</div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">System Admin</span>
                            <span className="text-[10px] text-slate-500 truncate w-32">{profile.email}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-xl transition-all text-sm font-semibold">
                        <LogOut size={16} /> Disconnect Proxy
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 flex items-center justify-between z-10 sticky top-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{TABS.find((t) => t.id === activeTab)?.label}</h2>
                        <p className="text-sm text-slate-500 font-medium">Real-time enterprise metrics & control module</p>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-10 z-10">
                    <div className="max-w-[1600px] mx-auto">{renderTab()}</div>
                </div>
            </main>
        </div>
    );
}
