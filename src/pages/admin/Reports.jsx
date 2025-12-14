import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart,
    Package, Download, Loader2, Calendar, RefreshCw, CreditCard,
    ArrowUpRight, ArrowDownRight, Percent, Users, CheckCircle, Clock,
    XCircle, Truck, AlertCircle
} from 'lucide-react';
import { adminAPI, getImageUrl } from '../../services/api';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Date range state
    const [dateRange, setDateRange] = useState('this_month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const presets = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'this_week', label: 'Minggu Ini' },
        { id: 'this_month', label: 'Bulan Ini' },
        { id: 'last_30', label: '30 Hari' },
        { id: 'this_year', label: 'Tahun Ini' },
        { id: 'custom', label: 'Custom' },
    ];

    const getDateRange = (preset) => {
        const now = new Date();
        let start, end;

        switch (preset) {
            case 'today':
                start = end = now.toISOString().split('T')[0];
                break;
            case 'this_week':
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                start = new Date(now.setDate(diff)).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'last_30':
                start = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            default:
                return { start: startDate, end: endDate };
        }
        return { start, end };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { start, end } = dateRange === 'custom' ? { start: startDate, end: endDate } : getDateRange(dateRange);

            const [summaryData, chartRes, productsData, categoriesData, paymentData, statusData] = await Promise.all([
                adminAPI.getReportSummary(start, end),
                adminAPI.getReportChart(start, end),
                adminAPI.getReportProducts(start, end, 10),
                adminAPI.getReportCategories(start, end),
                adminAPI.getReportPaymentMethods(start, end),
                adminAPI.getReportOrderStatus(start, end),
            ]);

            setSummary(summaryData);
            setChartData(chartRes.data || []);
            setTopProducts(productsData);
            setCategories(categoriesData);
            setPaymentMethods(paymentData);
            setOrderStatus(statusData);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange !== 'custom' || (startDate && endDate)) {
            fetchData();
        }
    }, [dateRange, startDate, endDate]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const { start, end } = dateRange === 'custom' ? { start: startDate, end: endDate } : getDateRange(dateRange);
            await adminAPI.exportReportCSV(start, end);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal export laporan');
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num || 0);
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock size={16} className="text-yellow-500" />,
            paid: <CreditCard size={16} className="text-blue-500" />,
            processing: <Package size={16} className="text-purple-500" />,
            shipped: <Truck size={16} className="text-cyan-500" />,
            completed: <CheckCircle size={16} className="text-emerald-500" />,
            cancelled: <XCircle size={16} className="text-red-500" />,
        };
        return icons[status] || <AlertCircle size={16} />;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-blue-100 text-blue-700',
            processing: 'bg-purple-100 text-purple-700',
            shipped: 'bg-cyan-100 text-cyan-700',
            completed: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    // Hovered chart item
    const [hoveredBar, setHoveredBar] = useState(null);

    // Chart renderer
    const renderChart = () => {
        if (!chartData.length) return null;
        const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

        return (
            <div className="relative">
                {/* Tooltip - Fixed position based on hovered bar */}
                {hoveredBar !== null && chartData[hoveredBar] && (
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl z-50"
                        style={{ pointerEvents: 'none' }}
                    >
                        <p className="font-bold text-sm mb-1">{chartData[hoveredBar].label}</p>
                        <div className="space-y-1">
                            <p className="flex justify-between gap-4">
                                <span className="text-slate-400">Revenue:</span>
                                <span className="font-bold">{formatCurrency(chartData[hoveredBar].revenue)}</span>
                            </p>
                            {chartData[hoveredBar].profit !== undefined && (
                                <p className="flex justify-between gap-4">
                                    <span className="text-emerald-400">Profit:</span>
                                    <span className="font-bold text-emerald-400">{formatCurrency(chartData[hoveredBar].profit)}</span>
                                </p>
                            )}
                            <p className="flex justify-between gap-4">
                                <span className="text-slate-400">Orders:</span>
                                <span>{chartData[hoveredBar].orders || 0}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Chart Bars */}
                <div className="flex items-end gap-1 h-48 mt-16">
                    {chartData.map((item, idx) => {
                        const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                        const hasData = item.revenue > 0;

                        return (
                            <div
                                key={idx}
                                className="flex-1 flex flex-col items-center cursor-pointer"
                                onMouseEnter={() => setHoveredBar(idx)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                <div
                                    className={`w-full rounded-t transition-all ${hasData
                                            ? hoveredBar === idx
                                                ? 'bg-gradient-to-t from-orange-600 to-amber-500'
                                                : 'bg-gradient-to-t from-orange-500 to-amber-400'
                                            : 'bg-slate-200'
                                        }`}
                                    style={{
                                        height: hasData ? `${Math.max(heightPercent, 8)}%` : '4px',
                                        minHeight: hasData ? '20px' : '4px'
                                    }}
                                />
                                <span className={`text-[9px] mt-1 truncate w-full text-center ${hoveredBar === idx ? 'text-orange-600 font-bold' : 'text-slate-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Laporan Penjualan</h1>
                    <p className="text-slate-500 text-sm">Analisis performa penjualan toko Anda</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Range */}
                    <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                        {presets.slice(0, 4).map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setDateRange(preset.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === preset.id
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <div className="flex items-center gap-1">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
                            <span className="text-slate-400">-</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
                        </div>
                    )}

                    <button onClick={fetchData} disabled={loading} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExport} disabled={exporting || loading} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                </div>
            ) : (
                <>
                    {/* Summary Cards - Row 1: Revenue & Profit */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign size={20} className="text-emerald-600" /></div>
                                {summary?.revenue_change !== 0 && (
                                    <div className={`flex items-center gap-0.5 text-xs font-bold ${summary?.revenue_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {summary?.revenue_change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {Math.abs(summary?.revenue_change || 0)}%
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mb-0.5">Total Revenue</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(summary?.total_revenue)}</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-lg text-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-white/20 rounded-lg"><TrendingUp size={20} /></div>
                                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">{summary?.profit_margin || 0}%</span>
                            </div>
                            <p className="text-xs text-emerald-100 mb-0.5">Gross Profit</p>
                            <p className="text-xl font-black">{formatCurrency(summary?.gross_profit)}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg"><ShoppingCart size={20} className="text-blue-600" /></div>
                                {summary?.orders_change !== 0 && (
                                    <div className={`flex items-center gap-0.5 text-xs font-bold ${summary?.orders_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {summary?.orders_change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {Math.abs(summary?.orders_change || 0)}%
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mb-0.5">Total Orders</p>
                            <p className="text-xl font-black text-slate-900">{formatNumber(summary?.total_orders)}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3"><BarChart3 size={20} className="text-purple-600" /></div>
                            <p className="text-xs text-slate-500 mb-0.5">Avg Order Value</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(summary?.avg_order_value)}</p>
                        </div>
                    </div>

                    {/* Summary Cards - Row 2: Additional Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg"><Package size={18} className="text-orange-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Items Sold</p>
                                <p className="text-lg font-bold text-slate-900">{formatNumber(summary?.total_items_sold)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg"><Percent size={18} className="text-red-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Total Diskon</p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(summary?.total_discount)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 rounded-lg"><Truck size={18} className="text-cyan-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Total Shipping</p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(summary?.total_shipping)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><DollarSign size={18} className="text-slate-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Total Cost</p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(summary?.total_cost)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp size={18} className="text-emerald-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500">Profit Margin</p>
                                <p className="text-lg font-bold text-emerald-600">{summary?.profit_margin || 0}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sales Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-visible">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Tren Penjualan</h3>
                            <p className="text-xs text-slate-500 mb-4">Revenue harian (hover untuk detail profit)</p>
                            {chartData.length > 0 ? renderChart() : (
                                <div className="h-48 flex items-center justify-center text-slate-400">Tidak ada data</div>
                            )}
                        </div>

                        {/* Order Status */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Status Order</h3>
                            <div className="space-y-3">
                                {orderStatus.length > 0 ? orderStatus.map((item) => (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(item.status)}
                                            <span className="text-sm font-medium capitalize">{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>{item.count}</span>
                                            <span className="text-xs text-slate-400">{item.percentage}%</span>
                                        </div>
                                    </div>
                                )) : <p className="text-slate-400 text-sm">Tidak ada data</p>}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Methods */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Metode Pembayaran</h3>
                            <div className="space-y-3">
                                {paymentMethods.length > 0 ? paymentMethods.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 uppercase text-xs">{item.method}</span>
                                            <span className="text-slate-500 text-xs">{item.count} orders • {formatCurrency(item.total)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                                        </div>
                                    </div>
                                )) : <p className="text-slate-400 text-sm">Tidak ada data</p>}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Penjualan per Kategori</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-slate-500 border-b">
                                            <th className="pb-2">Kategori</th>
                                            <th className="pb-2 text-right">Qty</th>
                                            <th className="pb-2 text-right">Revenue</th>
                                            <th className="pb-2 text-right">Cost</th>
                                            <th className="pb-2 text-right">Profit</th>
                                            <th className="pb-2 text-right">Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.length > 0 ? categories.map((cat) => (
                                            <tr key={cat.id} className="border-b border-slate-50">
                                                <td className="py-2 font-medium">{cat.name}</td>
                                                <td className="py-2 text-right text-slate-600">{formatNumber(cat.total_quantity)}</td>
                                                <td className="py-2 text-right font-bold">{formatCurrency(cat.total_revenue)}</td>
                                                <td className="py-2 text-right text-slate-500">{formatCurrency(cat.total_cost)}</td>
                                                <td className="py-2 text-right text-emerald-600 font-bold">{formatCurrency(cat.profit)}</td>
                                                <td className="py-2 text-right"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${cat.margin >= 30 ? 'bg-emerald-100 text-emerald-700' : cat.margin >= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{cat.margin}%</span></td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="py-4 text-center text-slate-400">Tidak ada data</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Top 10 Produk Terlaris</h3>
                            <p className="text-xs text-slate-500">Dengan detail profit margin</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500">#</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500">Produk</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">Harga</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">HPP</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">Qty</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">Revenue</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">Profit</th>
                                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500">Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topProducts.length > 0 ? topProducts.map((product, idx) => (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-slate-400">{idx + 1}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.image ? <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-slate-300" />}
                                                    </div>
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">{formatCurrency(product.price)}</td>
                                            <td className="px-6 py-3 text-right text-slate-500">{product.cost_price ? formatCurrency(product.cost_price) : '-'}</td>
                                            <td className="px-6 py-3 text-right font-bold">{formatNumber(product.total_quantity)}</td>
                                            <td className="px-6 py-3 text-right font-bold">{formatCurrency(product.total_revenue)}</td>
                                            <td className="px-6 py-3 text-right font-bold text-emerald-600">{formatCurrency(product.profit)}</td>
                                            <td className="px-6 py-3 text-right">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${product.margin >= 30 ? 'bg-emerald-100 text-emerald-700' : product.margin >= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.margin}%
                                                </span>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-400">Tidak ada data penjualan</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
