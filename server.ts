import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// 1. MONGOOSE BLUEPRINTS & SCHEMAS (PRODUCTION DELIVERABLE)
// ==========================================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  addresses: { type: Array, default: [] },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String, required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Array, default: [] },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  products: [{
    productId: String,
    title: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  paymentMethod: { type: String, enum: ['Stripe', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  totalPrice: { type: Number, required: true },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiryDate: { type: String, required: true },
  active: { type: Boolean, default: true },
});

// Setup Lazy-initialized Mongoose Models (if connected)
let MUser: any, MProduct: any, MCategory: any, MOrder: any, MCoupon: any;
let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB Connected successfully!');
      isMongoConnected = true;
      MUser = mongoose.model('User', UserSchema);
      MProduct = mongoose.model('Product', ProductSchema);
      MCategory = mongoose.model('Category', CategorySchema);
      MOrder = mongoose.model('Order', OrderSchema);
      MCoupon = mongoose.model('Coupon', CouponSchema);
    })
    .catch((err) => {
      console.error('MongoDB initial connection error:', err.message);
    });
}

// ==========================================
// 2. ULTRA-ROBUST FILE-BASED LOCAL DB FALLBACK (FOR INSTANT AI STUDIO PREVIEW)
// ==========================================
const DB_FILE_PATH = path.join(process.cwd(), '.data.json');

// Helper to seed standard initial data if file DB does not exist
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_BANNERS } from './src/data';

function loadLocalDB() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const seedData = {
      users: [
        {
          id: 'user-1',
          name: 'Admin ShopSphere',
          email: 'admin@shopsphere.com',
          password: 'adminpassword',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          addresses: []
        },
        {
          id: 'user-2',
          name: 'Demo Customer',
          email: 'customer@shopsphere.com',
          password: 'customerpassword',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          addresses: [
            {
              fullName: 'Demo Customer',
              addressLine1: '123 Premium Lane',
              addressLine2: 'Suite 400',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94103',
              country: 'United States',
              phone: '+1 555-123-4567'
            }
          ]
        }
      ],
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      orders: [
        {
          id: 'order-1',
          userId: 'user-2',
          userEmail: 'customer@shopsphere.com',
          userName: 'Demo Customer',
          products: [
            {
              productId: 'prod-1',
              title: 'Pro Sound Wireless Headphones',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=80&q=80',
              price: 249.99,
              quantity: 1
            }
          ],
          shippingAddress: {
            fullName: 'Demo Customer',
            addressLine1: '123 Premium Lane',
            addressLine2: 'Suite 400',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'United States',
            phone: '+1 555-123-4567'
          },
          paymentMethod: 'COD',
          paymentStatus: 'Pending',
          orderStatus: 'Processing',
          totalPrice: 249.99,
          createdAt: '2026-07-01T15:20:00Z'
        },
        {
          id: 'order-2',
          userId: 'user-2',
          userEmail: 'customer@shopsphere.com',
          userName: 'Demo Customer',
          products: [
            {
              productId: 'prod-2',
              title: 'AirFlow Athletic Sneakers',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80',
              price: 159.99,
              quantity: 2
            }
          ],
          shippingAddress: {
            fullName: 'Demo Customer',
            addressLine1: '123 Premium Lane',
            addressLine2: 'Suite 400',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'United States',
            phone: '+1 555-123-4567'
          },
          paymentMethod: 'Stripe',
          paymentStatus: 'Paid',
          orderStatus: 'Delivered',
          totalPrice: 319.98,
          createdAt: '2026-07-05T10:45:00Z'
        }
      ]
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seedData, null, 2));
    return seedData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE_PATH, 'utf-8'));
}

function saveLocalDB(data: any) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
}

// ==========================================
// 3. API ENDPOINTS (Dual DB controllers)
// ==========================================

// --- AUTHENTICATION ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = loadLocalDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email: email.toLowerCase(),
    password, // In full production, bcrypt hash is used here
    role: 'customer',
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    addresses: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveLocalDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadLocalDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/auth/profile', (req, res) => {
  const { userId, name, email, avatar, addresses } = req.body;
  const db = loadLocalDB();
  const idx = db.users.findIndex((u: any) => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = db.users[idx];
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (avatar) user.avatar = avatar;
  if (addresses) user.addresses = addresses;

  db.users[idx] = user;
  saveLocalDB(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// --- CATEGORIES ---
app.get('/api/categories', (req, res) => {
  const db = loadLocalDB();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const { name, slug, image } = req.body;
  if (!name || !slug || !image) {
    return res.status(400).json({ error: 'All category fields are required' });
  }
  const db = loadLocalDB();
  const newCat = { id: 'cat-' + Date.now(), name, slug, image };
  db.categories.push(newCat);
  saveLocalDB(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, slug, image } = req.body;
  const db = loadLocalDB();
  const idx = db.categories.findIndex((c: any) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });

  db.categories[idx] = { ...db.categories[idx], name, slug, image };
  saveLocalDB(db);
  res.json(db.categories[idx]);
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const db = loadLocalDB();
  db.categories = db.categories.filter((c: any) => c.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const db = loadLocalDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const p = req.body;
  if (!p.title || !p.slug || !p.price || !p.category || !p.brand || p.stock === undefined || !p.sku) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }
  const db = loadLocalDB();
  const newProduct = {
    id: 'prod-' + Date.now(),
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    price: parseFloat(p.price),
    discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : undefined,
    images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'],
    category: p.category,
    brand: p.brand,
    stock: parseInt(p.stock),
    sku: p.sku,
    rating: p.rating || 5,
    reviews: [],
    featured: p.featured || false,
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);
  saveLocalDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const p = req.body;
  const db = loadLocalDB();
  const idx = db.products.findIndex((prod: any) => prod.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  db.products[idx] = {
    ...db.products[idx],
    title: p.title,
    slug: p.slug,
    description: p.description,
    price: parseFloat(p.price),
    discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : undefined,
    images: p.images,
    category: p.category,
    brand: p.brand,
    stock: parseInt(p.stock),
    sku: p.sku,
    featured: p.featured
  };

  saveLocalDB(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const db = loadLocalDB();
  db.products = db.products.filter((prod: any) => prod.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});

// --- REVIEWS ---
app.post('/api/products/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { userId, userName, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const db = loadLocalDB();
  const prodIdx = db.products.findIndex((p: any) => p.id === id);
  if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });

  const newReview = {
    id: 'rev-' + Date.now(),
    userId: userId || 'anonymous',
    userName: userName || 'Anonymous',
    rating: parseInt(rating),
    comment,
    approved: false, // Default to false, require admin approval
    createdAt: new Date().toISOString()
  };

  db.products[prodIdx].reviews.push(newReview);
  // Recalculate average rating of approved reviews
  const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
  if (approved.length > 0) {
    const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
    db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));
  }

  saveLocalDB(db);
  res.json(newReview);
});

// Approve/Delete review
app.put('/api/reviews/:prodId/:revId/approve', (req, res) => {
  const { prodId, revId } = req.params;
  const db = loadLocalDB();
  const prodIdx = db.products.findIndex((p: any) => p.id === prodId);
  if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });

  const revIdx = db.products[prodIdx].reviews.findIndex((r: any) => r.id === revId);
  if (revIdx === -1) return res.status(404).json({ error: 'Review not found' });

  db.products[prodIdx].reviews[revIdx].approved = true;

  // Recalculate rating
  const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
  const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
  db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));

  saveLocalDB(db);
  res.json({ success: true });
});

app.delete('/api/reviews/:prodId/:revId', (req, res) => {
  const { prodId, revId } = req.params;
  const db = loadLocalDB();
  const prodIdx = db.products.findIndex((p: any) => p.id === prodId);
  if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });

  db.products[prodIdx].reviews = db.products[prodIdx].reviews.filter((r: any) => r.id !== revId);

  // Recalculate rating
  const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
  if (approved.length > 0) {
    const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
    db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));
  } else {
    db.products[prodIdx].rating = 5;
  }

  saveLocalDB(db);
  res.json({ success: true });
});


// --- COUPONS ---
app.get('/api/coupons', (req, res) => {
  const db = loadLocalDB();
  res.json(db.coupons);
});

app.post('/api/coupons', (req, res) => {
  const { code, discount, expiryDate } = req.body;
  if (!code || !discount || !expiryDate) {
    return res.status(400).json({ error: 'All coupon fields are required' });
  }
  const db = loadLocalDB();
  const newCoupon = {
    id: 'coupon-' + Date.now(),
    code: code.toUpperCase(),
    discount: parseFloat(discount),
    expiryDate,
    active: true
  };
  db.coupons.push(newCoupon);
  saveLocalDB(db);
  res.status(201).json(newCoupon);
});

app.delete('/api/coupons/:id', (req, res) => {
  const { id } = req.params;
  const db = loadLocalDB();
  db.coupons = db.coupons.filter((c: any) => c.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});


// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  const db = loadLocalDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const { userId, userEmail, userName, products, shippingAddress, paymentMethod, totalPrice, couponCode, discountAmount } = req.body;
  if (!userId || !products || products.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Invalid order detail parameters' });
  }

  const db = loadLocalDB();

  // Deduct inventory stock
  for (const item of products) {
    const pIdx = db.products.findIndex((p: any) => p.id === item.productId);
    if (pIdx !== -1) {
      db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
    }
  }

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    userId,
    userEmail,
    userName,
    products,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'Stripe' ? 'Paid' : 'Pending', // Simulate paid for Stripe
    orderStatus: 'Pending',
    totalPrice: parseFloat(totalPrice),
    couponCode,
    discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  saveLocalDB(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  const db = loadLocalDB();
  const idx = db.orders.findIndex((o: any) => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });

  if (orderStatus) db.orders[idx].orderStatus = orderStatus;
  if (paymentStatus) db.orders[idx].paymentStatus = paymentStatus;

  saveLocalDB(db);
  res.json(db.orders[idx]);
});

// --- BANNERS ---
app.get('/api/banners', (req, res) => {
  const db = loadLocalDB();
  res.json(db.banners);
});

app.post('/api/banners', (req, res) => {
  const { title, subtitle, image, link, position } = req.body;
  const db = loadLocalDB();
  const newBanner = {
    id: 'banner-' + Date.now(),
    title,
    subtitle,
    image,
    link,
    position
  };
  db.banners.push(newBanner);
  saveLocalDB(db);
  res.status(201).json(newBanner);
});

app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const db = loadLocalDB();
  db.banners = db.banners.filter((b: any) => b.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});

// --- ADMIN ANALYTICS ---
app.get('/api/analytics', (req, res) => {
  const db = loadLocalDB();
  
  const totalRevenue = db.orders
    .filter((o: any) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
    .reduce((acc: number, o: any) => acc + o.totalPrice, 0);

  const totalOrders = db.orders.length;
  const totalCustomers = db.users.filter((u: any) => u.role === 'customer').length;
  const totalProducts = db.products.length;

  // Generate sales history charts
  const salesHistory = [
    { date: 'Jul 03', sales: 420 },
    { date: 'Jul 04', sales: 680 },
    { date: 'Jul 05', sales: 810 },
    { date: 'Jul 06', sales: 590 },
    { date: 'Jul 07', sales: 980 },
    { date: 'Jul 08', sales: 1250 },
    { date: 'Jul 09', sales: totalRevenue > 0 ? parseFloat(totalRevenue.toFixed(0)) : 1450 },
  ];

  res.json({
    revenue: parseFloat(totalRevenue.toFixed(2)),
    ordersCount: totalOrders,
    customersCount: totalCustomers,
    productsCount: totalProducts,
    salesHistory
  });
});

// --- CUSTOMERS ---
app.get('/api/customers', (req, res) => {
  const db = loadLocalDB();
  const customers = db.users
    .filter((u: any) => u.role === 'customer')
    .map((u: any) => {
      const customerOrders = db.orders.filter((o: any) => o.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        ordersCount: customerOrders.length,
        totalSpent: parseFloat(customerOrders.reduce((sum: number, o: any) => sum + o.totalPrice, 0).toFixed(2)),
        createdAt: u.createdAt || '2026-06-01T00:00:00Z'
      };
    });
  res.json(customers);
});


// ==========================================
// 4. VITE DEV SERVER OR STATIC PROD PRODUCTION MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopSphere] Full-stack Dev server listening on http://localhost:${PORT}`);
  });
}

startServer();
