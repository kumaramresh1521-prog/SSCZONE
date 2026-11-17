import { NextResponse } from "next/server";
import { getAdsConfig } from "@/lib/ads-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAdsConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load ads config" },
      { status: 500 }
    );
  }
}
