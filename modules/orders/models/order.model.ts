import mongoose, { Schema, model, models } from "mongoose";
import type {
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types/order.types";

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  orderCode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  etaMinutes: number;
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
  createdAtUtc: Date;
  updatedAtUtc: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    nameEn: { type: String, required: true },
    nameBn: { type: String, required: true },
    unitEn: { type: String, required: true },
    unitBn: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: { type: String, required: true, unique: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["placed", "preparing", "on_the_way", "delivered"],
      default: "placed",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    etaMinutes: { type: Number, default: 10 },
    stepProgress: { type: Number, default: 10, min: 0, max: 100 },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    courierTrackingId: { type: String },
    courierTrackingUrl: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
    driverPhoto: { type: String },
  },
  { timestamps: { createdAt: "createdAtUtc", updatedAt: "updatedAtUtc" } }
);

OrderSchema.index({ createdAtUtc: -1 });
OrderSchema.index({ status: 1, createdAtUtc: -1 });

export const OrderModel =
  (models.Order as mongoose.Model<IOrder>) ?? model<IOrder>("Order", OrderSchema, "Order");
