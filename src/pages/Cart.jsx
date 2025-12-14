import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, Edit, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, publicAPI, cartAPI } from '../services/api';

const Cart = () => {
    const { items, loading, itemCount, subtotal, updateQuantity, removeFromCart, fetchCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [updatingId, setUpdatingId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editVariant, setEditVariant] = useState({ color: '', size: '' });
    const [productVariants, setProductVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const shipping = subtotal > 500000 ? 0 : 50000;
    const total = subtotal + shipping;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleUpdateQuantity = async (itemId, change) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return;

        setUpdatingId(itemId);
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (err) {
            console.error('Failed to update quantity:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId) => {
        setUpdatingId(itemId);
        try {
            await removeFromCart(itemId);
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleEditVariant = async (item) => {
        const product = item.product;
        setEditingItem(item);
        setEditVariant({
            color: item.variant?.color || '',
            size: item.variant?.size || ''
        });

        // Fetch product variants
        setLoadingVariants(true);
        try {
            const data = await publicAPI.getProduct(product.slug);
            const productData = data.data || data;
            setProductVariants(productData.variants || []);
        } catch (err) {
            console.error('Failed to fetch variants:', err);
        } finally {
            setLoadingVariants(false);
        }
    };

    const handleSaveVariant = async () => {
        if (!editingItem || !editVariant.color || !editVariant.size) {
            alert('Pilih warna dan ukuran');
            return;
        }

        // Find the matching variant
        const newVariant = productVariants.find(
            v => v.color === editVariant.color && v.size === editVariant.size
        );

        if (!newVariant) {
            alert('Variant tidak ditemukan');
            return;
        }

        if (newVariant.stock <= 0) {
            alert('Variant ini sedang habis');
            return;
        }

        setUpdatingId(editingItem.id);
        try {
            await cartAPI.updateCartItem(editingItem.id, {
                quantity: parseInt(editingItem.quantity),
                variant_id: newVariant.id
            });
            await fetchCart();
            setEditingItem(null);
        } catch (err) {
            console.error('Failed to update variant:', err);
            alert('Gagal update variant: ' + err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Get unique colors and sizes for editing
    const availableColors = [...new Set(productVariants.map(v => v.color))];
    const availableSizes = productVariants
        .filter(v => v.color === editVariant.color)
        .map(v => ({ size: v.size, stock: v.stock, id: v.id }));

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        navigate('/checkout');
    };

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <main className="flex-grow container mx-auto px-4 py-8 min-h-screen bg-slate-50">
            <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <ShoppingBag className="text-orange-500" size={32} />
                Shopping Cart
                {itemCount > 0 && (
                    <span className="text-sm font-medium text-slate-500">({itemCount} items)</span>
                )}
            </h1>

            {items.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const product = item.product || item;
                            const variant = item.variant;
                            const variantImage = variant?.image ? getImageUrl(variant.image) : null;
                            const imageUrl = variantImage || getImageUrl(product.image);
                            const itemPrice = variant
                                ? parseFloat(product.price) + parseFloat(variant.price_adjustment || 0)
                                : parseFloat(product.price);

                            return (
                                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md">
                                    <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                                                style={{ backgroundColor: variant?.color_hex || product.color || '#94a3b8' }}
                                            >
                                                {product.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link to={`/product/${product.slug || product.id}`}>
                                                    <h3 className="font-bold text-slate-900 text-lg hover:text-orange-500 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                {/* Variant Info */}
                                                {variant && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-slate-200"
                                                            style={{ backgroundColor: variant.color_hex || '#94a3b8' }}
                                                            title={variant.color}
                                                        />
                                                        <span className="text-sm text-slate-600">
                                                            {variant.color} / {variant.size}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEditVariant(item)}
                                                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                                                        >
                                                            <Edit size={12} />
                                                            Ubah
                                                        </button>
                                                    </div>
                                                )}

                                                <p className="text-sm text-slate-500 mt-1">
                                                    {formatPrice(itemPrice)} each
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={updatingId === item.id}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                                            >
                                                {updatingId === item.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-orange-500 transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1 || updatingId === item.id}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-slate-900 w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-orange-500 transition-colors disabled:opacity-50"
                                                    disabled={updatingId === item.id}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="font-bold text-lg text-orange-500">
                                                {formatPrice(itemPrice * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-slate-900">
                                        {shipping === 0 ? (
                                            <span className="text-emerald-600">FREE</span>
                                        ) : (
                                            formatPrice(shipping)
                                        )}
                                    </span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-slate-500">
                                        Free shipping for orders above {formatPrice(500000)}
                                    </p>
                                )}
                                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-slate-900 text-lg">Total</span>
                                    <span className="font-black text-2xl text-orange-500">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </button>

                            <div className="mt-6 text-center text-xs text-slate-400">
                                <p>Secure Checkout - SSL Encrypted</p>
                                <p className="mt-1">Free returns within 30 days</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="text-slate-300" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        {isAuthenticated
                            ? "Looks like you haven't added anything to your cart yet. Explore our products and find something you love!"
                            : "Please login to view your cart items."
                        }
                    </p>
                    <Link
                        to={isAuthenticated ? "/shop" : "/login"}
                        className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                    >
                        {isAuthenticated ? "Start Shopping" : "Login"}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            )}

            {/* Edit Variant Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Ubah Variant</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        {loadingVariants ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-orange-500" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Color Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Warna</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(color => {
                                            const colorVariant = productVariants.find(v => v.color === color);
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => setEditVariant(prev => ({ ...prev, color, size: '' }))}
                                                    className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${editVariant.color === color
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{ backgroundColor: colorVariant?.color_hex || '#94a3b8' }}
                                                    />
                                                    {color}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Size Selection */}
                                {editVariant.color && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Ukuran</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSizes.map(sizeOption => (
                                                <button
                                                    key={sizeOption.size}
                                                    onClick={() => sizeOption.stock > 0 && setEditVariant(prev => ({ ...prev, size: sizeOption.size }))}
                                                    disabled={sizeOption.stock <= 0}
                                                    className={`min-w-[48px] px-3 py-2 rounded-lg border-2 font-medium transition-all ${editVariant.size === sizeOption.size
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : sizeOption.stock <= 0
                                                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {sizeOption.size}
                                                    {sizeOption.stock <= 0 && <span className="text-xs block text-red-400">Habis</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveVariant}
                                    disabled={!editVariant.color || !editVariant.size || updatingId === editingItem.id}
                                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updatingId === editingItem.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Check size={18} />
                                    )}
                                    Simpan Perubahan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default Cart;
