"use client";

import { useState } from "react";
import { 
  analyzeSeo, 
  SeoAuditReport,
  SecondaryKeywordAudit
} from "@/lib/seo-analyzer";
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Smartphone, 
  Monitor, 
  Plus,
  Trash2,
  Share2,
  Tag,
  Key,
  Flame,
  FileText,
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface SeoKeywordPanelProps {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  focusKeyword: string;
  onFocusKeywordChange: (val: string) => void;
  secondaryKeywords: string;
  onSecondaryKeywordsChange: (val: string) => void;
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
  secondaryKeywords,
  onSecondaryKeywordsChange,
  imageUrl,
  onInsertSnippet,
}: SeoKeywordPanelProps) {
  const [serpView, setSerpView] = useState<"desktop" | "mobile" | "social">("mobile");
  const [activeTab, setActiveTab] = useState<"checklist" | "secondary" | "serp" | "blocks">("checklist");
  const [newSecKw, setNewSecKw] = useState("");

  const report: SeoAuditReport = analyzeSeo({
    title,
    slug,
    content,
    excerpt,
    focusKeyword,
    secondaryKeywords,
    imageUrl,
  });

  // Parse secondary keywords into array
  const secondaryList = secondaryKeywords
    ? secondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const handleAddSecondary = (kwToAdd?: string) => {
    const target = (kwToAdd || newSecKw).trim();
    if (!target) return;
    if (secondaryList.some((k) => k.toLowerCase() === target.toLowerCase())) {
      setNewSecKw("");
      return;
    }
    const updated = [...secondaryList, target].join(", ");
    onSecondaryKeywordsChange(updated);
    setNewSecKw("");
  };

  const handleRemoveSecondary = (index: number) => {
    const updated = secondaryList.filter((_, i) => i !== index).join(", ");
    onSecondaryKeywordsChange(updated);
  };

  // 1-Click Keyword Suggestions based on Primary Keyword
  const suggestedKeywords = focusKeyword.trim()
    ? [
        `${focusKeyword} Notes PDF`,
        `${focusKeyword} Previous Year Questions`,
        `${focusKeyword} SSC CGL Syllabus`,
        `${focusKeyword} Short Tricks & Formulas`,
        `${focusKeyword} Questions with Answers`,
      ].filter((s) => !secondaryList.some((k) => k.toLowerCase() === s.toLowerCase()))
    : [];

  // Ready-made Educational Content Blocks for 1-Click insertion
  const educationalBlocks = [
    {
      title: "📢 Exam Notification Alert",
      desc: "High-contrast announcement banner with key deadline",
      badge: "High Priority",
      snippet: `
<div style="background: linear-gradient(to right, #eff6ff, #f0fdf4); border-left: 5px solid #2563eb; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #1e3a8a; font-size: 15px;">📢 IMPORTANT EXAM NOTIFICATION UPDATE</p>
  <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">Staff Selection Commission has updated the recruitment timeline. Candidates are advised to register OTR on <strong>ssc.gov.in</strong> before the deadline.</p>
</div>
`,
    },
    {
      title: "💡 Exam Pattern Secret / Trap Alert",
      desc: "Advice callout warning candidates about negative marking traps",
      badge: "Strategy",
      snippet: `
<div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #d97706; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #92400e; font-size: 15px;">⚠️ EXAM PATTERN TRAP (Candidate Warning)</p>
  <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">In recent shifts, calculation intensity has increased. Avoid spending more than 60 seconds on single calculation traps; mark for review and return in the second round.</p>
</div>
`,
    },
    {
      title: "📊 Comparative Table (Teal Clean Style)",
      desc: "Clean 3-column table with teal headers matching textbook styling",
      badge: "Table",
      snippet: `
<div class="tbl"><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px;">
  <thead>
    <tr style="background: #0f766e; color: #ffffff; text-align: left;">
      <th style="padding: 10px 14px;">Parameter / Feature</th>
      <th style="padding: 10px 14px;">Category A</th>
      <th style="padding: 10px 14px;">Category B</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">Feature 1</td><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">Present</td><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">Absent</td></tr>
    <tr style="background: #f8fafc;"><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">Feature 2</td><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">High</td><td style="padding: 8px 14px; border: 1px solid #e2e8f0;">Low</td></tr>
  </tbody>
</table></div>
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
    <p style="margin: 0; color: #475569; font-size: 14px;">Yes, 0.50 marks are deducted for every wrong answer in Tier-1.</p>
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
    <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">Practice SSC Shift Papers in Real CBT Exam Mode</h3>
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
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-3 flex-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              Rank-Math Style SEO & Keyword Studio
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
              v2.0 Real-Time
            </span>
          </div>

          {/* Primary Focus Keyword Input */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Key className="h-3.5 w-3.5 text-blue-600" />
              <span>Primary Focus Keyword:</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. SSC CGL 2026 Notification or Cell: The Unit of Life..."
                value={focusKeyword}
                onChange={(e) => onFocusKeywordChange(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-200 bg-blue-50/40 pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Secondary / Other Keywords Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Tag className="h-3.5 w-3.5 text-indigo-600" />
                <span>Other / Secondary Keywords ({secondaryList.length}):</span>
              </label>
              <span className="text-[10px] text-slate-400">Target related candidate search queries</span>
            </div>

            {/* Keyword Chips / Pills */}
            <div className="flex flex-wrap gap-1.5">
              {secondaryList.map((kwItem, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  <span>{kwItem}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSecondary(idx)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-bold"
                    title="Remove keyword"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Secondary Keyword Form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add secondary keyword (e.g. SSC Biology Notes, Cell Organelles)..."
                value={newSecKw}
                onChange={(e) => setNewSecKw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSecondary();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSecondary()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick 1-Click Suggestions */}
            {suggestedKeywords.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  <span>Suggested 1-Click Keywords:</span>
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestedKeywords.slice(0, 3).map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSecondary(sug)}
                      className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Score Dial */}
        <div className="flex items-center gap-3.5 bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-2xl border border-slate-200 shrink-0">
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
              Primary Density: <b className="text-slate-800">{report.keywordDensity}%</b> ({report.keywordCount} times)
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-wrap">
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
          onClick={() => setActiveTab("secondary")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "secondary"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Other Keywords Matrix ({report.secondaryAudits.length})</span>
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
          <span>Google SERP Preview</span>
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

      {/* ── TAB 2: SECONDARY KEYWORDS MATRIX ── */}
      {activeTab === "secondary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Secondary & Related Keywords Audit</h4>
              <p className="text-[11px] text-slate-500">Track how effectively your article targets long-tail search terms</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              {report.secondaryAudits.filter((s) => s.status === "pass").length} of {report.secondaryAudits.length} Ranking Candidates
            </span>
          </div>

          {report.secondaryAudits.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Tag className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No secondary keywords added yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Add other keywords above (e.g. syllabus, PYQs, cut-off) to check keyword density and heading inclusion.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Keyword Query</th>
                    <th className="p-3 text-center">Occurrences</th>
                    <th className="p-3 text-center">Density</th>
                    <th className="p-3 text-center">In Headings</th>
                    <th className="p-3 text-center">In Excerpt</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.secondaryAudits.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {item.keyword}
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          item.count > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.count}x
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">
                        {item.density}%
                      </td>
                      <td className="p-3 text-center">
                        {item.inHeadings ? (
                          <span className="text-emerald-600 font-bold">✓ Yes</span>
                        ) : (
                          <span className="text-slate-400">✕ No</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.inDesc ? (
                          <span className="text-emerald-600 font-bold">✓ Yes</span>
                        ) : (
                          <span className="text-slate-400">✕ No</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Found
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <AlertTriangle className="h-3 w-3" /> Missing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: GOOGLE & SOCIAL SERP PREVIEW ── */}
      {activeTab === "serp" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              SERP & Social Card Preview:
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
                <span>Mobile Google</span>
              </button>
              <button
                type="button"
                onClick={() => setSerpView("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  serpView === "desktop" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                <Monitor className="h-3 w-3" />
                <span>Desktop Google</span>
              </button>
              <button
                type="button"
                onClick={() => setSerpView("social")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  serpView === "social" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                <Share2 className="h-3 w-3" />
                <span>Social Card</span>
              </button>
            </div>
          </div>

          {/* Social Card Preview */}
          {serpView === "social" ? (
            <div className="max-w-md mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                  SSCZone • Educational Portal
                </div>
              )}
              <div className="p-3.5 space-y-1 bg-slate-50 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ssczone.com</span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{title || "Article Headline"}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{excerpt || "Study notes, formulas and shift analysis."}</p>
              </div>
            </div>
          ) : (
            /* Google Search Box */
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
                  {title ? `${title} | SSCZone` : "Post Title Goes Here | SSCZone Portal"}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                  {excerpt || content.replace(/<[^>]+>/g, " ").substring(0, 150) || "Comprehensive article description and study guidelines for SSC candidates..."}
                </p>
              </div>
            </div>
          )}

          {/* Char Counter Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Title Length:</span>
                <span className={report.titleCharCount >= 40 && report.titleCharCount <= 65 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {report.titleCharCount} / 60 Chars
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    report.titleCharCount >= 40 && report.titleCharCount <= 65
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
                <span className={report.descCharCount >= 110 && report.descCharCount <= 165 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {report.descCharCount} / 160 Chars
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    report.descCharCount >= 110 && report.descCharCount <= 165
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

      {/* ── TAB 4: QUICK EDUCATIONAL BLOCKS (1-Click Insert) ── */}
      {activeTab === "blocks" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Ready-made Callout & Notification Boxes (1-Click Insert):
            </span>
            <span className="text-[11px] text-slate-400">
              Inserted directly at the cursor in your content editor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {educationalBlocks.map((blk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex flex-col justify-between gap-3 text-xs transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{blk.title}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      {blk.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{blk.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onInsertSnippet && onInsertSnippet(blk.snippet)}
                  className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  + Insert Block into Article
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
