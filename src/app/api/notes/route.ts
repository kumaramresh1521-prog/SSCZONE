import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_SUBJECTS_DATA, ChapterNote } from "@/lib/notes-data";
import { createClient } from "@/lib/supabase-server";

async function isCallerAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

// GET /api/notes - Retrieve all subjects and chapters
export async function GET(request: Request) {
  try {
    const dbNotes: ChapterNote[] = [];

    // 1. Try dedicated notes table if present
    try {
      const { data: nData, error: nErr } = await supabaseAdmin
        .from("notes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!nErr && nData && nData.length > 0) {
        for (const row of nData) {
          dbNotes.push({
            id: String(row.id),
            subjectId: row.subject_id,
            subjectName: row.subject_name,
            title: row.title,
            hindiTitle: row.hindi_title || "",
            slug: row.slug,
            readTime: row.read_time || "7 min read",
            subtopics: Array.isArray(row.subtopics) ? row.subtopics : [],
            overview: row.overview || "",
            keyPoints: Array.isArray(row.key_points) ? row.key_points : [],
            table: row.table_data && Object.keys(row.table_data).length > 0 ? row.table_data : undefined,
            tcsTrap: row.tcs_trap || undefined,
            practiceMcq: row.practice_mcq && Object.keys(row.practice_mcq).length > 0 ? row.practice_mcq : undefined,
            isActive: row.is_active ?? true,
          });
        }
      }
    } catch {}

    // 2. Also check notes saved in blogs table
    try {
      const { data: bData, error: bErr } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .ilike("keywords", "%ssc-note%")
        .order("created_at", { ascending: false });

      if (!bErr && bData && bData.length > 0) {
        for (const row of bData) {
          try {
            const parsed = JSON.parse(row.content);
            dbNotes.push({
              id: String(row.id),
              subjectId: parsed.subject_id || "physics",
              subjectName: parsed.subject_name || "General Science",
              title: row.title,
              hindiTitle: parsed.hindi_title || "",
              slug: row.slug,
              readTime: parsed.read_time || "7 min read",
              subtopics: parsed.subtopics || [],
              overview: parsed.overview || row.excerpt || "",
              keyPoints: parsed.key_points || [],
              table: parsed.table_data || parsed.table,
              tcsTrap: parsed.tcs_trap,
              practiceMcq: parsed.practice_mcq,
              isActive: row.is_published ?? true,
            });
          } catch {}
        }
      }
    } catch {}

    // If database has customized notes, merge them by subject
    if (dbNotes.length > 0) {
      const subjectMap = new Map<string, any>();

      // Populate base subjects from defaults first
      for (const defSub of DEFAULT_SUBJECTS_DATA) {
        subjectMap.set(defSub.id, {
          ...defSub,
          chapters: [...defSub.chapters],
        });
      }

      // Merge or append db notes
      for (const note of dbNotes) {
        const subId = note.subjectId.toLowerCase();
        if (!subjectMap.has(subId)) {
          subjectMap.set(subId, {
            id: subId,
            name: note.subjectName,
            iconName: "BookOpen",
            color: "blue",
            chapters: [],
          });
        }
        const sub = subjectMap.get(subId);
        // Replace existing by slug/id or append
        const existIdx = sub.chapters.findIndex((c: any) => c.slug === note.slug || c.id === note.id);
        if (existIdx >= 0) {
          sub.chapters[existIdx] = note;
        } else {
          sub.chapters.push(note);
        }
      }

      return NextResponse.json({
        subjects: Array.from(subjectMap.values()),
        source: "database",
      });
    }

    // Default high-yield curated notes
    return NextResponse.json({
      subjects: DEFAULT_SUBJECTS_DATA,
      source: "preset_defaults",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch notes" }, { status: 500 });
  }
}

// POST /api/notes - Admin creates or updates a subject note
export async function POST(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      id,
      subjectId = "physics",
      subjectName = "General Science - Physics",
      title,
      hindiTitle,
      slug,
      readTime = "7 min read",
      subtopics = [],
      overview = "",
      keyPoints = [],
      table = null,
      tcsTrap = "",
      practiceMcq = null,
      isActive = true,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const structuredPayload = {
      subject_id: subjectId,
      subject_name: subjectName,
      hindi_title: hindiTitle || "",
      read_time: readTime,
      subtopics,
      overview,
      key_points: keyPoints,
      table_data: table,
      tcs_trap: tcsTrap,
      practice_mcq: practiceMcq,
    };

    let saved = false;

    // 1. Attempt insert/update in dedicated notes table
    try {
      const rowData = {
        subject_id: subjectId,
        subject_name: subjectName,
        title,
        hindi_title: hindiTitle,
        slug,
        read_time: readTime,
        subtopics,
        overview,
        key_points: keyPoints,
        table_data: table || {},
        tcs_trap: tcsTrap,
        practice_mcq: practiceMcq || {},
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (id && !String(id).startsWith("phy-") && !String(id).startsWith("chem-") && !String(id).startsWith("pol-") && !String(id).startsWith("hist-") && !String(id).startsWith("geo-")) {
        const { error: upErr } = await supabaseAdmin.from("notes").update(rowData).eq("id", id);
        if (!upErr) saved = true;
      } else {
        const { error: inErr } = await supabaseAdmin.from("notes").insert([rowData]);
        if (!inErr) saved = true;
      }
    } catch {}

    // 2. Robust fallback into blogs table (with keywords: ssc-note:[subjectId])
    if (!saved) {
      const blogPayload = {
        title,
        slug: slug.startsWith("note-") ? slug : `note-${slug}`,
        excerpt: overview ? overview.substring(0, 160) : title,
        content: JSON.stringify(structuredPayload),
        keywords: `ssc-note:${subjectId}`,
        seo_title: `${title} - SSC Notes`,
        is_published: isActive,
        updated_at: new Date().toISOString(),
      };

      if (id && isNaN(Number(id)) && id.length > 20) {
        // Existing UUID from blogs
        await supabaseAdmin.from("blogs").update(blogPayload).eq("id", id);
      } else {
        await supabaseAdmin.from("blogs").insert([blogPayload]);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Note saved successfully to database! 🎉",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save note" }, { status: 500 });
  }
}

// DELETE /api/notes - Admin deletes a note
export async function DELETE(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json({ error: "id or slug is required" }, { status: 400 });
    }

    if (id) {
      await supabaseAdmin.from("notes").delete().eq("id", id);
      await supabaseAdmin.from("blogs").delete().eq("id", id);
    }

    if (slug) {
      await supabaseAdmin.from("notes").delete().eq("slug", slug);
      await supabaseAdmin.from("blogs").delete().eq("slug", slug);
      await supabaseAdmin.from("blogs").delete().eq("slug", `note-${slug}`);
    }

    return NextResponse.json({ success: true, message: "Note deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete note" }, { status: 500 });
  }
}
