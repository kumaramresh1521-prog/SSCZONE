import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Fetch existing bookmarks for this user to avoid duplicates
    const { data: existingBookmarks } = await supabaseAdmin
      .from("bookmarks")
      .select("id, question_id")
      .eq("user_id", user.id);

    const existingQuestionIds = new Set(
      (existingBookmarks || []).map((b) => b.question_id).filter(Boolean)
    );

    let syncedCount = 0;

    for (const item of items) {
      const qId = item.questionId ? Number(item.questionId) : null;
      if (qId && existingQuestionIds.has(qId)) continue;

      // Verify if question exists in questions table
      let validQuestionId: number | null = null;
      if (qId && qId > 0 && qId < 800000) {
        const { data: qCheck } = await supabaseAdmin
          .from("questions")
          .select("id")
          .eq("id", qId)
          .maybeSingle();

        if (qCheck) validQuestionId = qCheck.id;
      }

      const payload: any = {
        user_id: user.id,
        tag: item.tag || "Standard",
        created_at: item.collectedAt || new Date().toISOString(),
      };

      if (validQuestionId) {
        payload.question_id = validQuestionId;
      }

      try {
        if (item.question_text) {
          payload.question_data = {
            question_text: item.question_text,
            question_text_hi: item.question_text_hi,
            option_a: item.option_a,
            option_b: item.option_b,
            option_c: item.option_c,
            option_d: item.option_d,
            correct_answer: item.correct_answer,
            explanation: item.explanation,
            subject: item.subject,
            topic: item.topic,
            source: item.source,
            sourceTitle: item.sourceTitle,
          };
        }
      } catch {}

      const { error } = await supabaseAdmin.from("bookmarks").insert(payload);
      if (!error) {
        syncedCount++;
        if (validQuestionId) existingQuestionIds.add(validQuestionId);
      } else {
        // Fallback: try inserting without question_data if column not yet added
        delete payload.question_data;
        const { error: fallbackErr } = await supabaseAdmin.from("bookmarks").insert(payload);
        if (!fallbackErr) {
          syncedCount++;
          if (validQuestionId) existingQuestionIds.add(validQuestionId);
        }
      }
    }

    return NextResponse.json({ success: true, syncedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sync bookmarks" }, { status: 500 });
  }
}
