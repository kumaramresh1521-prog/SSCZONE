import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaticPagesConfigAsync, saveStaticPagesConfigAsync } from "@/lib/static-pages-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getStaticPagesConfigAsync();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const saved = await saveStaticPagesConfigAsync(body);
    if (!saved) {
      return NextResponse.json({ success: false, error: "Failed to persist to site_settings" }, { status: 500 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
      revalidatePath("/privacy");
      revalidatePath("/terms");
      revalidatePath("/refund");
      revalidatePath("/admin/pages");
    } catch (cacheErr) {
      console.warn("[static-pages] revalidatePath error:", cacheErr);
    }

    return NextResponse.json({ success: true, message: "Static pages configuration saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
