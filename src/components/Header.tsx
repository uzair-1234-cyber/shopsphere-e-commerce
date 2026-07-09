import React, { useState } from 'react';
import { ShoppingCart, Heart, User, LayoutDashboard, LogOut, Sun, Moon, Search, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({
  currentUser,
  onLogout,
  onNavigate,
  currentView,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  theme,
  toggleTheme,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('shop');
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo size="md" showSlogan={true} />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`font-sans text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`font-sans text-sm font-medium transition-colors ${
                currentView === 'shop'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Shop
            </button>
          </nav>

          {/* Search bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium goods..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-0 rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder-zinc-400"
              />
              <div className="absolute left-3 top-2.5 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
            </form>
          </div>

          {/* Utility actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-rose-500 rounded-full animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-indigo-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1.5 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} referrerPolicy="no-referrer" className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover" />
                ) : (
                  <div className="h-7 w-7 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                {currentUser && (
                  <span className="hidden lg:inline text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">
                    {currentUser.name}
                  </span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {currentUser.role}
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('dashboard'); }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Dashboard
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => { setShowUserMenu(false); onNavigate('admin'); }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
                      <button
                        onClick={() => { setShowUserMenu(false); onLogout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-2">
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('login'); }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors mb-1 shadow-md shadow-indigo-600/15"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); onNavigate('register'); }}
                        className="w-full py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-2 pb-4 space-y-3">
          {/* Search bar mobile */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search premium goods..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute left-3 top-3 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
          </form>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
              className="text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Home
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('shop'); }}
              className="text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Shop
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
              className="text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">{wishlistCount}</span>}
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('cart'); }}
              className="text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{cartCount}</span>}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
