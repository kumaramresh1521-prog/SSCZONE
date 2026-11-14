import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getPublishedSeoConfig } from "@/lib/seo-store";
import { getChapterNotes } from "@/lib/chapter-notes-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Regenerate the sitemap every minute so newly published content appears automatically.
export const revalidate = 60;

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
    { url: `${baseUrl}/blog/notes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/toolkit/rank-predictor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/toolkit/age-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/toolkit/photo-resizer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  // Dynamic Exam routes
  let examRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: exams } = await supabase
      .from("exams")
      .select("slug")
      .eq("is_active", true);
    if (exams) {
      examRoutes = exams.map((ex) => ({
        url: `${baseUrl}/exams/${ex.slug}`,
        lastModified: new Date(),
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
    const { data: topics } = await supabase
      .from("topics")
      .select("id, slug")
      .eq("is_active", true)
      .limit(500);
    if (topics) {
      topicRoutes = topics.map((t) => ({
        url: `${baseUrl}/practice/${t.slug || t.id}`,
        lastModified: new Date(),
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

  // Dynamic PYQ Test routes — only active papers
  let paperRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: papers, error: papersError } = await supabase
      .from("previous_papers")
      .select("id, created_at")
      .eq("is_active", true)
      .limit(500);
    if (papersError) console.error("Sitemap papers query error:", papersError.message);
    if (papers) {
      paperRoutes = papers.map((p) => ({
        url: `${baseUrl}/take-test/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error("Sitemap papers query error:", e);
  }

  // Dynamic Chapter Notes routes (JSON file store)
  let noteRoutes: MetadataRoute.Sitemap = [];
  try {
    const notes = getChapterNotes({ active_only: true });
    noteRoutes = notes.map((n) => ({
      url: `${baseUrl}/blog/notes/${n.slug}`,
      lastModified: n.updated_at ? new Date(n.updated_at) : n.created_at ? new Date(n.created_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap chapter notes error:", e);
  }

  return [...staticRoutes, ...examRoutes, ...topicRoutes, ...blogRoutes, ...paperRoutes, ...noteRoutes];
}
