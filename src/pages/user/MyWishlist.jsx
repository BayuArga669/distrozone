import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { wishlistAPI, getImageUrl, cartAPI } from '../../services/api';

const MyWishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.getWishlist();
            setWishlist(response.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            setRemovingId(productId);
            await wishlistAPI.removeFromWishlist(productId);
            setWishlist(prev => prev.filter(item => item.product_id !== productId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await cartAPI.addToCart(product.id, 1);
            alert('Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('id-ID');
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
            <div className="container max-w-6xl px-4 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-orange-500 font-medium mb-4 transition-colors">
                        <ArrowLeft size={20} className="mr-1" />
                        Back to Shop
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-3 rounded-xl">
                            <Heart className="text-red-500" size={28} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">My Wishlist</h1>
                            <p className="text-slate-500">{wishlist.length} items saved</p>
                        </div>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                        <Heart size={64} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-slate-500 mb-6">Save items you like by clicking the heart icon on products.</p>
                        <Link
                            to="/shop"
                            className="inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
                                {/* Product Image */}
                                <Link to={`/product/${item.product?.slug || item.product?.id}`} className="block relative h-[240px] overflow-hidden bg-slate-50">
                                    {item.product?.image ? (
                                        <img
                                            src={getImageUrl(item.product.image)}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200"></div>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1 block">
                                        {item.product?.category?.name}
                                    </span>
                                    <Link to={`/product/${item.product?.slug || item.product?.id}`}>
                                        <h3 className="font-bold text-slate-900 mb-2 hover:text-orange-500 transition-colors line-clamp-2">
                                            {item.product?.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xl font-black text-slate-900 mb-4">
                                        Rp {formatPrice(item.product?.price)}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(item.product)}
                                            className="flex-1 bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.product_id)}
                                            disabled={removingId === item.product_id}
                                            className="bg-red-50 text-red-500 font-bold py-2.5 px-3 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                            aria-label="Remove from wishlist"
                                        >
                                            {removingId === item.product_id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWishlist;
