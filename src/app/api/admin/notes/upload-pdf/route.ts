import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to 'notes-pdf' bucket
    const { data, error } = await supabaseAdmin.storage
      .from("notes-pdf")
      .upload(cleanFileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("notes-pdf")
      .getPublicUrl(cleanFileName);

    // Format file size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = Number(sizeInMb) < 0.1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMb} MB`;

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: formattedSize,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to upload PDF" }, { status: 500 });
  }
}
