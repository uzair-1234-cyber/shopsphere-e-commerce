import React, { useState } from 'react';
import { Send, CheckCircle, Mail, MapPin, Phone, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubsubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubsubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="app-footer" className="bg-zinc-950 text-zinc-400 mt-auto border-t border-zinc-900">
      {/* Service benefits bar */}
      <div className="border-b border-zinc-900 py-8 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-zinc-800/60 rounded-2xl text-indigo-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">100% Secure Payments</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Encrypted Stripe payments & Cash on Delivery.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-zinc-800/60 rounded-2xl text-indigo-400">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Easy Returns</h4>
                <p className="text-xs text-zinc-500 mt-0.5">30-day hassle-free return and refund policy.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-zinc-800/60 rounded-2xl text-indigo-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Premium Craftsmanship</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Finest materials sourced from trusted makers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo size="md" showSlogan={true} forceTheme="dark" />
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Elevating your daily experience with precision-crafted consumer electronics, premium activewear, and bespoke homeware. Built on a foundation of exceptional design and seamless customer service.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-zinc-600" />
                <span>100 Market St, Suite 400, SF, CA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-zinc-600" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Directory */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop Directory</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Premium Electronics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kinetic Footwear</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainable Apparel</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Modern Home Goods</a></li>
              <li><a href="#" className="hover:text-white transition-colors">New Season Arrivals</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Help Center & FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery Rates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Return Policy Details</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Join ShopSphere</h4>
            <p className="text-xs text-zinc-500">
              Subscribe to unlock early access to limited capsule collections, flash sales, and design perspectives.
            </p>

            {subscribed ? (
              <div className="p-4 bg-zinc-900/80 border border-indigo-500/20 rounded-2xl flex items-start space-x-3 animate-fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Subscription Verified!</h5>
                  <p className="text-[11px] text-zinc-500 mt-1">Enjoy 10% off your first purchase using coupon code <strong className="text-indigo-400">WELCOME10</strong>.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 pl-9 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <div className="absolute left-3 top-2.5 text-zinc-600">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10"
                >
                  <span>Subscribe</span>
                  <Send className="h-3 w-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600">
          <p>© 2026 ShopSphere. Designed for seamless performance. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-zinc-400">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
