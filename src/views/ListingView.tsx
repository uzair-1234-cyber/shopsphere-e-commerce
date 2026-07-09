import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCcw, Star, X } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface ListingViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  onNavigate: (view: string, params?: any) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  wishlist: string[];
  cartItemIds: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ListingView({
  products,
  categories,
  initialCategory = '',
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  cartItemIds,
  searchQuery,
  onSearchChange,
}: ListingViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Derive unique brands from products list
  const brands = useMemo(() => {
    const list = products.map((p) => p.brand);
    return ['all', ...Array.from(new Set(list))];
  }, [products]);

  // Filters application
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim() !== '') {
          const matchTitle = p.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchDesc = p.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchBrand = p.brand.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchTitle && !matchDesc && !matchBrand) return false;
        }

        // Category
        if (selectedCategory !== '' && p.category !== selectedCategory) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }

        // Price
        const price = p.discountPrice || p.price;
        if (price > priceRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pA = a.discountPrice || a.price;
        const pB = b.discountPrice || b.price;

        if (sortBy === 'price-low') return pA - pB;
        if (sortBy === 'price-high') return pB - pA;
        if (sortBy === 'best-selling') return b.rating - a.rating;
        // Default 'newest'
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('all');
    setPriceRange(500);
    setSortBy('newest');
    onSearchChange('');
  };

  return (
    <div className="pb-16" id="shop-catalog">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Advanced Filter Panel */}
        <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
              <span>Catalog Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Input inline panel */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product title, brand..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-xs pl-8 pr-8 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-zinc-400" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-3 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Category</label>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Brand</label>
            <div className="flex flex-col space-y-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                    selectedBrand === brand
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  {brand === 'all' ? 'All Brands' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <span>Max Price</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-sans font-bold">${priceRange}</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>$20</span>
              <span>$500</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Search Results & Grid */}
        <main className="flex-1 space-y-6">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-4">
            <div className="text-xs text-zinc-500 font-medium">
              Showing <span className="font-bold text-zinc-900 dark:text-white">{filteredProducts.length}</span> of{' '}
              <span className="font-bold text-zinc-900 dark:text-white">{products.length}</span> premium offerings
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-zinc-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-44 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 rounded-xl py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-selling">Rating: Best Selling</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl space-y-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full w-fit mx-auto">
                <Search className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No products match your filters</h3>
                <p className="text-xs text-zinc-500">Try widening your price range, clearing search terms, or exploring other categories.</p>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
