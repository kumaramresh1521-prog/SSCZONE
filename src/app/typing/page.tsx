"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Keyboard,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  FileText,
  Volume2,
  VolumeX,
  Trophy,
  ShieldAlert,
  Settings2,
  Play,
  Upload,
  Info,
  ChevronDown,
  Check,
  AlertTriangle,
  Send,
  Sparkles,
  Maximize2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import {
  TypingPassage,
  DEFAULT_TYPING_PASSAGES,
  getStoredTypingPassages,
  saveTypingPassage
} from "@/lib/typing-store";

type CategoryType = "UR" | "OBC_EWS" | "SC_ST";

export default function TypingPage() {
  // All available passages (built-in + admin uploaded)
  const [passages, setPassages] = useState<TypingPassage[]>(DEFAULT_TYPING_PASSAGES);
  
  // Selection States (Dropdown based!)
  const [selectedExamType, setSelectedExamType] = useState<string>("cgl");
  const [selectedPassageId, setSelectedPassageId] = useState<string>("cgl-1");
  const [selectedDurationOption, setSelectedDurationOption] = useState<string>("default");
  const [category, setCategory] = useState<CategoryType>("UR");

  // Custom passage modal
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customContent, setCustomContent] = useState<string>("");

  // Settings & Toggles
  const [allowBackspace, setAllowBackspace] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highlightWord, setHighlightWord] = useState<boolean>(false); // OFF by default as per candidate request
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Engine States
  const [typedInput, setTypedInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(15 * 60);
  const [totalKeys, setTotalKeys] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageContainerRef = useRef<HTMLDivElement>(null);

  // Load Passages from Server API
  const refreshPassages = useCallback(async () => {
    try {
      const res = await fetch("/api/typing");
      const data = await res.json();
      if (data.success && Array.isArray(data.passages) && data.passages.length > 0) {
        setPassages(data.passages);
        return;
      }
      const stored = getStoredTypingPassages();
      if (stored && stored.length > 0) {
        setPassages(stored);
      }
    } catch (e) {
      const stored = getStoredTypingPassages();
      setPassages(stored || DEFAULT_TYPING_PASSAGES);
    }
  }, []);

  useEffect(() => {
    refreshPassages();
    window.addEventListener("ssczone_typing_updated", refreshPassages);
    return () => window.removeEventListener("ssczone_typing_updated", refreshPassages);
  }, [refreshPassages]);

  // Filter passages by selected exam type
  const availablePassagesForExam = useMemo(() => {
    if (selectedExamType === "all") return passages;
    if (selectedExamType === "custom") return passages.filter((p) => p.examType === "custom");
    return passages.filter((p) => p.examType === selectedExamType);
  }, [passages, selectedExamType]);

  // Current active passage
  const currentPassage = useMemo<TypingPassage>(() => {
    const found = passages.find((p) => p.id === selectedPassageId);
    if (found) return found;
    if (availablePassagesForExam.length > 0) return availablePassagesForExam[0];
    return DEFAULT_TYPING_PASSAGES[0];
  }, [passages, selectedPassageId, availablePassagesForExam]);

  // Sync test duration when passage or duration dropdown changes
  const targetDurationSeconds = useMemo(() => {
    if (selectedDurationOption === "default") {
      return (currentPassage?.timeMinutes || 15) * 60;
    }
    const mins = parseInt(selectedDurationOption, 10);
    return isNaN(mins) ? 15 * 60 : mins * 60;
  }, [selectedDurationOption, currentPassage]);

  // Reset Test Helper
  const resetTest = useCallback((newDuration?: number) => {
    setIsStarted(false);
    setIsFinished(false);
    setTypedInput("");
    setTotalKeys(0);
    setBackspaceCount(0);
    setStartTime(null);
    const dur = newDuration ?? targetDurationSeconds;
    setTimeLeft(dur);
    setTotalTimeSeconds(dur);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [targetDurationSeconds]);

  // On Exam Type change, select first passage of that type and reset
  const handleExamTypeChange = (newType: string) => {
    setSelectedExamType(newType);
    const matching = passages.filter((p) => newType === "all" ? true : p.examType === newType);
    if (matching.length > 0) {
      setSelectedPassageId(matching[0].id);
      const dur = (matching[0].timeMinutes || 15) * 60;
      resetTest(selectedDurationOption === "default" ? dur : targetDurationSeconds);
    }
  };

  // On Passage Selection Dropdown change
  const handlePassageSelect = (id: string) => {
    setSelectedPassageId(id);
    const p = passages.find((x) => x.id === id);
    if (p) {
      const dur = (p.timeMinutes || 15) * 60;
      resetTest(selectedDurationOption === "default" ? dur : targetDurationSeconds);
    }
  };

  // On Duration change
  const handleDurationChange = (val: string) => {
    setSelectedDurationOption(val);
    let dur = (currentPassage?.timeMinutes || 15) * 60;
    if (val !== "default") {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) dur = parsed * 60;
    }
    resetTest(dur);
  };

  // Sound generator
  const playSound = useCallback((isError = false) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isError ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(isError ? 160 : 650, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }, [soundEnabled]);

  // Countdown Timer
  useEffect(() => {
    if (isStarted && !isFinished) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFinished(true);
            setIsStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isStarted, isFinished]);

  // Auto-scroll passage view to cursor
  useEffect(() => {
    if (!passageContainerRef.current) return;
    const cursor = passageContainerRef.current.querySelector("[data-cursor]");
    if (cursor) {
      cursor.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [typedInput.length]);

  // Key Down handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      setBackspaceCount((p) => p + 1);
      if (!allowBackspace) {
        e.preventDefault();
      }
    }
  };

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const targetText = currentPassage.content;

    if (!allowBackspace && val.length < typedInput.length) {
      return;
    }

    if (!isStarted && !isFinished) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    const isCorrectChar = val[val.length - 1] === targetText[val.length - 1];
    if (val.length > typedInput.length) {
      playSound(!isCorrectChar);
      setTotalKeys((p) => p + 1);
    }

    setTypedInput(val);

    if (val.length >= targetText.length) {
      setIsFinished(true);
      setIsStarted(false);
    }
  };

  // Finish early
  const finishTestEarly = () => {
    if (typedInput.length === 0) return;
    if (confirm("Are you sure you want to finish and submit your test now?")) {
      setIsFinished(true);
      setIsStarted(false);
    }
  };

  // Add custom passage
  const handleSaveCustomPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customContent.trim()) return;

    const newPassage = saveTypingPassage({
      title: customTitle.trim(),
      content: customContent.trim(),
      examType: "custom",
      examName: "Custom Practice",
      timeMinutes: 15,
      targetWPM: 30,
      targetKeyDepressions: customContent.trim().split(/\s+/).length * 5,
      wordCount: customContent.trim().split(/\s+/).length,
      difficulty: "Medium",
    });

    refreshPassages();
    setSelectedExamType("custom");
    setSelectedPassageId(newPassage.id);
    setShowCustomModal(false);
    setCustomTitle("");
    setCustomContent("");
    resetTest(15 * 60);
  };

  // Calculation Metrics
  const targetText = currentPassage.content;
  const elapsedSeconds = isStarted && startTime
    ? Math.max(1, Math.floor((Date.now() - startTime) / 1000))
    : totalTimeSeconds - timeLeft;
  const elapsedMinutes = Math.max(0.1, elapsedSeconds / 60);

  // SSC Formula: 5 Key Depressions = 1 Word
  const grossWPM = Math.round((typedInput.length / 5) / elapsedMinutes);

  let uncorrectedErrors = 0;
  for (let i = 0; i < typedInput.length; i++) {
    if (typedInput[i] !== targetText[i]) {
      uncorrectedErrors++;
    }
  }

  const netWPM = Math.max(0, Math.round(grossWPM - uncorrectedErrors / elapsedMinutes));
  const accuracyPercent = typedInput.length > 0
    ? Math.max(0, Math.round(((typedInput.length - uncorrectedErrors) / typedInput.length) * 100))
    : 100;

  const kph = Math.round((typedInput.length / elapsedMinutes) * 60);
  const errorPercentage = typedInput.length > 0
    ? ((uncorrectedErrors / targetText.length) * 100).toFixed(1)
    : "0.0";

  const allowedErrorLimit = category === "UR" ? 5 : category === "OBC_EWS" ? 7 : 10;
  const isSSCQualified =
    parseFloat(errorPercentage) <= allowedErrorLimit && netWPM >= currentPassage.targetWPM;

  const keyProgressPercent = currentPassage.targetKeyDepressions > 0
    ? Math.min(100, Math.round((typedInput.length / currentPassage.targetKeyDepressions) * 100))
    : 0;

  const timeProgressPercent = totalTimeSeconds > 0
    ? Math.min(100, Math.round(((totalTimeSeconds - timeLeft) / totalTimeSeconds) * 100))
    : 0;

  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isTimeCritical = timeLeft <= 60 && isStarted;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      
      {/* ── TOP NAV / BRAND BAR ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">SSCZONE</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-black text-slate-800">SSC Typing Test Practice</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-bold transition-colors bg-slate-50"
            >
              <Info className="w-3.5 h-3.5" /> Exam Rules
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-colors bg-white shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" /> Practice Custom Text
            </button>

            <button
              onClick={() => setShowSettingsDrawer((v) => !v)}
              className={`p-2 rounded-lg border transition-colors ${
                showSettingsDrawer
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100 bg-white"
              }`}
              title="Test Configuration Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── SETTINGS DRAWER ── */}
        {showSettingsDrawer && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-6">
                {/* Backspace Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowBackspace}
                    onChange={(e) => setAllowBackspace(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">Allow Backspace Key</span>
                  <span className="text-[10px] text-slate-400 font-mono">(SSC DEST Allows Backspace)</span>
                </label>

                {/* Highlight / Blue Guide Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highlightWord}
                    onChange={(e) => setHighlightWord(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">Screen Blue Guide / Highlight</span>
                  <span className="text-[10px] text-slate-400 font-mono">(Off by default)</span>
                </label>

                {/* Sound Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />} Keystroke Audio
                  </span>
                </label>
              </div>

              <div className="text-[11px] text-slate-500">
                Formula: <strong>5 Depressions = 1 Word</strong> · Net WPM = Gross WPM − (Errors ÷ Time)
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">

        {/* ══════════════════════════════════════════════════════════════════
            1. DROPDOWN SELECTION CONTROL PANEL (NO MESSY CARDS!)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Dropdown 1: Select Exam */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                1. Select Exam Type
              </label>
              <div className="relative">
                <select
                  value={selectedExamType}
                  onChange={(e) => handleExamTypeChange(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="cgl">SSC CGL DEST (2000 Key Depressions · 15 Min)</option>
                  <option value="chsl-en">SSC CHSL English (1750 Key Depressions · 10 Min)</option>
                  <option value="chsl-hi">SSC CHSL Hindi (1500 Key Depressions · 10 Min)</option>
                  <option value="deo">SSC DEO High Speed (3700 Key Depressions · 15 Min)</option>
                  <option value="all">All Passages ({passages.length} Total)</option>
                  <option value="custom">Custom Uploaded Passages</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 2: Select Specific Passage */}
            <div className="lg:col-span-1 sm:col-span-1">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                2. Select Passage ({availablePassagesForExam.length} Available)
              </label>
              <div className="relative">
                <select
                  value={selectedPassageId}
                  onChange={(e) => handlePassageSelect(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer truncate"
                >
                  {availablePassagesForExam.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.targetKeyDepressions || 2000} Key Depressions)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 3: Duration / Time Limit */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                3. Test Duration
              </label>
              <div className="relative">
                <select
                  value={selectedDurationOption}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="default">Official Exam ({currentPassage.timeMinutes} Minutes)</option>
                  <option value="2">2 Minutes (Speed Sprint)</option>
                  <option value="5">5 Minutes (Quick Practice)</option>
                  <option value="10">10 Minutes (CHSL Standard)</option>
                  <option value="15">15 Minutes (Official 2000 Key Depressions DEST)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 4: Category / Error Limit */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                4. Candidate Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="UR">UR / General (Max 5% Error Limit)</option>
                  <option value="OBC_EWS">OBC / EWS (Max 7% Error Limit)</option>
                  <option value="SC_ST">SC / ST / PwD (Max 10% Error Limit)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            2. PROMINENT EXECUTIVE HUD & COUNTDOWN TIMER (RIGHT IN FRONT OF USER!)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            
            {/* BIG PROMINENT COUNTDOWN TIMER BOX */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
                  isTimeCritical
                    ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse ring-4 ring-red-500/30"
                    : isStarted
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-300 ring-2 ring-blue-500/20"
                    : "bg-slate-800/80 border-slate-700 text-slate-200"
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isStarted ? "TIME REMAINING" : "TEST DURATION"}
                  </p>
                  <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight leading-none mt-0.5">
                    {mins}:{secs}
                  </div>
                </div>
              </div>

              {/* Status pill on mobile/desktop */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-800 border border-slate-700">
                  <span className={`w-2 h-2 rounded-full ${isStarted ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                  {isStarted ? "EXAM IN PROGRESS" : isFinished ? "TEST COMPLETED" : "READY TO START"}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">
                  Official Standard: <strong className="text-white">{currentPassage.targetKeyDepressions || 2000} Key Depressions</strong> in {currentPassage.timeMinutes || 15} Min
                </p>
              </div>
            </div>

            {/* LIVE EXAM STATS METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              
              {/* Stat 1: Depressions Progress */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-center min-w-[110px]">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Depressions</p>
                <p className="text-lg font-mono font-black text-white mt-0.5">
                  {typedInput.length} <span className="text-xs text-slate-400 font-normal">/ {currentPassage.targetKeyDepressions || 2000}</span>
                </p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${keyProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stat 2: Net Speed */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Speed</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {isStarted ? netWPM : 0} <span className="text-xs text-slate-400 font-normal">WPM</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Gross: {isStarted ? grossWPM : 0}</p>
              </div>

              {/* Stat 3: Accuracy */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Accuracy</p>
                <p className={`text-lg font-black mt-0.5 ${accuracyPercent >= 95 ? "text-blue-400" : "text-amber-400"}`}>
                  {accuracyPercent}%
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Error: {errorPercentage}%</p>
              </div>

              {/* Stat 4: Mistakes Count */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Errors Made</p>
                <p className={`text-lg font-black mt-0.5 ${uncorrectedErrors > 0 ? "text-red-400" : "text-slate-200"}`}>
                  {uncorrectedErrors}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Limit: ≤ {allowedErrorLimit}%</p>
              </div>

            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => resetTest()}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Restart this test"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>

              {isStarted && (
                <button
                  onClick={finishTestEarly}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Test
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            3. DUAL-BOX SPLIT-SCREEN EXAM TYPING CONSOLE
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Console Header Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-800 truncate">
                {currentPassage.title}
              </span>
            </div>

            {/* Quick Live Toggles (Prominently next to Backspace) */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowBackspace}
                  onChange={(e) => setAllowBackspace(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold">Allow Backspace</span>
              </label>

              <span className="text-slate-300">|</span>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={highlightWord}
                  onChange={(e) => setHighlightWord(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold flex items-center gap-1">
                  Blue Guide
                  {highlightWord ? (
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono font-black">ON</span>
                  ) : (
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono font-bold">OFF</span>
                  )}
                </span>
              </label>
            </div>

            <div className="text-[11px] font-bold text-slate-500 hidden lg:block">
              Criterion: <strong className="text-blue-700 font-mono">{currentPassage.targetKeyDepressions || 2000} Key Depressions</strong> · <strong className="text-slate-800 font-mono">{currentPassage.timeMinutes || 15} Min</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* BOX 1: MASTER REFERENCE PASSAGE */}
            <div className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  MASTER REFERENCE TEXT (OFFICIAL SSC PASSAGE)
                </span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {currentPassage.examName}
                </span>
              </div>

              <div
                ref={passageContainerRef}
                className="h-80 overflow-y-auto p-4 rounded-xl bg-slate-50/70 border border-slate-200 font-mono text-[13.5px] leading-relaxed text-slate-800 select-none tracking-wide shadow-2xs"
              >
                {targetText.split("").map((char, index) => {
                  const isTyped = index < typedInput.length;
                  const isCorrect = isTyped && typedInput[index] === char;
                  const isWrong = isTyped && typedInput[index] !== char;
                  const isCursor = index === typedInput.length;

                  let style = "text-slate-800";
                  if (highlightWord) {
                    if (isCorrect) style = "text-slate-400 bg-slate-200/50";
                    if (isWrong) style = "text-red-700 bg-red-200 font-bold underline decoration-red-500";
                  }

                  let cursorClass = "";
                  if (isCursor) {
                    if (highlightWord) {
                      cursorClass = "bg-blue-600 text-white font-black px-0.5 rounded-xs ring-2 ring-blue-400 shadow-xs";
                    } else {
                      cursorClass = "border-l-2 border-slate-900 animate-pulse";
                    }
                  }

                  return (
                    <span
                      key={index}
                      data-cursor={isCursor ? true : undefined}
                      className={`${style} ${cursorClass}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Tip: Keep your eyes on the reference text while typing. The cursor automatically scrolls into view.
              </p>
            </div>

            {/* BOX 2: CANDIDATE TYPING AREA */}
            <div className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  CANDIDATE TYPING BOX
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Depressions: <strong className="text-blue-700">{typedInput.length}</strong> / {targetText.length}
                </span>
              </div>

              <textarea
                ref={inputRef}
                value={typedInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isFinished}
                autoFocus
                placeholder={
                  isStarted
                    ? "Keep typing official passage..."
                    : "Click inside this box and start typing to automatically start the exam countdown timer..."
                }
                className={`h-80 w-full p-4 rounded-xl border-2 font-mono text-[13.5px] leading-relaxed tracking-wide resize-none focus:outline-none transition-all shadow-inner bg-white ${
                  isFinished
                    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    : isStarted
                    ? "border-blue-600 ring-4 ring-blue-500/15"
                    : "border-slate-300 focus:border-blue-600"
                }`}
              />
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                <span>
                  {isStarted ? "⏱️ Exam timer active" : "Timer begins automatically when you type the first letter."}
                </span>
                <span>
                  Backspaces used: <strong className="text-slate-700">{backspaceCount}</strong>
                </span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* ══════════════════════════════════════════════════════════════════
          ON-PAGE EDUCATIONAL GUIDE & TCS EXAM HALL STANDARDS (SEO CONTENT)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-12 pb-16 space-y-8 font-sans">
        
        {/* EVALUATION GUIDE & FORMULA */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" /> TCS Exam Hall Evaluation Formula
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              SSC Typing Speed &amp; Error Calculation Formula Explained
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Official evaluation method used by Staff Selection Commission (SSC) and Tata Consultancy Services (TCS iON) during Data Entry Skill Test (DEST) for CGL Tier 2, CHSL, and DEO cadres.
            </p>
          </div>

          {/* Formula Display Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 overflow-x-auto shadow-inner font-mono text-center space-y-2">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-sans font-bold">
              Official TCS Error Percentage Formula
            </span>
            <div className="text-sm sm:text-base font-bold text-blue-200 py-1">
              Error Percentage (%) = [ (Full Mistakes + (Half Mistakes / 2)) / Total Words Typed ] × 100
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              * Note: Total Words is standardly calculated as Total Key Depressions divided by 5.
            </p>
          </div>

          {/* Full vs Half Mistakes Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-2">
              <h3 className="font-black text-rose-950 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Full Mistakes (100% Penalty)
              </h3>
              <ul className="text-rose-900 space-y-1.5 text-[11px] font-medium leading-relaxed">
                <li>• <b>Omission of Word:</b> Skipping any word, number, or punctuation present in the master text.</li>
                <li>• <b>Substitution of Word:</b> Typing an entirely different word in place of the original word.</li>
                <li>• <b>Addition of Word:</b> Typing extra words that do not exist in the master passage.</li>
                <li>• <b>Repeated Group of Words:</b> Accidentally typing a phrase or line twice.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
              <h3 className="font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Half Mistakes (50% Penalty)
              </h3>
              <ul className="text-amber-900 space-y-1.5 text-[11px] font-medium leading-relaxed">
                <li>• <b>Spacing Error:</b> Leaving no space between words (e.g. "andthen") or leaving unwanted space inside a word ("b ook").</li>
                <li>• <b>Capitalization Mistake:</b> Typing lowercase instead of uppercase or vice-versa (e.g. "delhi" instead of "Delhi").</li>
                <li>• <b>Punctuation Error:</b> Omitting or mistyping commas, full stops, hyphens, or quotation marks.</li>
                <li>• <b>Spelling Mistake:</b> Transposition, omission, or repetition of letters inside a word.</li>
              </ul>
            </div>
          </div>

          {/* QUALIFYING STANDARDS TABLE */}
          <div className="overflow-x-auto mt-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              Official SSC Typing Qualifying Speed &amp; Error Cutoffs
            </h3>
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Required Key Depressions</th>
                  <th className="py-3 px-4">Approx WPM</th>
                  <th className="py-3 px-4">Max Allowed Mistakes (UR)</th>
                  <th className="py-3 px-4">Max Allowed (OBC/SC/ST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SSC CGL Tier 2 (DEST)</td>
                  <td className="py-3 px-4 font-mono font-bold">15 Minutes</td>
                  <td className="py-3 px-4 font-bold text-blue-700">2,000 Key Depressions</td>
                  <td className="py-3 px-4 font-mono">≈ 27 WPM</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">5% Max Error</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">7% Max Error</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SSC CGL Tax Assistant / CBIC</td>
                  <td className="py-3 px-4 font-mono font-bold">15 Minutes</td>
                  <td className="py-3 px-4 font-bold text-blue-700">2,000 Key Depressions</td>
                  <td className="py-3 px-4 font-mono">≈ 27 WPM</td>
                  <td className="py-3 px-4 text-amber-700 font-black">5% Strict Cutoff</td>
                  <td className="py-3 px-4 text-amber-700 font-black">7% Strict Cutoff</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SSC CHSL (LDC / JSA)</td>
                  <td className="py-3 px-4 font-mono font-bold">10 Minutes</td>
                  <td className="py-3 px-4 font-bold text-blue-700">1,750 Key Depressions</td>
                  <td className="py-3 px-4 font-mono">≈ 35 WPM (English)</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">7% Max Error</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">10% Max Error</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SSC DEO (Data Entry Operator)</td>
                  <td className="py-3 px-4 font-mono font-bold">15 Minutes</td>
                  <td className="py-3 px-4 font-bold text-blue-700">3,700–4,000 Key Depressions</td>
                  <td className="py-3 px-4 font-mono">≈ 50 WPM</td>
                  <td className="py-3 px-4 text-rose-700 font-black">5% Max Error</td>
                  <td className="py-3 px-4 text-rose-700 font-black">7% Max Error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              SSC Typing Test &amp; TCS Exam Hall Practice FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Authentic guidance on test rules, keyboards, shortcuts, and backspace usage.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              {
                q: "Is backspace and arrow navigation allowed in the official SSC CGL typing test?",
                a: "YES. You can freely use backspace, delete, and arrow keys to navigate and correct errors within the typed text area during the official 15-minute examination. Shortcuts like Ctrl+A or copy-pasting are strictly disabled."
              },
              {
                q: "What happens if I complete typing the 2000 key depressions before the 15-minute timer ends?",
                a: "If you finish typing the master passage early, DO NOT leave the exam window. Use the remaining time to carefully re-read your typed text against the master passage and correct any punctuation, capitalization, or spelling mistakes with backspace. You do NOT need to re-type the passage from the beginning unless instructed."
              },
              {
                q: "What keyboard layout and brands are provided at TCS iON exam centers?",
                a: "TCS examination centers generally provide standard QWERTY English keyboards (typically Dell, HP, Lenovo, or ProDot wired desktop keyboards). Keys may have varying travel depth, so regular practice on standard desktop keyboards is highly recommended."
              },
              {
                q: "How are 2,000 key depressions converted into Words Per Minute (WPM)?",
                a: "SSC standardizes 1 word as equivalent to 5 keystrokes (key depressions including space). Therefore, 2,000 key depressions equal 400 words. Typing 400 words in 15 minutes gives an effective speed of: 400 / 15 ≈ 26.67 WPM (rounded to 27 WPM)."
              },
              {
                q: "Is the SSC CGL DEST typing test qualifying in nature for all posts?",
                a: "Yes, DEST is qualifying in nature, meaning marks obtained do not add to your merit rank score. However, qualifying the typing test is MANDATORY for all shortlisted candidates. Failing the typing test disqualifies you from both DEST-mandatory posts (like Tax Assistant, Executive Assistant, ASO) as well as non-DEST posts."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RELATED CANDIDATE TOOLS */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 font-extrabold text-[11px] uppercase border border-blue-400/30">
              More Free Tools
            </span>
            <h3 className="text-xl font-black text-white mt-2">
              Explore Other Essential SSC Candidate Utilities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Photo & Signature Resizer", desc: "Compress photo (20-50 KB) & signature (10-20 KB) in seconds.", href: "/toolkit/photo-resizer" },
              { title: "SSC Age Calculator", desc: "Calculate exact years, months, and days on crucial cutoff dates.", href: "/toolkit/age-calculator" },
              { title: "SSC Rank Predictor", desc: "Calculate raw marks and shift difficulty normalization score.", href: "/toolkit/rank-predictor" },
              { title: "Master Syllabus Tracker", desc: "Track chapter-wise 3-pillar progress for CGL, CHSL, CPO.", href: "/syllabus" },
            ].map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="bg-white/5 border border-white/10 hover:border-blue-400/40 p-4 rounded-2xl flex flex-col justify-between group transition-all hover:bg-white/10"
              >
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors mb-1">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. OFFICIAL RESULT SCORECARD MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">SSC Typing Examination Result</h3>
              <p className="text-xs font-bold text-blue-600 mt-1">{currentPassage.examName}</p>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-2xl border mb-5 text-center ${
                isSSCQualified
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-base font-black">
                {isSSCQualified ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    QUALIFIED FOR SSC STANDARDS 🎉
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    DISQUALIFIED (BELOW CRITERIA)
                  </>
                )}
              </div>
              <p className="text-xs mt-1 opacity-90">
                Key Depressions: <strong>{typedInput.length} / {currentPassage.targetKeyDepressions || 2000}</strong> (Req: 2000 in 15 Min) · Error: <strong>{errorPercentage}%</strong> (Limit: ≤ {allowedErrorLimit}%)
              </p>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
              <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-black text-blue-700">Key Depressions</p>
                <p className="text-xl font-black text-blue-900 mt-0.5">{typedInput.length} <span className="text-[10px] text-slate-500">/ {currentPassage.targetKeyDepressions || 2000}</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Net Speed</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">{netWPM} <span className="text-[10px] text-slate-400">WPM</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Gross Speed</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{grossWPM} <span className="text-[10px] text-slate-400">WPM</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                <p className="text-xl font-black text-blue-600 mt-0.5">{accuracyPercent}%</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">KPH Speed</p>
                <p className="text-xl font-black text-violet-600 mt-0.5">{kph}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Errors</p>
                <p className="text-xl font-black text-red-500 mt-0.5">{uncorrectedErrors}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => resetTest()}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Test
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          5. CUSTOM PASSAGE MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> Paste Custom Passage
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste any custom text or newspaper editorial paragraph to practice typing.
            </p>

            <form onSubmit={handleSaveCustomPassage} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Passage Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Hindu Editorial Practice"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Passage Content
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {customContent.trim().split(/\s+/).filter(Boolean).length} Words · {customContent.length} Chars
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste your paragraph here..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customTitle.trim() || !customContent.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" /> Load & Start Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          6. EXAM RULES & EVALUATION CRITERIA MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" /> Official SSC Typing Evaluation Standards
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Exact evaluation formulas implemented by Staff Selection Commission (TCS iON).
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl">
                <h4 className="font-extrabold text-blue-900 mb-1">1. SSC CGL DEST (Data Entry Speed Test)</h4>
                <p className="text-slate-700 leading-relaxed">
                  • <strong>2000 Key Depressions</strong> in 15 Minutes (≈ 400 Words at 5 key depressions/word).<br />
                  • Required Speed: <strong>27 WPM</strong>.<br />
                  • Permissible Errors: <strong>UR: 5% Max</strong> | <strong>OBC/EWS: 7% Max</strong> | <strong>SC/ST: 10% Max</strong>.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl">
                <h4 className="font-extrabold text-emerald-900 mb-1">2. SSC CHSL (LDC / JSA / Junior Assistant)</h4>
                <p className="text-slate-700 leading-relaxed">
                  • <strong>English Typing:</strong> 1750 Key Depressions in 10 Min &rarr; <strong>35 WPM</strong>.<br />
                  • <strong>Hindi Typing:</strong> 1500 Key Depressions in 10 Min &rarr; <strong>30 WPM</strong>.<br />
                  • Permissible Errors: <strong>UR: 7% (or 20% standard post)</strong>.
                </p>
              </div>

              <div className="bg-violet-50/70 border border-violet-200 p-3.5 rounded-2xl">
                <h4 className="font-extrabold text-violet-900 mb-1">3. SSC DEO (Data Entry Operator)</h4>
                <p className="text-slate-700 leading-relaxed">
                  • <strong>3700–4000 Key Depressions</strong> in 15 Minutes &rarr; <strong>~50 WPM</strong>.<br />
                  • Strict error evaluation required.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
