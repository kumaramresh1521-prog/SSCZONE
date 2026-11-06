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
  ChevronRight,
  Check,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle,
  Home,
  Sliders,
  Award,
} from "lucide-react";
import MathText from "@/components/MathText";

// Sound synthesis using Web Audio API (Zero external dependencies)
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

  // Setup Options
  const [selectedMode, setSelectedMode] = useState<"random" | "subject" | "topic">("random");
  const [selectedSubject, setSelectedSubject] = useState<"all" | "quant" | "reasoning" | "english" | "ga">("all");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(25); // Default 25 questions
  const [timerType, setTimerType] = useState<"sectional" | "blitz">("sectional");
  const [durationMinutes, setDurationMinutes] = useState<number>(15); // Default 15 minutes
  const [languageMode, setLanguageMode] = useState<"bilingual" | "english" | "hindi">("bilingual");
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Fetch initial config (topics & stats)
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
          // Blitz time out for this question: audio alert & advance
          if (soundEnabled) playChime("warning");
          if (currentIndex < questions.length - 1) {
            goToQuestion(currentIndex + 1);
          } else {
            handleSubmitTest();
          }
          return 20;
        }

        // Warning sound on 3, 2, 1 seconds
        if (prev <= 4 && soundEnabled) {
          playChime("tick");
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(blitzInterval);
  }, [phase, timerType, currentIndex, questions.length, soundEnabled, handleSubmitTest]);

  // Keyboard Shortcuts for Rapid Interaction
  useEffect(() => {
    if (phase !== "testing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, currentIndex, questions.length]);

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
    // SSC CGL standard marking: +2 for correct, -0.5 for incorrect
    const score = Math.max(0, correct * 2 - incorrect * 0.5);
    const maxScore = questions.length * 2;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const avgSecPerQ = questions.length > 0 ? Math.round(totalTimeSpent / questions.length) : 0;

    // Speed evaluation badge
    let speedTier = "🎯 Steady Pace";
    let speedColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (avgSecPerQ <= 22) {
      speedTier = "⚡ Lightning Fast! (Rank 1 Pace)";
      speedColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    } else if (avgSecPerQ <= 36) {
      speedTier = "🚀 Ideal Exam Pace (Ahead of Cut-off)";
      speedColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    } else {
      speedTier = "⏱️ Needs Speed Drills";
      speedColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
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
  // VIEW 1: SETUP & LAUNCHPAD
  // ==========================================
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-indigo-500/20 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Real Exam Speed Drill
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  SSC Speed Test <span className="text-indigo-400">Drill</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Train lightning reflexes with automated dynamic tests. Draw questions instantly from{" "}
                  <strong className="text-white font-semibold">12,200+ PYQ shifts and question bank</strong> with user-based randomization!
                </p>
              </div>

              {/* Pool Counter Pill */}
              <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-xl backdrop-blur-md sm:text-right shrink-0">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Question Pool Available</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {stats.totalQuestions.toLocaleString()}+ <span className="text-xs text-slate-400 font-normal">Active Qs</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  5,000 PYQs + 7,200 QB
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            {/* STEP 1: Speed Test Mode (User Options) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-bold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                  Select Test Mode (मोड चुनें)
                </label>
                <span className="text-xs text-slate-400">Random, Subject-wise, or Chapter-wise</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mode 1: All Subjects (Random) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode("random");
                    setSelectedSubject("all");
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedMode === "random"
                      ? "bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  {selectedMode === "random" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-white text-sm">🎲 All-Rounder (Mixed)</div>
                  <div className="text-xs text-indigo-300 font-medium mt-0.5">मिश्रित - सभी विषय</div>
                  <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Balanced split across Reasoning, General Awareness, Quant, and English Comprehension.
                  </div>
                </button>

                {/* Mode 2: Subject-Wise */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode("subject");
                    if (selectedSubject === "all") setSelectedSubject("quant");
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedMode === "subject"
                      ? "bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  {selectedMode === "subject" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-white text-sm">📚 Subject-Wise</div>
                  <div className="text-xs text-amber-300 font-medium mt-0.5">विषयवार अभ्यास</div>
                  <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Drill down into Maths, Reasoning, English, or GK specifically with official shift questions.
                  </div>
                </button>

                {/* Mode 3: Topic / Chapter-Wise */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("topic")}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedMode === "topic"
                      ? "bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  {selectedMode === "topic" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-white text-sm">📑 Chapter / Topic-Wise</div>
                  <div className="text-xs text-emerald-300 font-medium mt-0.5">अध्यायवार / टॉपिकवार</div>
                  <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Pick a specific chapter (e.g. Percentage, Analogy, Synonyms, Indian Economy).
                  </div>
                </button>
              </div>
            </div>

            {/* SUBJECT SELECTOR (Visible for Subject-wise or Topic-wise) */}
            {(selectedMode === "subject" || selectedMode === "topic") && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Choose Subject (विषय चुनें):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: "quant", name: "Quantitative Aptitude", icon: Calculator, labelHi: "गणित" },
                    { key: "reasoning", name: "Reasoning", icon: Brain, labelHi: "तर्कशक्ति" },
                    { key: "english", name: "English Comprehension", icon: BookOpen, labelHi: "अंग्रेजी" },
                    { key: "ga", name: "General Awareness", icon: Globe, labelHi: "सामान्य ज्ञान" },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = selectedSubject === sub.key;
                    return (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => setSelectedSubject(sub.key as any)}
                        className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">{sub.name}</div>
                          <div className={`text-[10px] ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                            {sub.labelHi}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* If Topic-wise mode, show topic dropdown & search */}
                {selectedMode === "topic" && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Select Chapter / Topic ({filteredTopics.length} available):</span>
                      <span className="text-[11px] text-indigo-400 font-normal">Instant Search</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Type chapter name to filter (e.g. Percentage, Profit, Analogy)..."
                      value={topicSearchQuery}
                      onChange={(e) => setTopicSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />

                    <select
                      value={selectedTopicId || ""}
                      onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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

            {/* STEP 2: Timer & Challenge Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-bold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
                  Timer & Challenge Settings (टाइमर व प्रश्न संख्या)
                </label>
                <span className="text-xs text-emerald-400 font-semibold">Standard: 25 Qs in 15 Mins</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timer Challenge Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Challenge Timer Mode:</div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimerType("sectional")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        timerType === "sectional"
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        15 Mins Drill
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Sectional Exam Clock</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimerType("blitz")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        timerType === "blitz"
                          ? "bg-amber-500/20 border-amber-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        20 Sec Blitz
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">20s per Question Countdown</div>
                    </button>
                  </div>

                  {timerType === "sectional" && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[11px] text-slate-400">Total Duration:</span>
                      {[10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            durationMinutes === mins
                              ? "bg-indigo-600 text-white border-indigo-500"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {mins} mins {mins === 15 && "(Default)"}
                        </button>
                      ))}
                    </div>
                  )}

                  {timerType === "blitz" && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                      ⚡ <strong>Rapid Fire Blitz:</strong> You get exactly 20 seconds for each question with visual countdown and auto-advance. Perfect for reflex training!
                    </div>
                  )}
                </div>

                {/* Question Count Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Number of Questions:</div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 10, label: "10 Qs", sub: "Quick Warmup" },
                      { count: 25, label: "25 Qs", sub: "SSC Default" },
                      { count: 50, label: "50 Qs", sub: "Marathon" },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuestionCount(item.count)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          questionCount === item.count
                            ? "bg-emerald-600/20 border-emerald-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="font-bold text-xs text-white flex items-center justify-between">
                          {item.label}
                          {questionCount === item.count && <Check className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* Sound & Language Toolbar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Language:</span>
                      {(["bilingual", "english", "hindi"] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguageMode(lang)}
                          className={`px-2 py-0.5 rounded text-[11px] capitalize border ${
                            languageMode === lang
                              ? "bg-indigo-600 text-white border-indigo-500"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          {lang === "bilingual" ? "Dual" : lang}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] ${
                        soundEnabled
                          ? "bg-slate-800 border-slate-700 text-indigo-300"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                      title={soundEnabled ? "Timer Sound ON" : "Timer Sound OFF"}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Distinct random question set generated for your session</span>
              </div>

              <button
                type="button"
                onClick={handleStartTest}
                disabled={loadingQuestions || loadingConfig}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loadingQuestions ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Speed Drill...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white text-white" />
                    <span>Start Speed Test (शुरू करें)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE SPEED TESTING HALL
  // ==========================================
  if (phase === "testing" && currentQ) {
    const isAnswered = !!answers[currentQ.id];
    const isMarked = markedForReview.has(currentQ.id);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
        {/* Top Floating HUD Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Section Badge & Progress */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Brain className="w-3.5 h-3.5" />
                {currentQ.subject}
              </div>

              <div className="text-xs sm:text-sm font-bold text-white">
                Q. {currentIndex + 1} <span className="text-slate-500 font-normal">/ {questions.length}</span>
              </div>

              {currentQ.topic && (
                <span className="hidden md:inline-block text-xs text-slate-400 truncate max-w-[150px]">
                  • {currentQ.topic}
                </span>
              )}
            </div>

            {/* Center: Live Countdown Clocks */}
            <div className="flex items-center gap-3">
              {/* Blitz Timer Mode (20 sec) */}
              {timerType === "blitz" && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono font-bold text-sm transition-all ${
                    blitzTimeLeft <= 5
                      ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse scale-105"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{blitzTimeLeft}s</span>
                  <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Blitz</span>
                </div>
              )}

              {/* Total Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono font-bold text-sm ${
                  totalTimeLeft < 180
                    ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                    : totalTimeLeft < 300
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-emerald-400"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(totalTimeLeft)}</span>
              </div>
            </div>

            {/* Right: Palette Toggle & End Button */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => {
                  setLanguageMode((prev) => (prev === "bilingual" ? "english" : prev === "english" ? "hindi" : "bilingual"));
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white capitalize"
                title="Switch Language (Dual/English/Hindi)"
              >
                {languageMode === "bilingual" ? "Dual (En/Hi)" : languageMode}
              </button>

              {/* Question Palette Toggle */}
              <button
                type="button"
                onClick={() => setShowPalette(!showPalette)}
                className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Grid ({answers ? Object.keys(answers).length : 0}/{questions.length})</span>
              </button>

              {/* Submit Speed Test */}
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Rapid Blitz 20s Progress Bar */}
          {timerType === "blitz" && (
            <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  blitzTimeLeft <= 5 ? "bg-rose-500" : "bg-gradient-to-r from-amber-400 to-emerald-400"
                }`}
                style={{ width: `${(blitzTimeLeft / 20) * 100}%` }}
              />
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                    Question {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentQ.source === "pyq" ? "Official SSC PYQ Shift" : "SSC Topic Question Bank"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isMarked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/30">
                      <Flag className="w-3 h-3 fill-purple-400" />
                      Marked
                    </span>
                  )}
                  {isAnswered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4 text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                {/* English Content */}
                {(languageMode === "bilingual" || languageMode === "english") && (
                  <div className="text-slate-100">
                    <MathText text={currentQ.question_text} />
                  </div>
                )}

                {/* Hindi Content */}
                {(languageMode === "bilingual" || languageMode === "hindi") && currentQ.question_text_hi && (
                  <div className="text-indigo-200/90 font-hindi border-t border-slate-800/80 pt-3 text-sm sm:text-base">
                    <MathText text={currentQ.question_text_hi} />
                  </div>
                )}

                {/* Question Image if present */}
                {currentQ.image_url && (
                  <div className="pt-2">
                    <img
                      src={currentQ.image_url}
                      alt="Question Diagram"
                      className="max-h-64 rounded-xl border border-slate-800 bg-white/5 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Options Grid (4 High-Contrast Options) */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optTextEn = currentQ[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}`];
                  const optTextHi = currentQ[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}_hi`];
                  const optImg = currentQ[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}_image_url`];
                  const isSelected = answers[currentQ.id] === opt;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`group p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200"
                      }`}
                    >
                      {/* Option Pill */}
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-slate-600"
                        }`}
                      >
                        {opt}
                      </span>

                      {/* Option Content */}
                      <div className="flex-1 space-y-1 text-sm sm:text-base">
                        {(languageMode === "bilingual" || languageMode === "english") && (
                          <div>
                            <MathText text={optTextEn} />
                          </div>
                        )}
                        {(languageMode === "bilingual" || languageMode === "hindi") && optTextHi && (
                          <div className="text-xs sm:text-sm text-indigo-300/90 font-hindi">
                            <MathText text={optTextHi} />
                          </div>
                        )}
                        {optImg && (
                          <img
                            src={optImg}
                            alt={`Option ${opt}`}
                            className="max-h-24 rounded-lg border border-slate-700 bg-white/5 object-contain mt-1"
                          />
                        )}
                      </div>

                      {/* Keyboard Shortcut Hint */}
                      <span className="hidden sm:inline-block text-[11px] font-mono text-slate-600 group-hover:text-slate-400">
                        [{opt}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!isAnswered}
                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleToggleReview}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isMarked
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? "Review & Submit" : "Save & Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Slide-out Question Grid / Palette Drawer */}
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Question Navigator
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPalette(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Marked ({markedForReview.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    <span>Not Answered ({questions.length - Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-indigo-400" />
                    <span>Current</span>
                  </div>
                </div>

                {/* 25 Question Number Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const ans = !!answers[q.id];
                    const mrk = markedForReview.has(q.id);
                    const isCur = idx === currentIndex;

                    let bg = "bg-slate-800 text-slate-300 border-slate-700";
                    if (ans && mrk) bg = "bg-amber-500 text-slate-950 font-bold border-amber-400";
                    else if (ans) bg = "bg-emerald-600 text-white font-bold border-emerald-500";
                    else if (mrk) bg = "bg-purple-600 text-white font-bold border-purple-500";
                    else if (visited.has(q.id)) bg = "bg-rose-950/40 text-rose-300 border-rose-800/60";

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(idx)}
                        className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${bg} ${
                          isCur ? "ring-2 ring-indigo-400 scale-105" : "hover:opacity-90"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPalette(false);
                    setShowSubmitModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Speed Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Submit Speed Drill?</h3>
                  <p className="text-xs text-slate-400">Are you sure you want to finalize this attempt?</p>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Answered</div>
                  <div className="text-lg font-black text-emerald-400">{Object.keys(answers).length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Marked</div>
                  <div className="text-lg font-black text-purple-400">{markedForReview.size}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Remaining</div>
                  <div className="text-lg font-black text-rose-400">
                    {questions.length - Object.keys(answers).length}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Continue Drill
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Submit & See Score
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: COMPREHENSIVE SCORECARD & RESULTS
  // ==========================================
  if (phase === "results" && resultsData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Scorecard Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-indigo-500/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase mb-3">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Speed Drill Completed
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Performance <span className="text-indigo-400">Scorecard</span>
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  SSC Standard Marking (+2 for Correct, -0.5 for Wrong) • Instant Speed Analysis
                </p>
              </div>

              {/* Speed Tier Pill */}
              <div className={`p-4 rounded-2xl border font-semibold text-xs sm:text-sm shadow-xl ${resultsData.speedColor}`}>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Speed Analysis</div>
                <div className="text-base sm:text-lg font-black mt-0.5">{resultsData.speedTier}</div>
                <div className="text-xs mt-1 opacity-90">
                  Avg <strong>{resultsData.avgSecPerQ}s</strong> / question
                </div>
              </div>
            </div>

            {/* Main 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
                <div className="text-xs text-slate-400 uppercase font-medium">Final Score</div>
                <div className="text-3xl font-black text-white mt-1">
                  {resultsData.score}
                  <span className="text-xs text-slate-500 font-normal"> / {resultsData.maxScore}</span>
                </div>
                <div className="text-[11px] text-indigo-400 mt-1 font-semibold">
                  {Math.round((resultsData.score / resultsData.maxScore) * 100)}% Marks
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
                <div className="text-xs text-slate-400 uppercase font-medium">Accuracy</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">{resultsData.accuracy}%</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {resultsData.correct} correct of {resultsData.attempted}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
                <div className="text-xs text-slate-400 uppercase font-medium">Time Taken</div>
                <div className="text-3xl font-black text-cyan-400 mt-1 font-mono">
                  {formatTime(totalTimeSpent)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  of {formatTime(timerType === "sectional" ? durationMinutes * 60 : questions.length * 20)}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
                <div className="text-xs text-slate-400 uppercase font-medium">Attempt Breakdown</div>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm font-bold">
                  <span className="text-emerald-400">{resultsData.correct} ✔</span>
                  <span className="text-rose-400">{resultsData.incorrect} ✖</span>
                  <span className="text-slate-500">{resultsData.skipped} ⚪</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Correct • Wrong • Skipped</div>
              </div>
            </div>
          </div>

          {/* Sectional Breakdown (if multi-subject) */}
          {Object.keys(resultsData.sectionStats).length > 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Section-wise Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(resultsData.sectionStats).map(([secName, sec]) => {
                  const secAccuracy = sec.correct + sec.incorrect > 0
                    ? Math.round((sec.correct / (sec.correct + sec.incorrect)) * 100)
                    : 0;
                  return (
                    <div key={secName} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{secName}</span>
                        <span className="text-emerald-400">{secAccuracy}% Acc</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Questions: {sec.total}</span>
                        <span>Correct: {sec.correct} | Wrong: {sec.incorrect}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={handleStartTest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Speed Test (नया टेस्ट)</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSolutions(!showSolutions)}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showSolutions
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{showSolutions ? "Hide Solutions" : "Review All Solutions"}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="px-4 py-3 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>

          {/* Detailed Solutions Section */}
          {showSolutions && (
            <div className="space-y-6 pt-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Detailed Question & Solution Review</h3>
                  <p className="text-xs text-slate-400">Step-by-step mathematical explanations and verified answers</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                  {(["all", "correct", "incorrect", "skipped"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReviewFilter(f)}
                      className={`px-3 py-1 rounded-lg capitalize font-medium ${
                        reviewFilter === f
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
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

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-indigo-400">Q. {idx + 1}</span>
                          <span className="text-xs text-slate-400">• {q.subject}</span>
                          {q.topic && <span className="text-xs text-slate-500">• {q.topic}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                            ⏱️ {timeSpentOnQ}s
                          </span>

                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2)
                            </span>
                          )}
                          {!isCorrect && !isSkipped && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect (-0.5)
                            </span>
                          )}
                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">
                              ⚪ Skipped (0)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-sm sm:text-base text-slate-100 font-medium">
                        <MathText text={q.question_text} />
                        {q.question_text_hi && (
                          <div className="text-indigo-200/90 font-hindi text-xs sm:text-sm mt-2 pt-2 border-t border-slate-800/60">
                            <MathText text={q.question_text_hi} />
                          </div>
                        )}
                        {q.image_url && (
                          <div className="pt-2">
                            <img
                              src={q.image_url}
                              alt="Diagram"
                              className="max-h-56 rounded-xl border border-slate-800 bg-white/5 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* 4 Options in Solution Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const isTheCorrectAns = q.correct_answer === opt;
                          const wasUserChoice = userAns === opt;
                          const optText = q[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}`];

                          let optStyle = "bg-slate-950/60 border-slate-800 text-slate-300";
                          if (isTheCorrectAns) {
                            optStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-200 font-bold";
                          } else if (wasUserChoice && !isTheCorrectAns) {
                            optStyle = "bg-rose-500/15 border-rose-500 text-rose-200";
                          }

                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-black shrink-0">
                                {opt}
                              </span>
                              <div className="flex-1">
                                <MathText text={optText} />
                              </div>
                              {isTheCorrectAns && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {wasUserChoice && !isTheCorrectAns && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {(q.explanation || q.explanation_hi) && (
                        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 space-y-2">
                          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Detailed Explanation:
                          </div>
                          {q.explanation && (
                            <div className="text-slate-200 leading-relaxed">
                              <MathText text={q.explanation} />
                            </div>
                          )}
                          {q.explanation_hi && (
                            <div className="text-indigo-200 font-hindi border-t border-indigo-500/20 pt-2 leading-relaxed">
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
        </div>
      </div>
    );
  }

  return null;
}
