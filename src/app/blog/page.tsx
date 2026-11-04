import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { DEFAULT_BLOGS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Official SSC Blog & Exam Alerts | SSC CGL, CHSL, CPO Updates - SSCZone",
  description: "Stay ahead with official SSC exam notifications, admit cards, answer key objection links, cut-off analysis, and topper preparation strategies.",
  keywords: ["SSC CGL 2026 Notification", "SSC CHSL Answer Key", "SSC CPO Vacancy", "SSC Preparation Strategy", "SSC Current Affairs"],
};

export const revalidate = 60; // Revalidate every minute

export default async function BlogListingPage() {
  let dbBlogs: any[] = [];

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("is_published", true)
      .not("keywords", "ilike", "%system-report%")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      dbBlogs = data;
    }
  } catch {}

  // Seamlessly merge database blogs with default curated posts to ensure the portal is always rich and populated
  const existingSlugs = new Set(dbBlogs.map((b) => b.slug));
  const fallbackBlogs = DEFAULT_BLOGS.filter((b) => !existingSlugs.has(b.slug));
  const finalBlogs = [...dbBlogs, ...fallbackBlogs];

  return <BlogClient initialBlogs={finalBlogs} />;
}
