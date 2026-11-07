"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  RefreshCw,
  Search,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Folder,
  Sparkles,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import MathText from "@/components/MathText";
import ReportButton from "@/components/ReportButton";
import { supabase } from "@/lib/supabase";
import { getUserCollectedQuestions, removeCollectedQuestion } from "@/lib/user-attempts-store";

type BookmarkRecord = {
  id: number;
  question_id: number;
  tag?: string | null;
  created_at: string;
};

type Question = {
  id: number;
  topic_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  image_url?: string | null;
  exam_tag?: string | null;
  tier_level?: string | null;
};

type Topic = {
  id: number;
  title: string;
  slug?: string | null;
  subject_id: number;
};

type Subject = {
  id: number;
  title: string;
};

type SavedQuestion = Question & {
  bookmarkId: number;
  tag: string;
  topic: Topic | null;
  subject: Subject | null;
};

const optionKeys = ["A", "B", "C", "D"] as const;

const TAG_PRESETS = [
  { label: "📌 Standard", value: "Standard", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "🔥 High Priority", value: "High Priority", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "⚠️ Tricky / Hard", value: "Tricky", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "📐 Formula / Concept", value: "Formula", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

function formatSolutionSteps(rawText: string): string[] {
  if (!rawText) return [];
  
  let text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

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

export default function BookmarksPage() {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string>("All");
  const [reloadKey, setReloadKey] = useState(0);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Self-Test interactive state: questionId -> selectedOption
  const [userSelections, setUserSelections] = useState<Record<number, string>>({});
  // Explicitly revealed solutions: questionId -> boolean
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  // Master toggle: show all solutions
  const [globalShowSolutions, setGlobalShowSolutions] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadSavedQuestions() {
      let failed = false;
      setStatus("loading");

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: bookmarks, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("id, question_id, tag, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        let nextSavedQuestions: SavedQuestion[] = [];

        if (bookmarks && bookmarks.length > 0) {
          const questionIds = bookmarks.map((b: BookmarkRecord) => b.question_id);
          const { data: questions, error: questionsError } = await supabase
            .from("questions")
            .select("*")
            .in("id", questionIds);

          if (!questionsError && questions) {
            const topicIds = Array.from(new Set(questions.map((q: Question) => q.topic_id)));
            const { data: topics } = topicIds.length
              ? await supabase.from("topics").select("id, title, slug, subject_id").in("id", topicIds)
              : { data: [] };

            const subjectIds = Array.from(new Set((topics || []).map((t: Topic) => t.subject_id)));
            const { data: subjects } = subjectIds.length
              ? await supabase.from("subjects").select("id, title").in("id", subjectIds)
              : { data: [] };

            const questionById = new Map(questions.map((q: Question) => [q.id, q]));
            const topicById = new Map((topics || []).map((t: Topic) => [t.id, t]));
            const subjectById = new Map((subjects || []).map((s: Subject) => [s.id, s]));

            nextSavedQuestions = bookmarks.flatMap((b: BookmarkRecord) => {
              const q = questionById.get(b.question_id);
              if (!q) return [];
              const topic = topicById.get(q.topic_id) || null;
              return [{
                ...q,
                bookmarkId: b.id,
                tag: b.tag || "Standard",
                topic,
                subject: topic ? subjectById.get(topic.subject_id) || null : null,
              }];
            });
          }
        }

        // Merge local collected questions from Speed Tests and Daily Quizzes
        const localCollected = getUserCollectedQuestions();
        const existingTexts = new Set(nextSavedQuestions.map((q) => q.question_text.trim()));

        const localSavedQuestions: SavedQuestion[] = localCollected
          .filter((lc) => !existingTexts.has(lc.question_text.trim()))
          .map((lc, idx) => ({
            id: lc.questionId || (990000 + idx),
            topic_id: 0,
            question_text: lc.question_text,
            option_a: lc.option_a,
            option_b: lc.option_b,
            option_c: lc.option_c,
            option_d: lc.option_d,
            correct_answer: lc.correct_answer,
            explanation: lc.explanation || null,
            image_url: null,
            exam_tag: lc.source === "speed_test" ? "Speed Drill" : lc.source === "daily_quiz" ? "Daily Quiz" : "PYQ",
            tier_level: null,
            bookmarkId: (990000 + idx),
            tag: lc.tag || "Standard",
            topic: { id: 0, title: lc.topic || lc.sourceTitle || "Rapid Drill", subject_id: 0 },
            subject: { id: 0, title: lc.subject || "General" },
          }));

        setSavedQuestions([...nextSavedQuestions, ...localSavedQuestions]);
      } catch {
        failed = true;
        if (!cancelled) {
          setSavedQuestions([]);
        }
      } finally {
        if (!cancelled) setStatus(failed ? "error" : "ready");
      }
    }

    void loadSavedQuestions();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, router]);

  // Filtered by Search & Category Tag
  const filteredQuestions = useMemo(() => {
    let result = savedQuestions;

    if (activeTagFilter !== "All") {
      result = result.filter((q) => q.tag === activeTagFilter);
    }

    const search = searchQuery.trim().toLowerCase();
    if (search) {
      result = result.filter((q) =>
        [q.question_text, q.topic?.title, q.subject?.title, q.exam_tag]
          .filter(Boolean)
          .some((val) => val?.toLowerCase().includes(search))
      );
    }

    return result;
  }, [savedQuestions, activeTagFilter, searchQuery]);

  // Tag Counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { All: savedQuestions.length };
    TAG_PRESETS.forEach((preset) => {
      counts[preset.value] = savedQuestions.filter((q) => q.tag === preset.value).length;
    });
    return counts;
  }, [savedQuestions]);

  async function updateQuestionTag(bookmarkId: number, newTag: string) {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .update({ tag: newTag })
        .eq("id", bookmarkId);

      if (error) throw error;

      setSavedQuestions((prev) =>
        prev.map((q) => (q.bookmarkId === bookmarkId ? { ...q, tag: newTag } : q))
      );

      toast.success(`Moved to ${newTag} category! ✨`);
    } catch {
      toast.error("Failed to update category tag.");
    }
  }

  async function removeSavedQuestion(bookmarkId: number) {
    if (removingId) return;
    setRemovingId(bookmarkId);

    try {
      const q = savedQuestions.find((item) => item.bookmarkId === bookmarkId);
      if (q) {
        removeCollectedQuestion(q.id || q.question_text);
      }
      if (bookmarkId < 990000) {
        await supabase.from("bookmarks").delete().eq("id", bookmarkId);
      }

      setSavedQuestions((current) => current.filter((q) => q.bookmarkId !== bookmarkId));
      toast.success("Removed from saved questions.");
    } catch {
      toast.error("Could not remove question. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  function handleSelectOption(bookmarkId: number, opt: string) {
    setUserSelections((prev) => ({ ...prev, [bookmarkId]: opt }));
    setRevealedSolutions((prev) => ({ ...prev, [bookmarkId]: true }));
  }

  function toggleSolution(bookmarkId: number) {
    setRevealedSolutions((prev) => ({ ...prev, [bookmarkId]: !prev[bookmarkId] }));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 w-full space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800 mb-2">
                <Bookmark className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>Revision &amp; Bookmark Zone</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Saved Practice Questions
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {savedQuestions.length} Questions Saved for Revision &amp; Self-Testing
              </p>
            </div>

            {/* Global Solution Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGlobalShowSolutions((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                  globalShowSolutions
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {globalShowSolutions ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Solutions: Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                    <span>Self-Test Mode (Solutions Hidden)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search & Tag Filter Pills */}
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved questions by text, exam or chapter..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs font-medium text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Custom Category Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-500 font-bold text-[11px] shrink-0">Tags:</span>
              <button
                onClick={() => setActiveTagFilter("All")}
                className={`rounded-xl px-3 py-1 font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeTagFilter === "All"
                    ? "bg-gray-900 text-white shadow-2xs font-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({tagCounts.All || 0})
              </button>

              {TAG_PRESETS.map((preset) => {
                const count = tagCounts[preset.value] || 0;
                const isSelected = activeTagFilter === preset.value;

                return (
                  <button
                    key={preset.value}
                    onClick={() => setActiveTagFilter(preset.value)}
                    className={`rounded-xl px-3 py-1 font-extrabold border transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-black"
                        : `${preset.color} hover:opacity-90`
                    }`}
                  >
                    {preset.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <section className="space-y-4">
          {status === "loading" ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-bold text-gray-500">Loading saved questions...</p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
              <p className="font-bold text-rose-950 text-sm">Saved questions could not be loaded.</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-3 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
              >
                Try again 🔄
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs space-y-2">
              <Bookmark className="mx-auto h-10 w-10 text-gray-300" />
              <h2 className="text-base font-extrabold text-gray-900">
                {savedQuestions.length ? "No matching saved questions found" : "No questions bookmarked yet"}
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {savedQuestions.length
                  ? "Try changing your search keywords or category tag filter."
                  : "Click the Bookmark button 🔖 on any question while practicing to save it here for self-testing."}
              </p>
              {!savedQuestions.length && (
                <Link
                  href="/exams"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Start Practicing Questions ➔
                </Link>
              )}
            </div>
          ) : (
            filteredQuestions.map((question, qIdx) => {
              const userChoice = userSelections[question.bookmarkId];
              const isSolutionOpen = globalShowSolutions || revealedSolutions[question.bookmarkId];
              const isAnswered = userChoice !== undefined;
              const isCorrect = userChoice === question.correct_answer;

              return (
                <article
                  key={question.bookmarkId}
                  className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 transition-all"
                >
                  {/* Card Header: Subject / Topic + Category Tag Selector + Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-blue-700">
                        {question.subject?.title || "Practice"} / {question.topic?.title || "Chapter"}
                      </span>
                      {question.exam_tag && (
                        <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase">
                          🎯 {question.exam_tag}
                        </span>
                      )}
                    </div>

                    {/* Tag Selector Dropdown & Remove Button */}
                    <div className="flex items-center gap-2">
                      <div className="relative inline-flex items-center">
                        <select
                          value={question.tag}
                          onChange={(e) => updateQuestionTag(question.bookmarkId, e.target.value)}
                          className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1 pl-2.5 pr-6 text-[11px] font-bold text-gray-700 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                        >
                          {TAG_PRESETS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-gray-400" />
                      </div>

                      <ReportButton
                        questionId={question.id}
                        questionText={question.question_text}
                        showLabel={true}
                      />

                      <button
                        type="button"
                        onClick={() => removeSavedQuestion(question.bookmarkId)}
                        disabled={removingId === question.bookmarkId}
                        title="Remove bookmark"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className={`h-3.5 w-3.5 ${removingId === question.bookmarkId ? "animate-pulse text-rose-600" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm sm:text-base font-extrabold text-gray-900 leading-relaxed">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-blue-600 text-white text-xs font-black mr-2 shadow-2xs">
                      {qIdx + 1}
                    </span>
                    <MathText text={question.question_text} />

                    {question.image_url && (
                      <div className="mt-3 mb-1">
                        <img
                          src={question.image_url}
                          alt="Question figure"
                          className="max-w-full rounded-xl border border-gray-200/80"
                          style={{ maxHeight: "300px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Options (Interactive Self-Test Mode) */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {optionKeys.map((opt) => {
                      const optText = {
                        A: question.option_a,
                        B: question.option_b,
                        C: question.option_c,
                        D: question.option_d,
                      }[opt];

                      const isOptionCorrect = question.correct_answer === opt;
                      const isOptionSelected = userChoice === opt;

                      let cardStyle = "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/30";
                      let badgeStyle = "bg-gray-100 text-gray-700 border-gray-300";

                      // If answered OR if solution is revealed
                      if (isSolutionOpen || isAnswered) {
                        if (isOptionCorrect) {
                          cardStyle = "border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs";
                          badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                        } else if (isOptionSelected) {
                          cardStyle = "border-2 border-rose-400 bg-rose-50 text-rose-950 font-bold shadow-xs";
                          badgeStyle = "bg-rose-500 text-white border-rose-500";
                        } else {
                          cardStyle = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60";
                          badgeStyle = "bg-gray-100 text-gray-400 border-gray-200";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(question.bookmarkId, opt)}
                          className={`flex items-center rounded-xl border p-3 text-left transition-all cursor-pointer ${cardStyle}`}
                        >
                          <span className={`mr-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${badgeStyle}`}>
                            {opt}
                          </span>
                          <span className="flex-1 text-xs sm:text-sm">
                            <MathText text={optText} />
                          </span>

                          {(isSolutionOpen || isAnswered) && isOptionCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-1.5" />
                          )}
                          {(isSolutionOpen || isAnswered) && isOptionSelected && !isOptionCorrect && (
                            <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions Row: Toggle Solution & Practice Chapter */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleSolution(question.bookmarkId)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-1.5 text-xs font-extrabold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      {isSolutionOpen ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                          <span>Hide Solution</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-blue-600" />
                          <span>💡 Show Answer &amp; Solution</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/practice/${question.topic?.slug || question.topic_id}`}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800"
                    >
                      <span>Practice Full Chapter</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Solution Box (Shown When Toggled or Answered) */}
                  {isSolutionOpen && question.explanation && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/30 p-4 text-xs sm:text-sm text-gray-800 space-y-2 animate-fadeIn">
                      <p className="font-extrabold text-blue-900 flex items-center justify-between border-b border-blue-100 pb-1.5">
                        <span>💡 Detailed Solution</span>
                        <span className="rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[11px] font-black">
                          Correct Answer: Option ({question.correct_answer})
                        </span>
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {formatSolutionSteps(question.explanation).map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-gray-800 leading-relaxed">
                            <span className="text-blue-600 font-bold">•</span>
                            <div className="flex-1"><MathText text={step} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* Footer */}
      
    </div>
  );
}
