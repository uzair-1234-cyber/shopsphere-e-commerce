import React, { useState } from 'react';
import { Package, MapPin, Heart, User, CheckCircle, Truck, ShoppingCart, Trash2, ShieldCheck, Mail, Edit } from 'lucide-react';
import { User as UserType, Order, Product, Address } from '../types';

interface DashboardViewProps {
  currentUser: UserType | null;
  orders: Order[];
  products: Product[];
  wishlist: string[];
  cartItemIds: string[];
  onUpdateProfile: (data: any) => Promise<UserType>;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (productId: string, e: React.MouseEvent) => void;
  onNavigate: (view: string, params?: any) => void;
}

export default function DashboardView({
  currentUser,
  orders,
  products,
  wishlist,
  cartItemIds,
  onUpdateProfile,
  onRemoveFromWishlist,
  onAddToCart,
  onNavigate,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');

  // Profile forms state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Address sub-state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressLine1, setAddressLine1] = useState(currentUser?.addresses?.[0]?.addressLine1 || '');
  const [city, setCity] = useState(currentUser?.addresses?.[0]?.city || '');
  const [state, setState] = useState(currentUser?.addresses?.[0]?.state || '');
  const [postalCode, setPostalCode] = useState(currentUser?.addresses?.[0]?.postalCode || '');
  const [phone, setPhone] = useState(currentUser?.addresses?.[0]?.phone || '');

  if (!currentUser) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-8">
        <User className="h-10 w-10 text-zinc-400 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Authentication Required</h3>
        <p className="text-xs text-zinc-500">Sign in to your ShopSphere account to review orders, wishlists, and edit settings.</p>
        <button
          onClick={() => onNavigate('login')}
          className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.userId === currentUser.id);
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const addresses: Address[] = [];
      if (addressLine1.trim()) {
        addresses.push({
          fullName: name,
          addressLine1,
          city,
          state,
          postalCode,
          country: 'United States',
          phone,
        });
      }

      await onUpdateProfile({
        userId: currentUser.id,
        name,
        email,
        addresses,
      });

      setUpdateSuccess(true);
      setIsEditingAddress(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="pb-16" id="customer-dashboard">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          {/* Brief Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-3.5">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="h-16 w-16 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover mx-auto"
            />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{currentUser.name}</h3>
              <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* Navigation items */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Purchase History</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Profile & Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>My Wishlist ({wishlist.length})</span>
            </button>
          </div>
        </aside>

        {/* Content Box */}
        <main className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 min-h-[400px]">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Your Orders History
              </h3>

              {userOrders.length > 0 ? (
                <div className="space-y-6">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden"
                    >
                      {/* Header details */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800 flex flex-wrap justify-between gap-3 text-xs">
                        <div>
                          <p className="text-zinc-400">Order Placed Date</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Total Price</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">${order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Ship To Destination</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                            {order.shippingAddress.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Order ID</p>
                          <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{order.id}</p>
                        </div>
                      </div>

                      {/* Items summaries */}
                      <div className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {order.orderStatus}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>

                        <div className="divide-y divide-zinc-50 dark:divide-zinc-850">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 text-xs first:pt-0 last:pb-0">
                              <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.title} className="h-10 w-10 rounded-lg object-cover bg-zinc-50 dark:bg-zinc-950" />
                                <div>
                                  <h4 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.title}</h4>
                                  <p className="text-[10px] text-zinc-400">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-zinc-400 italic">
                  You have not created any orders on ShopSphere yet.
                </div>
              )}
            </div>
          )}

          {/* PROFILE & ADDRESS TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                Profile & Address Settings
              </h3>

              {updateSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-start space-x-2 text-xs leading-normal">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="font-bold">Settings Updated Successfully!</span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Your profile adjustments and addresses have been synchronized.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-6 text-xs">
                {/* Account details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-500">My Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Addresses display */}
                <div className="border-t border-zinc-100 dark:border-zinc-850 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Saved Shipping Address</h4>
                    {!isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit Address</span>
                      </button>
                    )}
                  </div>

                  {!isEditingAddress && currentUser.addresses && currentUser.addresses.length > 0 ? (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-650 dark:text-zinc-300">
                      <p className="font-bold text-zinc-900 dark:text-white">{currentUser.addresses[0].fullName}</p>
                      <p>{currentUser.addresses[0].addressLine1}</p>
                      {currentUser.addresses[0].addressLine2 && <p>{currentUser.addresses[0].addressLine2}</p>}
                      <p>
                        {currentUser.addresses[0].city}, {currentUser.addresses[0].state} {currentUser.addresses[0].postalCode}
                      </p>
                      <p>{currentUser.addresses[0].country}</p>
                      <p className="mt-2 text-zinc-400">Phone: {currentUser.addresses[0].phone}</p>
                    </div>
                  ) : (isEditingAddress || !currentUser.addresses || currentUser.addresses.length === 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-semibold text-zinc-500">Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="Street and house number"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-zinc-500">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. San Francisco"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-zinc-500">State / Province *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CA"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-zinc-500">Postal Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 94103"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-zinc-500">Mobile Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +1 555-0100"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/10"
                >
                  {isUpdating ? 'Synchronizing Profile...' : 'Save Profile Adjustments'}
                </button>
              </form>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-850">
                My Favorites List ({wishlistProducts.length})
              </h3>

              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistProducts.map((product) => {
                    const price = product.discountPrice || product.price;
                    const isCart = cartItemIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl relative"
                      >
                        <img src={product.images[0]} alt={product.title} className="h-16 w-16 rounded-xl object-cover bg-zinc-50 dark:bg-zinc-950 shrink-0" />
                        <div className="flex-1 min-w-0 text-xs space-y-0.5">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{product.brand}</span>
                          <h4
                            onClick={() => onNavigate(`details?id=${product.id}`)}
                            className="font-semibold text-zinc-900 dark:text-white truncate cursor-pointer hover:underline"
                          >
                            {product.title}
                          </h4>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">${price.toFixed(2)}</p>

                          <div className="pt-2 flex items-center space-x-2">
                            {product.stock > 0 ? (
                              <button
                                onClick={(e) => onAddToCart(product.id, e)}
                                className="px-2.5 py-1 bg-indigo-600 text-white font-medium rounded-lg text-[10px] hover:bg-indigo-700 transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="h-3 w-3" />
                                <span>{isCart ? 'Add More' : 'Add to Cart'}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 uppercase">Sold Out</span>
                            )}

                            <button
                              onClick={() => onRemoveFromWishlist(product.id)}
                              className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                              title="Delete from Wishlist"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-zinc-400 italic">
                  You have not added any products to your wishlist.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
