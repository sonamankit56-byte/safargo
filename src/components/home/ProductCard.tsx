import React from 'react';
import { Heart, Sparkles, Truck } from 'lucide-react';
import { Product } from '../../types';
import { useShopping } from '../../context/ShoppingContext';
import { RatingBadge } from '../common/RatingBadge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateToProduct, toggleWishlist, isWishlisted, t } = useShopping();
  const wishlisted = isWishlisted(product.id);

  // Suggested margin calculation
  const suggestedMargin = Math.round(product.dealPrice * 0.45);

  return (
    <div 
      onClick={() => navigateToProduct(product)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-soft hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.99] select-none"
    >
      {/* Top Image Section */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />

        {/* Mall or Deal Badge */}
        {product.isMallProduct ? (
          <div className="absolute top-2 left-2 bg-[#9F2089] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
            <span>MALL</span>
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Wishlist"
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-600 hover:text-[#9F2089] active:scale-90 transition-transform"
        >
          <Heart 
            className={`w-4 h-4 ${
              wishlisted ? 'fill-[#9F2089] text-[#9F2089]' : 'text-gray-600'
            }`} 
          />
        </button>

        {/* Bottom Reseller Earning Indicator Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4 text-[10px] text-yellow-300 font-semibold flex items-center justify-between">
          <span>{t(`मार्जिन: ₹${suggestedMargin}+`, `Earn: ₹${suggestedMargin}+`)}</span>
          <span className="text-[9px] text-white/80 font-normal">{product.sizes[0]}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[#9F2089] transition-colors">
            {product.title}
          </h3>

          {/* Pricing Row */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              ₹{product.dealPrice}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{product.mrp}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {product.discountPercent}% off
            </span>
          </div>

          {/* Free Delivery Tag */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{t('फ्री डिलीवरी', 'Free Delivery')}</span>
          </div>
        </div>

        {/* Rating Row & Supplier */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <RatingBadge 
            rating={product.rating} 
            reviewCount={product.reviewCount} 
            size="sm" 
          />
          <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
            {product.supplierName.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
