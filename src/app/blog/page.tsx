import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog & Exam Updates - SSCZone",
  description: "Read the latest official SSC exam notifications, admit cards, answer key alerts, and topper strategies.",
};

export const revalidate = 60; // Revalidate every minute

export default async function BlogListingPage() {
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return <BlogClient initialBlogs={blogs || []} />;
}
