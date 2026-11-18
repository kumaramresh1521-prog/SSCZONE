import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message must be at least 5 characters long." }, { status: 400 });
    }

    // Try persisting inquiry into contact_inquiries table if available
    try {
      await supabaseAdmin.from("contact_inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().toLowerCase().slice(0, 150),
        subject: subject.trim().slice(0, 200),
        message: message.trim().slice(0, 3000),
      });
    } catch (dbErr) {
      console.warn("Could not insert to contact_inquiries table (may need migration):", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your inquiry has been received. Our team will get back to you shortly.",
    });
  } catch (err: any) {
    console.error("Error in POST /api/contact:", err);
    return NextResponse.json(
      { error: "Failed to process inquiry. Please try again." },
      { status: 500 }
    );
  }
}
