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
  X,
  Bell,
  CheckCircle2,
  Share2,
  ExternalLink,
  GraduationCap,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  Bookmark,
  Send,
  Zap
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
  read_time?: string;
  keywords?: string;
  is_published: boolean;
  created_at: string;
}

export default function BlogClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExam, setSelectedExam] = useState("All");

  const categories = [
    { id: "All", label: "All Updates", icon: Newspaper },
    { id: "Exam Notification", label: "Official Notifications", icon: Bell },
    { id: "Answer Key & Results", label: "Answer Keys & Cut-Offs", icon: CheckCircle2 },
    { id: "Preparation Strategy", label: "Topper Strategies", icon: GraduationCap },
    { id: "Current Affairs", label: "Current Affairs", icon: Flame },
  ];

  const examOptions = [
    { id: "All", label: "🎯 All Exams" },
    { id: "SSC CGL", label: "SSC CGL" },
    { id: "SSC CHSL", label: "SSC CHSL" },
    { id: "SSC CPO", label: "SSC CPO" },
    { id: "SSC MTS", label: "SSC MTS" },
    { id: "SSC GD", label: "SSC GD Constable" },
  ];

  // Normalize blogs to safely extract rich meta from keywords JSON
  const normalizedBlogs = useMemo(() => {
    return initialBlogs.map((b) => {
      let meta: any = {};
      if (b.keywords && typeof b.keywords === "string") {
        try {
          meta = JSON.parse(b.keywords);
        } catch {
          meta = { focus: b.keywords };
        }
      }
      return {
        ...b,
        category: b.category || meta.category || "Exam Notification",
        exam_tag: b.exam_tag || meta.examTag || "SSC CGL",
        read_time: b.read_time || meta.readTime || "5 min read",
        focus_keyword: meta.focus || "",
      };
    });
  }, [initialBlogs]);

  // Multi-Filter Matching Logic
  const filteredBlogs = useMemo(() => {
    return normalizedBlogs.filter((b) => {
      // Category filter
      if (selectedCategory !== "All" && b.category !== selectedCategory) {
        return false;
      }

      // Exam filter
      if (selectedExam !== "All") {
        const combined = `${b.exam_tag || ""} ${b.title || ""} ${b.category || ""}`.toLowerCase();
        if (!combined.includes(selectedExam.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchExcerpt = b.excerpt?.toLowerCase().includes(q);
        const matchCategory = b.category?.toLowerCase().includes(q);
        const matchExam = b.exam_tag?.toLowerCase().includes(q);
        const matchFocus = b.focus_keyword?.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt && !matchCategory && !matchExam && !matchFocus) {
          return false;
        }
      }

      return true;
    });
  }, [normalizedBlogs, selectedCategory, selectedExam, searchQuery]);

  // Hero Lead Story
  const featuredBlog = useMemo(() => {
    return normalizedBlogs.find((b) => b.is_published) || normalizedBlogs[0];
  }, [normalizedBlogs]);

  // Trending Top 3 Stories
  const trendingBlogs = useMemo(() => {
    return normalizedBlogs
      .filter((b) => b.id !== featuredBlog?.id)
      .slice(0, 3);
  }, [normalizedBlogs, featuredBlog]);

  // Remaining Grid Blogs
  const gridBlogs = useMemo(() => {
    if (searchQuery || selectedCategory !== "All" || selectedExam !== "All") {
      return filteredBlogs;
    }
    return filteredBlogs.filter((b) => b.id !== featuredBlog?.id);
  }, [filteredBlogs, featuredBlog, searchQuery, selectedCategory, selectedExam]);

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All" || selectedExam !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedExam("All");
  };

  // Category Color Helper
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Exam Notification":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          gradient: "from-blue-600 to-indigo-700",
        };
      case "Answer Key & Results":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          gradient: "from-emerald-600 to-teal-800",
        };
      case "Preparation Strategy":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200/80",
          gradient: "from-amber-600 to-orange-700",
        };
      case "Current Affairs":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200/80",
          gradient: "from-purple-600 to-indigo-800",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          gradient: "from-slate-800 to-slate-950",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* ── 1. Top Live Announcement Ticker Bar ── */}
      <div className="border-b border-blue-900/10 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-2.5 px-4 text-white text-xs">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 tracking-wider shrink-0 animate-pulse">
              <Zap className="h-2.5 w-2.5 fill-slate-950" />
              Live Desk
            </span>
            <span className="truncate font-semibold text-slate-200 text-[11px] sm:text-xs">
              SSC CGL 2026 Notification, Official Answer Keys & Topper Revision Notes Live on SSCZone
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-300">
            <span>Verified TCS Exam Content</span>
            <span>•</span>
            <Link href="/papers" className="text-amber-300 hover:underline font-bold flex items-center gap-1">
              <span>Attempt PYQs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Hero Editorial Banner ── */}
      <section className="border-b border-slate-200 bg-white py-10 sm:py-12 px-4 sm:px-6 shadow-2xs">
        <div className="mx-auto max-w-6xl space-y-4">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 font-bold">Exam Updates & Educational Blog</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Publication-Grade SSC Editorial & Study Portal</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                SSC Exam Bulletins, Formulas & Topper Blueprints
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Stay updated with official notification circulars, tentative answer key challenge links, chapter-by-chapter formula cheat sheets, and high-frequency TCS pattern questions.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search updates, topics, or formulas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs & Exam Dropdown Strip */}
          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Target Exam Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">Exam:</span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
              >
                {examOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                  title="Reset all search filters"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Main Content Container ── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        
        {/* ── EDITORIAL SPOTLIGHT (Featured Lead + Trending Top 3) ── */}
        {!hasActiveFilters && featuredBlog && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-2xs">
                  <Flame className="h-3 w-3" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Editorial Spotlight & Trending
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Column (8 cols): Big Featured Lead Story */}
              <div className="lg:col-span-8 flex">
                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs hover:border-blue-400 hover:shadow-xl transition-all duration-300 w-full overflow-hidden text-left"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider border ${getCategoryTheme(featuredBlog.category).bg}`}>
                        {featuredBlog.category}
                      </span>
                      <span className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">
                        {featuredBlog.exam_tag}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold ml-auto">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredBlog.read_time}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {featuredBlog.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3">
                      {featuredBlog.excerpt ||
                        featuredBlog.content
                          .replace(/<[^>]*>?/gm, "")
                          .substring(0, 200) + "..."}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">
                        SZ
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 leading-none block">SSCZone Editorial Desk</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(featuredBlog.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Read Full Story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </div>

              {/* Right Column (4 cols): Trending Today Top 3 */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <span>Top Trending Today</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">#Rankings</span>
                </div>

                <div className="space-y-3.5 flex-1 flex flex-col justify-around">
                  {trendingBlogs.map((b, idx) => (
                    <Link
                      key={b.id}
                      href={`/blog/${b.slug}`}
                      className="group flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 w-6">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {b.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                          {b.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {b.read_time}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href="/papers"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Attempt Official Shift Tests →</span>
                  </Link>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ── 4. Main Articles Grid ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">
                {hasActiveFilters ? "Filtered Articles" : "Latest Updates & Exam Insights"}
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {gridBlogs.length} Article{gridBlogs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {hasActiveFilters && (
              <span className="text-xs text-slate-500 font-medium">
                Showing matching search results
              </span>
            )}
          </div>

          {gridBlogs.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <Newspaper className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No matching articles found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn&apos;t find any articles matching your search criteria. Try selecting another exam or reset filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridBlogs.map((blog) => {
                const theme = getCategoryTheme(blog.category);

                return (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border ${theme.bg}`}>
                          {blog.category}
                        </span>
                        {blog.exam_tag && (
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {blog.exam_tag}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {blog.excerpt ||
                          blog.content
                            .replace(/<[^>]*>?/gm, "")
                            .substring(0, 140) + "..."}
                      </p>
                    </div>

                    {/* Meta Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium mt-5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>
                          {new Date(blog.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{blog.read_time}</span>
                      </div>

                      <span className="font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Read</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 5. High-Converting Community & CBT Practice CTA ── */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>SSCZone CBT Exam Ecosystem</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              Test Your Real Exam Preparedness on SSCZone
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Practice 100% official TCS previous year shift questions under actual timer constraints, get instant percentile rank scorecards, and bilingual explanations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/papers"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/50 transition-all text-center cursor-pointer"
            >
              Attempt PYQ Shift Tests
            </Link>
            <Link
              href="/exams"
              className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-bold text-white transition-all text-center cursor-pointer"
            >
              Explore Exam Syllabus
            </Link>
          </div>
        </section>

      </main>

    </div>
  );
}
