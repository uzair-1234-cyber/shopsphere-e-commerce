import React, { useState, useMemo } from 'react';
import { ShoppingBag, ArrowRight, Trash2, Tag, Gift, CheckCircle, ShieldAlert } from 'lucide-react';
import { Product, Coupon } from '../types';

interface CartViewProps {
  cartItems: { productId: string; quantity: number }[];
  products: Product[];
  coupons: Coupon[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (view: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export default function CartView({
  cartItems,
  products,
  coupons,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
  appliedCoupon,
  onApplyCoupon,
}: CartViewProps) {
  const [couponCode, setCouponCode] = useState(appliedCoupon ? appliedCoupon.code : '');
  const [couponError, setCouponError] = useState('');

  // Map cart items to actual product models
  const resolvedItems = useMemo(() => {
    return cartItems
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return prod ? { product: prod, quantity: item.quantity } : null;
      })
      .filter((item): item is { product: Product; quantity: number } => item !== null);
  }, [cartItems, products]);

  // Compute finance aggregates
  const subtotal = useMemo(() => {
    return resolvedItems.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [resolvedItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.discount / 100);
  }, [appliedCoupon, subtotal]);

  const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 15.0;
  const grandTotal = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    if (!couponCode.trim()) {
      onApplyCoupon(null);
      return;
    }

    const matched = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active
    );

    if (matched) {
      // Check expiry (e.g. comparing with 2026-07-09T02:00:14-07:00 date from system)
      const expiry = new Date(matched.expiryDate);
      const now = new Date('2026-07-09T02:00:14-07:00');
      if (expiry < now) {
        setCouponError('This promotional coupon code has expired.');
      } else {
        onApplyCoupon(matched);
      }
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or SUPER30!');
    }
  };

  const removeCoupon = () => {
    onApplyCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  if (resolvedItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-8" id="empty-cart">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 text-indigo-500 rounded-full w-fit mx-auto">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Cart is Vacant</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            There are no premium items in your cart. Explore our curated collections to discover exceptional quality.
          </p>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/10"
        >
          Begin Exploring
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16" id="cart-workspace">
      <h1 className="font-sans text-2xl font-bold text-zinc-950 dark:text-white tracking-tight mb-8">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {resolvedItems.map(({ product, quantity }) => {
            const price = product.discountPrice || product.price;
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl"
              >
                {/* Thumb */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-850 shrink-0">
                  <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{product.brand}</span>
                  <h3
                    onClick={() => onNavigate(`details?id=${product.id}`)}
                    className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                  >
                    {product.title}
                  </h3>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">${price.toFixed(2)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 px-1">{quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemoveItem(product.id)}
                  className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side: Pricing Summaries & Coupon controls */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
              Checkout Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Items Subtotal</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">${subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" />
                    <span>Promo ({appliedCoupon.code}) -{appliedCoupon.discount}%</span>
                  </span>
                  <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-zinc-400">Shipping Delivery</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {shippingCost === 0 ? 'Complimentary' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {shippingCost > 0 && (
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Add <strong className="text-indigo-500">${(150 - subtotal).toFixed(2)}</strong> more to unlock complimentary premium shipping!
                </p>
              )}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex justify-between items-end">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Estimated Grand Total</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3 text-xs font-semibold uppercase tracking-wider transition-all hover:translate-y-[-1px] flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Coupon Input Form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Promotional Coupons</h4>

            {appliedCoupon ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-start justify-between">
                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">Coupon Applied!</span>
                    <p className="text-[10px] text-zinc-400 mt-1">Enjoy {appliedCoupon.discount}% discount on all products.</p>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-[10px] font-bold text-rose-500 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, SUPER30"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 pl-8 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="absolute left-2.5 top-2.5 text-zinc-400">
                    <Tag className="h-3.5 w-3.5" />
                  </div>
                </div>

                {couponError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-[10px] text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-1.5 leading-normal">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Verify Promo Code
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
