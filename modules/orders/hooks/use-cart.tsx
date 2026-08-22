"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { siteConfig } from "@/core/config";
import type { Product } from "@/modules/products/types/product.types";

const STORAGE_KEY = "master_mart_cart";
const MY_ORDERS_KEY = "master_mart_my_order_codes";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  totalQuantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  freeDeliveryThreshold: number;
  baseDeliveryFee: number;
  myOrderCodes: string[];
  rememberOrder: (orderCode: string) => void;
  forgetOrder: (orderCode: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state is CLIENT-ONLY (localStorage + context) — deliberately no cookie,
 * so reading it can never drag a public route into dynamic rendering.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [myOrderCodes, setMyOrderCodes] = useState<string[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount — the cart is
    // client-only by design so public routes stay static.
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const codes = window.localStorage.getItem(MY_ORDERS_KEY);
      if (codes) {
        const parsed = JSON.parse(codes);
        if (Array.isArray(parsed)) setMyOrderCodes(parsed);
      }
    } catch {
      // storage unavailable — start empty
    }
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const addToCart = useCallback(
    (product: Product): boolean => {
      const existing = items.find((i) => i.product._id === product._id);
      const inCart = existing?.quantity ?? 0;
      if (inCart >= product.stock) return false;
      const next = existing
        ? items.map((i) =>
            i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...items, { product, quantity: 1 }];
      persist(next);
      return true;
    },
    [items, persist]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const existing = items.find((i) => i.product._id === productId);
      if (!existing) return;
      const next =
        existing.quantity <= 1
          ? items.filter((i) => i.product._id !== productId)
          : items.map((i) =>
              i.product._id === productId ? { ...i, quantity: i.quantity - 1 } : i
            );
      persist(next);
    },
    [items, persist]
  );

  const clearCart = useCallback(() => persist([]), [persist]);

  const getQuantity = useCallback(
    (productId: string) => items.find((i) => i.product._id === productId)?.quantity ?? 0,
    [items]
  );

  const rememberOrder = useCallback((orderCode: string) => {
    setMyOrderCodes((prev) => {
      const next = prev.includes(orderCode) ? prev : [orderCode, ...prev].slice(0, 20);
      try {
        window.localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const forgetOrder = useCallback((orderCode: string) => {
    setMyOrderCodes((prev) => {
      const next = prev.filter((c) => c !== orderCode);
      try {
        window.localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const { deliveryFee: baseDeliveryFee, freeDeliveryThreshold } = siteConfig.commerce;

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.quantity,
      0
    );
    const deliveryFee =
      subtotal > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee) : 0;
    return {
      items,
      isOpen,
      setOpen,
      addToCart,
      removeFromCart,
      clearCart,
      getQuantity,
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      freeDeliveryThreshold,
      baseDeliveryFee,
      myOrderCodes,
      rememberOrder,
      forgetOrder,
    };
  }, [
    items,
    isOpen,
    addToCart,
    removeFromCart,
    clearCart,
    getQuantity,
    baseDeliveryFee,
    freeDeliveryThreshold,
    myOrderCodes,
    rememberOrder,
    forgetOrder,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
