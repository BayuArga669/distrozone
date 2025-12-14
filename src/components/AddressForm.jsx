import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addressAPI } from '../services/api';

const AddressForm = ({ address = null, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Location Data - Same as Checkout
    const locationData = {
        'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
        'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cirebon', 'Tasikmalaya', 'Sukabumi', 'Karawang', 'Garut', 'Cianjur'],
        'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon'],
        'Jawa Tengah': ['Semarang', 'Solo', 'Surakarta', 'Magelang', 'Tegal', 'Pekalongan', 'Purwokerto', 'Kudus', 'Kebumen'],
        'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul', 'Gunungkidul', 'Kulonprogo'],
        'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Banyuwangi', 'Kediri', 'Madiun', 'Jember', 'Pasuruan', 'Mojokerto']
    };

    const [formData, setFormData] = useState({
        label: address?.label || 'Home',
        recipient_name: address?.recipient_name || '',
        phone: address?.phone || '',
        address: address?.address || '',
        city: address?.city || '',
        province: address?.province || '',
        postal_code: address?.postal_code || '',
        is_default: address?.is_default || false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            // Reset city if province changes
            if (name === 'province') {
                return { ...prev, [name]: value, city: '' };
            }
            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (address) {
                await addressAPI.updateAddress(address.id, formData);
            } else {
                await addressAPI.createAddress(formData);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    {address ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={20} className="text-slate-500" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Label
                    </label>
                    <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="e.g., Home, Office"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Recipient Name
                        </label>
                        <input
                            type="text"
                            name="recipient_name"
                            value={formData.recipient_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Address
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="Street name, building, house number, etc."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Province
                        </label>
                        <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Select Province</option>
                            {Object.keys(locationData).map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            City
                        </label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                            required
                            disabled={!formData.province}
                        >
                            <option value="">Select City</option>
                            {formData.province && locationData[formData.province].map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Postal Code
                    </label>
                    <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="12345"
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="is_default"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-orange-500 text-orange-500"
                    />
                    <label htmlFor="is_default" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Set as default address
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            address ? 'Update Address' : 'Save Address'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
