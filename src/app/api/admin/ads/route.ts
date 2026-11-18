import { NextRequest, NextResponse } from "next/server";
import {
  getAdsConfigAsync,
  saveAdsConfigAsync,
  SiteAdsConfig,
} from "@/lib/ads-store";

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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SiteAdsConfig>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const saved = await saveAdsConfigAsync(body);
    return NextResponse.json({
      success: true,
      message: "Ad settings updated successfully across website & Supabase",
      config: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save ads config" },
      { status: 500 }
    );
  }
}
