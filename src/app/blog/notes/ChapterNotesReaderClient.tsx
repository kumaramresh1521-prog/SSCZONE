"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronLeft,
  Share2,
  Copy,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Tag,
  Zap,
  Menu,
  X,
  Atom,
  FlaskConical,
  Dna,
  Scale,
  Landmark,
  Globe2,
  TrendingUp,
  Calculator,
  Brain,
  BookA,
  Laptop,
  Flame,
  Layers,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  SlidersHorizontal,
  Languages,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ChapterNote, SubjectMeta } from "@/lib/chapter-notes-types";

// Map subject icons safely
const ICON_MAP: Record<string, React.ElementType> = {
  Atom,
  FlaskConical,
  Dna,
  Scale,
  Landmark,
  Globe2,
  TrendingUp,
  Calculator,
  Brain,
  BookA,
  Sparkles,
  Laptop,
  Flame,
};

// Subject badge colors (High contrast light mode)
const COLOR_STYLES: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/30", ring: "ring-blue-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/30", ring: "ring-emerald-500" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-700", border: "border-teal-500/30", ring: "ring-teal-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-500/30", ring: "ring-indigo-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-800", border: "border-amber-500/30", ring: "ring-amber-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-700", border: "border-cyan-500/30", ring: "ring-cyan-500" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-500/30", ring: "ring-rose-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/30", ring: "ring-purple-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-700", border: "border-violet-500/30", ring: "ring-violet-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-700", border: "border-orange-500/30", ring: "ring-orange-500" },
  yellow: { bg: "bg-amber-500/10", text: "text-amber-800", border: "border-amber-500/30", ring: "ring-amber-500" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-700", border: "border-sky-500/30", ring: "ring-sky-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-700", border: "border-pink-500/30", ring: "ring-pink-500" },
};

interface Props {
  initialNotes: ChapterNote[];
  subjects: SubjectMeta[];
  defaultSlug?: string;
}

export default function ChapterNotesReaderClient({
  initialNotes = [],
  subjects = [],
  defaultSlug,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active filters & selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (defaultSlug) {
      const match = initialNotes.find((n) => n.slug === defaultSlug);
      if (match?.subject_id) return match.subject_id;
    }
    return searchParams.get("subject") || "physics";
  });
  const [activeTab, setActiveTab] = useState<"chapters" | "guides">("chapters");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [copied, setCopied] = useState<boolean>(false);
  const [langMode, setLangMode] = useState<"bilingual" | "english" | "hindi">("bilingual");

  // Restore user reading language preference from localStorage (CBT PYQ standard)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_reader_lang") as "bilingual" | "english" | "hindi" | null;
      if (saved && ["bilingual", "english", "hindi"].includes(saved)) {
        setLangMode(saved);
      }
    } catch {}
  }, []);

  const handleLanguageChange = (mode: "bilingual" | "english" | "hindi") => {
    setLangMode(mode);
    try {
      localStorage.setItem("ssczone_reader_lang", mode);
    } catch {}
    toast.success(
      mode === "english"
        ? "Medium: English"
        : mode === "hindi"
        ? "माध्यम: हिन्दी"
        : "Medium: Bilingual (English + हिन्दी)",
      { id: "reader-lang-toast", duration: 1500 }
    );
  };

  // Active note slug
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (defaultSlug) return defaultSlug;
    const urlSlug = searchParams.get("chapter");
    if (urlSlug) return urlSlug;
    // Default to first active note in selected subject
    const firstInSubj = initialNotes.find((n) => n.subject_id === selectedSubjectId && n.is_active);
    return firstInSubj ? firstInSubj.slug : (initialNotes[0]?.slug || "");
  });

  // Current Subject Object
  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
      id: "physics",
      name: "Physics",
      hindi_name: "भौतिक विज्ञान",
      category: "Science",
      color: "blue",
      icon: "Atom",
      description: "Science study notes",
    };
  }, [subjects, selectedSubjectId]);

  // Notes filtered by current subject & tab
  const subjectNotes = useMemo(() => {
    return initialNotes
      .filter((n) => {
        if (!n.is_active && n.slug !== activeSlug) return false;
        if (activeTab === "guides") {
          return n.type === "educational_guide";
        }
        return n.subject_id === selectedSubjectId && n.type === "chapter_note";
      })
      .sort((a, b) => {
        if ((a.sort_order || 99) !== (b.sort_order || 99)) {
          return (a.sort_order || 99) - (b.sort_order || 99);
        }
        return (a.chapter_number || 0) - (b.chapter_number || 0);
      });
  }, [initialNotes, selectedSubjectId, activeTab]);

  // Filtered chapter list according to search in sidebar
  const visibleSidebarNotes = useMemo(() => {
    if (!searchFilter.trim()) return subjectNotes;
    const q = searchFilter.toLowerCase().trim();
    return subjectNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.hindi_title?.toLowerCase().includes(q) ||
        n.chapter_title?.toLowerCase().includes(q)
    );
  }, [subjectNotes, searchFilter]);

  // Active Note Data
  const currentNote = useMemo(() => {
    const found = initialNotes.find((n) => n.slug === activeSlug);
    if (found) return found;
    return subjectNotes[0] || initialNotes[0] || null;
  }, [initialNotes, activeSlug, subjectNotes]);

  // Active Note Body Content (English, Hindi, or Bilingual)
  const currentBodyContent = useMemo(() => {
    if (!currentNote) return "";
    if (langMode === "english" && currentNote.english_content) {
      return currentNote.english_content;
    }
    if (langMode === "hindi" && currentNote.hindi_content) {
      return currentNote.hindi_content;
    }
    return currentNote.content;
  }, [currentNote, langMode]);

  // Next & Previous chapters
  const currentIndex = useMemo(() => {
    if (!currentNote) return -1;
    return subjectNotes.findIndex((n) => n.id === currentNote.id);
  }, [subjectNotes, currentNote]);

  const prevChapter = currentIndex > 0 ? subjectNotes[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < subjectNotes.length - 1 ? subjectNotes[currentIndex + 1] : null;

  // Interactive MCQ Option Click Delegation (Instant Answer Feedback)
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(".quiz-option");
    if (!target) return;

    const quizCard = target.closest<HTMLElement>(".quiz-card");
    if (!quizCard) return;

    const allOptions = quizCard.querySelectorAll<HTMLElement>(".quiz-option");

    // Determine correctness via data-is-correct
    const isCorrect = target.getAttribute("data-is-correct") === "true";

    // Reset previous option classes on this card
    allOptions.forEach((opt) => {
      opt.classList.remove("selected-correct", "selected-wrong", "highlight-correct");
    });

    if (isCorrect) {
      target.classList.add("selected-correct");
    } else {
      target.classList.add("selected-wrong");
      allOptions.forEach((opt) => {
        if (opt.getAttribute("data-is-correct") === "true") {
          opt.classList.add("highlight-correct");
        }
      });
    }

    quizCard.classList.add("answered");
  };

  // Handle switching subject
  const handleSelectSubject = (subjId: string) => {
    setSelectedSubjectId(subjId);
    setSearchFilter("");
    setActiveTab("chapters");

    // Pick first chapter of this new subject
    const firstOfNew = initialNotes.find((n) => n.subject_id === subjId && n.is_active && n.type === "chapter_note");
    if (firstOfNew) {
      setActiveSlug(firstOfNew.slug);
      window.history.pushState({}, "", `/blog/notes?subject=${subjId}&chapter=${firstOfNew.slug}`);
    } else {
      window.history.pushState({}, "", `/blog/notes?subject=${subjId}`);
    }
  };

  // Handle selecting a chapter
  const handleSelectChapter = (slug: string) => {
    setActiveSlug(slug);
    setMobileDrawerOpen(false);
    window.history.pushState({}, "", `/blog/notes?subject=${selectedSubjectId}&chapter=${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Copy link
  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share
  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share && currentNote) {
      navigator
        .share({
          title: currentNote.title,
          text: `Check out these high-yield SSC study notes: ${currentNote.title} on SSCZone`,
          url: window.location.href,
        })
        .catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  // Print view
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // Font size class mapping
  const fontSizeClass = {
    normal: "text-sm sm:text-base leading-relaxed",
    large: "text-base sm:text-lg leading-relaxed",
    xlarge: "text-lg sm:text-xl leading-loose",
  }[fontSize];

  const SubjIcon = ICON_MAP[currentSubject.icon] || BookOpen;
  const colorStyle = COLOR_STYLES[currentSubject.color] || COLOR_STYLES.blue;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── Top Header / Breadcrumb Bar (Sticky below UserNav) ── */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[57px] sm:top-[61px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Breadcrumbs & Mobile Trigger */}
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Open Chapters Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 truncate">
              <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href="/blog" className="hover:text-blue-600 transition-colors shrink-0">Blog</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-bold truncate">
                {currentSubject.name} Notes
              </span>
            </div>
          </div>

          {/* Right: Quick Reader Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
            {/* PYQ CBT Language Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Language:</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs shrink-0">
                <button
                  onClick={() => handleLanguageChange("english")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer whitespace-nowrap ${
                    langMode === "english"
                      ? "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Official English medium"
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hindi")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer whitespace-nowrap ${
                    langMode === "hindi"
                      ? "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="हिन्दी माध्यम"
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => handleLanguageChange("bilingual")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer whitespace-nowrap ${
                    langMode === "bilingual"
                      ? "bg-blue-700 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Bilingual mode (English + हिन्दी)"
                >
                  Bilingual
                </button>
              </div>
            </div>

            {/* Font size picker */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold text-slate-600">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2 py-1 rounded-lg transition-all ${fontSize === "normal" ? "bg-white text-blue-600 shadow-2xs" : "hover:text-slate-900"}`}
                title="Normal text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2 py-1 rounded-lg transition-all ${fontSize === "large" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "hover:text-slate-900"}`}
                title="Larger text"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={`px-2 py-1 rounded-lg transition-all ${fontSize === "xlarge" ? "bg-white text-blue-600 shadow-2xs font-black text-sm" : "hover:text-slate-900"}`}
                title="Extra large text"
              >
                A++
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
              title="Copy direct article link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy Link"}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
              title="Print / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* Practice PYQ CTA */}
            <Link
              href="/speed-test"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Practice PYQ</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ── Main Two-Column Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-8 items-start">
        
        {/* ════════════════════════════════════════════════════════════
            LEFT SIDEBAR: Subject Switcher + Chapter Hierarchy List
           ════════════════════════════════════════════════════════════ */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-20 bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
          
          {/* Subject Dropdown & Info Header */}
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Selected Subject
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
                {subjectNotes.length} Chapters
              </span>
            </div>

            {/* Subject Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSelectSubject(e.target.value)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer pr-9"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-900 font-semibold py-1">
                    {s.name} ({s.hindi_name})
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            {/* Mode Switch Tabs: Chapter Notes vs Quick Guides */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => {
                  setActiveTab("chapters");
                  const firstCh = initialNotes.find((n) => n.subject_id === selectedSubjectId && n.type === "chapter_note" && n.is_active);
                  if (firstCh) setActiveSlug(firstCh.slug);
                }}
                className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "chapters"
                    ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chapters</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("guides");
                  const firstGuide = initialNotes.find((n) => n.type === "educational_guide" && n.is_active);
                  if (firstGuide) setActiveSlug(firstGuide.slug);
                }}
                className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "guides"
                    ? "bg-white text-rose-700 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Revision Tricks</span>
              </button>
            </div>

            {/* Real-time search inside chapter list */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === "chapters" ? "Search chapter title..." : "Search quick guides..."}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Chapters List */}
          <div className="mt-3 space-y-1.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1 text-left custom-scrollbar">
            {visibleSidebarNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No chapters found</p>
                <p className="text-[11px] mt-1">Try another search term or switch subjects above.</p>
              </div>
            ) : (
              visibleSidebarNotes.map((note, idx) => {
                const isActive = note.slug === currentNote?.slug;
                const chNum = note.chapter_number || idx + 1;

                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelectChapter(note.slug)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 text-blue-900 shadow-2xs font-bold"
                        : "hover:bg-slate-50 border border-transparent text-slate-700"
                    }`}
                  >
                    {/* Chapter index badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {String(chNum).padStart(2, "0")}
                    </div>

                    {/* Chapter details */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? "text-blue-900 font-extrabold" : "text-slate-800"}`}>
                        {note.title}
                      </p>

                      {note.hindi_title && (
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                          {note.hindi_title}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{note.read_time || "6 min"}</span>
                        </span>
                        {isActive && (
                          <span className="text-blue-600 font-bold flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Reading Now
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Subject Switcher Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Browse Other Subjects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSubject(s.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    s.id === selectedSubjectId
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════════
            RIGHT CONTENT AREA: Modern Chapter Reader Presentation
           ════════════════════════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs text-left">
          
          {currentNote ? (
            <article className="space-y-8 max-w-4xl">
              
              {/* Header Meta: Subject Badge, Chapter Index, Read Time */}
              <header className="space-y-4 border-b border-slate-100 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
                    <SubjIcon className="w-3.5 h-3.5" />
                    <span>{currentSubject.name}</span>
                  </span>

                  {currentNote.chapter_number && (
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                      Chapter {currentNote.chapter_number}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold ml-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentNote.read_time || "6 min read"}</span>
                  </span>
                </div>

                {/* Primary Title (H1) */}
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {langMode === "hindi" && currentNote.hindi_title ? currentNote.hindi_title : currentNote.title}
                </h1>

                {/* Subtitle based on language mode */}
                {langMode === "hindi" ? (
                  <p className="text-sm sm:text-base font-bold text-slate-500 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-black uppercase border border-blue-200">
                      English
                    </span>
                    <span>{currentNote.title}</span>
                  </p>
                ) : currentNote.hindi_title && langMode !== "english" ? (
                  <p className="text-base sm:text-lg font-bold text-slate-500 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-black uppercase">
                      हिन्दी
                    </span>
                    <span>{currentNote.hindi_title}</span>
                  </p>
                ) : null}

                {/* Editorial Metadata info row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-2">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Verified by SSCZone Subject Matter Experts</span>
                  </span>
                  <span>•</span>
                  <span>Comprehensive Study Notes & Practice MCQs</span>
                </div>
              </header>

              {/* Cover Image (if available) */}
              {currentNote.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img
                    src={currentNote.image_url}
                    alt={currentNote.title}
                    className="w-full h-auto object-cover max-h-[420px]"
                  />
                </div>
              )}

              {/* ── Main Rich Content Body ── */}
              <div
                className={`chapter-notes-content lang-mode-${langMode} max-w-none ${fontSizeClass}`}
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: currentBodyContent }}
              />

              {/* ── Chapter Sequential Navigation Cards ── */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevChapter ? (
                  <button
                    onClick={() => handleSelectChapter(prevChapter.slug)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/50 transition-all text-left group shadow-2xs"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-blue-700 mb-1">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      <span>Previous Chapter</span>
                    </span>
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-900 line-clamp-1">
                      {prevChapter.chapter_number ? `Ch ${prevChapter.chapter_number}: ` : ""}{prevChapter.title}
                    </p>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 text-slate-400 text-xs font-medium">
                    <span>This is the first chapter of {currentSubject.name}.</span>
                  </div>
                )}

                {nextChapter ? (
                  <button
                    onClick={() => handleSelectChapter(nextChapter.slug)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/50 transition-all text-right group shadow-2xs sm:col-start-2"
                  >
                    <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-500 group-hover:text-blue-700 mb-1">
                      <span>Next Chapter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-900 line-clamp-1">
                      {nextChapter.chapter_number ? `Ch ${nextChapter.chapter_number}: ` : ""}{nextChapter.title}
                    </p>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 text-slate-400 text-xs font-medium text-right sm:col-start-2">
                    <span>You have reached the end of this module! 🎉</span>
                  </div>
                )}
              </div>

              {/* ── High-Converting Practice PYQs CTA Card ── */}
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800 p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Practice Chapter Questions</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Master this Chapter in Speed Test Mode
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Test your understanding with authentic TCS previous year shift questions on <strong>{currentNote.title}</strong> with instant percentile scorecards and bilingual solutions.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <Link
                    href={`/speed-test?mode=topic&topicTitle=${encodeURIComponent(currentNote.title)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Start Practice Test →</span>
                  </Link>
                </div>
              </div>

            </article>
          ) : (
            <div className="py-20 text-center space-y-4">
              <BookOpen className="w-16 h-16 mx-auto text-slate-300" />
              <h2 className="text-xl font-bold text-slate-700">No chapter notes available yet</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Admin is uploading notes for {currentSubject.name}. Please select another subject from the left panel.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MOBILE CHAPTER DRAWER / BOTTOM SHEET
         ════════════════════════════════════════════════════════════ */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 max-h-[85vh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SubjIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {currentSubject.name} Chapters ({subjectNotes.length})
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subject Selector for mobile */}
            <div className="mt-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSelectSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.hindi_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector for mobile (PYQ CBT Standard) */}
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Language (माध्यम):</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
                <button
                  onClick={() => handleLanguageChange("english")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    langMode === "english" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hindi")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    langMode === "hindi" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => handleLanguageChange("bilingual")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    langMode === "bilingual" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Bilingual
                </button>
              </div>
            </div>

            {/* Chapter items */}
            <div className="mt-3 overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
              {subjectNotes.map((note, idx) => {
                const isActive = note.slug === currentNote?.slug;
                const chNum = note.chapter_number || idx + 1;

                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelectChapter(note.slug)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                      isActive
                        ? "bg-blue-50 border border-blue-200 text-blue-900 font-bold"
                        : "hover:bg-slate-50 border border-slate-100 text-slate-800"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {String(chNum).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{note.title}</p>
                      {note.hindi_title && (
                        <p className="text-[11px] text-slate-500 truncate">{note.hindi_title}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for Rich Reader Typography, Tables, Formula & Callout Cards */}
      <style jsx global>{`
        .chapter-notes-content h2 {
          font-size: 1.5rem;
          font-weight: 850;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .chapter-notes-content h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .chapter-notes-content p {
          color: #334155;
          margin-bottom: 1rem;
        }
        .chapter-notes-content ul,
        .chapter-notes-content ol {
          margin-left: 1.25rem;
          margin-bottom: 1.25rem;
          color: #334155;
        }
        .chapter-notes-content li {
          margin-bottom: 0.35rem;
        }
        .chapter-notes-content .sub {
          font-size: 0.925rem;
          color: #64748b;
          margin-bottom: 1rem;
        }
        .chapter-notes-content .note {
          background: #fffbeb;
          border-left: 4px solid #d97706;
          padding: 0.85rem 1.15rem;
          border-radius: 0.5rem;
          margin: 1.25rem 0;
          color: #92400e;
          font-size: 0.925rem;
          line-height: 1.65;
        }
        .chapter-notes-content .note b,
        .chapter-notes-content .note strong {
          color: #78350f;
        }
        .chapter-notes-content .tbl {
          overflow-x: auto;
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .chapter-notes-content .tbl table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #ffffff;
        }
        .chapter-notes-content .tbl th {
          background: #0f766e;
          color: #ffffff;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 700;
          border: 1px solid #0d9488;
          font-size: 0.9rem;
        }
        .chapter-notes-content .tbl td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          text-align: left;
          vertical-align: top;
          color: #334155;
          font-size: 0.88rem;
          line-height: 1.6;
        }
        .chapter-notes-content .tbl tr:nth-child(even) {
          background: #f8fafc;
        }
        .chapter-notes-content figure {
          margin: 1.5rem 0;
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .chapter-notes-content figcaption {
          text-align: center;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 0.75rem;
        }
        .chapter-notes-content .dg {
          width: 100%;
          max-width: 600px;
          height: auto;
          color: #1e293b;
        }
        .chapter-notes-content .dg text {
          fill: currentColor;
          font-size: 13px;
          font-family: inherit;
        }
        .chapter-notes-content .dg .l {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
        }
        .chapter-notes-content .dg .a {
          stroke: #0f766e;
          fill: none;
          stroke-width: 3;
        }
        .chapter-notes-content .dg .b {
          stroke: #d97706;
          fill: none;
          stroke-width: 3;
        }
        .chapter-notes-content .dg .f {
          fill: #0f766e;
        }
        .chapter-notes-content .dg .s {
          fill: #f0fdfa;
          stroke: #0f766e;
          stroke-width: 2;
        }
        .lang-mode-bilingual .figure-hi {
          display: none !important;
        }

        .notes-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.875rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .notes-table th {
          background: #f1f5f9;
          color: #0f172a;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 800;
          border: 1px solid #cbd5e1;
        }
        .notes-table td {
          padding: 0.65rem 1rem;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        .notes-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .callout-box {
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          margin: 1.25rem 0;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .callout-box.info {
          background: #f0fdf4;
          border-left: 5px solid #16a34a;
          color: #166534;
        }
        .callout-box.alert {
          background: #eff6ff;
          border-left: 5px solid #2563eb;
          color: #1e3a8a;
        }
        .formula-card {
          background: #f8fafc;
          color: #0f172a;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          margin: 1.25rem 0;
          border: 1.5px solid #cbd5e1;
          border-left: 5px solid #2563eb;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .formula-card code {
          background: #e2e8f0;
          color: #1d4ed8;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-weight: bold;
        }
        .note-intro-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #cbd5e1;
          border-left: 5px solid #2563eb;
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .note-intro-card h3 {
          margin-top: 0;
          color: #1e293b;
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .quiz-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
          margin: 1.25rem 0 1.5rem 0;
          box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }
        .quiz-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.08);
        }
        .quiz-badge {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 0.25rem 0.65rem;
          border-radius: 0.375rem;
          border: 1px solid #bfdbfe;
          margin-bottom: 0.75rem;
        }
        .quiz-question {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.85rem;
          line-height: 1.5;
        }
        .quiz-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.6rem;
          margin: 0.75rem 0 1rem 0;
        }
        .quiz-option {
          position: relative;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.625rem;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          cursor: pointer;
          user-select: none;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .quiz-option:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.2);
        }
        .quiz-option:active {
          transform: translateY(0);
        }
        .quiz-option-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.6rem;
          height: 1.6rem;
          border-radius: 9999px;
          background: #e2e8f0;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
          transition: all 0.18s ease;
        }
        .quiz-option:hover .quiz-option-key {
          background: #dbeafe;
          color: #1d4ed8;
        }

        /* ── Selected Correct State ── */
        .quiz-option.selected-correct {
          background: #ecfdf5 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 1.5px #10b981, 0 4px 12px -2px rgba(16, 185, 129, 0.25) !important;
        }
        .quiz-option.selected-correct .quiz-option-key {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .quiz-option.selected-correct::after {
          content: "✓ Correct";
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 800;
          color: #059669;
          background: #d1fae5;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          border: 1px solid #a7f3d0;
        }

        /* ── Selected Wrong State ── */
        .quiz-option.selected-wrong {
          background: #fef2f2 !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 1.5px #ef4444, 0 4px 12px -2px rgba(239, 68, 68, 0.25) !important;
        }
        .quiz-option.selected-wrong .quiz-option-key {
          background: #ef4444 !important;
          color: #ffffff !important;
        }
        .quiz-option.selected-wrong::after {
          content: "✗ Incorrect";
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 800;
          color: #dc2626;
          background: #fee2e2;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          border: 1px solid #fecaca;
        }

        /* ── Highlight Correct Option (when wrong was chosen) ── */
        .quiz-option.highlight-correct {
          background: #f0fdf4 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 1.5px #10b981, 0 2px 8px -2px rgba(16, 185, 129, 0.2) !important;
        }
        .quiz-option.highlight-correct .quiz-option-key {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .quiz-option.highlight-correct::after {
          content: "✓ Correct Answer";
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 800;
          color: #059669;
          background: #d1fae5;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          border: 1px solid #a7f3d0;
        }

        .quiz-card.answered .quiz-option:not(.selected-correct):not(.selected-wrong):not(.highlight-correct) {
          opacity: 0.7;
        }

        .quiz-reveal {
          margin-top: 1rem;
          border-top: 1px dashed #cbd5e1;
          padding-top: 0.85rem;
        }
        .quiz-reveal summary {
          cursor: pointer;
          font-weight: 700;
          color: #2563eb;
          font-size: 0.875rem;
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          transition: all 0.15s ease;
        }
        .quiz-reveal summary:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .quiz-reveal[open] summary {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }
        .quiz-explanation {
          margin-top: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #10b981;
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          color: #1e293b;
          font-size: 0.875rem;
          line-height: 1.65;
        }
        .hindi-note {
          background: #f8fafc;
          border-left: 3px solid #3b82f6;
          padding: 0.6rem 1rem;
          margin: 0.5rem 0 1.25rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-size: 0.925rem;
          line-height: 1.7;
          color: #334155;
        }

        /* ── Dynamic Language Switcher Rules (PYQ CBT Standard) ── */
        .lang-mode-english .lang-hi {
          display: none !important;
        }
        .lang-mode-hindi .lang-en {
          display: none !important;
        }
        .lang-mode-bilingual .lang-en {
          display: block;
        }
        .lang-mode-bilingual .lang-hi {
          display: block;
        }

        /* Inline spans for bilingual headings, options & labels */
        .lang-mode-english span.lang-hi {
          display: none !important;
        }
        .lang-mode-hindi span.lang-en {
          display: none !important;
        }
        .lang-mode-bilingual span.lang-en {
          display: inline !important;
        }
        .lang-mode-bilingual span.lang-hi {
          display: inline !important;
        }

        /* In bilingual mode, inside table cells: English on top, Hindi underneath */
        .lang-mode-bilingual td .lang-en,
        .lang-mode-bilingual td div.lang-en {
          display: block !important;
        }
        .lang-mode-bilingual td .lang-hi,
        .lang-mode-bilingual td div.lang-hi {
          display: block !important;
          margin-top: 6px;
          padding-top: 5px;
          border-top: 1px dashed #e2e8f0;
          color: #475569;
          font-size: 0.88em;
          line-height: 1.55;
        }
        .lang-mode-bilingual th .lang-en {
          display: block !important;
        }
        .lang-mode-bilingual th .lang-hi {
          display: block !important;
          font-size: 0.84em;
          font-weight: 500;
          color: #cbd5e1;
          margin-top: 2px;
        }

        .lang-card-en {
          background: #ffffff;
          border-left: 4px solid #2563eb;
          padding: 1rem 1.25rem;
          margin: 0.75rem 0 1rem 0;
          border-radius: 0 0.75rem 0.75rem 0;
          border-top: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .lang-card-hi {
          background: #fdfefe;
          border-left: 4px solid #059669;
          padding: 1rem 1.25rem;
          margin: 0.75rem 0 1rem 0;
          border-radius: 0 0.75rem 0.75rem 0;
          border-top: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .lang-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lang-chip.en {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }
        .lang-chip.hi {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
      `}</style>

    </div>
  );
}
