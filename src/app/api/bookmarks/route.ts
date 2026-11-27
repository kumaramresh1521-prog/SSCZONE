import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// GET: Fetch all bookmarks for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookmarks, error } = await supabaseAdmin
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookmarks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load bookmarks" }, { status: 500 });
  }
}

// POST: Save or sync a bookmark
export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, tag, questionData, source } = body;

    // Check if question exists in main questions table
    let validQuestionId: number | null = null;
    if (questionId && typeof questionId === "number" && questionId > 0 && questionId < 800000) {
      const { data: qCheck } = await supabaseAdmin
        .from("questions")
        .select("id")
        .eq("id", questionId)
        .maybeSingle();

      if (qCheck) validQuestionId = qCheck.id;
    }

    // Upsert bookmark
    // Try inserting with validQuestionId or null (if constraint is still present)
    const payload: any = {
      user_id: user.id,
      tag: tag || "Standard",
      created_at: new Date().toISOString(),
    };

    if (validQuestionId) {
      payload.question_id = validQuestionId;
    }

    // Try storing questionData if column exists
    try {
      if (questionData) {
        payload.question_data = questionData;
      }
      if (source) {
        payload.source = source;
      }
    } catch {}

    let res = await supabaseAdmin
      .from("bookmarks")
      .upsert(payload, { onConflict: "user_id,question_id" })
      .select("*")
      .maybeSingle();

    // Fallback if upsert failed due to missing question_id on conflict
    if (res.error) {
      res = await supabaseAdmin
        .from("bookmarks")
        .insert(payload)
        .select("*")
        .maybeSingle();
    }

    if (res.error) {
      // If error was foreign key or column missing, try minimal insert
      const minimalPayload: any = {
        user_id: user.id,
        tag: tag || "Standard",
      };
      if (validQuestionId) minimalPayload.question_id = validQuestionId;

      const fallbackRes = await supabaseAdmin
        .from("bookmarks")
        .insert(minimalPayload)
        .select("*")
        .maybeSingle();

      if (fallbackRes.error) {
        return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, bookmark: fallbackRes.data });
    }

    return NextResponse.json({ success: true, bookmark: res.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save bookmark" }, { status: 500 });
  }
}

// DELETE: Remove a bookmark
export async function DELETE(req: NextRequest) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const questionId = searchParams.get("questionId");

    let query = supabaseAdmin.from("bookmarks").delete().eq("user_id", user.id);

    if (id) {
      query = query.eq("id", id);
    } else if (questionId) {
      query = query.eq("question_id", questionId);
    } else {
      return NextResponse.json({ error: "Missing bookmark id or questionId" }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete bookmark" }, { status: 500 });
  }
}
