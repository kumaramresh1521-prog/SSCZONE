import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/admin/subjects
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const [subRes, exRes] = await Promise.all([
      supabaseAdmin
        .from("subjects")
        .select("*, exams(title), topics(count)")
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("exams")
        .select("id, title, is_active")
        .order("id", { ascending: true }),
    ]);

    if (subRes.error) {
      return NextResponse.json({ error: subRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      subjects: subRes.data || [],
      exams: exRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load subjects" },
      { status: 500 }
    );
  }
}

// POST /api/admin/subjects (Create or Update)
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id, title, exam_id, is_active } = body;

    if (typeof is_active === "boolean" && id) {
      const { error } = await supabaseAdmin
        .from("subjects")
        .update({ is_active })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true });
    }

    if (!title || !exam_id) {
      return NextResponse.json(
        { error: "Title and Exam ID are required" },
        { status: 400 }
      );
    }

    const payload = {
      title: title.trim(),
      exam_id: Number(exam_id),
      slug: slugify(title.trim()),
    };

    if (id) {
      const { error } = await supabaseAdmin
        .from("subjects")
        .update(payload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("subjects")
        .insert([payload]);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save subject" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subjects
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete subject" },
      { status: 500 }
    );
  }
}
