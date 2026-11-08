import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET /api/syllabus?exam=ssc-cgl
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examSlug = searchParams.get("exam") || "ssc-cgl";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, progress: [] });
    }

    const { data, error } = await supabase
      .from("user_syllabus_progress")
      .select("chapter_id, theory_done, practice_done, revision_count, confidence, notes, target_date, updated_at")
      .eq("user_id", user.id)
      .eq("exam_slug", examSlug);

    if (error) {
      // If table does not exist or has an RLS error, gracefully return empty
      console.warn("Syllabus progress fetch warning:", error.message);
      return NextResponse.json({ authenticated: true, progress: [] });
    }

    return NextResponse.json({ authenticated: true, progress: data || [] });
  } catch (err: any) {
    console.error("GET /api/syllabus error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch progress" }, { status: 500 });
  }
}

// POST /api/syllabus - Save or upsert chapter progress
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required for cloud sync", guest: true },
        { status: 401 }
      );
    }

    const {
      exam_slug = "ssc-cgl",
      chapter_id,
      theory_done = false,
      practice_done = false,
      revision_count = 0,
      confidence = "unrated",
      notes = "",
      target_date = null,
      batch = null,
    } = body;

    // Support single item or batch sync (e.g. initial guest data upload)
    if (Array.isArray(batch) && batch.length > 0) {
      const rows = batch.map((item: any) => ({
        user_id: user.id,
        exam_slug: item.exam_slug || exam_slug,
        chapter_id: item.chapter_id,
        theory_done: Boolean(item.theory_done),
        practice_done: Boolean(item.practice_done),
        revision_count: Number(item.revision_count || 0),
        confidence: item.confidence || "unrated",
        notes: item.notes || "",
        target_date: item.target_date || null,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("user_syllabus_progress")
        .upsert(rows, { onConflict: "user_id,exam_slug,chapter_id" });

      if (error) {
        console.error("Batch syllabus upsert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, count: rows.length });
    }

    if (!chapter_id) {
      return NextResponse.json({ error: "chapter_id is required" }, { status: 400 });
    }

    const payload = {
      user_id: user.id,
      exam_slug,
      chapter_id,
      theory_done: Boolean(theory_done),
      practice_done: Boolean(practice_done),
      revision_count: Number(revision_count || 0),
      confidence,
      notes: notes || "",
      target_date: target_date || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_syllabus_progress")
      .upsert(payload, { onConflict: "user_id,exam_slug,chapter_id" });

    if (error) {
      console.error("Syllabus upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: payload });
  } catch (err: any) {
    console.error("POST /api/syllabus error:", err);
    return NextResponse.json({ error: err.message || "Failed to update progress" }, { status: 500 });
  }
}
