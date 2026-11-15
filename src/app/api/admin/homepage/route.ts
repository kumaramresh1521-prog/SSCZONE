import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getHomepageConfig, saveHomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-store";

export async function GET() {
  try {
    const config = getHomepageConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    console.error("Error reading homepage config:", err);
    return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const updated = saveHomepageConfig(payload);

    try {
      revalidatePath("/");
    } catch (e) {
      // Revalidation in dev or static context
    }

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    console.error("Error saving homepage config:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save homepage configuration" },
      { status: 500 }
    );
  }
}
