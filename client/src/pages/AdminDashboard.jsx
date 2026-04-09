import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProducts, insertProduct } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Database, Plus, Search, Edit2, Trash2, ShieldCheck, X } from "lucide-react";

const AdminDashboard = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        price: "",
        stock_quantity: "",
        image_url: "",
        description: "",
        discount_percentage: 0
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile?.role !== 'admin') {
            toast.error("Unauthorized: Admin access restricted.");
            navigate("/");
            return;
        }

        const fetchInventory = async () => {
            const data = await getProducts();
            setProducts(data);
            setLoading(false);
        };
        
        fetchInventory();
    }, [profile, navigate]);

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const productToSave = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock_quantity: parseInt(newProduct.stock_quantity, 10),
                discount_percentage: parseFloat(newProduct.discount_percentage) || 0
            };
            const inserted = await insertProduct(productToSave);
            setProducts([inserted, ...products]);
            setIsModalOpen(false);
            toast.success("Product added to inventory!");
            setNewProduct({ name: "", category: "", price: "", stock_quantity: "", image_url: "", description: "", discount_percentage: 0 });
        } catch (err) {
             toast.error(err.message || "Failed to add product");
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = products.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase()));

    if (profile?.role !== 'admin') return null;

    return (
        <div className="container py-8 max-w-7xl font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={32} className="text-red-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Admin Portal</h1>
                        <p className="text-slate-400 text-sm">System Management & Inventory Control</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Inventory Controls */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                    />
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Database size={16} /> {products.length} Items Total
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading inventory database...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No products found.</td></tr>
                            ) : filtered.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : <span className="flex h-full items-center justify-center text-xs text-slate-300">N/A</span>}
                                            </div>
                                            <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 capitalize">{product.category || 'Uncategorized'}</td>
                                    <td className="p-4 font-semibold text-slate-800">${(product.price || 0).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            product.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
                                            product.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {product.stock_quantity} IN STOCK
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-500 p-2 transition-colors"><Edit2 size={16} /></button>
                                        <button className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="add-product-form" onSubmit={handleSaveProduct} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name *</label>
                                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                                        <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Price ($) *</label>
                                        <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Stock *</label>
                                        <input required type="number" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Discount %</label>
                                        <input type="number" value={newProduct.discount_percentage} onChange={e => setNewProduct({...newProduct, discount_percentage: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
                                    <input type="url" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
                            <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" form="add-product-form" disabled={isSaving} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                {isSaving ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
