import React from 'react';
import { Star, Heart, ShoppingCart, Info, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: any;
  product: Product;
  onViewDetails: (productId: string) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  isWishlisted: boolean;
  isInCart: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isInCart,
}: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div
      onClick={() => onViewDetails(product.id)}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-1"
    >
      {/* Badges and actions container */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock && (
            <span className="bg-zinc-900/90 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className="bg-rose-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Overlay Button */}
        <button
          onClick={(e) => onToggleWishlist(product.id, e)}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md border shadow-sm transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-500'
              : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col flex-1 p-5">
        {/* Brand/category line */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            {product.brand}
          </span>
          <span className="text-[11px] font-medium text-zinc-400 uppercase">
            {product.category}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-sans text-sm font-semibold text-zinc-900 dark:text-white mt-1.5 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {product.title}
        </h3>

        {/* Product Rating */}
        <div className="flex items-center space-x-1 mt-1">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
              {product.rating}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            ({product.reviews.length || 1})
          </span>
        </div>

        {/* Price & Cart Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-base font-bold text-zinc-950 dark:text-white leading-none">
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product.id);
              }}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors"
              title="View Product Details"
            >
              <Info className="h-4 w-4" />
            </button>

            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl text-xs font-semibold cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : isInCart ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product.id); // Go to cart via detail or cart view
                }}
                className="p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors flex items-center justify-center"
                title="Item in Cart"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={(e) => onAddToCart(product.id, e)}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center"
                title="Add to Cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
