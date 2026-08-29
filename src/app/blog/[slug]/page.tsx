import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ChevronRight, Share2, Tag, BookOpen } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.seo_title || `${blog.title} - SSCZone Blog`,
    description: blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150),
    keywords: blog.keywords,
    openGraph: {
      title: blog.seo_title || blog.title,
      description: blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150),
      images: blog.image_url ? [blog.image_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const { data: blogs } = await supabase.from("blogs").select("slug").eq("is_published", true);
  return (blogs || []).map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!blog || !blog.is_published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/blog" className="hover:text-blue-600">Blog & Updates</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-gray-400 truncate max-w-[200px]">{blog.title}</span>
        </div>

        {/* Back link */}
        <div>
          <Link href="/blog" className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to all updates
          </Link>
        </div>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {blog.category && (
              <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {blog.category}
              </span>
            )}
            {blog.exam_tag && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                {blog.exam_tag}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-1 border-t border-gray-200/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
            <span>•</span>
            <span>By SSCZone Editorial Team</span>
          </div>
        </header>

        {/* Cover Image */}
        {blog.image_url && (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <img 
              src={blog.image_url} 
              alt={blog.title} 
              className="w-full h-auto object-cover max-h-[450px]"
            />
          </div>
        )}

        {/* Main Content Body */}
        <div 
          className="prose prose-blue max-w-none bg-white p-6 sm:p-10 rounded-3xl shadow-xs border border-gray-200/90 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Bottom CTA Box */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-gray-900 text-sm">Prepare for this exam on SSCZone</h4>
            <p className="text-xs text-gray-600">Solve topic-wise previous year questions & attempt full-length timed mock tests.</p>
          </div>
          <Link
            href="/practice"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-all shrink-0 shadow-xs"
          >
            Start Practicing MCQs →
          </Link>
        </div>

      </article>

      {/* Footer */}
      

    </div>
  );
}
