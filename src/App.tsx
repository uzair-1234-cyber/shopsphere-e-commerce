import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

// Views
import HomeView from './views/HomeView';
import ListingView from './views/ListingView';
import DetailView from './views/DetailView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import DashboardView from './views/DashboardView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView';

// API Client & Types
import { api } from './lib/api';
import { Product, Category, Coupon, Banner, Order, User } from './types';
import { auth, onAuthStateChanged, signOut } from './lib/firebase';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Global Models State from Backend
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // User Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cart & Wishlist (local persistence)
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Search keyword synchronization
  const [searchQuery, setSearchQuery] = useState('');

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load backend models and session states on mount
  useEffect(() => {
    fetchGlobalData();

    // Load theme
    const cachedTheme = localStorage.getItem('shopsphere_theme') as 'light' | 'dark' || 'light';
    setTheme(cachedTheme);
    if (cachedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Real-time Firebase Auth state subscriber with MongoDB profile synchronization
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const syncedUser = await api.firebaseSync({
            uid: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || undefined,
            avatar: fbUser.photoURL || undefined
          });
          setCurrentUser(syncedUser);
          localStorage.setItem('shopsphere_user', JSON.stringify(syncedUser));
        } catch (err) {
          console.error('Failed to synchronize authenticated profile with MongoDB:', err);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('shopsphere_user');
      }
    });

    const cachedCart = localStorage.getItem('shopsphere_cart');
    if (cachedCart) {
      setCartItems(JSON.parse(cachedCart));
    }

    const cachedWish = localStorage.getItem('shopsphere_wishlist');
    if (cachedWish) {
      setWishlist(JSON.parse(cachedWish));
    }

    return () => unsubscribe();
  }, []);

  const fetchGlobalData = async () => {
    try {
      const [cats, prods, coups, bans, ords] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
        api.getCoupons(),
        api.getBanners(),
        api.getOrders(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setCoupons(coups);
      setBanners(bans);
      setOrders(ords);
    } catch (err) {
      console.error('Error synchronizing database metrics:', err);
    }
  };

  // Theme toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('shopsphere_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigation router helper
  const navigateTo = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Action Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('shopsphere_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out from Firebase Auth:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('shopsphere_user');
    navigateTo('home');
  };

  const handleUpdateProfile = async (profileData: any) => {
    const updatedUser = await api.updateProfile(profileData);
    setCurrentUser(updatedUser);
    localStorage.setItem('shopsphere_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Cart Management Handlers
  const handleAddToCart = (productId: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === productId);
      let updated;
      if (idx !== -1) {
        updated = [...prev];
        updated[idx].quantity += quantity;
      } else {
        updated = [...prev, { productId, quantity }];
      }
      localStorage.setItem('shopsphere_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleQuickAddToCartEvent = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(productId, 1);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('shopsphere_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      localStorage.setItem('shopsphere_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('shopsphere_cart');
  };

  // Wishlist Handlers
  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      let updated;
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      } else {
        updated = [...prev, productId];
      }
      localStorage.setItem('shopsphere_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem('shopsphere_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Review Submissions
  const handleAddReview = async (productId: string, reviewData: { rating: number; comment: string }) => {
    const response = await api.createReview(productId, {
      ...reviewData,
      userId: currentUser?.id,
      userName: currentUser?.name || 'Anonymous Guest',
    });
    // Refresh product ratings and list immediately
    fetchGlobalData();
    return response;
  };

  // Order Placement
  const handlePlaceOrder = async (orderPayload: any) => {
    const placedOrder = await api.createOrder(orderPayload);
    // Refresh orders and products stock count immediately
    fetchGlobalData();
    return placedOrder;
  };

  // Handle Stripe Redirection Callback (Success/Cancel URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const orderId = urlParams.get('order_id');
    const paymentCancel = urlParams.get('payment_cancel');

    if (paymentSuccess === 'true' && orderId) {
      const finalizePayment = async () => {
        try {
          // Sync with server to set paymentStatus to Paid
          await api.updateOrder(orderId, { paymentStatus: 'Paid' });
          handleClearCart();
          await fetchGlobalData();
          navigateTo('dashboard');
          
          // Clear query params elegantly
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (err) {
          console.error('Failed to complete Stripe order payment validation:', err);
        }
      };
      finalizePayment();
    } else if (paymentCancel === 'true' && orderId) {
      navigateTo('cart');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Cart item model sync
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartItemIds = cartItems.map((item) => item.productId);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Universal Sticky Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        currentView={currentView}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        {currentView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            banners={banners}
            onNavigate={navigateTo}
            onAddToCart={handleQuickAddToCartEvent}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            cartItemIds={cartItemIds}
          />
        )}

        {currentView === 'shop' && (
          <ListingView
            products={products}
            categories={categories}
            initialCategory={viewParams.category || ''}
            onNavigate={navigateTo}
            onAddToCart={handleQuickAddToCartEvent}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            cartItemIds={cartItemIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentView === 'details' && (
          <DetailView
            productId={viewParams.id || products[0]?.id || ''}
            products={products}
            onNavigate={navigateTo}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlist.includes(viewParams.id)}
            isInCart={cartItemIds.includes(viewParams.id)}
            onAddReview={handleAddReview}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            cartItems={cartItems}
            products={products}
            coupons={coupons}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={navigateTo}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            currentUser={currentUser}
            cartItems={cartItems}
            products={products}
            appliedCoupon={appliedCoupon}
            onClearCart={handleClearCart}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            orders={orders}
            products={products}
            wishlist={wishlist}
            cartItemIds={cartItemIds}
            onUpdateProfile={handleUpdateProfile}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleQuickAddToCartEvent}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            products={products}
            categories={categories}
            orders={orders}
            coupons={coupons}
            banners={banners}
            onRefreshData={fetchGlobalData}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'login' && (
          <AuthView
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'register' && (
          <AuthView
            initialMode="register"
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
