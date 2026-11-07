"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import MathText from "@/components/MathText";
import ReportButton from "@/components/ReportButton";
import CollectQuestionButton from "@/components/CollectQuestionButton";
import { translateSingleQuestion } from "@/lib/translator";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  User,
  ArrowLeft,
  Trophy,
  Check,
  X,
  Sparkles,
  Bookmark,
  Share2,
  FileText,
  ShieldAlert,
  Info,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Monitor,
  ShieldCheck,
  Filter,
  Eye,
  ListFilter,
  Layers,
  BookOpen,
  LayoutGrid,
  Lock,
  Globe
} from "lucide-react";
import { isPaperTranslatorAllowed } from "@/lib/paper-pdf-store";
import { promptGuestLoginGate } from "@/components/GuestSessionGateModal";

const OPTIONS = ["A", "B", "C", "D"] as const;
type Option = (typeof OPTIONS)[number];
type Answers = Record<number, Option>;

interface SectionDef {
  id: number;
  name: string;
  hindiName: string;
  shortName: string;
  startIdx: number;
  endIdx: number; // inclusive
  recommendedMinutes: number;
  recommendedSpeed: string;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Smart Bilingual Question Statement Parser (Zero Discarded Text) ──
function splitBilingualText(text: string): { english: string; hindi: string; isBilingual: boolean } {
  if (!text) return { english: "", hindi: "", isBilingual: false };

  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) {
    return { english: text.trim(), hindi: "", isBilingual: false };
  }

  const firstHi = text.search(devanagariRegex);
  const prefix = text.substring(0, firstHi);

  // Check if sentence-ending punctuation (? or .\s or .\n) exists right before firstHi,
  // possibly followed by a short quote or token (e.g. 'consonant? "SIGNATURE" में...' or 'formed? GARDEN शब्द...')
  // NEVER split on colon ':' because colons introduce formulas, ratios (3:4), or coordinates!
  const m = prefix.match(/(\?|\.\s|\.\n)\s*(["\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$/);
  if (m && m.index !== undefined) {
    const isDecimal = m[1].startsWith(".") && m.index > 0 && /\d/.test(prefix[m.index - 1]);
    if (!isDecimal) {
      const punctPos = m.index + m[1].length;
      const en = text.substring(0, punctPos).trim();
      const hi = text.substring(punctPos).trim();
      return { english: en, hindi: hi, isBilingual: true };
    }
  }

  const en = text.substring(0, firstHi).trim();
  const hi = text.substring(firstHi).trim();
  return { english: en, hindi: hi, isBilingual: true };
}

// ── Smart Bilingual Option Parser ──
function splitBilingualOption(text: string): { english: string; hindi: string; isBilingual: boolean } {
  if (!text) return { english: "", hindi: "", isBilingual: false };

  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) {
    return { english: text.trim(), hindi: "", isBilingual: false };
  }

  // Common option divider: e.g. "Energy / ऊर्जा" or "8 days / 8 दिन"
  if (text.includes(" / ")) {
    const parts = text.split(" / ");
    if (parts.length >= 2) {
      const en = parts[0].trim();
      const hi = parts.slice(1).join(" / ").trim();
      if (devanagariRegex.test(hi)) {
        return { english: en, hindi: hi, isBilingual: true };
      }
    }
  }

  const firstHi = text.search(devanagariRegex);
  const en = text.substring(0, firstHi).trim();
  const hi = text.substring(firstHi).trim();
  return { english: en, hindi: hi, isBilingual: true };
}

export default function TakeTestPage({ params }: { params: Promise<{ paperId: string }> }) {
  const [paperId, setPaperId] = useState<string>("");
  const [paper, setPaper] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Exam Hall & Preferences States
  const [hasAgreed, setHasAgreed] = useState(false);
  const [launchFullscreen, setLaunchFullscreen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [languageMode, setLanguageMode] = useState<"bilingual" | "english" | "hindi">("bilingual");

  // Dynamic Auto-Translation Engine States
  const [translationsCache, setTranslationsCache] = useState<Record<number, any>>({});

  // High-Speed Asset & Translation Preloading States
  const [preloadStatus, setPreloadStatus] = useState<{
    totalImages: number;
    loadedImages: number;
    totalTranslations: number;
    loadedTranslations: number;
    isImagesDone: boolean;
    isTranslationsDone: boolean;
  }>({
    totalImages: 0,
    loadedImages: 0,
    totalTranslations: 0,
    loadedTranslations: 0,
    isImagesDone: false,
    isTranslationsDone: false,
  });

  // Timer Mode: Composite (SSC CGL 60-Min Server Clock) vs Sectional (15 Min / Section with auto-switch)
  const [timerMode, setTimerMode] = useState<"composite" | "sectional">("composite");
  const [sectionTimeLeft, setSectionTimeLeft] = useState(900); // 15 mins default
  const [showSectionSwitchModal, setShowSectionSwitchModal] = useState(false);
  const [switchCountdown, setSwitchCountdown] = useState(5);

  // Mobile Drawer State
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Exam Progression States
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);
  const [qpModalSectionId, setQpModalSectionId] = useState<number | "all">("all");
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Response / Review Sheet Filters
  const [reviewSectionId, setReviewSectionId] = useState<number | "all">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "unattempted">("all");
  const [reviewViewMode, setReviewViewMode] = useState<"sheet" | "walkthrough">("sheet");

  // Candidate Details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Question Interaction States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [currentSectionId, setCurrentSectionId] = useState(1);

  // Timer
  const [timeLeft, setTimeLeft] = useState(3600); // default 60 mins

  const attemptIdRef = useRef<number | string | null>(null);
  const userRef = useRef<any>(null);
  const router = useRouter();

  // 1. Fullscreen Listener
  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Browser blocked fullscreen. Please enable it in browser permissions.");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // 2. Prevent accidental page exit during exam
  useEffect(() => {
    if (!started || finished) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an exam in progress. Progress may be lost!";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [started, finished]);

  // 3. Resolve Params & Fetch Paper + Questions
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const resolvedParams = await params;
      const pid = resolvedParams.paperId;
      setPaperId(pid);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted && user) {
          setCurrentUser(user);
          userRef.current = user;
        }
      } catch {
        // Guest mode allowed
      }

      try {
        const [paperRes, questionsRes, settingsRes] = await Promise.all([
          supabase.from("previous_papers").select("*, exams(title)").eq("id", pid).maybeSingle(),
          supabase.from("paper_questions").select("*").eq("paper_id", pid).order("question_number", { ascending: true }),
          fetch(`/api/papers/settings?t=${Date.now()}`).then((r) => r.json()).catch(() => ({}))
        ]);

        if (!isMounted) return;

        if (paperRes.error || !paperRes.data) {
          setErrorMessage("This exam shift paper could not be loaded. Please return to the papers list.");
        } else {
          const setting = settingsRes?.[String(pid)];
          let transAllowed = true;
          if (setting !== undefined && setting.allow_translation !== undefined) {
            transAllowed = Boolean(setting.allow_translation);
          } else if (paperRes.data.allow_translation !== undefined) {
            transAllowed = Boolean(paperRes.data.allow_translation);
          } else if (String(paperRes.data.year) === "2026" || (paperRes.data.title && paperRes.data.title.includes("2026"))) {
            transAllowed = false;
          }
          const fullPaper = { ...paperRes.data, allow_translation: transAllowed };
          setPaper(fullPaper);
          const qs = questionsRes.data ?? [];
          setQuestions(qs);
          setTimeLeft((paperRes.data.duration_minutes || 60) * 60);

          // Default initial language mode: If translation is disabled, default to English
          setLanguageMode(transAllowed ? "bilingual" : "english");
        }
      } catch (err: any) {
        if (isMounted) setErrorMessage("Failed to load test paper: " + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, [params]);

  // 3b. Detect if paper has authentic native Hindi (Bilingual PDF Source)
  const hasAuthenticHindi = useMemo(() => {
    if (questions.length === 0) return false;
    let count = 0;
    for (let i = 0; i < Math.min(20, questions.length); i++) {
      const q = questions[i];
      if (q.question_text_hi || /[\u0900-\u097F]/.test(q.question_text || "")) {
        count++;
      }
    }
    return count >= 3;
  }, [questions]);

  // 4. Sections Definition (Standard SSC CGL 4-Section Split)
  const sections: SectionDef[] = useMemo(() => {
    const total = questions.length || 100;
    const durMins = paper?.duration_minutes || 60;
    const s1Mins = Math.round(durMins * 0.25);
    const s2Mins = Math.round(durMins * (10 / 60));
    const s3Mins = Math.round(durMins * (20 / 60));
    const s4Mins = Math.max(5, durMins - (s1Mins + s2Mins + s3Mins));

    if (total === 100) {
      return [
        {
          id: 1,
          name: "General Intelligence & Reasoning",
          hindiName: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति",
          shortName: "Reasoning",
          startIdx: 0,
          endIdx: 24,
          recommendedMinutes: s1Mins,
          recommendedSpeed: "~36s / Q"
        },
        {
          id: 2,
          name: "General Awareness",
          hindiName: "सामान्य जागरूकता",
          shortName: "General Awareness",
          startIdx: 25,
          endIdx: 49,
          recommendedMinutes: s2Mins,
          recommendedSpeed: "~24s / Q"
        },
        {
          id: 3,
          name: "Quantitative Aptitude",
          hindiName: "मात्रात्मक अभिरुचि / गणित",
          shortName: "Quant",
          startIdx: 50,
          endIdx: 74,
          recommendedMinutes: s3Mins,
          recommendedSpeed: "~48s / Q"
        },
        {
          id: 4,
          name: "English Comprehension",
          hindiName: "अंग्रेजी समझ",
          shortName: "English",
          startIdx: 75,
          endIdx: 99,
          recommendedMinutes: s4Mins,
          recommendedSpeed: "~36s / Q"
        },
      ];
    } else {
      const quarter = Math.ceil(total / 4);
      return [
        {
          id: 1,
          name: "Section A: Reasoning",
          hindiName: "तर्कशक्ति",
          shortName: "Section A",
          startIdx: 0,
          endIdx: Math.min(quarter - 1, total - 1),
          recommendedMinutes: s1Mins,
          recommendedSpeed: "~36s / Q"
        },
        {
          id: 2,
          name: "Section B: General Awareness",
          hindiName: "सामान्य ज्ञान",
          shortName: "Section B",
          startIdx: quarter,
          endIdx: Math.min(quarter * 2 - 1, total - 1),
          recommendedMinutes: s2Mins,
          recommendedSpeed: "~24s / Q"
        },
        {
          id: 3,
          name: "Section C: Quantitative Aptitude",
          hindiName: "गणित",
          shortName: "Section C",
          startIdx: quarter * 2,
          endIdx: Math.min(quarter * 3 - 1, total - 1),
          recommendedMinutes: s3Mins,
          recommendedSpeed: "~48s / Q"
        },
        {
          id: 4,
          name: "Section D: English Comprehension",
          hindiName: "अंग्रेजी",
          shortName: "Section D",
          startIdx: quarter * 3,
          endIdx: total - 1,
          recommendedMinutes: s4Mins,
          recommendedSpeed: "~36s / Q"
        },
      ];
    }
  }, [questions.length, paper?.duration_minutes]);

  // Helper to find question's section
  const getQuestionSection = (idx: number) => {
    return sections.find(s => idx >= s.startIdx && idx <= s.endIdx) || sections[0];
  };

  // Sync current section with current question index
  useEffect(() => {
    const sec = sections.find(s => currentIndex >= s.startIdx && currentIndex <= s.endIdx);
    if (sec && sec.id !== currentSectionId) {
      setCurrentSectionId(sec.id);
    }
    setVisited(prev => ({ ...prev, [currentIndex]: true }));
  }, [currentIndex, sections]);

  // 5. Dual Countdown Timer Hook (Composite vs Sectional)
  useEffect(() => {
    if (!started || finished || submitting) return;
    if (timeLeft <= 0) {
      void handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });

      // If Strict Sectional Timer is active and not currently in auto-switch dialog
      if (timerMode === "sectional" && !showSectionSwitchModal) {
        setSectionTimeLeft(prevSec => {
          if (prevSec <= 1) {
            handleSectionTimeExpired();
            return 0;
          }
          return prevSec - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, submitting, timeLeft, timerMode, showSectionSwitchModal, currentSectionId]);

  function handleSectionTimeExpired() {
    if (currentSectionId < sections.length) {
      setSwitchCountdown(5);
      setShowSectionSwitchModal(true);
    } else {
      // Last section (English) finished -> auto-submit full test and show result!
      void handleSubmitTest();
    }
  }

  // Auto-switch countdown ticker (5, 4, 3, 2, 1 -> auto proceed to next section)
  useEffect(() => {
    if (!showSectionSwitchModal) return;

    if (switchCountdown <= 0) {
      proceedToNextSection();
      return;
    }

    const t = setInterval(() => {
      setSwitchCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [showSectionSwitchModal, switchCountdown]);

  function proceedToNextSection() {
    setShowSectionSwitchModal(false);
    const nextSecId = currentSectionId + 1;
    const nextSec = sections.find(s => s.id === nextSecId);
    if (nextSec) {
      setCurrentSectionId(nextSec.id);
      setCurrentIndex(nextSec.startIdx);
      setSectionTimeLeft((nextSec.recommendedMinutes || 15) * 60);
      toast.success(`Section ${nextSec.id}: ${nextSec.shortName} started! (${nextSec.recommendedMinutes || 15} Mins)`);
    } else {
      void handleSubmitTest();
    }
  }

  // 5. Smart CBT Preloader: Pre-cache ALL paper images & translations before test begins
  useEffect(() => {
    if (questions.length === 0) return;
    let isCancelled = false;

    // A. Image Preloading
    const imgUrls = new Set<string>();
    const imgRegex = /!\[[^\]]*\]\(([^)\s]+)\)|<img[^>]+src=["']([^"']+)["']|\/images\/pyq\/[^\s)"']+/g;

    questions.forEach((q) => {
      const fields = [q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.explanation];
      fields.forEach((f) => {
        if (!f) return;
        let match;
        const localRegex = new RegExp(imgRegex.source, "g");
        while ((match = localRegex.exec(f)) !== null) {
          const url = match[1] || match[2] || match[0];
          if (url && (url.startsWith("/images/") || url.startsWith("http"))) {
            imgUrls.add(url);
          }
        }
      });
    });

    const urls = Array.from(imgUrls);
    let loadedImgCount = 0;

    if (urls.length > 0) {
      urls.forEach((url) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          if (isCancelled) return;
          loadedImgCount++;
          setPreloadStatus((prev) => ({
            ...prev,
            loadedImages: loadedImgCount,
            isImagesDone: loadedImgCount >= urls.length,
          }));
        };
        img.src = url;
      });
    }

    // B. Full Translation Preloading
    // Preload all questions in Sections 1-3 (Reasoning, GA, Quant) that do not yet have native Hindi
    const isEngSection = (sec: SectionDef) => {
      if (!sec) return false;
      const combined = `${sec.name} ${sec.shortName}`.toLowerCase();
      return combined.includes("english");
    };

    // If dynamic translator is disabled for this paper, do not queue machine translations
    const transNeeded = (paper && paper.allow_translation === false) ? [] : questions.filter((q, idx) => {
      const sec = getQuestionSection(idx);
      if (isEngSection(sec)) return false;
      if (q.question_text_hi || /[\u0900-\u097F]/.test(q.question_text || "")) return false;
      return true;
    });

    setPreloadStatus({
      totalImages: urls.length,
      loadedImages: loadedImgCount,
      isImagesDone: urls.length === 0 || loadedImgCount >= urls.length,
      totalTranslations: transNeeded.length,
      loadedTranslations: 0,
      isTranslationsDone: transNeeded.length === 0,
    });

    if (transNeeded.length === 0) return;

    // Background batch translation preloader: chunks of 4 questions to avoid rate-limiting
    async function preloadAllTranslations() {
      let loadedTransCount = 0;
      const chunkSize = 4;
      for (let i = 0; i < transNeeded.length; i += chunkSize) {
        if (isCancelled) break;
        const chunk = transNeeded.slice(i, i + chunkSize);
        try {
          const chunkResults = await Promise.all(
            chunk.map(async (item) => {
              const itemIdx = questions.indexOf(item);
              const isEngSec = isEngSection(getQuestionSection(itemIdx));
              const data = await translateSingleQuestion(item, isEngSec);
              return { id: item.id, data };
            })
          );
          if (isCancelled) break;
          setTranslationsCache((prev) => {
            const next = { ...prev };
            chunkResults.forEach((r) => { next[r.id] = r.data; });
            return next;
          });
          loadedTransCount += chunk.length;
          setPreloadStatus((prev) => ({
            ...prev,
            loadedTranslations: Math.min(loadedTransCount, transNeeded.length),
            isTranslationsDone: loadedTransCount >= transNeeded.length,
          }));
        } catch (err) {
          console.warn("Background translation preloader caught:", err);
        }
      }
    }

    preloadAllTranslations();

    return () => {
      isCancelled = true;
    };
  }, [questions, sections, paper]);

  // 5b. Smooth Fallback Translation Engine for Current / Next Question (in case background queue is still progressing)
  useEffect(() => {
    if (questions.length === 0) return;
    if (paper && paper.allow_translation === false) return;
    if (languageMode === "english") return;

    const isEngSection = (sec: SectionDef) => {
      if (!sec) return false;
      const combined = `${sec.name} ${sec.shortName}`.toLowerCase();
      return combined.includes("english");
    };

    const targets = [
      questions[currentIndex],
      questions[currentIndex + 1],
      questions[currentIndex + 2],
    ].filter(Boolean);

    const needed = targets.filter((item) => {
      if (!item) return false;
      const itemIdx = questions.indexOf(item);
      const sec = getQuestionSection(itemIdx >= 0 ? itemIdx : currentIndex);
      if (isEngSection(sec)) return false;
      if (item.question_text_hi || /[\u0900-\u097F]/.test(item.question_text || "")) return false;
      return !translationsCache[item.id];
    });

    if (needed.length === 0) return;

    let isMounted = true;
    async function runImmediateTranslation() {
      try {
        const results = await Promise.all(
          needed.map(async (item) => {
            const itemIdx = questions.indexOf(item);
            const isEngSec = isEngSection(getQuestionSection(itemIdx));
            const data = await translateSingleQuestion(item, isEngSec);
            return { id: item.id, data };
          })
        );

        if (isMounted) {
          setTranslationsCache((prev) => {
            const next = { ...prev };
            results.forEach((r) => { next[r.id] = r.data; });
            return next;
          });
        }
      } catch (err) {
        console.warn("Immediate translation caught:", err);
      }
    }

    runImmediateTranslation();
    return () => { isMounted = false; };
  }, [currentIndex, languageMode, questions, translationsCache, sections, paper]);

  // 6. Start Exam Handler (with Fullscreen trigger)
  async function handleStartTest() {
    if (!hasAgreed) {
      toast.error("Please accept the declaration checkbox to begin");
      return;
    }
    if (questions.length === 0) {
      toast.error("This test does not have any questions yet.");
      return;
    }

    if (promptGuestLoginGate("Your 15-minute free guest preview has completed. Please login or create a free account to attempt this CBT shift paper.")) {
      return;
    }

    setStarting(true);
    setErrorMessage("");

    // Fullscreen auto-trigger
    if (launchFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Gracefully handled if browser requires click
      }
    }

    const user = userRef.current;
    if (user && paper) {
      try {
        const { data, error } = await supabase
          .from("test_attempts")
          .insert({ user_id: user.id, paper_id: paper.id, status: "in_progress" })
          .select("id")
          .single();

        if (!error && data) {
          attemptIdRef.current = data.id;
        } else {
          attemptIdRef.current = `guest_${Date.now()}`;
        }
      } catch {
        attemptIdRef.current = `guest_${Date.now()}`;
      }
    } else {
      attemptIdRef.current = `guest_${Date.now()}`;
    }

    if (timerMode === "sectional") {
      const firstSecTime = (sections[0]?.recommendedMinutes || 15) * 60;
      setSectionTimeLeft(firstSecTime);
    }

    setStarted(true);
    setStarting(false);
    toast.success("Exam started! Best of luck.");
  }

  // 7. Submit Exam & Calculate Official Score
  async function handleSubmitTest() {
    if (submitting || finished) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    let correctCount = 0;
    let wrongCount = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        if (selected === q.correct_answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const marksObtained = correctCount * 2.0 - wrongCount * 0.5;

    const user = userRef.current;
    const attemptId = attemptIdRef.current;

    if (user && attemptId && typeof attemptId === "number") {
      try {
        const answerRows = questions.map((q) => ({
          attempt_id: attemptId,
          question_id: q.id,
          selected_answer: answers[q.id] ?? null,
          is_correct: answers[q.id] === q.correct_answer,
        }));

        await supabase.from("user_answers").insert(answerRows);
        await supabase
          .from("test_attempts")
          .update({
            end_time: new Date().toISOString(),
            score: Math.round(marksObtained),
            total_questions: questions.length,
            status: "completed",
          })
          .eq("id", attemptId);
      } catch {
        // Local scorecard still works
      }
    }

    setSubmitting(false);
    setFinished(true);
  }

  // Action Handlers
  function handleSelectOption(opt: Option) {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: opt }));
  }

  function handleSaveAndNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  }

  function handleClearResponse() {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
  }

  function handleMarkForReviewAndNext() {
    const q = questions[currentIndex];
    if (q) {
      setMarkedForReview(prev => ({ ...prev, [q.id]: true }));
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  // 5-State Status Helper
  function getQuestionStatus(idx: number): "answered" | "not_answered" | "marked" | "answered_marked" | "not_visited" {
    const q = questions[idx];
    if (!q) return "not_visited";
    const hasAnswer = !!answers[q.id];
    const isMarked = !!markedForReview[q.id];
    const hasVisited = !!visited[idx];

    if (hasAnswer && isMarked) return "answered_marked";
    if (hasAnswer) return "answered";
    if (isMarked) return "marked";
    if (hasVisited) return "not_answered";
    return "not_visited";
  }

  // Summary counts
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    questions.forEach((_, idx) => {
      const st = getQuestionStatus(idx);
      if (st === "answered") answered++;
      else if (st === "not_answered") notAnswered++;
      else if (st === "marked") marked++;
      else if (st === "answered_marked") answeredMarked++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, answeredMarked, notVisited };
  }, [questions, answers, markedForReview, visited]);

  // Section-wise analysis helper for final scorecard
  const sectionBreakdown = useMemo(() => {
    return sections.map((sec) => {
      let secCorrect = 0;
      let secWrong = 0;
      let secAttempted = 0;
      const secQs = questions.slice(sec.startIdx, sec.endIdx + 1);

      secQs.forEach((q) => {
        const sel = answers[q.id];
        if (sel) {
          secAttempted++;
          if (sel === q.correct_answer) secCorrect++;
          else secWrong++;
        }
      });

      const secScore = secCorrect * 2.0 - secWrong * 0.5;

      return {
        ...sec,
        total: secQs.length,
        attempted: secAttempted,
        correct: secCorrect,
        wrong: secWrong,
        score: Math.max(0, secScore),
      };
    });
  }, [sections, questions, answers]);

  // Filtered Questions for Review / Response Sheet
  const filteredReviewQuestions = useMemo(() => {
    let list = questions.map((q, idx) => ({ ...q, overallIdx: idx }));

    if (reviewSectionId !== "all") {
      const sec = sections.find(s => s.id === reviewSectionId);
      if (sec) {
        list = list.filter(q => q.overallIdx >= sec.startIdx && q.overallIdx <= sec.endIdx);
      }
    }

    if (reviewFilter === "correct") {
      list = list.filter(q => answers[q.id] && answers[q.id] === q.correct_answer);
    } else if (reviewFilter === "wrong") {
      list = list.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer);
    } else if (reviewFilter === "unattempted") {
      list = list.filter(q => !answers[q.id]);
    }

    return list;
  }, [questions, sections, reviewSectionId, reviewFilter, answers]);

  // Font size classes helper
  const fontClasses = useMemo(() => {
    if (fontSize === "sm") {
      return { qText: "text-xs sm:text-sm leading-relaxed", optText: "text-xs font-semibold" };
    }
    if (fontSize === "lg") {
      return { qText: "text-base sm:text-lg leading-relaxed", optText: "text-sm sm:text-base font-semibold" };
    }
    return { qText: "text-sm sm:text-base leading-relaxed", optText: "text-xs sm:text-sm font-semibold" };
  }, [fontSize]);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-bold">Initializing SSC Zone CBT Engine...</h2>
        <p className="text-xs text-slate-400 mt-1">Loading official shift paper, sectional categories, and bilingual questions</p>
      </div>
    );
  }

  // Error state
  if (errorMessage && !paper) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl border border-red-200">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Unable to Load Exam</h2>
          <p className="text-xs text-slate-600 mt-2">{errorMessage}</p>
          <Link
            href="/papers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to PYQ Papers</span>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ── 1. PRE-EXAM FIRST VIEW (AUTHENTIC SSC ZONE CBT TERMINAL) ───────
  // ═══════════════════════════════════════════════════════════════════
  if (!started && paper) {
    const candidateName = currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Aspirant";

    return (
      <div className="h-screen w-full max-w-full overflow-y-auto bg-[#F0F2F5] text-slate-800 font-sans flex flex-col justify-between select-none">
        
        {/* Top Header */}
        <header className="bg-[#1E3A8A] text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b-2 border-amber-400 shadow-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-sm border border-white/20 shrink-0">
              SSC
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                Staff Selection Commission • Government of India
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-wide truncate">
                Combined Graduate Level Examination (Tier-I) — Computer Based Test
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
            <span className="text-[11px] font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded">
              SSC Zone CBT Exam
            </span>
          </div>
        </header>

        {/* Main Terminal Screen */}
        <main className="mx-auto max-w-6xl w-full p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-5">
          
          {/* Left Column: Instructions, Section Scheme & Legend (70%) */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 min-w-0">
            <div>
              {/* Paper Title & Duration Pill */}
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs font-black text-blue-700 uppercase tracking-wide">
                    Examination Shift Paper
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {paper.title || "SSC CGL 2025 Tier-I Official Paper"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    100 Questions • 200 Marks
                  </span>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    Duration: {paper.duration_minutes || 60} Minutes
                  </span>
                </div>
              </div>

              {/* Detailed Instructions */}
              <div className="mt-4 text-xs text-slate-700 space-y-4 max-h-[50vh] overflow-y-auto pr-2 leading-relaxed [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {/* 1. Exam Pattern & Categories Table with Section Timers */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-700" />
                      <span>1. Examination Structure, Categories & Section Timers (परीक्षा संरचना एवं समय):</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {timerMode === "composite"
                        ? `Total Time: ${paper.duration_minutes || 60} Mins (Composite Server Clock)`
                        : "Strict Sectional Timer: 15 Mins / Section"}
                    </span>
                  </div>

                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <table className="w-full text-xs text-left bg-white rounded-lg border border-blue-100 overflow-hidden">
                      <thead className="bg-blue-100/70 text-blue-900 font-bold uppercase text-[11px]">
                        <tr>
                          <th className="p-2">Section / Category</th>
                          <th className="p-2 text-center">Questions</th>
                          <th className="p-2 text-center">Max Marks</th>
                          <th className="p-2 text-center text-emerald-700">Correct</th>
                          <th className="p-2 text-center text-red-600">Negative</th>
                          <th className="p-2 text-center text-blue-900 bg-blue-100">Section Timer (अनुशंसित समय)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50 font-medium">
                        {sections.map(s => (
                          <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-2 font-bold text-slate-800">
                              <span>{s.name}</span>
                              <span className="text-slate-500 font-normal ml-1">({s.hindiName})</span>
                            </td>
                            <td className="p-2 text-center">{s.endIdx - s.startIdx + 1}</td>
                            <td className="p-2 text-center">50</td>
                            <td className="p-2 text-center text-emerald-700 font-bold">+2.00</td>
                            <td className="p-2 text-center text-red-600 font-bold">-0.50</td>
                            <td className="p-2 text-center font-black text-blue-700 bg-blue-50/70">
                              ⏱️ {s.recommendedMinutes} Mins
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-blue-100/70 font-black text-blue-950 border-t-2 border-blue-200">
                        <tr>
                          <td className="p-2 font-black">Total (कुल 4 सेक्शंस)</td>
                          <td className="p-2 text-center font-black">{questions.length || 100}</td>
                          <td className="p-2 text-center font-black">200</td>
                          <td className="p-2 text-center text-emerald-700 font-black">+2.00</td>
                          <td className="p-2 text-center text-red-600 font-black">-0.50</td>
                          <td className="p-2 text-center text-blue-900 font-black bg-blue-200/80">
                            {paper.duration_minutes || 60} Mins (Composite)
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Section Timers Strategy Cards */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-slate-700">
                      💡 अनुशंसित समय आवंटन एवं परीक्षा रणनीति (Recommended Time Strategy per Section):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sections.map((s, idx) => {
                        const icons = ["🧠", "⚡", "📐", "📖"];
                        return (
                          <div
                            key={s.id}
                            className="rounded-xl border border-blue-200 bg-white p-2.5 shadow-2xs flex flex-col justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-blue-800 uppercase">
                                  Section {s.id}
                                </span>
                                <span className="text-sm">{icons[idx] || "📝"}</span>
                              </div>
                              <div className="font-black text-slate-900 text-xs truncate" title={s.name}>
                                {s.shortName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {s.hindiName}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                              <span className="text-sm sm:text-base font-black text-blue-700">
                                {s.recommendedMinutes} <span className="text-[10px] font-semibold text-slate-500">Mins</span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {s.recommendedSpeed}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Composite Server Clock Strategy Callout */}
                    <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 flex items-start gap-2.5 text-xs text-amber-950">
                      <Clock className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-900">
                          {timerMode === "composite"
                            ? "⏱️ समग्र सर्वर टाइमर सूचना (Composite 60-Minute Server Clock):"
                            : "⏱️ सख्त सेक्शनल टाइमर मोड (Strict 15-Minute Sectional Timer):"}
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-900">
                          {timerMode === "composite" ? (
                            <>
                              SSC CGL टियर-1 में <b>कोई सेक्शनल टाइम लॉक या पाबंदी नहीं होती</b>। स्क्रीन के ऊपर दाईं ओर कुल <b>60 मिनट</b> का संयुक्त सर्वर टाइमर चलेगा। आप परीक्षा के दौरान किसी भी समय किसी भी सेक्शन (रीजनिंग, सामान्य ज्ञान, गणित, अंग्रेजी) और प्रश्न पर स्वतंत्र रूप से स्विच कर सकते हैं।
                            </>
                          ) : (
                            <>
                              इस मोड में <b>प्रत्येक सेक्शन के लिए 15 मिनट</b> का समय मिलेगा। 15 मिनट पूरे होते ही 5 सेकंड का ऑटो-स्विच काउंटडाउन चलेगा, जिसके बाद सिस्टम स्वतः अगले सेक्शन को अनलॉक कर देगा। अंतिम सेक्शन समाप्त होते ही टेस्ट ऑटो-सबमिट होकर आपका स्कोरकार्ड प्रदर्शित करेगा।
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Official 5-Color Legend */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                  <div className="text-xs font-black text-slate-900 uppercase">
                    2. Question Status Symbols (प्रश्नों की स्थिति के प्रतीक):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-300 shrink-0">1</span>
                      <span>You have not visited the question yet. (देखा नहीं गया)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded bg-[#DC2626] text-white font-bold flex items-center justify-center shrink-0">2</span>
                      <span>You have not answered the question. (उत्तर नहीं दिया गया)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded bg-[#16A34A] text-white font-bold flex items-center justify-center shrink-0">3</span>
                      <span>You have answered the question. (उत्तर दिया गया)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded bg-[#7C3AED] text-white font-bold flex items-center justify-center shrink-0">4</span>
                      <span>Marked for Review without answer. (समीक्षा हेतु चिह्नित)</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className="h-6 w-6 rounded bg-[#7C3AED] text-white font-bold flex items-center justify-center border-2 border-emerald-400 shrink-0">5</span>
                      <span>Answered & Marked for Review — <b>Will be evaluated in final score!</b> (मूल्यांकन में गिना जाएगा)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Navigation & Submission Rules */}
                <div className="space-y-2 text-slate-700">
                  <p className="font-bold text-slate-900">
                    3. Language Selection (भाषा चयन):
                  </p>
                  <p>
                    General Intelligence, General Awareness, and Quantitative Aptitude sections are bilingual (English & Hindi). You can switch between English, Hindi, or dual bilingual mode at any time. <b>Note: English Comprehension questions are provided in English only.</b>
                  </p>
                  <p className="font-bold text-slate-900 pt-1">
                    4. Server Clock & Auto-Submission (सर्वर टाइमर):
                  </p>
                  <p>
                    The countdown timer at top-right displays the remaining time. When the timer reaches zero, the exam will automatically submit.
                  </p>
                </div>
              </div>
            </div>

            {/* High-Speed CBT Pre-Caching Banner */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-slate-50 p-3 sm:p-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">High-Speed CBT Exam Engine</span>
                      {preloadStatus.isImagesDone && preloadStatus.isTranslationsDone ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>100% Pre-Cached (0ms Latency)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                          <span>Pre-warming Paper Assets...</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {preloadStatus.totalImages > 0 ? (
                        <span>
                          <b>{preloadStatus.loadedImages}</b> / {preloadStatus.totalImages} Diagrams
                        </span>
                      ) : (
                        <span>All Diagrams Ready</span>
                      )}
                      {" • "}
                      {preloadStatus.totalTranslations > 0 ? (
                        <span>
                          <b>{preloadStatus.loadedTranslations}</b> / {preloadStatus.totalTranslations} Hindi Translations
                        </span>
                      ) : (
                        <span>All Translations Ready</span>
                      )}{" "}
                      pre-loaded into browser memory for zero lag during test.
                    </p>
                  </div>
                </div>

                {preloadStatus.isImagesDone && preloadStatus.isTranslationsDone && (
                  <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                    Ready to Begin
                  </span>
                )}
              </div>
            </div>

            {/* Declaration & Proceed CTA */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-800 leading-normal font-medium">
                  I have read and understood all instructions. I declare that I will attempt this test honestly simulating real SSC CGL Computer Based Examination conditions.
                </span>
              </label>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                  href="/papers"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  ← Exit to Papers
                </Link>

                <button
                  disabled={!hasAgreed || starting || questions.length === 0}
                  onClick={handleStartTest}
                  className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white px-8 py-3 text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <span>{starting ? "Launching Exam Server..." : "I am ready to begin / मैं तैयार हूँ"}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Candidate Terminal & Preferences (30%) */}
          <div className="w-full lg:w-80 space-y-4 shrink-0">
            
            {/* Candidate Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-sm text-center space-y-3">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 p-1 shadow-md">
                <div className="h-full w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-2xl">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-slate-900 truncate">{candidateName}</div>
                <div className="text-xs text-slate-500 font-medium">Candidate Roll No: 2405019823</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <Monitor className="h-3 w-3" /> System: C9-LAB-04
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Exam Venue:</span>
                  <span className="font-bold text-slate-800">SSC Zone CBT Lab</span>
                </div>
                <div className="flex justify-between">
                  <span>Exam Tier:</span>
                  <span className="font-bold text-slate-800">Tier-I Simulation</span>
                </div>
                <div className="flex justify-between">
                  <span>Marking:</span>
                  <span className="font-bold text-emerald-700">+2.00 / -0.50</span>
                </div>
              </div>
            </div>

            {/* Exam Preferences & Fullscreen Toggle */}
            <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm space-y-3">
              <div className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                Exam Hall Setup (परीक्षा सेटअप)
              </div>

              {/* Language Choice (Fully Unlocked & Selectable) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Default Question Paper Language:
                </label>
                {paper?.allow_translation === false && !hasAuthenticHindi ? (
                  <div className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>English (Official Exam Paper)</span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded">Standard</span>
                  </div>
                ) : (
                  <select
                    value={languageMode}
                    onChange={(e) => setLanguageMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="bilingual">Bilingual (English + Hindi)</option>
                    <option value="english">English Only</option>
                    <option value="hindi">Hindi Only</option>
                  </select>
                )}
              </div>

              {/* Fullscreen Option */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={launchFullscreen}
                  onChange={(e) => setLaunchFullscreen(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Maximize className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  Launch in Fullscreen Mode
                </span>
              </label>

              {/* Timer & Section Navigation Mode (Composite 60 Mins vs Strict Sectional 15 Mins) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>Timer & Section Navigation Mode:</span>
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setTimerMode("composite")}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      timerMode === "composite"
                        ? "border-blue-600 bg-blue-50/70 shadow-2xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timerModeRadio"
                      value="composite"
                      checked={timerMode === "composite"}
                      onChange={() => setTimerMode("composite")}
                      className="mt-0.5 h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>Composite Timer (60 Mins)</span>
                        <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                          SSC CGL Standard
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                        60 मिनट का संयुक्त सर्वर टाइमर। अभ्यर्थी किसी भी समय किसी भी सेक्शन में स्वतंत्र रूप से जा सकते हैं।
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setTimerMode("sectional")}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      timerMode === "sectional"
                        ? "border-blue-600 bg-blue-50/70 shadow-2xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timerModeRadio"
                      value="sectional"
                      checked={timerMode === "sectional"}
                      onChange={() => setTimerMode("sectional")}
                      className="mt-0.5 h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>Sectional Timer (15 Min / Section)</span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                          Eduquity / Strict
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                        प्रत्येक सेक्शन के लिए 15 मिनट। सेक्शन का समय समाप्त होने पर अगला सेक्शन स्वतः चालू हो जाएगा।
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ── 2. SCORECARD & RESPONSE SHEET (WITH CATEGORY-WISE FILTERS) ────
  // ═══════════════════════════════════════════════════════════════════
  if (finished && !reviewMode) {
    let correctCount = 0;
    let wrongCount = 0;
    questions.forEach((q) => {
      const sel = answers[q.id];
      if (sel) {
        if (sel === q.correct_answer) correctCount++;
        else wrongCount++;
      }
    });

    const unattempted = questions.length - (correctCount + wrongCount);
    const rawMarks = correctCount * 2.0 - wrongCount * 0.5;
    const finalScore = Math.max(0, rawMarks);
    const accuracy = correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

    return (
      <div className="h-screen w-full max-w-full overflow-y-auto bg-[#F0F2F5] p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Top Score Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Exam Completed Successfully
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {paper?.title || "SSC CGL 2025 Tier-I Shift Paper"}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Official SSC Marking Scheme Applied (+2.00 Correct, -0.50 Incorrect)
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 text-center border border-white/20 min-w-[180px]">
              <span className="text-xs font-bold text-slate-300 uppercase">Your Total Score</span>
              <div className="text-4xl font-black text-amber-300 mt-1">
                {finalScore.toFixed(2)}
                <span className="text-sm font-semibold text-slate-400"> / 200</span>
              </div>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-300">
                {accuracy}% Accuracy
              </span>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase">Correct (+2)</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{correctCount}</div>
              <span className="text-[11px] text-slate-400">+{correctCount * 2} Marks</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <span className="text-xs font-bold text-red-600 uppercase">Incorrect (-0.5)</span>
              <div className="text-2xl font-black text-red-600 mt-1">{wrongCount}</div>
              <span className="text-[11px] text-slate-400">-{wrongCount * 0.5} Marks</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Unattempted</span>
              <div className="text-2xl font-black text-slate-700 mt-1">{unattempted}</div>
              <span className="text-[11px] text-slate-400">0 Marks</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <span className="text-xs font-bold text-blue-600 uppercase">Total Questions</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{questions.length}</div>
              <span className="text-[11px] text-slate-400">100% Evaluated</span>
            </div>
          </div>

          {/* Sectional Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-black text-slate-900">
                Category-Wise Performance Breakdown (अनुभाग-वार अंक)
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                4 Sections • 25 Qs Each
              </span>
            </div>

            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Section / Category Name</th>
                    <th className="p-3 text-center">Total Qs</th>
                    <th className="p-3 text-center">Attempted</th>
                    <th className="p-3 text-center text-emerald-600">Correct</th>
                    <th className="p-3 text-center text-red-600">Wrong</th>
                    <th className="p-3 text-right">Score (/50)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sectionBreakdown.map((sec) => (
                    <tr key={sec.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">
                        <div>{sec.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{sec.hindiName}</div>
                      </td>
                      <td className="p-3 text-center">{sec.total}</td>
                      <td className="p-3 text-center font-bold">{sec.attempted}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{sec.correct}</td>
                      <td className="p-3 text-center font-bold text-red-500">{sec.wrong}</td>
                      <td className="p-3 text-right font-black text-blue-700">{sec.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              href="/papers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3 text-xs font-bold text-slate-700 shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to PYQ Papers List</span>
            </Link>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setReviewMode(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 py-3 text-xs sm:text-sm font-black text-white shadow-md cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>View Official Response Sheet & Solutions (हल व रिस्पॉन्स देखें)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ── 3. OFFICIAL RESPONSE SHEET & DETAILED REVIEW MODE ─────────────
  // ═══════════════════════════════════════════════════════════════════
  if (finished && reviewMode) {
    return (
      <div className="h-screen w-full max-w-full overflow-y-auto bg-[#F0F2F5] flex flex-col font-sans select-none">
        
        {/* Header */}
        <header className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-blue-400">
              Official Candidate Response Sheet & Solutions
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {paper?.title || "SSC CGL 2025 Tier-I Examination"}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Sheet vs Walkthrough */}
            <div className="hidden sm:flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-bold">
              <button
                onClick={() => setReviewViewMode("sheet")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  reviewViewMode === "sheet" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Official List View
              </button>
              <button
                onClick={() => setReviewViewMode("walkthrough")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  reviewViewMode === "walkthrough" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                1-by-1 Walkthrough
              </button>
            </div>

            <button
              onClick={() => setReviewMode(false)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Back to Scorecard
            </button>
          </div>
        </header>

        {/* Category Tabs & Status Filters Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 shadow-2xs space-y-2.5 sticky top-[57px] z-20">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
            <button
              onClick={() => setReviewSectionId("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                reviewSectionId === "all"
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              All Sections (100)
            </button>

            {sections.map(s => {
              const secQs = questions.slice(s.startIdx, s.endIdx + 1);
              const isSelected = reviewSectionId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setReviewSectionId(s.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {s.shortName} ({secQs.length})
                </button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
            {[
              { id: "all", label: "All Questions" },
              { id: "correct", label: "Correct Only ✅" },
              { id: "wrong", label: "Incorrect Only ❌" },
              { id: "unattempted", label: "Unattempted ⚪" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setReviewFilter(f.id as any)}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  reviewFilter === f.id
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              Showing {filteredReviewQuestions.length} questions
            </span>
          </div>
        </div>

        {/* Review Mode View Options */}
        {reviewViewMode === "sheet" ? (
          
          /* ── View A: Official Response Sheet Format ── */
          <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
            {filteredReviewQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <HelpCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <div className="text-sm font-bold text-slate-700">No questions match this filter.</div>
                <button
                  onClick={() => { setReviewFilter("all"); setReviewSectionId("all"); }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredReviewQuestions.map((q) => {
                const userChoice = answers[q.id];
                const isCorrect = userChoice === q.correct_answer;
                const isAttempted = !!userChoice;
                const qSection = getQuestionSection(q.overallIdx);

                return (
                  <div
                    key={q.id}
                    id={`review-q-${q.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Question Header & Category Badge */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-blue-700 text-white px-2.5 py-0.5 rounded-md">
                          {qSection.name}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Q.{q.question_number || q.overallIdx + 1}
                        </span>
                      </div>

                      {/* Candidate Response Status Pill */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAttempted && isCorrect && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                            ✅ Attempted & Correct (+2.00)
                          </span>
                        )}
                        {isAttempted && !isCorrect && (
                          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md">
                            ❌ Attempted & Incorrect (-0.50)
                          </span>
                        )}
                        {!isAttempted && (
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                            ⚪ Not Attempted (0.00)
                          </span>
                        )}
                        <span className="text-xs font-black text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                          Official Key: {q.correct_answer}
                        </span>
                        <ReportButton questionId={q.id} questionText={q.question_text} showLabel={true} />
                      </div>
                    </div>

                    {/* Question Text (with Bilingual Support in Review) */}
                    {(() => {
                      const isEngSec = (qSection.name + " " + qSection.shortName).toLowerCase().includes("english");
                      const qSplit = splitBilingualText(q.question_text);
                      const transQ = translationsCache[q.id];
                      const enQ = qSplit.english || q.question_text;
                      const hiQ = isEngSec ? "" : (qSplit.hindi || q.question_text_hi || transQ?.question_text || "");

                      if (hiQ && hiQ !== enQ) {
                        return (
                          <div className="space-y-2">
                            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed break-words">
                              <MathText text={enQ} />
                            </div>
                            <div className="border-t border-slate-200 pt-2 text-xs sm:text-sm text-slate-700 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">हिन्दी अनुवाद:</span>
                              <MathText text={hiQ} />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed break-words">
                          <MathText text={enQ} />
                        </div>
                      );
                    })()}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {OPTIONS.map((opt) => {
                        const optText = q[`option_${opt.toLowerCase()}`];
                        if (!optText) return null;
                        const isOptionCorrect = q.correct_answer === opt;
                        const isOptionChosen = userChoice === opt;

                        const isEngSec = (qSection.name + " " + qSection.shortName).toLowerCase().includes("english");
                        const optSplit = splitBilingualOption(optText);
                        const transQ = translationsCache[q.id];
                        const enOpt = optSplit.english || optText;
                        const hiOpt = isEngSec ? "" : (optSplit.hindi || q[`option_${opt.toLowerCase()}_hi`] || transQ?.[`option_${opt.toLowerCase()}`] || "");
                        const optDisplay = (hiOpt && hiOpt !== enOpt) ? `${enOpt}  /  ${hiOpt}` : enOpt;

                        let style = "bg-slate-50 border-slate-200 text-slate-700";
                        if (isOptionCorrect) {
                          style = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400";
                        } else if (isOptionChosen && !isOptionCorrect) {
                          style = "bg-red-50 border-red-300 text-red-900 font-bold";
                        }

                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${style}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black border border-slate-300">
                              {opt}
                            </span>
                            <span className="flex-1 break-words">
                              <MathText text={optDisplay} />
                            </span>
                            {isOptionCorrect && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                            {isOptionChosen && !isOptionCorrect && <X className="h-4 w-4 text-red-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Official Solution / Explanation */}
                    {q.explanation && (
                      <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1">
                        <div className="font-bold text-blue-900">Official Solution & Explanation:</div>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </main>
        ) : (
          
          /* ── View B: 1-by-1 Interactive Walkthrough Mode ── */
          <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5">
            {(() => {
              const currentReviewQ = questions[currentIndex];
              if (!currentReviewQ) return null;
              const userChoice = answers[currentReviewQ.id];
              const isCorrect = userChoice === currentReviewQ.correct_answer;
              const qSection = getQuestionSection(currentIndex);

              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-700 text-white px-2.5 py-0.5 rounded-md">
                        {qSection.name}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {userChoice && isCorrect && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                          ✅ Correct (+2.00)
                        </span>
                      )}
                      {userChoice && !isCorrect && (
                        <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md">
                          ❌ Incorrect (-0.50)
                        </span>
                      )}
                      {!userChoice && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          ⚪ Skipped (0 Marks)
                        </span>
                      )}
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                        Official Key: {currentReviewQ.correct_answer}
                      </span>
                      <ReportButton questionId={currentReviewQ.id} questionText={currentReviewQ.question_text} showLabel={true} />
                    </div>
                  </div>

                  <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed break-words">
                    <MathText text={currentReviewQ.question_text} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {OPTIONS.map((opt) => {
                      const isOptionCorrect = currentReviewQ.correct_answer === opt;
                      const isOptionChosen = userChoice === opt;

                      let style = "bg-slate-50 border-slate-200 text-slate-700";
                      if (isOptionCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                      else if (isOptionChosen && !isOptionCorrect) style = "bg-red-50 border-red-300 text-red-900 font-bold";

                      return (
                        <div key={opt} className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${style}`}>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black border">
                            {opt}
                          </span>
                          <span className="flex-1 break-words"><MathText text={currentReviewQ[`option_${opt.toLowerCase()}`]} /></span>
                          {isOptionCorrect && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                          {isOptionChosen && !isOptionCorrect && <X className="h-4 w-4 text-red-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {currentReviewQ.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-blue-900">Official Solution & Explanation:</div>
                      <MathText text={currentReviewQ.explanation} />
                    </div>
                  )}

                  {/* Navigation in Walkthrough Mode */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs font-bold text-slate-400">
                      {currentIndex + 1} / {questions.length}
                    </span>
                    <button
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}
          </main>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ── 4. ACTIVE CBT EXAM INTERFACE (PURE DESKTOP/MOBILE RESPONSIVE) ─
  // ═══════════════════════════════════════════════════════════════════
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentSelectedOpt = answers[currentQ.id];
  const currentSection = getQuestionSection(currentIndex);

  // Dynamic Section Language Rules & Auto-Translation
  const isEnglishSection = (currentSection.name + " " + currentSection.shortName).toLowerCase().includes("english");
  const splitQ = splitBilingualText(currentQ.question_text);
  const trans = translationsCache[currentQ.id];
  const enQuestionText = splitQ.english || currentQ.question_text;
  const hiQuestionText = isEnglishSection 
    ? "" 
    : (splitQ.hindi || currentQ.question_text_hi || trans?.question_text || "");
  const questionHasHindi = !!hiQuestionText || /[\u0900-\u097F]/.test(currentQ.question_text);

  // Reusable Question Palette Content (rendered in sidebar on desktop, drawer on mobile)
  const renderPaletteContent = () => (
    <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
      {/* Palette Summary Legend */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5 shadow-xs">
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1 flex items-center justify-between">
          <span>Question Status Legend</span>
          <span className="text-blue-700 font-bold">{questions.length} Qs</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-[#16A34A] text-white font-black flex items-center justify-center text-[10px] shrink-0">
              {summaryCounts.answered}
            </span>
            <span>Answered</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-[#DC2626] text-white font-black flex items-center justify-center text-[10px] shrink-0">
              {summaryCounts.notAnswered}
            </span>
            <span>Not Answered</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-[#7C3AED] text-white font-black flex items-center justify-center text-[10px] shrink-0">
              {summaryCounts.marked}
            </span>
            <span>Marked</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px] border border-slate-300 shrink-0">
              {summaryCounts.notVisited}
            </span>
            <span>Not Visited</span>
          </div>
        </div>
      </div>

      {/* Current Section Title */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 pt-1">
        <span>Section Questions:</span>
        <span className="text-blue-700 font-black truncate max-w-[140px]">
          {currentSection.shortName}
        </span>
      </div>

      {/* Question Number Grid for Current Section */}
      <div className="grid grid-cols-5 gap-1.5 p-1">
        {(() => {
          const sec = currentSection;
          const list = [];
          for (let i = sec.startIdx; i <= sec.endIdx && i < questions.length; i++) {
            const status = getQuestionStatus(i);
            const isCurrent = i === currentIndex;

            let bg = "bg-slate-200 text-slate-700 border-slate-300"; // not visited
            if (status === "answered") bg = "bg-[#16A34A] text-white border-[#15803D]";
            else if (status === "not_answered") bg = "bg-[#DC2626] text-white border-red-700";
            else if (status === "marked") bg = "bg-[#7C3AED] text-white border-purple-700";
            else if (status === "answered_marked") bg = "bg-[#7C3AED] text-white border-emerald-400 ring-2 ring-emerald-400";

            list.push(
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setMobilePaletteOpen(false);
                }}
                className={`h-8 w-full rounded-md border text-xs font-black transition-all flex items-center justify-center cursor-pointer ${bg} ${
                  isCurrent ? "ring-2 ring-offset-1 ring-blue-600 scale-105" : ""
                }`}
              >
                {i + 1}
              </button>
            );
          }
          return list;
        })()}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full max-w-full flex flex-col bg-[#F3F4F6] text-slate-800 font-sans select-none overflow-hidden">
      
      {/* ── 1. Examination Top Header ── */}
      <header className="bg-[#1E3A8A] text-white px-3 sm:px-5 py-2 flex items-center justify-between border-b-2 border-amber-400 shrink-0 shadow-sm z-20 max-w-full">
        
        {/* Left: Emblem & Exam Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="h-8 w-8 rounded bg-white text-[#1E3A8A] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            SSC
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wide leading-tight truncate">
              {paper?.title || "SSC CGL (Tier-I) Computer Based Examination - 2025"}
            </h1>
            <p className="text-[10px] text-blue-200 hidden sm:block truncate">
              SSC Zone CBT Examination Portal
            </p>
          </div>
        </div>

        {/* Center / Right Controls (Clean, Responsive, No Overflow) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Zoom Adjuster (A-, A, A+) */}
          <div className="hidden lg:flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20 text-[11px] font-bold">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${fontSize === "sm" ? "bg-white text-blue-900" : "text-white hover:bg-white/10"}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${fontSize === "base" ? "bg-white text-blue-900" : "text-white hover:bg-white/10"}`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${fontSize === "lg" ? "bg-white text-blue-900" : "text-white hover:bg-white/10"}`}
              title="Large text"
            >
              A+
            </button>
          </div>

          {/* Question Paper Trigger */}
          <button
            onClick={() => setShowQuestionPaperModal(true)}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-bold transition-all cursor-pointer"
            title="View full Question Paper"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden md:inline">Question Paper</span>
          </button>

          {/* Instructions Trigger */}
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-bold transition-all cursor-pointer"
            title="View Instructions"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden md:inline">Instructions</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-bold transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs sm:text-sm font-black ${
              (timerMode === "sectional" ? sectionTimeLeft : timeLeft) < 180
                ? "bg-red-600 text-white border-red-700 animate-pulse"
                : "bg-white/10 text-white border-white/20"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            {timerMode === "sectional" ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 hidden sm:inline">
                  Sec {currentSectionId}:
                </span>
                <span>{formatTimer(sectionTimeLeft)}</span>
                <span className="text-[10px] text-blue-200 hidden md:inline font-normal">
                  (Tot: {formatTimer(timeLeft)})
                </span>
              </div>
            ) : (
              <span>{formatTimer(timeLeft)}</span>
            )}
          </div>

          {/* Candidate Node Card */}
          <div className="hidden xl:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/20">
            <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-left text-[10px] leading-tight">
              <div className="font-bold text-white truncate max-w-[80px]">
                {currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Aspirant"}
              </div>
              <div className="text-blue-200">C9-LAB-04</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Sectional Tabs & Language Switcher Bar (Hidden scrollbar) ── */}
      <div className="bg-[#E5E7EB] border-b border-slate-300 px-3 sm:px-5 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 z-10 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Sections Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-600 hidden sm:inline mr-1">
            Sections:
          </span>
          {sections.map((sec) => {
            const isActive = currentSectionId === sec.id;
            const secQs = questions.slice(sec.startIdx, sec.endIdx + 1);
            const answeredInSec = secQs.filter(q => !!answers[q.id]).length;
            const isLocked = timerMode === "sectional" && !isActive;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  if (isLocked) {
                    toast.error(`Strict Sectional Mode Active: Section ${sec.id} will unlock when the current section finishes.`);
                    return;
                  }
                  setCurrentSectionId(sec.id);
                  setCurrentIndex(sec.startIdx);
                }}
                title={isLocked ? "Section locked until current section ends" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-t-lg border-t-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-900 border-blue-700 shadow-xs cursor-pointer"
                    : isLocked
                    ? "bg-slate-200/50 text-slate-400 border-transparent opacity-70 cursor-not-allowed"
                    : "bg-slate-200/80 text-slate-700 border-transparent hover:bg-slate-200 cursor-pointer"
                }`}
              >
                <span>{sec.shortName}</span>
                <span className="text-[10px] font-semibold text-slate-500 hidden md:inline">({sec.recommendedMinutes}m)</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                  {answeredInSec}/{secQs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side of section bar: Mobile Palette Toggle + Language Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Mobile Palette Drawer Toggle Button */}
          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-blue-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Palette</span>
          </button>

          {/* Language Mode: if official English paper with translation disabled, show clean badge */}
          {paper?.allow_translation === false && !hasAuthenticHindi ? (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs text-[11px] font-bold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              <span>English (Official Paper)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
              <button
                onClick={() => setLanguageMode("bilingual")}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  languageMode === "bilingual" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Bilingual
              </button>
              <button
                onClick={() => setLanguageMode("english")}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  languageMode === "english" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguageMode("hindi")}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  languageMode === "hindi" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Main Center Workspace (Zero Outer Scrollbar) ── */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden max-w-full">
        
        {/* Left: Question Card Body (Takes full width on mobile, flexible on desktop) */}
        <div className="flex-1 min-w-0 flex flex-col bg-white min-h-0 overflow-hidden">
          
          {/* Question Subheader WITH EXPLICIT SECTION / CATEGORY BADGE */}
          <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 border-b border-blue-100 px-3 sm:px-5 py-2 flex items-center justify-between flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider bg-blue-700 text-white px-2 py-0.5 rounded shadow-2xs">
                {currentSection.name}
              </span>
              <span className="text-xs font-black text-slate-900">
                Q.{currentIndex + 1}
              </span>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                (Section Q.{currentIndex - currentSection.startIdx + 1} of {currentSection.endIdx - currentSection.startIdx + 1})
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +2.00
              </span>
              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                -0.50
              </span>
              <CollectQuestionButton
                question={{
                  questionId: currentQ.id,
                  question_text: currentQ.question_text,
                  question_text_hi: currentQ.question_text_hi,
                  option_a: currentQ.option_a,
                  option_b: currentQ.option_b,
                  option_c: currentQ.option_c,
                  option_d: currentQ.option_d,
                  correct_answer: currentQ.correct_answer,
                  explanation: currentQ.explanation,
                  subject: currentSection.name,
                  source: "pyq",
                  sourceTitle: paper?.title || "PYQ Shift Paper",
                }}
                showLabel={true}
              />
              <ReportButton questionId={currentQ.id} questionText={currentQ.question_text} showLabel={true} />
            </div>
          </div>

          {/* Question Statement & Options (Scrollable, Clean Scrollbar) */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 break-words [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* Dynamic Question Text by Language Mode */}
            {(() => {
              // 1. English Mode Selected (Or English Comprehension Section in any mode)
              if (languageMode === "english" || isEnglishSection) {
                return (
                  <div className="space-y-2">
                    {isEnglishSection && languageMode !== "english" && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>English Comprehension (अंग्रेजी भाषा समझ) के प्रश्न केवल अंग्रेजी में ही होते हैं।</span>
                      </div>
                    )}
                    <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                      <MathText text={enQuestionText || currentQ.question_text} />
                    </div>
                  </div>
                );
              }

              // 2. Hindi Mode Selected (for Reasoning, GA, Quant)
              if (languageMode === "hindi") {
                if (hiQuestionText) {
                  // Failsafe: If English statement contains equations/numbers but Hindi is just a short prompt (e.g. "मान ज्ञात कीजिए:"),
                  // render the full equation along with Hindi prompt so no formula is ever hidden!
                  const enHasMath = /\d|[\+\-\*\/\^=√%]/.test(enQuestionText || currentQ.question_text);
                  const hiHasMath = /\d|[\+\-\*\/\^=√%]/.test(hiQuestionText);
                  const hiIsJustShortPrompt = hiQuestionText.length < 35 && !hiHasMath;

                  if (enHasMath && hiIsJustShortPrompt) {
                    return (
                      <div className="space-y-2.5">
                        <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                          <MathText text={enQuestionText || currentQ.question_text} />
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <MathText text={hiQuestionText} />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                      <MathText text={hiQuestionText} />
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <span>मूल प्रश्न (Original Statement)</span>
                      </div>
                      <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                        <MathText text={enQuestionText || currentQ.question_text} />
                      </div>
                    </div>
                  );
                }
              }

              // 3. Bilingual Mode (Default)
              if (hiQuestionText && hiQuestionText !== enQuestionText) {
                return (
                  <div className="space-y-3">
                    <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                      <MathText text={enQuestionText} />
                    </div>
                    <div className="border-t border-slate-200 pt-2.5 text-slate-800 font-medium leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <span>हिन्दी प्रश्न (Official Hindi):</span>
                      </div>
                      <div className={`${fontClasses.qText} break-words`}>
                        <MathText text={hiQuestionText} />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className={`font-semibold text-slate-900 ${fontClasses.qText} break-words`}>
                  <MathText text={enQuestionText || currentQ.question_text} />
                </div>
              );
            })()}

            {/* Options List */}
            <div className="space-y-2 pt-2">
              {OPTIONS.map((opt) => {
                const optRaw = currentQ[`option_${opt.toLowerCase()}`];
                if (!optRaw) return null;
                const isSelected = currentSelectedOpt === opt;

                const splitOpt = splitBilingualOption(optRaw);
                const enOpt = splitOpt.english || optRaw;
                const hiOpt = isEnglishSection
                  ? ""
                  : (splitOpt.hindi || currentQ[`option_${opt.toLowerCase()}_hi`] || trans?.[`option_${opt.toLowerCase()}`] || "");

                let displayOpt = optRaw;
                if (languageMode === "english" || isEnglishSection) {
                  displayOpt = enOpt;
                } else if (languageMode === "hindi") {
                  displayOpt = hiOpt || enOpt;
                } else {
                  // Bilingual mode
                  if (hiOpt && hiOpt !== enOpt) {
                    displayOpt = `${enOpt}  /  ${hiOpt}`;
                  } else {
                    displayOpt = optRaw;
                  }
                }

                return (
                  <label
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-600 text-slate-900 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt)}
                      className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 border border-slate-300">
                      {opt}
                    </span>
                    <span className={`${fontClasses.optText} flex-1 break-words`}>
                      <MathText text={displayOpt} />
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Bottom Action Navigation Bar (Responsive, Never Wraps awkwardly) ── */}
          <div className="bg-[#F8FAFC] border-t border-slate-300 p-2 sm:p-3 px-3 sm:px-5 flex items-center justify-between flex-wrap gap-2 shrink-0 max-w-full">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleMarkForReviewAndNext}
                className="rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Mark for Review
              </button>

              <button
                onClick={handleClearResponse}
                disabled={!currentSelectedOpt}
                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                Clear
              </button>

              <ReportButton questionId={currentQ.id} questionText={currentQ.question_text} showLabel={true} />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              <button
                onClick={handleSaveAndNext}
                className="rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white px-4 sm:px-5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <span>Save & Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {timerMode === "sectional" && currentSectionId < sections.length ? (
                <button
                  onClick={handleSectionTimeExpired}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1"
                  title="Finish current section and move to next"
                >
                  <span>Next Section</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="rounded-lg bg-[#1E3A8A] hover:bg-blue-900 text-white px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Palette Panel (Desktop: Fixed sidebar | Mobile: Hidden) */}
        <div className="hidden md:flex w-72 lg:w-80 bg-[#F9FAFB] flex-col justify-between shrink-0 overflow-hidden border-l border-slate-300">
          {renderPaletteContent()}

          {/* Submit Button in Palette */}
          <div className="p-3 bg-white border-t border-slate-200">
            <button
              onClick={() => {
                if (timerMode === "sectional" && currentSectionId < sections.length) {
                  handleSectionTimeExpired();
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="w-full rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white py-2 text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {timerMode === "sectional" && currentSectionId < sections.length
                  ? `Finish Section ${currentSectionId} & Next →`
                  : "Final Submit Test"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Mobile Palette Slide-over Drawer ── */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150">
          <div className="w-4/5 max-w-xs h-full bg-[#F9FAFB] shadow-2xl flex flex-col justify-between">
            <div className="bg-[#1E3A8A] text-white p-3 flex items-center justify-between">
              <span className="text-xs font-black tracking-wide">Question Palette</span>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderPaletteContent()}

            <div className="p-3 bg-white border-t border-slate-200">
              <button
                onClick={() => {
                  setMobilePaletteOpen(false);
                  setShowSubmitModal(true);
                }}
                className="w-full rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white py-2 text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section Auto-Switch Modal (Strict Sectional Mode) ── */}
      {showSectionSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Clock className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Section {currentSectionId} Time Expired! (समय समाप्त)
              </h3>
              <p className="text-xs text-slate-600">
                {currentSection?.name} का 15 मिनट का समय पूरा हो गया है। अब अगला सेक्शन प्रारंभ हो रहा है।
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-4 space-y-1.5">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                Next Section ({currentSectionId + 1} of {sections.length}):
              </div>
              <div className="text-sm sm:text-base font-black text-blue-800">
                {sections.find(s => s.id === currentSectionId + 1)?.name}
              </div>
              <div className="text-xs font-bold text-emerald-700 pt-1 flex items-center justify-center gap-1.5">
                <span>Auto-switching in</span>
                <span className="text-base font-black text-red-600 font-mono px-2 py-0.5 rounded bg-white border border-red-200">{switchCountdown}s</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={proceedToNextSection}
                className="w-full rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-3 text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Next Section / आगे बढ़ें ({switchCountdown}s)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Question Paper Modal ── */}
      {showQuestionPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Question Paper (संपूर्ण प्रश्न पत्र)
                </h3>
                <p className="text-xs text-slate-500">
                  Click on any question to directly jump to it in your test.
                </p>
              </div>
              <button
                onClick={() => setShowQuestionPaperModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section Filter inside QP modal */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setQpModalSectionId("all")}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  qpModalSectionId === "all" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                All (100)
              </button>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setQpModalSectionId(s.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    qpModalSectionId === s.id ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {s.shortName}
                </button>
              ))}
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              {questions
                .filter(q => {
                  if (qpModalSectionId === "all") return true;
                  const sec = sections.find(s => s.id === qpModalSectionId);
                  if (!sec) return true;
                  const idx = questions.indexOf(q);
                  return idx >= sec.startIdx && idx <= sec.endIdx;
                })
                .map((q) => {
                  const idx = questions.indexOf(q);
                  const isAnswered = !!answers[q.id];

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowQuestionPaperModal(false);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-700 group-hover:underline">
                          Question {idx + 1}
                        </span>
                        {isAnswered ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Answered ({answers[q.id]})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Not Answered
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-800 line-clamp-2 break-words">
                        <MathText text={q.question_text} />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowQuestionPaperModal(false)}
                className="rounded-xl bg-slate-800 text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Instructions Modal ── */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Examination Instructions (निर्देश)
              </h3>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700 pr-2 leading-relaxed [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <p className="font-bold text-slate-900">
                1. Marking Scheme:
              </p>
              <p>
                Each correct answer awards <b>+2.00 marks</b>. For each wrong answer, <b>0.50 marks</b> will be deducted. Unattempted questions carry zero marks.
              </p>

              <p className="font-bold text-slate-900 pt-1">
                2. Status Colors:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-[#16A34A] text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-[#DC2626] text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-[#7C3AED] text-white font-bold flex items-center justify-center text-[10px]">4</span>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-300">1</span>
                  <span>Not Visited</span>
                </div>
              </div>

              {/* Section Timers Quick Reference */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-2">
                <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-700" />
                  <span>Section Timing & Strategy (अनुशंसित समय):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {sections.map(s => (
                    <div key={s.id} className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{s.shortName}</div>
                      <div className="text-blue-700 font-black text-xs">{s.recommendedMinutes} Mins</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{s.recommendedSpeed}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-blue-950 font-medium leading-relaxed">
                  ⏱️ <b>Composite Clock:</b> SSC CGL में कोई सेक्शनल टाइम बाउंडेशन नहीं है। कुल 60 मिनट का कंपोजिट टाइमर चल रहा है। आप किसी भी समय किसी भी सेक्शन में जा सकते हैं।
                </p>
              </div>

              <p className="font-bold text-slate-900 pt-1">
                3. Saving Your Answer:
              </p>
              <p>
                Click <b>Save & Next</b> to save your chosen option and proceed to the next question.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Back to Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Submission Summary Dialog ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Exam Submission Confirmation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to submit the exam? Check your summary below.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Table */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Category / Section</th>
                    <th className="p-2.5 text-center">Total Qs</th>
                    <th className="p-2.5 text-center text-emerald-600">Answered</th>
                    <th className="p-2.5 text-center text-red-600">Not Answered</th>
                    <th className="p-2.5 text-center text-purple-600">Marked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {sections.map((sec) => {
                    const secQs = questions.slice(sec.startIdx, sec.endIdx + 1);
                    const ansCnt = secQs.filter(q => !!answers[q.id]).length;
                    const markCnt = secQs.filter(q => !!markedForReview[q.id]).length;
                    const notAnsCnt = secQs.length - ansCnt;

                    return (
                      <tr key={sec.id}>
                        <td className="p-2.5 font-bold text-slate-800">{sec.shortName}</td>
                        <td className="p-2.5 text-center">{secQs.length}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">{ansCnt}</td>
                        <td className="p-2.5 text-center text-red-500 font-bold">{notAnsCnt}</td>
                        <td className="p-2.5 text-center text-purple-600">{markCnt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Resume Exam / वापस जाएं
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitTest}
                className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-2.5 text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                {submitting ? "Submitting..." : "Yes, Submit Exam / जमा करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
