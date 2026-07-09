import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Users, Tag, Image, MessageSquare,
  TrendingUp, BarChart2, DollarSign, Users2, PackageOpen, Plus, Edit, Trash2, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import { Product, Category, Order, Coupon, Banner, Review, User } from '../types';
import { api } from '../lib/api';

interface AdminViewProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  onRefreshData: () => void;
  onNavigate: (view: string) => void;
}

type AdminTab = 'analytics' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'banners' | 'reviews';

export default function AdminView({
  products,
  categories,
  orders,
  coupons,
  banners,
  onRefreshData,
  onNavigate,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  // Editing modals/form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '', slug: '', description: '', price: '', discountPrice: '',
    images: '', category: '', brand: '', stock: '', sku: '', featured: false
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image: '' });

  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', expiryDate: '' });

  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', link: '', position: 'hero' as 'hero' | 'promo' });

  // Notifications
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchAdminAnalytics();
    fetchCustomers();
  }, [orders, products]);

  const fetchAdminAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: 'success' }), 4000);
  };

  // --- Product CRUD Actions ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        images: productForm.images ? productForm.images.split(',') : [],
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : undefined,
        stock: parseInt(productForm.stock),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        triggerNotification('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        triggerNotification('Product created successfully!');
      }

      setEditingProduct(null);
      setIsAddingProduct(false);
      setProductForm({
        title: '', slug: '', description: '', price: '', discountPrice: '',
        images: '', category: categories[0]?.slug || '', brand: '', stock: '', sku: '', featured: false
      });
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error processing product form', 'error');
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      slug: prod.slug,
      description: prod.description,
      price: prod.price.toString(),
      discountPrice: prod.discountPrice?.toString() || '',
      images: prod.images.join(','),
      category: prod.category,
      brand: prod.brand,
      stock: prod.stock.toString(),
      sku: prod.sku,
      featured: prod.featured
    });
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      triggerNotification('Product deleted successfully!');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error deleting product', 'error');
    }
  };

  // --- Category CRUD Actions ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        triggerNotification('Category modified successfully!');
      } else {
        await api.createCategory(categoryForm);
        triggerNotification('Category established successfully!');
      }
      setEditingCategory(null);
      setIsAddingCategory(false);
      setCategoryForm({ name: '', slug: '', image: '' });
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error saving category', 'error');
    }
  };

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug, image: cat.image });
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? Products mapped to it will remain but without parent context.')) return;
    try {
      await api.deleteCategory(id);
      triggerNotification('Category deleted successfully!');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error deleting category', 'error');
    }
  };

  // --- Order Status Adjustments ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrder(orderId, { orderStatus: status as any });
      triggerNotification(`Order status elevated to: ${status}`);
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error updating order', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrder(orderId, { paymentStatus: status as any });
      triggerNotification(`Payment status adjusted to: ${status}`);
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error updating payment status', 'error');
    }
  };

  // --- Coupon CRUD ---
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon(couponForm);
      triggerNotification('Coupon registered successfully!');
      setIsAddingCoupon(false);
      setCouponForm({ code: '', discount: '', expiryDate: '' });
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error creating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Delete this coupon? Active sessions will no longer resolve it.')) return;
    try {
      await api.deleteCoupon(id);
      triggerNotification('Coupon deleted successfully!');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error deleting coupon', 'error');
    }
  };

  // --- Banner HUD ---
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBanner(bannerForm);
      triggerNotification('Banner uploaded successfully!');
      setIsAddingBanner(false);
      setBannerForm({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error uploading banner', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner from home slides?')) return;
    try {
      await api.deleteBanner(id);
      triggerNotification('Banner removed.');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error removing banner', 'error');
    }
  };

  // --- Reviews Moderation ---
  const handleApproveReview = async (prodId: string, revId: string) => {
    try {
      await api.approveReview(prodId, revId);
      triggerNotification('Review approved and published live.');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error approving review', 'error');
    }
  };

  const handleDeleteReview = async (prodId: string, revId: string) => {
    if (!window.confirm('Reject and delete this review commentary?')) return;
    try {
      await api.deleteReview(prodId, revId);
      triggerNotification('Review commentary rejected and deleted.');
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'Error deleting review', 'error');
    }
  };

  // Derive unapproved reviews
  const pendingReviews = products.flatMap((p) =>
    p.reviews
      .filter((r) => !r.approved)
      .map((r) => ({ ...r, productId: p.id, productTitle: p.title }))
  );

  return (
    <div className="pb-16" id="admin-workspace">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-250 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ShopSphere Administration</span>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white mt-1">Management HUD Console</h1>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-xs font-semibold px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
        >
          <span>Exit HUD to Main Site</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Notification banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ text: '', type: 'success' })} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-4 flex flex-wrap lg:flex-col gap-1 h-fit">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Products Management</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Categories CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Orders Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Customers Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'coupons'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Coupons System</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all ${
              activeTab === 'banners'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Image className="h-4 w-4" />
            <span>Banners slide HUD</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full text-left shrink-0 transition-all relative ${
              activeTab === 'reviews'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Reviews Moderator</span>
            {pendingReviews.length > 0 && (
              <span className="absolute top-1.5 right-2 inline-flex items-center justify-center px-2 py-0.5 text-[9px] font-bold leading-none text-white bg-rose-500 rounded-full">
                {pendingReviews.length}
              </span>
            )}
          </button>
        </aside>

        {/* Content Box */}
        <main className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 min-h-[420px]">
          {/* TAB 1: ANALYTICS HUD */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Dashboard Live Analytics
              </h3>

              {/* Stats Widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Total Revenue</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">${analytics.revenue.toFixed(2)}</h4>
                </div>

                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Purchase Orders</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{analytics.ordersCount} orders</h4>
                </div>

                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                    <Users2 className="h-5 w-5" />
                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Customers</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{analytics.customersCount} active</h4>
                </div>

                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                    <PackageOpen className="h-5 w-5" />
                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Products Catalog</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{analytics.productsCount} cataloged</h4>
                </div>
              </div>

              {/* Custom HTML/CSS Sales charts */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Weekly Revenue Analytics</h4>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full uppercase">Dynamic Sync</span>
                </div>

                {/* Bars Chart */}
                <div className="h-48 flex items-end gap-3 pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-center font-sans">
                  {analytics.salesHistory.map((item: any, idx: number) => {
                    const maxVal = Math.max(...analytics.salesHistory.map((s: any) => s.sales), 1);
                    const pct = (item.sales / maxVal) * 80 + 10; // min height 10%
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[9px] px-1.5 py-0.5 rounded-md mb-1 font-bold">
                          ${item.sales}
                        </span>
                        <div
                          style={{ height: `${pct}%` }}
                          className="w-full bg-indigo-600/25 dark:bg-indigo-400/25 hover:bg-indigo-600 dark:hover:bg-indigo-400 rounded-t-lg transition-colors"
                        />
                        <span className="text-[9px] text-zinc-400 font-medium uppercase mt-2">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                  Product Management
                </h3>
                {!isAddingProduct && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        title: '', slug: '', description: '', price: '', discountPrice: '',
                        images: '', category: categories[0]?.slug || '', brand: '', stock: '', sku: '', featured: false
                      });
                      setIsAddingProduct(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Catalog Product</span>
                  </button>
                )}
              </div>

              {isAddingProduct ? (
                /* Add/Edit Product Form */
                <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {editingProduct ? 'Modify Product Specifications' : 'Catalog New Product'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Unique Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. pro-headphones-anc"
                        value={productForm.slug}
                        onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">SKU Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HP-ANC-01"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Brand */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Original Price */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Original MSRP Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Discount Price */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Discount Sale Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.discountPrice}
                        onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Mapped Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stock Inventory */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Stock Inventory Count *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                      />
                    </div>

                    {/* Images */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-semibold text-zinc-500">Images (Comma separated Unsplash URLs) *</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-...,https://images.unsplash.com/photo-..."
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-semibold text-zinc-500">Product Detailed Description</label>
                      <textarea
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Featured flag */}
                    <div className="sm:col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="prod-featured"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                        className="h-4 w-4 accent-indigo-600 rounded"
                      />
                      <label htmlFor="prod-featured" className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Highlight on Home Best Sellers Shelf (Featured)
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Save Product Configurations
                  </button>
                </form>
              ) : (
                /* Products Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-500 dark:text-zinc-400">
                    <thead className="text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-850">
                      <tr>
                        <th className="py-3 px-2">Image</th>
                        <th className="py-3 px-2">Product title</th>
                        <th className="py-3 px-2">SKU / Code</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2">Stock</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-200">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20">
                          <td className="py-3 px-2 shrink-0">
                            <img src={prod.images[0]} alt={prod.title} className="h-9 w-9 rounded-lg object-cover bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800" />
                          </td>
                          <td className="py-3 px-2 font-semibold truncate max-w-[150px]">{prod.title}</td>
                          <td className="py-3 px-2 font-mono text-[10px] text-zinc-400">{prod.sku}</td>
                          <td className="py-3 px-2 font-bold">${(prod.discountPrice || prod.price).toFixed(2)}</td>
                          <td className="py-3 px-2">
                            <span className={`font-semibold ${prod.stock < 5 ? 'text-rose-500' : 'text-zinc-500'}`}>
                              {prod.stock} items
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg"
                                title="Edit Specifications"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES CRUD */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                  Category Directory
                </h3>
                {!isAddingCategory && (
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', slug: '', image: '' });
                      setIsAddingCategory(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Category</span>
                  </button>
                )}
              </div>

              {isAddingCategory ? (
                /* Category Form */
                <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {editingCategory ? 'Modify Category' : 'Register New Category'}
                    </h4>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="text-zinc-400">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Category Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. electronics"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-semibold text-zinc-500">Representative Image (Unsplash URL) *</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.image}
                        onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
                    Save Category Details
                  </button>
                </form>
              ) : (
                /* Categories grid list */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4 p-4 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl relative bg-zinc-50/20 dark:bg-zinc-950/20">
                      <img src={cat.image} alt={cat.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="text-xs space-y-0.5">
                        <h4 className="font-bold text-zinc-900 dark:text-white">{cat.name}</h4>
                        <p className="font-mono text-[10px] text-zinc-400">slug: {cat.slug}</p>
                      </div>

                      <div className="absolute right-3.5 top-3.5 flex gap-1">
                        <button onClick={() => handleEditCategoryClick(cat)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS MODERATION */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Purchase Orders Moderation
              </h3>

              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                    {/* Brief Head */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border-b border-zinc-200/60 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Order Tracking ID</span>
                        <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{order.id}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Customer Email</span>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">{order.userEmail}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Charge</span>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">${order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Placement Date</span>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Items details */}
                      <div className="space-y-2 flex-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Purchase Items</span>
                        {order.products.map((p, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{p.title}</span>
                            <span className="text-zinc-400">× {p.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Triggers actions */}
                      <div className="flex flex-wrap gap-4 shrink-0">
                        {/* Order Status selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delivery Status</label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="p-2 bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Payment Status Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Status</label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                            className="p-2 bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Customer Database Register
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-850">
                    <tr>
                      <th className="py-3 px-2">Customer Profile</th>
                      <th className="py-3 px-2">Email Address</th>
                      <th className="py-3 px-2">Order Count</th>
                      <th className="py-3 px-2">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-200 font-medium">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-2 flex items-center space-x-2">
                          <img src={c.avatar} alt={c.name} className="h-7 w-7 rounded-full object-cover" />
                          <span className="font-semibold">{c.name}</span>
                        </td>
                        <td className="py-3 px-2 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">{c.email}</td>
                        <td className="py-3 px-2">{c.ordersCount} transactions</td>
                        <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">${c.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS ENGINE */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                  Coupons Engine
                </h3>
                {!isAddingCoupon && (
                  <button
                    onClick={() => setIsAddingCoupon(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Coupon</span>
                  </button>
                )}
              </div>

              {isAddingCoupon ? (
                /* Coupon Create Form */
                <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs max-w-md">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure New Coupon</h4>
                    <button type="button" onClick={() => setIsAddingCoupon(false)} className="text-zinc-400">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Coupon Promo Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SUMMER40"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Percentage Discount % *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 40"
                        value={couponForm.discount}
                        onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Expiry Threshold Date *</label>
                      <input
                        type="date"
                        required
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
                    Deploy Active Coupon
                  </button>
                </form>
              ) : (
                /* Coupons Display List */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="p-4 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex items-center justify-between bg-zinc-50/20 dark:bg-zinc-950/20">
                      <div className="text-xs space-y-1">
                        <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">{c.code}</span>
                        <p className="font-semibold pt-1 text-zinc-700 dark:text-zinc-300">Discount Credit: {c.discount}% Off</p>
                        <p className="text-[10px] text-zinc-400">Expiry Date: {c.expiryDate}</p>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: BANNER CAROUSEL MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                  Banners slide HUD
                </h3>
                {!isAddingBanner && (
                  <button
                    onClick={() => setIsAddingBanner(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Banner</span>
                  </button>
                )}
              </div>

              {isAddingBanner ? (
                /* Banner create form */
                <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs max-w-md">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Upload Home Slide Banner</h4>
                    <button type="button" onClick={() => setIsAddingBanner(false)} className="text-zinc-400">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Banner Title *</label>
                      <input
                        type="text"
                        required
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Subtitle / Caption *</label>
                      <input
                        type="text"
                        required
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Image Photo (Unsplash URL) *</label>
                      <input
                        type="text"
                        required
                        value={bannerForm.image}
                        onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500">Target Redirect Link *</label>
                      <input
                        type="text"
                        required
                        placeholder="/shop?category=footwear"
                        value={bannerForm.link}
                        onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
                    Publish Carousel Banner
                  </button>
                </form>
              ) : (
                /* Banners display list */
                <div className="grid grid-cols-1 gap-4">
                  {banners.map((b) => (
                    <div key={b.id} className="p-4 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/20 dark:bg-zinc-950/20 text-xs">
                      <img src={b.image} alt={b.title} className="h-16 w-32 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 space-y-0.5 text-zinc-700 dark:text-zinc-300">
                        <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{b.title}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{b.subtitle}</p>
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">slug mapping: {b.link}</p>
                      </div>
                      <button onClick={() => handleDeleteBanner(b.id)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl shrink-0">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REVIEWS MODERATOR */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Pending Reviews Moderation Queue
              </h3>

              {pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((rev) => (
                    <div key={rev.id} className="p-5 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl space-y-3 text-xs relative bg-zinc-50/25 dark:bg-zinc-950/25">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                            Product SKU: {rev.productTitle}
                          </span>
                          <h4 className="font-semibold text-zinc-900 dark:text-white mt-2">Author: {rev.userName}</h4>
                          <span className="text-[10px] text-zinc-400">Date: {new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Approved/Delete review buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApproveReview(rev.productId, rev.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 rounded-xl flex items-center gap-1 font-semibold"
                            title="Approve & Publish Live"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Publish</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.productId, rev.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 rounded-xl"
                            title="Reject & Delete"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-850 italic text-zinc-500 leading-normal">
                        "{rev.comment}"
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-zinc-400 italic">
                  No pending reviews are waiting in the moderation queue.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
