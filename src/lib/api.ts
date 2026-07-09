import { Product, Category, Banner, Coupon, Order, User } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (data: any) => request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<User>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data: { userId: string; name?: string; email?: string; avatar?: string; addresses?: any[] }) =>
    request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: any) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<Product[]>('/products'),
  createProduct: (data: any) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Reviews
  createReview: (productId: string, data: { userId?: string; userName?: string; rating: number; comment: string }) =>
    request<any>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  approveReview: (productId: string, reviewId: string) =>
    request<{ success: boolean }>(`/reviews/${productId}/${reviewId}/approve`, { method: 'PUT' }),
  deleteReview: (productId: string, reviewId: string) =>
    request<{ success: boolean }>(`/reviews/${productId}/${reviewId}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: () => request<Coupon[]>('/coupons'),
  createCoupon: (data: any) => request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => request<{ success: boolean }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request<Order[]>('/orders'),
  createOrder: (data: any) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string, data: { orderStatus?: string; paymentStatus?: string }) =>
    request<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Banners
  getBanners: () => request<Banner[]>('/banners'),
  createBanner: (data: any) => request<Banner>('/banners', { method: 'POST', body: JSON.stringify(data) }),
  deleteBanner: (id: string) => request<{ success: boolean }>(`/banners/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => request<any[]>('/customers'),

  // Analytics (Admin Only)
  getAnalytics: () => request<{
    revenue: number;
    ordersCount: number;
    customersCount: number;
    productsCount: number;
    salesHistory: { date: string; sales: number }[];
  }>('/analytics'),
};
