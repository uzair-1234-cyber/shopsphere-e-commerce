import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Flame, ShieldAlert, ArrowRight, Star, Heart, Quote } from 'lucide-react';
import { Product, Category, Banner } from '../types';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  onNavigate: (view: string, params?: any) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  wishlist: string[];
  cartItemIds: string[];
}

export default function HomeView({
  products,
  categories,
  banners,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  cartItemIds,
}: HomeViewProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  // Countdown timer simulation for Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 }; // Loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredBanners = banners.filter((b) => b.position === 'hero');
  const promoBanners = banners.filter((b) => b.position === 'promo');
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.slice().sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Premium Hero Slider */}
      <Hero banners={featuredBanners} onActionClick={(link) => onNavigate('shop')} />

      {/* Categories Showcase */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Curated Collections</span>
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">Shop by Category</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onNavigate('shop', { category: category.slug })}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-4 bottom-4 z-20 flex justify-between items-center text-white">
                <span className="font-sans font-semibold text-base leading-tight">{category.name}</span>
                <span className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-lg backdrop-blur-md transition-all">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-200 to-indigo-950 rounded-full blur-2xl"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              <span>LIMITED QUANTITIES</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Flash Sale: Summer Rush</h2>
            <p className="text-sm text-zinc-100 max-w-md leading-relaxed">
              Unlock extraordinary savings up to 45% off premium listening equipment, sneakers, and home goods. Offer valid until the clock runs down.
            </p>

            {/* Timer digits */}
            <div className="flex items-center space-x-3.5 pt-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 min-w-[50px] text-center">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-300 font-medium uppercase mt-1">Hours</span>
              </div>
              <span className="text-xl font-bold mb-5">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 min-w-[50px] text-center">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-300 font-medium uppercase mt-1">Mins</span>
              </div>
              <span className="text-xl font-bold mb-5">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 min-w-[50px] text-center">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-300 font-medium uppercase mt-1">Secs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white hover:bg-zinc-100 text-zinc-950 px-8 py-3.5 rounded-2xl text-sm font-semibold shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
            >
              <span>Unlock Flash Deals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>HANDPICKED FOR YOU</span>
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">Featured Masterpieces</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center space-x-1.5"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(id) => onNavigate('details', { id })}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              isInCart={cartItemIds.includes(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers block */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-indigo-500 fill-current" />
              <span>COMMUNITY FAVORITES</span>
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">Top Best Sellers</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(id) => onNavigate('details', { id })}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              isInCart={cartItemIds.includes(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/60 rounded-3xl p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">A Word From Our Custodians</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              "The wireless headphones are a masterclass in detail resolution. Delivery was quick, and the box was packaged like a luxury jewelry piece."
            </p>
            <div className="flex items-center space-x-3 mt-6">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Sarah J" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Sarah Jenkins</h4>
                <p className="text-[10px] text-zinc-400">Verifed Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              "Minimalist smart watch is unbelievably responsive. High premium titanium construction. Very supportive customer panel helped me adjust tracking instantly."
            </p>
            <div className="flex items-center space-x-3 mt-6">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Marcus V" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Marcus Vance</h4>
                <p className="text-[10px] text-zinc-400">Verifed Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              "I love the sustainable organic hoodies. Heavyweight cotton with a structured hood that matches Apple Store vibes. ShopSphere is my new staple!"
            </p>
            <div className="flex items-center space-x-3 mt-6">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Carla R" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Carla Ramos</h4>
                <p className="text-[10px] text-zinc-400">Verifed Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
