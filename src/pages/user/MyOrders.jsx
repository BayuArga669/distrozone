import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { Loader2, Package, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderAPI.getOrders();
            setOrders(data.data || data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'unpaid': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'unpaid': return 'Unpaid Order';
            case 'paid': return 'Paid';
            case 'expired': return 'Expired Order';
            case 'processing': return 'Processing';
            case 'shipped': return 'Shipped';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            case 'pending': return 'Unpaid Order';
            default: return status || 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <div className="container max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
                    <Link to="/shop" className="text-orange-500 font-bold hover:underline">
                        Continue Shopping
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
                        <p className="text-slate-500 mb-8">Looks like you haven't made any purchases yet.</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                                            <p className="font-mono font-bold text-slate-900 text-lg">#{order.order_number || order.id}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide w-fit`}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Date Placed</p>
                                            <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Total Items</p>
                                            <p className="font-medium text-slate-900">{order.items_count || order.items?.length || 0} Items</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Total Amount</p>
                                            <p className="font-bold text-orange-500">Rp {Number(order.total || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-orange-500 transition-colors"
                                    >
                                        View Order Details
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
