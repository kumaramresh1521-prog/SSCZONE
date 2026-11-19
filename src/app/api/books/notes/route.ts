import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getBooksFreeNotesAsync,
  saveBooksFreeNotesAsync,
  BooksFreeNotesSectionConfig,
} from "@/lib/books-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getBooksFreeNotesAsync();
    return NextResponse.json(
      { success: true, config },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load notes config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: BooksFreeNotesSectionConfig = await request.json();

    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, error: "Section title is required" },
        { status: 400 }
      );
    }

    const saved = await saveBooksFreeNotesAsync(body);

    try {
      revalidatePath("/books");
      revalidatePath("/admin/books");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Books Free Notes section updated and synced to Supabase!",
      saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save notes config" },
      { status: 500 }
    );
  }
}
