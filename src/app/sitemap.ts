import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getPublishedSeoConfig } from "@/lib/seo-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = getPublishedSeoConfig();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || seo.canonicalUrl || "https://ssczone.com").replace(/\/$/, "");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Static core high-traffic routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/exams`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/papers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/notes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/syllabus`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/toolkit`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/daily-quiz`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/speed-test`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/typing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic Exam routes
  let examRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: exams } = await supabase.from("exams").select("slug, updated_at").eq("is_active", true);
    if (exams) {
      examRoutes = exams.map((ex) => ({
        url: `${baseUrl}/exams/${ex.slug}`,
        lastModified: ex.updated_at ? new Date(ex.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      }));
    }
  } catch (e) {
    console.error("Sitemap exams query error:", e);
  }

  // Dynamic Topic routes
  let topicRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: topics } = await supabase.from("topics").select("id, slug, updated_at").limit(500);
    if (topics) {
      topicRoutes = topics.map((t) => ({
        url: `${baseUrl}/practice/${t.slug || t.id}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap topics query error:", e);
  }

  // Dynamic Blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: blogs } = await supabase.from("blogs").select("slug, updated_at, created_at").eq("is_published", true).limit(200);
    if (blogs) {
      blogRoutes = blogs.map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : b.created_at ? new Date(b.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
      }));
    }
  } catch (e) {
    console.error("Sitemap blogs query error:", e);
  }

  return [...staticRoutes, ...examRoutes, ...topicRoutes, ...blogRoutes];
}
