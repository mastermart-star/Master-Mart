import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Grid,
  Apple,
  Cookie,
  Dessert,
  CupSoda,
  Wheat,
  Sparkles,
  Home,
  Fish,
  Flame,
  Leaf,
  PawPrint,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Star,
  Bike,
  MapPin,
  Check,
  Languages,
  Moon,
  Sun,
  Smartphone,
  Laptop,
  ShieldCheck,
  ChevronRight,
  Bell,
  X,
  PhoneCall,
  Menu,
  Info,
  ArrowLeft,
  Timer,
  FileText,
  Truck,
  Sliders,
  Lock,
  LogOut,
  MessageCircle
} from 'lucide-react';

import { Product, Category, CartItem, Order, ProductReview, OrderStatus, BkashSettings, DeliverySettings, ChatSupportSettings } from './types';
import { CATEGORIES, PRODUCTS, INITIAL_REVIEWS, DICTIONARY } from './data';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { PaymentModal } from './components/PaymentModal';
import { DeliveryTracking } from './components/DeliveryTracking';
import { AddProductModal } from './components/AddProductModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { db, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, updateDoc, getDoc } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const CartIcon = ShoppingBag;

// Lucide category icon renderer
const renderCatIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'Grid': return <Grid className={className} />;
    case 'Apple': return <Apple className={className} />;
    case 'Cookie': return <Cookie className={className} />;
    case 'Dessert': return <Dessert className={className} />;
    case 'CupSoda': return <CupSoda className={className} />;
    case 'Wheat': return <Wheat className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Fish': return <Fish className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'PawPrint': return <PawPrint className={className} />;
    default: return <Grid className={className} />;
  }
};

// Robust safe wrapper around cookies to guarantee persistence inside iframe sandboxes where localStorage gets blocked or wiped.
const safeCookies = {
  getItem(key: string): string | null {
    try {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)'));
        if (match) return decodeURIComponent(match[2]);
      }
    } catch (e) {
      console.warn(`Cookie access blocked/failed for key "${key}":`, e);
    }
    return null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof document !== 'undefined') {
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days durability
        document.cookie = `${key}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      }
    } catch (e) {
      console.warn(`Cookie writing blocked/failed for key "${key}":`, e);
    }
  }
};

// Robust safe wrapper around localStorage to prevent SecurityError exceptions in sandboxed or cross-origin iframe environments.
const inMemoryStore: Record<string, string> = {};
const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch (e) {
      console.warn(`localStorage.getItem blocked/failed for key "${key}":`, e);
    }
    const cookieVal = safeCookies.getItem(key);
    if (cookieVal !== null) return cookieVal;
    return inMemoryStore[key] || null;
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage.setItem blocked/failed for key "${key}":`, e);
    }
    safeCookies.setItem(key, value);
    inMemoryStore[key] = value;
  }
};

function cleanUndefined<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as any;
  }
  const clean = { ...obj } as any;
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      delete clean[key];
    } else {
      clean[key] = cleanUndefined(clean[key]);
    }
  });
  return clean;
}

export default function App() {
  // Lang preference
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    const cached = safeLocalStorage.getItem('master_mart_lang');
    return cached === 'en' ? 'en' : 'bn'; // Defaults to beautiful Bengali as requested
  });

  // Dark or Light Mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = safeLocalStorage.getItem('master_mart_theme');
    return cached === 'dark' ? 'dark' : 'light';
  });

  // Simulator Mode: Mobile phone preview
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    const cached = safeLocalStorage.getItem('master_mart_sim_mode');
    return cached === 'true';
  });

  // Track real viewport width to dynamically disable mockup bezel if viewed on actual mobile screen sizes
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1024;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // App core state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const cached = safeLocalStorage.getItem('master_mart_cart');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse cart items:', e);
      return [];
    }
  });

  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const cached = safeLocalStorage.getItem('master_mart_reviews');
      const parsed = cached ? JSON.parse(cached) : INITIAL_REVIEWS;
      return Array.isArray(parsed) ? parsed : INITIAL_REVIEWS;
    } catch (e) {
      console.error('Failed to parse product reviews:', e);
      return INITIAL_REVIEWS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = safeLocalStorage.getItem('master_mart_orders');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse order history:', e);
      return [];
    }
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // bKash Merchant Configuration Settings State
  const [bkashSettings, setBkashSettings] = useState<BkashSettings>({
    appKey: '',
    secretKey: '',
    username: '',
    password: '',
    isEnabled: false,
    isCoDEnabled: true,
  });

  // Delivery Service Settings State
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    activeService: 'none',
    pathaoStoreId: '',
    pathaoClientId: '',
    pathaoClientSecret: '',
    pathaoUsername: '',
    pathaoPassword: '',
    steadfastApiKey: '',
    steadfastSecretKey: '',
  });

  // Chat Support Settings State
  const [chatSupportSettings, setChatSupportSettings] = useState<ChatSupportSettings>({
    activePlatform: 'none',
    facebookUrl: '',
    whatsappNumber: '',
    whatsappMessage: '',
  });

  // Real-time stream bKash settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'bkash_merchant'), (snapshot) => {
      if (snapshot.exists()) {
        setBkashSettings(snapshot.data() as BkashSettings);
      } else {
        const defaultSettings: BkashSettings = {
          appKey: '',
          secretKey: '',
          username: '',
          password: '',
          isEnabled: false,
          isCoDEnabled: true,
        };
        setDoc(doc(db, 'settings', 'bkash_merchant'), defaultSettings)
          .then(() => setBkashSettings(defaultSettings))
          .catch(err => console.error('Failed to seed default settings:', err));
      }
    });
    return () => unsub();
  }, []);

  // Real-time stream Delivery Service settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'delivery_service'), (snapshot) => {
      if (snapshot.exists()) {
        setDeliverySettings(snapshot.data() as DeliverySettings);
      } else {
        const defaultSettings: DeliverySettings = {
          activeService: 'none',
          pathaoStoreId: '',
          pathaoClientId: '',
          pathaoClientSecret: '',
          pathaoUsername: '',
          pathaoPassword: '',
          steadfastApiKey: '',
          steadfastSecretKey: '',
        };
        setDoc(doc(db, 'settings', 'delivery_service'), defaultSettings)
          .then(() => setDeliverySettings(defaultSettings))
          .catch(err => console.error('Failed to seed default delivery settings:', err));
      }
    });
    return () => unsub();
  }, []);

  // Real-time stream Chat Support settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'chat_support'), (snapshot) => {
      if (snapshot.exists()) {
        setChatSupportSettings(snapshot.data() as ChatSupportSettings);
      } else {
        const defaultSettings: ChatSupportSettings = {
          activePlatform: 'none',
          facebookUrl: '',
          whatsappNumber: '',
          whatsappMessage: 'Hello, I have a question about my order.',
        };
        setDoc(doc(db, 'settings', 'chat_support'), defaultSettings)
          .then(() => setChatSupportSettings(defaultSettings))
          .catch(err => console.error('Failed to seed default chat settings:', err));
      }
    });
    return () => unsub();
  }, []);

  const handleSaveBkashSettings = async (settings: BkashSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'bkash_merchant'), settings);
      triggerNotification(lang === 'en' ? 'bKash merchant settings updated successfully!' : 'বিকাশ মার্চেন্ট সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      triggerNotification(lang === 'en' ? 'Failed to save settings' : 'সেটিংস সেভ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleSaveDeliverySettings = async (settings: DeliverySettings) => {
    try {
      await setDoc(doc(db, 'settings', 'delivery_service'), settings);
      triggerNotification(lang === 'en' ? 'Delivery service settings updated successfully!' : 'ডেলিভারি সার্ভিস সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      console.error('Failed to save delivery settings:', err);
      triggerNotification(lang === 'en' ? 'Failed to save delivery settings' : 'ডেলিভারি সেটিংস সেভ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleSaveChatSupportSettings = async (settings: ChatSupportSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'chat_support'), settings);
      triggerNotification(lang === 'en' ? 'Chat support settings updated successfully!' : 'চ্যাট সাপোর্ট সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      console.error('Failed to save chat settings:', err);
      triggerNotification(lang === 'en' ? 'Failed to save chat settings' : 'চ্যাট সেটিংস সেভ করতে ব্যর্থ হয়েছে');
    }
  };

  // Firestore DB States & Admin Mode State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'products' | 'reviews'>('overview');
  const [allOrdersList, setAllOrdersList] = useState<Order[]>([]);
  // IMPORTANT: starts EMPTY, not with the hardcoded demo PRODUCTS array.
  // The list is only ever filled with what Firestore actually returns, so the
  // UI can never show fake/default data disguised as real database content.
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  // True whenever the live Firestore connection fails (wrong project, no
  // permission, offline, etc). Used to show a visible warning banner instead
  // of silently falling back to fake data.
  const [dbConnectionError, setDbConnectionError] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Real-time stream products from Firestore
  useEffect(() => {
    let active = true;
    let unsubProducts: (() => void) | null = null;

    const setupStream = async () => {
      if (!active) return;

      unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!active) return;

        // Whatever Firestore returns is the truth — empty means empty.
        // We never auto-inject the hardcoded demo PRODUCTS into a real
        // database. If you want the demo catalog, use the "Restore Default
        // Products" button in the Admin Panel, which is an explicit,
        // one-time, opt-in action.
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          try {
            const raw: any = docSnap.data() || {};
            // IMPORTANT: the Firestore Document ID and an internal "id"
            // field are two different things. A product typed directly
            // into the Firebase Console has a Document ID but usually has
            // NO "id" field inside its data — always fall back to the real
            // document ID so it never ends up undefined.
            const normalized: Product = {
              id: typeof raw.id === 'string' && raw.id ? raw.id : docSnap.id,
              nameEn: raw.nameEn ?? raw.name ?? 'Unnamed product',
              nameBn: raw.nameBn ?? raw.name ?? raw.nameEn ?? 'নামহীন পণ্য',
              category: raw.category ?? 'all',
              price: typeof raw.price === 'number' ? raw.price : Number(raw.price) || 0,
              unitEn: raw.unitEn ?? raw.unit ?? 'pc',
              unitBn: raw.unitBn ?? raw.unit ?? 'পিস',
              rating: typeof raw.rating === 'number' ? raw.rating : Number(raw.rating) || 0,
              image: raw.image ?? '',
              discountPrice: typeof raw.discountPrice === 'number' ? raw.discountPrice : undefined,
              stock: typeof raw.stock === 'number' ? raw.stock : Number(raw.stock) || 0,
              isVeg: typeof raw.isVeg === 'boolean' ? raw.isVeg : undefined,
              descriptionEn: raw.descriptionEn,
              descriptionBn: raw.descriptionBn,
            };
            items.push(normalized);
          } catch (parseErr) {
            // Never let one malformed document take down the entire list.
            console.error(`Skipping malformed product document ${docSnap.id}:`, parseErr);
          }
        });

        // Sort newly added first (usually having p_db_ prefix)
        items.sort((a, b) => {
          const isA_Db = (a.id || '').startsWith('p_db_');
          const isB_Db = (b.id || '').startsWith('p_db_');
          if (isA_Db && !isB_Db) return -1;
          if (!isA_Db && isB_Db) return 1;
          return (b.id || '').localeCompare(a.id || '');
        });

        setProductsList(items);
        setDbConnectionError(false);
        setDbLoading(false);
      }, (err) => {
        console.error('Failed to stream products:', err);
        if (active) {
          // Do NOT replace real (or empty) data with the fake demo array.
          // Surface a visible connection error instead so the problem is
          // obvious rather than being masked by fake data.
          setDbConnectionError(true);
          setDbLoading(false);
          try {
            handleFirestoreError(err, OperationType.LIST, 'products');
          } catch (e) {
            // Log custom error structure
          }
        }
      });
    };

    setupStream();

    return () => {
      active = false;
      if (unsubProducts) {
        unsubProducts();
      }
    };
  }, []);

  // Real-time stream orders from Firestore (for both Admin and Customer tracking)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      // Sort newly placed first
      items.sort((a, b) => b.id.localeCompare(a.id));
      setAllOrdersList(items);

      // Extract current user's tracked order IDs from localStorage
      const myOrderIdsString = safeLocalStorage.getItem('master_mart_my_order_ids') || '[]';
      let myOrderIds: string[] = [];
      try {
        myOrderIds = JSON.parse(myOrderIdsString);
      } catch (e) {
        myOrderIds = [];
      }

      // Filter and sync live order updates for the customer
      const mySyncedOrders = items.filter(o => myOrderIds.includes(o.id));
      setOrders(mySyncedOrders);
    }, (err) => {
      console.error('Failed to stream orders:', err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      } catch (e) {
        // Log custom error structure
      }
    });

    return () => unsub();
  }, []);

  // Save new product to Firestore
  const handleAddProductToDb = async (newProduct: Product) => {
    // Instantly update local state so the UI is responsive immediately
    setProductsList((prev) => {
      if (prev.some(p => p.id === newProduct.id)) return prev;
      return [newProduct, ...prev];
    });

    try {
      console.log('Attempting to add product to Firestore:', newProduct.id);
      const docRef = doc(db, 'products', newProduct.id);
      await setDoc(docRef, cleanUndefined(newProduct));
      console.log('Successfully saved product to Firestore!');
      setDbConnectionError(false);
      triggerNotification(lang === 'en' ? 'Product successfully saved to Database!' : 'পণ্যটি সফলভাবে ডাটাবেসে যোগ হয়েছে!');
    } catch (err) {
      console.error('CRITICAL: Failed to add product to database:', err);
      // Roll back the optimistic add — a failed save must never remain
      // visible in the UI as if it had actually been saved to the database.
      setProductsList((prev) => prev.filter(p => p.id !== newProduct.id));
      setDbConnectionError(true);
      try {
        handleFirestoreError(err, OperationType.CREATE, `products/${newProduct.id}`);
      } catch (wrappedErr: any) {
        throw new Error(wrappedErr.message || String(err));
      }
    }
  };

  // Restore all original default products to Firestore
  const handleRestoreDefaultProducts = async () => {
    try {
      console.log('Restoring default products to Firestore...');
      const promises = PRODUCTS.map(async (prod) => {
        const docRef = doc(db, 'products', prod.id);
        await setDoc(docRef, prod);
      });
      await Promise.all(promises);
      triggerNotification(lang === 'en' ? 'All default products successfully restored!' : 'সকল ডিফল্ট পণ্য সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (err) {
      console.error('Failed to restore default products:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'products');
      } catch (wrappedErr: any) {
        throw new Error(wrappedErr.message || String(err));
      }
    }
  };

  // Delete product from Firestore
  const handleDeleteProductFromDb = async (product: Product) => {
    // Instantly update local state so the UI is responsive immediately
    setProductsList((prev) => prev.filter(p => p.id !== product.id));

    try {
      const docRef = doc(db, 'products', product.id);
      await deleteDoc(docRef);
      setDbConnectionError(false);
      triggerNotification(lang === 'en' ? 'Product deleted from Database!' : 'পণ্যটি ডাটাবেস থেকে মুছে ফেলা হয়েছে!');
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Roll back — the product was NOT actually deleted, so put it back.
      setProductsList((prev) => prev.some(p => p.id === product.id) ? prev : [product, ...prev]);
      setDbConnectionError(true);
      triggerNotification(lang === 'en' ? 'Failed to delete product.' : 'পণ্যটি মুছতে ব্যর্থ হয়েছে।');
      try {
        handleFirestoreError(err, OperationType.DELETE, `products/${product.id}`);
      } catch (wrappedErr) {
        // Logged
      }
    }
  };

  // Update order status in Firestore (Admin tool)
  const handleUpdateOrderStatusDb = async (orderId: string, newStatus: OrderStatus, progress: number, extra?: Partial<Order>) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(docRef, {
        status: newStatus,
        stepProgress: progress,
        ...extra
      }, { merge: true });
      triggerNotification(lang === 'en' ? 'Order status successfully updated!' : 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      console.error('Failed to update order status:', err);
      triggerNotification(lang === 'en' ? 'Failed to update order.' : 'অর্ডার আপডেট করতে ব্যর্থ হয়েছে।');
      try {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      } catch (wrappedErr) {
        // Logged
      }
    }
  };

  // Update product price or stock in Firestore (Admin tool)
  const handleUpdateProductInDb = async (updatedProduct: Product) => {
    // Remember the previous version so we can restore it if the write fails
    let previousProduct: Product | undefined;
    setProductsList((prev) => {
      previousProduct = prev.find(p => p.id === updatedProduct.id);
      return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    });

    // Run the Firestore write in the background to prevent any UI blocking or hanging in sandboxed iframe previews
    (async () => {
      try {
        const docRef = doc(db, 'products', updatedProduct.id);
        await setDoc(docRef, cleanUndefined(updatedProduct));
        setDbConnectionError(false);
        triggerNotification(lang === 'en' ? 'Product inventory successfully updated!' : 'পণ্য বিবরণী সফলভাবে আপডেট করা হয়েছে!');
      } catch (err) {
        console.error('Failed to update product details:', err);
        // Roll back to the previous version — the update was NOT actually saved.
        if (previousProduct) {
          const restored = previousProduct;
          setProductsList((prev) => prev.map(p => p.id === updatedProduct.id ? restored : p));
        }
        setDbConnectionError(true);
        triggerNotification(lang === 'en' ? 'Failed to update product.' : 'পণ্য বিবরণী আপডেট করতে ব্যর্থ হয়েছে।');
        try {
          handleFirestoreError(err, OperationType.UPDATE, `products/${updatedProduct.id}`);
        } catch (wrappedErr) {
          // Logged
        }
      }
    })();
  };

  // Sync to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('master_mart_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeLocalStorage.setItem('master_mart_theme', theme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    safeLocalStorage.setItem('master_mart_sim_mode', String(isMobileView));
  }, [isMobileView]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('master_mart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to serialize cart items:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('master_mart_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to serialize reviews:', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('master_mart_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to serialize orders:', e);
    }
  }, [orders]);

  const dict = DICTIONARY[lang] || DICTIONARY['bn'];

  // Helper trigger action message
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Add review physically
  const handleAddNewReview = (comment: string, rating: number, userName: string) => {
    if (!selectedProduct) return;
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: selectedProduct.id,
      userName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => [newRev, ...prev]);
    // update rating visually for current session
    productsList.forEach((p) => {
      if (p.id === selectedProduct.id) {
        const itemReviews = [newRev, ...reviews.filter((r) => r.productId === selectedProduct.id)];
        const total = itemReviews.reduce((sum, r) => sum + r.rating, 0);
        p.rating = Number((total / itemReviews.length).toFixed(1));
      }
    });

    triggerNotification(lang === 'en' ? 'Review successfully registered!' : 'আপনার রিভিউটি ধন্যবাদ সহকারে গৃহিত হয়েছে!');
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    const existingCartItem = cart.find((item) => item.product.id === product.id);
    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (quantityInCart >= product.stock) {
      triggerNotification(
        lang === 'en'
          ? `Cannot add more! Only ${product.stock} items in stock.`
          : `আর যোগ করা সম্ভব নয়! স্টকে মাত্র ${product.stock}টি আছে।`
      );
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerNotification(lang === 'en' ? `Added ${product.nameEn} to cart` : `${product.nameBn} কার্টে যোগ হয়েছে`);
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        if (updated[existingIndex].quantity <= 1) {
          return updated.filter((item) => item.product.id !== product.id);
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity - 1
        };
        return updated;
      }
      return prev;
    });
    triggerNotification(lang === 'en' ? `Removed 1 ${product.nameEn}` : `১টি ${product.nameBn} কমানো হয়েছে`);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart financial summary calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = cartSubtotal > 0 ? (cartSubtotal >= 500 ? 0 : 80) : 0;
  const originalDeliveryFee = cartSubtotal > 0 ? 80 : 0; // Show original 80 TK delivery fee
  const handlingFee = 0; // Cancel Tax & Handling (0 TK)
  const cartTotal = cartSubtotal + deliveryFee + handlingFee;

  // Checkout trigger
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const tempOrder: Order = {
      id: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart,
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      status: 'placed',
      paymentMethod: '',
      paymentStatus: 'pending',
      timestamp: new Date().toLocaleTimeString(),
      etaMinutes: 10,
      stepProgress: 10
    };
    setActivePaymentOrder(tempOrder);
  };

  // Payment successful simulation pipeline
  const handlePaymentSuccess = async (
    methodUsed: string, 
    kfcOutlet?: string, 
    customerDetails?: { name: string; phone: string; address: string; email?: string }
  ) => {
    if (!activePaymentOrder) return;
    const completedOrder: Order = {
      ...activePaymentOrder,
      paymentMethod: methodUsed,
      paymentStatus: 'success',
      status: 'preparing',
      stepProgress: 25, // 25% prep stage
      kfcOutlet: kfcOutlet,
      customerName: customerDetails?.name,
      customerPhone: customerDetails?.phone,
      customerAddress: customerDetails?.address,
      customerEmail: customerDetails?.email
    };

    // 1. Immediately register the order ID locally to avoid filtering out and ensure instant transition
    const myOrderIdsString = safeLocalStorage.getItem('master_mart_my_order_ids') || '[]';
    let myOrderIds: string[] = [];
    try {
      myOrderIds = JSON.parse(myOrderIdsString);
    } catch (e) {
      myOrderIds = [];
    }
    if (!myOrderIds.includes(completedOrder.id)) {
      myOrderIds.push(completedOrder.id);
      safeLocalStorage.setItem('master_mart_my_order_ids', JSON.stringify(myOrderIds));
    }

    // Update local orders state instantly
    setOrders((prev) => {
      if (prev.some(o => o.id === completedOrder.id)) return prev;
      return [completedOrder, ...prev];
    });

    // Update local products state instantly so stock changes are immediate
    setProductsList((prev) =>
      prev.map((prod) => {
        const cartItem = completedOrder.items.find((item) => item.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity)
          };
        }
        return prod;
      })
    );

    // Close payment modal and clear cart instantly
    setActivePaymentOrder(null);
    clearCart();
    setIsCartOpen(false);
    triggerNotification(lang === 'en' ? 'Order processed! Starting instant tracking...' : 'অর্ডার সফল হয়েছে! ১০ মিনিটে ডেলিভারি ট্র্যাকিং চালু হয়েছে।');

    // 2. Process Firestore persistence asynchronously in the background
    (async () => {
      try {
        const docRef = doc(db, 'orders', completedOrder.id);
        await setDoc(docRef, cleanUndefined(completedOrder));
        setDbConnectionError(false);

        // Update product stock in Firestore
        for (const item of completedOrder.items) {
          try {
            const productRef = doc(db, 'products', item.product.id);
            const productSnap = await getDoc(productRef);
            let currentStock = item.product.stock;
            if (productSnap.exists()) {
              const prodData = productSnap.data();
              if (prodData && typeof prodData.stock === 'number') {
                currentStock = prodData.stock;
              }
            }
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(productRef, {
              stock: newStock
            });
            console.log(`Successfully updated stock for ${item.product.id}: ${currentStock} -> ${newStock}`);
          } catch (stockErr) {
            console.error(`Failed to update stock for product ${item.product.id}:`, stockErr);
          }
        }
      } catch (err) {
        console.error('Failed to save order to Firestore:', err);
        // The order was NOT actually saved to the database, even though the
        // customer already saw a success message. Make this failure visible
        // instead of letting it silently disappear on next reload.
        setDbConnectionError(true);
        triggerNotification(
          lang === 'en'
            ? 'Warning: Your order was recorded on this device, but could not reach our server. Please screenshot this and contact support.'
            : 'সতর্কতা: আপনার অর্ডারটি এই ডিভাইসে রাখা হয়েছে, কিন্তু সার্ভারে পাঠানো যায়নি। দয়া করে স্ক্রিনশট নিয়ে সাপোর্টে যোগাযোগ করুন।'
        );
      }
    })();
  };


  // Order status live updater
  const handleUpdateOrderStatus = (orderId: string, newStatus: any, progress: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            stepProgress: progress
          };
        }
        return ord;
      })
    );
  };

  // Dismiss a tracked simulated order
  const handleDismissOrder = (orderId: string) => {
    // 1. Remove from orders state
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    // 2. Remove from master_mart_my_order_ids in localStorage
    const myOrderIdsString = safeLocalStorage.getItem('master_mart_my_order_ids') || '[]';
    let myOrderIds: string[] = [];
    try {
      myOrderIds = JSON.parse(myOrderIdsString);
    } catch (e) {
      myOrderIds = [];
    }
    const updatedOrderIds = myOrderIds.filter((id) => id !== orderId);
    safeLocalStorage.setItem('master_mart_my_order_ids', JSON.stringify(updatedOrderIds));

    // 3. Remove from master_mart_orders in localStorage
    const cachedOrdersString = safeLocalStorage.getItem('master_mart_orders') || '[]';
    let cachedOrders: any[] = [];
    try {
      cachedOrders = JSON.parse(cachedOrdersString);
    } catch (e) {
      cachedOrders = [];
    }
    const updatedCachedOrders = cachedOrders.filter((o) => o.id !== orderId);
    safeLocalStorage.setItem('master_mart_orders', JSON.stringify(updatedCachedOrders));

    triggerNotification(lang === 'en' ? 'Tracking dismissed!' : 'ডেলিভারি ট্র্যাকিং বন্ধ করা হয়েছে।');
  };

  // Clean active orders
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const pastOrders = orders.filter((o) => o.status === 'delivered');

  // Filter Catalog catalog items based on choice & searching
  const filteredProducts = productsList.filter((prod) => {
    const matchesCategory = selectedCategoryId === 'all' || prod.category === selectedCategoryId;
    const nameEn = (prod.nameEn || '').toLowerCase();
    const nameBn = (prod.nameBn || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = nameEn.includes(q) || nameBn.includes(q);
    return matchesCategory && matchesSearch;
  });

  // Quick helper to fetch quantity inside cart for rendering indicators
  const getProductQty = (prodId: string) => {
    const item = cart.find((i) => i.product.id === prodId);
    return item ? item.quantity : 0;
  };

  const totalCartQty = cart.reduce((sum, item) => sum + (item ? item.quantity : 0), 0);

  // Return to the main page / reset all active filters and close modals
  const handleGoHome = () => {
    setSelectedCategoryId('all');
    setSearchQuery('');
    setSelectedProduct(null);
    setIsCartOpen(false);
    setActivePaymentOrder(null);
    
    // Auto-clear delivered tracking cards from localStorage tracking lists on returning home to keep screen pristine
    const deliveredIds = orders.filter((o) => o.status === 'delivered').map((o) => o.id);
    if (deliveredIds.length > 0) {
      const myOrderIdsString = safeLocalStorage.getItem('master_mart_my_order_ids') || '[]';
      let myOrderIds: string[] = [];
      try {
        myOrderIds = JSON.parse(myOrderIdsString);
      } catch (e) {
        myOrderIds = [];
      }
      const updatedOrderIds = myOrderIds.filter((id) => !deliveredIds.includes(id));
      safeLocalStorage.setItem('master_mart_my_order_ids', JSON.stringify(updatedOrderIds));

      const cachedOrdersString = safeLocalStorage.getItem('master_mart_orders') || '[]';
      let cachedOrders: any[] = [];
      try {
        cachedOrders = JSON.parse(cachedOrdersString);
      } catch (e) {
        cachedOrders = [];
      }
      const updatedCachedOrders = cachedOrders.filter((o) => !deliveredIds.includes(o.id));
      safeLocalStorage.setItem('master_mart_orders', JSON.stringify(updatedCachedOrders));
    }

    setOrders((prev) => prev.filter((o) => o.status !== 'delivered'));

    // Smoothly scroll back to the top of the browser view
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Smoothly scroll the simulated smartphone inner viewport back to the top
    const container = document.getElementById('mobile-inner-scroll');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }

    triggerNotification(lang === 'en' ? 'Returned to main page' : 'মূল পেজে ফিরিয়ে আনা হয়েছে');
  };

  // Main interactive wrapper HTML Layout definitions
  const appContent = (
    <div className={`flex flex-col ${(isMobileView && windowWidth >= 768) ? 'min-h-full' : 'min-h-screen'} bg-linear-to-b from-slate-50 to-slate-100 text-slate-800 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100`} id="main-application-view">
      {/* DATABASE CONNECTION ERROR BANNER — shown whenever a real Firestore
          read/write fails, so problems are always visible instead of being
          silently hidden behind fake/default data. */}
      {dbConnectionError && (
        <div className="bg-red-600 py-2 px-4 text-center text-xs font-bold text-white flex items-center justify-center gap-2 sm:px-8" id="db-connection-error-banner">
          <span>
            {lang === 'en'
              ? '⚠️ Could not connect to the database. Changes may not be saved permanently — check your Firebase setup.'
              : '⚠️ ডাটাবেসের সাথে সংযোগ করা যায়নি। পরিবর্তনগুলো স্থায়ীভাবে সেভ নাও হতে পারে — আপনার Firebase সেটআপ চেক করুন।'}
          </span>
        </div>
      )}

      {/* Top micro promotion strip */}
      <div className="bg-emerald-600 py-1.5 px-4 text-center text-xs font-semibold text-white flex justify-between items-center sm:px-8 dark:bg-emerald-800">
        <span className="flex items-center gap-1.5 mx-auto">
          <Bike className="h-4.5 w-4.5 animate-bounce" />
          {dict.tagline}
        </span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo & Address block */}
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <div 
              onClick={handleGoHome}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              title={lang === 'en' ? 'Go to Home Page' : 'মূল পেজে যান'}
              id="brand-logo-home-button"
            >
              {/* Style-matched brand logo icon with custom container background and smooth animation */}
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B1E28] text-white shadow-lg border border-slate-100/10 transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <svg viewBox="0 0 100 100" className="h-7 w-7 text-[#FF8A00] fill-none" stroke="currentColor" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* The stylized M cart body */}
                  <path d="M 20,25 L 50,52 L 80,25 L 80,56 A 14,14 0 0,1 66,70 L 34,70 A 14,14 0 0,1 20,56 Z" />
                  {/* Wheels */}
                  <circle cx="34" cy="85" r="7.5" className="fill-[#FF8A00] stroke-none" />
                  <circle cx="66" cy="85" r="7.5" className="fill-[#FF8A00] stroke-none" />
                </svg>
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-black tracking-tight flex items-center">
                  {lang === 'en' ? (
                    <>
                      <span className="text-slate-900 dark:text-white group-hover:text-[#FF8A00]/80 transition-colors">Master</span>
                      <span className="text-[#FF8A00] ml-1">Mart</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-900 dark:text-white group-hover:text-[#FF8A00]/80 transition-colors">মাস্টার</span>
                      <span className="text-[#FF8A00] ml-1">মার্ট</span>
                    </>
                  )}
                  <span className="ml-2 text-[9px] font-black bg-emerald-500 text-white rounded-md px-1.5 py-0.5 animate-pulse tracking-normal shrink-0">{dict.deliveryTime}</span>
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold tracking-widest">{lang === 'en' ? 'FAST COMMERCE' : 'দ্রুতগতির সুপারশপ'}</p>
              </div>
            </div>

            {/* Address bar mockup */}
            <div className="hidden lg:flex items-center gap-1.5 max-w-xs pl-4 border-l border-slate-200 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="text-left text-xs truncate">
                <span className="font-extrabold block text-slate-700 dark:text-slate-350">{lang === 'en' ? 'Home Delivery' : 'হোম ডেলিভারি'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{dict.deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Expanded premium Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 outline-hidden transition-all focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
              placeholder={dict.searchPlaceholder}
              id="global-search-bar"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Direct Product Search Dropdown Suggestions */}
            {searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                {productsList.filter(prod => 
                  prod.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  prod.nameBn.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? (
                  productsList.filter(prod => 
                    prod.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prod.nameBn.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 8).map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                    >
                      <img
                        src={prod.image}
                        alt={prod.nameEn}
                        className="w-10 h-10 object-cover rounded-xl shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 truncate">
                          {lang === 'en' ? prod.nameEn : prod.nameBn}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            {lang === 'en' ? prod.unitEn : prod.unitBn}
                          </span>
                          {prod.stock > 0 ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                              {lang === 'en' ? `${prod.stock} In Stock` : `${prod.stock} স্টক`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                              <span className="h-1 w-1 rounded-full bg-rose-500" />
                              {lang === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {dict.tk} {prod.discountPrice || prod.price}
                        </span>
                        {prod.discountPrice && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            {dict.tk} {prod.price}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {dict.noProducts}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Toolbar: Languages, Mode tags, Simulator, and Cart trigger badge */}
          <div className="flex items-center justify-between lg:justify-end gap-3.5">
            {/* Admin Portal Toggle -> Login Modal */}
            <button
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                  triggerNotification(lang === 'en' ? 'Logged out successfully!' : 'সফলভাবে লগআউট করা হয়েছে!');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 font-extrabold text-xs border rounded-xl px-2.5 py-2 transition-all cursor-pointer ${
                isAdminMode 
                  ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600 shadow-sm' 
                  : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
              title={lang === 'en' ? 'Admin Portal' : 'এডমিন প্যানেল'}
              id="admin-panel-toggle-btn"
            >
              {isAdminMode ? <LogOut className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <span>
                {isAdminMode 
                  ? (lang === 'en' ? 'Logout' : 'লগআউট') 
                  : (lang === 'en' ? 'Login' : 'লগইন')}
              </span>
            </button>

            {/* Lang switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 hover:text-emerald-500 font-semibold text-xs border border-slate-100 dark:border-slate-800 rounded-xl px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all"
              title="Change Language"
              id="lang-toggle-btn"
            >
              <Languages className="h-4 w-4" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Dark mode toggler */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 transition-all"
              id="theme-darkmode-toggle"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>



            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-white shadow-md hover:bg-emerald-700 transition-colors"
              id="cart-trigger-badge"
            >
              <CartIcon className="h-5 w-5" />
              {totalCartQty > 0 ? (
                <div className="text-left text-xs">
                  <span className="block font-black">{totalCartQty} {lang === 'en' ? 'Items' : 'টি পণ্য'}</span>
                  <span className="text-[10px] font-bold opacity-90">{dict.tk} {cartSubtotal}</span>
                </div>
              ) : (
                <span className="text-xs font-bold font-heading">{lang === 'en' ? 'Cart' : 'কার্ট'}</span>
              )}

              {/* Float count badge */}
              {totalCartQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-slate-950 leading-none shadow-xs animate-pulse">
                  {totalCartQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero promo Section (Blinkit Yellow green banner) */}
      <section className="bg-gradient-to-r from-yellow-100 to-amber-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-100 dark:border-slate-850 py-6 px-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-xl">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
              🚀 {lang === 'en' ? 'Instant Grocery Express' : 'মিনিটে বাজার ডেলিভারি'}
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {lang === 'en' ? 'Master Mart Delivery' : 'মাস্টার মার্ট ইনস্ট্যান্ট ডেলিভারি'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              {lang === 'en'
                ? 'Say goodbye to long superstore lines. Restock fresh potatoes, tomatoes, dairy butter, snacks & hot beverages in just 10 minutes!'
                : 'আর নয় সুপারস্টোরে লম্বা লাইনে দাঁড়িয়ে অপেক্ষা করা। মাত্র ১০ মিনিটে আপনার বাসায় পৌঁছে যাবে তাজা শাকসবজি, দুগ্ধজাত খাবার ও দৈনন্দিন মুদি বাজার!'}
            </p>
          </div>
          {/* Custom promo card visual */}
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-50 dark:bg-slate-900 dark:border-slate-800 text-center animate-fade-in">
              <span className="block text-xl md:text-2xl font-black text-emerald-600">
                {lang === 'en' ? '10 Min' : '১০ মি.'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{lang === 'en' ? 'Super ETA' : 'গড় সময়'}</span>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-50 dark:bg-slate-900 dark:border-slate-800 text-center animate-fade-in">
              <span className="block text-xl md:text-2xl font-black text-emerald-600">
                {lang === 'en' ? '100%' : '১০০%'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{lang === 'en' ? 'Fresh Sourced' : 'অর্গানিক তাজা'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 md:py-8 sm:px-6 lg:px-8">
        
        {/* ACTIVE COURIER ORDER TRACKER WIDGET */}
        {orders.length > 0 && (
          <div className="mb-8" id="active-delivery-orders-section">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              🔴 {dict.recentOrdersLabel}
            </h3>
            <div className="space-y-4">
              {orders.map((ord) => (
                <DeliveryTracking
                  key={ord.id}
                  order={ord}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDismiss={handleDismissOrder}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT COLUMN: Categories sidebar lists */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-850">
              <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
                {dict.categoriesHeader}
              </h2>

              {/* Desktop view list */}
              <div className="hidden lg:flex lg:flex-col gap-2.5" id="categories-list-desktop">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSearchQuery(''); // clear searching on new category selection
                      }}
                      className={`flex items-center gap-3 w-full text-left shrink-0 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-950'
                      }`}
                      id={`category-btn-${cat.id}`}
                    >
                      <div className={`p-1.5 rounded-lg text-white bg-linear-to-tr ${cat.color}`}>
                        {renderCatIcon(cat.icon, 'h-4 w-4')}
                      </div>
                      <span>{lang === 'en' ? cat.nameEn : cat.nameBn}</span>
                      <ChevronRight className={`ml-auto h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Mobile / Simulator Category Grid (Adjusted to show all categories nicely on screen) */}
              <div 
                className="grid lg:hidden grid-cols-4 sm:grid-cols-6 gap-x-2 gap-y-4 pt-1" 
                id="categories-list-mobile"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSearchQuery('');
                      }}
                      className="flex flex-col items-center text-center gap-1.5 cursor-pointer group w-full"
                      id={`category-btn-mobile-${cat.id}`}
                    >
                      {/* Circle icon container */}
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs border relative ${
                          isSelected
                            ? 'bg-linear-to-tr text-white scale-105 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 border-transparent ' + cat.color
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-750 dark:hover:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className={isSelected ? 'text-white' : `text-slate-600 dark:text-slate-300`}>
                          {renderCatIcon(cat.icon, 'h-5 w-5')}
                        </div>
                      </div>
                      {/* Compact centered label with fixed height to ensure perfect alignment */}
                      <span 
                        className={`text-[10px] font-bold tracking-tight leading-tight transition-colors line-clamp-2 min-h-[32px] max-h-[32px] overflow-hidden text-center block px-0.5 ${
                          isSelected 
                            ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' 
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                        }`}
                      >
                        {lang === 'en' ? cat.nameEn : cat.nameBn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side Static promo visual */}
            <div className="hidden lg:block rounded-2xl bg-linear-to-tr from-[#0B1E28] to-[#142D3C] border border-emerald-500/10 p-5 text-white select-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
              <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2.5 py-1 rounded-md inline-block">
                Master Mart Promise
              </span>
              <h4 className="text-base font-black tracking-tight mt-3 text-white flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {lang === 'en' ? 'Quality Refined' : 'মানসম্পন্ন বাছায়ের নিশ্চয়তা'}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === 'en' ? 'If any of our vegetable or fruit produces turns bad, we will refund inside 1 hour, no questions asked!' : 'আমাদের শাকসবজি বা মালের মান পছন্দ না হলে ১ ঘণ্টার মধ্যে রিটার্ন সুবিধা! কোনো প্রশ্ন করা হবে না।'}
              </p>
            </div>

            {/* Cancellation Policy card */}
            <div className="hidden lg:block rounded-2xl bg-amber-50/70 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 p-5 text-slate-800 dark:text-zinc-200 select-none relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  {lang === 'en' ? 'Cancellation Policy' : 'অর্ডার বাতিলকরণ নীতিমালা'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed font-semibold">
                {lang === 'en' 
                  ? 'Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.'
                  : 'একবার প্যাকেজিং সম্পন্ন হলে অর্ডার বাতিল করা যাবে না। অনাকাঙ্ক্ষিত বিলম্বের ক্ষেত্রে, প্রযোজ্য হলে রিফান্ড প্রদান করা হবে।'}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Custom filtered category products catalog */}
          <div className="lg:col-span-3 space-y-6" id="products-catalog-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white" id="catalog-title">
                  {lang === 'en'
                    ? CATEGORIES.find((c) => c.id === selectedCategoryId)?.nameEn || dict.allProducts
                    : CATEGORIES.find((c) => c.id === selectedCategoryId)?.nameBn || dict.allProducts}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'en' ? `Showing ${filteredProducts.length} instant grocery matches` : `আপনার জন্য ${filteredProducts.length}টি পণ্য মজুত রয়েছে`}
                </p>
              </div>

              {/* Add product button removed for customer-only view */}
            </div>

            {/* Loading / Error no products matching search screen */}
            {dbLoading ? (
              <div className="rounded-3xl bg-white p-16 text-center border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-slate-400 italic text-sm mt-4">
                  {lang === 'en' ? 'Loading products from database…' : 'ডাটাবেস থেকে পণ্য লোড হচ্ছে…'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl bg-white p-16 text-center border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-slate-400 italic text-sm">{dict.noProducts}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="mt-4 rounded-xl bg-emerald-500 text-white font-bold text-xs px-4 py-2 hover:bg-emerald-600 transition-all"
                >
                  {lang === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" id="products-catalog-grid">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantityInCart={getProductQty(p.id)}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    onOpenDetails={(item) => setSelectedProduct(item)}
                    lang={lang}
                    tkLabel={dict.tk}
                    offLabel={dict.off}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* NOTIFICATION TOAST POPUP */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-xs font-bold text-white shadow-xl dark:bg-emerald-500"
            id="notification-toast-alert"
          >
            <Check className="h-4.5 w-4.5 text-emerald-400 dark:text-white" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OUT SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop black overlay */}
            <div
              className="absolute inset-0 bg-transparent/40 backdrop-blur-xs"
              onClick={() => setIsCartOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10" id="cart-drawer-panel">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col justify-between"
              >
                {/* Cart Header styled like the reference app */}
                <div className="px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shadow-xs shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-zinc-300 transition-all"
                      id="close-cart-drawer-btn"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      {dict.cartHeader}
                    </span>
                  </div>
                  {/* Empty right-placeholder to balance layout or simple item badge */}
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-2">
                    {totalCartQty} {lang === 'en' ? 'items' : 'টি পণ্য'}
                  </span>
                </div>

                {/* Items listing body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/40">
                  {cart.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-100/40 dark:border-emerald-900/10">
                        <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                          {lang === 'en' ? 'Delivery in 8-12 minutes' : '৮-১২ মিনিটের মধ্যে ডেলিভারি'}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1">
                          {lang === 'en' 
                            ? `Shipment of ${totalCartQty} item${totalCartQty > 1 ? 's' : ''}` 
                            : `${totalCartQty}টি পণ্যের শিপমেন্ট`}
                        </p>
                      </div>
                    </div>
                  )}

                  {cart.length === 0 ? (
                    <div className="flex py-28 flex-col items-center justify-center space-y-3 text-center">
                      <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-400 italic">{dict.emptyCart}</p>
                    </div>
                  ) : (
                    <>
                      {/* Products card list */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 shadow-sm space-y-4">
                        {cart.map((item, index) => {
                          const finalPrice = item.product.discountPrice || item.product.price;
                          return (
                            <div
                              key={item.product.id}
                              className={`flex items-center gap-3.5 ${
                                index > 0 ? 'pt-4 border-t border-slate-100 dark:border-slate-800' : ''
                              }`}
                            >
                              <img
                                src={item.product.image}
                                alt={lang === 'en' ? item.product.nameEn : item.product.nameBn}
                                referrerPolicy="no-referrer"
                                className="h-14 w-14 object-cover rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800"
                              />
                              <div className="flex-grow min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug">
                                  {lang === 'en' ? item.product.nameEn : item.product.nameBn}
                                </h4>
                                <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block mt-0.5">
                                  {lang === 'en' ? item.product.unitEn : item.product.unitBn}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white block mt-1">
                                  {dict.tk} {finalPrice}
                                </span>
                              </div>

                              {/* Plus/minus green [ - 1 + ] badge like references */}
                              <div className="flex items-center gap-2.5 bg-emerald-700 dark:bg-emerald-600 text-white rounded-lg px-2 w-[70px] py-1 select-none font-extrabold shrink-0 shadow-sm transition-all">
                                <button
                                  onClick={() => handleRemoveFromCart(item.product)}
                                  className="text-white hover:text-emerald-100 font-extrabold text-sm px-1 flex-1 text-center"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-white w-3 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleAddToCart(item.product)}
                                  className="text-white hover:text-emerald-100 font-extrabold text-sm px-1 flex-1 text-center"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bill details card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 shadow-sm space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">
                          {lang === 'en' ? 'Bill details' : 'বিল বিবরণী'}
                        </h4>
                        
                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-450 font-medium">
                          {/* Items total row */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="font-bold">{dict.subtotal}</span>
                            </div>
                            <span className="font-black text-slate-800 dark:text-white">
                              {dict.tk} {cartSubtotal}
                            </span>
                          </div>

                          {/* Delivery Partner Fee row */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-slate-400" />
                              <span className="flex items-center gap-1 font-bold">
                                {dict.deliveryFee}
                                <Info className="h-3 w-3 text-slate-400 shrink-0" />
                              </span>
                            </div>
                            {cartSubtotal >= 500 ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-extrabold select-none">
                                <span className="line-through decoration-slate-400 dark:decoration-slate-500 font-bold">
                                  {dict.tk} 80
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-black tracking-wide text-xs">
                                  {lang === 'en' ? 'FREE' : 'ফ্রি'}
                                </span>
                              </div>
                            ) : (
                              <span className="font-extrabold text-slate-800 dark:text-white">
                                {dict.tk} 80
                              </span>
                            )}
                          </div>

                          {/* Grand Total row */}
                          <div className="flex justify-between items-center text-sm font-black pt-3.5 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                            <span className="flex items-center gap-1">
                              {dict.totalAmount}
                              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            </span>
                            <span className="text-base font-black text-slate-900 dark:text-emerald-400">
                              {dict.tk} {cartTotal}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Policy card formatted like reference screenshot */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 shadow-sm">
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-zinc-350 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm mb-2.5">
                          {lang === 'en' ? 'Cancellation Policy' : 'অর্ডার বাতিলকরণ নীতিমালা'}
                        </span>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 font-semibold">
                          {lang === 'en' 
                            ? 'Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.'
                            : 'একবার প্যাকেজিং সম্পন্ন হলে অর্ডার বাতিল করা যাবে না। অনাকাঙ্ক্ষিত বিলম্বের ক্ষেত্রে, প্রযোজ্য হলে রিফান্ড প্রদান করা হবে।'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Fixed bottom Checkout area */}
                <div className="p-4 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0">
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    id="checkout-checkout-btn"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span>{dict.placeOrder}</span>
                    {cart.length > 0 && <span className="ml-1 border-l border-emerald-500/50 pl-2 font-black text-emerald-100">{dict.tk} {cartTotal}</span>}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIVIDUAL PRODUCT DETAILS MODAL (WITH RATING REVIEWS SUBMISSION MECHANISM) */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            lang={lang}
            dict={dict}
            reviews={reviews}
            onAddReview={handleAddNewReview}
            quantityInCart={getProductQty(selectedProduct.id)}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL SELECTOR AND SIMULATOR GATEWAY */}
      <AnimatePresence>
        {activePaymentOrder && (
          <PaymentModal
            totalAmount={activePaymentOrder.total}
            onClose={() => setActivePaymentOrder(null)}
            onPaymentSuccess={handlePaymentSuccess}
            lang={lang}
            dict={dict}
            cartItems={activePaymentOrder.items}
            subtotal={activePaymentOrder.subtotal}
            bkashSettings={bkashSettings}
            onSaveBkashSettings={handleSaveBkashSettings}
          />
        )}
      </AnimatePresence>

      {/* ADD NEW PRODUCT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddProductModal
            onClose={() => setIsAddModalOpen(false)}
            onAddProduct={handleAddProductToDb}
            categories={CATEGORIES}
            lang={lang}
            dict={dict}
          />
        )}
      </AnimatePresence>

      {/* ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <AdminLoginModal
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={() => {
              setIsLoginModalOpen(false);
              setIsAdminMode(true);
              triggerNotification(lang === 'en' ? 'Logged in as Admin!' : 'এডমিন হিসেবে লগইন সফল হয়েছে!');
            }}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* FLOATING CHAT SUPPORT WIDGET */}
      {chatSupportSettings && chatSupportSettings.activePlatform !== 'none' && (
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
        >
          {/* Subtle popover tooltip */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] px-3.5 py-2 rounded-2xl shadow-lg max-w-[200px] text-center animate-bounce">
            {lang === 'en' ? '👋 Chat with us!' : '👋 আমাদের সাথে চ্যাট করুন!'}
          </div>

          <a
            href={
              chatSupportSettings.activePlatform === 'facebook'
                ? chatSupportSettings.facebookUrl.startsWith('http') 
                  ? chatSupportSettings.facebookUrl 
                  : `https://${chatSupportSettings.facebookUrl}`
                : `https://wa.me/${chatSupportSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(chatSupportSettings.whatsappMessage || '')}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all ${
              chatSupportSettings.activePlatform === 'facebook'
                ? 'bg-[#1877F2] hover:bg-[#166FE5]'
                : 'bg-[#25D366] hover:bg-[#20BA5A]'
            }`}
          >
            {chatSupportSettings.activePlatform === 'facebook' ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )}
            <span className="uppercase tracking-wider">
              {chatSupportSettings.activePlatform === 'facebook' ? 'Messenger' : 'WhatsApp'}
            </span>
          </a>
        </motion.div>
      )}

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 dark:bg-slate-950 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-extrabold text-slate-500 dark:text-slate-400">Master Mart Co.</p>
          <p>© 2026 Master Mart Ltd. All Simulated Sandbox Transactions Protected.</p>
        </div>
      </footer>


    </div>
  );

  // Layout switcher container
  if (isAdminMode) {
    return (
      <>
        <AdminPanel
          lang={lang}
          onClose={() => setIsAdminMode(false)}
          products={productsList}
          orders={allOrdersList}
          onUpdateOrderStatus={handleUpdateOrderStatusDb}
          onAddProductClick={() => setIsAddModalOpen(true)}
          onDeleteProduct={handleDeleteProductFromDb}
          onUpdateProduct={handleUpdateProductInDb}
          onRestoreDefaultProducts={handleRestoreDefaultProducts}
          bkashSettings={bkashSettings}
          onSaveBkashSettings={handleSaveBkashSettings}
          deliverySettings={deliverySettings}
          onSaveDeliverySettings={handleSaveDeliverySettings}
          chatSupportSettings={chatSupportSettings}
          onSaveChatSupportSettings={handleSaveChatSupportSettings}
        />
        <AnimatePresence>
          {isAddModalOpen && (
            <AddProductModal
              onClose={() => setIsAddModalOpen(false)}
              onAddProduct={handleAddProductToDb}
              categories={CATEGORIES}
              lang={lang}
              dict={dict}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (isMobileView && windowWidth >= 768) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 p-4 items-center justify-center transition-colors">
        
        {/* Toggle simulator control box above */}
        <div className="mb-4 flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-2xl shadow-sm z-10 text-xs">
          <Smartphone className="h-4.5 w-4.5 text-emerald-500" />
          <span className="font-black text-slate-800 dark:text-white">
            {lang === 'en' ? 'Mobile App Simulator Frame' : 'মোবাইল অ্যাপ সিমুলেটর ফ্রেম'}
          </span>
          <button
            onClick={() => setIsMobileView(false)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold dark:bg-slate-800 dark:text-zinc-300 dark:hover:bg-slate-700"
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>{dict.desktopView}</span>
          </button>
        </div>

        {/* Elegant Smartphone display container bezel - responsive dynamic height based on viewport */}
        <div className="relative w-full max-w-[395px] h-[calc(100vh-140px)] max-h-[820px] min-h-[500px] rounded-[50px] border-[10px] border-slate-800 dark:border-slate-900 shadow-2xl overflow-hidden bg-white dark:bg-slate-950 flex flex-col">
          {/* Top speaker & dynamic notch camera */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-800 dark:bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
            <span className="block h-1.5 w-1.5 rounded-full bg-slate-600" />
          </div>

          {/* Internal App Content scroll container */}
          <div id="mobile-inner-scroll" className="flex-1 overflow-y-auto h-full scroll-smooth pt-3">
            {appContent}
          </div>

          {/* Safe Home visual bar bottom */}
          <div 
            onClick={handleGoHome}
            className="h-4 bg-slate-800 dark:bg-slate-900 w-full flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors select-none group"
            title={lang === 'en' ? 'Go to Home / Reset' : 'হোম পেজে ফিরুন / রিসেট'}
            id="mobile-simulator-home-bar"
          >
            <span className="h-1 w-24 bg-white/20 rounded-full group-hover:bg-white/50 transition-colors" />
          </div>
        </div>
      </div>
    );
  }

  // Raw default desktop browser view (or native layout for actual mobile viewports)
  return appContent;
}
