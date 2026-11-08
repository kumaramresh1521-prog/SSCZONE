"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ALL_EXAM_SYLLABUSES,
  getExamSyllabus,
  getTotalChapterCount,
  ChapterItem,
  SubjectCategory,
  ExamSyllabus,
  UserChapterProgress,
  CustomTopicItem,
} from "@/lib/syllabus-master-data";
import {
  Calculator,
  Brain,
  BookA,
  Landmark,
  Laptop,
  CheckCircle2,
  Circle,
  RotateCw,
  Star,
  Flame,
  Zap,
  ExternalLink,
  StickyNote,
  Edit3,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Printer,
  Sparkles,
  Share2,
  Check,
  Calendar,
  FileText,
  Bookmark,
  Plus,
  Trash2,
  Cloud,
  BookOpen,
} from "lucide-react";

// Subject icon resolver
function getSubjectIcon(iconName: string, className: string = "w-5 h-5") {
  switch (iconName) {
    case "Calculator":
      return <Calculator className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "BookA":
      return <BookA className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    case "Laptop":
      return <Laptop className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

// Subject color theme classes
function getSubjectTheme(color: string) {
  switch (color) {
    case "blue":
      return {
        tabActive: "bg-blue-600 text-white shadow-md shadow-blue-200 border-blue-600",
        tabInactive: "text-slate-700 hover:bg-blue-50 border-transparent hover:border-blue-200",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        progress: "bg-blue-600",
        ring: "text-blue-600",
        accent: "border-l-blue-600",
      };
    case "purple":
      return {
        tabActive: "bg-purple-600 text-white shadow-md shadow-purple-200 border-purple-600",
        tabInactive: "text-slate-700 hover:bg-purple-50 border-transparent hover:border-purple-200",
        badge: "bg-purple-100 text-purple-800 border-purple-200",
        progress: "bg-purple-600",
        ring: "text-purple-600",
        accent: "border-l-purple-600",
      };
    case "emerald":
      return {
        tabActive: "bg-emerald-600 text-white shadow-md shadow-emerald-200 border-emerald-600",
        tabInactive: "text-slate-700 hover:bg-emerald-50 border-transparent hover:border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        progress: "bg-emerald-600",
        ring: "text-emerald-600",
        accent: "border-l-emerald-600",
      };
    case "amber":
      return {
        tabActive: "bg-amber-600 text-white shadow-md shadow-amber-200 border-amber-600",
        tabInactive: "text-slate-700 hover:bg-amber-50 border-transparent hover:border-amber-200",
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        progress: "bg-amber-600",
        ring: "text-amber-600",
        accent: "border-l-amber-600",
      };
    case "sky":
      return {
        tabActive: "bg-sky-600 text-white shadow-md shadow-sky-200 border-sky-600",
        tabInactive: "text-slate-700 hover:bg-sky-50 border-transparent hover:border-sky-200",
        badge: "bg-sky-100 text-sky-800 border-sky-200",
        progress: "bg-sky-600",
        ring: "text-sky-600",
        accent: "border-l-sky-600",
      };
    default:
      return {
        tabActive: "bg-slate-900 text-white border-slate-900",
        tabInactive: "text-slate-700 hover:bg-slate-100 border-transparent",
        badge: "bg-slate-100 text-slate-800 border-slate-200",
        progress: "bg-slate-900",
        ring: "text-slate-900",
        accent: "border-l-slate-900",
      };
  }
}

export default function SyllabusTrackerClient() {
  const [selectedExamSlug, setSelectedExamSlug] = useState<string>("ssc-cgl");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("quant");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "high_weightage" | "pending" | "mastered">("all");
  
  // Progress state keyed by chapterId
  const [progressMap, setProgressMap] = useState<Record<string, UserChapterProgress>>({});
  
  // Custom user-added topics keyed by subjectId
  const [customTopics, setCustomTopics] = useState<Record<string, CustomTopicItem[]>>({});
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newTopicCategory, setNewTopicCategory] = useState<string>("Custom Topics");

  // Scratchpad drawer open states
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  // Sync state: "synced" | "saving" | "offline" | "guest"
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline" | "guest">("offline");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Current active exam object
  const activeExam: ExamSyllabus = useMemo(() => {
    return getExamSyllabus(selectedExamSlug);
  }, [selectedExamSlug]);

  // Current active subject
  const activeSubject: SubjectCategory = useMemo(() => {
    const found = activeExam.subjects.find((s) => s.id === selectedSubjectId);
    return found || activeExam.subjects[0];
  }, [activeExam, selectedSubjectId]);

  // Load progress from localStorage on mount & when exam changes
  useEffect(() => {
    const storageKey = `ssczone_syllabus_${selectedExamSlug}`;
    const customKey = `ssczone_custom_topics_${selectedExamSlug}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setProgressMap(JSON.parse(saved));
      } else {
        setProgressMap({});
      }
      const savedCustom = localStorage.getItem(customKey);
      if (savedCustom) {
        setCustomTopics(JSON.parse(savedCustom));
      } else {
        setCustomTopics({});
      }
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }

    // Check Cloud Sync
    fetch(`/api/syllabus?exam=${selectedExamSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setSyncStatus("synced");
          if (Array.isArray(data.progress) && data.progress.length > 0) {
            setProgressMap((prev) => {
              const merged = { ...prev };
              data.progress.forEach((p: any) => {
                merged[p.chapter_id] = {
                  chapter_id: p.chapter_id,
                  theory_done: p.theory_done,
                  practice_done: p.practice_done,
                  revision_count: p.revision_count ?? 0,
                  confidence: p.confidence || "unrated",
                  notes: p.notes || "",
                  target_date: p.target_date || undefined,
                  updated_at: p.updated_at || new Date().toISOString(),
                };
              });
              try {
                localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          }
        } else {
          setIsAuthenticated(false);
          setSyncStatus("guest");
        }
      })
      .catch(() => {
        setSyncStatus("offline");
      });
  }, [selectedExamSlug]);

  // Helper to persist to localStorage & cloud
  const updateProgress = (chapterId: string, patch: Partial<UserChapterProgress>) => {
    setProgressMap((prev) => {
      const current = prev[chapterId] || {
        chapter_id: chapterId,
        theory_done: false,
        practice_done: false,
        revision_count: 0,
        confidence: "unrated",
        notes: "",
        updated_at: new Date().toISOString(),
      };

      const updated: UserChapterProgress = {
        ...current,
        ...patch,
        updated_at: new Date().toISOString(),
      };

      const nextMap = { ...prev, [chapterId]: updated };

      // Persist locally
      try {
        localStorage.setItem(`ssczone_syllabus_${selectedExamSlug}`, JSON.stringify(nextMap));
      } catch (_) {}

      // Cloud sync debounced if authenticated
      if (isAuthenticated) {
        setSyncStatus("saving");
        if (debounceTimers.current[chapterId]) {
          clearTimeout(debounceTimers.current[chapterId]);
        }
        debounceTimers.current[chapterId] = setTimeout(() => {
          fetch("/api/syllabus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam_slug: selectedExamSlug,
              ...updated,
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) setSyncStatus("synced");
            })
            .catch(() => setSyncStatus("offline"));
        }, 600);
      }

      return nextMap;
    });
  };

  // Toggle Theory Check
  const handleToggleTheory = (chapterId: string) => {
    const cur = progressMap[chapterId]?.theory_done || false;
    updateProgress(chapterId, { theory_done: !cur });
  };

  // Toggle Practice (50+ PYQs) Check
  const handleTogglePractice = (chapterId: string) => {
    const cur = progressMap[chapterId]?.practice_done || false;
    updateProgress(chapterId, { practice_done: !cur });
  };

  // Step Revision Count: 0 -> 1 -> 2 -> 3 -> 0
  const handleStepRevision = (chapterId: string) => {
    const cur = progressMap[chapterId]?.revision_count || 0;
    const next = (cur + 1) % 4; // Cycles 0, 1, 2, 3
    updateProgress(chapterId, { revision_count: next });
  };

  // Cycle Confidence: unrated -> low -> medium -> high -> unrated
  const handleCycleConfidence = (chapterId: string) => {
    const cur = progressMap[chapterId]?.confidence || "unrated";
    const order: UserChapterProgress["confidence"][] = ["unrated", "low", "medium", "high"];
    const nextIdx = (order.indexOf(cur) + 1) % order.length;
    updateProgress(chapterId, { confidence: order[nextIdx] });
  };

  // Add custom user subtopic
  const handleAddCustomTopic = () => {
    if (!newTopicName.trim()) return;
    const item: CustomTopicItem = {
      id: `custom_${Date.now()}`,
      subject_id: activeSubject.id,
      name: newTopicName.trim(),
      category: newTopicCategory.trim() || "Custom Topics",
      created_at: new Date().toISOString(),
    };

    setCustomTopics((prev) => {
      const subjectList = prev[activeSubject.id] || [];
      const updated = { ...prev, [activeSubject.id]: [...subjectList, item] };
      try {
        localStorage.setItem(`ssczone_custom_topics_${selectedExamSlug}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    setNewTopicName("");
    setShowAddCustomModal(false);
  };

  // Delete custom subtopic
  const handleDeleteCustomTopic = (topicId: string) => {
    setCustomTopics((prev) => {
      const subjectList = prev[activeSubject.id] || [];
      const updated = {
        ...prev,
        [activeSubject.id]: subjectList.filter((t) => t.id !== topicId),
      };
      try {
        localStorage.setItem(`ssczone_custom_topics_${selectedExamSlug}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Calculate overall syllabus stats
  const overallStats = useMemo(() => {
    let totalChapters = 0;
    let completedPoints = 0; // Each chapter has 3 points (Theory=1, Practice=1, Rev>=1 = 1)
    let masteredChapters = 0;

    activeExam.subjects.forEach((subj) => {
      const customSubj = customTopics[subj.id] || [];
      const totalInSubj = subj.chapters.length + customSubj.length;
      totalChapters += totalInSubj;

      subj.chapters.forEach((ch) => {
        const p = progressMap[ch.id];
        if (p) {
          let chPoints = 0;
          if (p.theory_done) chPoints += 1;
          if (p.practice_done) chPoints += 1;
          if (p.revision_count > 0) chPoints += 1;
          completedPoints += chPoints;
          if (chPoints === 3 || p.confidence === "high") {
            masteredChapters += 1;
          }
        }
      });

      customSubj.forEach((c) => {
        const p = progressMap[c.id];
        if (p) {
          let chPoints = 0;
          if (p.theory_done) chPoints += 1;
          if (p.practice_done) chPoints += 1;
          if (p.revision_count > 0) chPoints += 1;
          completedPoints += chPoints;
          if (chPoints === 3) masteredChapters += 1;
        }
      });
    });

    const maxPoints = Math.max(1, totalChapters * 3);
    const overallPercentage = Math.round((completedPoints / maxPoints) * 100);

    return {
      totalChapters,
      overallPercentage,
      masteredChapters,
      completedPoints,
    };
  }, [activeExam, progressMap, customTopics]);

  // Calculate per-subject stats
  const subjectStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percentage: number }> = {};
    activeExam.subjects.forEach((subj) => {
      const customSubj = customTopics[subj.id] || [];
      const total = subj.chapters.length + customSubj.length;
      let points = 0;
      subj.chapters.forEach((ch) => {
        const p = progressMap[ch.id];
        if (p) {
          if (p.theory_done) points += 1;
          if (p.practice_done) points += 1;
          if (p.revision_count > 0) points += 1;
        }
      });
      customSubj.forEach((c) => {
        const p = progressMap[c.id];
        if (p) {
          if (p.theory_done) points += 1;
          if (p.practice_done) points += 1;
          if (p.revision_count > 0) points += 1;
        }
      });
      const maxPts = Math.max(1, total * 3);
      const pct = Math.round((points / maxPts) * 100);
      stats[subj.id] = { total, completed: points, percentage: pct };
    });
    return stats;
  }, [activeExam, progressMap, customTopics]);

  // Filtered chapters for current active subject
  const displayedCategories = useMemo(() => {
    const customForThis = customTopics[activeSubject.id] || [];
    
    // Combine standard chapters + custom chapters
    const combined: Array<ChapterItem & { isCustom?: boolean }> = [
      ...activeSubject.chapters,
      ...customForThis.map((c) => ({
        id: c.id,
        name: c.name,
        hindi_name: "कस्टम टॉपिक",
        category: c.category,
        practice_query: c.name,
        isCustom: true,
      })),
    ];

    // Apply search query filter
    const searchFiltered = combined.filter((ch) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ch.name.toLowerCase().includes(q) ||
        (ch.hindi_name && ch.hindi_name.toLowerCase().includes(q)) ||
        ch.category.toLowerCase().includes(q)
      );
    });

    // Apply quick pill filter
    const statusFiltered = searchFiltered.filter((ch) => {
      const p = progressMap[ch.id];
      if (filterType === "all") return true;
      if (filterType === "high_weightage") return Boolean(ch.high_weightage);
      if (filterType === "pending") {
        return !(p?.theory_done && p?.practice_done && (p?.revision_count || 0) > 0);
      }
      if (filterType === "mastered") {
        return p?.confidence === "high" || (p?.theory_done && p?.practice_done && (p?.revision_count || 0) >= 1);
      }
      return true;
    });

    // Group by category
    const grouped: Record<string, Array<ChapterItem & { isCustom?: boolean }>> = {};
    statusFiltered.forEach((ch) => {
      const cat = ch.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ch);
    });

    return grouped;
  }, [activeSubject, customTopics, searchQuery, filterType, progressMap]);

  // Handle Share / Copy Link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Handle Print Checklist
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const theme = getSubjectTheme(activeSubject.color);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── TOP ANNOUNCEMENT & TITLE HERO ── */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white border-b border-slate-800 pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OneNote-Style Interactive Syllabus Tracker & Notebook</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>SSC Master Syllabus Checklist</span>
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  2026 Updated
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Notification-mapped chapter breakdown with 3-Pillar tracking:{" "}
                <strong className="text-white">📖 Theory</strong>,{" "}
                <strong className="text-white">⚡ 50+ PYQ Practice</strong>, and{" "}
                <strong className="text-white">🔄 3x Revision Counter</strong>. Offline-ready with personal formula scratchpads.
              </p>
            </div>

            {/* Quick Actions & Cloud Sync Status */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all shadow-sm"
                title="Print clean A4 checklist for your study wall"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Print A4 Sheet</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-300" />}
                <span>{copiedLink ? "Link Copied!" : "Share Tracker"}</span>
              </button>

              {/* Sync Pill */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  syncStatus === "synced"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                    : syncStatus === "saving"
                    ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                    : syncStatus === "guest"
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-red-950/60 text-red-300 border-red-800/50"
                }`}
                title={
                  isAuthenticated
                    ? "Cloud Sync Active (Your ticks & personal formulas are backed up to your profile)"
                    : "Stored safely in this browser. Log in anytime to backup across devices."
                }
              >
                {syncStatus === "synced" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cloud Synced</span>
                  </>
                )}
                {syncStatus === "saving" && (
                  <>
                    <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {syncStatus === "guest" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Browser Saved (Guest)</span>
                  </>
                )}
                {syncStatus === "offline" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── EXAM PICKER & OVERALL PROGRESS BAR ── */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Exam selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400 mr-1">Target Exam:</span>
              {ALL_EXAM_SYLLABUSES.map((exam) => {
                const isActive = exam.exam_slug === selectedExamSlug;
                return (
                  <button
                    key={exam.exam_slug}
                    onClick={() => {
                      setSelectedExamSlug(exam.exam_slug);
                      // Reset to quant if available or first subject
                      const hasQuant = exam.subjects.some((s) => s.id === "quant");
                      setSelectedSubjectId(hasQuant ? "quant" : exam.subjects[0].id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-white text-slate-900 border-white shadow-sm"
                        : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{exam.short_code}</span>
                    <span className="ml-1.5 opacity-70 text-[10px] font-normal">{exam.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Overall Progress Meter */}
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-3.5 flex items-center gap-4 min-w-[280px]">
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Overall Syllabus Progress</span>
                  <span className="text-white font-mono text-sm">{overallStats.overallPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, overallStats.overallPercentage))}%` }}
                  />
                </div>
              </div>
              <div className="text-right pl-3 border-l border-slate-700 shrink-0">
                <div className="text-base font-extrabold text-white font-mono leading-none">
                  {overallStats.masteredChapters}
                  <span className="text-xs text-slate-400 font-normal"> / {overallStats.totalChapters}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Mastered</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── MAIN BINDER WORKSPACE (2-COLUMN ONENOTE LAYOUT) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Binder Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[780px]">
            
            {/* ── LEFT COLUMN: SUBJECT NOTEBOOK TABS (4 COLS) ── */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject Notebooks
                    </h2>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    {activeExam.subjects.length} Subjects
                  </span>
                </div>

                {/* Subject Tab Cards */}
                <div className="space-y-2.5">
                  {activeExam.subjects.map((subj) => {
                    const isSelected = subj.id === activeSubject.id;
                    const subjTheme = getSubjectTheme(subj.color);
                    const stats = subjectStats[subj.id] || { total: subj.chapters.length, completed: 0, percentage: 0 };

                    return (
                      <button
                        key={subj.id}
                        onClick={() => setSelectedSubjectId(subj.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group relative ${
                          isSelected
                            ? "bg-white border-slate-300 shadow-md ring-2 ring-blue-500/10"
                            : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        {/* Colored Left Tab Notch (OneNote Vibe) */}
                        <div
                          className={`w-1.5 absolute left-0 top-2 bottom-2 rounded-r transition-all ${
                            isSelected ? subjTheme.progress : "bg-transparent group-hover:bg-slate-300"
                          }`}
                        />

                        {/* Subject Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? `${subjTheme.badge} shadow-sm`
                              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                          }`}
                        >
                          {getSubjectIcon(subj.icon, "w-5 h-5")}
                        </div>

                        {/* Subject Info */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-bold truncate ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                              {subj.name}
                            </h3>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {stats.percentage}%
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {subj.hindi_name}
                          </p>

                          {/* Mini Progress Bar */}
                          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${subjTheme.progress} transition-all duration-300 rounded-full`}
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>

                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{stats.total} Chapters</span>
                            <span>{subj.chapters.filter((c) => c.high_weightage).length} High-Yield 🔥</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Study Tip Box in Sidebar */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-slate-700">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>3-Pillar Mastery Rule</span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Target <strong>Theory + 50 PYQs + 2 Revisions</strong> for each chapter before moving on. High weightage chapters (🔥) repeat 65%+ in SSC exams!
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200/50 flex items-center justify-between text-[11px]">
                  <Link
                    href={`/speed-test`}
                    className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <span>Launch Speed Test</span>
                    <Zap className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/notes`}
                    className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Subject Notes</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </aside>

            {/* ── RIGHT COLUMN: INTERACTIVE CHECKLIST CANVAS (8 COLS) ── */}
            <section className="lg:col-span-8 p-4 sm:p-7 flex flex-col justify-between">
              
              <div>
                {/* Active Subject Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                        {activeSubject.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {activeSubject.hindi_name}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {activeSubject.description}
                    </p>
                  </div>

                  {/* Add Custom Subtopic Button */}
                  <button
                    onClick={() => setShowAddCustomModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-all self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                    <span>Add Custom Chapter</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeSubject.name} chapters or topics...`}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        filterType === "all"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      All Chapters
                    </button>
                    <button
                      onClick={() => setFilterType("high_weightage")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                        filterType === "high_weightage"
                          ? "bg-amber-600 text-white"
                          : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>High Weightage 🔥</span>
                    </button>
                    <button
                      onClick={() => setFilterType("pending")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        filterType === "pending"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      Pending Only
                    </button>
                    <button
                      onClick={() => setFilterType("mastered")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                        filterType === "mastered"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Star className="w-3 h-3 text-emerald-600" />
                      <span>Mastered ⭐</span>
                    </button>
                  </div>

                </div>

                {/* ── CHAPTER GROUPS / SECTIONS ── */}
                <div className="mt-6 space-y-6">
                  {Object.keys(displayedCategories).length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                      <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No chapters found</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or active filter.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterType("all");
                        }}
                        className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    Object.entries(displayedCategories).map(([categoryName, chapters]) => {
                      return (
                        <div key={categoryName} className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                          
                          {/* Category Header */}
                          <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-700" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                {categoryName}
                              </h4>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
                            </span>
                          </div>

                          {/* Chapter Rows */}
                          <div className="divide-y divide-slate-100">
                            {chapters.map((chapter) => {
                              const p = progressMap[chapter.id] || {
                                chapter_id: chapter.id,
                                theory_done: false,
                                practice_done: false,
                                revision_count: 0,
                                confidence: "unrated",
                                notes: "",
                                updated_at: "",
                              };

                              const isAllDone = p.theory_done && p.practice_done && p.revision_count > 0;
                              const isNotesOpen = openNotes[chapter.id] || false;
                              const hasPersonalNotes = Boolean(p.notes && p.notes.trim().length > 0);

                              return (
                                <div
                                  key={chapter.id}
                                  className={`p-3.5 sm:p-4 transition-colors ${
                                    isAllDone ? "bg-emerald-50/20" : "hover:bg-slate-50/60"
                                  }`}
                                >
                                  {/* Top Row: Chapter Title, Badges, Weightage */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    
                                    <div className="flex items-start gap-2.5">
                                      {/* Chapter Mastery State Indicator */}
                                      <button
                                        onClick={() => handleCycleConfidence(chapter.id)}
                                        title={`Confidence: ${p.confidence}. Click to cycle (Low / Medium / High)`}
                                        className="mt-0.5 shrink-0"
                                      >
                                        {p.confidence === "high" ? (
                                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                        ) : p.confidence === "medium" ? (
                                          <Star className="w-4 h-4 text-blue-500" />
                                        ) : p.confidence === "low" ? (
                                          <Star className="w-4 h-4 text-slate-300" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                        )}
                                      </button>

                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className={`text-sm font-bold ${isAllDone ? "text-slate-900 line-through decoration-emerald-500/50" : "text-slate-900"}`}>
                                            {chapter.name}
                                          </h5>
                                          
                                          {chapter.hindi_name && (
                                            <span className="text-xs text-slate-500 font-normal">
                                              ({chapter.hindi_name})
                                            </span>
                                          )}

                                          {chapter.high_weightage && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                              <Flame className="w-3 h-3 text-red-500" />
                                              <span>High Weightage 🔥</span>
                                            </span>
                                          )}

                                          {chapter.isCustom && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                              Custom
                                            </span>
                                          )}
                                        </div>

                                        {chapter.expected_questions && (
                                          <p className="text-[11px] text-slate-500 mt-0.5">
                                            Expected in Exam: <span className="font-semibold text-slate-700">{chapter.expected_questions}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Links: Speed Test Drill & Notes Reader */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      {chapter.notes_slug && (
                                        <Link
                                          href={`/blog/notes/${chapter.notes_slug}`}
                                          target="_blank"
                                          className="text-[11px] font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                                          title="Open chapter notes & formula sheet"
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                          <span className="hidden sm:inline">Notes</span>
                                        </Link>
                                      )}

                                      {chapter.practice_query && (
                                        <Link
                                          href={`/speed-test?mode=topic&topicTitle=${encodeURIComponent(chapter.practice_query)}`}
                                          target="_blank"
                                          className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200/60"
                                          title="Launch direct PYQ Speed Test drill on this topic"
                                        >
                                          <Zap className="w-3.5 h-3.5 text-blue-600" />
                                          <span>Practice Drill</span>
                                        </Link>
                                      )}

                                      {/* OneNote Scratchpad Toggle */}
                                      <button
                                        onClick={() => setOpenNotes((prev) => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                                        className={`text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded transition-all ${
                                          hasPersonalNotes
                                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                                            : isNotesOpen
                                            ? "bg-slate-200 text-slate-800"
                                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                                        }`}
                                        title="Open personal formula scratchpad"
                                      >
                                        <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                                        <span className="hidden sm:inline">{hasPersonalNotes ? "Notes" : "+ Note"}</span>
                                        {isNotesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>

                                      {chapter.isCustom && (
                                        <button
                                          onClick={() => handleDeleteCustomTopic(chapter.id)}
                                          className="text-slate-400 hover:text-red-500 p-1"
                                          title="Delete custom topic"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                  </div>

                                  {/* Bottom Row: The 3 Action Pillars (Theory, Practice, Revision) */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                    
                                    {/* Pillar 1: Theory Done */}
                                    <button
                                      onClick={() => handleToggleTheory(chapter.id)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                                        p.theory_done
                                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                      }`}
                                    >
                                      {p.theory_done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-slate-400" />}
                                      <span>📖 Theory Done</span>
                                    </button>

                                    {/* Pillar 2: 50+ PYQ Practice Done */}
                                    <button
                                      onClick={() => handleTogglePractice(chapter.id)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                                        p.practice_done
                                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                      }`}
                                    >
                                      {p.practice_done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-slate-400" />}
                                      <span>⚡ 50+ PYQs Done</span>
                                    </button>

                                    {/* Pillar 3: Revision Stepper Badge */}
                                    <button
                                      onClick={() => handleStepRevision(chapter.id)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                                        p.revision_count >= 3
                                          ? "bg-purple-600 text-white border-purple-600"
                                          : p.revision_count === 2
                                          ? "bg-purple-100 text-purple-900 border-purple-300"
                                          : p.revision_count === 1
                                          ? "bg-blue-100 text-blue-900 border-blue-300"
                                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                      }`}
                                      title="Click to advance revision counter (0x -> 1x -> 2x -> 3x)"
                                    >
                                      <RotateCw className={`w-3.5 h-3.5 ${p.revision_count > 0 ? "text-current" : "text-slate-400"}`} />
                                      <span>
                                        {p.revision_count === 0 ? "🔄 Revise: 0x" : `🔄 Revised: ${p.revision_count}x`}
                                      </span>
                                    </button>

                                    {/* Confidence Status Pill */}
                                    <button
                                      onClick={() => handleCycleConfidence(chapter.id)}
                                      className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
                                        p.confidence === "high"
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                          : p.confidence === "medium"
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : p.confidence === "low"
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-slate-100 text-slate-500 border-slate-200"
                                      }`}
                                    >
                                      {p.confidence === "high" && "⭐⭐⭐ Mastered"}
                                      {p.confidence === "medium" && "⭐⭐ Moderate"}
                                      {p.confidence === "low" && "⭐ Needs Practice"}
                                      {p.confidence === "unrated" && "Unrated Confidence"}
                                    </button>

                                  </div>

                                  {/* ── EXPANDABLE ONENOTE SCRATCHPAD DRAWER ── */}
                                  {isNotesOpen && (
                                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 animate-in fade-in duration-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                          <span>Personal OneNote Scratchpad & Mistake Log</span>
                                        </div>
                                        <span className="text-[10px] text-amber-700 font-medium">
                                          Auto-saves instantly
                                        </span>
                                      </div>

                                      <textarea
                                        value={p.notes || ""}
                                        onChange={(e) => updateProgress(chapter.id, { notes: e.target.value })}
                                        placeholder="Jot down personal shortcut formulas, tricky TCS question traps, recurring mistakes, or page numbers..."
                                        rows={3}
                                        className="w-full text-xs font-mono p-2.5 rounded-lg bg-white border border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 placeholder:text-slate-400 resize-y"
                                      />

                                      {chapter.default_tips && (
                                        <div className="mt-2 text-[11px] text-amber-800/80 bg-amber-100/50 p-2 rounded border border-amber-200/50">
                                          💡 <strong>Expert Tip:</strong> {chapter.default_tips}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Subject Summary Bar */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Active Syllabus: <strong className="text-slate-800">{activeExam.title}</strong> • Subject:{" "}
                  <strong className="text-slate-800">{activeSubject.name}</strong>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      // Mark all theory in current subject as done
                      activeSubject.chapters.forEach((c) => {
                        updateProgress(c.id, { theory_done: true });
                      });
                    }}
                    className="text-slate-600 hover:text-blue-600 font-medium underline"
                  >
                    Mark All Theory Done
                  </button>
                  <button
                    onClick={() => {
                      // Reset current subject progress
                      if (confirm(`Reset progress for ${activeSubject.name}?`)) {
                        activeSubject.chapters.forEach((c) => {
                          updateProgress(c.id, {
                            theory_done: false,
                            practice_done: false,
                            revision_count: 0,
                            confidence: "unrated",
                          });
                        });
                      }
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    Reset Subject
                  </button>
                </div>
              </div>

            </section>

          </div>

        </div>

      </main>

      {/* ── ADD CUSTOM TOPIC MODAL ── */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Custom Topic to {activeSubject.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add any specific subtopic or coaching class focus area to your interactive checklist.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter / Topic Name *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Successive Discount Advanced Variations"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Section
                </label>
                <input
                  type="text"
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value)}
                  placeholder="e.g. Arithmetic, Special Focus, or Coaching Notes"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomTopic}
                disabled={!newTopicName.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT-ONLY STYLESHEET (CLEAN 2-COLUMN A4 CHECKLIST) ── */}
      <style jsx global>{`
        @media print {
          nav, header, footer, aside, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
          }
          .lg\\:col-span-8 {
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
