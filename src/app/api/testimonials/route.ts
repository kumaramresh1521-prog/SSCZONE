import { NextResponse } from "next/server";
import { getActiveTestimonials } from "@/lib/testimonials-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = getActiveTestimonials();
    return NextResponse.json({ success: true, testimonials });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load testimonials" },
      { status: 500 }
    );
  }
}
