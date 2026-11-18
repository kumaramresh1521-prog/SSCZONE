import { NextRequest, NextResponse } from "next/server";
import {
  getAllTestimonialsAsync,
  upsertTestimonialAsync,
  deleteTestimonialAsync,
  saveAllTestimonialsAsync,
  TopperTestimonial,
} from "@/lib/testimonials-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const testimonials = await getAllTestimonialsAsync();
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If an array is provided, batch update entire list (e.g. for reordering)
    if (Array.isArray(body)) {
      const saved = await saveAllTestimonialsAsync(body as TopperTestimonial[]);
      return NextResponse.json({
        success: true,
        message: "Testimonials list reordered and saved successfully",
        testimonials: saved,
      });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const saved = await upsertTestimonialAsync(body);
    const all = await getAllTestimonialsAsync();
    return NextResponse.json({
      success: true,
      message: "Topper testimonial saved & synced to Supabase! 🌟",
      testimonial: saved,
      testimonials: all,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing testimonial ID" },
        { status: 400 }
      );
    }

    const success = await deleteTestimonialAsync(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const all = await getAllTestimonialsAsync();
    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
      testimonials: all,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
