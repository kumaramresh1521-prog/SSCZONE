"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Flame,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Layers,
  Clock,
  Share2,
  Atom,
  TestTube,
  Landmark,
  History,
  Globe2,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { ChapterNote, SubjectWithChapters } from "@/lib/notes-data";

const ICON_MAP: Record<string, any> = {
  Atom: Atom,
  TestTube: TestTube,
  Landmark: Landmark,
  History: History,
  Globe2: Globe2,
  BookOpen: BookOpen,
};

export default function NotesClient({ initialSubjects }: { initialSubjects: SubjectWithChapters[] }) {
  const [subjects, setSubjects] = useState<SubjectWithChapters[]>(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjects[0]?.id || "physics");
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialSubjects[0]?.chapters[0]?.id || "phy-units"
  );
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    physics: true,
    chemistry: true,
    polity: true,
    history: true,
    geography: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // MCQ answer state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);

  // Refresh from API to get any live admin edits
  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
        }
      })
      .catch(() => {});
  }, []);

  // Bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_bookmarked_notes");
      if (saved) setBookmarkedChapters(JSON.parse(saved));
    } catch {}
  }, []);

  // Find active subject and active chapter
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  }, [subjects, selectedSubjectId]);

  const activeChapter = useMemo(() => {
    // Look within active subject first, or across all subjects
    let found = activeSubject?.chapters.find((c) => c.id === selectedChapterId || c.slug === selectedChapterId);
    if (!found) {
      for (const s of subjects) {
        const c = s.chapters.find((ch) => ch.id === selectedChapterId || ch.slug === selectedChapterId);
        if (c) {
          found = c;
          break;
        }
      }
    }
    return found || activeSubject?.chapters[0];
  }, [activeSubject, subjects, selectedChapterId]);

  // Flattened list of all chapters for prev/next navigation
  const flatChaptersList = useMemo(() => {
    const list: ChapterNote[] = [];
    for (const s of subjects) {
      for (const ch of s.chapters) {
        list.push(ch);
      }
    }
    return list;
  }, [subjects]);

  const currentIdx = flatChaptersList.findIndex(
    (c) => c.id === activeChapter?.id || c.slug === activeChapter?.slug
  );
  const prevChapter = currentIdx > 0 ? flatChaptersList[currentIdx - 1] : null;
  const nextChapter = currentIdx >= 0 && currentIdx < flatChaptersList.length - 1 ? flatChaptersList[currentIdx + 1] : null;

  function toggleSubjectExpand(subId: string) {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  }

  function toggleBookmark(chapId: string) {
    let updated: string[];
    if (bookmarkedChapters.includes(chapId)) {
      updated = bookmarkedChapters.filter((id) => id !== chapId);
      toast.success("Removed from Saved Notes");
    } else {
      updated = [...bookmarkedChapters, chapId];
      toast.success("Saved to Quick Revision Notes! 📌");
    }
    setBookmarkedChapters(updated);
    try {
      localStorage.setItem("ssczone_bookmarked_notes", JSON.stringify(updated));
    } catch {}
  }

  const isBookmarked = activeChapter ? bookmarkedChapters.includes(activeChapter.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================= */}
      {/* TOP NOTIFICATION / BREADCRUMB BAR                         */}
      {/* ========================================================= */}
      <header className="border-b border-gray-200/80 bg-white sticky top-0 z-30 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-1.5 md:hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-800 cursor-pointer"
            >
              <Menu className="h-4 w-4 text-blue-600" />
              <span>Chapters</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-900 font-bold">Subject Notes</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className="text-blue-700 font-bold truncate max-w-[160px]">
                {activeSubject?.name.split("(")[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>TCS High-Yield Theory & Formulas</span>
            </span>

            <Link
              href="/exams"
              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Practice MCQs
            </Link>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* 2-PANEL SPLIT WORKSPACE (NAZARA KE SAMNE RAHE)             */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: CATEGORY-WISE LIST ACCORDION SIDEBAR          */}
        {/* ========================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 p-4 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-80 md:rounded-3xl md:border md:shadow-xs md:p-4 shrink-0 max-h-[calc(100vh-100px)] flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between pb-3 md:hidden border-b border-gray-100 mb-3">
            <span className="text-xs font-black uppercase text-gray-700">All Subject Chapters</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chapters, formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-8.5 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
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

          {/* Category-Wise Accordion Tree */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-left">
            {subjects.map((sub) => {
              const SubIcon = ICON_MAP[sub.iconName] || BookOpen;
              const isExpanded = expandedSubjects[sub.id] ?? true;
              const isSelectedSubject = sub.id === selectedSubjectId;

              // Filter chapters if searching
              const matchingChapters = sub.chapters.filter((ch) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  ch.title.toLowerCase().includes(q) ||
                  ch.hindiTitle.toLowerCase().includes(q) ||
                  ch.subtopics.some((st) => st.toLowerCase().includes(q))
                );
              });

              if (searchQuery.trim() && matchingChapters.length === 0) return null;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-2xs"
                >
                  {/* Category Header Button (Dropdown Toggle) */}
                  <button
                    onClick={() => toggleSubjectExpand(sub.id)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isSelectedSubject ? "bg-blue-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
                        <SubIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">
                          {sub.name.split("(")[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          {matchingChapters.length} Chapters
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isExpanded ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {/* Chapters List (Accordion Content) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-1.5 space-y-1">
                      {matchingChapters.map((ch) => {
                        const isCurrent = ch.id === activeChapter?.id || ch.slug === activeChapter?.slug;
                        const hasBookmark = bookmarkedChapters.includes(ch.id);

                        return (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setSelectedSubjectId(sub.id);
                              setSelectedChapterId(ch.id);
                              setQuizAnswer(null);
                              setSidebarOpen(false);
                            }}
                            className={`w-full rounded-xl p-2.5 text-left transition-all cursor-pointer border flex flex-col gap-1 ${
                              isCurrent
                                ? "bg-white border-blue-400 text-blue-950 font-bold shadow-xs ring-1 ring-blue-400/30"
                                : "border-transparent hover:bg-white text-gray-700 font-medium"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <p className={`text-xs leading-snug line-clamp-1 ${isCurrent ? "text-blue-900 font-black" : "text-gray-900"}`}>
                                {ch.title}
                              </p>
                              {hasBookmark && (
                                <Bookmark className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="truncate max-w-[160px]">{ch.hindiTitle}</span>
                              <span className="shrink-0">{ch.readTime}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Fast Action */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <Link
              href="/papers"
              className="flex items-center justify-between rounded-xl bg-gray-100 hover:bg-gray-200 p-2.5 text-xs font-bold text-gray-800 transition-colors"
            >
              <span>Solve Previous Papers</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT PANEL: RICH FOCUSED CHAPTER CANVAS                  */}
        {/* ========================================================= */}
        <main className="flex-1 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs text-left space-y-8 min-w-0">
          
          {activeChapter ? (
            <>
              {/* Header Box */}
              <div className="space-y-3 border-b border-gray-100 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {activeSubject?.name.split(" ")[0]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {activeChapter.readTime}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(activeChapter.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isBookmarked
                        ? "border-amber-300 bg-amber-50 text-amber-900 font-extrabold"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{isBookmarked ? "Saved for Revision" : "Save Notes"}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                  {activeChapter.title}
                </h1>

                {activeChapter.hindiTitle && (
                  <p className="text-sm font-bold text-blue-700">{activeChapter.hindiTitle}</p>
                )}

                {/* Subtopic Pills */}
                {activeChapter.subtopics && activeChapter.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {activeChapter.subtopics.map((st, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Overview Callout */}
              {activeChapter.overview && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-xs sm:text-sm text-blue-950 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-blue-900">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span>Exam Weightage & Importance:</span>
                  </div>
                  <p className="font-normal">{activeChapter.overview}</p>
                </div>
              )}

              {/* Key High-Yield Concept Points */}
              {activeChapter.keyPoints && activeChapter.keyPoints.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-950 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <span>High-Yield Concept Notes</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeChapter.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-xs sm:text-sm space-y-1"
                      >
                        <span className="font-bold text-blue-900 block">{pt.label}:</span>
                        <span className="text-gray-700 leading-relaxed font-normal">{pt.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison Table */}
              {activeChapter.table && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-extrabold text-gray-950">
                    📊 {activeChapter.table.title}
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          {activeChapter.table.headers.map((h, i) => (
                            <th key={i} className="p-3 font-extrabold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {activeChapter.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-3 ${cIdx === 0 ? "font-bold text-gray-900" : "text-gray-700"}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TCS Examiner Trap Alert */}
              {activeChapter.tcsTrap && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-xs sm:text-sm text-amber-950 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>⚠️ Examiner&apos;s Trap (बार-बार गलत होने वाला पॉइंट):</span>
                  </div>
                  <p className="leading-relaxed font-medium">{activeChapter.tcsTrap}</p>
                </div>
              )}

              {/* Concept Check MCQ */}
              {activeChapter.practiceMcq && (
                <div className="rounded-3xl border border-gray-200 bg-slate-900 text-white p-6 sm:p-8 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="rounded bg-blue-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      ⚡ Concept Check MCQ
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">TCS Previous Pattern</span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm sm:text-base font-bold leading-relaxed">
                      {activeChapter.practiceMcq.question}
                    </p>
                    {activeChapter.practiceMcq.questionHi && (
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {activeChapter.practiceMcq.questionHi}
                      </p>
                    )}
                  </div>

                  {/* MCQ Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {activeChapter.practiceMcq.options.map((opt, oIdx) => {
                      const isSelected = quizAnswer === oIdx;
                      const isCorrect = oIdx === activeChapter.practiceMcq!.correctIndex;
                      const answered = quizAnswer !== null;

                      let optStyle = "border-white/10 bg-white/5 hover:bg-white/15 text-slate-200";
                      if (answered) {
                        if (isCorrect) optStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                        else if (isSelected) optStyle = "border-rose-500 bg-rose-500/20 text-rose-300 font-bold";
                        else optStyle = "border-white/5 bg-white/5 opacity-50";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={answered}
                          onClick={() => setQuizAnswer(oIdx)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${optStyle}`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[11px] font-black shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswer !== null && (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Detailed Solution:</span>
                      </div>
                      <p className="leading-relaxed text-slate-300">{activeChapter.practiceMcq.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prev / Next Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 gap-3">
                {prevChapter ? (
                  <button
                    onClick={() => {
                      setSelectedSubjectId(prevChapter.subjectId);
                      setSelectedChapterId(prevChapter.id);
                      setQuizAnswer(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">{prevChapter.title}</span>
                  </button>
                ) : <div />}

                {nextChapter && (
                  <button
                    onClick={() => {
                      setSelectedSubjectId(nextChapter.subjectId);
                      setSelectedChapterId(nextChapter.id);
                      setQuizAnswer(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">{nextChapter.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-bold">Select a chapter from the left panel to begin reading.</p>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
