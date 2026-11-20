import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// GET /api/admin/topics
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subject_id");

    let query = supabaseAdmin
      .from("topics")
      .select("*, subjects(id, title, exam_id, exams(id, title)), questions(count)")
      .order("sort_order", { ascending: true });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const [topRes, subRes] = await Promise.all([
      query,
      supabaseAdmin
        .from("subjects")
        .select("id, title, exam_id, is_active, exams(id, title)")
        .order("sort_order", { ascending: true }),
    ]);

    if (topRes.error) {
      return NextResponse.json({ error: topRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      topics: topRes.data || [],
      subjects: subRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load topics" },
      { status: 500 }
    );
  }
}

// POST /api/admin/topics (Create or Update)
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id, title, description, subject_id, is_free, is_active, slug } = body;

    // 1. Quick status toggle from the table (when title is omitted)
    if (id && !title && (typeof is_free === "boolean" || typeof is_active === "boolean")) {
      const updatePayload: any = {};
      if (typeof is_free === "boolean") updatePayload.is_free = is_free;
      if (typeof is_active === "boolean") updatePayload.is_active = is_active;

      const { error } = await supabaseAdmin
        .from("topics")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);

      try {
        revalidatePath("/practice", "layout");
        revalidatePath("/exams", "layout");
      } catch {}

      return NextResponse.json({ success: true });
    }

    // 2. Full Form Submission (Create or Update)
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Topic title is required" },
        { status: 400 }
      );
    }

    if (!subject_id) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (id) {
      // Update existing topic
      const updatePayload: any = {
        title: title.trim(),
        subject_id: Number(subject_id),
        description: description ? description.trim() : null,
      };
      if (typeof is_free === "boolean") updatePayload.is_free = is_free;
      if (typeof is_active === "boolean") updatePayload.is_active = is_active;
      if (slug && typeof slug === "string" && slug.trim()) {
        updatePayload.slug = slugify(slug.trim());
      }

      const { error } = await supabaseAdmin
        .from("topics")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      // Create new topic
      const baseSlug = slugify((slug && slug.trim()) || title.trim());
      // Check slug collision
      const { data: existing } = await supabaseAdmin
        .from("topics")
        .select("id")
        .eq("slug", baseSlug)
        .maybeSingle();

      const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

      const insertPayload: any = {
        title: title.trim(),
        subject_id: Number(subject_id),
        description: description ? description.trim() : null,
        slug: finalSlug,
        is_free: is_free !== false,
        is_active: is_active !== false,
      };

      const { error } = await supabaseAdmin
        .from("topics")
        .insert([insertPayload]);
      if (error) throw new Error(error.message);
    }

    try {
      revalidatePath("/practice", "layout");
      revalidatePath("/exams", "layout");
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save topic" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/topics
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    // First delete any questions under this topic to avoid orphaned questions
    const { error: qErr } = await supabaseAdmin
      .from("questions")
      .delete()
      .eq("topic_id", id);

    if (qErr) {
      console.error("Failed to delete questions under topic:", qErr);
    }

    const { error } = await supabaseAdmin
      .from("topics")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    try {
      revalidatePath("/practice", "layout");
      revalidatePath("/exams", "layout");
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete topic" },
      { status: 500 }
    );
  }
}
