export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  category: string;
  price: number;
  unitEn: string;
  unitBn: string;
  rating: number;
  image: string;
  discountPrice?: number;
  stock: number;
  isVeg?: boolean;
  descriptionEn?: string;
  descriptionBn?: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'preparing' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  timestamp: string;
  etaMinutes: number;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  stepProgress: number; // 0 to 100
  kfcOutlet?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BkashSettings {
  appKey: string;
  secretKey: string;
  username: string;
  password: string;
  isEnabled: boolean;
  isCoDEnabled: boolean;
}

export interface DeliverySettings {
  activeService: 'pathao' | 'steadfast' | 'none';
  pathaoStoreId: string;
  pathaoClientId: string;
  pathaoClientSecret: string;
  pathaoUsername: string;
  pathaoPassword: string;
  steadfastApiKey: string;
  steadfastSecretKey: string;
}

export interface ChatSupportSettings {
  activePlatform: 'facebook' | 'whatsapp' | 'none';
  facebookUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
}

