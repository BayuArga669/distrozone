import React, { useState, useEffect } from 'react';
import { adminAPI, getImageUrl } from '../../services/api';
import { Star, Trash2, CheckCircle, Search, Filter, Loader2, Eye, CheckCircle2, X } from 'lucide-react';
import StarRating from '../../components/StarRating';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        rating: '',
        search: ''
    });
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [filters]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.rating && { rating: filters.rating }),
                ...(filters.search && { search: filters.search })
            };
            const data = await adminAPI.getReviews(params);
            setReviews(data.data || []);
            setMeta(data.meta || null);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this review?')) return;

        try {
            await adminAPI.approveReview(id);
            fetchReviews();
        } catch (error) {
            console.error('Error approving review:', error);
            alert('Failed to approve review');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this review? This action cannot be undone.')) return;

        try {
            await adminAPI.deleteReview(id);
            fetchReviews();
            if (selectedReview?.id === id) {
                setShowDetailsModal(false);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const viewDetails = (review) => {
        setSelectedReview(review);
        setShowDetailsModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">
                                {stats?.total || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Star size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pending</p>
                            <p className="text-3xl font-black text-orange-600 mt-1">
                                {stats?.pending || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Filter size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Approved</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">
                                {stats?.approved || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30">
                    <div>
                        <p className="text-sm opacity-90 font-medium">Approval Rate</p>
                        <p className="text-3xl font-black mt-1">
                            {stats?.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by product, user name or email..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>

                    {/* Rating Filter */}
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                        className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={40} className="animate-spin text-orange-500" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Found</h3>
                        <p className="text-slate-600">
                            {filters.status !== 'all' || filters.rating || filters.search
                                ? 'Try adjusting your filters'
                                : 'Reviews will appear here once customers start sharing their experiences'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Review</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getImageUrl(review.product?.image)}
                                                    alt={review.product?.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{review.product?.name}</p>
                                                    <p className="text-xs text-slate-500">#{review.product?.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{review.user?.name}</p>
                                                <p className="text-xs text-slate-500">{review.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StarRating rating={review.rating} size={16} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="font-semibold text-slate-900 text-sm">{review.title}</p>
                                                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{review.comment}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(review.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {review.is_approved ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                    <CheckCircle size={12} />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    <Filter size={12} />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => viewDetails(review)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {!review.is_approved && (
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-900">Review Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Info */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Product</h3>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={getImageUrl(selectedReview.product?.image)}
                                        alt={selectedReview.product?.name}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedReview.product?.name}</p>
                                        <p className="text-sm text-slate-500">#{selectedReview.product?.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Customer</h3>
                                <p className="font-medium text-slate-900">{selectedReview.user?.name}</p>
                                <p className="text-sm text-slate-500">{selectedReview.user?.email}</p>
                                {selectedReview.verified_purchase && (
                                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                        <CheckCircle size={12} />
                                        Verified Purchase
                                    </span>
                                )}
                            </div>

                            {/* Rating */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Rating</h3>
                                <StarRating rating={selectedReview.rating} size={24} showValue />
                            </div>

                            {/* Review */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Review</h3>
                                <h4 className="font-semibold text-slate-900 mb-2">{selectedReview.title}</h4>
                                <p className="text-slate-600 leading-relaxed">{selectedReview.comment}</p>
                            </div>

                            {/* Date & Status */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <div>
                                    <p className="text-sm text-slate-500">Submitted on</p>
                                    <p className="font-medium text-slate-900">{formatDate(selectedReview.created_at)}</p>
                                </div>
                                <div>
                                    {selectedReview.is_approved ? (
                                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                            <CheckCircle size={16} />
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            <Filter size={16} />
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                {!selectedReview.is_approved && (
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedReview.id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} />
                                        Approve Review
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleDelete(selectedReview.id);
                                    }}
                                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
