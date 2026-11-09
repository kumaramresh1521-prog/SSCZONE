"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Clock, 
  Search, 
  ArrowRight, 
  ArrowLeft,
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
  FileSpreadsheet,
  Folder,
  FolderOpen,
  LayoutGrid,
  ListFilter,
  AlertCircle
} from "lucide-react";
import { getPaperPdfUrl, isPaperDownloadAllowed } from "@/lib/paper-pdf-store";

function getPaperTier(title: string): "Tier 1" | "Tier 2" | null {
  const t = title.toLowerCase();
  if (t.includes("tier-ii") || t.includes("tier 2") || t.includes("tier-2") || t.includes("mains")) return "Tier 2";
  if (t.includes("tier-i") || t.includes("tier 1") || t.includes("tier-1") || t.includes("prelims")) return "Tier 1";
  return null;
}

function parsePaperMeta(p: any) {
  const title = (p.title || "").trim();
  const lower = title.toLowerCase();

  // Tier extraction
  let tier = "Tier-I";
  if (lower.includes("tier-ii") || lower.includes("tier 2") || lower.includes("tier-2") || lower.includes("mains")) {
    tier = "Tier-II";
  } else if (lower.includes("tier-i") || lower.includes("tier 1") || lower.includes("tier-1") || lower.includes("prelims")) {
    tier = "Tier-I";
  }

  // Shift name extraction
  let shift = title;
  const match = title.match(/\((?:Held On\s*)?([^)]+)\)/i);
  if (match) {
    shift = match[1].replace(/^Held On\s*/i, "").trim();
  } else {
    shift = title.replace(/^SSC\s+[A-Za-z0-9\s]+\d{4}\s+(Tier-[I|V]+|\w+)\s*/i, "").trim() || title;
  }

  const examTitle = (p.exams?.title || "SSC CGL").toUpperCase().trim();
  const year = Number(p.year) || (title.includes("2026") ? 2026 : 2025);
  const folderKey = `${examTitle}__${year}__${tier}`;

  return {
    examTitle,
    year,
    tier,
    shift,
    folderKey
  };
}

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'folders' (hierarchical exam series) vs 'list' (flat shifts)
  const [viewMode, setViewMode] = useState<"folders" | "list">("folders");
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);

  // Dropdown Filter States
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadPapers = async () => {
    try {
      const [papersRes, serverSettings] = await Promise.all([
        supabase
          .from("previous_papers")
          .select("*, exams(title, slug), paper_questions(count)")
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

        const realQuestionCount = p.paper_questions?.[0]?.count ?? 0;
        const meta = parsePaperMeta(p);

        return {
          ...p,
          meta,
          realQuestionCount,
          allow_download: isAllowed,
          test_type: isAllowed ? (p.test_type === "mock" ? "pyq" : p.test_type || "pyq") : "mock"
        };
      });

      // Sort most recent year first, then shift
      fetched.sort((a: any, b: any) => {
        const ya = Number(a.year) || (a.title?.includes("2026") ? 2026 : 2025);
        const yb = Number(b.year) || (b.title?.includes("2026") ? 2026 : 2025);
        if (yb !== ya) return yb - ya;
        return (b.id || 0) - (a.id || 0);
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
    [2026, 2025, 2024, 2023, 2022].forEach((y) => yrs.add(y));
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

  // Multi-Filter Matching Logic for flat papers
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

  // ── FOLDER GROUPING LOGIC (Exam > Year > Tier) ──
  const foldersMap = useMemo(() => {
    const map = new Map<string, any>();
    papers.forEach((p) => {
      const meta = p.meta || parsePaperMeta(p);
      const qCount = p.realQuestionCount ?? (p.paper_questions?.[0]?.count ?? 0);

      if (!map.has(meta.folderKey)) {
        map.set(meta.folderKey, {
          key: meta.folderKey,
          examTitle: meta.examTitle,
          year: meta.year,
          tier: meta.tier,
          papers: [],
          totalQuestions: 0,
        });
      }

      const folder = map.get(meta.folderKey)!;
      folder.papers.push(p);
      folder.totalQuestions += qCount;
    });

    return map;
  }, [papers]);

  const allFolders = useMemo(() => {
    return Array.from(foldersMap.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.examTitle.localeCompare(b.examTitle);
    });
  }, [foldersMap]);

  // Filtered Folders based on active dropdowns & search
  const filteredFolders = useMemo(() => {
    return allFolders.filter((f) => {
      if (selectedExam !== "all") {
        const k = f.examTitle.toLowerCase().replace(/[^a-z0-9]+/g, "");
        if (!k.includes(selectedExam.toLowerCase())) return false;
      }
      if (selectedYear !== "all") {
        if (String(f.year) !== String(selectedYear)) return false;
      }
      if (selectedTier !== "all") {
        if (selectedTier === "tier1" && f.tier !== "Tier-I") return false;
        if (selectedTier === "tier2" && f.tier !== "Tier-II") return false;
      }
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const matchesFolder = f.examTitle.toLowerCase().includes(q) || String(f.year).includes(q) || f.tier.toLowerCase().includes(q);
        const matchesShifts = f.papers.some((p: any) => p.title?.toLowerCase().includes(q));
        if (!matchesFolder && !matchesShifts) return false;
      }
      return true;
    });
  }, [allFolders, selectedExam, selectedYear, selectedTier, searchTerm]);

  // Selected folder object
  const currentFolder = useMemo(() => {
    if (!selectedFolderKey) return null;
    return foldersMap.get(selectedFolderKey) || null;
  }, [foldersMap, selectedFolderKey]);

  const hasActiveFilters = selectedExam !== "all" || selectedTier !== "all" || selectedYear !== "all" || searchTerm.trim() !== "";

  const handleResetFilters = () => {
    setSelectedExam("all");
    setSelectedTier("all");
    setSelectedYear("all");
    setSearchTerm("");
    setSelectedFolderKey(null);
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
            {selectedFolderKey && currentFolder && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="text-blue-700 font-bold">{currentFolder.examTitle} {currentFolder.year} ({currentFolder.tier})</span>
              </>
            )}
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
                Organized into Exam Series Folders. Open any folder to attempt actual shift papers in CBT Exam Mode with detailed solutions.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* View Switcher: Folders vs All List */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  onClick={() => { setViewMode("folders"); setSelectedFolderKey(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "folders"
                      ? "bg-white text-blue-700 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Browse by Exam Folders"
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>Folders</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-blue-700 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="View all shifts in a single list"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>All Shifts</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                <span>{papers.length} Shifts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        
        {/* ── Filter Suite Card ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Filter Papers & Folders
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
                  onChange={(e) => { setSelectedExam(e.target.value); setSelectedFolderKey(null); }}
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
                  onChange={(e) => { setSelectedTier(e.target.value); setSelectedFolderKey(null); }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer pr-8"
                >
                  <option value="all">🏆 All Tiers (Tier 1 & 2)</option>
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
                  onChange={(e) => { setSelectedYear(e.target.value); setSelectedFolderKey(null); }}
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
                  placeholder="e.g. 30 September, Shift 2..."
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

          {/* Active Filter Pills */}
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

        {/* ── VIEW A: FOLDERS VIEW (Default & Professional) ── */}
        {viewMode === "folders" && !selectedFolderKey && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-black text-slate-800">
                  Exam Series Folders ({filteredFolders.length})
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  • Click any folder to view and attempt shift papers
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-44 rounded-3xl border border-slate-200 bg-white animate-pulse" />
                ))}
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
                <Folder className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-800">No Exam Folders Currently Available</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  New verified official shift papers and folders are currently in preparation. Please check back soon or reset your filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map((f) => (
                  <div
                    key={f.key}
                    onClick={() => setSelectedFolderKey(f.key)}
                    className="group relative rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
                            {f.examTitle}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                            {f.tier}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {f.year}
                        </span>
                      </div>

                      {/* Folder Title */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform shrink-0">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {f.examTitle} {f.year}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500">
                            Official {f.tier} Shift Series
                          </span>
                        </div>
                      </div>

                      {/* Folder Metrics */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pt-1">
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
                          <span>{f.papers.length} Shift Papers</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{f.totalQuestions} Questions</span>
                        </span>
                      </div>
                    </div>

                    {/* Folder Action: Notice NO CBT BUTTON HERE! A folder is opened, not attempted */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 group-hover:underline flex items-center gap-1">
                        <span>Open Folder & View Shifts</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        CBT Mode
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VIEW B: INSIDE A SELECTED FOLDER ── */}
        {viewMode === "folders" && selectedFolderKey && currentFolder && (
          <div className="space-y-4">
            {/* Folder Header & Return Button */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFolderKey(null)}
                  className="h-9 w-9 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                  title="Back to All Folders"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                      {currentFolder.examTitle}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                      {currentFolder.tier}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Year {currentFolder.year}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {currentFolder.examTitle} {currentFolder.year} ({currentFolder.tier}) Folder
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 self-start sm:self-center">
                <span className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs">
                  {currentFolder.papers.length} Shifts Inside
                </span>
                <button
                  onClick={() => setSelectedFolderKey(null)}
                  className="text-xs font-bold text-blue-700 hover:underline px-2 py-1 cursor-pointer"
                >
                  ← All Folders
                </button>
              </div>
            </div>

            {/* List of Shift Papers inside this Folder */}
            <div className="grid gap-3.5">
              {currentFolder.papers.map((paper: any) => {
                const paperPdf = getPaperPdfUrl(paper);
                const canDownload = isPaperDownloadAllowed(paper);
                const realQCount = paper.realQuestionCount ?? (paper.paper_questions?.[0]?.count ?? 0);
                const isReadyForCbt = realQCount > 0;

                return (
                  <div
                    key={paper.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Shift Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                          {paper.meta?.examTitle || "SSC CGL"}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {paper.meta?.tier || "Tier-I"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Year {paper.year}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {paper.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                        <span className={`font-bold ${isReadyForCbt ? "text-slate-700" : "text-amber-700"}`}>
                          {realQCount > 0 ? `${realQCount} Questions` : "0 Questions Uploaded"}
                        </span>
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

                    {/* Actions: CBT Test enabled ONLY if real questions exist */}
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                      {isReadyForCbt ? (
                        <>
                          <Link
                            href={`/take-test/${paper.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-black text-white shadow-xs transition-colors hover:scale-[1.01]"
                          >
                            <span>Attempt CBT Test</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>

                          {canDownload && paperPdf && (
                            <a
                              href={paperPdf}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-colors"
                              title="Download official PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">PDF</span>
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Questions Uploading Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VIEW C: FLAT LIST VIEW ── */}
        {viewMode === "list" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-black text-slate-800">
                {filteredPapers.length} Shift Paper{filteredPapers.length !== 1 ? "s" : ""} Available
              </span>
              {hasActiveFilters && (
                <span className="text-xs text-slate-400 font-medium">
                  (filtered)
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                ))}
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
                <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-base font-bold text-slate-800">No shift papers match your criteria</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  New official papers are being uploaded and verified. Please reset your filters or switch to Folders view.
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
                {filteredPapers.map((paper) => {
                  const paperPdf = getPaperPdfUrl(paper);
                  const canDownload = isPaperDownloadAllowed(paper);
                  const tier = getPaperTier(paper.title);
                  const examTitle = paper.exams?.title || "SSC Examination";
                  const realQCount = paper.realQuestionCount ?? (paper.paper_questions?.[0]?.count ?? 0);
                  const isReadyForCbt = realQCount > 0;

                  return (
                    <div
                      key={paper.id}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
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
                          <span className={`font-bold ${isReadyForCbt ? "text-slate-700" : "text-amber-700"}`}>
                            {realQCount > 0 ? `${realQCount} Questions` : "0 Questions Uploaded"}
                          </span>
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

                      <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                        {isReadyForCbt ? (
                          <>
                            <Link
                              href={`/take-test/${paper.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-black text-white shadow-xs transition-colors hover:scale-[1.01]"
                            >
                              <span>Attempt CBT Test</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            {canDownload && paperPdf && (
                              <a
                                href={paperPdf}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">PDF</span>
                              </a>
                            )}
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            <span>Questions Uploading Soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </section>
    </div>
  );
}
