import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF files are allowed" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB" }, { status: 400 });
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extensionByType[file.type] || "jpg";
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const r2Key = `images/blogs/${cleanName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to Cloudflare R2
    const { url } = await uploadToR2({
      key: r2Key,
      buffer,
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });

    return NextResponse.json({
      success: true,
      url,
      path: r2Key,
    });
  } catch (err: any) {
    console.error("Upload image error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 500 });
  }
}
