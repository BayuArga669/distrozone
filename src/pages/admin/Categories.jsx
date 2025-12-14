import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    FolderOpen
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory.id, formData);
            } else {
                await adminAPI.createCategory(formData);
            }

            setShowModal(false);
            setEditingCategory(null);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
        try {
            await adminAPI.deleteCategory(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            is_active: true
        });
    };

    const openAddModal = () => {
        setEditingCategory(null);
        resetForm();
        setShowModal(true);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Categories</h1>
                    <p className="text-slate-500">Organize your products into collections</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 transition-all font-medium placeholder-slate-400"
                        />
                    </div>

                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1"
                    >
                        <Plus size={20} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={40} />
                    <p className="text-slate-500 font-medium">Loading categories...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-100 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-purple-500/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="flex items-start justify-between mb-6 relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <FolderOpen className="text-orange-600" size={26} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{category.name}</h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">
                                    {category.description || 'No description provided for this category.'}
                                </p>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                            {category.products_count || 0} Items
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${category.is_active
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${category.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button
                        onClick={openAddModal}
                        className="group bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300 flex flex-col items-center justify-center text-slate-400 hover:text-orange-600"
                    >
                        <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-orange-200 group-hover:shadow-md transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-lg">Create New</span>
                        <span className="text-sm opacity-70">Add a new category</span>
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-t-3xl">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Set up your category details</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium placeholder-slate-400 transition-all"
                                    placeholder="e.g. Summer Collection"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium placeholder-slate-400 transition-all min-h-[100px]"
                                    placeholder="What's this category about?"
                                    rows={3}
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_active ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                        {formData.is_active && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className="flex-1">
                                        <span className="block font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Active Status</span>
                                        <span className="text-xs text-slate-500">Visible to customers in store</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 hover:shadow-orange-500/20 active:scale-[0.98] mt-2"
                            >
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
