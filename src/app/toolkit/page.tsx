"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  Trophy,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CheckSquare,
  Zap,
  ShieldCheck,
  FileCheck
} from "lucide-react";

export default function ToolkitHubPage() {
  const tools = [
    {
      id: "syllabus-tracker",
      title: "SSC Master Syllabus Tracker & OneNote Checklist",
      description: "Interactive notification-mapped chapter checklist for CGL 2026, CHSL, CPO, MTS & GD with 3-Pillar tracking (Theory, 50+ PYQs, 3x Revisions) & personal formula scratchpads.",
      icon: CheckSquare,
      badge: "⭐ 2026 FLAGSHIP",
      badgeColor: "bg-purple-600 text-white",
      href: "/syllabus",
      gradient: "from-purple-600 to-indigo-600",
      features: [
        "100% Notification Mapped for CGL, CHSL, CPO, MTS & GD",
        "3-Pillar Progress (📖 Theory, ⚡ 50+ PYQs, 🔄 3x Revisions)",
        "Personal OneNote Scratchpad & Printable A4 Study Sheet"
      ]
    },
    {
      id: "rank-predictor",
      title: "SSC Rank Predictor & Marks Calculator",
      description: "Paste your official SSC Answer Key link or enter raw scores to calculate category rank, shift difficulty, and normalized marks.",
      icon: Trophy,
      badge: "🔥 POPULAR",
      badgeColor: "bg-blue-600 text-white",
      href: "/toolkit/rank-predictor",
      gradient: "from-blue-600 to-indigo-600",
      features: [
        "Instant Raw Score & Negative Deduction",
        "Shift Difficulty & Expected Normalization",
        "All-India & Category Rank Estimate"
      ]
    },
    {
      id: "age-calculator",
      title: "SSC Age Calculator",
      description: "Calculate your exact age as on the official SSC cutoff date with category age relaxation.",
      icon: Calendar,
      badge: "🎂 ACCURATE",
      badgeColor: "bg-indigo-600 text-white",
      href: "/toolkit/age-calculator",
      gradient: "from-indigo-600 to-purple-600",
      features: [
        "Cutoff Date Support (01-08-2025 / 01-01-2025)",
        "Category Age Relaxation (OBC +3y, SC/ST +5y)",
        "Exact Years, Months & Days Calculation"
      ]
    },
    {
      id: "photo-resizer",
      title: "SSC Photo & Signature Resizer Tool",
      description: "Crop and resize your passport photo (20-50 KB) and signature (10-20 KB) to exact SSC CGL/CHSL form guidelines.",
      icon: ImageIcon,
      badge: "🖼️ 100% PRIVATE",
      badgeColor: "bg-emerald-600 text-white",
      href: "/toolkit/photo-resizer",
      gradient: "from-emerald-600 to-teal-600",
      features: [
        "Exact 3.5x4.5 cm Photo & 4x2 cm Signature Specs",
        "Client-Side 100% Private (No Upload to Server)",
        "1-Click Direct Download Form-Ready JPEG"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-12 px-4 sm:px-6 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/30 text-white font-extrabold text-xs uppercase tracking-wider mb-4 border border-blue-300/40">
            <Wrench className="w-4 h-4 text-amber-300" /> SSC ZONE Utilities Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            SSC Candidate Utilities & Toolkit 🛠️
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Free high-precision tools designed specifically for SSC CGL, CHSL, CPO, and Stenographer candidates.
          </p>
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.gradient} text-white flex items-center justify-center font-black shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {tool.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  <div className="space-y-2 mb-6 pt-3 border-t border-slate-100">
                    {tool.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tool.href}
                  className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${tool.gradient} text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all`}
                >
                  <span>Open {tool.title.split(" ")[1]} Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* TRUST BADGE FOOTER */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>100% Free & No Registration Required</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Official SSC 2025 Criteria Aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Instant Results in Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
