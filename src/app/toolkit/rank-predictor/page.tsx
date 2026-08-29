"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  FileText
} from "lucide-react";

export default function SSCPageRankPredictor() {
  const [examType, setExamType] = useState<"cgl-tier1" | "cgl-tier2" | "chsl-tier1">("cgl-tier1");
  const [category, setCategory] = useState<"UR" | "OBC" | "EWS" | "SC" | "ST">("UR");
  const [shiftDifficulty, setShiftDifficulty] = useState<"hard" | "moderate" | "easy">("hard");
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string>("");

  // Manual Section Scores Input State
  const [mathsCorrect, setMathsCorrect] = useState<number>(22);
  const [mathsWrong, setMathsWrong] = useState<number>(2);

  const [reasoningCorrect, setReasoningCorrect] = useState<number>(23);
  const [reasoningWrong, setReasoningWrong] = useState<number>(1);

  const [englishCorrect, setEnglishCorrect] = useState<number>(21);
  const [englishWrong, setEnglishWrong] = useState<number>(3);

  const [gkCorrect, setGkCorrect] = useState<number>(14);
  const [gkWrong, setGkWrong] = useState<number>(6);

  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Exam Scoring Constants
  const isTier1 = examType === "cgl-tier1" || examType === "chsl-tier1";
  const positiveMarks = isTier1 ? 2.0 : 3.0;
  const negativeMarks = isTier1 ? 0.5 : 1.0;
  const maxMarksTotal = isTier1 ? 200 : 390;

  const totalCorrect = mathsCorrect + reasoningCorrect + englishCorrect + gkCorrect;
  const totalWrong = mathsWrong + reasoningWrong + englishWrong + gkWrong;
  const totalAttempted = totalCorrect + totalWrong;

  const grossPositive = totalCorrect * positiveMarks;
  const grossNegative = totalWrong * negativeMarks;
  const rawScore = Math.max(0, grossPositive - grossNegative);

  // Expected Normalization Bonus Calculation
  const getNormalizationBonus = () => {
    let baseBonus = shiftDifficulty === "hard" ? 14.5 : shiftDifficulty === "moderate" ? 7.2 : 1.5;
    if (examType === "cgl-tier2") baseBonus *= 1.8;
    return parseFloat(baseBonus.toFixed(1));
  };

  const normBonus = getNormalizationBonus();
  const normalizedScore = Math.min(maxMarksTotal, parseFloat((rawScore + normBonus).toFixed(1)));

  // Estimated Rank Bracket Simulation
  const getRankEstimate = () => {
    const scorePercent = (normalizedScore / maxMarksTotal) * 100;
    if (scorePercent >= 80) return { rank: "1 - 850", percentile: "99.2%", status: "🔥 Safe for Top Inspector / ASO Post" };
    if (scorePercent >= 70) return { rank: "851 - 4,500", percentile: "96.5%", status: "🟢 Safe for TA / Auditor / Executive Post" };
    if (scorePercent >= 60) return { rank: "4,501 - 18,000", percentile: "91.0%", status: "🟡 Borderline Tier 2 Cutoff Range" };
    return { rank: "18,001 - 50,000+", percentile: "78.4%", status: "🔴 Need Higher Marks in Next Shift" };
  };

  const rankInfo = getRankEstimate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to SSC Toolkit
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                  🔥 RANKIQ ALGORITHM ENGINE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                SSC Rank Predictor & Marks Calculator
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* URL OR MANUAL SELECTOR CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-blue-600" /> Option A: Paste SSC Official Answer Key URL
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <input
              type="text"
              placeholder="Paste SSC Digialm Response Sheet URL (https://ssc.digialm.com/...)..."
              value={answerKeyUrl}
              onChange={(e) => setAnswerKeyUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => setIsCalculated(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shrink-0 shadow-md transition-all"
            >
              Parse & Calculate Score
            </button>
          </div>

          <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Option B: Enter Sectional Correct & Wrong Answers
          </h2>

          {/* EXAM & SHIFT SELECTORS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">Select Target SSC Exam:</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="cgl-tier1">SSC CGL Tier 1 (200 Marks)</option>
                <option value="cgl-tier2">SSC CGL Tier 2 (390 Marks)</option>
                <option value="chsl-tier1">SSC CHSL Tier 1 (200 Marks)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="UR">UR (Unreserved)</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">Perceived Shift Difficulty:</label>
              <select
                value={shiftDifficulty}
                onChange={(e) => setShiftDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="hard">Hard Shift (+12 to +16 Normalization)</option>
                <option value="moderate">Moderate Shift (+6 to +9 Normalization)</option>
                <option value="easy">Easy Shift (+0 to +3 Normalization)</option>
              </select>
            </div>
          </div>

          {/* SECTIONAL INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* MATHS */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-extrabold text-xs text-blue-700 uppercase mb-2">Mathematics</p>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Correct Qs:</label>
                  <input
                    type="number"
                    value={mathsCorrect}
                    onChange={(e) => setMathsCorrect(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Wrong Qs:</label>
                  <input
                    type="number"
                    value={mathsWrong}
                    onChange={(e) => setMathsWrong(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* REASONING */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-extrabold text-xs text-blue-700 uppercase mb-2">Reasoning</p>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Correct Qs:</label>
                  <input
                    type="number"
                    value={reasoningCorrect}
                    onChange={(e) => setReasoningCorrect(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Wrong Qs:</label>
                  <input
                    type="number"
                    value={reasoningWrong}
                    onChange={(e) => setReasoningWrong(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* ENGLISH */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-extrabold text-xs text-blue-700 uppercase mb-2">English</p>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Correct Qs:</label>
                  <input
                    type="number"
                    value={englishCorrect}
                    onChange={(e) => setEnglishCorrect(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Wrong Qs:</label>
                  <input
                    type="number"
                    value={englishWrong}
                    onChange={(e) => setEnglishWrong(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* GK */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-extrabold text-xs text-blue-700 uppercase mb-2">General Awareness</p>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Correct Qs:</label>
                  <input
                    type="number"
                    value={gkCorrect}
                    onChange={(e) => setGkCorrect(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Wrong Qs:</label>
                  <input
                    type="number"
                    value={gkWrong}
                    onChange={(e) => setGkWrong(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RESULTS SCORECARD DASHBOARD */}
        {isCalculated && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-700 mb-2">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Rank & Scorecard Breakdown</h3>
              <p className="text-xs text-blue-700 font-extrabold mt-1">Based on RankIQ SSC Normalization Algorithm</p>
            </div>

            {/* SCORE STATS SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-extrabold">Net Raw Score</p>
                <p className="text-2xl font-black text-blue-700 mt-1">{rawScore} <span className="text-xs text-slate-500">/ {maxMarksTotal}</span></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-extrabold">Expected Normalization</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">+{normBonus} <span className="text-xs text-slate-500">Marks</span></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-extrabold">Normalized Score</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{normalizedScore} <span className="text-xs text-slate-500">Marks</span></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-extrabold">Estimated Percentile</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{rankInfo.percentile}</p>
              </div>
            </div>

            {/* RANK & SAFE SCORE BANNER */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  ESTIMATED ALL-INDIA RANK
                </span>
                <p className="text-3xl font-black text-white mt-1">Rank: {rankInfo.rank}</p>
                <p className="text-xs text-blue-200 font-medium mt-1">{rankInfo.status}</p>
              </div>

              <div className="text-center sm:text-right bg-blue-950/60 p-4 rounded-2xl border border-blue-400/30">
                <p className="text-[10px] text-blue-200 font-bold uppercase">Accuracy & Negative Deductions</p>
                <p className="text-xs font-black text-white mt-1">
                  Correct: <span className="text-emerald-400">{totalCorrect} Qs</span> (+{grossPositive}) | Wrong: <span className="text-red-400">{totalWrong} Qs</span> (-{grossNegative})
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
