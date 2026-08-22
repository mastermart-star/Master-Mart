import mongoose from "mongoose";
import { env } from "@/core/config/env";

let promise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  promise ??= mongoose.connect(env.MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
  return promise;
}
