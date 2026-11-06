import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/api-auth";
import { sanitizeBlogContent } from "@/lib/blog-sanitizer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const BACKUP_FILE = path.join(process.cwd(), "src", "data", "blogs_backup.json");

function backupBlog(blogData: any) {
  try {
    const dir = path.dirname(BACKUP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let current: Record<string, any> = {};
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        current = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf-8"));
      } catch {}
    }
    const key = blogData.slug || blogData.id || String(Date.now());
    current[key] = { ...blogData, backed_up_at: new Date().toISOString() };
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (e) {
    console.error("Error backing up blog to disk:", e);
  }
}

function safeImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      content,
      excerpt,
      seo_title,
      focus_keyword,
      category,
      exam_tag,
      image_url,
      is_published,
      seo_score,
      secondary_keywords,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Article Title is required" }, { status: 400 });
    }
    if (!slug || !slug.trim()) {
      return NextResponse.json({ error: "URL Slug is required" }, { status: 400 });
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Pack rich metadata safely into keywords field so it always matches existing Supabase schema
    const metaPayload = {
      focus: focus_keyword?.trim() || "",
      category: category?.trim() || "Exam Notification",
      examTag: exam_tag?.trim() || "SSC CGL",
      seoScore: typeof seo_score === "number" ? seo_score : 85,
      secondary: secondary_keywords?.trim() || "",
      saved_at: new Date().toISOString()
    };

    const cleanContent = sanitizeBlogContent(content);
    const cleanExcerpt = excerpt?.trim() || cleanContent.replace(/<[^>]*>?/gm, "").substring(0, 160) + "...";
    const cleanSeoTitle = seo_title?.trim() || `${title.trim()} | SSCZone`;

    const dbPayload: any = {
      title: title.trim(),
      slug: cleanSlug,
      content: cleanContent,
      excerpt: cleanExcerpt,
      seo_title: cleanSeoTitle,
      keywords: JSON.stringify(metaPayload),
      image_url: safeImageUrl(image_url),
      is_published: typeof is_published === "boolean" ? is_published : true,
      updated_at: new Date().toISOString()
    };

    let result = null;

    if (id) {
      // Update existing post
      const { data, error } = await supabaseAdmin
        .from("blogs")
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }
      result = data;
    } else {
      // Insert new post
      const { data, error } = await supabaseAdmin
        .from("blogs")
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message);
      }
      result = data;
    }

    // Also write a fail-safe disk backup
    backupBlog({ ...result, meta: metaPayload });

    return NextResponse.json({
      success: true,
      blog: result,
      meta: metaPayload
    });
  } catch (err: any) {
    console.error("Save Blog API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save blog" }, { status: 500 });
  }
}
