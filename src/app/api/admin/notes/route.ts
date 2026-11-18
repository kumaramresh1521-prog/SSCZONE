import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getSubjectNotesAsync,
  saveSubjectNoteAsync,
  deleteSubjectNoteAsync,
  toggleSubjectNoteActiveAsync,
} from "@/lib/subject-notes-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const notes = await getSubjectNotesAsync(false);
    return NextResponse.json({ success: true, notes }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "save") {
      const { note } = body;
      if (!note || !note.title || !note.title.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      if (!note.pdf_url || !note.pdf_url.trim()) {
        return NextResponse.json({ error: "PDF URL or file link is required" }, { status: 400 });
      }

      const saved = await saveSubjectNoteAsync(note);
      return NextResponse.json({
        success: true,
        note: saved,
        message: note.id ? "Note updated successfully!" : "New PDF Note published successfully!",
      });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing note ID" }, { status: 400 });

      const deleted = await deleteSubjectNoteAsync(id);
      if (deleted) {
        return NextResponse.json({ success: true, message: "Note deleted successfully!" });
      }
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (action === "toggle_active") {
      const { id, isActive } = body;
      if (!id) return NextResponse.json({ error: "Missing note ID" }, { status: 400 });

      const updated = await toggleSubjectNoteActiveAsync(id, Boolean(isActive));
      if (updated) {
        return NextResponse.json({
          success: true,
          note: updated,
          message: isActive ? "🟢 Note is now Live on website!" : "⚪ Note set to Draft (Hidden)",
        });
      }
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
