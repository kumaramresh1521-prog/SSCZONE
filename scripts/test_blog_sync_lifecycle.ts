import { supabaseAdmin } from "../src/lib/supabase-admin";
import { DEFAULT_BLOGS } from "../src/lib/blog-data";

async function testLifecycle() {
  console.log("=== 1. Seeding 5 Official Blogs into Supabase ===");
  const toInsert = DEFAULT_BLOGS.map((b) => ({
    title: b.title,
    slug: b.slug,
    content: b.content.trim(),
    excerpt: b.excerpt,
    seo_title: `${b.title} | SSCZone`,
    keywords: JSON.stringify({
      category: b.category,
      examTag: b.exam_tag || "SSC CGL",
      readTime: b.read_time || "5 min read",
      focus: b.title.slice(0, 60),
      seoScore: 92,
    }),
    is_published: true,
    created_at: b.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Clean any old tests
  await supabaseAdmin.from("blogs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: inserted, error: insertErr } = await supabaseAdmin.from("blogs").insert(toInsert).select();
  if (insertErr) throw insertErr;
  console.log("Inserted count in Supabase:", inserted.length);

  console.log("\n=== 2. Checking /blog Live Page ===");
  const res1 = await fetch("http://localhost:3000/blog");
  const html1 = await res1.text();
  console.log("Contains CGL Notification:", html1.includes("SSC CGL 2026 Official Notification Out"));
  console.log("Contains Maths Strategy:", html1.includes("How to Score 45+ in SSC Maths"));

  console.log("\n=== 3. Deleting 'How to Score 45+ in SSC Maths' ===");
  const mathsPost = inserted.find((b: any) => b.slug.includes("maths"));
  console.log("Deleting blog ID:", mathsPost.id, mathsPost.title);
  
  const { error: delErr } = await supabaseAdmin.from("blogs").delete().eq("id", mathsPost.id);
  if (delErr) throw delErr;
  console.log("Deleted from Supabase successfully!");

  console.log("\n=== 4. Checking /blog Live Page Again ===");
  const res2 = await fetch("http://localhost:3000/blog");
  const html2 = await res2.text();
  console.log("Still contains CGL Notification:", html2.includes("SSC CGL 2026 Official Notification Out"));
  console.log("Contains Maths Strategy (SHOULD BE FALSE):", html2.includes("How to Score 45+ in SSC Maths"));

  if (!html2.includes("How to Score 45+ in SSC Maths") && html2.includes("SSC CGL 2026 Official Notification Out")) {
    console.log("\n>>> SUCCESS: Deletion in Supabase immediately reflected on /blog! 100% Synced! <<<");
  } else {
    console.error("\n>>> FAILED: Deletion was not reflected! <<<");
  }
}

testLifecycle().catch(console.error);
