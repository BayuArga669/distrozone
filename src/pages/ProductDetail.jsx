import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI, reviewAPI, getImageUrl } from '../services/api';
import { ProductDetailSkeleton } from '../components/Skeleton';
import StarRating from '../components/StarRating';
import RatingSummary from '../components/RatingSummary';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import SizeGuideModal from '../components/SizeGuideModal';
import {
    Star,
    Minus,
    Plus,
    ShoppingCart,
    Heart,
    ChevronRight,
    Loader2,
    Truck,
    RefreshCw,
    ShieldCheck,
    Check,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAddToCartAnimation } from '../hooks/useAddToCartAnimation';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const { animate } = useAddToCartAnimation();

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsMeta, setReviewsMeta] = useState(null);
    const [reviewsSummary, setReviewsSummary] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewSort, setReviewSort] = useState('recent');
    const [reviewRatingFilter, setReviewRatingFilter] = useState(null);
    const reviewFormRef = useRef(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    // Get images array with full URLs
    const images = product?.images?.length > 0
        ? product.images.map(img => getImageUrl(img))
        : [getImageUrl(product?.image)].filter(Boolean);

    // Check if product has variants
    const hasVariants = product?.has_variants || product?.variants?.length > 0;

    // Get unique colors from variants (with any available image for each color)
    const availableColors = useMemo(() => {
        if (!hasVariants || !product?.variants) return [];
        const colorMap = new Map();
        product.variants.forEach(v => {
            if (!colorMap.has(v.color)) {
                colorMap.set(v.color, { hex: v.color_hex, image: v.image || null });
            } else if (!colorMap.get(v.color).image && v.image) {
                // If current color has no image but this variant does, use it
                colorMap.set(v.color, { hex: v.color_hex, image: v.image });
            }
        });
        return Array.from(colorMap, ([name, data]) => ({ name, hex: data.hex, image: data.image }));
    }, [product?.variants, hasVariants]);

    // Get variant image for selected color (search all variants of this color)
    const variantImage = useMemo(() => {
        if (!selectedColor || !product?.variants) return null;
        // Find any variant with this color that has an image
        const variantWithImage = product.variants.find(
            v => v.color === selectedColor && v.image
        );
        return variantWithImage?.image ? getImageUrl(variantWithImage.image) : null;
    }, [selectedColor, product?.variants]);

    // Get sizes available for selected color
    const availableSizes = useMemo(() => {
        if (!hasVariants || !product?.variants || !selectedColor) return [];
        const sizes = product.variants
            .filter(v => v.color === selectedColor)
            .map(v => ({
                size: v.size,
                stock: v.stock,
                price_adjustment: parseFloat(v.price_adjustment) || 0,
                id: v.id,
            }));
        console.log('Selected color:', selectedColor);
        console.log('Available sizes:', sizes);
        return sizes;
    }, [product?.variants, selectedColor, hasVariants]);

    // Calculate final price based on selected variant
    const finalPrice = useMemo(() => {
        const basePrice = parseFloat(product?.price) || 0;
        if (selectedVariant) {
            return basePrice + (parseFloat(selectedVariant.price_adjustment) || 0);
        }
        return basePrice;
    }, [product?.price, selectedVariant]);

    // Get stock based on variant or product
    const currentStock = useMemo(() => {
        if (hasVariants && selectedVariant) {
            return selectedVariant.stock;
        }
        return product?.stock || 0;
    }, [hasVariants, selectedVariant, product?.stock]);

    // Auto-select first color when product loads
    // No auto-select - user must manually choose color and size

    // Update selected variant when color/size changes
    useEffect(() => {
        if (hasVariants && selectedColor && selectedSize && product?.variants) {
            const variant = product.variants.find(
                v => v.color === selectedColor && v.size === selectedSize
            );
            setSelectedVariant(variant || null);
        } else {
            setSelectedVariant(null);
        }
    }, [selectedColor, selectedSize, product?.variants, hasVariants]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                // Reset states for new product
                setSelectedColor(null);
                setSelectedSize(null);
                setSelectedVariant(null);

                const data = await publicAPI.getProduct(slug);
                const productData = data.data || data;
                console.log('Product loaded:', productData);
                console.log('Variants:', productData.variants);
                console.log('Has variants:', productData.has_variants);
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!slug) return;

            try {
                setReviewsLoading(true);
                const params = {
                    sort: reviewSort,
                    ...(reviewRatingFilter && { rating: reviewRatingFilter })
                };
                const data = await publicAPI.getProductReviews(slug, params);
                setReviews(data.data || []);
                setReviewsMeta(data.meta || null);
                setReviewsSummary(data.summary || null);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [slug, reviewSort, reviewRatingFilter]);

    // Check if user can review
    useEffect(() => {
        const checkReviewEligibility = async () => {
            if (!isAuthenticated || !product?.id) return;

            try {
                const data = await reviewAPI.canReview(product.id);
                setCanReview(data.can_review || false);
            } catch (error) {
                console.error('Error checking review eligibility:', error);
                setCanReview(false);
            }
        };

        checkReviewEligibility();
    }, [isAuthenticated, product?.id]);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPosition({ x, y });
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/product/${slug}` } });
            return;
        }

        // Validate variant selection if product has variants
        if (hasVariants && !selectedVariant) {
            alert('Please select color and size');
            return;
        }

        if (currentStock < quantity) {
            alert('Not enough stock available');
            return;
        }

        // Trigger animation
        const imageToFly = variantImage || (images.length > 0 ? images[selectedImage] : null);

        // Find the image element to start animation from
        const productContainer = document.querySelector('.aspect-square');
        if (productContainer && imageToFly) {
            animate(imageToFly, productContainer);
        }

        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity, selectedVariant?.id || null);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart: ' + error.message);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await reviewAPI.submitReview(slug, reviewData);

            // Refresh reviews after submission
            const data = await publicAPI.getProductReviews(slug, {
                sort: reviewSort,
                ...(reviewRatingFilter && { rating: reviewRatingFilter })
            });
            setReviews(data.data || []);
            setReviewsMeta(data.meta || null);
            setReviewsSummary(data.summary || null);

            // Hide form and scroll to reviews
            setShowReviewForm(false);
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h2>
                <Link to="/shop" className="text-orange-500 hover:underline">Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                    <ChevronRight size={16} />
                    <Link to="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
                    <ChevronRight size={16} />
                    <span className="text-slate-900 font-medium">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 md:p-8 rounded-3xl shadow-sm">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div
                            className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-crosshair group"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsZooming(true)}
                            onMouseLeave={() => setIsZooming(false)}
                        >
                            {/* Show variant image if selected, otherwise show product images */}
                            {variantImage ? (
                                <img
                                    src={variantImage}
                                    alt={`${product.name} - ${selectedColor}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-200"
                                    style={{
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transform: isZooming ? 'scale(2)' : 'scale(1)'
                                    }}
                                />
                            ) : images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-200"
                                    style={{
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transform: isZooming ? 'scale(2)' : 'scale(1)'
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white text-6xl font-black"
                                    style={{ backgroundColor: product.color || '#e2e8f0' }}
                                >
                                    {product.name?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
                                {(variantImage || images[selectedImage]) ? 'Hover to Zoom' : ''}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-transparent hover:border-slate-200'}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <StarRating rating={product.average_rating || 0} size={18} />
                                <span className="text-slate-500 text-sm">
                                    ({product.total_reviews || 0} Review{product.total_reviews !== 1 ? 's' : ''})
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className={`text-sm font-medium ${currentStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {currentStock > 0 ? `${currentStock} in Stock` : 'Out of Stock'}
                                </span>
                            </div>
                            <p className="text-4xl font-bold text-orange-500">
                                {formatPrice(finalPrice)}
                                {selectedVariant?.price_adjustment > 0 && (
                                    <span className="text-sm font-normal text-slate-400 ml-2">
                                        (+{formatPrice(selectedVariant.price_adjustment)})
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="prose prose-slate mb-6 max-w-none">
                            <p className="text-slate-600 leading-relaxed">
                                {product.description || 'Elevate your streetwear game with this premium piece. Designed for comfort and style, featuring high-quality materials and modern cuts.'}
                            </p>
                        </div>

                        {/* Color Selector - Only show if has variants */}
                        {hasVariants && availableColors.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-900">
                                        Color: <span className="font-normal text-slate-600">{selectedColor}</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => {
                                                setSelectedColor(color.name);
                                                setSelectedSize(null); // Reset size when color changes
                                            }}
                                            title={color.name}
                                            className={`w-10 h-10 rounded-full border-2 transition-all relative ${selectedColor === color.name
                                                ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            style={{ backgroundColor: color.hex || '#94a3b8' }}
                                        >
                                            {selectedColor === color.name && (
                                                <Check
                                                    size={18}
                                                    className="absolute inset-0 m-auto"
                                                    style={{ color: color.hex && parseInt(color.hex.slice(1), 16) < 0x888888 ? '#fff' : '#000' }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {hasVariants && availableSizes.length > 0 ? (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-900">Select Size</span>
                                    <button
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-sm text-orange-500 hover:underline"
                                    >
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {availableSizes.map((sizeOption) => {
                                        const isOutOfStock = sizeOption.stock === 0;
                                        return (
                                            <button
                                                key={sizeOption.size}
                                                onClick={() => !isOutOfStock && setSelectedSize(sizeOption.size)}
                                                disabled={isOutOfStock}
                                                className={`min-w-[48px] px-3 h-12 rounded-xl border flex flex-col items-center justify-center font-medium transition-all ${selectedSize === sizeOption.size
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                                                    : isOutOfStock
                                                        ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                                                        : 'border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span>{sizeOption.size || 'One Size'}</span>
                                                {sizeOption.price_adjustment > 0 && (
                                                    <span className="text-[10px] opacity-70">+{(sizeOption.price_adjustment / 1000).toFixed(0)}k</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedVariant?.stock > 0 && selectedVariant.stock <= 5 && (
                                    <p className="flex items-center gap-1 mt-2 text-amber-600 text-sm">
                                        <AlertCircle size={14} />
                                        Only {selectedVariant.stock} left in stock!
                                    </p>
                                )}
                            </div>
                        ) : !hasVariants && (
                            // Fallback for products without variants
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-900">Select Size</span>
                                    <button
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-sm text-orange-500 hover:underline"
                                    >
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-medium transition-all ${selectedSize === size
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                                                : 'border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center border border-slate-200 rounded-xl h-14 w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock === 0 || addingToCart || (hasVariants && !selectedVariant)}
                                className={`flex-1 h-14 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${addedToCart
                                    ? 'bg-emerald-500 shadow-emerald-500/30'
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 hover:-translate-y-1'
                                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {addingToCart ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : addedToCart ? (
                                    <>
                                        <Check size={20} />
                                        Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        Add to Cart
                                    </>
                                )}
                            </button>
                            <button className="h-14 w-14 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                                <Heart size={20} />
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Free Delivery</p>
                                    <p className="text-xs text-slate-500">Orders over Rp500.000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <RefreshCw size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">30 Days Return</p>
                                    <p className="text-xs text-slate-500">If goods have problems</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Secure Payment</p>
                                    <p className="text-xs text-slate-500">100% secure payment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 space-y-8">
                    {/* Rating Summary */}
                    <RatingSummary
                        averageRating={reviewsSummary?.average_rating || product?.average_rating || 0}
                        totalReviews={reviewsSummary?.total_reviews || product?.total_reviews || 0}
                        ratingDistribution={reviewsSummary?.rating_distribution || product?.rating_distribution || {}}
                        ratingPercentages={reviewsSummary?.rating_percentages || product?.rating_percentages || {}}
                        canWriteReview={canReview && !showReviewForm}
                        onWriteReview={() => {
                            setShowReviewForm(true);
                            setTimeout(() => {
                                reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                        }}
                    />

                    {/* Review Form */}
                    {showReviewForm && isAuthenticated && (
                        <div ref={reviewFormRef}>
                            <ReviewForm
                                onSubmit={handleSubmitReview}
                                productName={product.name}
                            />
                        </div>
                    )}

                    {/* Reviews List */}
                    <ReviewList
                        reviews={reviews}
                        totalReviews={reviewsMeta?.total || 0}
                        loading={reviewsLoading}
                        currentSort={reviewSort}
                        currentRatingFilter={reviewRatingFilter}
                        onSortChange={setReviewSort}
                        onRatingFilter={setReviewRatingFilter}
                        hasMore={false}
                    />
                </div>
            </div>

            {/* Size Guide Modal */}
            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
                category={product?.category?.name}
            />
        </div>
    );
};

export default ProductDetail;
