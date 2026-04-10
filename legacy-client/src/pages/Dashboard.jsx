import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, CreditCard, Clock, ChevronRight } from "lucide-react";

const Dashboard = () => {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!user) {
        navigate("/login");
        return null;
    }

    // Cached query: orders persist while user is on the site
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders', user.id],
        queryFn: () => getUserOrders(user.id),
        enabled: !!user?.id,
    });

    return (
        <div className="container py-12 max-w-5xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Account</h1>
                    <p className="text-slate-500">Welcome back, <span className="font-semibold text-slate-700">{profile?.full_name || user.email}</span></p>
                </div>
                <button 
                    onClick={() => { logout(); navigate("/"); }} 
                    className="border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <nav className="flex flex-col space-y-1">
                            <button className="flex items-center gap-3 w-full text-left bg-white text-red-600 font-semibold px-4 py-3 rounded-lg shadow-sm border border-slate-200">
                                <Package size={18} /> Orders
                            </button>
                            <button className="flex items-center gap-3 w-full text-left text-slate-600 hover:bg-white hover:text-slate-800 px-4 py-3 rounded-lg transition-colors">
                                <MapPin size={18} /> Addresses
                            </button>
                            <button className="flex items-center gap-3 w-full text-left text-slate-600 hover:bg-white hover:text-slate-800 px-4 py-3 rounded-lg transition-colors">
                                <CreditCard size={18} /> Payment Methods
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" /> Order History
                    </h2>

                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center">
                            <Package size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No orders found</h3>
                            <p className="text-slate-500 mb-6 max-w-sm">When you make a purchase, your receipt and tracking info will appear here.</p>
                            <Link to="/" className="bg-red-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-red-600 transition-colors">Start Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-sm">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-slate-500 font-medium mb-1">Date Placed</p>
                                                <p className="font-semibold text-slate-800">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-medium mb-1">Total</p>
                                                <p className="font-semibold text-slate-800">Ksh {(order.total_amount || 0).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-medium mb-1">Order #</p>
                                                <p className="font-semibold text-slate-800 break-all">{order.id.split('-')[0]}</p>
                                            </div>
                                        </div>
                                        <span className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {order.status || 'Completed'}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {order.order_items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                        {item.products?.image_url ? (
                                                            <img src={item.products.image_url} alt="Product" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">N/A</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-800">{item.products?.name || "Unknown Product"}</h4>
                                                        <p className="text-slate-500 text-sm">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="font-bold text-slate-800">
                                                        ${(item.unit_price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!order.order_items || order.order_items.length === 0) && (
                                                <p className="text-slate-400 text-sm italic">Items could not be loaded from database.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
