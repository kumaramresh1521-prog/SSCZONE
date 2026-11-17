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
      seo_title,
      seo_description,
      keywords,
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
      exam_tag: exam_tag !== undefined ? (exam_tag?.trim() || "") : "",
      seo_title: seo_title?.trim() || undefined,
      seo_description: seo_description?.trim() || undefined,
      keywords: Array.isArray(keywords) ? keywords : typeof keywords === "string" ? keywords.split(",").map((k: string) => k.trim()).filter(Boolean) : undefined,
    });

    // 2. Sync to Supabase blogs table for zero-deployment live publishing
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const meta = {
          hindiTitle: saved.hindi_title,
          readTime: saved.read_time,
          examTag: saved.exam_tag,
          category: saved.subject_id || "general",
          focus: saved.title,
          secondary: saved.keywords || [],
        };

        await supabaseAdmin.from("blogs").upsert(
          {
            slug: saved.slug,
            title: saved.title,
            excerpt: saved.excerpt || "",
            content: saved.content,
            keywords: JSON.stringify(meta),
            is_published: saved.is_active,
            image_url: saved.image_url || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );
      }

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/blog/notes");
      if (saved.slug) {
        revalidatePath(`/blog/notes/${saved.slug}`);
      }
      const { invalidateChapterNotesCache } = await import("@/lib/chapter-notes-store");
      invalidateChapterNotesCache(saved.slug);
    } catch (e) {
      console.error("Error syncing chapter note to Supabase:", e);
    }

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

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        await supabaseAdmin
          .from("blogs")
          .update({
            is_published: updated.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("slug", updated.slug);
      }
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/blog/notes");
      revalidatePath(`/blog/notes/${updated.slug}`);
      const { invalidateChapterNotesCache } = await import("@/lib/chapter-notes-store");
      invalidateChapterNotesCache(updated.slug);
    } catch (e) {
      console.error("Error updating toggle in Supabase:", e);
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

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await supabaseAdmin.from("blogs").delete().eq("id", id);
        } else {
          await supabaseAdmin.from("blogs").delete().eq("slug", id);
        }
      }
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/blog/notes");
      const { invalidateChapterNotesCache } = await import("@/lib/chapter-notes-store");
      invalidateChapterNotesCache();
    } catch (e) {
      console.error("Error deleting from Supabase:", e);
    }

    return NextResponse.json({ success: true, message: "Chapter note deleted successfully" });
  } catch (err: any) {
    console.error("Admin chapter notes DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete note" }, { status: 500 });
  }
}
