import "server-only";
import { siteConfig } from "./site";

const isProduction = process.env.NODE_ENV === "production";

function required(key: string, devFallback?: string): string {
  const value = process.env[key];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  if (devFallback === undefined) {
    throw new Error(`Missing environment variable ${key} and no dev fallback`);
  }
  return devFallback;
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGODB_URL: required("MONGODB_URL", `mongodb://127.0.0.1:27017/${siteConfig.slug}`),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET", "dev-only-insecure-secret"),
  BETTER_AUTH_URL: required(
    "BETTER_AUTH_URL",
    isProduction ? siteConfig.siteUrl : "http://localhost:3000"
  ),

  // Optional integrations — features degrade gracefully when unset.
  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET"),
  SMTP_HOST: optional("SMTP_HOST"),
  SMTP_PORT: optional("SMTP_PORT"),
  SMTP_USER: optional("SMTP_USER"),
  SMTP_PASS: optional("SMTP_PASS"),
} as const;
