"use client";

import React from 'react';

export default function CRMTab({ customers = [], isLoading }: { customers?: any[], isLoading?: boolean }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animation-fadeIn">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-slate-800 text-lg">Customer Database (CRM)</h2>
                <p className="text-sm text-slate-500">View registered loyaly members.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 font-semibold">User ID</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Joined At</th>
                            <th className="p-4 font-semibold">Account Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading CRM data...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">No registered customers found.</td></tr>
                        ) : customers.map((cust: any) => (
                            <tr key={cust.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-xs text-slate-400">{cust.id.split('-')[0]}...</td>
                                <td className="p-4 font-bold text-slate-800">{cust.full_name || 'Unnamed User'}</td>
                                <td className="p-4 text-slate-600">{new Date(cust.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                        {cust.role === 'admin' ? 'Admin' : 'Member'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

