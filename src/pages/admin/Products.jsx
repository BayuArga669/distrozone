import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Edit,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    Upload,
    Image as ImageIcon,
    Palette,
    Package
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import VariantManager from '../../components/admin/VariantManager';
import MultipleImageUpload from '../../components/admin/MultipleImageUpload';

const getStatusColor = (stock, isActive) => {
    if (!isActive) return 'bg-slate-100 text-slate-700';
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-emerald-100 text-emerald-700';
};

const getStatusText = (stock, isActive) => {
    if (!isActive) return 'Draft';
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'Active';
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        description: '',
        price: '',
        cost_price: '',
        stock: '',
        color: '#cbd5e1',
        gender: 'unisex',
        image: '',
        images: [],
        is_active: true,
        is_featured: false
    });
    const [uploading, setUploading] = useState(false);
    const [variantProduct, setVariantProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [currentPage, searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, per_page: 10 };
            if (searchQuery) params.search = searchQuery;
            const data = await adminAPI.getProducts(params);
            setProducts(data.data || []);
            setTotalPages(data.last_page || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await adminAPI.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
                stock: parseInt(formData.stock),
                category_id: parseInt(formData.category_id)
            };

            if (editingProduct) {
                await adminAPI.updateProduct(editingProduct.id, payload);
            } else {
                await adminAPI.createProduct(payload);
            }

            setShowModal(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        // Prepare images array: use existing images or create from single image
        let productImages = product.images || [];
        if (productImages.length === 0 && product.image) {
            productImages = [product.image];
        }

        setFormData({
            name: product.name,
            category_id: product.category_id,
            description: product.description || '',
            price: product.price,
            cost_price: product.cost_price || '',
            stock: product.stock,
            color: product.color || '#cbd5e1',
            gender: product.gender || 'unisex',
            image: product.image || '',
            images: productImages,
            is_active: product.is_active,
            is_featured: product.is_featured
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            await adminAPI.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category_id: '',
            description: '',
            price: '',
            cost_price: '',
            stock: '',
            color: '#cbd5e1',
            gender: 'unisex',
            image: '',
            images: [],
            is_active: true,
            is_featured: false
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        try {
            setUploading(true);
            const result = await adminAPI.uploadImage(file, 'products');
            setFormData(prev => ({ ...prev, image: result.url }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Products</h1>
                    <p className="text-slate-500">Manage your product inventory and catalog</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
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
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-500" size={40} />
                        <p className="text-slate-500 font-medium">Loading products...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-orange-200 transition-colors">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="w-full h-full flex items-center justify-center"
                                                                    style={{ backgroundColor: product.color || '#cbd5e1' }}
                                                                >
                                                                    <ImageIcon size={20} className="text-black/20" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{product.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-slate-400 capitalize">{product.gender}</span>
                                                                {product.is_featured && (
                                                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">Featured</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                                                        {product.category?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-slate-600">{product.stock} units</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.stock, product.is_active)}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        {getStatusText(product.stock, product.is_active)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                        <button
                                                            onClick={() => setVariantProduct(product)}
                                                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-sm"
                                                            title="Manage Variants"
                                                        >
                                                            <Palette size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <Package size={48} className="mb-4 text-slate-300" />
                                                    <p className="font-medium text-lg">No products found</p>
                                                    <p className="text-sm">Try tweaking your search or add a new product</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
                            <span className="text-sm font-medium text-slate-500">
                                Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingProduct ? 'Edit Product' : 'New Product'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Fill in the details below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium placeholder-slate-400 transition-all"
                                        placeholder="e.g. Premium Cotton T-Shirt"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        required
                                    >
                                        <option value="unisex">Unisex</option>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium placeholder-slate-400 transition-all min-h-[120px]"
                                        placeholder="Describe your product..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual (IDR) *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Harga Beli (IDR)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <input
                                            type="number"
                                            value={formData.cost_price}
                                            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Untuk perhitungan margin profit</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Images</label>
                                    <MultipleImageUpload
                                        images={formData.images || []}
                                        onImagesChange={(images) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                images: images,
                                                image: images[0] || ''
                                            }));
                                        }}
                                        maxImages={5}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Color Label</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-12 h-12 rounded-xl border cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                            {formData.color}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-2 flex items-center gap-6 pt-4 border-t border-slate-100">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_active ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                            {formData.is_active && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Active Status</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_featured ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                            {formData.is_featured && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Featured Product</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 hover:shadow-orange-500/20 active:scale-[0.98]"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Variant Manager Modal */}
            {variantProduct && (
                <VariantManager
                    productId={variantProduct.id}
                    productName={variantProduct.name}
                    onClose={() => setVariantProduct(null)}
                />
            )}
        </div>
    );
};

export default Products;
