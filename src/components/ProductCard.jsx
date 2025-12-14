import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { getImageUrl, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, initialWishlisted = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  // Check wishlist status when component mounts or user changes
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product?.id) {
        try {
          const response = await wishlistAPI.checkWishlist(product.id);
          setIsWishlisted(response.is_wishlisted);
        } catch (error) {
          // Silently fail - user might not be authenticated
          console.log('Could not check wishlist status');
        }
      }
    };
    checkWishlistStatus();
  }, [user, product?.id]);

  // Handle category - can be string or object from API
  const categoryName = typeof product.category === 'object'
    ? product.category?.name
    : product.category;

  // Get full image URL
  const imageUrl = getImageUrl(product.image);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await wishlistAPI.toggleWishlist(product.id);
      setIsWishlisted(response.is_wishlisted);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-white rounded-2xl overflow-hidden group hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-100 relative">
      {/* Floating badge */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.is_featured && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            Featured
          </span>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            Sold Out
          </span>
        )}
      </div>

      {/* Wishlist button - always visible */}
      <button
        onClick={handleWishlistToggle}
        disabled={isLoading}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${isWishlisted
          ? 'bg-red-500 text-white'
          : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white'
          } ${isLoading ? 'opacity-50' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <div className="relative h-[320px] overflow-hidden bg-slate-50">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 transition-transform duration-700 group-hover:scale-105" style={{ backgroundColor: product.color || undefined }}></div>
          )}
        </Link>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pointer-events-none">
          <Link
            to={`/product/${product.slug || product.id}`}
            className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg pointer-events-auto"
            aria-label="View"
          >
            <Eye size={18} />
          </Link>


        </div>
      </div>

      <div className="p-5">
        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5 block">{categoryName}</span>
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-orange-500 transition-colors cursor-pointer">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xl font-extrabold text-slate-900">Rp {Number(product.price).toLocaleString()}</p>
          <div className="text-sm text-slate-500">
            Stock: {product.stock}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProductCard;
