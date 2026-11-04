import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Share2, 
  Tag, 
  BookOpen, 
  Sparkles,
  CheckCircle2,
  Bookmark,
  FileSpreadsheet,
  ArrowRight
} from "lucide-react";
import { DEFAULT_BLOGS } from "@/lib/blog-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  let blog: any = null;

  try {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", params.slug)
      .single();
    if (data) blog = data;
  } catch {}

  if (!blog) {
    blog = DEFAULT_BLOGS.find((b) => b.slug === params.slug);
  }

  if (!blog) {
    return { title: "Article Not Found - SSCZone" };
  }

  let meta: any = {};
  if (blog.keywords && typeof blog.keywords === "string") {
    try { meta = JSON.parse(blog.keywords); } catch {}
  }

  const title = blog.seo_title || `${blog.title} | SSCZone`;
  const desc = blog.excerpt || blog.content.replace(/<[^>]*>?/gm, "").substring(0, 160);
  const canonicalUrl = `https://ssczone.com/blog/${blog.slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: "SSCZone",
      type: "article",
      images: blog.image_url ? [{ url: blog.image_url, width: 1200, height: 630 }] : [{ url: "https://ssczone.com/icon-512.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: blog.image_url ? [blog.image_url] : ["https://ssczone.com/icon-512.png"],
    },
  };
}

export async function generateStaticParams() {
  let slugs: string[] = DEFAULT_BLOGS.map((b) => b.slug);
  try {
    const { data: blogs } = await supabase.from("blogs").select("slug").eq("is_published", true);
    if (blogs) {
      slugs = Array.from(new Set([...slugs, ...blogs.map((b) => b.slug)]));
    }
  } catch {}

  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  let blog: any = null;

  try {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", params.slug)
      .single();
    if (data && data.is_published) blog = data;
  } catch {}

  if (!blog) {
    blog = DEFAULT_BLOGS.find((b) => b.slug === params.slug);
  }

  if (!blog) {
    notFound();
  }

  // Parse rich meta
  let meta: any = {};
  if (blog.keywords && typeof blog.keywords === "string") {
    try {
      meta = JSON.parse(blog.keywords);
    } catch {
      meta = { focus: blog.keywords };
    }
  }

  const category = blog.category || meta.category || "Exam Notification";
  const examTag = blog.exam_tag || meta.examTag || "SSC CGL";
  const focusKeyword = meta.focus || "";

  // Structured Data Schema for Google NewsArticle & Breadcrumb
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image: [blog.image_url || "https://ssczone.com/icon-512.png"],
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    author: {
      "@type": "Organization",
      name: "SSCZone Editorial Desk",
      url: "https://ssczone.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SSCZone",
      logo: {
        "@type": "ImageObject",
        url: "https://ssczone.com/icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ssczone.com/blog/${blog.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssczone.com" },
      { "@type": "ListItem", position: 2, name: "Exam Blog", item: "https://ssczone.com/blog" },
      { "@type": "ListItem", position: 3, name: blog.title, item: `https://ssczone.com/blog/${blog.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-16">
      
      {/* Google SEO JSON-LD Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog & Updates</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-gray-400 truncate max-w-[280px]">{blog.title}</span>
        </div>

        {/* Back Link */}
        <div>
          <Link href="/blog" className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to all updates
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-black text-blue-700 shadow-2xs">
              {category}
            </span>
            <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
              {examTag}
            </span>
            {focusKeyword && (
              <span className="rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-semibold">
                Topic: {focusKeyword}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-3 border-t border-gray-200/90 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>5 min read</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Verified by SSCZone Editorial Desk</span>
          </div>
        </header>

        {/* Cover Image */}
        {blog.image_url && (
          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-white">
            <img 
              src={blog.image_url} 
              alt={blog.title} 
              className="w-full h-auto object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Main Content Body */}
        <div 
          className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-3xl shadow-xs border border-gray-200 text-sm sm:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* High-Converting CBT Test Series & PYQ CTA Card */}
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>SSCZone Official CBT Exam Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Practice Authentic Shift Papers in Timed CBT Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don&apos;t just read notifications — test yourself with 100% official TCS previous year shift questions, bilingual solutions, and instant All-India percentiles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              href="/papers"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Attempt PYQ Papers →</span>
            </Link>
          </div>
        </div>

      </article>

    </div>
  );
}
