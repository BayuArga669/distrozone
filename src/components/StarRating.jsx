import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * 
 * Displays or allows input of star ratings
 * 
 * @param {number} rating - Current rating (0-5, supports decimals for display)
 * @param {number} maxRating - Maximum rating (default 5)
 * @param {number} size - Size of stars in pixels (default 20)
 * @param {boolean} interactive - Whether stars are clickable (default false)
 * @param {function} onChange - Callback when rating changes (interactive mode)
 * @param {boolean} showValue - Show numerical value next to stars (default false)
 */
const StarRating = ({
    rating = 0,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange = null,
    showValue = false,
    className = ''
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    const [selectedRating, setSelectedRating] = React.useState(rating);

    const handleClick = (value) => {
        if (interactive && onChange) {
            setSelectedRating(value);
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = interactive ? (hoverRating || selectedRating) : rating;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {[...Array(maxRating)].map((_, index) => {
                    const starValue = index + 1;
                    const fillPercentage = Math.max(0, Math.min(100, (displayRating - index) * 100));

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                            className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                            disabled={!interactive}
                            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
                        >
                            {/* Background star (empty) */}
                            <Star
                                size={size}
                                className="text-slate-300"
                                strokeWidth={0}
                                fill="currentColor"
                            />

                            {/* Foreground star (filled based on percentage) */}
                            {fillPercentage > 0 && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${fillPercentage}%` }}
                                >
                                    <Star
                                        size={size}
                                        className="text-yellow-400"
                                        strokeWidth={0}
                                        fill="currentColor"
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-sm font-medium text-slate-700 ml-1">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
