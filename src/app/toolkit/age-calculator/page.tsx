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
  Check,
  X
} from "lucide-react";

export default function SSCAgeCalculatorPage() {
  const [dob, setDob] = useState<string>("2000-05-15");
  const [cutoffDate, setCutoffDate] = useState<string>("2025-08-01");
  const [category, setCategory] = useState<"UR" | "OBC" | "SC_ST" | "PWD_UR" | "PWD_OBC" | "PWD_SC_ST">("UR");

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

    return { years, months, days, totalDays: Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 3600 * 24)) };
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

  // Major SSC Posts criteria
  const posts = [
    {
      name: "SSC CGL (ASO / Excise / IT Inspector / Examiner)",
      baseMin: 18,
      baseMax: 30,
      description: "Assistant Section Officer (CSS/MEA), Income Tax Inspector, Central Excise Inspector"
    },
    {
      name: "SSC CGL (Tax Assistant / UDC / Auditor Posts)",
      baseMin: 18,
      baseMax: 27,
      description: "Tax Assistant (CBDT/CBIC), Upper Division Clerk, Accountant & Auditor"
    },
    {
      name: "SSC CGL (Junior Statistical Officer - JSO)",
      baseMin: 18,
      baseMax: 32,
      description: "JSO in Ministry of Statistics & Programme Implementation"
    },
    {
      name: "SSC CHSL (LDC / JSA / Data Entry Operator)",
      baseMin: 18,
      baseMax: 27,
      description: "Lower Division Clerk, Junior Secretariat Assistant, DEO"
    },
    {
      name: "SSC CPO Sub-Inspector (Delhi Police & CAPF)",
      baseMin: 20,
      baseMax: 25,
      description: "Sub-Inspector in BSF, CISF, CRPF, ITBP, SSB & Delhi Police"
    },
    {
      name: "SSC Stenographer Grade C",
      baseMin: 18,
      baseMax: 30,
      description: "Stenographer Grade C in Central Ministries"
    },
    {
      name: "SSC Stenographer Grade D",
      baseMin: 18,
      baseMax: 27,
      description: "Stenographer Grade D in Attached Offices"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-100 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to SSC Toolkit
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-indigo-700 flex items-center justify-center font-black shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                SSC Age & Post Eligibility Calculator
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm mt-0.5 font-medium">
                Calculate your exact age on SSC cutoff date & check post-by-post eligibility with category relaxation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* INPUT CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-indigo-600" /> Enter Candidate Details & Cutoff Date
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* DOB */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">Date of Birth (DOB):</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* CUTOFF DATE */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">SSC Cutoff Date:</label>
              <select
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600"
              >
                <option value="2025-08-01">01-08-2025 (SSC CGL / CHSL 2025 Expected Cutoff)</option>
                <option value="2025-01-01">01-01-2025 (SSC 2025 Early Cutoff)</option>
                <option value="2024-08-01">01-08-2024 (SSC CGL 2024 Cutoff)</option>
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase block mb-2">Reservation Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-indigo-600"
              >
                <option value="UR">UR (General / EWS) — No Relaxation</option>
                <option value="OBC">OBC (+3 Years Relaxation)</option>
                <option value="SC_ST">SC / ST (+5 Years Relaxation)</option>
                <option value="PWD_UR">PwD General (+10 Years Relaxation)</option>
                <option value="PWD_OBC">PwD OBC (+13 Years Relaxation)</option>
                <option value="PWD_SC_ST">PwD SC/ST (+15 Years Relaxation)</option>
              </select>
            </div>

          </div>
        </div>

        {/* AGE SUMMARY CARD */}
        {ageInfo && (
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
            <div className="text-center max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-extrabold text-[10px] uppercase border border-indigo-300/30">
                Calculated Candidate Age as on {cutoffDate}
              </span>
              
              <div className="flex items-center justify-center gap-4 sm:gap-8 my-4">
                <div>
                  <p className="text-4xl sm:text-5xl font-black text-amber-300">{ageInfo.years}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Years</p>
                </div>
                <div className="text-3xl text-indigo-400 font-light">:</div>
                <div>
                  <p className="text-4xl sm:text-5xl font-black text-white">{ageInfo.months}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Months</p>
                </div>
                <div className="text-3xl text-indigo-400 font-light">:</div>
                <div>
                  <p className="text-4xl sm:text-5xl font-black text-white">{ageInfo.days}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase mt-1">Days</p>
                </div>
              </div>

              <p className="text-xs text-indigo-200 font-medium">
                Category Relaxation Applied: <span className="font-extrabold text-amber-300">+{relaxationYears} Years</span> ({category})
              </p>
            </div>
          </div>
        )}

        {/* POST ELIGIBILITY TABLE */}
        {ageInfo && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Post-by-Post Eligibility Report</span>
              <span className="text-xs text-indigo-600 font-bold">Category: {category}</span>
            </h3>

            <div className="space-y-4">
              {posts.map((p, idx) => {
                const maxAgeWithRelaxation = p.baseMax + relaxationYears;
                const isEligible = ageInfo.years >= p.baseMin && ageInfo.years < maxAgeWithRelaxation;

                return (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isEligible
                        ? "bg-emerald-50/60 border-emerald-300"
                        : "bg-red-50/60 border-red-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isEligible ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                          {isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                        </span>
                        <p className="font-black text-sm text-slate-900">{p.name}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">
                        Age Range Required: {p.baseMin} to {p.baseMax} Years (Effective Max: {maxAgeWithRelaxation} Yrs)
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isEligible ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                          <Check className="w-4 h-4 text-emerald-600" /> Eligible to Apply
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-black text-red-700 bg-white px-3 py-1.5 rounded-xl border border-red-200 shadow-xs">
                          <X className="w-4 h-4 text-red-600" /> Age Limit Exceeded
                        </div>
                      )}
                    </div>
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
