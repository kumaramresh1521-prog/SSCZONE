import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

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
      .select("*, subjects(title, exams(title)), questions(count)")
      .order("sort_order", { ascending: true });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const [topRes, subRes] = await Promise.all([
      query,
      supabaseAdmin
        .from("subjects")
        .select("id, title, exams(title)")
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
    const { id, title, subject_id, is_free, is_active } = body;

    if (id && (typeof is_free === "boolean" || typeof is_active === "boolean")) {
      const updatePayload: any = {};
      if (typeof is_free === "boolean") updatePayload.is_free = is_free;
      if (typeof is_active === "boolean") updatePayload.is_active = is_active;

      const { error } = await supabaseAdmin
        .from("topics")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true });
    }

    if (!title || !subject_id) {
      return NextResponse.json(
        { error: "Title and Subject ID are required" },
        { status: 400 }
      );
    }

    const payload = {
      title: title.trim(),
      subject_id: Number(subject_id),
      slug: slugify(title.trim()),
      is_free: is_free !== false,
    };

    if (id) {
      const { error } = await supabaseAdmin
        .from("topics")
        .update(payload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("topics")
        .insert([payload]);
      if (error) throw new Error(error.message);
    }

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

    const { error } = await supabaseAdmin
      .from("topics")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete topic" },
      { status: 500 }
    );
  }
}
