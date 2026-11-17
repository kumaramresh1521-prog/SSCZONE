import { NextResponse } from "next/server";
import { getFooterConfig } from "@/lib/footer-store";

export const revalidate = 60; // 1-minute ISR

export async function GET() {
  try {
    const config = getFooterConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error("GET /api/footer error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load footer config" },
      { status: 500 }
    );
  }
}
