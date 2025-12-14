import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Star, Loader2 } from 'lucide-react';
import { addressAPI } from '../../services/api';
import AddressForm from '../../components/AddressForm';

const MyAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressAPI.getAddresses();
            setAddresses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await addressAPI.deleteAddress(id);
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressAPI.setDefaultAddress(id);
            setAddresses(addresses.map(addr => ({
                ...addr,
                is_default: addr.id === id
            })));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">My Addresses</h1>
                    <p className="text-slate-500">Manage your shipping addresses</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mb-6 flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Add New Address
                </button>

                {showForm && (
                    <div className="mb-8">
                        <AddressForm
                            address={editingAddress}
                            onClose={handleFormClose}
                        />
                    </div>
                )}

                {addresses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No addresses yet</h3>
                        <p className="text-slate-500 mb-6">Add your first address to make checkout easier</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${address.is_default
                                    ? 'border-orange-500 shadow-orange-500/10'
                                    : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-orange-500" size={20} />
                                        <h3 className="font-bold text-slate-900">{address.label}</h3>
                                        {address.is_default && (
                                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                <Star size={12} fill="currentColor" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-slate-900 font-semibold">{address.recipient_name}</p>
                                    <p className="text-slate-600 text-sm">{address.phone}</p>
                                    <p className="text-slate-600 text-sm">{address.address}</p>
                                    <p className="text-slate-600 text-sm">
                                        {address.city}, {address.province} {address.postal_code}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    {!address.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="flex-1 text-sm font-bold text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="flex items-center gap-1 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAddresses;
