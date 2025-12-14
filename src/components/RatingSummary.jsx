import React from 'react';
import StarRating from './StarRating';
import { MessageSquare, TrendingUp } from 'lucide-react';

/**
 * RatingSummary Component
 * 
 * Displays overall rating statistics and distribution
 */
const RatingSummary = ({
    averageRating = 0,
    totalReviews = 0,
    ratingDistribution = {},
    ratingPercentages = {},
    onWriteReview = null,
    canWriteReview = false
}) => {
    const ratings = [5, 4, 3, 2, 1];

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 border border-orange-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-orange-500" />
                Customer Reviews
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-6xl font-black text-slate-900 mb-2">
                        {averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={averageRating} size={24} />
                    <p className="text-slate-600 mt-3 text-lg">
                        Based on <span className="font-bold text-slate-900">{totalReviews}</span> review{totalReviews !== 1 ? 's' : ''}
                    </p>

                    {/* Write Review Button */}
                    {canWriteReview && onWriteReview && (
                        <button
                            onClick={onWriteReview}
                            className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Write a Review
                        </button>
                    )}
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 mb-4">
                        Rating Distribution
                    </h4>
                    {ratings.map((rating) => {
                        const count = ratingDistribution[rating] || 0;
                        const percentage = ratingPercentages[rating] || 0;

                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700 w-8">
                                    {rating} ★
                                </span>

                                {/* Progress bar */}
                                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <span className="text-sm text-slate-600 w-12 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {totalReviews === 0 && (
                <div className="mt-6 text-center py-8 border-t border-orange-100">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-slate-600 mb-4">
                        No reviews yet. Be the first to share your experience!
                    </p>
                    {canWriteReview && onWriteReview && (
                        <button
                            onClick={onWriteReview}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                        >
                            Write the First Review
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RatingSummary;
