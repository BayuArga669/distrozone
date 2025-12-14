import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI, getImageUrl } from '../../services/api';
import { Loader2, Package, CreditCard, ChevronLeft, Calendar, Truck, AlertCircle, FileDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paying, setPaying] = useState(false);
    const [snapLoaded, setSnapLoaded] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    // Load Midtrans Snap script
    useEffect(() => {
        const loadSnapScript = async () => {
            if (window.snap) {
                setSnapLoaded(true);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/payments/client-key`);
                const data = await response.json();

                const script = document.createElement('script');
                script.src = data.is_production
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', data.client_key);
                script.async = true;
                script.onload = () => setSnapLoaded(true);
                document.body.appendChild(script);
            } catch (err) {
                console.error('Failed to load Midtrans script:', err);
            }
        };

        loadSnapScript();
    }, []);

    const fetchOrder = useCallback(async () => {
        try {
            const data = await orderAPI.getOrder(id);
            setOrder(data.data || data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Gagal memuat detail pesanan');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handlePayNow = () => {
        if (!order?.snap_token || !snapLoaded) {
            setError('Payment tidak tersedia. Silakan coba lagi.');
            return;
        }

        setPaying(true);

        window.snap.pay(order.snap_token, {
            onSuccess: function (result) {
                console.log('Payment success:', result);
                setPaying(false);
                fetchOrder();
                navigate('/orders');
            },
            onPending: function (result) {
                console.log('Payment pending:', result);
                setPaying(false);
                fetchOrder();
            },
            onError: function (result) {
                console.log('Payment error:', result);
                setPaying(false);
                setError('Pembayaran gagal. Silakan coba lagi.');
            },
            onClose: function () {
                console.log('Payment popup closed');
                setPaying(false);
            }
        });
    };

    const handleDownloadInvoice = async () => {
        try {
            setDownloadingInvoice(true);
            await orderAPI.downloadInvoice(order.id);
        } catch (err) {
            console.error('Error downloading invoice:', err);
            setError('Gagal mengunduh invoice. Silakan coba lagi.');
        } finally {
            setDownloadingInvoice(false);
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
            default: return status || 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (amount) => {
        return Number(amount || 0).toLocaleString('id-ID');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl inline-block mb-4">
                        {error || 'Pesanan tidak ditemukan'}
                    </div>
                    <div>
                        <Link to="/orders" className="text-orange-500 font-bold hover:underline">
                            Kembali ke Pesanan Saya
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container max-w-4xl px-4 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/orders" className="inline-flex items-center text-slate-500 hover:text-orange-500 font-medium mb-4 transition-colors">
                        <ChevronLeft size={20} className="mr-1" />
                        Back to My Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Order Details</h1>
                            <p className="text-slate-500 font-mono">#{order.order_number || order.id}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold border ${getStatusColor(order.status)} uppercase tracking-wide text-sm self-start`}>
                            {getStatusLabel(order.status)}
                        </div>
                    </div>
                </div>

                {/* Unpaid Alert */}
                {order.status === 'unpaid' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                        <div className="flex-1">
                            <p className="font-bold text-yellow-800">Pesanan belum dibayar</p>
                            <p className="text-sm text-yellow-700">Segera lakukan pembayaran agar pesanan dapat diproses.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Package className="text-orange-500" size={20} />
                                Order Items
                            </h2>
                            <div className="space-y-6">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.product?.image) || 'https://placehold.co/100x100?text=No+Image'}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 line-clamp-2">{item.product?.name}</h3>
                                            {(item.variant?.color || item.variant?.size) && (
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {item.variant?.color && <span className="mr-3">Color: {item.variant.color}</span>}
                                                    {item.variant?.size && <span>Size: {item.variant.size}</span>}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-sm text-slate-500">{item.quantity} x Rp {formatPrice(item.price)}</p>
                                                <p className="font-bold text-slate-900">Rp {formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Truck className="text-orange-500" size={20} />
                                Shipping Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Recipient</p>
                                    <p className="font-bold text-slate-900">{order.shipping_address?.name}</p>
                                    <p className="text-slate-600">{order.shipping_address?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Delivery Address</p>
                                    <p className="text-slate-600">{order.shipping_address?.address}</p>
                                    <p className="text-slate-600">
                                        {order.shipping_address?.city}, {order.shipping_address?.postal_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Summary & Payment */}
                    <div className="space-y-6">
                        {/* Order Timeline/Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Info</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-slate-400 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Order Date</p>
                                        <p className="text-sm text-slate-900">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="text-slate-400 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Payment Method</p>
                                        <p className="text-sm text-slate-900 uppercase">{order.payment_method?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
                            <div className="space-y-3 pb-6 border-b border-slate-100">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>Rp {formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping Cost</span>
                                    <span>Rp {formatPrice(order.shipping_cost)}</span>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="font-black text-xl text-orange-500">Rp {formatPrice(order.total)}</span>
                            </div>

                            {/* Pay Now Button for Unpaid Orders */}
                            {order.status === 'unpaid' && order.snap_token && (
                                <button
                                    onClick={handlePayNow}
                                    disabled={paying || !snapLoaded}
                                    className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                                >
                                    {paying ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Pay Now - Rp {formatPrice(order.total)}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Message for Expired Orders */}
                            {order.status === 'expired' && (
                                <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">
                                    Pesanan ini sudah expired. Silakan buat pesanan baru.
                                </div>
                            )}

                            {/* Download Invoice Button for Paid Orders */}
                            {['paid', 'processing', 'shipped', 'completed'].includes(order.status) && (
                                <button
                                    onClick={handleDownloadInvoice}
                                    disabled={downloadingInvoice}
                                    className="w-full mt-4 border-2 border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>
        </div>
    );
};

export default OrderDetail;
