"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  FileCheck,
  Keyboard,
  FileText,
  ChevronDown,
  HelpCircle,
  Sliders,
  ExternalLink
} from "lucide-react";
import { CandidateTool, DEFAULT_CANDIDATE_TOOLS } from "@/lib/candidate-tools-store";

// Map icon string name to Lucide Icon component
function getToolIcon(name?: string) {
  switch (name) {
    case "CheckSquare":
      return CheckSquare;
    case "Trophy":
      return Trophy;
    case "Image":
      return ImageIcon;
    case "Keyboard":
      return Keyboard;
    case "Calendar":
      return Calendar;
    case "Sparkles":
      return Sparkles;
    case "Zap":
      return Zap;
    case "FileText":
      return FileText;
    case "ShieldCheck":
      return ShieldCheck;
    case "Wrench":
    default:
      return Wrench;
  }
}

export default function ToolkitHubPage() {
  const [tools, setTools] = useState<CandidateTool[]>(DEFAULT_CANDIDATE_TOOLS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load published tools dynamically from Supabase API
  useEffect(() => {
    async function loadTools() {
      try {
        const res = await fetch("/api/candidate-tools");
        if (res.ok) {
          const json = await res.json();
          if (json?.tools && Array.isArray(json.tools) && json.tools.length > 0) {
            setTools(json.tools);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic candidate tools, using defaults:", err);
      }
    }
    loadTools();
  }, []);

  // Filter tools by category
  const filteredTools = useMemo(() => {
    if (activeCategory === "all") return tools;
    return tools.filter((t) => t.category === activeCategory);
  }, [tools, activeCategory]);

  const categories = [
    { id: "all", label: "All Utilities" },
    { id: "utility", label: "Photo & Signature Tools" },
    { id: "calculator", label: "Score & Age Calculators" },
    { id: "practice", label: "Exam Hall Simulators" },
    { id: "checklist", label: "Syllabus Trackers" },
  ];

  const faqs = [
    {
      q: "What are the official SSC photo and signature specifications for 2025-2026?",
      a: "As per official Staff Selection Commission notifications, passport photos must be between 20 KB and 50 KB in JPEG/JPG format with dimensions of 3.5 cm (width) × 4.5 cm (height). Signatures must be between 10 KB and 20 KB in JPEG/JPG format with dimensions of 4.0 cm (width) × 2.0 cm (height). Both should have a clean, light background and be clearly legible."
    },
    {
      q: "Are photos and documents uploaded to your server when using the Photo Resizer?",
      a: "No! All compression and resizing takes place 100% inside your web browser using HTML5 Canvas. Your personal images never leave your computer or mobile device and are never sent to any server."
    },
    {
      q: "How does the SSC typing test speed requirement work?",
      a: "For SSC CGL Data Entry Skill Test (DEST), candidates must type 2,000 key depressions in 15 minutes, which is approximately 27 WPM (words per minute). The maximum allowable mistake percentage is 5% for General (UR) and 7% for OBC/EWS/SC/ST candidates."
    },
    {
      q: "How is the cutoff date age calculated for SSC CGL, CHSL, and CPO?",
      a: "The SSC notification specifies a crucial cutoff date (typically 01-08-2025 or 01-01-2025). The age calculator computes your exact completed years, months, and days as of that cutoff date and automatically applies category relaxations (OBC +3 years, SC/ST +5 years, PwD +10 to +15 years)."
    },
    {
      q: "Are these candidate tools completely free?",
      a: "Yes! All tools on SSCZone are 100% free with unlimited usage, zero ads during testing, and no registration or phone number required."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-14 px-4 sm:px-6 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/30 text-white font-extrabold text-xs uppercase tracking-wider mb-4 border border-blue-300/40">
            <Wrench className="w-4 h-4 text-amber-300" /> SSC Candidate Utilities Hub 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            SSC Candidate Toolkit & Utilities 🛠️
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Free high-precision tools designed specifically for SSC CGL, CHSL, CPO, MTS, and GD candidates. Zero server uploads, instant results, and 100% notification-aligned.
          </p>

          {/* Quick Stats Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-blue-100">
            <div className="flex items-center gap-1.5 bg-blue-800/40 px-3 py-1.5 rounded-full border border-blue-400/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-800/40 px-3 py-1.5 rounded-full border border-blue-400/20">
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>SSC 2025-2026 Guidelines</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-800/40 px-3 py-1.5 rounded-full border border-blue-400/20">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Zero Registration Needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR PILLS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/30"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = getToolIcon(tool.iconName);
            const gradient = tool.gradient || "from-blue-600 to-indigo-600";
            const badgeColor = tool.badgeColor || "bg-blue-600 text-white";

            return (
              <div
                key={tool.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-black shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs ${badgeColor}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {tool.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {tool.features && tool.features.length > 0 && (
                    <div className="space-y-2 mb-6 pt-3 border-t border-slate-100">
                      {tool.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={tool.href}
                  className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${gradient} text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all`}
                >
                  <span>Open Tool</span>
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
            <span>100% Free &amp; In-Browser Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Official SSC 2025-2026 Aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Instant Results in Seconds</span>
          </div>
        </div>

        {/* EDUCATIONAL FAQ ACCORDION FOR GOOGLE SEO & CANDIDATES */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              SSC Candidate Utilities &amp; Guidelines FAQ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Official Staff Selection Commission rules regarding application uploads, typing speeds, and cutoff criteria.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
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
      </div>
    </div>
  );
}
