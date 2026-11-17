import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");

  try {
    // If a specific blog ID is requested (e.g. for opening editor), fetch full record including heavy content
    if (id) {
      const { data, error } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ error: error?.message || "Blog not found" }, { status: 404 });
      }

      let meta: any = {};
      if (data.keywords && typeof data.keywords === "string") {
        try {
          meta = JSON.parse(data.keywords);
        } catch {
          meta = { focus: data.keywords };
        }
      }

      const enriched = {
        ...data,
        category: data.category || meta.category || "",
        exam_tag: data.exam_tag !== undefined ? (data.exam_tag ?? "") : (meta.examTag ?? ""),
        focus_keyword: meta.focus || "",
        secondary_keywords: meta.secondary || "",
        seo_score: typeof meta.seoScore === "number" ? meta.seoScore : 85,
      };

      return NextResponse.json({ success: true, blog: enriched });
    }

    // High-performance list view: exclude heavy `content` column (SVGs, massive HTML)
    // Drops payload from ~1MB+ down to ~1KB, loading instantaneously!
    const { data, error } = await supabaseAdmin
      .from("blogs")
      .select("id, title, slug, excerpt, keywords, image_url, created_at, updated_at, is_published, seo_title")
      .not("keywords", "ilike", "%system-report%")
      .not("slug", "ilike", "sys-report%")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/admin/blogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = (data || []).map((b) => {
      let meta: any = {};
      if (b.keywords && typeof b.keywords === "string") {
        try {
          meta = JSON.parse(b.keywords);
        } catch {
          meta = { focus: b.keywords };
        }
      }
      const bAny = b as any;
      return {
        ...b,
        category: bAny.category || meta.category || "",
        exam_tag: bAny.exam_tag !== undefined ? (bAny.exam_tag ?? "") : (meta.examTag ?? ""),
        focus_keyword: meta.focus || "",
        secondary_keywords: meta.secondary || "",
        seo_score: typeof meta.seoScore === "number" ? meta.seoScore : 85,
      };
    });

    return NextResponse.json({ success: true, blogs: enriched });
  } catch (err: any) {
    console.error("GET /api/admin/blogs error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load blogs" },
      { status: 500 }
    );
  }
}
