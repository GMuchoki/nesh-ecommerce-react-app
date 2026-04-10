import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getProducts, getAllOrders, getCustomers, getBrands } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, TrendingUp, Users, ShoppingBag, Box, Tags } from "lucide-react";

import AnalyticsTab from "../components/admin/AnalyticsTab";
import OrdersTab from "../components/admin/OrdersTab";
import CRMTab from "../components/admin/CRMTab";
import InventoryTab from "../components/admin/InventoryTab";
import BrandsTab from "../components/admin/BrandsTab";
import TeamTab from "../components/admin/TeamTab";

const AdminDashboard = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    
    // Core Layout State
    const [activeTab, setActiveTab] = useState('analytics'); // analytics | orders | inventory | customers

    // Single source of truth for admin data
    const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() });
    const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ['admin_orders'], queryFn: () => getAllOrders() });
    const { data: customers = [], isLoading: customersLoading } = useQuery({ queryKey: ['admin_customers'], queryFn: () => getCustomers() });
    const { data: brands = [], isLoading: brandsLoading } = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() });

    // Guard: redirect non-admins safely
    useEffect(() => {
        if (profile && profile.role !== 'admin') {
            toast.error("Unauthorized: Admin access restricted.");
            navigate("/");
        }
    }, [profile, navigate]);

    if (!profile || profile.role !== 'admin') return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-12 font-sans">
            <div className="container py-8 max-w-7xl mx-auto px-4">
                
                {/* Header Subsystem */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 rounded-xl">
                            <ShieldCheck size={32} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
                            <p className="text-slate-400 text-sm font-medium">Enterprise Management System</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Router Linkage */}
                <div className="flex gap-2 overflow-x-auto mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    {[
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                        { id: 'orders', label: 'Fulfillment', icon: ShoppingBag },
                        { id: 'inventory', label: 'Inventory', icon: Box },
                        { id: 'brands', label: 'Brands', icon: Tags },
                        { id: 'team', label: 'Sales Team', icon: ShieldCheck },
                        { id: 'customers', label: 'CRM / Customers', icon: Users }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                                activeTab === tab.id ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* DOMAIN MODULE ROUTING */}
                {activeTab === 'analytics' && <AnalyticsTab orders={orders} customers={customers} products={products} />}
                {activeTab === 'orders' && <OrdersTab orders={orders} isLoading={ordersLoading} />}
                {activeTab === 'customers' && <CRMTab customers={customers} isLoading={customersLoading} />}
                {activeTab === 'inventory' && <InventoryTab products={products} isLoading={productsLoading} brands={brands} />}
                {activeTab === 'brands' && <BrandsTab brands={brands} isLoading={brandsLoading} />}
                {activeTab === 'team' && <TeamTab orders={orders} />}

            </div>
        </div>
    );
};

export default AdminDashboard;
