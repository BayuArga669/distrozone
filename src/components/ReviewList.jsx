import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import { ChevronDown } from 'lucide-react';

/**
 * ReviewList Component
 * 
 * Displays a paginated list of reviews with sorting and filtering options
 */
const ReviewList = ({
    reviews = [],
    totalReviews = 0,
    onLoadMore = null,
    hasMore = false,
    loading = false,
    onSortChange = null,
    onRatingFilter = null,
    currentSort = 'recent',
    currentRatingFilter = null
}) => {
    const [selectedRating, setSelectedRating] = useState(currentRatingFilter);

    const handleRatingFilter = (rating) => {
        const newRating = selectedRating === rating ? null : rating;
        setSelectedRating(newRating);
        if (onRatingFilter) {
            onRatingFilter(newRating);
        }
    };

    if (reviews.length === 0 && !loading) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Reviews Yet
                </h3>
                <p className="text-slate-600">
                    Be the first to share your experience with this product!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Sort by:</span>
                    <select
                        value={currentSort}
                        onChange={(e) => onSortChange && onSortChange(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>

                {/* Rating Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">Filter:</span>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => handleRatingFilter(rating)}
                            className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${selectedRating === rating
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-500'
                                }`}
                        >
                            {rating} ★
                        </button>
                    ))}
                    {selectedRating && (
                        <button
                            onClick={() => handleRatingFilter(null)}
                            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && onLoadMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Load More Reviews
                        <ChevronDown size={18} />
                    </button>
                </div>
            )}

            {/* Total Count */}
            <div className="text-center text-sm text-slate-500 pt-2">
                Showing {reviews.length} of {totalReviews} reviews
            </div>
        </div>
    );
};

export default ReviewList;
