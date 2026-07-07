import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Support both environment variables (for secure production hosting) and the local config file
const finalConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)'
};

// Initialize Firebase
const app = initializeApp(finalConfig);

// Initialize Firestore
// NOTE: `ignoreUndefinedProperties: true` is critical here. Without it, Firestore's
// setDoc/addDoc/updateDoc THROW an error the moment any field in the object being
// saved is `undefined` (e.g. an optional "discountPrice" or "isVeg" field that the
// Add/Edit Product form leaves as `undefined` when the user doesn't fill it in).
// That was silently breaking "Add Product", "Update Product", and order driver-info
// updates. With this flag, Firestore just skips undefined fields instead of failing.
const db = initializeFirestore(
  app,
  { ignoreUndefinedProperties: true },
  finalConfig.firestoreDatabaseId
);

export { db, collection, getDocs, addDoc, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc };
