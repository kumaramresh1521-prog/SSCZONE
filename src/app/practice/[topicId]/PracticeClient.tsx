"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MathText from "@/components/MathText";
import QuestionText from "@/components/QuestionText";
import BookmarkButton from "@/components/BookmarkButton";
import AdBanner from "@/components/AdBanner";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Lock,
  Search,
  BookOpen,
  ArrowLeft,
  Menu,
  Award,
  Folder,
  RotateCcw,
  Shuffle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";

import { translateToHindi, translateSingleQuestion } from "@/lib/translator";

function formatSolutionSteps(rawText: string): string[] {
  if (!rawText) return [];
  
  let text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  // Keep image tags on their own line cleanly
  text = text.replace(/(\[Image:\s*https?:\/\/[^\s\]]+\])/gi, "\n$1\n");
  text = text.replace(/(!\[.*?\]\(https?:\/\/[^\s)]+\))/gi, "\n$1\n");

  // Smartly separate run-on sentences into vertical lines by math step triggers:
  text = text
    .replace(/(\.)\s+(?=[A-Z0-9]|For\s|When\s|Divisibility|Sum\s|Let\s|Hence|Therefore|Successive|Prime|Required|If\s|Then\s|Number\s|Formula|Short\s*Trick)/gi, "$1\n")
    .replace(/\s*(?=\bFor\s+\d+:|\bFor\s+[a-zA-Z]+:)/gi, "\n")
    .replace(/\s*(?=\bWhen\s+[a-zA-Z0-9\s=]+,)/gi, "\n")
    .replace(/\s*(?=\b(?:∴|∵|Therefore|Hence|Thus|Total\s*=|Sum\s*=|Required\s*=|Ans:)\b)/gi, "\n")
    .replace(/\s*(?=\bDivisibility\b)/gi, "\n");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.length > 0 ? lines : [rawText];
}

function renderSolutionStep(step: string, idx: number) {
  // Check if step contains an image markdown or [Image: url]
  const imgMatch = step.match(/\[Image:\s*(https?:\/\/[^\s\]]+)\]/i) || step.match(/!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/i);
  if (imgMatch) {
    const imgUrl = imgMatch[1]?.startsWith("http") ? imgMatch[1] : imgMatch[2];
    return (
      <div key={idx} className="my-2.5">
        <InteractiveImage src={imgUrl} alt="Solution Diagram" />
      </div>
    );
  }

  return (
    <div key={idx} className="flex items-start gap-2.5 py-1 text-xs sm:text-sm text-gray-800 leading-relaxed">
      <span className="text-blue-600 font-black text-sm shrink-0 leading-tight">•</span>
      <div className="flex-1 overflow-hidden">
        <MathText text={step} />
      </div>
    </div>
  );
}

function InteractiveImage({ src, alt = "Question figure" }: { src: string; alt?: string }) {
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.25, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.25, 0.6));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div className="my-3 space-y-2">
      {/* Direct Inline Zoom In / Zoom Out Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-3.5 w-3.5 text-blue-600" />
            <span>Zoom In (+)</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Zoom Out (-)</span>
          </button>
          {scale !== 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 text-[11px] font-extrabold rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              Reset ({Math.round(scale * 100)}%)
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>⛶ Fullscreen</span>
        </button>
      </div>

      {/* Image Container with Dynamic Scale */}
      <div className="overflow-auto max-w-full rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-xs inline-block">
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.15s ease-out",
            maxHeight: scale === 1 ? "480px" : undefined,
          }}
          className="rounded-xl w-auto object-contain cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
        />
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="absolute -top-12 right-0 flex items-center gap-2 bg-gray-900/95 px-3 py-1.5 rounded-2xl text-white shadow-2xl border border-gray-700">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
                <span>+</span>
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
                <span>-</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-black rounded-xl bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="ml-1.5 p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Viewport */}
            <div className="overflow-auto max-h-[85vh] max-w-[90vw] rounded-2xl bg-white p-3 sm:p-4 shadow-2xl border border-gray-200">
              <img
                src={src}
                alt={alt}
                style={{ transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
                className="max-h-[80vh] w-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticeClient({
  topic,
  questions,
  locked,
  fullSyllabus = []
}: {
  topic: any;
  questions: any[];
  locked: boolean;
  fullSyllabus?: any[];
}) {
  const examTitle = topic.subjects?.exams?.title || "Exam";
  const examSlug = topic.subjects?.exams?.slug || "";

  // Navigation / Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Language Mode: 'en' | 'hi' | 'bilingual'
  const [langMode, setLangMode] = useState<"en" | "hi" | "bilingual">("en");
  const [translationsCache, setTranslationsCache] = useState<Record<number, any>>({});
  const [translatingBatch, setTranslatingBatch] = useState(false);

  // Accordion state: open subject IDs
  const [openSubjects, setOpenSubjects] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    if (fullSyllabus) {
      fullSyllabus.forEach((sub) => {
        initial[sub.id] = true;
      });
    }
    return initial;
  });

  // Accordion state: open sub-section names
  const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>(() => {
    const activeSection = topic.description?.trim() || "General Topics";
    return { [activeSection]: true };
  });

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // User answers map for navigation history: questionIndex -> selectedOption
  const [answersHistory, setAnswersHistory] = useState<Record<number, string>>({});

  // Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Tier & Exam Filtering State
  const [activeTierFilter, setActiveTierFilter] = useState<"All" | "Tier 1" | "Tier 2">("All");
  const [activeExamFilter, setActiveExamFilter] = useState<string>("All");

  const examCounts = useMemo(() => {
    let cglCount = 0;
    let chslCount = 0;
    questions.forEach((q) => {
      const tag = (q.exam_tag || "").toUpperCase();
      if (tag.includes("CHSL")) chslCount++;
      else if (tag.includes("CGL") || !tag) cglCount++;
    });
    return {
      all: questions.length,
      cgl: cglCount,
      chsl: chslCount,
    };
  }, [questions]);

  const isMathSubject = useMemo(() => {
    const sub = (topic.subjects?.title || "").toLowerCase();
    return sub.includes("math") || sub.includes("quant") || sub.includes("arithmetic") || sub.includes("advance");
  }, [topic.subjects]);

  const displayQuestions = useMemo(() => {
    let list = questions;

    // 1. Exam Tag Filter
    if (activeExamFilter === "CGL") {
      list = list.filter((q) => {
        const tag = (q.exam_tag || "").toUpperCase();
        return tag.includes("CGL") || !tag;
      });
    } else if (activeExamFilter === "CHSL") {
      list = list.filter((q) => {
        const tag = (q.exam_tag || "").toUpperCase();
        return tag.includes("CHSL");
      });
    }

    // 2. Tier Filter (Strictly for Mathematics only)
    if (isMathSubject && activeTierFilter !== "All") {
      list = list.filter((q) => q.tier_level === activeTierFilter);
    }

    return list;
  }, [questions, activeExamFilter, activeTierFilter, isMathSubject]);

  // Practice Mode: 'step' (Default 1-by-1 Drill) | 'page10' (10-Question Page View) | 'set25' (25-Question Sets)
  const [practiceMode, setPracticeMode] = useState<"step" | "page10" | "set25">("step");
  const [setAnswers, setSetAnswers] = useState<Record<number, string>>({});
  const [setSubmitted, setSetSubmitted] = useState(false);
  const [sheetScore, setSheetScore] = useState(0);

  // Multi-Set & Randomization State
  const [selectedSetNumber, setSelectedSetNumber] = useState<number | "random">(1);
  const [randomSeed, setRandomSeed] = useState(0);

  // Dynamic Batch Size: 25 for set25 mode, 10 for page10 mode
  const batchSize = practiceMode === "set25" ? 25 : 10;

  // Total Sets Available in this Topic & Tier
  const totalSets = useMemo(() => {
    return Math.max(1, Math.ceil(displayQuestions.length / batchSize));
  }, [displayQuestions.length, batchSize]);

  // Questions for the current Page / Set View Mode
  const activeSetQuestions = useMemo(() => {
    if (selectedSetNumber === "random") {
      // Create a deterministic pseudo-shuffle based on randomSeed
      const pool = [...displayQuestions];
      let seed = randomSeed || 1;
      for (let i = pool.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, batchSize);
    }

    const startIdx = (Number(selectedSetNumber) - 1) * batchSize;
    return displayQuestions.slice(startIdx, startIdx + batchSize);
  }, [displayQuestions, selectedSetNumber, randomSeed, batchSize]);

  const q = displayQuestions[currentIndex];

  // SSR Hydration Safety
  const [mounted, setMounted] = useState(false);

  // 1. Auto-Resume Progress on Mount from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedKey = `ssc_practice_progress_${topic?.id}`;
      const raw = localStorage.getItem(savedKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.currentIndex === "number" && data.currentIndex < (displayQuestions?.length || 0)) {
          setCurrentIndex(data.currentIndex);
        }
        if (data.answersHistory) {
          setAnswersHistory(data.answersHistory);
          const savedAns = data.answersHistory[data.currentIndex || 0];
          if (savedAns) {
            setSelectedAnswer(savedAns);
            setShowResult(true);
          }
        }
        if (typeof data.score === "number") {
          setScore(data.score);
        }
      }
    } catch (e) {
      console.error("Failed to restore practice progress:", e);
    }
  }, [topic?.id, displayQuestions?.length]);

  // 2. Persist Progress into localStorage whenever state updates
  useEffect(() => {
    if (!topic?.id) return;
    try {
      const savedKey = `ssc_practice_progress_${topic.id}`;
      if (currentIndex > 0 || Object.keys(answersHistory).length > 0) {
        localStorage.setItem(
          savedKey,
          JSON.stringify({
            currentIndex,
            answersHistory,
            score,
            updatedAt: Date.now()
          })
        );
      }
    } catch (e) {
      console.error("Failed to save practice progress:", e);
    }
  }, [currentIndex, answersHistory, score, topic?.id]);

  // 3. Batch Translation Engine (Works for both 1-by-1 and Multi-Question Views)
  useEffect(() => {
    if (langMode === "en") return;

    // In step mode, prefetch current + next 5 questions for zero-delay navigation
    const targets = practiceMode !== "step"
      ? activeSetQuestions
      : [
          displayQuestions[currentIndex],
          displayQuestions[currentIndex + 1],
          displayQuestions[currentIndex + 2],
          displayQuestions[currentIndex + 3],
          displayQuestions[currentIndex + 4],
        ].filter(Boolean);

    // Only translate if native DB Hindi fields are not present and not already cached
    const needed = targets.filter((item) => item && !item.question_text_hi && !translationsCache[item.id]);
    if (needed.length === 0) return;

    let isMounted = true;
    async function runTranslations() {
      setTranslatingBatch(true);
      try {
        const results = await Promise.all(
          needed.map(async (item) => {
            const data = await translateSingleQuestion(item);
            return { id: item.id, data };
          })
        );

        if (isMounted) {
          setTranslationsCache((prev) => {
            const next = { ...prev };
            results.forEach((r) => {
              next[r.id] = r.data;
            });
            return next;
          });
          setTranslatingBatch(false);
        }
      } catch (e) {
        console.error("Batch translation error:", e);
        if (isMounted) setTranslatingBatch(false);
      }
    }

    runTranslations();
    return () => { isMounted = false; };
  }, [langMode, practiceMode, currentIndex, displayQuestions, activeSetQuestions, translationsCache]);

  function toggleSubject(id: number) {
    setOpenSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSubSection(secKey: string) {
    setOpenSubSections((prev) => {
      const isCurrentlyOpen = prev[secKey] ?? false;
      return isCurrentlyOpen ? {} : { [secKey]: true };
    });
  }

  function handleAnswer(option: string) {
    if (showResult) return;
    setAnswersHistory((prev) => ({ ...prev, [currentIndex]: option }));
    setSelectedAnswer(option);
    setShowResult(true);
    if (option === displayQuestions[currentIndex]?.correct_answer) {
      setScore((prev) => prev + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex < displayQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (answersHistory[nextIdx]) {
        setSelectedAnswer(answersHistory[nextIdx]);
        setShowResult(true);
      } else {
        setSelectedAnswer(null);
        setShowResult(false);
      }
    } else {
      setShowSummary(true);
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (answersHistory[prevIdx]) {
        setSelectedAnswer(answersHistory[prevIdx]);
        setShowResult(true);
      } else {
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  }

  function resetPractice() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setShowSummary(false);
    setAnswersHistory({});
    setSetAnswers({});
    setSetSubmitted(false);
    setSheetScore(0);
    try {
      if (topic?.id) {
        localStorage.removeItem(`ssc_practice_progress_${topic.id}`);
      }
    } catch (e) {}
  }

  function switchSet(setNum: number | "random") {
    setSelectedSetNumber(setNum);
    setSetAnswers({});
    setSetSubmitted(false);
    setSheetScore(0);
    if (setNum === "random") {
      setRandomSeed(Date.now());
    }
  }

  function shuffleRandomSet() {
    setSelectedSetNumber("random");
    setSetAnswers({});
    setSetSubmitted(false);
    setSheetScore(0);
    setRandomSeed(Date.now());
  }

  function handleSetAnswer(qIdx: number, option: string) {
    if (setSubmitted) return;
    setSetAnswers((prev) => ({ ...prev, [qIdx]: option }));
  }

  function submitSetMode() {
    let correctCount = 0;
    activeSetQuestions.forEach((item, idx) => {
      if (setAnswers[idx] === item.correct_answer) {
        correctCount++;
      }
    });
    setSheetScore(correctCount);
    setSetSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleExamSwitch(exam: "All" | "CGL" | "CHSL" | "CPO" | "MTS") {
    setActiveExamFilter(exam);
    resetPractice();
    setSelectedSetNumber(1);
  }

  function handleTierSwitch(tier: "All" | "Tier 1" | "Tier 2") {
    setActiveTierFilter(tier);
    resetPractice();
    setSelectedSetNumber(1);
  }

  // Syllabus Sidebar Render Helper
  const renderSyllabusSidebar = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 p-4 space-y-3 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-5 w-5 shrink-0" />
            <span className="font-extrabold text-sm text-gray-900">Syllabus Navigator</span>
          </div>

          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 border border-blue-100/80">
            {examTitle}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-8 pr-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {fullSyllabus.map((sub) => {
          const isSubOpen = openSubjects[sub.id] ?? true;
          const rawTopics = (sub.topics || []).filter((t: any) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && rawTopics.length === 0) return null;

          const explicitGroups: Record<string, any[]> = {};
          rawTopics.forEach((top: any) => {
            const secName = top.description?.trim() || "General Topics";
            if (!explicitGroups[secName]) explicitGroups[secName] = [];
            explicitGroups[secName].push(top);
          });

          const groupKeys = Object.keys(explicitGroups);
          const hasMultipleSubSections =
            groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== "General Topics");

          return (
            <div key={sub.id} className="rounded-xl border border-gray-200/90 overflow-hidden bg-white shadow-2xs">
              <button
                onClick={() => toggleSubject(sub.id)}
                className="flex w-full items-center justify-between bg-gray-50/80 px-3.5 py-2.5 text-left text-xs font-extrabold text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="truncate uppercase tracking-wide">{sub.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                    {rawTopics.length}
                  </span>
                  {isSubOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isSubOpen && (
                <div className="p-2 space-y-2 border-t border-gray-100 bg-white">
                  {hasMultipleSubSections ? (
                    groupKeys.map((secKey) => {
                      const isSecOpen = openSubSections[secKey] ?? false;
                      const containsActiveTopic = explicitGroups[secKey].some((t: any) => t.id === topic.id);

                      return (
                        <div
                          key={secKey}
                          className={`rounded-xl border transition-all ${
                            containsActiveTopic
                              ? "border-indigo-200 bg-indigo-50/20 shadow-2xs"
                              : "border-gray-200 bg-gray-50/40"
                          }`}
                        >
                          <button
                            onClick={() => toggleSubSection(secKey)}
                            className={`flex w-full items-center justify-between p-2 text-left transition-colors rounded-xl cursor-pointer ${
                              containsActiveTopic
                                ? "bg-indigo-50 text-indigo-950 font-black"
                                : "hover:bg-gray-100/80 text-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-1">
                              <Folder className={`h-4 w-4 shrink-0 ${containsActiveTopic ? "text-indigo-600 fill-indigo-200" : "text-gray-500"}`} />
                              <span className="truncate text-xs font-extrabold">{secKey}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  containsActiveTopic
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {explicitGroups[secKey].length}
                              </span>
                              {isSecOpen ? (
                                <ChevronDown className="h-4 w-4 text-indigo-700" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {isSecOpen && (
                            <div className="p-1 space-y-1">
                              {explicitGroups[secKey].map((top: any) => {
                                const isActive = top.id === topic.id;
                                return (
                                  <Link
                                    key={top.id}
                                    href={`/practice/${top.slug || top.id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-all relative overflow-hidden ${
                                      isActive
                                        ? "bg-blue-600 text-white font-extrabold shadow-sm pl-3"
                                        : "text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate pr-1">
                                      <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-gray-400"}`} />
                                      <span className="truncate">{top.title}</span>
                                    </div>

                                    {!top.is_free ? (
                                      <span
                                        className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] shrink-0 font-semibold ${
                                          isActive
                                            ? "bg-blue-700 text-blue-100"
                                            : "bg-amber-100 text-amber-800"
                                        }`}
                                      >
                                        <Lock className="h-2.5 w-2.5" />
                                      </span>
                                    ) : null}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-1">
                      {rawTopics.map((top: any) => {
                        const isActive = top.id === topic.id;
                        return (
                          <Link
                            key={top.id}
                            href={`/practice/${top.slug || top.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-all ${
                              isActive
                                ? "bg-blue-600 text-white font-extrabold shadow-sm"
                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-1">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-gray-400"}`} />
                              <span className="truncate">{top.title}</span>
                            </div>

                            {!top.is_free ? (
                              <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 shrink-0">
                                <Lock className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-bold text-gray-500 animate-pulse">Loading Practice Drill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <span className="text-sm font-extrabold text-gray-900">Syllabus Index</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-60px)]">{renderSyllabusSidebar()}</div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Desktop Left Syllabus Sidebar (4 Columns) */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-20 h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {renderSyllabusSidebar()}
            </div>
          </div>

          {/* Right Practice Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Unified Clean Top Header Card */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-3.5">
              {/* Row 1: Back Button + Subject Tag + Mode Switcher + Language Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 shadow-2xs hover:bg-blue-50 hover:text-blue-600 lg:hidden cursor-pointer"
                    title="Open Syllabus Navigation"
                  >
                    <Menu className="h-4 w-4" />
                  </button>

                  <Link
                    href={examSlug ? `/exams/${examSlug}` : "/exams"}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </Link>

                  <span className="hidden sm:inline-block text-gray-300">|</span>

                  <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700">
                    {topic.subjects?.title}
                  </span>
                </div>

                {/* Practice Mode & Language Toggles (Only when questions exist) */}
                {questions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mode Switcher */}
                    <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200">
                      <button
                        onClick={() => setPracticeMode("step")}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          practiceMode === "step"
                            ? "bg-white text-emerald-700 shadow-2xs border border-gray-200/80 font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span>🎯 1-by-1</span>
                      </button>
                      <button
                        onClick={() => { setPracticeMode("page10"); setSelectedSetNumber(1); }}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          practiceMode === "page10"
                            ? "bg-white text-blue-700 shadow-2xs border border-gray-200/80 font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span>📑 10-Q Page View</span>
                      </button>
                      <button
                        onClick={() => { setPracticeMode("set25"); setSelectedSetNumber(1); }}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          practiceMode === "set25"
                            ? "bg-white text-indigo-700 shadow-2xs border border-gray-200/80 font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span>⚡ 25-Q Sets</span>
                      </button>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200">
                      <button
                        onClick={() => setLangMode("en")}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          langMode === "en"
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLangMode("hi")}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          langMode === "hi"
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🇮🇳 HI
                      </button>
                      <button
                        onClick={() => setLangMode("bilingual")}
                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          langMode === "bilingual"
                            ? "bg-purple-600 text-white shadow-2xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🌓 Both
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Chapter Title + Prominent Exam & Tier Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    {topic.title}
                  </h1>
                  <p className="text-[11px] font-semibold text-gray-500">
                    {questions.length === 0
                      ? "0 Questions Available in this Chapter"
                      : `Showing ${displayQuestions.length} Questions (${activeExamFilter === "All" ? "All Exams" : activeExamFilter}, ${activeTierFilter})`}
                  </p>
                </div>

                {/* Filter Controls: Exam Target + Tier Level (Only when questions exist) */}
                {questions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Exam Target Filter Selector */}
                    <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                      <button
                        onClick={() => handleExamSwitch("All")}
                        className={`px-2.5 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                          activeExamFilter === "All"
                            ? "bg-white text-blue-700 shadow-xs border border-gray-200 font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🌐 All SSC ({examCounts.all})
                      </button>
                      <button
                        onClick={() => handleExamSwitch("CGL")}
                        className={`px-2.5 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                          activeExamFilter === "CGL"
                            ? "bg-blue-600 text-white shadow-xs font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🏛️ CGL ({examCounts.cgl})
                      </button>
                      <button
                        onClick={() => handleExamSwitch("CHSL")}
                        className={`px-2.5 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                          activeExamFilter === "CHSL"
                            ? "bg-amber-600 text-white shadow-xs font-black"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🎓 CHSL ({examCounts.chsl})
                      </button>
                    </div>

                    {/* Tier Filter Selector (Strictly for Mathematics only) */}
                    {isMathSubject && (
                      <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                        <button
                          onClick={() => handleTierSwitch("All")}
                          className={`px-2 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                            activeTierFilter === "All"
                              ? "bg-white text-blue-700 shadow-xs border border-gray-200 font-black"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          All Tiers
                        </button>
                        <button
                          onClick={() => handleTierSwitch("Tier 1")}
                          className={`px-2 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                            activeTierFilter === "Tier 1"
                              ? "bg-amber-500 text-white shadow-xs font-black"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          ⚡ Tier 1
                        </button>
                        <button
                          onClick={() => handleTierSwitch("Tier 2")}
                          className={`px-2 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                            activeTierFilter === "Tier 2"
                              ? "bg-indigo-600 text-white shadow-xs font-black"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          ⚡ Tier 2
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Practice Question Card / Content Section */}
            {locked ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Premium Chapter</h2>
                <p className="mt-2 text-sm text-gray-600 max-w-sm">
                  Subscribe to SSCZone Pass to unlock <b>{topic.title}</b> and access all premium chapters.
                </p>
                <Link
                  href="/pricing"
                  className="mt-6 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                >
                  Unlock Premium Plans 🚀
                </Link>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 sm:p-14 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">No Questions Added Yet</h2>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Questions for <b>{topic.title}</b> are being compiled. You can select another chapter from the syllabus navigation.
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer lg:hidden"
                >
                  <Menu className="h-4 w-4" /> Open Syllabus Menu
                </button>
              </div>
            ) : displayQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-10 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Search className="h-7 w-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h2 className="text-lg font-black text-amber-950">No Matching Questions</h2>
                  <p className="text-xs text-amber-800">
                    No questions found for <b>{activeExamFilter === "All" ? "" : `${activeExamFilter} `}{activeTierFilter === "All" ? "selected filters" : activeTierFilter}</b> in this chapter.
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => { setActiveExamFilter("All"); setActiveTierFilter("All"); }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> View All ({questions.length}) Questions
                  </button>
                </div>
              </div>
            ) : showSummary ? (
              <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Award className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Practice Completed! 🎉</h2>
                <p className="mt-1 text-sm text-gray-500">Chapter: {topic.title}</p>
                
                <div className="my-6 inline-block rounded-2xl bg-gray-50 border border-gray-100 px-8 py-6">
                  <span className="text-5xl font-extrabold text-blue-600">
                    {score} / {displayQuestions.length}
                  </span>
                  <p className="mt-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Score: {Math.round((score / displayQuestions.length) * 100)}% Correct
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={resetPractice}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                  >
                    Practice Chapter Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {practiceMode !== "step" ? (
                  /* ==================================================== */
                  /* FULL PAGE / SET VIEW (10-Q OR 25-Q ON ONE PAGE)      */
                  /* ==================================================== */
                  <div className="space-y-4">
                    {/* Multi-Page / Multi-Set Selector Bar (Only needed when more than 1 page/set) */}
                    {totalSets > 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 sm:p-4 border border-gray-200/90 shadow-2xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-black text-gray-500 mr-1 flex items-center gap-1">
                            <span>{practiceMode === "set25" ? "📦 Sets:" : "📑 Pages:"}</span>
                          </span>
                          
                          {Array.from({ length: totalSets }).map((_, sIdx) => {
                            const itemNum = sIdx + 1;
                            const isCurrent = selectedSetNumber === itemNum;
                            const startQ = sIdx * batchSize + 1;
                            const endQ = Math.min((sIdx + 1) * batchSize, displayQuestions.length);

                            return (
                              <button
                                key={itemNum}
                                onClick={() => switchSet(itemNum)}
                                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white shadow-2xs font-black ring-2 ring-indigo-500/20"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                }`}
                              >
                                {practiceMode === "set25" ? `Set ${itemNum}` : `Page ${itemNum}`} <span className="opacity-75 text-[10px]">({startQ}-{endQ})</span>
                              </button>
                            );
                          })}

                          <button
                            onClick={shuffleRandomSet}
                            className={`flex items-center gap-1 px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                              selectedSetNumber === "random"
                                ? "bg-purple-600 text-white shadow-2xs font-black ring-2 ring-purple-500/20"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80"
                            }`}
                          >
                            <Shuffle className="h-3 w-3" />
                            <span>🔀 Random {batchSize}</span>
                          </button>
                        </div>

                        {selectedSetNumber === "random" && (
                          <button
                            onClick={shuffleRandomSet}
                            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Shuffle Fresh {batchSize}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Detailed Scorecard & Summary Banner After Submit */}
                    {setSubmitted ? (
                      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                              <Award className="h-7 w-7" />
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-emerald-950">
                                {selectedSetNumber === "random" ? "Random 10-Q Set" : `Page ${selectedSetNumber}`} Result & Scorecard 🎉
                              </h3>
                              <p className="text-xs font-semibold text-emerald-800">
                                Level: <b>{activeTierFilter}</b> | Chapter: <b>{topic.title}</b>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => switchSet(selectedSetNumber)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Re-attempt
                            </button>
                            {typeof selectedSetNumber === "number" && selectedSetNumber < totalSets && (
                              <button
                                onClick={() => switchSet(selectedSetNumber + 1)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                              >
                                Next Page (Page {selectedSetNumber + 1}) ➡️
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Detailed Score Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-emerald-200/70 bg-white p-3 text-center shadow-2xs">
                            <span className="block text-2xl font-black text-emerald-700">{sheetScore}</span>
                            <span className="text-[11px] font-bold text-gray-600 uppercase">Correct Answers</span>
                          </div>
                          <div className="rounded-xl border border-rose-200/70 bg-white p-3 text-center shadow-2xs">
                            <span className="block text-2xl font-black text-rose-600">
                              {Object.keys(setAnswers).length - sheetScore}
                            </span>
                            <span className="text-[11px] font-bold text-gray-600 uppercase">Wrong Answers</span>
                          </div>
                          <div className="rounded-xl border border-amber-200/70 bg-white p-3 text-center shadow-2xs">
                            <span className="block text-2xl font-black text-amber-600">
                              {activeSetQuestions.length - Object.keys(setAnswers).length}
                            </span>
                            <span className="text-[11px] font-bold text-gray-600 uppercase">Skipped</span>
                          </div>
                          <div className="rounded-xl border border-blue-200/70 bg-white p-3 text-center shadow-2xs">
                            <span className="block text-2xl font-black text-blue-700">
                              {Math.round((sheetScore / activeSetQuestions.length) * 100)}%
                            </span>
                            <span className="text-[11px] font-bold text-gray-600 uppercase">Accuracy</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Set Mode Header Before Submit */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-white p-4 sm:p-5 border border-indigo-100 shadow-xs">
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-indigo-950 flex items-center gap-2">
                            <span>⚡ {selectedSetNumber === "random" ? "Random 10 Practice Set" : `Page ${selectedSetNumber} Practice (${(Number(selectedSetNumber) - 1) * 10 + 1}-${Math.min(Number(selectedSetNumber) * 10, displayQuestions.length)})`}</span>
                            <span className="rounded-full bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-extrabold">
                              {activeTierFilter}
                            </span>
                          </h3>
                          <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                            Solve these {activeSetQuestions.length} questions on this page at your own pace!
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-xl bg-white border border-indigo-200 px-3.5 py-1.5 text-xs font-extrabold text-indigo-900 shadow-2xs">
                            Answered: {Object.keys(setAnswers).length} / {activeSetQuestions.length}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Questions Stack */}
                    <div className="space-y-5">
                      {activeSetQuestions.map((item, qIdx) => {
                        const userAns = setAnswers[qIdx];
                        const isCorrect = userAns === item.correct_answer;
                        const trans = translationsCache[item.id];

                        const textEn = item.question_text;
                        const textHi = trans?.question_text;

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs transition-all ${
                              setSubmitted
                                ? isCorrect
                                  ? "border-emerald-300 ring-2 ring-emerald-500/10"
                                  : userAns
                                  ? "border-rose-300 ring-2 ring-rose-500/10"
                                  : "border-gray-200"
                                : "border-gray-200/90"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.exam_tag && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase">
                                      🎯 {item.exam_tag}
                                    </span>
                                  )}
                                  {item.tier_level && (
                                    <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                      ⚡ {item.tier_level}
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex items-start gap-2">
                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-blue-600 text-white text-xs font-black shrink-0 mt-0.5 shadow-2xs">
                                      {qIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      {langMode === "hi" && (item.question_text_hi || textHi) ? (
                                        <QuestionText text={item.question_text_hi || textHi} />
                                      ) : (
                                        <QuestionText text={textEn} />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {langMode === "bilingual" && (item.question_text_hi || textHi) && (
                                  <div className="text-xs sm:text-sm font-semibold text-indigo-900 pt-1.5 border-t border-indigo-50/80">
                                    <QuestionText text={item.question_text_hi || textHi} />
                                  </div>
                                )}

                                {item.image_url && (
                                  <InteractiveImage src={item.image_url} alt="Question figure" />
                                )}
                              </div>

                              <BookmarkButton questionId={item.id} />
                            </div>

                            {/* Options */}
                            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                              {(["A", "B", "C", "D"] as const).map((opt) => {
                                const optEn = item[`option_${opt.toLowerCase()}`];
                                const optHi = item[`option_${opt.toLowerCase()}_hi`] || trans?.[`option_${opt.toLowerCase()}`];
                                const isOptCorrect = opt === item.correct_answer;
                                const isOptSelected = userAns === opt;

                                let optCardClass = "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/30";
                                let optBadgeClass = "bg-gray-100 text-gray-700 border-gray-300";

                                if (setSubmitted) {
                                  if (isOptCorrect) {
                                    optCardClass = "border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                                    optBadgeClass = "bg-emerald-600 text-white border-emerald-600";
                                  } else if (isOptSelected) {
                                    optCardClass = "border-2 border-rose-400 bg-rose-50 text-rose-950 font-bold";
                                    optBadgeClass = "bg-rose-500 text-white border-rose-500";
                                  } else {
                                    optCardClass = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60";
                                    optBadgeClass = "bg-gray-100 text-gray-400 border-gray-200";
                                  }
                                } else if (isOptSelected) {
                                  optCardClass = "border-2 border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-xs";
                                  optBadgeClass = "bg-blue-600 text-white border-blue-600";
                                }

                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleSetAnswer(qIdx, opt)}
                                    disabled={setSubmitted}
                                    className={`flex items-center rounded-xl border p-3 text-left transition-all cursor-pointer disabled:cursor-default ${optCardClass}`}
                                  >
                                    <span className={`mr-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${optBadgeClass}`}>
                                      {opt}
                                    </span>
                                    <div className="flex-1 text-xs sm:text-sm">
                                      {langMode === "hi" && optHi ? (
                                        <MathText text={optHi} />
                                      ) : langMode === "bilingual" && optHi ? (
                                        <div>
                                          <div className="font-bold"><MathText text={optEn} /></div>
                                          <div className="text-[11px] font-semibold text-indigo-900"><MathText text={optHi} /></div>
                                        </div>
                                      ) : (
                                        <MathText text={optEn} />
                                      )}
                                    </div>

                                    {setSubmitted && isOptCorrect && (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-1.5" />
                                    )}
                                    {setSubmitted && isOptSelected && !isOptCorrect && (
                                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-1.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Solution (Shown After Submit) */}
                            {setSubmitted && (item.explanation || item.explanation_hi) && (
                              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/20 p-4 text-xs sm:text-sm text-gray-800 space-y-2">
                                <div className="font-extrabold text-blue-900 flex items-center justify-between border-b border-blue-100 pb-2">
                                  <span>💡 Correct Answer: Option ({item.correct_answer})</span>
                                  <span className="text-[11px] font-bold text-blue-600">Explanation</span>
                                </div>
                                <div className="space-y-1.5 pt-1">
                                  {formatSolutionSteps(
                                    langMode === "hi" && (item.explanation_hi || trans?.explanation)
                                      ? (item.explanation_hi || trans?.explanation)
                                      : (item.explanation || "")
                                  ).map((step, sIdx) => renderSolutionStep(step, sIdx))}

                                  {langMode === "bilingual" && (item.explanation_hi || trans?.explanation) && (
                                    <div className="border-t border-indigo-100 pt-2.5 mt-2 bg-indigo-50/40 p-2.5 rounded-lg space-y-1">
                                      <span className="block text-[10px] font-black uppercase text-indigo-700">🇮🇳 हिंदी व्याख्या:</span>
                                      {formatSolutionSteps(item.explanation_hi || trans?.explanation).map((step, sIdx) => renderSolutionStep(step, sIdx))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Submit / Reset Bar */}
                    <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-gray-200 shadow-xl">
                      <div className="text-xs font-bold text-gray-600">
                        {setSubmitted ? (
                          <span className="text-emerald-700 font-black">
                            🎉 Set Completed! Final Score: {sheetScore} / {activeSetQuestions.length}
                          </span>
                        ) : (
                          <span>
                            Total Questions: {activeSetQuestions.length} | Answered: <b>{Object.keys(setAnswers).length}</b>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {setSubmitted ? (
                          <>
                            <button
                              onClick={() => switchSet(selectedSetNumber)}
                              className="rounded-xl bg-gray-100 border border-gray-300 px-4 py-2.5 text-xs sm:text-sm font-black text-gray-800 shadow-xs hover:bg-gray-200 transition-all cursor-pointer"
                            >
                              Re-attempt 🔄
                            </button>

                            {typeof selectedSetNumber === "number" && selectedSetNumber < totalSets ? (
                              <button
                                onClick={() => switchSet(selectedSetNumber + 1)}
                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <span>Go to Set {selectedSetNumber + 1}</span>
                                <span>➡️</span>
                              </button>
                            ) : (
                              <button
                                onClick={shuffleRandomSet}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <span>🔀 Try Random 25 Set</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={submitSetMode}
                            disabled={Object.keys(setAnswers).length === 0}
                            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Submit 🚀
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ==================================================== */
                  /* 1-BY-1 STEP DRILL MODE                               */
                  /* ==================================================== */
                  <div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 mb-4">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / displayQuestions.length) * 100}%` }}
                      />
                    </div>

                    {/* Question Box */}
                    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-7 shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="space-y-2 w-full overflow-hidden">
                          {q.exam_tag && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3 py-1 text-[11px] font-extrabold text-blue-800 shadow-2xs uppercase tracking-wide">
                                <span className="text-amber-500">🎯</span>
                                {q.exam_tag}
                              </span>
                              {q.tier_level && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                  ⚡ {q.tier_level}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-start gap-2.5 pt-1">
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-blue-600 text-white text-xs font-black shrink-0 mt-0.5 shadow-2xs">
                              Q{currentIndex + 1}
                            </span>
                            <div className="flex-1">
                              {langMode === "hi" && (q.question_text_hi || translationsCache[q.id]?.question_text) ? (
                                <QuestionText text={q.question_text_hi || translationsCache[q.id]?.question_text} />
                              ) : (
                                <QuestionText text={q.question_text} />
                              )}
                            </div>
                          </div>

                          {/* If Bilingual Mode */}
                          {langMode === "bilingual" && (q.question_text_hi || translationsCache[q.id]?.question_text) && (
                            <div className="text-sm sm:text-base font-semibold text-indigo-900 pt-2 border-t border-indigo-50/80 leading-relaxed">
                              <QuestionText text={q.question_text_hi || translationsCache[q.id]?.question_text} />
                            </div>
                          )}

                          {/* Question Image */}
                          {q.image_url && (
                            <div className="relative group inline-block mt-4 mb-2">
                              <img 
                                src={q.image_url} 
                                alt="Question figure" 
                                onClick={() => { setZoomedImage(q.image_url); setZoomScale(1); }}
                                className="w-auto max-w-full sm:max-w-xl rounded-2xl border border-slate-200 bg-white p-1.5 sm:p-2 shadow-xs transition-all hover:shadow-md cursor-zoom-in" 
                                style={{ maxHeight: '520px', objectFit: 'contain' }}
                              />
                              <button
                                type="button"
                                onClick={() => { setZoomedImage(q.image_url); setZoomScale(1); }}
                                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-gray-900/85 hover:bg-gray-900 text-white px-3 py-1.5 text-xs font-extrabold shadow-lg backdrop-blur-xs transition-all cursor-pointer"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span>🔍 Zoom Fullscreen</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <BookmarkButton questionId={q.id} />
                      </div>

                      {/* Options List */}
                      <div className="mt-6 space-y-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const textEn = q[`option_${opt.toLowerCase()}`];
                          const textHi = q[`option_${opt.toLowerCase()}_hi`] || translationsCache[q.id]?.[`option_${opt.toLowerCase()}`];
                          const isCorrect = opt === q.correct_answer;
                          const isSelected = selectedAnswer === opt;

                          let cardStyle = "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-xs";
                          let badgeStyle = "bg-gray-100 text-gray-700 border-gray-300";

                          if (showResult) {
                            if (isCorrect) {
                              cardStyle = "border-2 border-emerald-500 bg-gradient-to-r from-emerald-50/90 to-white text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/15";
                              badgeStyle = "bg-emerald-600 text-white border-emerald-600 shadow-xs";
                            } else if (isSelected) {
                              cardStyle = "border-2 border-rose-400 bg-gradient-to-r from-rose-50/90 to-white text-rose-950 font-bold shadow-xs ring-2 ring-rose-400/15";
                              badgeStyle = "bg-rose-500 text-white border-rose-500 shadow-xs";
                            } else {
                              cardStyle = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60";
                              badgeStyle = "bg-gray-100 text-gray-400 border-gray-200";
                            }
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(opt)}
                              disabled={showResult}
                              className={`group flex w-full items-center rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer disabled:cursor-default ${cardStyle}`}
                            >
                              <span
                                className={`mr-3.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-all ${badgeStyle}`}
                              >
                                {opt}
                              </span>
                              
                              <div className="flex-1 text-xs sm:text-sm leading-relaxed overflow-hidden flex flex-col justify-center">
                                {langMode === "hi" && textHi ? (
                                  <MathText text={textHi} />
                                ) : langMode === "bilingual" && textHi ? (
                                  <div>
                                    <div className="font-bold text-gray-900"><MathText text={textEn} /></div>
                                    <div className="text-xs font-semibold text-indigo-900 mt-0.5"><MathText text={textHi} /></div>
                                  </div>
                                ) : (
                                  <MathText text={textEn} />
                                )}
                                
                                {q[`option_${opt.toLowerCase()}_image_url`] && (
                                  <div className="mt-2 mb-1">
                                    <img 
                                      src={q[`option_${opt.toLowerCase()}_image_url`]} 
                                      alt={`Option ${opt} figure`} 
                                      className="max-w-full rounded-md border border-gray-200/60 shadow-xs" 
                                      style={{ maxHeight: '150px', objectFit: 'contain' }}
                                    />
                                  </div>
                                )}
                              </div>

                              {showResult && isCorrect && (
                                <div className="flex items-center gap-1 shrink-0 ml-2 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-black border border-emerald-300">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Correct</span>
                                </div>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <div className="flex items-center gap-1 shrink-0 ml-2 rounded-full bg-rose-100 text-rose-800 px-2.5 py-1 text-xs font-black border border-rose-300">
                                  <XCircle className="h-4 w-4 text-rose-600" />
                                  <span>Your Choice</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Answer Result & Solution Explanation Box */}
                      {showResult && (
                        <div className="mt-7 space-y-4 border-t border-gray-100 pt-6 animate-fadeIn">
                          {/* Top Result Banner */}
                          <div
                            className={`rounded-2xl border p-4 text-sm font-extrabold flex items-center justify-between gap-3 shadow-xs ${
                              selectedAnswer === q.correct_answer
                                ? "bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white text-emerald-900 border-emerald-200"
                                : "bg-gradient-to-r from-rose-50 via-rose-50/50 to-white text-rose-900 border-rose-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {selectedAnswer === q.correct_answer ? (
                                <>
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                                    <CheckCircle2 className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-black text-emerald-950">Shandar! Sahi Jawab 🎉</div>
                                    <div className="text-xs font-semibold text-emerald-700">Option ({q.correct_answer}) is the correct answer.</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
                                    <XCircle className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-black text-rose-950">Galat Jawab!</div>
                                    <div className="text-xs font-semibold text-rose-700">
                                      Aapka Chuna: <b>Option ({selectedAnswer})</b> | Sahi Answer: <b className="text-emerald-700 underline">Option ({q.correct_answer})</b>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <span className="rounded-xl bg-white border border-gray-200/80 px-3 py-1.5 text-xs font-black text-gray-800 shadow-2xs">
                              Ans: ({q.correct_answer})
                            </span>
                          </div>

                          {/* Detailed Solution Box */}
                          {q.explanation && (
                            <div className="overflow-hidden rounded-2xl border border-blue-100/80 bg-blue-50/20 text-sm shadow-xs">
                              <div className="p-4 sm:p-5 text-gray-800 leading-relaxed font-medium space-y-3">
                                {(() => {
                                  const trans = translationsCache[q.id];
                                  const stepsEn = formatSolutionSteps(q.explanation || "");
                                  const stepsHi = formatSolutionSteps(q.explanation_hi || trans?.explanation || "");

                                  if (langMode === "hi" && stepsHi.length > 0) {
                                    return (
                                      <div className="space-y-2">
                                        {stepsHi.map((step, idx) => renderSolutionStep(step, idx))}
                                      </div>
                                    );
                                  }

                                  if (langMode === "bilingual" && stepsHi.length > 0) {
                                    return (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          {stepsEn.map((step, idx) => renderSolutionStep(step, idx))}
                                        </div>
                                        <div className="border-t border-indigo-100 pt-3 bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100/60 space-y-2">
                                          <span className="block text-[11px] font-black uppercase text-indigo-700 tracking-wider">🇮🇳 हिंदी व्याख्या (Hindi Steps):</span>
                                          {stepsHi.map((step, idx) => renderSolutionStep(step, idx))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="space-y-2">
                                      {stepsEn.map((step, idx) => renderSolutionStep(step, idx))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Navigation Actions Bar (Previous & Next Buttons) */}
                      <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                          onClick={prevQuestion}
                          disabled={currentIndex === 0}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs sm:text-sm font-black text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          ⬅ Previous
                        </button>

                        <button
                          onClick={nextQuestion}
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all hover:shadow-lg hover:opacity-95 active:scale-98 cursor-pointer"
                        >
                          {currentIndex < displayQuestions.length - 1 ? (
                            <>Next Question ➔</>
                          ) : (
                            <>See Complete Results 🎉</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HD Zoom Image Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating Top Zoom Controls */}
            <div className="absolute -top-12 right-0 flex items-center gap-1.5 bg-gray-900/95 px-3 py-1.5 rounded-2xl text-white shadow-2xl border border-gray-700">
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(s + 0.25, 3))}
                className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
                <span>+</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(s - 0.25, 0.5))}
                className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
                <span>-</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-2.5 py-1 text-xs font-black rounded-xl bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="ml-1.5 p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* HD Image Viewport */}
            <div className="overflow-auto max-h-[85vh] max-w-[90vw] rounded-2xl bg-white p-3 sm:p-4 shadow-2xl border border-gray-200">
              <img
                src={zoomedImage}
                alt="Zoomed Figure"
                style={{ transform: `scale(${zoomScale})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
                className="max-h-[80vh] w-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      
    </div>
  );
}
