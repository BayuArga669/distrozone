import React, { useState, useEffect } from 'react';
import { adminAPI, getImageUrl } from '../../services/api';
import { Plus, Trash2, Save, Loader2, X, Palette, Package, Upload, Image as ImageIcon, Edit } from 'lucide-react';

const VariantManager = ({ productId, productName, onClose }) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [formData, setFormData] = useState({
        color: '',
        color_hex: '#6366f1',
        image: '',
        size: '',
        stock: 0,
        price_adjustment: 0,
        sku: '',
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const presetColors = [
        { name: 'Black', hex: '#1e293b' },
        { name: 'White', hex: '#f8fafc' },
        { name: 'Red', hex: '#ef4444' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Yellow', hex: '#eab308' },
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Pink', hex: '#ec4899' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Gray', hex: '#6b7280' },
    ];

    useEffect(() => {
        if (productId) {
            fetchVariants();
        }
    }, [productId]);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getVariants(productId);
            setVariants(data.variants || []);
        } catch (error) {
            console.error('Error fetching variants:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            color: '',
            color_hex: '#6366f1',
            image: '',
            size: '',
            stock: 0,
            price_adjustment: 0,
            sku: '',
        });
        setEditingVariant(null);
    };

    const handleSubmit = async () => {
        if (!formData.color) {
            alert('Warna harus diisi');
            return;
        }
        if (!formData.size) {
            alert('Ukuran harus diisi');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                stock: parseInt(formData.stock) || 0,
                price_adjustment: parseFloat(formData.price_adjustment) || 0,
            };

            if (editingVariant) {
                await adminAPI.updateVariant(productId, editingVariant.id, payload);
            } else {
                await adminAPI.createVariant(productId, payload);
            }

            await fetchVariants();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving variant:', error);
            alert('Gagal menyimpan variant: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (variant) => {
        setEditingVariant(variant);
        setFormData({
            color: variant.color || '',
            color_hex: variant.color_hex || '#6366f1',
            image: variant.image || '',
            size: variant.size || '',
            stock: variant.stock || 0,
            price_adjustment: variant.price_adjustment || 0,
            sku: variant.sku || '',
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
    };

    const handleDeleteVariant = async (variantId) => {
        if (!confirm('Hapus variant ini?')) return;

        try {
            await adminAPI.deleteVariant(productId, variantId);
            setVariants(prev => prev.filter(v => v.id !== variantId));
        } catch (error) {
            console.error('Error deleting variant:', error);
            alert('Gagal menghapus variant: ' + error.message);
        }
    };

    const selectPresetColor = (color) => {
        setFormData(prev => ({
            ...prev,
            color: color.name,
            color_hex: color.hex,
        }));
    };

    const handleVariantImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const result = await adminAPI.uploadImage(file, 'variants');
            setFormData(prev => ({ ...prev, image: result.url }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    // Group variants by color
    const groupedVariants = variants.reduce((acc, variant) => {
        if (!acc[variant.color]) {
            acc[variant.color] = {
                color: variant.color,
                color_hex: variant.color_hex,
                sizes: [],
            };
        }
        acc[variant.color].sizes.push(variant);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Manage Variants</h2>
                        <p className="text-sm text-slate-500">{productName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-orange-500" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Existing Variants */}
                            {Object.values(groupedVariants).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.values(groupedVariants).map((colorGroup) => (
                                        <div key={colorGroup.color} className="border border-slate-200 rounded-xl overflow-hidden">
                                            {/* Color Header */}
                                            <div className="bg-slate-50 px-4 py-3 flex items-center gap-3">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: colorGroup.color_hex || '#94a3b8' }}
                                                />
                                                <span className="font-bold text-slate-900">{colorGroup.color}</span>
                                                <span className="text-sm text-slate-500">
                                                    ({colorGroup.sizes.length} size{colorGroup.sizes.length > 1 ? 's' : ''})
                                                </span>
                                            </div>

                                            {/* Sizes Table */}
                                            <table className="w-full">
                                                <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Image</th>
                                                        <th className="px-4 py-2 text-left">Size</th>
                                                        <th className="px-4 py-2 text-left">Stock</th>
                                                        <th className="px-4 py-2 text-left">Price Adj.</th>
                                                        <th className="px-4 py-2 text-left">SKU</th>
                                                        <th className="px-4 py-2 text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {colorGroup.sizes.map((variant) => (
                                                        <tr key={variant.id} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3">
                                                                {variant.image ? (
                                                                    <img
                                                                        src={getImageUrl(variant.image)}
                                                                        alt={variant.color}
                                                                        className="w-10 h-10 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                                        <ImageIcon size={16} className="text-slate-400" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium">{variant.size || '-'}</td>
                                                            <td className="px-4 py-3">{variant.stock}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {parseFloat(variant.price_adjustment) > 0
                                                                    ? `+Rp ${Number(variant.price_adjustment).toLocaleString('id-ID')}`
                                                                    : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                                                                {variant.sku || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        onClick={() => handleEdit(variant)}
                                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteVariant(variant.id)}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl">
                                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Belum ada variant</p>
                                    <p className="text-sm text-slate-400">Tambah variant untuk mengatur warna, ukuran, dan stok</p>
                                </div>
                            )}

                            {/* Add/Edit Form */}
                            {showForm ? (
                                <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 bg-orange-50/50">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        {editingVariant ? <Edit size={18} /> : <Plus size={18} />}
                                        {editingVariant ? 'Edit Variant' : 'Tambah Variant Baru'}
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {/* Color Selection */}
                                        <div className="col-span-2 md:col-span-3">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Pilih Warna
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {presetColors.map((color) => (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => selectPresetColor(color)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.name
                                                            ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110'
                                                            : 'border-slate-200 hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: color.hex }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nama warna (mis: Hijau Army)"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                                <input
                                                    type="color"
                                                    value={formData.color_hex}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, color_hex: e.target.value }))}
                                                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Size */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Ukuran *</label>
                                            <select
                                                value={formData.size}
                                                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="">Pilih ukuran</option>
                                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        {/* Stock */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Stok</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                min="0"
                                            />
                                        </div>

                                        {/* Price Adjustment */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tambahan Harga</label>
                                            <input
                                                type="number"
                                                value={formData.price_adjustment}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price_adjustment: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* SKU */}
                                        <div className="col-span-2 md:col-span-3">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">SKU (opsional)</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                placeholder="SKU-001"
                                            />
                                        </div>

                                        {/* Variant Image */}
                                        <div className="col-span-2 md:col-span-3">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Gambar Variant (opsional)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                {formData.image ? (
                                                    <div className="relative">
                                                        <img
                                                            src={getImageUrl(formData.image)}
                                                            alt="Preview"
                                                            className="w-20 h-20 rounded-lg object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleVariantImageUpload}
                                                            className="hidden"
                                                            disabled={uploadingImage}
                                                        />
                                                        {uploadingImage ? (
                                                            <Loader2 size={20} className="animate-spin text-orange-500" />
                                                        ) : (
                                                            <>
                                                                <Upload size={16} className="text-slate-400" />
                                                                <span className="text-[10px] text-slate-400 mt-1">Upload</span>
                                                            </>
                                                        )}
                                                    </label>
                                                )}
                                                <p className="text-xs text-slate-500">
                                                    Gambar khusus untuk variant ini
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {editingVariant ? 'Update Variant' : 'Simpan Variant'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); resetForm(); }}
                                            className="px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddNew}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Tambah Variant
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantManager;
