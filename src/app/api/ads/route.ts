import { NextResponse } from "next/server";
import { getAdsConfigAsync } from "@/lib/ads-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getAdsConfigAsync();
    return NextResponse.json({ success: true, config }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load ads config" },
      { status: 500 }
    );
  }
}
