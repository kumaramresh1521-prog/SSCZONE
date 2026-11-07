"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Brain,
  Calculator,
  Globe,
  Layers,
  Flag,
  Check,
  Languages,
  ChevronRight,
  HelpCircle,
  Home,
  Award,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Share2,
  Eye,
  Menu,
  X,
  Flame,
  CheckSquare,
} from "lucide-react";
import MathText from "@/components/MathText";
import AdBanner from "@/components/AdBanner";
import ReportButton from "@/components/ReportButton";
import CollectQuestionButton from "@/components/CollectQuestionButton";
import { saveUserAttempt } from "@/lib/user-attempts-store";
import { translateSingleQuestion } from "@/lib/translator";
import { promptGuestLoginGate } from "@/components/GuestSessionGateModal";
import type { DailyQuiz, DailyQuizQuestion } from "@/lib/daily-quiz-store";

// Audio chime using Web Audio API (Zero external dependencies)
function playChime(type: "tick" | "warning" | "finish" | "select") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "tick") {
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "warning") {
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "select") {
      osc.frequency.setValueAtTime(580, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "finish") {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Graceful fallback
  }
}

// Subject styling configuration
const SUBJECT_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string; text: string }
> = {
  all: {
    label: "All Subjects",
    icon: Layers,
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  quant: {
    label: "Quantitative Aptitude",
    icon: Calculator,
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  reasoning: {
    label: "Reasoning & Logic",
    icon: Brain,
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
  },
  english: {
    label: "English Language",
    icon: BookOpen,
    color: "sky",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
  },
  ga: {
    label: "General Awareness",
    icon: Globe,
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  mixed: {
    label: "Mixed Full Mock",
    icon: Sparkles,
    color: "indigo",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
  },
};

export default function DailyQuizClient() {
  // ── Browse state ──
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // ── Active Quiz / CBT State ──
  const [activeQuiz, setActiveQuiz] = useState<DailyQuiz | null>(null);
  const [quizState, setQuizState] = useState<"browse" | "loading_quiz" | "testing" | "submitted">("browse");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // ── Language & Translation State ──
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [translating, setTranslating] = useState<boolean>(false);
  const [translations, setTranslations] = useState<
    Record<
      string,
      {
        question_text?: string;
        option_a?: string;
        option_b?: string;
        option_c?: string;
        option_d?: string;
        explanation?: string;
      }
    >
  >({});

  // ── Results Filter State ──
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

  // ── Load Quizzes List on Mount ──
  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      const res = await fetch("/api/daily-quiz");
      const data = await res.json();
      if (data.success && Array.isArray(data.quizzes)) {
        setQuizzes(data.quizzes);
      }
    } catch (e) {
      console.error("Failed to fetch daily quizzes:", e);
    } finally {
      setLoading(false);
    }
  }

  // ── Filtered Quizzes ──
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (selectedSubject !== "all" && q.subject_key !== selectedSubject) return false;
      if (dateFilter !== "all" && q.date !== dateFilter) return false;
      if (searchQuery.trim()) {
        const qMatch =
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.target_exam.toLowerCase().includes(searchQuery.toLowerCase());
        if (!qMatch) return false;
      }
      return true;
    });
  }, [quizzes, selectedSubject, dateFilter, searchQuery]);

  // Unique dates for filter dropdown
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(quizzes.map((q) => q.date))).sort().reverse();
    return dates;
  }, [quizzes]);

  // ── Start a Quiz ──
  async function handleStartQuiz(quizId: string) {
    if (promptGuestLoginGate("Your 15-minute free guest preview has completed. Please login or create a free account to attempt this Daily Free Quiz.")) {
      return;
    }
    try {
      setQuizState("loading_quiz");
      const res = await fetch(`/api/daily-quiz/${quizId}`);
      const data = await res.json();

      if (data.success && data.quiz && data.quiz.questions?.length > 0) {
        const fullQuiz: DailyQuiz = data.quiz;
        setActiveQuiz(fullQuiz);
        setCurrentIndex(0);
        setUserAnswers({});
        setMarkedForReview({});
        setVisited({ [fullQuiz.questions[0].id]: true });
        setTimeLeft(fullQuiz.duration_minutes * 60);
        setTimeSpent(0);
        setLanguage("en");
        setTranslations({});
        setReviewFilter("all");
        setQuizState("testing");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("This quiz doesn't have any questions yet. Please try another one!");
        setQuizState("browse");
      }
    } catch (e) {
      console.error("Failed to load quiz details:", e);
      alert("Failed to load quiz. Please check your connection and retry.");
      setQuizState("browse");
    }
  }

  // ── Timer Effect ──
  useEffect(() => {
    if (quizState !== "testing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        if (prev === 60) {
          playChime("warning");
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState]);

  // Format Time Helper
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Current Question
  const currentQuestion: DailyQuizQuestion | undefined = useMemo(() => {
    if (!activeQuiz || !activeQuiz.questions) return undefined;
    return activeQuiz.questions[currentIndex];
  }, [activeQuiz, currentIndex]);

  // Mark visited when index changes
  useEffect(() => {
    if (currentQuestion) {
      setVisited((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [currentQuestion]);

  // ── Keyboard Shortcuts (1-4 or A-D, Left/Right Arrows) ──
  useEffect(() => {
    if (quizState !== "testing" || !currentQuestion) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      if (["1", "A"].includes(key)) handleSelectAnswer("A");
      else if (["2", "B"].includes(key)) handleSelectAnswer("B");
      else if (["3", "C"].includes(key)) handleSelectAnswer("C");
      else if (["4", "D"].includes(key)) handleSelectAnswer("D");
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quizState, currentQuestion, currentIndex, activeQuiz]);

  // Answer Selection
  function handleSelectAnswer(option: "A" | "B" | "C" | "D") {
    if (!currentQuestion) return;
    playChime("select");
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  }

  function handleClearAnswer() {
    if (!currentQuestion) return;
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  }

  function handleToggleReview() {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  }

  function handleNext() {
    if (!activeQuiz) return;
    if (currentIndex < activeQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  function handleJumpTo(index: number) {
    if (!activeQuiz || index < 0 || index >= activeQuiz.questions.length) return;
    setCurrentIndex(index);
    setPaletteOpen(false);
  }

  // ── On-demand Hindi Translation ──
  const toggleHindiTranslation = useCallback(async () => {
    if (!currentQuestion || !activeQuiz) return;

    if (language === "hi") {
      setLanguage("en");
      return;
    }

    // Check if already cached
    if (translations[currentQuestion.id]) {
      setLanguage("hi");
      return;
    }

    // If question already has stored hindi in question_text_hi
    if (currentQuestion.question_text_hi) {
      setTranslations((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          question_text: currentQuestion.question_text_hi,
        },
      }));
      setLanguage("hi");
      return;
    }

    // Call high-reliability translator engine
    try {
      setTranslating(true);
      const isQuant = activeQuiz.subject_key === "quant";
      const isEnglish = activeQuiz.subject_key === "english";

      if (isEnglish) {
        alert("Note: English Language questions are maintained in English as per SSC exam standards.");
        return;
      }

      const res = await translateSingleQuestion(
        {
          question_text: currentQuestion.question_text,
          option_a: currentQuestion.option_a,
          option_b: currentQuestion.option_b,
          option_c: currentQuestion.option_c,
          option_d: currentQuestion.option_d,
          explanation: currentQuestion.explanation,
        },
        isQuant
      );

      setTranslations((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          question_text: res.question_text,
          option_a: res.option_a,
          option_b: res.option_b,
          option_c: res.option_c,
          option_d: res.option_d,
          explanation: res.explanation,
        },
      }));
      setLanguage("hi");
    } catch (e) {
      console.error("Translation error:", e);
      alert("Translation failed. Showing English version.");
    } finally {
      setTranslating(false);
    }
  }, [currentQuestion, activeQuiz, language, translations]);

  // Current display text (English or translated Hindi)
  const displayQuestion = useMemo(() => {
    if (!currentQuestion) return { text: "", optA: "", optB: "", optC: "", optD: "" };
    if (language === "hi" && translations[currentQuestion.id]) {
      const trans = translations[currentQuestion.id];
      return {
        text: trans.question_text || currentQuestion.question_text,
        optA: trans.option_a || currentQuestion.option_a,
        optB: trans.option_b || currentQuestion.option_b,
        optC: trans.option_c || currentQuestion.option_c,
        optD: trans.option_d || currentQuestion.option_d,
      };
    }
    return {
      text: currentQuestion.question_text,
      optA: currentQuestion.option_a,
      optB: currentQuestion.option_b,
      optC: currentQuestion.option_c,
      optD: currentQuestion.option_d,
    };
  }, [currentQuestion, language, translations]);

  // ── Quiz Submission & Score Calculation ──
  function handleSubmitQuiz() {
    setShowSubmitConfirm(false);
    playChime("finish");
    setQuizState("submitted");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (activeQuiz && activeQuiz.questions) {
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      activeQuiz.questions.forEach((q) => {
        const ans = userAnswers[q.id];
        if (!ans) unattempted++;
        else if (ans.toUpperCase() === q.correct_answer.toUpperCase()) correct++;
        else incorrect++;
      });
      const score = Number((correct * 2.0 - incorrect * 0.5).toFixed(2));
      const maxScore = activeQuiz.questions.length * 2;
      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      saveUserAttempt({
        type: "daily_quiz",
        title: activeQuiz.title,
        subject: activeQuiz.subject,
        targetExam: activeQuiz.target_exam,
        totalQuestions: activeQuiz.questions.length,
        attempted,
        correct,
        incorrect,
        unattempted,
        score,
        maxScore,
        accuracy,
        timeSpentSeconds: timeSpent,
      });
    }
  }

  // Result Metrics Calculation (+2 for correct, -0.5 for incorrect)
  const resultStats = useMemo(() => {
    if (!activeQuiz || !activeQuiz.questions) {
      return { total: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0, maxScore: 0, accuracy: 0 };
    }

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    activeQuiz.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans) {
        unattempted++;
      } else if (ans.toUpperCase() === q.correct_answer.toUpperCase()) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const score = Number((correct * 2.0 - incorrect * 0.5).toFixed(2));
    const maxScore = activeQuiz.questions.length * 2;
    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return {
      total: activeQuiz.questions.length,
      correct,
      incorrect,
      unattempted,
      score,
      maxScore,
      accuracy,
    };
  }, [activeQuiz, userAnswers]);

  // ── Review Filtered Questions ──
  const reviewQuestions = useMemo(() => {
    if (!activeQuiz || !activeQuiz.questions) return [];
    return activeQuiz.questions.filter((q) => {
      const ans = userAnswers[q.id];
      const isCorrect = ans && ans.toUpperCase() === q.correct_answer.toUpperCase();
      if (reviewFilter === "correct") return isCorrect;
      if (reviewFilter === "incorrect") return ans && !isCorrect;
      if (reviewFilter === "unattempted") return !ans;
      return true;
    });
  }, [activeQuiz, userAnswers, reviewFilter]);

  // Helper to get numeric question ID for ReportButton
  function getNumericId(qId: string, index: number): number {
    const digits = qId.replace(/\D/g, "");
    if (digits.length > 0) return parseInt(digits, 10);
    return 900000 + index;
  }

  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================
  if (quizState === "loading_quiz") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center mb-4 animate-bounce">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Preparing Your Daily Free Quiz...</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Loading questions, LaTeX mathematical formulas, and options.
        </p>
        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TESTING HALL (CBT EXAM INTERFACE)
  // ==========================================
  if (quizState === "testing" && activeQuiz && currentQuestion) {
    const answeredCount = Object.keys(userAnswers).length;
    const isMarked = !!markedForReview[currentQuestion.id];
    const currentSelectedOption = userAnswers[currentQuestion.id];

    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full max-w-full bg-slate-100 text-slate-800 flex flex-col select-none overflow-hidden">
        {/* TOP BAR / EXAM HEADER (Fixed at top) */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-3 py-2 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
            {/* Title & Subject */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Zap className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {activeQuiz.title}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-blue-700">{activeQuiz.subject}</span>
                  <span>•</span>
                  <span className="truncate">{activeQuiz.target_exam}</span>
                </div>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* CBT Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs sm:text-sm font-bold shadow-2xs transition-colors ${
                  timeLeft <= 120
                    ? "bg-red-50 border border-red-300 text-red-600 animate-pulse"
                    : "bg-slate-100 border border-slate-200 text-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {/* Translation Button */}
              {activeQuiz.subject_key !== "english" && (
                <button
                  type="button"
                  onClick={toggleHindiTranslation}
                  disabled={translating}
                  title="Translate Question into Hindi"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    language === "hi"
                      ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {translating ? "Translating..." : language === "hi" ? "English" : "हिन्दी"}
                  </span>
                </button>
              )}

              {/* Palette Toggle (Mobile) */}
              <button
                type="button"
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="lg:hidden p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                title="Question Palette"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN TESTING WORKSPACE (Fits 100% in viewport without outer scrolling) */}
        <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-4 gap-3 overflow-y-auto">
          {/* QUESTION AREA (3 COLS) */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            {/* Unified Question Card with snug fit - Action Bar directly below options */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
              {/* Question Header & Flag Report (Fixed at top of card) */}
              <div className="shrink-0 px-4 py-2 sm:px-6 sm:py-2.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black shrink-0">
                    Question {currentIndex + 1} of {activeQuiz.questions.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Marks: <span className="text-emerald-600 font-bold">+2.00</span> |{" "}
                    <span className="text-red-600 font-bold">-0.50</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <CollectQuestionButton
                    question={{
                      questionId: getNumericId(currentQuestion.id, currentIndex),
                      question_text: currentQuestion.question_text,
                      question_text_hi: currentQuestion.question_text_hi,
                      option_a: currentQuestion.option_a,
                      option_b: currentQuestion.option_b,
                      option_c: currentQuestion.option_c,
                      option_d: currentQuestion.option_d,
                      correct_answer: currentQuestion.correct_answer,
                      explanation: currentQuestion.explanation,
                      subject: activeQuiz.subject,
                      source: "daily_quiz",
                      sourceTitle: activeQuiz.title,
                    }}
                    showLabel
                  />
                  {/* Flag / Report Question Button */}
                  <ReportButton
                    questionId={getNumericId(currentQuestion.id, currentIndex)}
                    questionText={currentQuestion.question_text}
                    showLabel
                  />
                </div>
              </div>

              {/* Question Body: Snug fit with max height cap (Scrolls ONLY if question is very long) */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3.5 max-h-[calc(100dvh-13rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full select-text">
                {/* Question Statement with KaTeX support */}
                <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-semibold">
                  <MathText text={displayQuestion.text} />
                </div>

                {/* Options List (Compact cards with zero awkward spacing) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(
                    [
                      { key: "A", text: displayQuestion.optA },
                      { key: "B", text: displayQuestion.optB },
                      { key: "C", text: displayQuestion.optC },
                      { key: "D", text: displayQuestion.optD },
                    ] as const
                  ).map((opt) => {
                    const isSelected = currentSelectedOption === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectAnswer(opt.key)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-semibold shadow-2xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-slate-100 border border-slate-200 text-slate-700"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div className="flex-1 text-xs sm:text-sm pt-0.5 leading-snug">
                          <MathText text={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Navigation Controls (PERMANENTLY PINNED AT BOTTOM - NEVER REQUIRES SCROLLING) */}
              <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleReview}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isMarked
                        ? "bg-purple-100 border-purple-300 text-purple-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isMarked ? "★ Marked" : "Mark for Review"}
                  </button>

                  {currentSelectedOption && (
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Clear Response
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === activeQuiz.questions.length - 1}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Save & Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTION PALETTE (1 COL - Fixed sidebar on desktop, drawer on mobile) */}
          <div
            className={`fixed lg:static inset-y-0 right-0 z-40 w-72 lg:w-auto bg-white lg:bg-transparent shadow-xl lg:shadow-none border-l lg:border-l-0 border-slate-200 p-3 lg:p-0 transform transition-transform duration-200 min-h-0 h-full overflow-hidden ${
              paletteOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
              <div className="shrink-0 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Question Palette
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    {answeredCount}/{activeQuiz.questions.length} Done
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(false)}
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Summary */}
              <div className="p-3.5 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Answered: {answeredCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span>
                  <span>Left: {activeQuiz.questions.length - answeredCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span>Marked: {Object.keys(markedForReview).filter((k) => markedForReview[k]).length}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>Current: Q{currentIndex + 1}</span>
                </div>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1 mb-4">
                {activeQuiz.questions.map((q, idx) => {
                  const hasAns = !!userAnswers[q.id];
                  const isRev = !!markedForReview[q.id];
                  const isCurr = idx === currentIndex;

                  let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                  if (hasAns && isRev) {
                    btnStyle = "bg-purple-600 border-purple-700 text-white font-bold ring-2 ring-purple-200";
                  } else if (hasAns) {
                    btnStyle = "bg-emerald-600 border-emerald-700 text-white font-bold";
                  } else if (isRev) {
                    btnStyle = "bg-purple-100 border-purple-400 text-purple-800 font-bold";
                  } else if (visited[q.id]) {
                    btnStyle = "bg-amber-50 border-amber-300 text-amber-800";
                  }

                  if (isCurr) {
                    btnStyle += " ring-2 ring-blue-500 ring-offset-1";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpTo(idx)}
                      className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side Ad */}
            <div className="shrink-0 pt-2 border-t border-slate-100">
              <AdBanner slot="daily-quiz-side-palette" />
            </div>
          </div>
        </div>
      </div>

        {/* SUBMIT CONFIRMATION MODAL */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Daily Free Quiz?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Are you sure you want to end this test and view your detailed scorecard and solutions?
              </p>

              <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Questions:</span>
                  <span className="font-bold text-slate-800">{activeQuiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Attempted:</span>
                  <span className="font-bold text-emerald-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unattempted:</span>
                  <span className="font-bold text-slate-500">{activeQuiz.questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time Left:</span>
                  <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back to Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: SUBMITTED / RESULTS & SOLUTIONS
  // ==========================================
  if (quizState === "submitted" && activeQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900">Quiz Scorecard & Solutions</h1>
                <p className="text-xs text-slate-500">{activeQuiz.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuizState("browse")}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>All Quizzes</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartQuiz(activeQuiz.id)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          {/* TOP AD BANNER */}
          <AdBanner slot="daily-quiz-results-top" className="mb-6" />

          {/* SCORECARD HERO */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Score Big Display */}
              <div className="md:col-span-1 text-center border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
                <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 mb-2">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {resultStats.score}{" "}
                  <span className="text-base font-medium text-slate-400">/ {resultStats.maxScore}</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Final Marks</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {resultStats.score >= resultStats.maxScore * 0.7
                    ? "🌟 Excellent Performance"
                    : resultStats.score >= resultStats.maxScore * 0.4
                    ? "👍 Good Attempt"
                    : "⚡ Needs Revision"}
                </span>
              </div>

              {/* Stats Highlights */}
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Accuracy */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Accuracy
                  </div>
                  <div className="text-xl font-bold text-slate-900">{resultStats.accuracy}%</div>
                  <span className="text-[11px] text-slate-400">Overall Precision</span>
                </div>

                {/* Correct */}
                <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Correct
                  </div>
                  <div className="text-xl font-bold text-emerald-700">{resultStats.correct}</div>
                  <span className="text-[11px] text-emerald-600/80">+{resultStats.correct * 2} Marks</span>
                </div>

                {/* Incorrect */}
                <div className="bg-red-50/60 rounded-xl p-3.5 border border-red-100">
                  <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold mb-1">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    Incorrect
                  </div>
                  <div className="text-xl font-bold text-red-700">{resultStats.incorrect}</div>
                  <span className="text-[11px] text-red-600/80">-{resultStats.incorrect * 0.5} Negative</span>
                </div>

                {/* Time Taken */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    Time Taken
                  </div>
                  <div className="text-xl font-bold text-slate-900">{formatTime(timeSpent)}</div>
                  <span className="text-[11px] text-slate-400">
                    of {activeQuiz.duration_minutes}m total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED SOLUTIONS REVIEW */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Step-by-Step Solutions Review
              </h2>
              <p className="text-xs text-slate-500">
                Verify correct answers, read in-depth math steps and formula breakdowns.
              </p>
            </div>

            {/* Filter Tabs for Review */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reviewFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                }`}
              >
                All ({activeQuiz.questions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("correct")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reviewFilter === "correct"
                    ? "bg-emerald-600 text-white shadow-2xs font-bold"
                    : "text-emerald-700"
                }`}
              >
                Correct ({resultStats.correct})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("incorrect")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reviewFilter === "incorrect" ? "bg-red-600 text-white shadow-2xs font-bold" : "text-red-700"
                }`}
              >
                Incorrect ({resultStats.incorrect})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("unattempted")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reviewFilter === "unattempted"
                    ? "bg-slate-700 text-white shadow-2xs font-bold"
                    : "text-slate-600"
                }`}
              >
                Left ({resultStats.unattempted})
              </button>
            </div>
          </div>

          {/* SOLUTIONS LIST */}
          <div className="space-y-4">
            {reviewQuestions.map((q, qIdx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns && userAns.toUpperCase() === q.correct_answer.toUpperCase();
              const isUnattempted = !userAns;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                        Q{qIdx + 1}
                      </span>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2.00)
                        </span>
                      )}
                      {!isCorrect && !isUnattempted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (-0.50)
                        </span>
                      )}
                      {isUnattempted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Not Attempted (0.00)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <CollectQuestionButton
                        question={{
                          questionId: getNumericId(q.id, qIdx),
                          question_text: q.question_text,
                          question_text_hi: q.question_text_hi,
                          option_a: q.option_a,
                          option_b: q.option_b,
                          option_c: q.option_c,
                          option_d: q.option_d,
                          correct_answer: q.correct_answer,
                          explanation: q.explanation,
                          subject: activeQuiz.subject,
                          source: "daily_quiz",
                          sourceTitle: activeQuiz.title,
                        }}
                        showLabel
                      />
                      {/* Report Button on review questions */}
                      <ReportButton
                        questionId={getNumericId(q.id, qIdx)}
                        questionText={q.question_text}
                        showLabel
                      />
                    </div>
                  </div>

                  {/* Question statement */}
                  <div className="text-base text-slate-900 font-medium mb-4 leading-relaxed">
                    <MathText text={q.question_text} />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {(
                      [
                        { key: "A", text: q.option_a },
                        { key: "B", text: q.option_b },
                        { key: "C", text: q.option_c },
                        { key: "D", text: q.option_d },
                      ] as const
                    ).map((opt) => {
                      const isOptionCorrect = q.correct_answer.toUpperCase() === opt.key;
                      const isOptionUserChosen = userAns === opt.key;

                      let optClass = "bg-slate-50 border-slate-200 text-slate-700";
                      if (isOptionCorrect) {
                        optClass = "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-300";
                      } else if (isOptionUserChosen && !isOptionCorrect) {
                        optClass = "bg-red-50 border-red-300 text-red-900 font-semibold line-through";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${optClass}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isOptionCorrect
                                ? "bg-emerald-600 text-white"
                                : isOptionUserChosen
                                ? "bg-red-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1 pt-0.5">
                            <MathText text={opt.text} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  {q.explanation && (
                    <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs sm:text-sm text-slate-800">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Explanation & Calculation Steps:
                      </div>
                      <div className="leading-relaxed">
                        <MathText text={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM AD BANNER */}
          <AdBanner slot="daily-quiz-results-bottom" className="mt-8" />
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: BROWSE / DIRECTORY MODE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200/80 px-4 py-2.5 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">Practice</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Daily Free Quiz</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* HEADER HERO BANNER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 mb-6 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>100% Free Daily Drills • Updated Every Single Day</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Daily Free Quiz Challenge
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Subject-wise 10-15 minute speed booster quizzes for SSC CGL, CHSL, MTS, CPO & GD exams.
              Sharpen your speed, accuracy, and negative-marking control with detailed KaTeX solutions.
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>+2 / -0.5 SSC Marking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-blue-600" />
                <span>Hindi & English Translation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Step-by-Step KaTeX Math</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP AD BANNER */}
        <AdBanner slot="daily-quiz-browse-top" className="mb-6" />

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 mb-6 space-y-3">
          {/* Search & Date Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quiz by subject, topic or target exam..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 bg-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Dates ({quizzes.length})</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    Date: {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { key: "all", label: "All Subjects" },
                { key: "quant", label: "Quantitative Aptitude" },
                { key: "reasoning", label: "Reasoning" },
                { key: "english", label: "English" },
                { key: "ga", label: "General Awareness" },
                { key: "mixed", label: "Mixed Mock" },
              ] as const
            ).map((sub) => {
              const isSelected = selectedSubject === sub.key;
              return (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => setSelectedSubject(sub.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs font-bold"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUIZZES LIST */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-full pt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Daily Quizzes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try changing the subject filter or date filter above, or check back soon for new quizzes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubject("all");
                setDateFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.map((quiz) => {
              const cfg = SUBJECT_CONFIG[quiz.subject_key] || SUBJECT_CONFIG.mixed;
              const Icon = cfg.icon;

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{quiz.subject}</span>
                      </span>

                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {quiz.date}
                      </span>
                    </div>

                    {/* Quiz Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>

                    {/* Target Exam */}
                    <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{quiz.target_exam}</span>
                    </p>

                    {/* Quiz Spec Badges */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center mb-5">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{quiz.total_questions}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Questions</div>
                      </div>
                      <div className="border-x border-slate-200/80">
                        <div className="text-xs font-bold text-slate-800">{quiz.duration_minutes}m</div>
                        <div className="text-[10px] text-slate-500 font-medium">Time Limit</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{quiz.total_questions * 2}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Marks</div>
                      </div>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    type="button"
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group-hover:bg-blue-700"
                  >
                    <span>Start Daily Drill</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM AD BANNER */}
        <AdBanner slot="daily-quiz-browse-bottom" className="mt-8 mb-8" />

        {/* STUDY TIPS / PRACTICE GUIDELINES */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            How SSC Daily Free Quizzes Boost Your Score
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-800 mb-1">⏱️ Timed Pressure Practice</div>
              <p className="leading-relaxed">
                Exam-identical 10-15 minute CBT timers train your brain to quickly identify easy vs tricky
                questions and avoid getting stuck on time sinks.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-800 mb-1">🎯 Negative-Marking Control</div>
              <p className="leading-relaxed">
                Strict +2.00 / -0.50 SSC CGL marking simulates actual negative scoring so you develop the
                discipline of skipping low-probability guesses.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-800 mb-1">🌐 Bilingual & Step Solutions</div>
              <p className="leading-relaxed">
                Instant detailed mathematical steps with KaTeX formulas and high-fidelity Hindi translation
                ensure 100% doubt clearance immediately after finishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
