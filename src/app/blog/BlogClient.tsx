"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Search,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Tag,
  BookOpen,
  X
} from "lucide-react";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category?: string;
  exam_tag?: string;
  is_published: boolean;
  created_at: string;
}

export default function BlogClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Exam Notification", "Answer Key & Results", "Preparation Strategy", "Current Affairs"];

  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((b) => {
      const matchCategory = selectedCategory === "All" || b.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [initialBlogs, selectedCategory, searchQuery]);

  const featuredBlog = initialBlogs[0];

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER SECTION */}
      <header className="border-b border-gray-200/80 bg-white pt-8 pb-8 px-4">
        <div className="mx-auto max-w-5xl">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-blue-700 font-bold">Blog & Exam Updates</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Official SSC Alerts, Notifications & Study Guides</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                SSC Exam Updates & Strategy Blog
              </h1>
              
              <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
                Stay updated with official notification releases, answer key objection links, previous year cut-off trends, and topper preparation strategies.
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* STICKY FILTER & SEARCH CONTROLS */}
      <section className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto max-w-5xl space-y-2.5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search updates, answer keys, strategies (e.g. CGL 2026, Maths)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        
        {/* TOP FEATURED ARTICLE (If available & no search active) */}
        {!searchQuery && selectedCategory === "All" && featuredBlog && (
          <Link
            href={`/blog/${featuredBlog.slug}`}
            className="group relative flex flex-col md:flex-row items-stretch gap-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left overflow-hidden"
          >
            {/* Thumbnail slot */}
            <div className="relative w-full md:w-80 aspect-[16/10] md:aspect-auto rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-900 to-indigo-900 shrink-0 flex items-center justify-center text-white">
              {featuredBlog.image_url ? (
                <img
                  src={featuredBlog.image_url}
                  alt={featuredBlog.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <Flame className="h-8 w-8 text-amber-400 mx-auto animate-bounce" />
                  <span className="text-xs font-black tracking-widest uppercase text-blue-200">Featured Article</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-700">
                    🔥 TRENDING UPDATE
                  </span>
                  {featuredBlog.category && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                      {featuredBlog.category}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {featuredBlog.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {featuredBlog.excerpt || featuredBlog.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + "..."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium mt-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(featuredBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <span className="flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Read Full Update <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ARTICLES GRID / LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>Showing <strong className="text-gray-900">{filteredBlogs.length}</strong> articles & updates</p>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-md mx-auto space-y-3">
              <Newspaper className="h-10 w-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">No matching updates found</h3>
              <p className="text-xs text-gray-500">Try searching for different keywords or reset your category filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {blog.category || "Exam Update"}
                      </span>
                      {blog.exam_tag && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {blog.exam_tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 140) + "..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-medium mt-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                      Read <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      

    </div>
  );
}
