import { supabaseAdmin } from "../src/lib/supabase-admin";

async function main() {
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email").limit(1);
  const realUser = profiles?.[0];
  console.log("Real User found:", realUser);

  if (!realUser?.id) {
    console.log("No profile found");
    return;
  }

  const testPayload = {
    user_id: realUser.id,
    exam_slug: "ssc-cgl",
    chapter_id: "quant_percentage",
    theory_done: true,
    practice_done: true,
    revision_count: 2,
    confidence: "high",
    notes: "Mastered percentage formulas and conversions",
    attachments: [],
    target_date: null,
    updated_at: new Date().toISOString(),
  };

  const { data: upsertData, error: upsertErr } = await supabaseAdmin
    .from("user_syllabus_progress")
    .upsert(testPayload, { onConflict: "user_id,exam_slug,chapter_id" })
    .select();

  if (upsertErr) {
    console.error("❌ Upsert failed:", upsertErr.message);
  } else {
    console.log("✅ REAL USER UPSERT SUCCESS:", upsertData?.[0]);
  }

  const { data: readData, error: readErr } = await supabaseAdmin
    .from("user_syllabus_progress")
    .select("chapter_id, theory_done, practice_done, revision_count, confidence, notes")
    .eq("user_id", realUser.id)
    .eq("exam_slug", "ssc-cgl");

  if (readErr) {
    console.error("❌ Read failed:", readErr.message);
  } else {
    console.log("✅ REAL USER READ SUCCESS:", readData);
  }

  // Clean up
  await supabaseAdmin
    .from("user_syllabus_progress")
    .delete()
    .eq("user_id", realUser.id)
    .eq("chapter_id", "quant_percentage");
  console.log("✅ CLEANUP SUCCESS");
}

main().catch(console.error);
