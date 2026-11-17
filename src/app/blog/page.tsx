import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { buildPageMetadata } from "@/lib/seo-store";
import { getBlogCategoriesAsync } from "@/lib/blog-categories-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog", {
    title: "SSC Educational Notes & Study Articles | SSC CGL, CHSL, CPO - SSCZone",
    description: "Comprehensive chapter notes, diagrams, formulas and practice questions for SSC examinations.",
    keywords: ["SSC Biology Notes", "SSC Study Notes", "SSC Chapter Notes", "SSC Notes PDF", "SSC CGL Study Material"],
  });
}

export const revalidate = 300; // 5-minute ISR cache to prevent egress spikes while keeping data fresh

export default async function BlogListingPage() {
  let dbBlogs: any[] = [];
  const categories = await getBlogCategoriesAsync();

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, keywords, image_url, created_at, is_published")
      .eq("is_published", true)
      .not("keywords", "ilike", "%system-report%")
      .not("slug", "ilike", "sys-report%")
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbBlogs = data;
    }
  } catch (err) {
    console.error("Error fetching live blogs from Supabase:", err);
  }

  // Fail-safe disk fallback if Supabase returns empty
  if (dbBlogs.length === 0) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const backupPath = path.join(process.cwd(), "src", "data", "blogs_backup.json");
      if (fs.existsSync(backupPath)) {
        const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
        dbBlogs = Object.values(backupData).filter((b: any) => b.is_published !== false);
      }
    } catch {}
  }

  return <BlogClient initialBlogs={dbBlogs} initialCategories={categories} />;
}
