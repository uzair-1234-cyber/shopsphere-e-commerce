import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as fbUpdateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhiatb5u0GDn0-xpX6qOTXmvcmnj1rt30",
  authDomain: "sign-in-sign-up-e64c2.firebaseapp.com",
  projectId: "sign-in-sign-up-e64c2",
  storageBucket: "sign-in-sign-up-e64c2.firebasestorage.app",
  messagingSenderId: "770272137141",
  appId: "1:770272137141:web:df4da13bb648a566f413fc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Provider for Google Sign-In
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  fbUpdateProfile,
};
export type { FirebaseUser };
