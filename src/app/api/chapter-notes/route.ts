import { NextRequest, NextResponse } from "next/server";
import {
  getChapterNotes,
  getChapterNoteBySlug,
  ALL_SUBJECTS,
  getSubjectStats,
} from "@/lib/chapter-notes-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const subjectId = searchParams.get("subject");
    const type = searchParams.get("type") as "chapter_note" | "educational_guide" | "all" | null;
    const search = searchParams.get("search") || undefined;
    const includeStats = searchParams.get("includeStats") === "true";

    // Single note fetch by slug
    if (slug) {
      const note = getChapterNoteBySlug(slug);
      if (!note || !note.is_active) {
        return NextResponse.json({ error: "Chapter note not found or inactive" }, { status: 404 });
      }
      return NextResponse.json({ success: true, note });
    }

    // List of active chapter notes
    const notes = getChapterNotes({
      subject_id: subjectId || undefined,
      type: type || "all",
      search,
      active_only: true,
    });

    const stats = includeStats ? getSubjectStats() : undefined;

    return NextResponse.json({
      success: true,
      count: notes.length,
      subjects: ALL_SUBJECTS,
      notes,
      stats,
    });
  } catch (err: any) {
    console.error("Public chapter notes API error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch chapter notes" }, { status: 500 });
  }
}
