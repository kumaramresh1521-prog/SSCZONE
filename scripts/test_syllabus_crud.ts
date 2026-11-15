import { supabaseAdmin } from "../src/lib/supabase-admin";

async function main() {
  console.log("=== Testing user_syllabus_progress with Exact Application Payload ===");
  const testPayload = {
    user_id: "7f684886-4fb3-45f0-932f-2d486d266a79", // existing profile user id or valid uuid
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
    console.log("✅ Upsert SUCCESS:", upsertData?.[0]);
  }

  const { data: readData, error: readErr } = await supabaseAdmin
    .from("user_syllabus_progress")
    .select("chapter_id, theory_done, practice_done, revision_count, confidence, notes")
    .eq("exam_slug", "ssc-cgl");

  if (readErr) {
    console.error("❌ Read failed:", readErr.message);
  } else {
    console.log("✅ Read SUCCESS:", readData);
  }

  // Clean up
  await supabaseAdmin.from("user_syllabus_progress").delete().eq("chapter_id", "quant_percentage");
  console.log("✅ Cleanup SUCCESS");
}

main().catch(console.error);
