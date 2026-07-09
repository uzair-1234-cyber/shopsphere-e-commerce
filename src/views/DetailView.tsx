import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, ShieldCheck, Truck, RefreshCcw, ArrowLeft, Send, Check } from 'lucide-react';
import { Product, Review } from '../types';
import ProductCard from '../components/ProductCard';

interface DetailViewProps {
  productId: string;
  products: Product[];
  onNavigate: (view: string, params?: any) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  isWishlisted: boolean;
  isInCart: boolean;
  onAddReview: (productId: string, reviewData: { rating: number; comment: string }) => Promise<any>;
}

export default function DetailView({
  productId,
  products,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isInCart,
  onAddReview,
}: DetailViewProps) {
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Product not found</h3>
        <button
          onClick={() => onNavigate('shop')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const [activeImage, setActiveImage] = useState(product.images[0] || '');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [quantity, setQuantity] = useState(1);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zoom magnifier event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCartClick = () => {
    onAddToCart(product.id, quantity);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddReview(product.id, { rating, comment });
      setReviewSubmitted(true);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Error adding review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock === 0;

  // Filter approved reviews for rendering
  const approvedReviews = product.reviews.filter((r) => r.approved);

  // Derive related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pb-16 space-y-12" id="product-detail">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('shop')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Shop Catalog</span>
      </button>

      {/* Main Product Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Images View & Hover Zoom */}
        <div className="space-y-4">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 cursor-zoom-in"
          >
            <img
              src={activeImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            {/* Custom magnifier lens */}
            <div
              style={zoomStyle}
              className="absolute inset-0 pointer-events-none border border-zinc-200 bg-no-repeat rounded-3xl"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-indigo-600'
                      : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  <img src={img} alt={`${product.title} view ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Description & Shopping Cart controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                {product.brand}
              </span>
              <span className="text-xs text-zinc-400">SKU: {product.sku}</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
              {product.title}
            </h1>
          </div>

          {/* Ratings Summary */}
          <div className="flex items-center space-x-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-zinc-400">|</span>
            <span className="text-xs text-zinc-500 font-medium">
              {approvedReviews.length} Community Reviews
            </span>
            <span className="text-xs text-zinc-400">|</span>
            <span
              className={`text-xs font-bold ${
                isOutOfStock
                  ? 'text-rose-500'
                  : product.stock < 5
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : product.stock < 5 ? `Low Stock: Only ${product.stock} Left` : 'In Stock'}
            </span>
          </div>

          {/* Pricing Info */}
          <div className="space-y-1">
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-zinc-950 dark:text-white">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed border-b border-zinc-100 dark:border-zinc-850 pb-6">
            {product.description}
          </p>

          {/* Specs / Attributes list */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Specifications</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-900 pb-1.5">
                <span className="text-zinc-400">Chassis Brand</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">{product.brand}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-900 pb-1.5">
                <span className="text-zinc-400">SKU Code</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">{product.sku}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-900 pb-1.5">
                <span className="text-zinc-400">Stock Inventory</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">{product.stock} items</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-900 pb-1.5">
                <span className="text-zinc-400">Material Standard</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Premium Grade</span>
              </div>
            </div>
          </div>

          {/* Cart & Wishlist Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 w-fit bg-zinc-50 dark:bg-zinc-950">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 hover:bg-white dark:hover:bg-zinc-900 rounded-xl text-sm font-bold transition-all text-zinc-500"
                >
                  -
                </button>
                <span className="px-4 font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-1.5 hover:bg-white dark:hover:bg-zinc-900 rounded-xl text-sm font-bold transition-all text-zinc-500"
                >
                  +
                </button>
              </div>
            )}

            {/* Main CTA */}
            <div className="flex-1 flex gap-3.5">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl py-3 text-xs font-semibold cursor-not-allowed uppercase tracking-wider"
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCartClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3 text-xs font-semibold transition-all hover:translate-y-[-1px] active:translate-y-0 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 uppercase tracking-wider"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isInCart ? 'Add More To Cart' : 'Add To Cart'}</span>
                </button>
              )}

              {/* Wishlist button */}
              <button
                onClick={(e) => onToggleWishlist(product.id, e)}
                className={`p-3 border rounded-2xl flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 dark:bg-rose-955 border-rose-200 dark:border-rose-900 text-rose-500'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Delivery terms */}
          <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-850">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-indigo-500" />
              <span>Complimentary Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span>Secure Checkout SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Subscriptions Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-zinc-100 dark:border-zinc-800">
        {/* Left 2 Cols: Approved Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
            Customer Reviews ({approvedReviews.length})
          </h3>

          {approvedReviews.length > 0 ? (
            <div className="space-y-4">
              {approvedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl space-y-2.5 bg-white dark:bg-zinc-900"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900 dark:text-white">{rev.userName}</h5>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 italic">
              No reviews have been published for this masterpiece yet. Be the first to review!
            </div>
          )}
        </div>

        {/* Right 1 Col: Add Review Form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-6 h-fit space-y-4">
          <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Write a Review</h4>
          <p className="text-[11px] text-zinc-400">Your review will be analyzed and published upon administrator verification.</p>

          {reviewSubmitted ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-start space-x-2 text-xs">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-400">Review Submitted!</span>
                <p className="text-[10px] text-zinc-500 mt-1">Thank you. An administrator will review your comments shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Stars Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Overall Rating</label>
                <div className="flex items-center space-x-1.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${i < rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this item..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>Submit Comments</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-8">
            You May Also Admire
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(id) => onNavigate('details', { id })}
                onAddToCart={(id, e) => {
                  e.stopPropagation();
                  onAddToCart(id, 1);
                }}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={isWishlisted}
                isInCart={isInCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
