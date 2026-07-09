import React, { useState } from 'react';
import { Mail, Lock, User, ShieldAlert, ShoppingBag, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  fbUpdateProfile,
} from '../lib/firebase';
import { api } from '../lib/api';

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthView({ onLoginSuccess, onNavigate, initialMode = 'login' }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration / Login form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const triggerRedirect = (user: any) => {
    if (user.role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        // 1. Firebase Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // 2. Set Profile name in Firebase
        await fbUpdateProfile(fbUser, { displayName: name });
        
        // 3. Sync profile to MongoDB
        const syncedUser = await api.firebaseSync({
          uid: fbUser.uid,
          email: fbUser.email || email,
          name: name,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
        });

        onLoginSuccess(syncedUser);
        triggerRedirect(syncedUser);
      } else {
        // 1. Firebase Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // 2. Sync / retrieve profile from MongoDB
        const syncedUser = await api.firebaseSync({
          uid: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || undefined,
          avatar: fbUser.photoURL || undefined
        });

        onLoginSuccess(syncedUser);
        triggerRedirect(syncedUser);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      // Map Firebase auth errors to readable messages
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or password combination.';
      } else if (err.code === 'auth/operation-not-allowed' || (msg && msg.includes('operation-not-allowed'))) {
        msg = 'SIGN_IN_PROVIDER_DISABLED';
      }
      setErrorText(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorText('');
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;

      const syncedUser = await api.firebaseSync({
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || undefined,
        avatar: fbUser.photoURL || undefined
      });

      onLoginSuccess(syncedUser);
      triggerRedirect(syncedUser);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        let msg = err.message;
        if (err.code === 'auth/operation-not-allowed' || (msg && msg.includes('operation-not-allowed'))) {
          msg = 'SIGN_IN_PROVIDER_DISABLED';
        }
        setErrorText(msg || 'Google authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-md mx-auto" id="auth-portal">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-8 shadow-xl shadow-zinc-100 dark:shadow-none space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" iconOnly={true} className="justify-center" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
            {mode === 'login' ? 'Welcome Back to ShopSphere' : 'Join ShopSphere Premium'}
          </h2>
          <p className="text-xs text-zinc-500 leading-normal max-w-[280px] mx-auto">
            {mode === 'login' 
              ? 'Access your saved wishlists, track active shipping orders, and modify profile parameters.' 
              : 'Register your account to unlock early capsule access and custom shipping destinations.'
            }
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">My Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 pl-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-855 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                />
                <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-500">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@shopsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-855 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-500">Account Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-855 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Errors banner */}
          {errorText && (
            errorText === 'SIGN_IN_PROVIDER_DISABLED' ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs space-y-3" id="firebase-instructions">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-400 font-semibold leading-normal">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <span>Firebase Sign-In Method is Disabled</span>
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed">
                  <p>To enable authentication, please enable <strong>Email/Password</strong> and <strong>Google</strong> sign-in providers in your Firebase console:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold underline decoration-dotted">Firebase Console</a>.</li>
                    <li>Select your project.</li>
                    <li>Click <strong>Authentication</strong> on the left sidebar.</li>
                    <li>Select the <strong>Sign-in method</strong> tab.</li>
                    <li>Click <strong>Add new provider</strong>, choose <strong>Email/Password</strong>, and enable it.</li>
                    <li>Click <strong>Add new provider</strong> again, choose <strong>Google</strong>, and enable it.</li>
                  </ol>
                  <p className="text-[10px] text-zinc-500 italic mt-1">Once enabled, retry logging in or signing up below.</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-400 rounded-xl flex items-start gap-1.5 leading-normal">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all hover:translate-y-[-1px] flex items-center justify-center space-x-1 shadow-md shadow-indigo-600/15 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : (mode === 'login' ? 'Sign In Securely' : 'Complete Registration')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center text-xs">
          <span className="text-zinc-500">
            {mode === 'login' ? 'New to ShopSphere? ' : 'Already have an account? '}
          </span>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative border-t border-zinc-150 dark:border-zinc-800 my-4 text-center">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3.5 bg-white dark:bg-zinc-900 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
            Secure Federated Login
          </span>
        </div>

        {/* Real Firebase Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
