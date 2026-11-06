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
  Volume2,
  VolumeX,
  Languages,
  Sliders,
  ChevronRight,
  HelpCircle,
  Home,
  Award,
  Info,
} from "lucide-react";
import MathText from "@/components/MathText";
import AdBanner from "@/components/AdBanner";
import ReportButton from "@/components/ReportButton";
import { translateSingleQuestion } from "@/lib/translator";

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
    // Ignore audio errors gracefully
  }
}

// Cleanly splits concatenated bilingual text in PYQ papers
function splitBilingual(text?: string | null): { english: string; hindi: string | null } {
  if (!text) return { english: "", hindi: null };
  const trimmed = text.trim();

  // If text contains a slash separator like "Chile / चिली"
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 2 && /[\u0900-\u097F]/.test(parts[1])) {
      return { english: parts[0].trim(), hindi: parts[1].trim() };
    }
  }

  // Find where Devanagari Hindi characters start
  const match = trimmed.search(/[\u0900-\u097F]/);
  if (match > 0) {
    return {
      english: trimmed.slice(0, match).trim(),
      hindi: trimmed.slice(match).trim(),
    };
  }

  // Pure Hindi text
  if (match === 0) {
    return { english: trimmed, hindi: trimmed };
  }

  // Pure English text
  return { english: trimmed, hindi: null };
}

interface NormalizedSpeedQuestion {
  id: string;
  originalId: number;
  source: "pyq" | "bank";
  subject: string;
  subjectKey: "quant" | "reasoning" | "english" | "ga";
  topic?: string;
  question_text: string;
  question_text_hi?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_hi?: string | null;
  option_b_hi?: string | null;
  option_c_hi?: string | null;
  option_d_hi?: string | null;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string | null;
  explanation_hi?: string | null;
  image_url?: string | null;
  option_a_image_url?: string | null;
  option_b_image_url?: string | null;
  option_c_image_url?: string | null;
  option_d_image_url?: string | null;
  paper_id?: number;
  question_number?: number;
}

interface TopicItem {
  id: number;
  title: string;
  subject_id: number;
  subject_key: "quant" | "reasoning" | "english" | "ga";
}

export default function SpeedTestClient() {
  // Page Phase: "setup" | "testing" | "results"
  const [phase, setPhase] = useState<"setup" | "testing" | "results">("setup");

  // Config loaded from /api/speed-test/config
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [stats, setStats] = useState({ totalQuestions: 12212, totalPyqs: 5000, totalBank: 7212 });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Setup Options (Clean English by default)
  const [selectedMode, setSelectedMode] = useState<"random" | "subject" | "topic">("random");
  const [selectedSubject, setSelectedSubject] = useState<"all" | "quant" | "reasoning" | "english" | "ga">("all");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(25); // Default 25 questions
  const [timerType, setTimerType] = useState<"sectional" | "blitz">("sectional");
  const [durationMinutes, setDurationMinutes] = useState<number>(15); // Default 15 minutes
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dedicated Hindi Translator State
  const [isHindiActive, setIsHindiActive] = useState(false);
  const [translationsCache, setTranslationsCache] = useState<Record<string, any>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Live Testing State
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<NormalizedSpeedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timers
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(15 * 60);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(20);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const qStartTimeRef = useRef<number>(Date.now());

  // Solution review in results
  const [showSolutions, setShowSolutions] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");

  // Fetch initial config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/speed-test/config");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          if (data.stats) setStats(data.stats);
          if (data.topics && data.topics.length > 0) {
            setSelectedTopicId(data.topics[0].id);
          }
        }
      } catch (err) {
        console.error("Config fetch error:", err);
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchConfig();
  }, []);

  // Filter topics for topic selector
  const filteredTopics = useMemo(() => {
    let list = topics;
    if (selectedSubject !== "all") {
      list = list.filter((t) => t.subject_key === selectedSubject);
    }
    if (topicSearchQuery.trim()) {
      const q = topicSearchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return list;
  }, [topics, selectedSubject, topicSearchQuery]);

  // Current question helper
  const currentQ = questions[currentIndex] || null;

  // Split question content cleanly between English & Hindi
  const activeQuestionContent = useMemo(() => {
    if (!currentQ) return null;

    const isEngSection = currentQ.subjectKey === "english";

    // Split source question text
    const qSplit = splitBilingual(currentQ.question_text);
    const optASplit = splitBilingual(currentQ.option_a);
    const optBSplit = splitBilingual(currentQ.option_b);
    const optCSplit = splitBilingual(currentQ.option_c);
    const optDSplit = splitBilingual(currentQ.option_d);

    // If Hindi Translator is enabled and not English section:
    if (isHindiActive && !isEngSection) {
      // 1. Check if translated cache exists
      const cached = translationsCache[currentQ.id];
      if (cached) {
        return {
          questionText: cached.question_text || qSplit.english,
          optionA: cached.option_a || optASplit.english,
          optionB: cached.option_b || optBSplit.english,
          optionC: cached.option_c || optCSplit.english,
          optionD: cached.option_d || optDSplit.english,
          explanation: cached.explanation || currentQ.explanation_hi || currentQ.explanation || null,
          isHindi: true,
        };
      }

      // 2. If native Hindi is already in DB or extracted from PYQ
      const nativeHindiQ = currentQ.question_text_hi || qSplit.hindi;
      if (nativeHindiQ) {
        return {
          questionText: nativeHindiQ,
          optionA: currentQ.option_a_hi || optASplit.hindi || optASplit.english,
          optionB: currentQ.option_b_hi || optBSplit.hindi || optBSplit.english,
          optionC: currentQ.option_c_hi || optCSplit.hindi || optCSplit.english,
          optionD: currentQ.option_d_hi || optDSplit.hindi || optDSplit.english,
          explanation: currentQ.explanation_hi || currentQ.explanation || null,
          isHindi: true,
        };
      }
    }

    // Default: Clean official English
    return {
      questionText: qSplit.english,
      optionA: optASplit.english,
      optionB: optBSplit.english,
      optionC: optCSplit.english,
      optionD: optDSplit.english,
      explanation: currentQ.explanation || null,
      isHindi: false,
    };
  }, [currentQ, isHindiActive, translationsCache]);

  // On-demand Hindi Translation Engine
  const handleToggleHindi = async () => {
    if (!currentQ) return;
    const nextState = !isHindiActive;
    setIsHindiActive(nextState);

    // If switching to Hindi and translation is not yet cached and not English section:
    if (nextState && currentQ.subjectKey !== "english") {
      const qSplit = splitBilingual(currentQ.question_text);
      if (!currentQ.question_text_hi && !qSplit.hindi && !translationsCache[currentQ.id]) {
        setIsTranslating(true);
        try {
          const trans = await translateSingleQuestion(
            {
              id: currentQ.originalId,
              question_text: qSplit.english,
              option_a: currentQ.option_a,
              option_b: currentQ.option_b,
              option_c: currentQ.option_c,
              option_d: currentQ.option_d,
              explanation: currentQ.explanation,
            },
            false
          );
          setTranslationsCache((prev) => ({
            ...prev,
            [currentQ.id]: trans,
          }));
        } catch (err) {
          console.warn("Hindi translation error:", err);
        } finally {
          setIsTranslating(false);
        }
      }
    }
  };

  // Track time spent on each question
  const recordQuestionTime = useCallback(() => {
    if (!currentQ) return;
    const now = Date.now();
    const elapsed = Math.round((now - qStartTimeRef.current) / 1000);
    qStartTimeRef.current = now;
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + elapsed,
    }));
  }, [currentQ]);

  // Handle Option Select
  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    if (!currentQ) return;
    if (soundEnabled) playChime("select");
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: opt,
    }));
  };

  // Clear Option
  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  // Toggle Mark For Review
  const handleToggleReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  // Jump to specific question index
  const goToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    recordQuestionTime();
    setCurrentIndex(idx);
    setVisited((prev) => new Set(prev).add(questions[idx].id));
    if (timerType === "blitz") {
      setBlitzTimeLeft(20);
    }
    setShowPalette(false);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  // Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  // Submit Test & Calculate Results
  const handleSubmitTest = useCallback(() => {
    recordQuestionTime();
    setShowSubmitModal(false);
    setPhase("results");
    if (soundEnabled) playChime("finish");
  }, [recordQuestionTime, soundEnabled]);

  // Start Speed Test Drill
  const handleStartTest = async () => {
    setLoadingQuestions(true);
    try {
      const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const params = new URLSearchParams({
        mode: selectedMode,
        subject: selectedSubject,
        count: String(questionCount),
        attemptId,
      });

      if (selectedMode === "topic" && selectedTopicId) {
        params.set("topicId", String(selectedTopicId));
      }

      const res = await fetch(`/api/speed-test/questions?${params.toString()}`);
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setAnswers({});
        setMarkedForReview(new Set());
        setVisited(new Set([data.questions[0].id]));
        setQuestionTimes({});
        qStartTimeRef.current = Date.now();

        // Timer initializations
        const totalSec = timerType === "sectional" ? durationMinutes * 60 : data.questions.length * 20;
        setTotalTimeLeft(totalSec);
        setBlitzTimeLeft(20);
        setTotalTimeSpent(0);

        setPhase("testing");
        if (soundEnabled) playChime("finish");
      } else {
        alert("Could not load questions for this selection. Please try another subject or mode.");
      }
    } catch (err) {
      console.error("Failed to start speed test:", err);
      alert("Error starting speed test. Please check network and try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 1. Overall Sectional Countdown Timer
  useEffect(() => {
    if (phase !== "testing") return;

    const interval = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, handleSubmitTest]);

  // 2. Rapid Fire Blitz Timer (20 Seconds Per Question)
  useEffect(() => {
    if (phase !== "testing" || timerType !== "blitz") return;

    const blitzInterval = setInterval(() => {
      setBlitzTimeLeft((prev) => {
        if (prev <= 1) {
          if (soundEnabled) playChime("warning");
          if (currentIndex < questions.length - 1) {
            goToQuestion(currentIndex + 1);
          } else {
            handleSubmitTest();
          }
          return 20;
        }

        if (prev <= 4 && soundEnabled) {
          playChime("tick");
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(blitzInterval);
  }, [phase, timerType, currentIndex, questions.length, soundEnabled, handleSubmitTest]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (phase !== "testing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (["1", "A"].includes(key)) {
        e.preventDefault();
        handleSelectOption("A");
      } else if (["2", "B"].includes(key)) {
        e.preventDefault();
        handleSelectOption("B");
      } else if (["3", "C"].includes(key)) {
        e.preventDefault();
        handleSelectOption("C");
      } else if (["4", "D"].includes(key)) {
        e.preventDefault();
        handleSelectOption("D");
      } else if (key === "ENTER" || key === "ARROWDOWN") {
        e.preventDefault();
        handleNext();
      } else if (key === "ARROWLEFT" || key === "P") {
        e.preventDefault();
        handlePrev();
      } else if (key === "ARROWRIGHT" || key === "N") {
        e.preventDefault();
        handleNext();
      } else if (key === "M" || key === "F") {
        e.preventDefault();
        handleToggleReview();
      } else if (key === "C" || key === "BACKSPACE" || key === "DELETE") {
        e.preventDefault();
        handleClearResponse();
      } else if (key === "T" || key === "H") {
        e.preventDefault();
        handleToggleHindi();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, currentIndex, questions.length, isHindiActive, currentQ]);

  // Format time display (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Performance calculations
  const resultsData = useMemo(() => {
    if (phase !== "results" || questions.length === 0) return null;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const sectionStats: Record<string, { total: number; correct: number; incorrect: number }> = {};

    questions.forEach((q) => {
      const userAns = answers[q.id];
      const secName = q.subject || "General";
      if (!sectionStats[secName]) {
        sectionStats[secName] = { total: 0, correct: 0, incorrect: 0 };
      }
      sectionStats[secName].total++;

      if (!userAns) {
        skipped++;
      } else if (userAns === q.correct_answer) {
        correct++;
        sectionStats[secName].correct++;
      } else {
        incorrect++;
        sectionStats[secName].incorrect++;
      }
    });

    const attempted = correct + incorrect;
    const score = Math.max(0, correct * 2 - incorrect * 0.5);
    const maxScore = questions.length * 2;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const avgSecPerQ = questions.length > 0 ? Math.round(totalTimeSpent / questions.length) : 0;

    let speedTier = "🎯 Steady Exam Pace";
    let speedColor = "text-amber-800 bg-amber-50 border-amber-200";
    if (avgSecPerQ <= 22) {
      speedTier = "⚡ Lightning Fast! (Rank 1 Pace)";
      speedColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
    } else if (avgSecPerQ <= 36) {
      speedTier = "🚀 Ideal Exam Pace (Ahead of Cut-off)";
      speedColor = "text-blue-800 bg-blue-50 border-blue-200";
    } else {
      speedTier = "⏱️ Needs Speed Drills";
      speedColor = "text-rose-800 bg-rose-50 border-rose-200";
    }

    return {
      total: questions.length,
      attempted,
      correct,
      incorrect,
      skipped,
      score,
      maxScore,
      accuracy,
      avgSecPerQ,
      speedTier,
      speedColor,
      sectionStats,
    };
  }, [phase, questions, answers, totalTimeSpent]);

  // Review questions filtered
  const filteredReviewQuestions = useMemo(() => {
    if (phase !== "results") return [];
    return questions.filter((q) => {
      const userAns = answers[q.id];
      if (reviewFilter === "correct") return userAns === q.correct_answer;
      if (reviewFilter === "incorrect") return userAns && userAns !== q.correct_answer;
      if (reviewFilter === "skipped") return !userAns;
      return true;
    });
  }, [phase, questions, answers, reviewFilter]);

  // ==========================================
  // VIEW 1: SETUP & LAUNCHPAD (Website Light Theme)
  // ==========================================
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
        {/* Top Header matching SSCZone layout */}
        <section className="bg-white border-b border-slate-200/80 py-8 px-4">
          <div className="mx-auto max-w-5xl space-y-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Speed Test Drill</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Real Exam Speed Drill
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  SSC Speed Test <span className="text-blue-600">Challenge</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Practice with real exam timing and user-based dynamic questions. Pool includes{" "}
                  <strong className="text-slate-800 font-semibold">{stats.totalQuestions.toLocaleString()}+ active questions</strong> from official PYQs and Question Bank.
                </p>
              </div>

              {/* Pool Status Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left sm:text-right shrink-0">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Question Pool</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  {stats.totalQuestions.toLocaleString()}+ <span className="text-xs text-slate-500 font-normal">Questions</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center sm:justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  50 Shift PYQs + Question Bank
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top AdSense Placement */}
        <div className="max-w-5xl mx-auto px-4">
          <AdBanner slot="speed-test-top-banner" className="my-4" />
        </div>

        {/* Main Configuration Card */}
        <div className="max-w-5xl mx-auto px-4 mt-4 space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-8">
            {/* STEP 1: Select Mode */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <label className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                  Select Drill Mode
                </label>
                <span className="text-xs text-slate-500 font-medium">Choose from 3 test modes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Mode 1: All-Rounder (Mixed) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode("random");
                    setSelectedSubject("all");
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    selectedMode === "random"
                      ? "bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  {selectedMode === "random" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">All-Rounder (Mixed)</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Balanced real exam split across Reasoning, General Awareness, Quant, and English Comprehension.
                  </div>
                </button>

                {/* Mode 2: Subject-Wise */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode("subject");
                    if (selectedSubject === "all") setSelectedSubject("quant");
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    selectedMode === "subject"
                      ? "bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  {selectedMode === "subject" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Subject-Wise</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Targeted practice in Maths, Reasoning, English, or GK specifically with official shift questions.
                  </div>
                </button>

                {/* Mode 3: Chapter-Wise */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("topic")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    selectedMode === "topic"
                      ? "bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  {selectedMode === "topic" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Chapter / Topic-Wise</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Select a specific chapter (Percentage, Syllogism, Synonyms, Indian Economy, etc.).
                  </div>
                </button>
              </div>
            </div>

            {/* SUBJECT & TOPIC SELECTION (If Subject-wise or Topic-wise) */}
            {(selectedMode === "subject" || selectedMode === "topic") && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
                <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Select Target Subject:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: "quant", name: "Quantitative Aptitude", icon: Calculator, labelHi: "Maths" },
                    { key: "reasoning", name: "Reasoning", icon: Brain, labelHi: "General Intelligence" },
                    { key: "english", name: "English Comprehension", icon: BookOpen, labelHi: "English" },
                    { key: "ga", name: "General Awareness", icon: Globe, labelHi: "GK / GS" },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = selectedSubject === sub.key;
                    return (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => setSelectedSubject(sub.key as any)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{sub.name}</div>
                          <div className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                            {sub.labelHi}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* If Topic-wise mode, show topic searchable dropdown */}
                {selectedMode === "topic" && (
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Choose Chapter / Topic ({filteredTopics.length} available):</span>
                      <span className="text-[11px] text-blue-600 font-medium">Instant Filter</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Type chapter name to filter (e.g. Percentage, Profit, Analogy)..."
                      value={topicSearchQuery}
                      onChange={(e) => setTopicSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />

                    <select
                      value={selectedTopicId || ""}
                      onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      {filteredTopics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.subject_key.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Timer & Format Configuration */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <label className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                  Timer & Question Settings
                </label>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Default: 25 Questions / 15 Minutes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timer Type Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Timer Mode:</div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTimerType("sectional")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        timerType === "sectional"
                          ? "bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-900"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        15 Mins Drill
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Sectional Exam Clock</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimerType("blitz")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        timerType === "blitz"
                          ? "bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 text-amber-900"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        20s Blitz
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">20s / Question Countdown</div>
                    </button>
                  </div>

                  {timerType === "sectional" && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[11px] text-slate-500 font-medium">Duration:</span>
                      {[10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            durationMinutes === mins
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {mins} mins {mins === 15 && "(Default)"}
                        </button>
                      ))}
                    </div>
                  )}

                  {timerType === "blitz" && (
                    <div className="text-[11px] text-amber-800 bg-amber-100/60 border border-amber-200/80 p-2.5 rounded-lg leading-relaxed">
                      ⚡ <strong>20-Second Rapid Fire:</strong> You get exactly 20 seconds for each question with visual countdown and auto-advance. Sharpens reflexes for the actual exam!
                    </div>
                  )}
                </div>

                {/* Question Count Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Number of Questions:</div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 10, label: "10 Qs", sub: "Warmup" },
                      { count: 25, label: "25 Qs", sub: "SSC Default" },
                      { count: 50, label: "50 Qs", sub: "Marathon" },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuestionCount(item.count)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          questionCount === item.count
                            ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                          {item.label}
                          {questionCount === item.count && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">Audio Chimes & Timer Beeps:</span>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        soundEnabled
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Sound On</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Muted</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Default language is English. Hindi translation available on-demand inside the test.</span>
              </div>

              <button
                type="button"
                onClick={handleStartTest}
                disabled={loadingQuestions || loadingConfig}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loadingQuestions ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Preparing Speed Drill...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Start Speed Drill</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Ad Placement */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <AdBanner slot="speed-test-bottom-banner" className="my-4" />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE SPEED TESTING HALL (CBT Light Theme)
  // ==========================================
  if (phase === "testing" && currentQ && activeQuestionContent) {
    const isAnswered = !!answers[currentQ.id];
    const isMarked = markedForReview.has(currentQ.id);
    const isEnglishSection = currentQ.subjectKey === "english";

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col select-none">
        {/* Sticky Top HUD Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Section Badge & Question Index */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Brain className="w-3.5 h-3.5" />
                {currentQ.subject}
              </span>

              <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                Q. {currentIndex + 1} <span className="text-slate-400 font-normal">/ {questions.length}</span>
              </div>
            </div>

            {/* Center: Live Timers */}
            <div className="flex items-center gap-3">
              {/* 20s Rapid Blitz Mode */}
              {timerType === "blitz" && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-black text-sm transition-all ${
                    blitzTimeLeft <= 5
                      ? "bg-rose-50 border-rose-400 text-rose-700 animate-pulse scale-105"
                      : "bg-amber-50 border-amber-300 text-amber-800"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{blitzTimeLeft}s</span>
                  <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">Blitz</span>
                </div>
              )}

              {/* Total Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-black text-sm ${
                  totalTimeLeft < 180
                    ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                    : totalTimeLeft < 300
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{formatTime(totalTimeLeft)}</span>
              </div>
            </div>

            {/* Right: Hindi Translator Toggle + Palette + Submit */}
            <div className="flex items-center gap-2">
              {/* Dedicated Hindi Translator Toggle */}
              <button
                type="button"
                onClick={handleToggleHindi}
                disabled={isEnglishSection || isTranslating}
                title={
                  isEnglishSection
                    ? "English Comprehension section is in English only"
                    : isHindiActive
                    ? "Switch back to English"
                    : "Translate question to Hindi"
                }
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEnglishSection
                    ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                    : isHindiActive
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {isTranslating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Languages className={`w-3.5 h-3.5 ${isHindiActive ? "text-emerald-600" : "text-slate-500"}`} />
                    <span>{isHindiActive ? "हिंदी (ON)" : "Translate"}</span>
                  </>
                )}
              </button>

              {/* Question Grid Palette Button */}
              <button
                type="button"
                onClick={() => setShowPalette(!showPalette)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Grid ({Object.keys(answers).length}/{questions.length})</span>
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Rapid Blitz 20s Bar */}
          {timerType === "blitz" && (
            <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  blitzTimeLeft <= 5 ? "bg-rose-500" : "bg-gradient-to-r from-amber-400 to-emerald-500"
                }`}
                style={{ width: `${(blitzTimeLeft / 20) * 100}%` }}
              />
            </div>
          )}
        </header>

        {/* Main Exam Hall Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Informative notice for English Section */}
            {isEnglishSection && (
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>English Comprehension questions are provided in English only as per official SSC exam format.</span>
              </div>
            )}

            {/* Question Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                    Question {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500">
                    {currentQ.source === "pyq" ? "Official SSC Shift Question" : "Question Bank"}
                  </span>
                  {activeQuestionContent.isHindi && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      हिंदी अनुवाद
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ReportButton
                    questionId={currentQ.originalId}
                    questionText={currentQ.question_text}
                    showLabel={true}
                  />

                  {isMarked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <Flag className="w-3 h-3 fill-purple-600 text-purple-600" />
                      Marked
                    </span>
                  )}
                  {isAnswered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Check className="w-3 h-3" />
                      Answered
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
                <MathText text={activeQuestionContent.questionText} />

                {/* Question Image if present */}
                {currentQ.image_url && (
                  <div className="pt-3">
                    <img
                      src={currentQ.image_url}
                      alt="Question Diagram"
                      className="max-h-64 rounded-xl border border-slate-200 bg-white object-contain"
                    />
                  </div>
                )}
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optText = activeQuestionContent[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"];
                  const optImg = currentQ[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}_image_url`];
                  const isSelected = answers[currentQ.id] === opt;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`group p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-2xs font-semibold"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
                      }`}
                    >
                      {/* Option Pill */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </span>

                      {/* Option Content */}
                      <div className="flex-1 text-sm sm:text-base leading-snug">
                        <MathText text={optText} />
                        {optImg && (
                          <img
                            src={optImg}
                            alt={`Option ${opt}`}
                            className="max-h-24 rounded-lg border border-slate-200 bg-white object-contain mt-1.5"
                          />
                        )}
                      </div>

                      {/* Keyboard shortcut hint */}
                      <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 group-hover:text-slate-600">
                        [{opt}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ad slot inside exam view */}
            <AdBanner slot="speed-test-testing-bottom" className="my-2" />
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!isAnswered}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleToggleReview}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isMarked
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMarked ? "Marked" : "Mark for Review"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? "Review & Submit" : "Save & Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Slide-out Question Palette Drawer */}
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end">
            <div className="w-full max-w-sm bg-white border-l border-slate-200 h-full p-5 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Question Navigator
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPalette(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Marked ({markedForReview.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span>Not Answered ({questions.length - Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600" />
                    <span>Current</span>
                  </div>
                </div>

                {/* 25 Question Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const ans = !!answers[q.id];
                    const mrk = markedForReview.has(q.id);
                    const isCur = idx === currentIndex;

                    let bg = "bg-slate-50 text-slate-700 border-slate-200";
                    if (ans && mrk) bg = "bg-amber-100 text-amber-900 font-bold border-amber-300";
                    else if (ans) bg = "bg-emerald-600 text-white font-bold border-emerald-600";
                    else if (mrk) bg = "bg-purple-600 text-white font-bold border-purple-600";
                    else if (visited.has(q.id)) bg = "bg-rose-50 text-rose-700 border-rose-200";

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(idx)}
                        className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${bg} ${
                          isCur ? "ring-2 ring-blue-600 scale-105" : "hover:opacity-90"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPalette(false);
                    setShowSubmitModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Submit Speed Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Submit Speed Drill?</h3>
                  <p className="text-xs text-slate-500">Are you ready to submit your test and view your scorecard?</p>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Answered</div>
                  <div className="text-lg font-black text-emerald-700">{Object.keys(answers).length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Marked</div>
                  <div className="text-lg font-black text-purple-700">{markedForReview.size}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Skipped</div>
                  <div className="text-lg font-black text-rose-700">
                    {questions.length - Object.keys(answers).length}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600"
                >
                  Continue Drill
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-xs cursor-pointer"
                >
                  Submit & View Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: SCORECARD & RESULTS (Website Light Theme)
  // ==========================================
  if (phase === "results" && resultsData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
        {/* Header */}
        <section className="bg-white border-b border-slate-200 py-8 px-4">
          <div className="mx-auto max-w-5xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Speed Test Scorecard</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase mb-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Drill Completed
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Speed Test <span className="text-blue-600">Scorecard</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Standard SSC Marking (+2 for Correct, -0.5 for Wrong) • Real-time Speed & Accuracy Analytics
                </p>
              </div>

              {/* Speed Tier Badge */}
              <div className={`p-4 rounded-2xl border font-bold text-xs sm:text-sm shadow-xs ${resultsData.speedColor}`}>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Speed Analysis</div>
                <div className="text-base sm:text-lg font-black mt-0.5">{resultsData.speedTier}</div>
                <div className="text-xs mt-1 font-semibold opacity-90">
                  Average <strong>{resultsData.avgSecPerQ}s</strong> / question
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad slot at top of results */}
        <div className="max-w-5xl mx-auto px-4">
          <AdBanner slot="speed-test-results-top" className="my-4" />
        </div>

        {/* Metric Cards Grid */}
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-bold">Final Score</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {resultsData.score}
                <span className="text-xs text-slate-400 font-normal"> / {resultsData.maxScore}</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-bold">
                {Math.round((resultsData.score / resultsData.maxScore) * 100)}% Marks
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">{resultsData.accuracy}%</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {resultsData.correct} correct of {resultsData.attempted}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-bold">Time Taken</div>
              <div className="text-3xl font-black text-blue-600 mt-1 font-mono">
                {formatTime(totalTimeSpent)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                of {formatTime(timerType === "sectional" ? durationMinutes * 60 : questions.length * 20)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-bold">Attempt Breakdown</div>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm font-bold">
                <span className="text-emerald-600">{resultsData.correct} ✔</span>
                <span className="text-rose-600">{resultsData.incorrect} ✖</span>
                <span className="text-slate-400">{resultsData.skipped} ⚪</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Correct • Wrong • Skipped</div>
            </div>
          </div>

          {/* Sectional Breakdown (if multi-subject) */}
          {Object.keys(resultsData.sectionStats).length > 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Section-wise Performance Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(resultsData.sectionStats).map(([secName, sec]) => {
                  const secAccuracy = sec.correct + sec.incorrect > 0
                    ? Math.round((sec.correct / (sec.correct + sec.incorrect)) * 100)
                    : 0;
                  return (
                    <div key={secName} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{secName}</span>
                        <span className="text-emerald-700">{secAccuracy}% Acc</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Questions: {sec.total}</span>
                        <span>Correct: {sec.correct} | Wrong: {sec.incorrect}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(sec.correct / sec.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handleStartTest}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Speed Test</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSolutions(!showSolutions)}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  showSolutions
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-black shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showSolutions ? "Hide Solutions" : "Review All Solutions"}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>

          {/* Detailed Solutions Review */}
          {showSolutions && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Question & Solution Review</h3>
                  <p className="text-xs text-slate-500">Step-by-step explanations and verified official answers</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs">
                  {(["all", "correct", "incorrect", "skipped"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReviewFilter(f)}
                      className={`px-3 py-1 rounded-lg capitalize font-bold cursor-pointer ${
                        reviewFilter === f
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Questions List */}
              <div className="space-y-4">
                {filteredReviewQuestions.map((q, idx) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correct_answer;
                  const isSkipped = !userAns;
                  const timeSpentOnQ = questionTimes[q.id] || 0;

                  // Clean English & Hindi texts
                  const qSplit = splitBilingual(q.question_text);

                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-blue-600">Q. {idx + 1}</span>
                          <span className="text-xs text-slate-500">• {q.subject}</span>
                          {q.topic && <span className="text-xs text-slate-400">• {q.topic}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <ReportButton
                            questionId={q.originalId}
                            questionText={q.question_text}
                            showLabel={false}
                          />

                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            ⏱️ {timeSpentOnQ}s
                          </span>

                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct (+2)
                            </span>
                          )}
                          {!isCorrect && !isSkipped && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect (-0.5)
                            </span>
                          )}
                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              ⚪ Skipped (0)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-sm sm:text-base text-slate-900 font-medium">
                        <MathText text={qSplit.english} />
                        {qSplit.hindi && (
                          <div className="text-slate-600 font-hindi text-xs sm:text-sm mt-2 pt-2 border-t border-slate-100">
                            <MathText text={qSplit.hindi} />
                          </div>
                        )}
                        {q.image_url && (
                          <div className="pt-2">
                            <img
                              src={q.image_url}
                              alt="Diagram"
                              className="max-h-56 rounded-xl border border-slate-200 bg-white object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const isTheCorrectAns = q.correct_answer === opt;
                          const wasUserChoice = userAns === opt;
                          const optRaw = q[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}`];
                          const optSplit = splitBilingual(optRaw);

                          let optStyle = "bg-slate-50 border-slate-200 text-slate-700";
                          if (isTheCorrectAns) {
                            optStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                          } else if (wasUserChoice && !isTheCorrectAns) {
                            optStyle = "bg-rose-50 border-rose-300 text-rose-900";
                          }

                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-black shrink-0">
                                {opt}
                              </span>
                              <div className="flex-1">
                                <MathText text={optSplit.english} />
                                {optSplit.hindi && (
                                  <div className="text-slate-500 font-hindi text-[11px] mt-0.5">
                                    <MathText text={optSplit.hindi} />
                                  </div>
                                )}
                              </div>
                              {isTheCorrectAns && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {wasUserChoice && !isTheCorrectAns && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {(q.explanation || q.explanation_hi) && (
                        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-800 space-y-1.5">
                          <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Detailed Explanation:
                          </div>
                          {q.explanation && (
                            <div className="text-slate-700 leading-relaxed">
                              <MathText text={q.explanation} />
                            </div>
                          )}
                          {q.explanation_hi && (
                            <div className="text-slate-700 font-hindi border-t border-blue-100 pt-1.5 leading-relaxed">
                              <MathText text={q.explanation_hi} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom AdSense Banner in Results */}
          <AdBanner slot="speed-test-results-bottom" className="my-6" />
        </div>
      </div>
    );
  }

  return null;
}
