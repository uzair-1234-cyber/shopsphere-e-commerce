export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  addresses?: Address[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string; // matches Category slug or id
  brand: string;
  stock: number;
  sku: string;
  rating: number;
  reviews: Review[];
  featured: boolean;
  createdAt: string;
}

export interface OrderProduct {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: OrderProduct[];
  shippingAddress: Address;
  paymentMethod: 'Stripe' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalPrice: number;
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // percentage
  expiryDate: string;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: 'hero' | 'promo';
}

export interface CartItem {
  productId: string;
  quantity: number;
}
