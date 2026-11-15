import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog", {
    title: "Official SSC Blog & Exam Alerts | SSC CGL, CHSL, CPO Updates - SSCZone",
    description: "Stay ahead with official SSC exam notifications, admit cards, answer key objection links, cut-off analysis, and topper preparation strategies.",
    keywords: ["SSC CGL 2026 Notification", "SSC CHSL Answer Key", "SSC CPO Vacancy", "SSC Preparation Strategy", "SSC Current Affairs"],
  });
}

export const revalidate = 300; // 5-minute ISR cache to prevent egress spikes while keeping data fresh

export default async function BlogListingPage() {
  let dbBlogs: any[] = [];

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, keywords, image_url, created_at, is_published, views")
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

  // 100% synced with Supabase blogs table (No ghost fallbacks)
  return <BlogClient initialBlogs={dbBlogs} />;
}
