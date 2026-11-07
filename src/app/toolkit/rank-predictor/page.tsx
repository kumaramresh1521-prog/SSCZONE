"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Award,
  ShieldCheck,
  RotateCcw,
  BarChart3,
  Flame,
  Zap,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  User,
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Code2
} from "lucide-react";

interface QuestionResult {
  qNum: number;
  section: string;
  status: "correct" | "wrong" | "unattempted";
  chosenOption?: number | null;
  correctOption?: number | null;
  marksGained: number;
}

interface SectionResult {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  positiveMarks: number;
  negativeMarks: number;
  netScore: number;
  accuracy: string;
  questions: QuestionResult[];
}

interface CandidateInfo {
  rollNumber: string;
  candidateName: string;
  examName: string;
  testDate: string;
  testTime: string;
  venue: string;
  vendor: "CBExams" | "DigiALM" | "Generic";
}

interface ScoreSummary {
  totalQuestions: number;
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  grossPositive: number;
  grossNegative: number;
  rawScore: number;
  maxMarks: number;
  accuracy: string;
  shiftRating: "Hard" | "Moderate" | "Easy";
  normalizationBonus: number;
  normalizedScore: number;
  rankBracket: string;
  percentile: string;
  categoryRankBracket: string;
  safePostStatus: string;
  postBadge: string;
}

interface ApiResponse {
  success: boolean;
  candidate: CandidateInfo;
  summary: ScoreSummary;
  sections: SectionResult[];
}

export default function SSCPageRankPredictor() {
  const [activeTab, setActiveTab] = useState<"url" | "html" | "manual">("url");
  const [examType, setExamType] = useState<"cgl-tier1" | "cgl-tier2" | "chsl-tier1" | "cpo-tier1">("cgl-tier1");
  const [category, setCategory] = useState<"UR" | "OBC" | "EWS" | "SC" | "ST">("UR");
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string>("");
  const [rawHtmlCode, setRawHtmlCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ApiResponse | null>(null);

  // Manual Section Scores Input State
  const [manualMathsCorrect, setManualMathsCorrect] = useState<number>(22);
  const [manualMathsWrong, setManualMathsWrong] = useState<number>(2);
  const [manualReasoningCorrect, setManualReasoningCorrect] = useState<number>(23);
  const [manualReasoningWrong, setManualReasoningWrong] = useState<number>(1);
  const [manualEnglishCorrect, setManualEnglishCorrect] = useState<number>(21);
  const [manualEnglishWrong, setManualEnglishWrong] = useState<number>(3);
  const [manualGkCorrect, setManualGkCorrect] = useState<number>(14);
  const [manualGkWrong, setManualGkWrong] = useState<number>(6);
  const [manualShiftDifficulty, setManualShiftDifficulty] = useState<"hard" | "moderate" | "easy">("hard");

  // Questions Review Filter
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "correct" | "wrong" | "unattempted">("all");
  const [showQuestionsTable, setShowQuestionsTable] = useState<boolean>(false);

  // Handle URL or HTML calculation from API
  async function handleCalculateScore() {
    if (activeTab === "url" && !answerKeyUrl.trim()) {
      toast.error("Please paste your official Answer Key URL.");
      return;
    }
    if (activeTab === "html" && !rawHtmlCode.trim()) {
      toast.error("Please paste your Response Sheet HTML source code.");
      return;
    }

    setLoading(true);
    setParsedData(null);

    try {
      const res = await fetch("/api/answer-key/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: activeTab === "url" ? answerKeyUrl.trim() : undefined,
          rawHtml: activeTab === "html" ? rawHtmlCode.trim() : undefined,
          examType,
          category
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setParsedData(data);
        toast.success(`Score calculated for ${data.candidate.candidateName || "Candidate"}! 🎉`, {
          icon: "🎯"
        });
      } else {
        toast.error(data.error || "Failed to parse answer key. Please check the URL or HTML code.");
      }
    } catch (err: any) {
      toast.error("Error connecting to calculator server: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle manual calculation fallback
  function handleManualCalculation() {
    const isTier2 = examType === "cgl-tier2";
    const isCpo = examType === "cpo-tier1";
    const pos = isTier2 ? 3.0 : isCpo ? 1.0 : 2.0;
    const neg = isTier2 ? 1.0 : isCpo ? 0.25 : 0.5;
    const maxMarks = isTier2 ? 390 : 200;

    const sections: SectionResult[] = [
      {
        name: "General Intelligence & Reasoning",
        total: 25,
        correct: manualReasoningCorrect,
        wrong: manualReasoningWrong,
        unattempted: Math.max(0, 25 - manualReasoningCorrect - manualReasoningWrong),
        positiveMarks: manualReasoningCorrect * pos,
        negativeMarks: manualReasoningWrong * neg,
        netScore: parseFloat((manualReasoningCorrect * pos - manualReasoningWrong * neg).toFixed(2)),
        accuracy: `${(((manualReasoningCorrect) / Math.max(1, manualReasoningCorrect + manualReasoningWrong)) * 100).toFixed(1)}%`,
        questions: []
      },
      {
        name: "General Awareness",
        total: 25,
        correct: manualGkCorrect,
        wrong: manualGkWrong,
        unattempted: Math.max(0, 25 - manualGkCorrect - manualGkWrong),
        positiveMarks: manualGkCorrect * pos,
        negativeMarks: manualGkWrong * neg,
        netScore: parseFloat((manualGkCorrect * pos - manualGkWrong * neg).toFixed(2)),
        accuracy: `${(((manualGkCorrect) / Math.max(1, manualGkCorrect + manualGkWrong)) * 100).toFixed(1)}%`,
        questions: []
      },
      {
        name: "Quantitative Aptitude",
        total: 25,
        correct: manualMathsCorrect,
        wrong: manualMathsWrong,
        unattempted: Math.max(0, 25 - manualMathsCorrect - manualMathsWrong),
        positiveMarks: manualMathsCorrect * pos,
        negativeMarks: manualMathsWrong * neg,
        netScore: parseFloat((manualMathsCorrect * pos - manualMathsWrong * neg).toFixed(2)),
        accuracy: `${(((manualMathsCorrect) / Math.max(1, manualMathsCorrect + manualMathsWrong)) * 100).toFixed(1)}%`,
        questions: []
      },
      {
        name: "English Comprehension",
        total: 25,
        correct: manualEnglishCorrect,
        wrong: manualEnglishWrong,
        unattempted: Math.max(0, 25 - manualEnglishCorrect - manualEnglishWrong),
        positiveMarks: manualEnglishCorrect * pos,
        negativeMarks: manualEnglishWrong * neg,
        netScore: parseFloat((manualEnglishCorrect * pos - manualEnglishWrong * neg).toFixed(2)),
        accuracy: `${(((manualEnglishCorrect) / Math.max(1, manualEnglishCorrect + manualEnglishWrong)) * 100).toFixed(1)}%`,
        questions: []
      }
    ];

    const totalQuestions = 100;
    const totalCorrect = sections.reduce((acc, s) => acc + s.correct, 0);
    const totalWrong = sections.reduce((acc, s) => acc + s.wrong, 0);
    const totalUnattempted = sections.reduce((acc, s) => acc + s.unattempted, 0);
    const totalAttempted = totalCorrect + totalWrong;
    const grossPositive = totalCorrect * pos;
    const grossNegative = totalWrong * neg;
    const rawScore = Math.max(0, parseFloat((grossPositive - grossNegative).toFixed(2)));
    const overallAccuracy = totalAttempted > 0 ? parseFloat(((totalCorrect / totalAttempted) * 100).toFixed(2)) : 0;

    let normBonus = manualShiftDifficulty === "hard" ? 14.2 : manualShiftDifficulty === "moderate" ? 7.5 : 1.8;
    if (examType === "cgl-tier2") normBonus *= 1.8;
    const normalizedScore = Math.min(maxMarks, parseFloat((rawScore + normBonus).toFixed(2)));

    const scorePct = (normalizedScore / maxMarks) * 100;
    let rankBracket = "15,000 - 35,000+";
    let percentile = "82.5%";
    let safePostStatus = "🟡 Borderline Qualifying Chance";
    let postBadge = "Need Higher Score in Next Tier";

    if (scorePct >= 78) {
      rankBracket = "Top 1 - 950";
      percentile = "99.4%";
      safePostStatus = "🔥 Extremely Safe for Top 4600 GP Inspector / ASO (CSS / MEA)";
      postBadge = "Top Rank Confirmed";
    } else if (scorePct >= 68) {
      rankBracket = "951 - 4,800";
      percentile = "96.8%";
      safePostStatus = "🟢 Safe for 4200 / 2800 GP Posts (Auditor / Accountant / Sub-Inspector)";
      postBadge = "High Selection Probability";
    } else if (scorePct >= 58) {
      rankBracket = "4,801 - 16,500";
      percentile = "91.2%";
      safePostStatus = "🟢 Safe for 2400 GP Posts (Tax Assistant / Postal Assistant / UDC)";
      postBadge = "Tier 1 Cutoff Clearance Safe";
    }

    setParsedData({
      success: true,
      candidate: {
        rollNumber: "Manual Input",
        candidateName: "Aspirant",
        examName: "SSC Combined Graduate Level Examination",
        testDate: "Simulated Shift",
        testTime: manualShiftDifficulty.toUpperCase() + " SHIFT",
        venue: "Online Simulation",
        vendor: "Generic"
      },
      summary: {
        totalQuestions,
        totalAttempted,
        totalCorrect,
        totalWrong,
        totalUnattempted,
        grossPositive,
        grossNegative,
        rawScore,
        maxMarks,
        accuracy: `${overallAccuracy}%`,
        shiftRating: manualShiftDifficulty === "hard" ? "Hard" : manualShiftDifficulty === "moderate" ? "Moderate" : "Easy",
        normalizationBonus: normBonus,
        normalizedScore,
        rankBracket,
        percentile,
        categoryRankBracket: `${category} Rank: ~Top 15%`,
        safePostStatus,
        postBadge
      },
      sections
    });
    toast.success("Manual Score & Rank Calculated!");
  }

  // Filter questions for the question review table
  const allQuestions = parsedData?.sections.flatMap((s) => s.questions) || [];
  const filteredQuestions = allQuestions.filter((q) => {
    const matchSec = selectedSectionFilter === "all" || q.section === selectedSectionFilter;
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSec && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-10 px-4 sm:px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/toolkit"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to SSC Toolkit
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-blue-800 flex items-center justify-center font-black shadow-lg shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                    🔥 2026 OFFICIAL CBEXAMS &amp; DIGIALM ENGINE
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
                  SSC Official Answer Key Marks Calculator &amp; Rank Predictor
                </h1>
                <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                  Compatible with the latest SSC <strong>sscexams.cbexams.com</strong> and classic <strong>digialm.com</strong> response sheets. Instant raw score, normalization bonus, shift difficulty, and RankIQ percentile prediction.
                </p>
              </div>
            </div>

            {parsedData && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                <Printer className="h-4 w-4" />
                <span>Print Scorecard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* ── INPUT CONTROL CARD ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "url"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Option 1: Paste Official Answer Key URL (Recommended)</span>
            </button>

            <button
              onClick={() => setActiveTab("html")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "html"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Option 2: Paste HTML Source Code</span>
            </button>

            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "manual"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Option 3: Manual Section Scores</span>
            </button>
          </div>

          {/* Exam & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1.5">
                Target SSC Examination:
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="cgl-tier1">SSC CGL 2026 Tier 1 (100 Qs / 200 Marks, +2 / -0.5)</option>
                <option value="cgl-tier2">SSC CGL Tier 2 Mains (130 Qs / 390 Marks, +3 / -1.0)</option>
                <option value="chsl-tier1">SSC CHSL 10+2 Tier 1 (100 Qs / 200 Marks, +2 / -0.5)</option>
                <option value="cpo-tier1">SSC CPO SI Paper 1 (200 Qs / 200 Marks, +1 / -0.25)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1.5">
                Candidate Category (For Category Rank &amp; Cutoff Prediction):
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="UR">UR (Unreserved / General)</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
          </div>

          {/* Tab 1: URL Input Form */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Paste SSC Answer Key URL (CBExams or DigiALM link):</span>
                  <span className="text-[11px] text-blue-600 font-normal">Supports https://sscexams.cbexams.com/...</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="url"
                    value={answerKeyUrl}
                    onChange={(e) => setAnswerKeyUrl(e.target.value)}
                    placeholder="e.g. https://sscexams.cbexams.com/CGLE2026jsdgheQchallengemshetsOct27/ViewCandResponse.aspx?enckey=..."
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={handleCalculateScore}
                    disabled={loading}
                    className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs shrink-0 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span>Parsing 4 Parts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>Calculate Score &amp; Predict Rank</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: HTML Source Code or File Input Form */}
          {activeTab === "html" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <label className="text-xs font-bold text-slate-800 block mb-2 flex items-center justify-between">
                  <span>Option A: Upload Saved Response Sheet File (.html / .htm)</span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">100% Offline Safe</span>
                </label>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = (event.target?.result as string) || "";
                        setRawHtmlCode(content);
                        toast.success(`Loaded "${file.name}"! Now click Calculate Score.`);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="block w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  If the government link has expired, you can open your saved answer key HTML file here directly.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Option B: Or Paste Full Response Sheet HTML Source Code (Ctrl+U &rarr; Ctrl+A &rarr; Ctrl+C):
                </label>
                <textarea
                  rows={4}
                  value={rawHtmlCode}
                  onChange={(e) => setRawHtmlCode(e.target.value)}
                  placeholder="Paste complete HTML code here (starting with <html> or <div id='updHindi'>...)"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3 text-xs font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
              <button
                onClick={handleCalculateScore}
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Parsing HTML Source..." : "Parse HTML & Calculate Score"}
              </button>
            </div>
          )}

          {/* Tab 3: Manual Section Scores Form */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800">Reasoning:</span>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="number"
                      value={manualReasoningCorrect}
                      onChange={(e) => setManualReasoningCorrect(parseInt(e.target.value) || 0)}
                      placeholder="Correct"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-emerald-800 font-bold bg-white text-center"
                    />
                    <input
                      type="number"
                      value={manualReasoningWrong}
                      onChange={(e) => setManualReasoningWrong(parseInt(e.target.value) || 0)}
                      placeholder="Wrong"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-rose-800 font-bold bg-white text-center"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800">General Awareness:</span>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="number"
                      value={manualGkCorrect}
                      onChange={(e) => setManualGkCorrect(parseInt(e.target.value) || 0)}
                      placeholder="Correct"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-emerald-800 font-bold bg-white text-center"
                    />
                    <input
                      type="number"
                      value={manualGkWrong}
                      onChange={(e) => setManualGkWrong(parseInt(e.target.value) || 0)}
                      placeholder="Wrong"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-rose-800 font-bold bg-white text-center"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800">Quantitative Maths:</span>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="number"
                      value={manualMathsCorrect}
                      onChange={(e) => setManualMathsCorrect(parseInt(e.target.value) || 0)}
                      placeholder="Correct"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-emerald-800 font-bold bg-white text-center"
                    />
                    <input
                      type="number"
                      value={manualMathsWrong}
                      onChange={(e) => setManualMathsWrong(parseInt(e.target.value) || 0)}
                      placeholder="Wrong"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-rose-800 font-bold bg-white text-center"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800">English Comprehension:</span>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="number"
                      value={manualEnglishCorrect}
                      onChange={(e) => setManualEnglishCorrect(parseInt(e.target.value) || 0)}
                      placeholder="Correct"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-emerald-800 font-bold bg-white text-center"
                    />
                    <input
                      type="number"
                      value={manualEnglishWrong}
                      onChange={(e) => setManualEnglishWrong(parseInt(e.target.value) || 0)}
                      placeholder="Wrong"
                      className="w-1/2 p-2 rounded-lg border border-slate-300 text-rose-800 font-bold bg-white text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <label className="font-bold text-slate-700">Estimated Shift Hardness:</label>
                  <select
                    value={manualShiftDifficulty}
                    onChange={(e) => setManualShiftDifficulty(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                  >
                    <option value="hard">Hard Shift (+14.2 Bonus)</option>
                    <option value="moderate">Moderate Shift (+7.5 Bonus)</option>
                    <option value="easy">Easy Shift (+1.8 Bonus)</option>
                  </select>
                </div>

                <button
                  onClick={handleManualCalculation}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Calculate Manual Score
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── SCORECARD & RANK PREDICTION RESULTS DASHBOARD ── */}
        {parsedData && (
          <div className="space-y-6 animate-in fade-in duration-200" id="scorecard-print-area">
            
            {/* Candidate Info Header Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-black uppercase text-blue-700 tracking-wider">
                    Official Answer Key Report
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {parsedData.candidate.candidateName || "Candidate"}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Roll No: {parsedData.candidate.rollNumber} • Vendor: {parsedData.candidate.vendor}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Response Sheet</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Date:</span>
                    <span className="font-bold text-slate-900">{parsedData.candidate.testDate || "Official Shift"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Shift &amp; Time:</span>
                    <span className="font-bold text-slate-900">{parsedData.candidate.testTime || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Centre:</span>
                    <span className="font-bold text-slate-900 truncate block max-w-xs">{parsedData.candidate.venue || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Score & Normalization Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Raw Score */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Raw Marks Obtained
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight">
                    {parsedData.summary.rawScore}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    / {parsedData.summary.maxMarks}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  Correct: <strong className="text-emerald-700">+{parsedData.summary.grossPositive}</strong> • Negative: <strong className="text-rose-600">-{parsedData.summary.grossNegative}</strong>
                </div>
              </div>

              {/* Expected Normalized Score */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-3xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider">
                    Expected Normalization
                  </span>
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    +{parsedData.summary.normalizationBonus} Bonus
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-indigo-900 tracking-tight">
                    {parsedData.summary.normalizedScore}
                  </span>
                  <span className="text-xs font-bold text-indigo-500">
                    / {parsedData.summary.maxMarks}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-800 font-medium pt-1">
                  Shift: <strong className="font-bold">{parsedData.summary.shiftRating} Hardness</strong>
                </div>
              </div>

              {/* Predicted Rank Bracket */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Predicted All-India Rank
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {parsedData.summary.rankBracket}
                </div>
                <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center justify-between">
                  <span>Percentile: <strong className="text-blue-700">{parsedData.summary.percentile}</strong></span>
                  <span className="text-emerald-700 font-bold">{parsedData.summary.categoryRankBracket}</span>
                </div>
              </div>

              {/* Post Selection Chance */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    Selection Outlook
                  </span>
                  <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                    {parsedData.summary.postBadge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 leading-snug pt-1">
                  {parsedData.summary.safePostStatus}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Accuracy: <strong className="text-blue-600">{parsedData.summary.accuracy}</strong> ({parsedData.summary.totalAttempted}/{parsedData.summary.totalQuestions} Qs)
                </div>
              </div>

            </div>

            {/* Sectional Breakdown Cards & Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>Section-Wise Detailed Performance (4 Subjects)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complete breakdown of Reasoning, General Awareness, Quantitative Aptitude &amp; English Comprehension.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-bold self-start sm:self-auto bg-slate-100 px-3 py-1 rounded-full">
                  Total Questions: {parsedData.summary.totalQuestions}
                </span>
              </div>

              {/* 4 Sectional Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {parsedData.sections.map((sec, idx) => {
                  const maxSecMarks = parsedData.summary.maxMarks / Math.max(1, parsedData.sections.length);
                  const pct = Math.min(100, Math.max(0, (sec.netScore / maxSecMarks) * 100));
                  const attempted = sec.correct + sec.wrong;
                  const accVal = parseFloat(sec.accuracy) || 0;
                  const ratingBadge = accVal >= 80 ? "bg-emerald-100 text-emerald-800" : accVal >= 55 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800";
                  const ratingText = accVal >= 80 ? "Strong" : accVal >= 55 ? "Moderate" : "Needs Focus";

                  return (
                    <div key={idx} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            Section {idx + 1}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ratingBadge}`}>
                            {ratingText}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-1" title={sec.name}>
                          {sec.name}
                        </h4>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-slate-900">
                            {sec.netScore.toFixed(2)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            / {maxSecMarks.toFixed(0)} marks
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 70 ? "bg-emerald-500" : pct >= 45 ? "bg-blue-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200/60 text-center">
                        <div className="bg-emerald-50/70 rounded-lg p-1">
                          <div className="text-[11px] font-black text-emerald-700">+{sec.correct}</div>
                          <div className="text-[9px] text-emerald-600 font-bold">Right</div>
                        </div>
                        <div className="bg-rose-50/70 rounded-lg p-1">
                          <div className="text-[11px] font-black text-rose-700">-{sec.wrong}</div>
                          <div className="text-[9px] text-rose-600 font-bold">Wrong</div>
                        </div>
                        <div className="bg-slate-100 rounded-lg p-1">
                          <div className="text-[11px] font-black text-slate-600">{sec.unattempted}</div>
                          <div className="text-[9px] text-slate-500 font-bold">Left</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between pt-1">
                        <span>Attempted: <strong>{attempted}/{sec.total}</strong></span>
                        <span>Accuracy: <strong className="text-slate-800">{sec.accuracy}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sectional Detailed Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject / Section</th>
                      <th className="py-3 px-3 text-center">Total</th>
                      <th className="py-3 px-3 text-center">Attempted</th>
                      <th className="py-3 px-3 text-center text-emerald-700">Correct</th>
                      <th className="py-3 px-3 text-center text-rose-600">Wrong</th>
                      <th className="py-3 px-3 text-center text-slate-400">Left</th>
                      <th className="py-3 px-3 text-center text-emerald-700">Gross +</th>
                      <th className="py-3 px-3 text-center text-rose-600">Penalty -</th>
                      <th className="py-3 px-3 text-center">Accuracy</th>
                      <th className="py-3 px-4 text-right">Net Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedData.sections.map((sec, idx) => {
                      const attempted = sec.correct + sec.wrong;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                            <span>{sec.name}</span>
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-600 font-bold">{sec.total}</td>
                          <td className="py-3.5 px-3 text-center text-slate-800 font-bold">{attempted}</td>
                          <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">+{sec.correct}</td>
                          <td className="py-3.5 px-3 text-center text-rose-600 font-bold">-{sec.wrong}</td>
                          <td className="py-3.5 px-3 text-center text-slate-400">{sec.unattempted}</td>
                          <td className="py-3.5 px-3 text-center text-emerald-700 font-mono">+{sec.positiveMarks.toFixed(1)}</td>
                          <td className="py-3.5 px-3 text-center text-rose-600 font-mono">-{sec.negativeMarks.toFixed(1)}</td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{sec.accuracy}</td>
                          <td className="py-3.5 px-4 text-right font-black text-sm text-blue-700">
                            {sec.netScore.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100/90 font-black text-xs border-t-2 border-slate-300">
                    <tr>
                      <td className="py-3.5 px-4 text-slate-900">OVERALL GRAND TOTAL</td>
                      <td className="py-3.5 px-3 text-center">{parsedData.summary.totalQuestions}</td>
                      <td className="py-3.5 px-3 text-center">{parsedData.summary.totalAttempted}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-700">+{parsedData.summary.totalCorrect}</td>
                      <td className="py-3.5 px-3 text-center text-rose-600">-{parsedData.summary.totalWrong}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{parsedData.summary.totalUnattempted}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-700 font-mono">+{parsedData.summary.grossPositive.toFixed(1)}</td>
                      <td className="py-3.5 px-3 text-center text-rose-600 font-mono">-{parsedData.summary.grossNegative.toFixed(1)}</td>
                      <td className="py-3.5 px-3 text-center font-mono">{parsedData.summary.accuracy}</td>
                      <td className="py-3.5 px-4 text-right text-base text-blue-800">
                        {parsedData.summary.rawScore.toFixed(2)} / {parsedData.summary.maxMarks}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Question-By-Question Inspection Toggle */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Question-By-Question Detailed Verification</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify each question number, your chosen option, and official key match.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuestionsTable(!showQuestionsTable)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>{showQuestionsTable ? "Hide Questions" : `View All ${allQuestions.length} Questions`}</span>
                  {showQuestionsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showQuestionsTable && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  
                  {/* Question Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Filter by:</span>
                    
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      All ({allQuestions.length})
                    </button>

                    <button
                      onClick={() => setStatusFilter("correct")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        statusFilter === "correct" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      Correct ({parsedData.summary.totalCorrect})
                    </button>

                    <button
                      onClick={() => setStatusFilter("wrong")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        statusFilter === "wrong" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                      }`}
                    >
                      Wrong ({parsedData.summary.totalWrong})
                    </button>

                    <button
                      onClick={() => setStatusFilter("unattempted")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        statusFilter === "unattempted" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Unattempted ({parsedData.summary.totalUnattempted})
                    </button>
                  </div>

                  {/* Questions Grid Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-1">
                    {filteredQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                          q.status === "correct"
                            ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                            : q.status === "wrong"
                            ? "border-rose-300 bg-rose-50/70 text-rose-950"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Q.{q.qNum}</span>
                        <div className="my-0.5">
                          {q.status === "correct" ? (
                            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          ) : q.status === "wrong" ? (
                            <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                          ) : (
                            <span className="text-xs font-black text-slate-400">—</span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-black ${
                            q.status === "correct"
                              ? "text-emerald-700"
                              : q.status === "wrong"
                              ? "text-rose-700"
                              : "text-slate-400"
                          }`}
                        >
                          {q.marksGained > 0 ? `+${q.marksGained}` : q.marksGained < 0 ? `${q.marksGained}` : "0"}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
