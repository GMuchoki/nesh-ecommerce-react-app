"use client";

import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/lib/api";
import { toast } from "sonner";

export default function OrdersTab({ orders = [], isLoading }) {
    const queryClient = useQueryClient();
    
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
            toast.success("Order status updated!");
        }
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animation-fadeIn">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Fulfillment Pipeline</h2>
                <span className="text-sm text-slate-500">{orders.filter(o => o.status === 'pending').length} Actions Required</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Customer Details</th>
                            <th className="p-4 font-semibold">Platform</th>
                            <th className="p-4 font-semibold">Total</th>
                            <th className="p-4 font-semibold text-right">Fulfillment Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading pipeline...</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-600 font-medium">
                                    {new Date(order.created_at).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{order.profiles?.full_name || 'Guest User'}</div>
                                    <div className="text-slate-500 text-xs">{order.guest_email || order.profiles?.email || 'Walk-in'}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.pos_walkin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {order.pos_walkin ? 'POS IN-STORE' : 'ONLINE WEB'}
                                    </span>
                                </td>
                                <td className="p-4 font-black text-slate-800">Ksh {order.total_amount}</td>
                                <td className="p-4 text-right">
                                    <select 
                                        value={order.status || 'pending'}
                                        onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                                        className={`p-2 rounded-lg font-bold text-xs uppercase border cursor-pointer outline-none focus:ring-2 focus:ring-red-500 transition-colors
                                            ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                              'bg-orange-50 text-orange-700 border-orange-200'}
                                        `}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {statusMutation.isPending && <span className="text-[10px] text-slate-400 block mt-1">Saving...</span>}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && !isLoading && <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders to fulfill.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

