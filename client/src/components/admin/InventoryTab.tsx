"use client";

import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProduct, updateProduct, deleteProduct } from "@/lib/api";
import { toast } from "sonner";
import { Search, Database, Edit2, Trash2, Plus, X } from "lucide-react";

export default function InventoryTab({ products = [], brands = [], isLoading }) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    
    // Modal State scoped strictly to Inventory Tab
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: "", category: "", price: "", stock_quantity: "", image_url: "", description: "", discount_percentage: 0, sales_count: 0, brand: "", specifications: "", variants: []
    });

    const saveMutation = useMutation({
        mutationFn: async (productToSave) => {
            if (editingId) return await updateProduct(editingId, productToSave);
            return await insertProduct(productToSave);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            toast.success(editingId ? "Product updated successfully!" : "Product added to inventory!");
        },
        onError: (err) => toast.error(err.message || "Failed to save product")
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Product deleted successfully");
        },
        onError: () => toast.error("Failed to delete product. It might be linked to existing orders.")
    });

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        saveMutation.mutate({
            ...newProduct,
            price: parseFloat(newProduct.price),
            stock_quantity: parseInt(newProduct.stock_quantity, 10),
            discount_percentage: parseFloat(newProduct.discount_percentage) || 0,
            sales_count: parseInt(newProduct.sales_count, 10) || 0
        });
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setNewProduct({
            name: product.name || "", category: product.category || "", price: product.price || "",
            stock_quantity: product.stock_quantity || "", image_url: product.image_url || "",
            description: product.description || "", discount_percentage: product.discount_percentage || 0, sales_count: product.sales_count || 0,
            brand: product.brand || "", specifications: product.specifications || "", variants: product.variants || []
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
        deleteMutation.mutate(id);
    };

    const handleAddVariant = () => {
        setNewProduct(prev => ({
            ...prev,
            variants: [...(prev.variants || []), { name: "", price: prev.price || 0, stock_quantity: 0, image_url: "" }]
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...(newProduct.variants || [])];
        if (field === 'price') updated[index][field] = parseFloat(value) || 0;
        else if (field === 'stock_quantity') updated[index][field] = parseInt(value, 10) || 0;
        else updated[index][field] = value;
        setNewProduct({ ...newProduct, variants: updated });
    };

    const handleRemoveVariant = (index) => {
        const updated = (newProduct.variants || []).filter((_, i) => i !== index);
        setNewProduct({ ...newProduct, variants: updated });
    };

    return (
        <div className="animation-fadeIn">
            {/* Context Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50" />
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 whitespace-nowrap"><Database size={16} /> {products.length} Items</div>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setNewProduct({ name: "", category: "", price: "", stock_quantity: "", image_url: "", description: "", discount_percentage: 0, sales_count: 0, brand: "", specifications: "", variants: [] });
                            setIsModalOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-md shadow-red-600/20 whitespace-nowrap"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold">Total Sales</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading inventory database...</td></tr>
                            ) : products.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No products found.</td></tr>
                            ) : products.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase())).map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                                                {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-slate-300">N/A</span>}
                                            </div>
                                            <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 capitalize">{product.category || 'Uncategorized'}</td>
                                    <td className="p-4 font-semibold text-slate-800">Ksh {(product.price || 0).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : product.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-slate-500">{product.sales_count || 0}</td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleEditClick(product)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteClick(product.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
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
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="add-product-form" onSubmit={handleSaveProduct} className="space-y-5">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Product Name *</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label><input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name / Manufacturer</label>
                                        <select value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white">
                                            <option value="">-- No Brand --</option>
                                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-slate-700 mb-1">Price (Ksh) *</label><input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div><div><label className="block text-sm font-semibold text-slate-700 mb-1">Initial Stock *</label><input required type="number" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-slate-700 mb-1">Discount %</label><input type="number" value={newProduct.discount_percentage} onChange={e => setNewProduct({...newProduct, discount_percentage: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div><div><label className="block text-sm font-semibold text-slate-700 mb-1">Total Sales Override (Optional)</label><input type="number" value={newProduct.sales_count} onChange={e => setNewProduct({...newProduct, sales_count: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="Use this to spoof startup sales..." /></div></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label><input type="url" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Specifications (Format as bullet points)</label><textarea value={newProduct.specifications} onChange={e => setNewProduct({...newProduct, specifications: e.target.value})} rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="- Material: Leather&#10;- Weight: 250g&#10;- Warranty: 1 Year"></textarea></div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                    <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-100">
                                        <h3 className="font-bold text-slate-700 text-sm">Product Variants</h3>
                                        <button type="button" onClick={handleAddVariant} className="text-xs font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-600 hover:text-red-600 flex items-center gap-1"><Plus size={12}/> Add Option</button>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {!(newProduct.variants?.length > 0) && <p className="text-xs text-slate-400 italic text-center py-2">No variants created. Product will be sold as a single standard item.</p>}
                                        {(newProduct.variants || []).map((v, i) => (
                                            <div key={i} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm relative">
                                                <button type="button" onClick={() => handleRemoveVariant(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X size={14}/></button>
                                                <div className="grid grid-cols-3 gap-2 pr-6">
                                                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Option Name</label><input type="text" placeholder="e.g. Matte Black" value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)} className="w-full p-1.5 text-xs border rounded focus:ring-1 focus:ring-red-500 outline-none" required /></div>
                                                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Price (Ksh)</label><input type="number" step="0.01" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} className="w-full p-1.5 text-xs border rounded focus:ring-1 focus:ring-red-500 outline-none" required /></div>
                                                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Stock</label><input type="number" value={v.stock_quantity} onChange={e => handleVariantChange(i, 'stock_quantity', e.target.value)} className="w-full p-1.5 text-xs border rounded focus:ring-1 focus:ring-red-500 outline-none" required /></div>
                                                </div>
                                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Specific Image URL (Optional)</label><input type="url" placeholder="https://..." value={v.image_url} onChange={e => handleVariantChange(i, 'image_url', e.target.value)} className="w-full p-1.5 text-xs border rounded focus:ring-1 focus:ring-red-500 outline-none" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50"><button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button><button type="submit" form="add-product-form" disabled={saveMutation.isPending} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">{saveMutation.isPending ? "Saving..." : (editingId ? "Update Product" : "Save Product")}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

