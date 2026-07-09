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
const schemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret.id || ret._id?.toString() || '';
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret.id || ret._id?.toString() || '';
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  timestamps: true
};

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  addresses: { type: Array, default: [] },
}, schemaOptions);

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
  rating: { type: Number, default: 5 },
  reviews: { type: Array, default: [] },
  featured: { type: Boolean, default: false },
}, schemaOptions);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
}, schemaOptions);

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
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
}, schemaOptions);

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiryDate: { type: String, required: true },
  active: { type: Boolean, default: true },
}, schemaOptions);

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  position: { type: String, enum: ['hero', 'promo'], default: 'hero' },
}, schemaOptions);

// Setup Lazy-initialized Mongoose Models
let MUser: any, MProduct: any, MCategory: any, MOrder: any, MCoupon: any, MBanner: any;
let isMongoConnected = false;

async function seedMongoDB() {
  try {
    const productCount = await MProduct.countDocuments();
    if (productCount === 0) {
      console.log('[MongoDB] Seeding initial products...');
      await MProduct.insertMany(INITIAL_PRODUCTS);
    }
    
    const categoryCount = await MCategory.countDocuments();
    if (categoryCount === 0) {
      console.log('[MongoDB] Seeding initial categories...');
      await MCategory.insertMany(INITIAL_CATEGORIES);
    }

    const couponCount = await MCoupon.countDocuments();
    if (couponCount === 0) {
      console.log('[MongoDB] Seeding initial coupons...');
      await MCoupon.insertMany(INITIAL_COUPONS);
    }

    const bannerCount = await MBanner.countDocuments();
    if (bannerCount === 0) {
      console.log('[MongoDB] Seeding initial banners...');
      await MBanner.insertMany(INITIAL_BANNERS);
    }
    console.log('[MongoDB] Database seeding checked/completed successfully.');
  } catch (err: any) {
    console.error('[MongoDB] Error during seeding:', err.message);
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('MongoDB Connected successfully!');
      isMongoConnected = true;
      MUser = mongoose.model('User', UserSchema);
      MProduct = mongoose.model('Product', ProductSchema);
      MCategory = mongoose.model('Category', CategorySchema);
      MOrder = mongoose.model('Order', OrderSchema);
      MCoupon = mongoose.model('Coupon', CouponSchema);
      MBanner = mongoose.model('Banner', BannerSchema);
      await seedMongoDB();
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

// --- FIREBASE AUTH SYNC ---
app.post('/api/auth/firebase-sync', async (req, res) => {
  const { uid, email, name, avatar } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'UID and Email are required for synchronization' });
  }

  try {
    if (isMongoConnected) {
      let user = await MUser.findOne({ uid });
      if (!user) {
        const userCount = await MUser.countDocuments();
        const role = (userCount === 0 || email === 'admin@shopsphere.com' || email.toLowerCase().includes('admin')) ? 'admin' : 'customer';
        user = await MUser.create({
          uid,
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          role,
          avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`,
          addresses: []
        });
      }
      return res.json(user.toJSON());
    } else {
      // Local fallback
      const db = loadLocalDB();
      let user = db.users.find((u: any) => u.uid === uid || u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: uid,
          uid,
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          role: (db.users.length === 0 || email === 'admin@shopsphere.com' || email.toLowerCase().includes('admin')) ? 'admin' : 'customer',
          avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`,
          addresses: [],
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        saveLocalDB(db);
      }
      return res.json(user);
    }
  } catch (err: any) {
    console.error('Error in firebase-sync route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Retrofitted register endpoint
app.post('/api/auth/register', (req, res) => {
  return res.status(400).json({ error: 'Please sign up securely via our Firebase portal' });
});

// Retrofitted login endpoint
app.post('/api/auth/login', (req, res) => {
  return res.status(400).json({ error: 'Please sign in securely via our Firebase portal' });
});

app.put('/api/auth/profile', async (req, res) => {
  const { userId, name, email, avatar, addresses } = req.body;
  try {
    if (isMongoConnected) {
      const user = await MUser.findOne({ uid: userId });
      if (!user) return res.status(404).json({ error: 'User profile not found' });
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (avatar) user.avatar = avatar;
      if (addresses) user.addresses = addresses;
      await user.save();
      return res.json(user.toJSON());
    } else {
      const db = loadLocalDB();
      const idx = db.users.findIndex((u: any) => u.id === userId || u.uid === userId);
      if (idx === -1) return res.status(404).json({ error: 'User profile not found' });
      const user = db.users[idx];
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (avatar) user.avatar = avatar;
      if (addresses) user.addresses = addresses;
      db.users[idx] = user;
      saveLocalDB(db);
      return res.json(user);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => {
  try {
    if (isMongoConnected) {
      const cats = await MCategory.find();
      return res.json(cats.map((c: any) => c.toJSON()));
    } else {
      const db = loadLocalDB();
      return res.json(db.categories);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, slug, image } = req.body;
  if (!name || !slug || !image) {
    return res.status(400).json({ error: 'All category fields are required' });
  }
  try {
    if (isMongoConnected) {
      const newCat = await MCategory.create({ name, slug, image });
      return res.status(201).json(newCat.toJSON());
    } else {
      const db = loadLocalDB();
      const newCat = { id: 'cat-' + Date.now(), name, slug, image };
      db.categories.push(newCat);
      saveLocalDB(db);
      return res.status(201).json(newCat);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, image } = req.body;
  try {
    if (isMongoConnected) {
      const updated = await MCategory.findByIdAndUpdate(id, { name, slug, image }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Category not found' });
      return res.json(updated.toJSON());
    } else {
      const db = loadLocalDB();
      const idx = db.categories.findIndex((c: any) => c.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Category not found' });
      db.categories[idx] = { ...db.categories[idx], name, slug, image };
      saveLocalDB(db);
      return res.json(db.categories[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      await MCategory.findByIdAndDelete(id);
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      db.categories = db.categories.filter((c: any) => c.id !== id);
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await MProduct.find();
      return res.json(products.map((p: any) => p.toJSON()));
    } else {
      const db = loadLocalDB();
      return res.json(db.products);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const p = req.body;
  if (!p.title || !p.slug || !p.price || !p.category || !p.brand || p.stock === undefined || !p.sku) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }
  try {
    const pData = {
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
    };
    if (isMongoConnected) {
      const newProduct = await MProduct.create(pData);
      return res.status(201).json(newProduct.toJSON());
    } else {
      const db = loadLocalDB();
      const newProduct = {
        id: 'prod-' + Date.now(),
        ...pData,
        createdAt: new Date().toISOString()
      };
      db.products.push(newProduct);
      saveLocalDB(db);
      return res.status(201).json(newProduct);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  try {
    const pData = {
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
    if (isMongoConnected) {
      const updated = await MProduct.findByIdAndUpdate(id, pData, { new: true });
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json(updated.toJSON());
    } else {
      const db = loadLocalDB();
      const idx = db.products.findIndex((prod: any) => prod.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      db.products[idx] = { ...db.products[idx], ...pData };
      saveLocalDB(db);
      return res.json(db.products[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      await MProduct.findByIdAndDelete(id);
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      db.products = db.products.filter((prod: any) => prod.id !== id);
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS ---
app.post('/api/products/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { userId, userName, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  try {
    const newReview = {
      id: 'rev-' + Date.now(),
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      rating: parseInt(rating),
      comment,
      approved: false, // requires admin approval
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const product = await MProduct.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      product.reviews.push(newReview);
      
      const approved = product.reviews.filter((r: any) => r.approved);
      if (approved.length > 0) {
        const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
        product.rating = parseFloat((sum / approved.length).toFixed(1));
      }
      product.markModified('reviews');
      await product.save();
      return res.json(newReview);
    } else {
      const db = loadLocalDB();
      const prodIdx = db.products.findIndex((p: any) => p.id === id);
      if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });
      db.products[prodIdx].reviews.push(newReview);
      
      const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
      if (approved.length > 0) {
        const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
        db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));
      }
      saveLocalDB(db);
      return res.json(newReview);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:prodId/:revId/approve', async (req, res) => {
  const { prodId, revId } = req.params;
  try {
    if (isMongoConnected) {
      const product = await MProduct.findById(prodId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const revIdx = product.reviews.findIndex((r: any) => r.id === revId);
      if (revIdx === -1) return res.status(404).json({ error: 'Review not found' });
      
      product.reviews[revIdx].approved = true;
      const approved = product.reviews.filter((r: any) => r.approved);
      const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
      product.rating = parseFloat((sum / approved.length).toFixed(1));
      product.markModified('reviews');
      await product.save();
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      const prodIdx = db.products.findIndex((p: any) => p.id === prodId);
      if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });
      const revIdx = db.products[prodIdx].reviews.findIndex((r: any) => r.id === revId);
      if (revIdx === -1) return res.status(404).json({ error: 'Review not found' });
      
      db.products[prodIdx].reviews[revIdx].approved = true;
      const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
      const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
      db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:prodId/:revId', async (req, res) => {
  const { prodId, revId } = req.params;
  try {
    if (isMongoConnected) {
      const product = await MProduct.findById(prodId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      product.reviews = product.reviews.filter((r: any) => r.id !== revId);
      
      const approved = product.reviews.filter((r: any) => r.approved);
      if (approved.length > 0) {
        const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
        product.rating = parseFloat((sum / approved.length).toFixed(1));
      } else {
        product.rating = 5;
      }
      product.markModified('reviews');
      await product.save();
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      const prodIdx = db.products.findIndex((p: any) => p.id === prodId);
      if (prodIdx === -1) return res.status(404).json({ error: 'Product not found' });
      db.products[prodIdx].reviews = db.products[prodIdx].reviews.filter((r: any) => r.id !== revId);
      
      const approved = db.products[prodIdx].reviews.filter((r: any) => r.approved);
      if (approved.length > 0) {
        const sum = approved.reduce((acc: number, r: any) => acc + r.rating, 0);
        db.products[prodIdx].rating = parseFloat((sum / approved.length).toFixed(1));
      } else {
        db.products[prodIdx].rating = 5;
      }
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COUPONS ---
app.get('/api/coupons', async (req, res) => {
  try {
    if (isMongoConnected) {
      const coupons = await MCoupon.find();
      return res.json(coupons.map((c: any) => c.toJSON()));
    } else {
      const db = loadLocalDB();
      return res.json(db.coupons);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  const { code, discount, expiryDate } = req.body;
  if (!code || !discount || !expiryDate) {
    return res.status(400).json({ error: 'All coupon fields are required' });
  }
  try {
    if (isMongoConnected) {
      const newCoupon = await MCoupon.create({
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        expiryDate,
        active: true
      });
      return res.status(201).json(newCoupon.toJSON());
    } else {
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
      return res.status(201).json(newCoupon);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      await MCoupon.findByIdAndDelete(id);
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      db.coupons = db.coupons.filter((c: any) => c.id !== id);
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ---
app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await MOrder.find();
      return res.json(orders.map((o: any) => o.toJSON()));
    } else {
      const db = loadLocalDB();
      return res.json(db.orders);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, userEmail, userName, products, shippingAddress, paymentMethod, totalPrice, couponCode, discountAmount } = req.body;
  if (!userId || !products || products.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Invalid order detail parameters' });
  }

  try {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      id: orderId,
      userId,
      userEmail,
      userName,
      products,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      totalPrice: parseFloat(totalPrice),
      couponCode,
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
    };

    if (isMongoConnected) {
      for (const item of products) {
        const prod = await MProduct.findById(item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          await prod.save();
        }
      }
      const newOrder = await MOrder.create(orderData);
      return res.status(201).json(newOrder.toJSON());
    } else {
      const db = loadLocalDB();
      for (const item of products) {
        const pIdx = db.products.findIndex((p: any) => p.id === item.productId);
        if (pIdx !== -1) {
          db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
        }
      }
      const newOrder = {
        ...orderData,
        createdAt: new Date().toISOString()
      };
      db.orders.push(newOrder);
      saveLocalDB(db);
      return res.status(201).json(newOrder);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout/create-session', async (req, res) => {
  const { orderId, totalPrice, origin } = req.body;
  if (!orderId || !totalPrice || !origin) {
    return res.status(400).json({ error: 'Missing required parameters: orderId, totalPrice, or origin' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.warn('[Stripe] STRIPE_SECRET_KEY environment variable is not defined. Falling back to sandbox/demo mode.');
    return res.json({ url: null, message: 'demo-mode' });
  }

  try {
    const successUrl = `${origin}/?payment_success=true&order_id=${orderId}`;
    const cancelUrl = `${origin}/?payment_cancel=true&order_id=${orderId}`;

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `ShopSphere Order #${orderId}`,
        'line_items[0][price_data][unit_amount]': Math.round(totalPrice * 100).toString(),
        'line_items[0][quantity]': '1',
        'metadata[orderId]': orderId
      }).toString()
    });

    const sessionData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('[Stripe API Error]', sessionData);
      return res.status(400).json({ error: sessionData.error?.message || 'Stripe API communication failed.' });
    }

    return res.json({ url: sessionData.url });
  } catch (err: any) {
    console.error('[Stripe Catch Error]', err);
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  try {
    if (isMongoConnected) {
      const order = await MOrder.findOne({ id });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save();
      return res.json(order.toJSON());
    } else {
      const db = loadLocalDB();
      const idx = db.orders.findIndex((o: any) => o.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Order not found' });
      if (orderStatus) db.orders[idx].orderStatus = orderStatus;
      if (paymentStatus) db.orders[idx].paymentStatus = paymentStatus;
      saveLocalDB(db);
      return res.json(db.orders[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- BANNERS ---
app.get('/api/banners', async (req, res) => {
  try {
    if (isMongoConnected) {
      const banners = await MBanner.find();
      return res.json(banners.map((b: any) => b.toJSON()));
    } else {
      const db = loadLocalDB();
      return res.json(db.banners);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banners', async (req, res) => {
  const { title, subtitle, image, link, position } = req.body;
  try {
    if (isMongoConnected) {
      const newBanner = await MBanner.create({ title, subtitle, image, link, position });
      return res.status(201).json(newBanner.toJSON());
    } else {
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
      return res.status(201).json(newBanner);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      await MBanner.findByIdAndDelete(id);
      return res.json({ success: true });
    } else {
      const db = loadLocalDB();
      db.banners = db.banners.filter((b: any) => b.id !== id);
      saveLocalDB(db);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ANALYTICS ---
app.get('/api/analytics', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await MOrder.find();
      const productsCount = await MProduct.countDocuments();
      const customersCount = await MUser.countDocuments({ role: 'customer' });
      
      const totalRevenue = orders
        .filter((o: any) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
        .reduce((acc: number, o: any) => acc + o.totalPrice, 0);

      const salesHistory = [
        { date: 'Jul 03', sales: 420 },
        { date: 'Jul 04', sales: 680 },
        { date: 'Jul 05', sales: 810 },
        { date: 'Jul 06', sales: 590 },
        { date: 'Jul 07', sales: 980 },
        { date: 'Jul 08', sales: 1250 },
        { date: 'Jul 09', sales: totalRevenue > 0 ? parseFloat(totalRevenue.toFixed(0)) : 1450 },
      ];

      return res.json({
        revenue: parseFloat(totalRevenue.toFixed(2)),
        ordersCount: orders.length,
        customersCount,
        productsCount,
        salesHistory
      });
    } else {
      const db = loadLocalDB();
      const totalRevenue = db.orders
        .filter((o: any) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
        .reduce((acc: number, o: any) => acc + o.totalPrice, 0);

      const totalOrders = db.orders.length;
      const totalCustomers = db.users.filter((u: any) => u.role === 'customer').length;
      const totalProducts = db.products.length;

      const salesHistory = [
        { date: 'Jul 03', sales: 420 },
        { date: 'Jul 04', sales: 680 },
        { date: 'Jul 05', sales: 810 },
        { date: 'Jul 06', sales: 590 },
        { date: 'Jul 07', sales: 980 },
        { date: 'Jul 08', sales: 1250 },
        { date: 'Jul 09', sales: totalRevenue > 0 ? parseFloat(totalRevenue.toFixed(0)) : 1450 },
      ];

      return res.json({
        revenue: parseFloat(totalRevenue.toFixed(2)),
        ordersCount: totalOrders,
        customersCount: totalCustomers,
        productsCount: totalProducts,
        salesHistory
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const customers = await MUser.find({ role: 'customer' });
      const orders = await MOrder.find();
      const customerData = customers.map((u: any) => {
        const customerOrders = orders.filter((o: any) => o.userId === u.uid || o.userId === u.id);
        return {
          id: u.uid || u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          ordersCount: customerOrders.length,
          totalSpent: parseFloat(customerOrders.reduce((sum: number, o: any) => sum + o.totalPrice, 0).toFixed(2)),
          createdAt: u.createdAt || '2026-06-01T00:00:00Z'
        };
      });
      return res.json(customerData);
    } else {
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
      return res.json(customers);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
