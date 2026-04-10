"use client";

import React from "react";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";

export default function AnalyticsTab({ orders = [], customers = [], products = [] }: { orders?: any[], customers?: any[], products?: any[] }) {
    const totalRevenue = orders.filter((o: any) => o.status !== 'cancelled').reduce((sum: any, o: any) => sum + (o.total_amount || 0), 0);
    const lowStockItems = products.filter((p: any) => p.stock_quantity < 5);

    return (
        <div className="space-y-6 animation-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24}/></div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold mb-1">Gross Revenue</h3>
                        <p className="text-3xl font-black text-slate-900">Ksh {totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={24}/></div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold mb-1">Total Lifetime Orders</h3>
                        <p className="text-3xl font-black text-slate-900">{orders.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={24}/></div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold mb-1">Registered Customers</h3>
                        <p className="text-3xl font-black text-slate-900">{customers.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Package size={24}/></div>
                        {lowStockItems.length > 0 && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">{lowStockItems.length} Warnings</span>}
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold mb-1">Low Stock Alerts</h3>
                        <p className="text-3xl font-black text-slate-900">{lowStockItems.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mt-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Fulfillment Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500">
                                <th className="pb-3 font-semibold">Order ID</th>
                                <th className="pb-3 font-semibold">Date</th>
                                <th className="pb-3 font-semibold">Customer</th>
                                <th className="pb-3 font-semibold">Amount</th>
                                <th className="pb-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.slice(0, 5).map((order: any) => (
                                <tr key={order.id}>
                                    <td className="py-4 font-mono text-xs text-slate-400">{order.id.split('-')[0]}...</td>
                                    <td className="py-4 text-slate-700">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="py-4 text-slate-700">{order.profiles?.full_name || order.guest_email || 'Guest Walk-in'}</td>
                                    <td className="py-4 font-bold text-slate-800">Ksh {order.total_amount}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-black uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {order.status || 'pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No recent orders.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

