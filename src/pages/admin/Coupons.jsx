import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, X, Ticket } from 'lucide-react';
import { adminAPI } from '../../services/api';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        min_order: 0,
        max_uses: '',
        expires_at: '',
        is_active: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, [searchQuery]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const params = searchQuery ? { search: searchQuery } : {};
            const data = await adminAPI.getCoupons(params);
            setCoupons(data.data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                min_order: parseFloat(formData.min_order) || 0,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
            };

            if (editingCoupon) {
                await adminAPI.updateCoupon(editingCoupon.id, payload);
            } else {
                await adminAPI.createCoupon(payload);
            }

            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kupon ini?')) return;
        try {
            await adminAPI.deleteCoupon(id);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert(error.message);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_order: coupon.min_order || 0,
            max_uses: coupon.max_uses || '',
            expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] + 'T' + coupon.expires_at.split('T')[1].substr(0, 5) : '',
            is_active: coupon.is_active,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            min_order: 0,
            max_uses: '',
            expires_at: '',
            is_active: true,
        });
        setEditingCoupon(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Coupons</h1>
                    <p className="text-slate-500">Manage discount coupons and promotional codes</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search coupons..."
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
                        <span>Add Coupon</span>
                    </button>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-500" size={40} />
                        <p className="text-slate-500 font-medium">Loading coupons...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                                    <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Usage</th>
                                    <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Expires</th>
                                    <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.length > 0 ? (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Ticket size={20} className="text-orange-600" />
                                                    </div>
                                                    <span className="font-bold text-slate-900 font-mono">{coupon.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${coupon.type === 'percentage' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                    {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900">
                                                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">
                                                    {coupon.used_count} / {coupon.max_uses || '∞'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {coupon.expires_at ? (
                                                    <span className="text-sm text-slate-600">
                                                        {new Date(coupon.expires_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">No expiry</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
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
                                        <td colSpan="7" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Ticket size={48} className="mb-4 text-slate-300" />
                                                <p className="font-medium text-lg">No coupons found</p>
                                                <p className="text-sm">Create your first coupon to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Fill in the coupon details</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Coupon Code *</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-bold font-mono uppercase tracking-wider placeholder-slate-400 transition-all"
                                        placeholder="e.g. SAVE20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Discount Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        required
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Value * {formData.type === 'percentage' && '(%)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        placeholder="0"
                                        min="0"
                                        max={formData.type === 'percentage' ? 100 : undefined}
                                        step={formData.type === 'percentage' ? '1' : '1000'}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Min. Order (IDR)</label>
                                    <input
                                        type="number"
                                        value={formData.min_order}
                                        onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        placeholder="0"
                                        min="0"
                                        step="1000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Uses (leave empty for unlimited)</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-medium transition-all"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center gap-3 pt-4 border-t border-slate-100">
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
                                        <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Active Coupon</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 hover:shadow-orange-500/20 active:scale-[0.98]"
                                >
                                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
