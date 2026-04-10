import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalesTeam, createSalesStaff } from '../../services/api';
import { toast } from 'sonner';
import { Plus, UserCheck, DollarSign } from 'lucide-react';

export default function TeamTab({ orders = [] }) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newStaff, setNewStaff] = useState({ fullName: '', email: '', password: '' });

    const { data: team = [], isLoading } = useQuery({
        queryKey: ['sales_team'],
        queryFn: getSalesTeam
    });

    const createMutation = useMutation({
        mutationFn: createSalesStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales_team'] });
            toast.success("Sales agent successfully hired and provisioned.");
            setIsAdding(false);
            setNewStaff({ fullName: '', email: '', password: '' });
        },
        onError: (err) => toast.error(err.message)
    });

    const handleAddStaff = (e) => {
        e.preventDefault();
        createMutation.mutate(newStaff);
    };

    // Calculate Commissions locally using mathematical tracking
    const computeCommission = (agentId) => {
        const agentOrders = orders.filter(o => o.sales_person_id === agentId);
        const totalRevenue = agentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const commission = totalRevenue * 0.05; // 5% Cut
        return { totalRevenue, commission };
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans animation-fadeIn">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <UserCheck size={20} className="text-red-500" /> Executive Sales Ledger
                    </h2>
                    <p className="text-sm text-slate-500">Track walk-in POS attribution and projected commission. Sales Agent Role receives 5% commission on total revenue generated.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> {isAdding ? 'Cancel' : 'Hire Agent'}
                </button>
            </div>

            {isAdding && (
                <div className="p-6 bg-slate-100 border-b border-slate-200 text-sm">
                    <form onSubmit={handleAddStaff} className="max-w-3xl flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Legal Name</label>
                            <input type="text" required
                                value={newStaff.fullName} onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="John Doe" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Corporate Email</label>
                            <input type="email" required
                                value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="john@neshstore.com" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Temporary POS Password</label>
                            <input type="password" required minLength={6}
                                value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="******" />
                        </div>
                        <button type="submit" disabled={createMutation.isLoading}
                            className="bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-lg disabled:opacity-50 h-[42px]">
                            {createMutation.isLoading ? 'Provisioning Vault...' : 'Provision Secure ID'}
                        </button>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 font-semibold">Agent Profile</th>
                            <th className="p-4 font-semibold">POS Logins</th>
                            <th className="p-4 font-semibold text-right">Total Revenue Matrix</th>
                            <th className="p-4 font-semibold text-right text-red-600 bg-red-50/50">Projected Commission (5%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {isLoading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading Staff Ledger...</td></tr>
                        ) : team.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400">No sales agents exist in the corporate ledger.</td></tr>
                        ) : team.map(agent => {
                            const { totalRevenue, commission } = computeCommission(agent.id);
                            return (
                                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{agent.full_name || 'Unnamed Agent'}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {agent.id.split('-')[0]}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded font-mono">Restricted Access</span>
                                    </td>
                                    <td className="p-4 text-right font-semibold text-slate-700">
                                        Ksh {totalRevenue.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right font-bold text-red-600 bg-red-50/30">
                                        <div className="flex items-center justify-end gap-1">
                                            <DollarSign size={14} /> Ksh {commission.toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
