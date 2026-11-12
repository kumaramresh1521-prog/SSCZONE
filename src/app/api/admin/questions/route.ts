import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { syncQuestionBankToPyq } from "@/lib/question-sync";
import { fetchAllQuestionsByTopics } from "@/lib/question-queries";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function isCallerAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

// GET /api/admin/questions?topic_id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topic_id");

  if (!topicId) {
    return NextResponse.json({ error: "topic_id is required" }, { status: 400 });
  }

  try {
    const { data, error } = await fetchAllQuestionsByTopics(supabaseAdmin, Number(topicId));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// POST /api/admin/questions (Insert single or batch questions)
export async function POST(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const questionsToInsert = Array.isArray(body) ? body : [body];

    if (questionsToInsert.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    // Insert in chunks of 100 for safety
    const chunkSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < questionsToInsert.length; i += chunkSize) {
      const chunk = questionsToInsert.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin
        .from("questions")
        .insert(chunk);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      insertedCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      count: insertedCount,
      message: `Successfully imported ${insertedCount} questions`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// PUT /api/admin/questions (Update single question)
export async function PUT(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("questions")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── 2-Way Sync: If this question exists in PYQ shift papers, auto-sync changes ──
    const syncRes = await syncQuestionBankToPyq(Number(id), updates);

    return NextResponse.json({
      success: true,
      message: syncRes.synced
        ? "Question updated and automatically synced to PYQ Shift Paper! ⚡"
        : "Question updated successfully",
      syncedToPyq: syncRes.synced
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/questions (Delete single, batch by ids, or all in topic)
export async function DELETE(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const topicId = searchParams.get("topic_id");

    // Option 1: Delete all in topic
    if (topicId) {
      const { error } = await supabaseAdmin
        .from("questions")
        .delete()
        .eq("topic_id", Number(topicId));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "All questions deleted from topic" });
    }

    // Option 2: Delete single by query param ?id=123
    if (id) {
      const { error } = await supabaseAdmin
        .from("questions")
        .delete()
        .eq("id", Number(id));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Question deleted successfully" });
    }

    // Option 3: Delete batch by body { ids: [1, 2, 3] }
    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      const { error } = await supabaseAdmin
        .from("questions")
        .delete()
        .in("id", body.ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, count: body.ids.length });
    }

    return NextResponse.json({ error: "Missing id, ids, or topic_id parameter" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/questions (Toggle active status)
export async function PATCH(request: Request) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("questions")
      .update({ is_active })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_active });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
