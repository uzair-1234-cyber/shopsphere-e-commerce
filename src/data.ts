import { Product, Category, Banner, Coupon } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-2',
    name: 'Footwear',
    slug: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-3',
    name: 'Apparel',
    slug: 'apparel',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-4',
    name: 'Home & Living',
    slug: 'home-living',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'The Next Generation of Sound',
    subtitle: 'Immerse yourself in pure luxury with our active noise-canceling studio headsets.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
    link: '/shop?category=electronics',
    position: 'hero',
  },
  {
    id: 'banner-2',
    title: 'Step Into the Future',
    subtitle: 'Limited edition ultra-breathable running sneakers designed for maximum kinetic return.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    link: '/shop?category=footwear',
    position: 'hero',
  },
  {
    id: 'banner-3',
    title: 'Summer Essentials Up to 40% Off',
    subtitle: 'Upgrade your seasonal wardrobe with sustainable premium essentials.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80',
    link: '/shop?category=apparel',
    position: 'promo',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WELCOME10',
    discount: 10,
    expiryDate: '2026-12-31',
    active: true,
  },
  {
    id: 'coupon-2',
    code: 'SUPER30',
    discount: 30,
    expiryDate: '2026-09-01',
    active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Pro Sound Wireless Headphones',
    slug: 'pro-sound-wireless-headphones',
    description: 'Experience professional-grade acoustic clarity. Designed with high-density memory foam ear cups, advanced active noise cancellation (ANC), and custom-engineered 40mm dynamic drivers. Features seamless Bluetooth 5.2 connectivity and up to 45 hours of continuous high-fidelity playback on a single charge.',
    price: 299.99,
    discountPrice: 249.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'electronics',
    brand: 'Acoustix',
    stock: 14,
    sku: 'ANC-HP-001',
    rating: 4.8,
    reviews: [
      {
        id: 'rev-1',
        userId: 'user-2',
        userName: 'Alex Johnson',
        rating: 5,
        comment: 'Best headphones I have ever owned. The active noise canceling is incredibly isolating and the bass is tight without overpowering the mid-range details.',
        approved: true,
        createdAt: '2026-06-20T10:30:00Z',
      },
      {
        id: 'rev-2',
        userId: 'user-3',
        userName: 'Sarah Miller',
        rating: 4,
        comment: 'Very comfortable for long working hours. Battery life is stellar!',
        approved: true,
        createdAt: '2026-06-25T14:15:00Z',
      }
    ],
    featured: true,
    createdAt: '2026-05-15T08:00:00Z',
  },
  {
    id: 'prod-2',
    title: 'AirFlow Athletic Sneakers',
    slug: 'airflow-athletic-sneakers',
    description: 'Engineered for athletes who demand style and utility. Features our kinetic proprietary dual-density foam sole for maximum shock absorption and a light, breathable woven mesh upper for exceptional temperature control. Hand-crafted with eco-friendly recycled materials.',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'footwear',
    brand: 'Kinetix',
    stock: 25,
    sku: 'AF-SNK-02',
    rating: 4.5,
    reviews: [
      {
        id: 'rev-3',
        userId: 'user-4',
        userName: 'David Clark',
        rating: 5,
        comment: 'Feels like walking on clouds. Excellent heel support for daily jogging!',
        approved: true,
        createdAt: '2026-06-28T16:40:00Z',
      }
    ],
    featured: true,
    createdAt: '2026-05-18T12:30:00Z',
  },
  {
    id: 'prod-3',
    title: 'Minimalist Titanium Smart Watch',
    slug: 'minimalist-titanium-smart-watch',
    description: 'A seamless blend of horological craftsmanship and state-of-the-art smart features. Built with an aerospace-grade titanium chassis, scratch-resistant sapphire crystal glass, and an ultra-vibrant Always-On AMOLED panel. Features comprehensive health sensors including heart-rate tracking, sleep cycle mapping, and blood oxygen levels.',
    price: 399.99,
    discountPrice: 349.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'electronics',
    brand: 'Chronos',
    stock: 8,
    sku: 'TM-WTCH-99',
    rating: 4.9,
    reviews: [
      {
        id: 'rev-4',
        userId: 'user-5',
        userName: 'Emma Watson',
        rating: 5,
        comment: 'The craftsmanship is absolutely gorgeous. Highly premium feel, accurate fitness tracking, and the battery easily lasts 5 full days.',
        approved: true,
        createdAt: '2026-07-02T09:12:00Z',
      }
    ],
    featured: true,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'prod-4',
    title: 'Premium Organic Cotton Hoodie',
    slug: 'premium-organic-cotton-hoodie',
    description: 'An elevated basic for modern luxury loungewear. Tailored from 100% GOTS-certified heavyweight organic cotton French Terry. Relaxed silhouette featuring double-lined structural hood, custom gunmetal silver hardware, and secure internal kangaroo pocket lining.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'apparel',
    brand: 'Natura',
    stock: 40,
    sku: 'OC-HD-04',
    rating: 4.2,
    reviews: [],
    featured: false,
    createdAt: '2026-06-10T11:20:00Z',
  },
  {
    id: 'prod-5',
    title: 'Aroma diffuser & Ambient lamp',
    slug: 'aroma-diffuser-ambient-lamp',
    description: 'Transform your living space into a serene sanctuary. Combines an ultra-silent ultrasonic essential oil diffuser with a high-end ambient warm-hued glowing lamp. Handcrafted with clean porcelain and solid white oak wood base. Features customizable mist modes and auto-off timer.',
    price: 69.99,
    discountPrice: 49.99,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'home-living',
    brand: 'SereneSpace',
    stock: 12,
    sku: 'AD-LAMP-10',
    rating: 4.6,
    reviews: [],
    featured: false,
    createdAt: '2026-06-12T15:45:00Z',
  },
  {
    id: 'prod-6',
    title: 'Classic Leather Travel Duffel',
    slug: 'classic-leather-travel-duffel',
    description: 'A handsome, enduring companion for weekend getaways and business trips. Meticulously handcrafted from premium full-grain vegetable-tanned Italian leather. Equipped with dynamic brass fittings, durable YKK metal zippers, and expandable side compartments.',
    price: 249.99,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'apparel',
    brand: 'Heritage',
    stock: 5,
    sku: 'CL-DFL-25',
    rating: 4.7,
    reviews: [],
    featured: false,
    createdAt: '2026-06-15T18:00:00Z',
  }
];
