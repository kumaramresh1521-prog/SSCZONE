"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Calculator,
  Compass,
  FileText,
  Globe2,
  ChevronRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Zap,
} from "lucide-react";

interface Topic {
  id: number;
  title: string;
  slug: string;
  is_free: boolean;
  is_active: boolean;
}

interface Subject {
  id: number;
  title: string;
  slug: string;
  exams?: {
    id: number;
    title: string;
    slug: string;
  };
  topics: Topic[];
}

export default function PracticeDirectoryClient({ subjects }: { subjects: Subject[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "all">("all");

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => selectedSubjectId === "all" || s.id === selectedSubjectId)
      .map((s) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return s;
        const matchingTopics = s.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            s.title.toLowerCase().includes(query) ||
            s.exams?.title?.toLowerCase().includes(query)
        );
        return { ...s, topics: matchingTopics };
      })
      .filter((s) => s.topics.length > 0);
  }, [subjects, selectedSubjectId, searchQuery]);

  const totalTopics = useMemo(() => {
    return subjects.reduce((acc, s) => acc + s.topics.length, 0);
  }, [subjects]);

  const getSubjectIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("math") || t.includes("quant")) return <Calculator className="w-5 h-5 text-emerald-600" />;
    if (t.includes("reason") || t.includes("intelligence")) return <Compass className="w-5 h-5 text-purple-600" />;
    if (t.includes("english")) return <FileText className="w-5 h-5 text-blue-600" />;
    return <Globe2 className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/40 dark:from-blue-950/20 dark:to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-bold">Question Bank</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>SSC & Railways Topic-Wise Question Bank</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Master Every Topic with <span className="text-blue-600">Chapter-Wise MCQs</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Targeted practice sets with instant bilingual step-by-step solutions, shortcut formulas, and CBT exam mode.
              Pick a chapter below to begin testing.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic (e.g. Number System, Percentage, Indus Valley, Syllogism)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubjectId("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedSubjectId === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Subjects ({totalTopics})
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSubjectId === sub.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{sub.title}</span>
                <span className="text-[10px] opacity-75">({sub.topics.length})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No chapters matched your search</h3>
            <p className="text-sm text-slate-500 mt-1">Try searching for a different topic keyword or reset your filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubjectId("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredSubjects.map((sub) => (
              <div key={sub.id} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    {getSubjectIcon(sub.title)}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      {sub.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      For all SSC Exams (CGL, CHSL, CPO, MTS, GD) &amp; Railways
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {sub.topics.length} Chapters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {sub.topics.map((t) => (
                    <Link
                      key={t.id}
                      href={`/practice/${t.slug}`}
                      className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                            MCQs Practice
                          </span>
                          {t.is_free ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Free
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              Pro
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {t.title}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span className="group-hover:text-blue-600 transition-colors">Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
