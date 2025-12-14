import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navLinkClass = ({ isActive }) =>
        `font-medium transition-colors hover:text-slate-900 ${isActive ? 'text-slate-900' : 'text-slate-500'}`;

    const mobileLinkClass = "block p-4 border-b border-slate-100 font-medium text-slate-800 hover:bg-slate-50";

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 py-4 transition-colors duration-300">
            <div className="container flex justify-between items-center">
                <Link to="/" className="text-2xl font-extrabold tracking-tighter text-slate-900">
                    DISTRO<span className="text-orange-500">ZONE</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8">
                    <NavLink to="/" className={navLinkClass}>
                        Home
                    </NavLink>
                    <NavLink to="/shop" className={navLinkClass}>
                        Shop
                    </NavLink>
                    <NavLink to="/blog" className={navLinkClass}>
                        Blog
                    </NavLink>
                    <NavLink to="/about" className={navLinkClass}>
                        About
                    </NavLink>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Account */}
                    {isAuthenticated ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 text-slate-800 hover:text-orange-500 transition-colors"
                            >
                                {user?.profile_photo_url ? (
                                    <img
                                        src={user.profile_photo_url}
                                        alt={user.name}
                                        loading="lazy"
                                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="hidden md:block font-medium text-sm max-w-[100px] truncate">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <ChevronDown size={16} className={`hidden md:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <User size={16} />
                                        Edit Profile
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <ShoppingBag size={16} />
                                        My Orders
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                        My Wishlist
                                    </Link>
                                    <Link
                                        to="/addresses"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <MapPin size={16} />
                                        My Addresses
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="hidden md:flex items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors font-medium text-sm"
                            >
                                <User size={18} />
                                <span>Login</span>
                            </Link>
                            <Link
                                to="/register"
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Cart */}
                    <Link to="/cart" id="cart-icon-container" className="relative flex items-center justify-center text-slate-800 hover:text-orange-500 transition-colors" aria-label="Cart">
                        <ShoppingBag size={24} />
                        {itemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-slate-800" onClick={toggleMenu} aria-label="Menu">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden bg-white absolute top-full left-0 w-full shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <NavLink to="/" onClick={toggleMenu} className={mobileLinkClass}>Home</NavLink>
                <NavLink to="/shop" onClick={toggleMenu} className={mobileLinkClass}>Shop</NavLink>
                <NavLink to="/about" onClick={toggleMenu} className={mobileLinkClass}>About</NavLink>

                {isAuthenticated ? (
                    <>
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <p className="font-bold text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <Link to="/profile" onClick={toggleMenu} className={mobileLinkClass}>Edit Profile</Link>
                        <Link to="/orders" onClick={toggleMenu} className={mobileLinkClass}>My Orders</Link>
                        <button
                            onClick={() => { handleLogout(); toggleMenu(); }}
                            className="block w-full text-left p-4 border-b border-slate-100 font-medium text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={toggleMenu} className={mobileLinkClass}>Login</Link>
                        <Link to="/register" onClick={toggleMenu} className="block p-4 bg-orange-500 text-white font-bold text-center">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
