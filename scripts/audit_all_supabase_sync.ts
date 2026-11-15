import { supabaseAdmin } from "../src/lib/supabase-admin";

async function main() {
  console.log("==================================================================");
  console.log("       SSCZONE SUPABASE COMPREHENSIVE ECOSYSTEM AUDIT");
  console.log("==================================================================\n");

  const tables = [
    "user_syllabus_progress",
    "test_attempts",
    "bookmarks",
    "profiles",
    "notes",
    "blogs",
    "previous_papers",
    "paper_questions",
    "questions",
    "subjects",
    "topics",
    "exams",
  ];

  for (const table of tables) {
    try {
      const { data, count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`❌ Table [${table}]: ERROR - ${error.message}`);
      } else {
        console.log(`✅ Table [${table}]: OK (Total rows: ${count ?? 0})`);
      }
    } catch (e: any) {
      console.log(`❌ Table [${table}]: EXCEPTION - ${e.message}`);
    }
  }

  console.log("\n--- Testing user_syllabus_progress CRUD Operations ---");
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const testSub = "quant_test";
  const testTopic = "percentage_test";

  try {
    // 1. Insert/Upsert test
    const { data: upsertData, error: upsertErr } = await supabaseAdmin
      .from("user_syllabus_progress")
      .upsert({
        user_id: testUserId,
        subject_key: testSub,
        topic_key: testTopic,
        completed: true,
        completed_at: new Date().toISOString(),
        notes: "Automated sync test",
      }, { onConflict: "user_id,subject_key,topic_key" })
      .select();

    if (upsertErr) {
      console.log("❌ user_syllabus_progress Upsert Error:", upsertErr.message);
    } else {
      console.log("✅ user_syllabus_progress Upsert Success! Inserted/Updated record:", upsertData?.[0]?.topic_key);
    }

    // 2. Read test
    const { data: readData, error: readErr } = await supabaseAdmin
      .from("user_syllabus_progress")
      .select("*")
      .eq("user_id", testUserId);

    if (readErr) {
      console.log("❌ user_syllabus_progress Read Error:", readErr.message);
    } else {
      console.log("✅ user_syllabus_progress Read Success! Found:", readData?.length, "records");
    }

    // 3. Clean up test record
    const { error: delErr } = await supabaseAdmin
      .from("user_syllabus_progress")
      .delete()
      .eq("user_id", testUserId);

    if (delErr) {
      console.log("❌ user_syllabus_progress Delete Error:", delErr.message);
    } else {
      console.log("✅ user_syllabus_progress Clean-up Success! Deleted test record.");
    }
  } catch (err: any) {
    console.error("CRUD test exception:", err.message);
  }
}

main().catch(console.error);
