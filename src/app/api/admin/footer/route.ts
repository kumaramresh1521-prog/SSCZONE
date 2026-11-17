import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFooterConfig, saveFooterConfig } from "@/lib/footer-store";

export async function GET() {
  try {
    const config = getFooterConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error("GET /api/admin/footer error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load footer config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = saveFooterConfig(body);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin/footer");
    } catch {}

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    console.error("POST /api/admin/footer error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save footer config" },
      { status: 500 }
    );
  }
}
