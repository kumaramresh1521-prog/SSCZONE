import { NextRequest, NextResponse } from "next/server";
import {
  getChapterNotes,
  saveChapterNote,
  toggleChapterNoteStatus,
  deleteChapterNote,
  getSubjectStats,
  ALL_SUBJECTS,
  ChapterNote,
} from "@/lib/chapter-notes-store";

export const dynamic = "force-dynamic";

// ── GET: All notes for Admin with stats & subjects ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subject");
    const type = searchParams.get("type") as any;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status"); // "active" | "inactive" | "all"

    let notes = getChapterNotes({
      subject_id: subjectId || undefined,
      type: type || "all",
      search,
      active_only: false, // Admin sees everything
    });

    if (status === "active") {
      notes = notes.filter((n) => n.is_active);
    } else if (status === "inactive") {
      notes = notes.filter((n) => !n.is_active);
    }

    const stats = getSubjectStats();

    return NextResponse.json({
      success: true,
      count: notes.length,
      notes,
      stats,
      subjects: ALL_SUBJECTS,
    });
  } catch (err: any) {
    console.error("Admin chapter notes GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to load chapter notes" }, { status: 500 });
  }
}

// ── POST: Create or Update Chapter Note ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      hindi_title,
      slug,
      content,
      excerpt,
      type,
      subject_id,
      subject_name,
      chapter_number,
      chapter_title,
      read_time,
      image_url,
      is_active,
      is_featured,
      sort_order,
      exam_tag,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Chapter Title is required" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Chapter Content is required" }, { status: 400 });
    }

    const saved = saveChapterNote({
      id,
      title: title.trim(),
      hindi_title: hindi_title?.trim() || undefined,
      slug: slug?.trim() || undefined,
      content: content.trim(),
      excerpt: excerpt?.trim() || undefined,
      type: type === "educational_guide" ? "educational_guide" : "chapter_note",
      subject_id: subject_id || "physics",
      subject_name: subject_name || undefined,
      chapter_number: Number(chapter_number) || 1,
      chapter_title: chapter_title?.trim() || title.trim(),
      read_time: read_time?.trim() || "6 min read",
      image_url: image_url?.trim() || undefined,
      is_active: typeof is_active === "boolean" ? is_active : true,
      is_featured: Boolean(is_featured),
      sort_order: Number(sort_order) || 1,
      exam_tag: exam_tag?.trim() || "SSC CGL / CHSL",
    });

    return NextResponse.json({ success: true, note: saved });
  } catch (err: any) {
    console.error("Admin chapter notes POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to save chapter note" }, { status: 500 });
  }
}

// ── PATCH: One-Click ON / OFF Toggle ──
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const updated = toggleChapterNoteStatus(id, body.is_active);
    if (!updated) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Chapter note is now ${updated.is_active ? "PUBLISHED (ON)" : "DRAFT / HIDDEN (OFF)"}`,
      note: updated,
    });
  } catch (err: any) {
    console.error("Admin chapter notes PATCH error:", err);
    return NextResponse.json({ error: err.message || "Failed to toggle status" }, { status: 500 });
  }
}

// ── DELETE: Delete Chapter Note ──
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const ok = deleteChapterNote(id);
    if (!ok) {
      return NextResponse.json({ error: "Note not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Chapter note deleted successfully" });
  } catch (err: any) {
    console.error("Admin chapter notes DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete note" }, { status: 500 });
  }
}
