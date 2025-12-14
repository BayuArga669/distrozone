import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    ShoppingBag,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    Eye,
    Loader2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const getStatusColor = (status) => {
    const colors = {
        'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'processing': 'bg-blue-100 text-blue-700 border-blue-200',
        'pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
        'paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};



const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDashboardStats();
            setStats(data.stats);
            setRecentOrders(data.recent_orders || []);
            setTopProducts(data.top_products || []);
            setSalesData(data.daily_revenue || []);
            setOrderStatusData(data.order_status_data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    const STATS_CONFIG = [
        {
            label: 'Total Revenue',
            value: formatPrice(stats?.total_revenue || 0),
            icon: DollarSign,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            trend: '+12.5%',
            positive: true
        },
        {
            label: 'Pending Orders',
            value: stats?.pending_orders || 0,
            icon: ShoppingBag,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            trend: '-2.4%',
            positive: false
        },
        {
            label: 'Total Products',
            value: stats?.total_products || 0,
            icon: Package,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            trend: '+5.7%',
            positive: true
        },
        {
            label: 'Total Customers',
            value: stats?.total_customers || 0,
            icon: Users,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            trend: '+18.2%',
            positive: true
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-orange-200 border border-white/10 mb-4 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            System Operational
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-slate-400 max-w-xl text-lg">
                            Welcome back! Here's your daily performance summary and latest business insights.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center min-w-[100px]">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date</p>
                            <p className="text-sm font-bold mt-0.5">
                                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="bg-orange-500 px-5 py-3 rounded-2xl border border-orange-400 shadow-lg shadow-orange-500/20 text-center min-w-[100px] cursor-pointer hover:bg-orange-600 transition-colors group">
                            <p className="text-xs text-orange-200 uppercase tracking-wider font-semibold group-hover:text-white transition-colors">Action</p>
                            <Link to="/admin/products" className="text-sm font-bold mt-0.5 block">+ Product</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS_CONFIG.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group animate-slide-up`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                                <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-bold mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Low Stock Alert */}
            {(stats?.low_stock_products > 0 || stats?.out_of_stock_products > 0) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 text-amber-600 shadow-inner">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-grow text-center sm:text-left z-10">
                        <p className="font-bold text-amber-900 text-lg">Inventory Attention Needed</p>
                        <p className="text-amber-800/80 mt-1">
                            You have <span className="font-bold text-amber-900">{stats?.low_stock_products}</span> items running low and <span className="font-bold text-amber-900">{stats?.out_of_stock_products}</span> items out of stock in your inventory.
                        </p>
                    </div>
                    <Link to="/admin/products" className="bg-white text-amber-700 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-900/5 hover:bg-amber-50 transition-colors z-10">
                        Check Inventory
                    </Link>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Overview */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Revenue Analytics</h2>
                            <p className="text-sm text-slate-500">Revenue performance over time</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                            {['7 Days', '30 Days', 'Year'].map((period, i) => (
                                <button
                                    key={period}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${i === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={12}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                    tickMargin={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    formatter={(value) => [formatPrice(value), 'Revenue']}
                                    cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#f97316' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Order Status</h2>
                        <p className="text-sm text-slate-500">Current order distribution</p>
                    </div>
                    <div className="h-[300px] flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        borderRadius: '12px',
                                        border: 'none',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ fontWeight: 600, color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-600 font-bold ml-1 text-xs">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                            <p className="text-xs text-slate-500 mt-1">Latest transaction history</p>
                        </div>
                        <Link to="/admin/orders" className="text-sm text-orange-600 font-bold hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                #{order.order_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {(order.user?.name || 'G')[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{order.user?.name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatPrice(order.total)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingBag size={32} className="text-slate-300" />
                                                <p>No recent orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900">Top Selling Products</h2>
                        <p className="text-xs text-slate-500 mt-1">Performance sorted by sales count</p>
                    </div>
                    <div className="p-0 flex-grow">
                        {topProducts.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {topProducts.map((product, index) => (
                                    <div key={product.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</p>
                                                <p className="text-xs font-medium text-slate-500">{formatPrice(product.price)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-slate-900 text-lg">{product.total_sold || 0}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sold</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                <TrendingUp size={32} className="text-slate-300" />
                                <p>No sales data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
