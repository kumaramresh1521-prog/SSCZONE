"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getPaperSlug } from "@/lib/paper-slugs";
import {
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Search,
  Layers,
  Zap,
  BookOpen,
  Award,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface MockPaper {
  id: number;
  title: string;
  year: number;
  total_questions?: number;
  time_allowed?: number;
  test_type?: string;
  exams?: {
    title: string;
    slug: string;
  };
  paper_questions?: { count: number }[];
}

export default function MockTestSeriesPage() {
  const [papers, setPapers] = useState<MockPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<"all" | "Tier 1" | "Tier 2">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMockPapers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("previous_papers")
          .select("*, exams(title, slug)")
          .eq("is_active", true)
          .order("year", { ascending: false });

        if (error) {
          console.error("Error fetching mock papers:", error);
        } else {
          setPapers(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch mock papers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMockPapers();
  }, []);

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const titleLower = (p.title || "").toLowerCase();
      const examLower = (p.exams?.title || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      // Search matching
      const matchesSearch =
        !search ||
        titleLower.includes(search) ||
        examLower.includes(search) ||
        String(p.year).includes(search);

      // Tier matching
      let tier: "Tier 1" | "Tier 2" = "Tier 1";
      if (
        titleLower.includes("tier-ii") ||
        titleLower.includes("tier 2") ||
        titleLower.includes("tier-2") ||
        titleLower.includes("mains")
      ) {
        tier = "Tier 2";
      }

      const matchesTier = selectedTier === "all" || tier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [papers, searchTerm, selectedTier]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      {/* Header / Hero Section */}
      <section className="bg-white border-b border-slate-200/90 pt-10 pb-12 sm:pt-14 sm:pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-5 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-black text-blue-700 uppercase tracking-wider shadow-2xs">
            <Trophy className="h-3.5 w-3.5 text-blue-600 fill-blue-500" />
            <span>Official TCS CBT Practice Engine • 100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            SSC CGL 2026 <span className="text-blue-600">Full-Length Mock Test Series</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience the exact exam hall environment: 100 Questions, 60-minute countdown timer, TCS question palette, bilingual Hindi &amp; English mode, and instant negative marking scorecards.
          </p>

          {/* Key Feature Stats Pills */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>60 Minutes (Tier-1)</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>100 MCQs • 200 Marks</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>-0.50 Negative Marking</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Bilingual (हिन्दी / English)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Controls */}
      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {(["all", "Tier 1", "Tier 2"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedTier === tier
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tier === "all" ? "All Mock Tests" : tier}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shift or exam year..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mock Tests Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded w-4/5"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No mock tests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tests matched your search criteria. Try resetting the filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTier("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper) => {
              const qCount =
                paper.paper_questions?.[0]?.count || paper.total_questions || 100;
              const isTier2 =
                (paper.title || "").toLowerCase().includes("tier-ii") ||
                (paper.title || "").toLowerCase().includes("tier 2");
              const tierName = isTier2 ? "Tier-2 Mains" : "Tier-1 CBT";
              const timeMinutes = paper.time_allowed || (isTier2 ? 135 : 60);
              const maxMarks = isTier2 ? 390 : 200;

              return (
                <div
                  key={paper.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/70 px-2 py-0.5 text-[11px] font-black uppercase text-blue-700 tracking-wider">
                        <Award className="h-3 w-3 text-blue-600" />
                        <span>{paper.exams?.title || "SSC CGL"}</span>
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {tierName}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {paper.title}
                    </h2>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">Questions</div>
                        <div className="text-xs font-bold text-slate-800">{qCount} MCQs</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">Time</div>
                        <div className="text-xs font-bold text-slate-800">{timeMinutes} Mins</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">Marks</div>
                        <div className="text-xs font-bold text-emerald-600">{maxMarks} Mks</div>
                      </div>
                    </div>

                    {/* Subject Distribution */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>Reasoning</span>
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>General Awareness</span>
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      <span>Quant</span>
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span>English</span>
                    </div>
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100">
                    <Link
                      href={`/take-test/${getPaperSlug(paper)}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all group-hover:shadow-md"
                    >
                      <Zap className="h-3.5 w-3.5 fill-white text-white" />
                      <span>Start Full Mock Test</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information & Preparation Guide */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 mt-12">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Why Practice Full-Length Mocks on SSCZone?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Practicing sectional tests alone is not enough to clear the cutoff. Full-length mock tests train your mind for 60 minutes of uninterrupted concentration, time management between tricky Quant questions and rapid General Awareness, and strategic skipping of negative marking traps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Exact TCS CBT Exam Layout</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Color-coded question palette (Green, Red, Violet) identical to the actual TCS exam hall software.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Instant Negative Scorecard</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Automated deduction of 0.50 marks per wrong answer with raw score and accuracy percentage.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>Step-by-Step Solutions</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Comprehensive Hindi and English explanations with mathematical formulas and shortcuts.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}