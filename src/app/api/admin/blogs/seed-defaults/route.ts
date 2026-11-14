import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { DEFAULT_BLOGS } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
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

    // Insert only if slug does not already exist
    const { data: existing } = await supabaseAdmin
      .from("blogs")
      .select("slug");
    
    const existingSlugs = new Set((existing || []).map((e) => e.slug));
    const finalToInsert = toInsert.filter((b) => !existingSlugs.has(b.slug));

    if (finalToInsert.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("blogs")
        .insert(finalToInsert)
        .select();

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/blog");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      insertedCount: finalToInsert.length,
      message: `Successfully seeded ${finalToInsert.length} official SSC blog posts into Supabase!`,
    });
  } catch (err: any) {
    console.error("Seed blogs error:", err);
    return NextResponse.json({ error: err.message || "Failed to seed default blogs" }, { status: 500 });
  }
}
