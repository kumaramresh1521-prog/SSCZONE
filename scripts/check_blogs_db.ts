import { supabaseAdmin } from "../src/lib/supabase-admin";

async function check() {
  const { data, error } = await supabaseAdmin.from("blogs").select("*");
  console.log("Error:", error);
  console.log("Total rows in blogs table:", data?.length);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
    data.forEach((b: any) => {
      console.log("- Row:", { id: b.id, slug: b.slug, title: b.title, is_published: b.is_published, keywords: b.keywords });
    });
  }
}

check().catch(console.error);
