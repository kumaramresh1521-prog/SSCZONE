import { NextRequest, NextResponse } from "next/server";
import {
  getAllTestimonials,
  upsertTestimonial,
  deleteTestimonial,
  saveAllTestimonials,
  TopperTestimonial,
} from "@/lib/testimonials-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = getAllTestimonials();
    return NextResponse.json({ success: true, testimonials });
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
      const saved = saveAllTestimonials(body as TopperTestimonial[]);
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

    const saved = upsertTestimonial(body);
    return NextResponse.json({
      success: true,
      message: "Topper testimonial saved & synced to Supabase! 🌟",
      testimonial: saved,
      testimonials: getAllTestimonials(),
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

    const success = deleteTestimonial(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
      testimonials: getAllTestimonials(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
