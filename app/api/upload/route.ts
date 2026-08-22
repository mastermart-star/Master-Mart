import { AppError } from "@/core/errors";
import { requireRole } from "@/lib/auth-guards";
import { uploadProductImage } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // ~8 MB decoded

export async function POST(request: Request) {
  try {
    await requireRole("admin"); // uploads are an admin-only capability

    const body = (await request.json()) as { image?: string };
    const image = body.image;
    if (!image || !image.startsWith("data:image/")) {
      throw new AppError(400, "Missing or invalid image payload");
    }
    if (image.length > (MAX_IMAGE_BYTES * 4) / 3) {
      throw new AppError(413, "Image is too large (max ~8 MB)");
    }

    const url = await uploadProductImage(image);
    return Response.json({ success: true, url });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : "Image upload failed";
    if (status === 500) console.error("POST /api/upload", error);
    return Response.json({ error: message }, { status });
  }
}
