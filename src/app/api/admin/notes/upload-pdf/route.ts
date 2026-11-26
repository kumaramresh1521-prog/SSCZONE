import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB limit

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files (.pdf) are allowed" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF must be smaller than 50 MB" }, { status: 400 });
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const cleanSlug = slugify(baseName) || "document";
    const cleanFileName = `${Date.now()}_${cleanSlug}.pdf`;
    const r2Key = `notes/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to Cloudflare R2
    const { url } = await uploadToR2({
      key: r2Key,
      buffer,
      contentType: "application/pdf",
      cacheControl: "public, max-age=31536000, immutable",
    });

    // Format file size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = Number(sizeInMb) < 0.1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMb} MB`;

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
      fileSize: formattedSize,
    });
  } catch (err: any) {
    console.error("[Notes PDF Upload Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to upload PDF to Cloudflare R2" }, { status: 500 });
  }
}
