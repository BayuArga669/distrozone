import React, { useState } from 'react';
import StarRating from './StarRating';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * ReviewForm Component
 * 
 * Form for submitting product reviews
 */
const ReviewForm = ({ onSubmit, loading = false, productName = '' }) => {
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        comment: ''
    });
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const validate = () => {
        const newErrors = {};

        if (formData.rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 255) {
            newErrors.title = 'Title must be less than 255 characters';
        }

        if (!formData.comment.trim()) {
            newErrors.comment = 'Comment is required';
        } else if (formData.comment.length > 1000) {
            newErrors.comment = 'Comment must be less than 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
            setSubmitStatus('success');
            // Reset form on success
            setFormData({ rating: 0, title: '', comment: '' });
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    const handleRatingChange = (rating) => {
        setFormData({ ...formData, rating });
        if (errors.rating) {
            setErrors({ ...errors, rating: null });
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Write a Review
            </h3>
            <p className="text-slate-600 mb-6">
                Share your experience with {productName || 'this product'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Your Rating <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                        rating={formData.rating}
                        interactive
                        onChange={handleRatingChange}
                        size={28}
                        showValue
                    />
                    {errors.rating && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.rating}
                        </p>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="review-title" className="block text-sm font-semibold text-slate-900 mb-2">
                        Review Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Summarize your experience"
                        className={`w-full px-4 py-3 border rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                        maxLength={255}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.title}
                        </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                        {formData.title.length}/255 characters
                    </p>
                </div>

                {/* Comment */}
                <div>
                    <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-900 mb-2">
                        Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="review-comment"
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Tell us what you think about this product..."
                        rows={5}
                        className={`w-full px-4 py-3 border rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${errors.comment ? 'border-red-500' : 'border-slate-200'}`}
                        maxLength={1000}
                    />
                    {errors.comment && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.comment}
                        </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                        {formData.comment.length}/1000 characters
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:shadow-none"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Submit Review
                        </>
                    )}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl">
                        <CheckCircle size={20} />
                        <span className="font-medium">
                            Review submitted successfully! It will be visible after admin approval.
                        </span>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                        <AlertCircle size={20} />
                        <span className="font-medium">
                            Failed to submit review. Please try again.
                        </span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ReviewForm;
