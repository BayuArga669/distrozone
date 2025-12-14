import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    X,
    FileDown
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const getStatusColor = (status) => {
    const colors = {
        'completed': 'bg-emerald-100 text-emerald-700',
        'processing': 'bg-blue-100 text-blue-700',
        'pending': 'bg-yellow-100 text-yellow-700',
        'shipped': 'bg-purple-100 text-purple-700',
        'paid': 'bg-emerald-100 text-emerald-700',
        'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
};

const getPaymentStatusColor = (payment) => {
    if (!payment) return 'text-slate-600';
    const colors = {
        'success': 'text-emerald-600',
        'pending': 'text-yellow-600',
        'failed': 'text-red-600',
        'expired': 'text-red-600',
    };
    return colors[payment.status] || 'text-slate-600';
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    const statuses = ['', 'pending', 'processing', 'paid', 'shipped', 'completed', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, searchQuery]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, per_page: 10 };
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;
            const data = await adminAPI.getOrders(params);
            setOrders(data.data || []);
            setTotalPages(data.last_page || 1);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.message);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            setDownloadingInvoice(true);
            await adminAPI.downloadInvoice(orderId);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Orders</h1>
                    <p className="text-slate-500">Monitor and manage customer orders</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 transition-all font-medium placeholder-slate-400"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 appearance-none pl-4 pr-10 py-3 rounded-xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="">All Status</option>
                            {statuses.filter(s => s).map(status => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-500" size={40} />
                        <p className="text-slate-500 font-medium">Loading orders...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                                        <th className="text-left px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                                                        #{order.order_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {(order.user?.name || 'G')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{order.user?.name || 'Guest'}</p>
                                                            <p className="text-xs text-slate-500">{order.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-slate-600">{order.items?.length || 0} items</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900">{formatPrice(order.total)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative group/status inline-block">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 outline-none transition-all ${getStatusColor(order.status)}`}
                                                        >
                                                            {statuses.filter(s => s).map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                                            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-bold capitalize ${getPaymentStatusColor(order.payment)}`}>
                                                        {order.payment?.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                        <Search size={24} className="text-slate-300" />
                                                    </div>
                                                    <p className="font-medium text-lg">No orders found</p>
                                                    <p className="text-sm">Try adjusting your filters</p>
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    Order #{selectedOrder.order_number}
                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <X size={24} className="lucide-x" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Customer Info
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 text-lg">{selectedOrder.user?.name || 'Guest'}</p>
                                        <p className="text-slate-500 font-medium">{selectedOrder.user?.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                        Shipping Address
                                    </h3>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-bold text-slate-900">{selectedOrder.shipping_address?.name}</p>
                                        <p>{selectedOrder.shipping_address?.phone}</p>
                                        <p>{selectedOrder.shipping_address?.address}</p>
                                        <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postal_code}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Order Items</h3>
                                <div className="border rounded-2xl border-slate-100 overflow-hidden">
                                    <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase flex justify-between">
                                        <span>Product</span>
                                        <span>Subtotal</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {selectedOrder.items?.map(item => (
                                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                                        {/* Placeholder for image if available */}
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                            IMG
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{item.product?.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                            {formatPrice(item.price)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg shadow-slate-900/10">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-slate-400 text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-white">{formatPrice(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 text-sm">
                                        <span>Shipping</span>
                                        <span className="font-medium text-white">{formatPrice(selectedOrder.shipping_cost)}</span>
                                    </div>
                                    <div className="border-t border-slate-700 pt-3 mt-3 flex justify-between items-center">
                                        <span className="font-bold">Total Amount</span>
                                        <span className="text-2xl font-black text-orange-500">{formatPrice(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Download Invoice Button */}
                            {['paid', 'processing', 'shipped', 'completed'].includes(selectedOrder.status) && (
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                    disabled={downloadingInvoice}
                                    className="w-full border-2 border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {downloadingInvoice ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={18} />
                                            Download Invoice
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
