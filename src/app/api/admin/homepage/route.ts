import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getHomepageConfigAsync,
  saveHomepageConfigAsync,
  DEFAULT_HOMEPAGE_CONFIG,
} from "@/lib/homepage-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getHomepageConfigAsync();
    return NextResponse.json(config, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err: any) {
    console.error("Error reading homepage config:", err);
    return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const updated = await saveHomepageConfigAsync(payload);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    console.error("Error saving homepage config:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save homepage configuration" },
      { status: 500 }
    );
  }
}
