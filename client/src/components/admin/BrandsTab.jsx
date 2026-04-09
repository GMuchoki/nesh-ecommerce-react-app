import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBrand, updateBrand, deleteBrand } from "../../services/api";
import { toast } from "sonner";
import { Search, Tags, Edit2, Trash2, Plus, X } from "lucide-react";

export default function BrandsTab({ brands = [], isLoading }) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newBrand, setNewBrand] = useState({ name: "", description: "" });

    const saveMutation = useMutation({
        mutationFn: async (brandToSave) => {
            if (editingId) return await updateBrand(editingId, brandToSave);
            return await insertBrand(brandToSave);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setIsModalOpen(false);
            toast.success(editingId ? "Brand updated!" : "Brand created!");
        },
        onError: (err) => toast.error(err.message || "Failed to save brand")
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success("Brand deleted successfully");
        },
        onError: () => toast.error("Failed to delete brand.")
    });

    const handleSaveBrand = async (e) => {
        e.preventDefault();
        saveMutation.mutate(newBrand);
    };

    const handleEditClick = (brand) => {
        setEditingId(brand.id);
        setNewBrand({ name: brand.name || "", description: brand.description || "" });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this brand?")) return;
        deleteMutation.mutate(id);
    };

    return (
        <div className="animation-fadeIn">
            {/* Context Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50" />
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 whitespace-nowrap"><Tags size={16} /> {brands.length} Brands</div>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setNewBrand({ name: "", description: "" });
                            setIsModalOpen(true);
                        }}
                        className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-md shadow-slate-900/20 whitespace-nowrap"
                    >
                        <Plus size={16} /> Add Brand
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Brand Name</th>
                                <th className="p-4 font-semibold">Description / Note</th>
                                <th className="p-4 font-semibold">Created At</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading brand database...</td></tr>
                            ) : brands.filter(b => (b.name || "").toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No brands found.</td></tr>
                            ) : brands.filter(b => (b.name || "").toLowerCase().includes(search.toLowerCase())).map(brand => (
                                <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-800">{brand.name}</td>
                                    <td className="p-4 text-slate-500 text-sm max-w-xs truncate">{brand.description || '-'}</td>
                                    <td className="p-4 text-slate-600">{new Date(brand.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleEditClick(brand)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteClick(brand.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Injection */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Brand" : "Add New Brand"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6">
                            <form id="add-brand-form" onSubmit={handleSaveBrand} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name *</label>
                                    <input required type="text" value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. NeshStore Original" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                                    <textarea value={newBrand.description} onChange={e => setNewBrand({...newBrand, description: e.target.value})} rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
                            <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" form="add-brand-form" disabled={saveMutation.isPending} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                {saveMutation.isPending ? "Saving..." : (editingId ? "Update" : "Save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
