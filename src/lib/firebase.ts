import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Helper to safely read VITE_ environment variables and ignore empty/falsy strings
const getEnvValue = (key: string): string | undefined => {
  const val = (import.meta as any).env?.[key];
  if (typeof val === 'string' && val.trim() !== '' && val !== 'undefined') {
    return val;
  }
  return undefined;
};

const finalConfig = {
  apiKey: getEnvValue('VITE_FIREBASE_API_KEY') || firebaseConfig.apiKey,
  authDomain: getEnvValue('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfig.authDomain,
  projectId: getEnvValue('VITE_FIREBASE_PROJECT_ID') || firebaseConfig.projectId,
  storageBucket: getEnvValue('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfig.storageBucket,
  messagingSenderId: getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfig.messagingSenderId,
  appId: getEnvValue('VITE_FIREBASE_APP_ID') || firebaseConfig.appId,
  firestoreDatabaseId: getEnvValue('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || firebaseConfig.firestoreDatabaseId || ''
};

// Auto-detect if user has configured their own personal Firebase project but left the AI Studio custom database ID intact.
// Personal projects only have the '(default)' database. AI Studio databases start with 'ai-studio-'.
const isAiStudioProject = finalConfig.projectId && (
  finalConfig.projectId.startsWith('gen-lang-client') || 
  finalConfig.projectId.includes('ai-studio')
);
const isCustomStudioDb = finalConfig.firestoreDatabaseId && finalConfig.firestoreDatabaseId.startsWith('ai-studio-');

if (finalConfig.projectId && !isAiStudioProject && isCustomStudioDb) {
  console.log('[Firebase Initializer] Custom project detected with AI Studio Database ID. Overriding database ID to "(default)".');
  finalConfig.firestoreDatabaseId = '';
}

// Log Firebase parameters for extreme transparent debugging (excluding credentials)
console.log('[Firebase Initializer] Project ID:', finalConfig.projectId);
console.log('[Firebase Initializer] Database ID:', finalConfig.firestoreDatabaseId || '(default)');

// Initialize Firebase
const app = initializeApp(finalConfig);

// Initialize Firestore - Safely use named database only if a valid custom ID is provided and is not (default)
const db = finalConfig.firestoreDatabaseId && finalConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, finalConfig.firestoreDatabaseId)
  : getFirestore(app);

export { db, collection, getDocs, addDoc, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc, getDoc };
