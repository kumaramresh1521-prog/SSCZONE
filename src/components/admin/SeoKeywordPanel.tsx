"use client";

import { useState } from "react";
import { 
  analyzeSeo, 
  SeoAuditReport 
} from "@/lib/seo-analyzer";
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Smartphone, 
  Monitor, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  FileText,
  Calculator,
  Flame,
  ArrowRight
} from "lucide-react";

interface SeoKeywordPanelProps {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  focusKeyword: string;
  onFocusKeywordChange: (val: string) => void;
  imageUrl?: string | null;
  onInsertSnippet?: (htmlSnippet: string) => void;
}

export default function SeoKeywordPanel({
  title,
  slug,
  content,
  excerpt,
  focusKeyword,
  onFocusKeywordChange,
  imageUrl,
  onInsertSnippet,
}: SeoKeywordPanelProps) {
  const [serpView, setSerpView] = useState<"desktop" | "mobile">("mobile");
  const [activeTab, setActiveTab] = useState<"checklist" | "serp" | "blocks">("checklist");

  const report: SeoAuditReport = analyzeSeo({
    title,
    slug,
    content,
    excerpt,
    focusKeyword,
    imageUrl,
  });

  // Ready-made Educational Content Blocks for 1-Click insertion
  const educationalBlocks = [
    {
      title: "📢 Official Exam Notification Alert",
      desc: "High-contrast announcement banner with key deadline",
      badge: "High Priority",
      snippet: `
<div style="background: linear-gradient(to right, #eff6ff, #f0fdf4); border-left: 5px solid #2563eb; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #1e3a8a; font-size: 15px;">📢 IMPORTANT OFFICIAL NOTIFICATION UPDATE</p>
  <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">Staff Selection Commission has updated the recruitment timeline. Candidates are advised to register OTR on <strong>ssc.gov.in</strong> before the deadline.</p>
</div>
`,
    },
    {
      title: "💡 TCS Exam Secret / Trap Alert",
      desc: "Advice callout warning candidates about negative marking traps",
      badge: "Strategy",
      snippet: `
<div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #d97706; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #92400e; font-size: 15px;">⚠️ TCS EXAM PATTERN TRAP (Candidate Warning)</p>
  <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">In recent shifts, calculation intensity in Quantitative Aptitude has increased. Avoid spending more than 60 seconds on single algebra puzzles; skip and return in the second round.</p>
</div>
`,
    },
    {
      title: "📐 Maths Formula Box (LaTeX equations)",
      desc: "Clean formula container with standard algebraic/trig identities",
      badge: "Maths",
      snippet: `
<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px 22px; border-radius: 12px; margin: 20px 0; font-family: monospace;">
  <p style="margin: 0 0 8px 0; font-weight: 800; color: #0f172a; font-size: 14px; font-family: sans-serif;">📐 ESSENTIAL QUANTITATIVE IDENTITIES:</p>
  <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">• If <strong>x + 1/x = k</strong>, then <strong>x² + 1/x² = k² - 2</strong></p>
  <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">• If <strong>x + 1/x = k</strong>, then <strong>x³ + 1/x³ = k³ - 3k</strong></p>
  <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">• Area of Triangle with semi-perimeter s: <strong>√[s(s - a)(s - b)(s - c)]</strong></p>
</div>
`,
    },
    {
      title: "📊 Exam Pattern & Marking Scheme Table",
      desc: "Structured 3-column table with questions, marks & duration",
      badge: "Table",
      snippet: `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background: #1e293b; color: #ffffff; text-align: left;">
      <th style="padding: 12px 14px; border: 1px solid #334155;">Section / Subject</th>
      <th style="padding: 12px 14px; border: 1px solid #334155;">Questions</th>
      <th style="padding: 12px 14px; border: 1px solid #334155;">Total Marks</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #ffffff;">
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">1. General Intelligence & Reasoning</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25 Questions</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50 Marks</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">2. General Awareness & Current Affairs</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25 Questions</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50 Marks</td>
    </tr>
    <tr style="background: #ffffff;">
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">3. Quantitative Aptitude</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25 Questions</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50 Marks</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">4. English Comprehension</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25 Questions</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50 Marks</td>
    </tr>
  </tbody>
</table>
`,
    },
    {
      title: "❓ Frequently Asked Questions (FAQ Block)",
      desc: "Q&A format that automatically triggers Google FAQ rich snippets",
      badge: "Google FAQ",
      snippet: `
<div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #ffffff;">
  <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a; font-weight: 800;">Frequently Asked Questions (FAQs)</h3>
  
  <div style="margin-bottom: 14px;">
    <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #1e3a8a; font-weight: 700;">Q1: What is the minimum educational qualification required?</h4>
    <p style="margin: 0; color: #475569; font-size: 14px;">A Bachelor's Degree in any discipline from a recognized university is required as of the crucial eligibility date.</p>
  </div>
  
  <div style="margin-bottom: 14px;">
    <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #1e3a8a; font-weight: 700;">Q2: Is there negative marking in the Computer Based Examination?</h4>
    <p style="margin: 0; color: #475569; font-size: 14px;">Yes, 0.50 marks are deducted for every wrong answer in the Tier-1 examination.</p>
  </div>
</div>
`,
    },
    {
      title: "🎯 SSCZone CBT Mock Test & PYQ CTA Card",
      desc: "Direct clickable box converting readers into active test takers",
      badge: "Conversion",
      snippet: `
<div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; padding: 22px 26px; border-radius: 16px; margin: 25px 0; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <span style="background: rgba(255,255,255,0.2); font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px; width: fit-content; text-transform: uppercase;">100% Authentic Shift Papers</span>
    <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">Practice Official SSC Shift Papers in Real CBT Exam Mode</h3>
    <p style="margin: 0; font-size: 13px; color: #dbeafe; line-height: 1.4;">Attempt timed tests with instant percentile scorecards, bilingual solutions, and clean PDF downloads on SSCZone.</p>
    <a href="/papers" style="display: inline-block; margin-top: 10px; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 13px; width: fit-content;">Attempt CBT Test Now →</a>
  </div>
</div>
`,
    },
  ];

  return (
    <div className="rounded-3xl border-2 border-indigo-200/90 bg-white p-5 sm:p-6 shadow-md text-left space-y-6">
      
      {/* ── Header: Focus Keyword & Score Meter ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5 flex-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              Rank-Math Style SEO & Keyword Studio
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Enter your target search keyword to unlock real-time Google ranking audits and content recommendations.
          </p>

          {/* Primary Keyword Input Field */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. SSC CGL 2026 Notification (Enter your primary focus keyword)..."
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/40 pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Live Score Dial */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-blue-50/50 p-3.5 rounded-2xl border border-slate-200 shrink-0">
          <div className="relative flex items-center justify-center h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  report.score >= 80
                    ? "text-emerald-500"
                    : report.score >= 50
                    ? "text-blue-500"
                    : "text-amber-500"
                }
                strokeDasharray={`${report.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-slate-900 leading-none">
                {report.score}
              </span>
              <span className="text-[9px] font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border ${report.badgeColor}`}>
                {report.rating}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              <span><b>{report.wordCount}</b> Words</span> • <span>{report.readTime}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Density: <b className="text-slate-800">{report.keywordDensity}%</b> ({report.keywordCount} times)
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("checklist")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "checklist"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>SEO Checklist ({report.tests.filter((t) => t.status === "pass").length}/{report.tests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("serp")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "serp"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>Google Search SERP Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blocks")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "blocks"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>Quick Educational Blocks</span>
        </button>
      </div>

      {/* ── TAB 1: SEO AUDIT CHECKLIST ── */}
      {activeTab === "checklist" && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {report.tests.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                  t.status === "pass"
                    ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-950"
                    : t.status === "warn"
                    ? "bg-amber-50/50 border-amber-200/80 text-amber-950"
                    : "bg-rose-50/50 border-rose-200/80 text-rose-950"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {t.status === "pass" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : t.status === "warn" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 leading-snug">{t.label}</span>
                    <span className="text-[10px] font-black text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                      +{t.score}/{t.maxScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{t.message}</p>
                  {t.tip && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                      Tip: {t.tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: GOOGLE SERP PREVIEW ── */}
      {activeTab === "serp" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Live Google Search Result Preview:
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSerpView("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  serpView === "mobile" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setSerpView("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  serpView === "desktop" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Google Result Box */}
          <div className={`p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs ${
            serpView === "mobile" ? "max-w-md mx-auto" : "w-full"
          }`}>
            <div className="space-y-1.5">
              {/* Google Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                  SZ
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <span>ssczone.com</span>
                  <span>›</span>
                  <span>blog</span>
                  <span>›</span>
                  <span className="text-slate-700 font-medium truncate">{slug || "article-url"}</span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                {title ? `${title} | SSCZone` : "Post Title Goes Here | Official SSCZone Portal"}
              </h4>

              {/* Description */}
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {excerpt || content.replace(/<[^>]+>/g, " ").substring(0, 150) || "Comprehensive article description and official guidelines for SSC candidates..."}
              </p>
            </div>
          </div>

          {/* Char Counter Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Title Length:</span>
                <span className={report.titleCharCount >= 50 && report.titleCharCount <= 65 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {report.titleCharCount} / 60 Chars
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    report.titleCharCount >= 50 && report.titleCharCount <= 65
                      ? "bg-emerald-500"
                      : report.titleCharCount > 65
                      ? "bg-rose-500"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, (report.titleCharCount / 65) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Description Length:</span>
                <span className={report.descCharCount >= 120 && report.descCharCount <= 165 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {report.descCharCount} / 160 Chars
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    report.descCharCount >= 120 && report.descCharCount <= 165
                      ? "bg-emerald-500"
                      : report.descCharCount > 165
                      ? "bg-rose-500"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, (report.descCharCount / 160) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: QUICK EDUCATIONAL BLOCKS (1-Click Insert) ── */}
      {activeTab === "blocks" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Click any block below to instantly append it into your article editor:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {educationalBlocks.map((blk, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between hover:border-blue-400 hover:bg-blue-50/20 transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {blk.badge}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug">
                    {blk.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {blk.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onInsertSnippet) onInsertSnippet(blk.snippet);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-300 py-1.5 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>+ Insert Block</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
