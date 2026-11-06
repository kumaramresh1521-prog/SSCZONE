"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Clock, 
  Search, 
  ArrowRight, 
  Calendar, 
  ChevronRight, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  Filter, 
  RotateCcw, 
  X, 
  Layers, 
  Award,
  FileSpreadsheet
} from "lucide-react";
import { getPaperPdfUrl, isPaperDownloadAllowed } from "@/lib/paper-pdf-store";

function getPaperTier(title: string): "Tier 1" | "Tier 2" | null {
  const t = title.toLowerCase();
  if (t.includes("tier-ii") || t.includes("tier 2") || t.includes("tier-2") || t.includes("mains")) return "Tier 2";
  if (t.includes("tier-i") || t.includes("tier 1") || t.includes("tier-1") || t.includes("prelims")) return "Tier 1";
  return null;
}

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Dropdown Filter States
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadPapers = async () => {
    try {
      const [papersRes, serverSettings] = await Promise.all([
        supabase
          .from("previous_papers")
          .select("*, exams(title, slug)")
          .eq("is_active", true)
          .order("year", { ascending: false }),
        fetch(`/api/papers/settings?t=${Date.now()}`, { cache: "no-store" })
          .then((res) => res.json())
          .catch(() => ({}))
      ]);

      const fetched = (papersRes.data ?? []).map((p: any) => {
        const override = serverSettings?.[String(p.id)];
        const isAllowed = override !== undefined
          ? Boolean(override.allow_download)
          : (p.test_type !== "mock" && p.allow_download !== false);

        return {
          ...p,
          allow_download: isAllowed,
          test_type: isAllowed ? (p.test_type === "mock" ? "pyq" : p.test_type || "pyq") : "mock"
        };
      });
      setPapers(fetched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();

    const handleSettingsChanged = () => {
      loadPapers();
    };

    window.addEventListener("ssczone-paper-settings-changed", handleSettingsChanged);
    return () => {
      window.removeEventListener("ssczone-paper-settings-changed", handleSettingsChanged);
    };
  }, []);

  // Dynamically extract available years from papers
  const availableYears = useMemo(() => {
    const yrs = new Set<number>();
    papers.forEach((p) => {
      if (p.year) yrs.add(Number(p.year));
    });
    [2025, 2024, 2023, 2022].forEach((y) => yrs.add(y));
    return Array.from(yrs).sort((a, b) => b - a);
  }, [papers]);

  // Dynamically extract available exams
  const availableExams = useMemo(() => {
    const map = new Map<string, string>();
    map.set("cgl", "SSC CGL");
    map.set("chsl", "SSC CHSL");
    map.set("cpo", "SSC CPO");
    map.set("mts", "SSC MTS");
    map.set("gd", "SSC GD Constable");
    map.set("selection", "SSC Selection Post");
    map.set("steno", "SSC Stenographer");

    papers.forEach((p) => {
      if (p.exams?.title) {
        const raw = p.exams.title.trim();
        const key = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
        const formatted = raw.toUpperCase().startsWith("SSC") ? raw.toUpperCase() : `SSC ${raw.toUpperCase()}`;
        map.set(key, formatted);
      }
    });

    return Array.from(map.entries()).map(([val, label]) => ({ val, label }));
  }, [papers]);

  // Multi-Filter Matching Logic
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      // 1. Text Search Filter
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchExam = p.exams?.title?.toLowerCase().includes(q);
        const matchYear = String(p.year).includes(q);
        if (!matchTitle && !matchExam && !matchYear) return false;
      }

      // 2. Exam Dropdown Filter
      if (selectedExam !== "all") {
        const combined = ((p.title || "") + " " + (p.exams?.title || "") + " " + (p.exams?.slug || "")).toLowerCase();
        if (!combined.includes(selectedExam.toLowerCase())) return false;
      }

      // 3. Tier Dropdown Filter
      if (selectedTier !== "all") {
        const tier = getPaperTier(p.title || "");
        if (selectedTier === "tier1" && tier !== "Tier 1") return false;
        if (selectedTier === "tier2" && tier !== "Tier 2") return false;
      }

      // 4. Year Dropdown Filter
      if (selectedYear !== "all") {
        if (String(p.year) !== String(selectedYear)) return false;
      }

      return true;
    });
  }, [papers, searchTerm, selectedExam, selectedTier, selectedYear]);

  const hasActiveFilters = selectedExam !== "all" || selectedTier !== "all" || selectedYear !== "all" || searchTerm.trim() !== "";

  const handleResetFilters = () => {
    setSelectedExam("all");
    setSelectedTier("all");
    setSelectedYear("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
      
      {/* ── Modern Top Header ── */}
      <section className="bg-white border-b border-slate-200/80 py-8 sm:py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">Previous Year Papers</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200/60 mb-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>100% Authentic Official Question Papers</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                SSC Previous Year Shift Papers (PYQ)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Practice actual SSC shift papers in timed CBT Exam Mode with instant scorecards and detailed bilingual solutions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-center shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              <span>{papers.length} Official Shifts Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        
        {/* ── Modern Dropdown Filter Suite Card ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Filter Shift Papers
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* 4-Column Dropdown Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* 1. Exam Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Target Exam
              </label>
              <div className="relative">
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer pr-8"
                >
                  <option value="all">🎯 All SSC Exams</option>
                  {availableExams.map((ex) => (
                    <option key={ex.val} value={ex.val}>
                      {ex.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 2. Tier Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Exam Tier / Stage
              </label>
              <div className="relative">
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer pr-8"
                >
                  <option value="all">⚡ All Tiers (Tier 1 & Tier 2)</option>
                  <option value="tier1">Tier-I (Tier 1 Prelims)</option>
                  <option value="tier2">Tier-II (Tier 2 Mains)</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 3. Year Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Exam Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer pr-8"
                >
                  <option value="all">📅 All Years</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={String(yr)}>
                      Year {yr}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 4. Text Search Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Keyword / Shift Date
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 12 Sept, Shift 2..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Active Filter Pills Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 pt-1 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Active:</span>
              
              {selectedExam !== "all" && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-blue-200/60">
                  Exam: {availableExams.find(e => e.val === selectedExam)?.label || selectedExam}
                  <button onClick={() => setSelectedExam("all")} className="hover:text-blue-900 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}

              {selectedTier !== "all" && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-indigo-200/60">
                  {selectedTier === "tier1" ? "Tier 1 (Prelims)" : "Tier 2 (Mains)"}
                  <button onClick={() => setSelectedTier("all")} className="hover:text-indigo-900 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}

              {selectedYear !== "all" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-200/60">
                  Year {selectedYear}
                  <button onClick={() => setSelectedYear("all")} className="hover:text-emerald-900 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-200/60">
                  &ldquo;{searchTerm}&rdquo;
                  <button onClick={() => setSearchTerm("")} className="hover:text-amber-950 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Papers Listing Header ── */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800">
              {filteredPapers.length} Shift Paper{filteredPapers.length !== 1 ? "s" : ""} Available
            </span>
            {hasActiveFilters && (
              <span className="text-xs text-slate-400 font-medium">
                (filtered)
              </span>
            )}
          </div>
        </div>

        {/* ── Modern Shift Papers Grid / Cards ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-800">No shift papers match your filter criteria</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try selecting <b>&ldquo;All Tiers&rdquo;</b> or resetting the exam filter dropdown.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Show All Papers</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {filteredPapers.map((paper, idx) => {
              const paperPdf = getPaperPdfUrl(paper);
              const canDownload = isPaperDownloadAllowed(paper);
              const tier = getPaperTier(paper.title);
              const examTitle = paper.exams?.title || "SSC Examination";

              return (
                <div
                  key={paper.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Paper Info & Badges */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                        {examTitle}
                      </span>

                      {tier && (
                        <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {tier}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Year {paper.year}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {paper.title}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                      <span>{paper.total_questions || 100} Questions</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {paper.duration_minutes || 60} Minutes
                      </span>
                      <span>•</span>
                      <span>Max 200 Marks</span>
                      <span>•</span>
                      <span className="text-slate-600 font-semibold">Bilingual (English + Hindi)</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                    <Link
                      href={`/take-test/${paper.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-black text-white shadow-xs transition-colors hover:scale-[1.01]"
                    >
                      <span>Attempt CBT Test</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>
    </div>
  );
}
