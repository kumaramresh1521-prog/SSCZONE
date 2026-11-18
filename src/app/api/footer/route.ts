import { NextResponse } from "next/server";
import { getFooterConfigAsync } from "@/lib/footer-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getFooterConfigAsync();
    return NextResponse.json({ success: true, config }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    console.error("GET /api/footer error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load footer config" },
      { status: 500 }
    );
  }
}
