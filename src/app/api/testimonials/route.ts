import { NextResponse } from "next/server";
import { getActiveTestimonialsAsync } from "@/lib/testimonials-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const testimonials = await getActiveTestimonialsAsync();
    return NextResponse.json({ success: true, testimonials }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load testimonials" },
      { status: 500 }
    );
  }
}
