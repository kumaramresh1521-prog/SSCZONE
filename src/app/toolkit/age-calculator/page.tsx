"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Award,
  ShieldCheck,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  Info,
  BookOpen,
  ArrowRight,
  Check,
  X,
  FileCheck,
  Wrench,
  Clock
} from "lucide-react";

interface ExamEligibility {
  id: string;
  name: string;
  postTitle: string;
  minAge: number;
  baseMaxAge: number;
}

const EXAM_CRITERIA: ExamEligibility[] = [
  { id: "cgl-27", name: "SSC CGL (Group C)", postTitle: "Auditor, Tax Assistant, Accountant", minAge: 18, baseMaxAge: 27 },
  { id: "cgl-30", name: "SSC CGL (Group B)", postTitle: "ASO (CSS/MEA), Inspector (Income Tax, Excise)", minAge: 18, baseMaxAge: 30 },
  { id: "cgl-32", name: "SSC CGL (JSO)", postTitle: "Junior Statistical Officer (JSO)", minAge: 18, baseMaxAge: 32 },
  { id: "chsl", name: "SSC CHSL (10+2)", postTitle: "Lower Division Clerk (LDC), JSA, DEO", minAge: 18, baseMaxAge: 27 },
  { id: "cpo", name: "SSC CPO (SI)", postTitle: "Sub-Inspector in Delhi Police & CAPFs", minAge: 20, baseMaxAge: 25 },
  { id: "mts-25", name: "SSC MTS (Cadre 1)", postTitle: "Multi-Tasking Staff (Non-Technical)", minAge: 18, baseMaxAge: 25 },
  { id: "mts-27", name: "SSC MTS & Havaldar", postTitle: "Havaldar in CBIC & CBN / MTS Cadre 2", minAge: 18, baseMaxAge: 27 },
  { id: "gd", name: "SSC GD Constable", postTitle: "General Duty Constable (BSF, CISF, CRPF, ITBP)", minAge: 18, baseMaxAge: 23 },
];

export default function SSCAgeCalculatorPage() {
  const [dob, setDob] = useState<string>("2000-05-15");
  const [cutoffDate, setCutoffDate] = useState<string>("2025-08-01");
  const [category, setCategory] = useState<"UR" | "OBC" | "SC_ST" | "PWD_UR" | "PWD_OBC" | "PWD_SC_ST">("UR");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculate exact age in Years, Months, Days
  const calculateAge = () => {
    if (!dob || !cutoffDate) return null;
    const birthDate = new Date(dob);
    const targetDate = new Date(cutoffDate);

    if (birthDate > targetDate) return null;

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return {
      years,
      months,
      days,
      totalDays: Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 3600 * 24)),
      decimalAge: Number((years + months / 12 + days / 365.25).toFixed(2))
    };
  };

  const ageInfo = calculateAge();

  // Category relaxation years
  const getRelaxation = () => {
    switch (category) {
      case "OBC": return 3;
      case "SC_ST": return 5;
      case "PWD_UR": return 10;
      case "PWD_OBC": return 13;
      case "PWD_SC_ST": return 15;
      default: return 0;
    }
  };

  const relaxationYears = getRelaxation();

  // Check eligibility for each exam
  const checkEligibility = (exam: ExamEligibility) => {
    if (!ageInfo) return { isEligible: false, reason: "Enter valid dates" };
    
    const effectiveMaxAge = exam.baseMaxAge + relaxationYears;
    
    if (ageInfo.decimalAge < exam.minAge) {
      return { isEligible: false, reason: `Underage (Min: ${exam.minAge} Yrs)` };
    }
    if (ageInfo.decimalAge > effectiveMaxAge) {
      return { isEligible: false, reason: `Overage (Max: ${effectiveMaxAge} Yrs)` };
    }
    return { isEligible: true, reason: `Eligible (Limit: ${exam.minAge}–${effectiveMaxAge} Yrs)` };
  };

  const faqs = [
    {
      q: "How does the Staff Selection Commission (SSC) determine the crucial cutoff date for age?",
      a: "According to DoPT (Department of Personnel and Training) guidelines: 1) If the examination tier/closing date falls in the first half of the calendar year (January to June), the crucial date is 1st January of that exam year. 2) If the examination tier/closing date falls in the second half of the calendar year (July to December), the crucial date is 1st August of that exam year. For SSC CGL 2025/2026, the cutoff date is 01-08-2025 / 01-08-2026."
    },
    {
      q: "What is the age relaxation for OBC (Non-Creamy Layer) candidates in SSC exams?",
      a: "OBC (NCL) candidates receive 3 years of upper age relaxation beyond the general category limit for the post applied. For example, for an 18-30 years CGL post, an eligible OBC candidate can apply up to 33 years of age."
    },
    {
      q: "What is the age relaxation for SC and ST candidates in SSC?",
      a: "SC and ST candidates are entitled to 5 years of upper age relaxation across all SSC exams (CGL, CHSL, CPO, MTS, GD, Steno). For example, for an 18-27 years post, the upper age limit becomes 32 years."
    },
    {
      q: "Can EWS (Economically Weaker Section) candidates get age relaxation in SSC?",
      a: "No. The Government of India provides a 10% vacancy reservation for EWS candidates, but there is NO age relaxation or concession in qualifying cutoff age for EWS category. EWS candidates must meet the same age criteria as Unreserved (General) category candidates."
    },
    {
      q: "What are the age limits for Sub-Inspector in Delhi Police & CAPFs (SSC CPO)?",
      a: "For SSC CPO Sub-Inspector posts, candidates must be between 20 and 25 years of age on the crucial cutoff date for the Unreserved category. OBC candidates can apply up to 28 years, and SC/ST candidates up to 30 years."
    }
  ];

  const relatedTools = [
    { title: "Photo & Signature Resizer", desc: "Compress photo (20-50 KB) & signature (10-20 KB) in seconds.", href: "/toolkit/photo-resizer" },
    { title: "TCS Typing Test Simulator", desc: "2000 Key Depressions in 15 mins TCS exam hall interface.", href: "/typing" },
    { title: "SSC Rank Predictor", desc: "Calculate raw marks and shift difficulty normalization score.", href: "/toolkit/rank-predictor" },
    { title: "Master Syllabus Tracker", desc: "Track chapter-wise 3-pillar progress for CGL, CHSL, CPO.", href: "/syllabus" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white py-10 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-bold text-indigo-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/toolkit" className="hover:text-white transition-colors">Candidate Toolkit</Link>
            <span>/</span>
            <span className="text-white">Age Calculator</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-indigo-700 flex items-center justify-center font-black shadow-lg shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  SSC Age Calculator &amp; Eligibility Checker 2026
                </h1>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1 font-medium">
                  Calculate your exact age in years, months, and days on official SSC cutoff dates with category relaxations.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>DoPT Circular Aligned</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* INPUT CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Enter Candidate Date of Birth &amp; Cutoff Date
            </h2>
            <span className="text-[11px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-full">
              Instant Result
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* DOB */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">
                1. Date of Birth (DOB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-medium">As recorded in Class 10th / Matriculation Certificate.</p>
            </div>

            {/* CUTOFF DATE */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">
                2. SSC Crucial Cutoff Date <span className="text-rose-500">*</span>
              </label>
              <select
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="2025-08-01">01-08-2025 (SSC CGL / CHSL 2025 Crucial Date)</option>
                <option value="2025-01-01">01-01-2025 (SSC 2025 Early Exams Cutoff)</option>
                <option value="2026-08-01">01-08-2026 (SSC CGL 2026 Expected Cutoff)</option>
                <option value="2026-01-01">01-01-2026 (SSC 2026 Tier 1 Early Cutoff)</option>
                <option value="2024-08-01">01-08-2024 (SSC CGL 2024 Past Reference)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Standard crucial date as notified by SSC.</p>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">
                3. Reservation Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="UR">UR (General / EWS) — No Relaxation (0 Yrs)</option>
                <option value="OBC">OBC (Non-Creamy Layer) — +3 Years</option>
                <option value="SC_ST">SC / ST — +5 Years</option>
                <option value="PWD_UR">PwD (Unreserved / EWS) — +10 Years</option>
                <option value="PWD_OBC">PwD (OBC) — +13 Years</option>
                <option value="PWD_SC_ST">PwD (SC/ST) — +15 Years</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Upper age relaxation will be automatically calculated.</p>
            </div>

          </div>
        </div>

        {/* AGE SUMMARY CARD */}
        {ageInfo && (
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl border border-indigo-500/20">
            <div className="text-center max-w-2xl mx-auto">
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/30 text-indigo-200 font-extrabold text-xs uppercase border border-indigo-300/30">
                Calculated Age as on {cutoffDate}
              </span>
              
              <div className="flex items-center justify-center gap-4 sm:gap-8 my-6">
                <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
                  <p className="text-4xl sm:text-5xl font-black text-amber-300">{ageInfo.years}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Years</p>
                </div>
                <div className="text-3xl text-indigo-400 font-light">:</div>
                <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
                  <p className="text-4xl sm:text-5xl font-black text-white">{ageInfo.months}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Months</p>
                </div>
                <div className="text-3xl text-indigo-400 font-light">:</div>
                <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
                  <p className="text-4xl sm:text-5xl font-black text-white">{ageInfo.days}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Days</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="bg-indigo-800/60 px-3 py-1 rounded-xl border border-indigo-400/20 text-indigo-200">
                  Total Lived: <b className="text-white font-mono">{ageInfo.totalDays.toLocaleString()}</b> Days
                </span>
                <span className="bg-indigo-800/60 px-3 py-1 rounded-xl border border-indigo-400/20 text-indigo-200">
                  Decimal Age: <b className="text-amber-300 font-mono">{ageInfo.decimalAge}</b> Years
                </span>
                <span className="bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/30 text-emerald-200 font-bold">
                  Relaxation: +{relaxationYears} Years ({category})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* POST-WISE ELIGIBILITY MATRIX */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-12">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" /> Exam Eligibility Status
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                SSC Post-Wise Eligibility Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Live verification of your calculated age against official SSC cadres (with category relaxation applied).
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Cutoff: <b className="text-slate-900">{cutoffDate}</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAM_CRITERIA.map((exam) => {
              const check = checkEligibility(exam);
              return (
                <div
                  key={exam.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    check.isEligible
                      ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
                      : "border-slate-200 bg-slate-50/60 opacity-80"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{exam.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {exam.minAge}–{exam.baseMaxAge + relaxationYears} Yrs
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{exam.postTitle}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{check.reason}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase shrink-0 flex items-center gap-1 shadow-xs ${
                      check.isEligible
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {check.isEligible ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Eligible</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Ineligible</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EDUCATIONAL GUIDE: HOW SSC CUTOFF DATE IS DECIDED */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-12 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" /> DoPT Official Norms
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              How Crucial Cutoff Date is Decided for SSC Examinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Staff Selection Commission adheres to Department of Personnel and Training (DoPT) Office Memorandum OM No. 14017/70/87-Estt.(RR) for fixing age reckoning dates:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-2">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wide">
                Case 1: Examinations Held in 1st Half (Jan – June)
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                For examinations where the closing date for application forms falls in the first half of the year, the crucial cutoff date is <b>1st January</b> of that examination year.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-2">
              <span className="text-xs font-black text-purple-900 uppercase tracking-wide">
                Case 2: Examinations Held in 2nd Half (July – Dec)
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                For examinations where the closing date falls in the second half of the year (e.g. SSC CGL notifications released in June/July), the crucial cutoff date is <b>1st August</b> of that year.
              </p>
            </div>
          </div>

          {/* CATEGORY AGE RELAXATION REFERENCE TABLE */}
          <div className="overflow-x-auto mt-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              Official Category Upper Age Relaxation Reference Table
            </h3>
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reservation Category</th>
                  <th className="py-3 px-4">Relaxation Permissible</th>
                  <th className="py-3 px-4">Example: 18–27 Post</th>
                  <th className="py-3 px-4">Example: 18–30 Post</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Unreserved (UR) / EWS</td>
                  <td className="py-3 px-4 text-slate-500 font-bold">No Relaxation (0 Yrs)</td>
                  <td className="py-3 px-4">Up to 27 Years</td>
                  <td className="py-3 px-4">Up to 30 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">OBC (Non-Creamy Layer)</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">+3 Years</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">Up to 30 Years</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">Up to 33 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SC / ST</td>
                  <td className="py-3 px-4 text-blue-700 font-black">+5 Years</td>
                  <td className="py-3 px-4 text-blue-700 font-bold">Up to 32 Years</td>
                  <td className="py-3 px-4 text-blue-700 font-bold">Up to 35 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">PwD (General / EWS)</td>
                  <td className="py-3 px-4 text-purple-700 font-black">+10 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 37 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 40 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">PwD (OBC)</td>
                  <td className="py-3 px-4 text-purple-700 font-black">+13 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 40 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 43 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">PwD (SC / ST)</td>
                  <td className="py-3 px-4 text-purple-700 font-black">+15 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 42 Years</td>
                  <td className="py-3 px-4 font-bold">Up to 45 Years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Ex-Servicemen (ESM)</td>
                  <td className="py-3 px-4 font-bold text-slate-700">3 Years after military service deduction</td>
                  <td className="py-3 px-4" colSpan={2}>Deduct military service duration from actual age + 3 Yrs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              SSC Age Eligibility &amp; Cutoff Rules FAQ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Top questions candidates ask regarding cutoff dates, certificate validity, and relaxations.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-indigo-600" : ""
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
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-extrabold text-[11px] uppercase border border-indigo-400/30">
              More Free Tools
            </span>
            <h3 className="text-xl font-black text-white mt-2">
              Explore Other Essential SSC Candidate Utilities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="bg-white/5 border border-white/10 hover:border-indigo-400/40 p-4 rounded-2xl flex flex-col justify-between group transition-all hover:bg-white/10"
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
    </div>
  );
}
