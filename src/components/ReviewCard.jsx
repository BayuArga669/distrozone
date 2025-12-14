import React from 'react';
import { CheckCircle, User } from 'lucide-react';
import StarRating from './StarRating';

/**
 * ReviewCard Component
 * 
 * Displays an individual product review
 */
const ReviewCard = ({ review }) => {
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                    {review.user?.profile_photo_url ? (
                        <img
                            src={review.user.profile_photo_url}
                            alt={review.user.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(review.user?.name)}
                        </div>
                    )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="font-bold text-slate-900">
                                {review.user?.name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <StarRating rating={review.rating} size={16} />
                                {review.verified_purchase && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                        <CheckCircle size={12} />
                                        Verified Purchase
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-slate-500">
                            {review.formatted_date || review.created_at}
                        </span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                        <h5 className="font-semibold text-slate-900 mb-2">
                            {review.title}
                        </h5>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                        <p className="text-slate-600 leading-relaxed">
                            {review.comment}
                        </p>
                    )}

                    {/* Helpful Counter - Future Enhancement */}
                    {review.helpful_count > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <span className="text-sm text-slate-500">
                                {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
