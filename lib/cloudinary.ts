import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/core/config/env";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads a base64 data-URL image to Cloudinary and returns the hosted URL.
 * When Cloudinary is not configured, returns the base64 payload unchanged so
 * the product image still renders (dev-friendly fallback, same as the old app).
 */
export async function uploadProductImage(base64Image: string): Promise<string> {
  if (!isCloudinaryConfigured()) return base64Image;

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  const res = await cloudinary.uploader.upload(base64Image, {
    folder: "master_mart_products",
    resource_type: "auto",
  });
  return res.secure_url;
}
