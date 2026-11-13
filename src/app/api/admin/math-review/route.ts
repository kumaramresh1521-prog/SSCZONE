import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client using service_role key — bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * PATCH /api/admin/math-review
 *
 * Body: {
 *   review_id:    number   — math_review.id
 *   question_id:  number   — paper_questions.id
 *   field_name:   string   — column to update (e.g. "question_text")
 *   new_value:    string   — replacement text / markdown table
 *   status:       "approved" | "rejected" | "skipped"
 *   review_notes: string | null
 * }
 *
 * On approve:
 *   1. Updates math_review row (status, admin_latex, reviewed_at)
 *   2. Updates paper_questions[field_name] with new_value  ← uses service_role
 *
 * On reject / skip:
 *   Only updates math_review row (status, review_notes, reviewed_at).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_id, question_id, field_name, new_value, status, review_notes } = body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!review_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: review_id, status" },
        { status: 400 }
      );
    }
    if (!["approved", "rejected", "skipped"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (status === "approved" && (!question_id || !field_name || !new_value?.trim())) {
      return NextResponse.json(
        { error: "Approve requires question_id, field_name, and non-empty new_value" },
        { status: 400 }
      );
    }

    const reviewedAt = new Date().toISOString();

    // ── Step 1: Update math_review row ─────────────────────────────────────
    const { error: mrError } = await supabaseAdmin
      .from("math_review")
      .update({
        status,
        admin_latex: status === "approved" ? new_value.trim() : null,
        review_notes: review_notes || null,
        reviewed_at: reviewedAt,
      })
      .eq("id", review_id);

    if (mrError) {
      console.error("[math-review PATCH] math_review update error:", mrError);
      return NextResponse.json(
        { error: `math_review update failed: ${mrError.message}` },
        { status: 500 }
      );
    }

    // ── Step 2: If approved, patch paper_questions using service_role key ──
    if (status === "approved") {
      const { error: pqError } = await supabaseAdmin
        .from("paper_questions")
        .update({ [field_name]: new_value.trim() })
        .eq("id", question_id);

      if (pqError) {
        console.error("[math-review PATCH] paper_questions update error:", pqError);
        // Roll back math_review status to pending so admin can retry
        await supabaseAdmin
          .from("math_review")
          .update({ status: "pending", admin_latex: null, reviewed_at: null })
          .eq("id", review_id);

        return NextResponse.json(
          { error: `paper_questions update failed: ${pqError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    console.error("[math-review PATCH] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
