import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFooterConfigAsync, saveFooterConfigAsync } from "@/lib/footer-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getFooterConfigAsync();
    return NextResponse.json({ success: true, config }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
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
    const updated = await saveFooterConfigAsync(body);

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
