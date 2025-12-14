import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Menu,
    X,
    Bell,
    ChevronDown,
    LogOut,
    Loader2,
    MessageCircle,
    FileText,
    Star,
    Ticket,
    BarChart3
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout, loading, isAuthenticated } = useAuth();
    // Initialize based on screen width
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [notifications, setNotifications] = useState({ chats: 0, orders: 0 });
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const location = useLocation();
    const pollingRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const [chatsData, ordersData] = await Promise.all([
                adminAPI.getChats({ status: 'open' }),
                adminAPI.getOrders({ status: 'unpaid,pending' })
            ]);

            // Count unread chat messages
            const unreadChats = chatsData.data?.filter(c => c.unread_count > 0).length || 0;
            // Count new orders (pending/unpaid)
            const newOrders = ordersData.data?.filter(o =>
                o.status === 'pending' || o.status === 'unpaid'
            ).length || 0;

            setNotifications({ chats: unreadChats, orders: newOrders });
        } catch (error) {
            console.log('Error fetching notifications');
        }
    };

    // Start polling when component mounts
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            fetchNotifications();
            // Poll every 5 seconds for real-time updates
            pollingRef.current = setInterval(fetchNotifications, 5000);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [isAuthenticated, user]);

    const totalNotifications = notifications.chats + notifications.orders;

    const SIDEBAR_ITEMS = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', badge: notifications.orders },
        { icon: Users, label: 'Categories', path: '/admin/categories' },
        { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
        { icon: FileText, label: 'Posts', path: '/admin/posts' },
        { icon: Star, label: 'Reviews', path: '/admin/reviews' },
        { icon: MessageCircle, label: 'Chats', path: '/admin/chats', badge: notifications.chats },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Redirect to home if not admin
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex transition-colors duration-300 relative">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 h-full bg-slate-900 text-white transition-all duration-300
                w-64 transform shadow-2xl md:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                    <Link
                        to="/admin"
                        className={`text-xl font-black tracking-tight transition-opacity duration-300 ${!isSidebarOpen ? 'md:hidden' : 'block'}`}
                    >
                        <span className="text-orange-500">Distro</span>Zone
                    </Link>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)] custom-scrollbar">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${isActive
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                    }`}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className={`font-medium transition-all duration-300 ${!isSidebarOpen ? 'md:hidden' : 'block'}`}>
                                    {item.label}
                                </span>
                                {item.badge > 0 && (
                                    <span className={`absolute ${isSidebarOpen ? 'right-3' : 'top-1 right-1'} bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section - User Info */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 transition-all duration-300 bg-slate-900 ${!isSidebarOpen ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                            title="Logout"
                        >
                            <LogOut size={18} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 -ml-2"
                        >
                            <Menu size={24} />
                        </button>

                        <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight block">
                            {SIDEBAR_ITEMS.find(item =>
                                location.pathname === item.path ||
                                (item.path !== '/admin' && location.pathname.startsWith(item.path))
                            )?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                className="relative p-2 md:p-2.5 hover:bg-slate-100 rounded-xl transition-colors group"
                            >
                                <Bell size={22} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
                                {totalNotifications > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900">Notifications</h3>
                                        {totalNotifications > 0 && <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">{totalNotifications} new</span>}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.orders > 0 && (
                                            <Link
                                                to="/admin/orders"
                                                onClick={() => setShowNotifDropdown(false)}
                                                className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
                                            >
                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                    <ShoppingCart size={20} className="text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {notifications.orders} New Orders
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">You have pending orders waiting to be processed.</p>
                                                </div>
                                            </Link>
                                        )}
                                        {notifications.chats > 0 && (
                                            <Link
                                                to="/admin/chats"
                                                onClick={() => setShowNotifDropdown(false)}
                                                className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                    <MessageCircle size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {notifications.chats} Unread Messages
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Customers are asking questions about products.</p>
                                                </div>
                                            </Link>
                                        )}
                                        {totalNotifications === 0 && (
                                            <div className="p-8 text-center text-slate-500">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Bell size={24} className="text-slate-300" />
                                                </div>
                                                <p className="font-medium text-slate-900">All caught up!</p>
                                                <p className="text-xs mt-1">No new notifications at the moment.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                        <Link to="/admin/notifications" className="text-xs font-bold text-orange-600 hover:text-orange-700">View All Notifications</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-lg shadow-slate-900/20 cursor-pointer hover:scale-105 transition-transform">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
