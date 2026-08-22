export type OrderStatus = "placed" | "preparing" | "on_the_way" | "delivered";
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export type OrderItem = {
  productId: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  unitEn: string;
  unitBn: string;
  image: string;
  /** Effective unit price at purchase time (discount applied). */
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  /** Public, unguessable order code (e.g. MM-482910) — the tracking capability. */
  orderCode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  etaMinutes: number;
  /** 0–100 timeline progress used by the tracker UI. */
  stepProgress: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export const ORDER_STATUS_PROGRESS: Record<OrderStatus, number> = {
  placed: 10,
  preparing: 25,
  on_the_way: 65,
  delivered: 100,
};
