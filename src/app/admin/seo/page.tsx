"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Globe,
  Save,
  CheckCircle2,
  Share2,
  Search,
  Sparkles,
  Smartphone,
  Monitor,
  ShieldCheck,
  Tag,
  Plus,
  X,
  ExternalLink,
  Code2,
  FileCode,
  Layers,
  BarChart3,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Sliders,
  Eye,
  Trash2,
  Flame,
  TrendingUp,
  BookOpen,
  Keyboard,
  Activity,
  Zap,
  Info
} from "lucide-react";

interface PageOverride {
  title: string;
  description: string;
  keywords?: string[];
}

interface SeoConfig {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  author: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    imageUrl: string;
    type: string;
  };
  twitter: {
    card: string;
    site: string;
    creator: string;
  };
  indexing: {
    index: boolean;
    follow: boolean;
    maxSnippet: number;
    maxImagePreview: string;
    maxVideoPreview: number;
  };
  verification: {
    google: string;
    bing: string;
    googleAnalyticsId: string;
    adsenseId: string;
  };
  pageOverrides: Record<string, PageOverride>;
  updatedAt?: string;
}

interface RecommendedKeyword {
  tag: string;
  category: "cgl" | "chsl" | "pyq" | "subjects" | "tools" | "intent";
  volume: "Very High" | "High" | "Trending" | "Long-Tail";
  intent: "Informational" | "Commercial" | "Transactional";
}

const CATEGORIZED_KEYWORDS: RecommendedKeyword[] = [
  // SSC CGL Core
  { tag: "SSC CGL 2026 Mock Test Series", category: "cgl", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CGL Tier 1 Previous Year Papers", category: "cgl", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CGL Tier 2 Preparation Portal", category: "cgl", volume: "High", intent: "Commercial" },
  { tag: "SSC CGL Syllabus Wise MCQ Portal", category: "cgl", volume: "High", intent: "Informational" },
  { tag: "SSC CGL Maths Formula Sheet PDF", category: "cgl", volume: "High", intent: "Informational" },
  { tag: "SSC CGL English Vocabulary Rules", category: "cgl", volume: "High", intent: "Informational" },
  { tag: "SSC CGL Reasoning Chapter Wise Test", category: "cgl", volume: "High", intent: "Commercial" },
  { tag: "SSC CGL General Awareness Static GK", category: "cgl", volume: "High", intent: "Informational" },
  { tag: "TCS Pattern SSC CGL Questions 2026", category: "cgl", volume: "Very High", intent: "Transactional" },

  // SSC CHSL, CPO, MTS & GD
  { tag: "SSC CHSL 10+2 Mock Test Series", category: "chsl", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CHSL Tier 1 Shift Papers PDF", category: "chsl", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CHSL Previous Year Papers with Solution", category: "chsl", volume: "High", intent: "Commercial" },
  { tag: "SSC CPO SI Practice Papers Bilingual", category: "chsl", volume: "High", intent: "Commercial" },
  { tag: "SSC MTS Havaldar Mock Test 2026", category: "chsl", volume: "Very High", intent: "Transactional" },
  { tag: "SSC GD Constable Practice Set Hindi English", category: "chsl", volume: "Very High", intent: "Commercial" },
  { tag: "SSC Selection Post Phase XII PYQs", category: "chsl", volume: "High", intent: "Informational" },
  { tag: "SSC Stenographer Grade C & D Tests", category: "chsl", volume: "High", intent: "Commercial" },

  // PYQ Shift Papers & PDFs (Top Organic Traffic Drivers)
  { tag: "SSC Previous Year Question Papers with Solution", category: "pyq", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CGL Shift Wise Paper PDF Download", category: "pyq", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CHSL Official Shift Papers Answer Key", category: "pyq", volume: "Very High", intent: "Informational" },
  { tag: "SSC PYQ CBT Mock Test Online", category: "pyq", volume: "High", intent: "Commercial" },
  { tag: "TCS Shift Papers CBT Test Series", category: "pyq", volume: "High", intent: "Transactional" },
  { tag: "SSC Shift Paper PDF Free Download", category: "pyq", volume: "Very High", intent: "Transactional" },
  { tag: "SSC Previous Year Shift Papers 2018-2025", category: "pyq", volume: "High", intent: "Informational" },
  { tag: "Official SSC Shift Papers with KaTeX Explanations", category: "pyq", volume: "High", intent: "Informational" },

  // Subject-Wise Question Banks
  { tag: "SSC Quantitative Aptitude Chapter Wise MCQs", category: "subjects", volume: "High", intent: "Commercial" },
  { tag: "SSC Reasoning Verbal & Non-Verbal Drills", category: "subjects", volume: "High", intent: "Informational" },
  { tag: "SSC English Grammar Rules & Error Spotting", category: "subjects", volume: "High", intent: "Informational" },
  { tag: "SSC General Studies Modern History & Polity MCQs", category: "subjects", volume: "High", intent: "Informational" },
  { tag: "SSC Geography & General Science MCQs", category: "subjects", volume: "High", intent: "Informational" },
  { tag: "Standard Reference Book MCQs for SSC", category: "subjects", volume: "High", intent: "Commercial" },
  { tag: "SSC Current Affairs 2026 Capsule", category: "subjects", volume: "Very High", intent: "Informational" },

  // Typing & CBT Tools
  { tag: "SSC Typing Test 15 Minutes Simulator", category: "tools", volume: "Very High", intent: "Transactional" },
  { tag: "SSC CGL Typing Speed Test Online", category: "tools", volume: "Very High", intent: "Transactional" },
  { tag: "TCS Interface Typing Simulator with Backspace", category: "tools", volume: "High", intent: "Commercial" },
  { tag: "Gross WPM Net WPM Error Percentage Calculator", category: "tools", volume: "High", intent: "Informational" },
  { tag: "SSC CHSL English & Hindi Typing Passages", category: "tools", volume: "High", intent: "Commercial" },
  { tag: "SSC Speed Test 25 Questions 15 Minutes", category: "tools", volume: "High", intent: "Commercial" },
  { tag: "Daily Free SSC Quiz Drill Online", category: "tools", volume: "Very High", intent: "Commercial" },
  { tag: "SSC Photo Resizer & Signature Tool", category: "tools", volume: "Trending", intent: "Informational" },

  // High-Intent Search & Conversion
  { tag: "Free SSC Mock Test Series Online 2026", category: "intent", volume: "Very High", intent: "Transactional" },
  { tag: "Best MCQ Practice Portal for SSC CGL", category: "intent", volume: "High", intent: "Commercial" },
  { tag: "Bilingual Hindi English SSC Test Series", category: "intent", volume: "High", intent: "Commercial" },
  { tag: "SSC Chapter Wise Question Bank Standard Books", category: "intent", volume: "High", intent: "Commercial" },
  { tag: "SSC Mock Test with Rank Predictor", category: "intent", volume: "High", intent: "Commercial" },
  { tag: "Real Exam Interface SSC CBT Mock Test", category: "intent", volume: "High", intent: "Transactional" },
];

const PRESET_PAGES = [
  {
    path: "/",
    name: "Homepage Main Portal (/)",
    defaultTitle: "SSCZone — Official SSC Syllabus-Wise MCQ Practice & Test Series Portal",
    defaultDesc: "Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant bilingual solutions.",
    defaultKeywords: ["SSC CGL 2026 Practice", "SSC Mock Test Free", "Syllabus Wise MCQ", "SSC Test Series Portal"]
  },
  {
    path: "/papers",
    name: "PYQ Shift Papers Portal (/papers)",
    defaultTitle: "SSC PYQ Shift Papers 2026 Live — Download PDF & Attempt CBT Test",
    defaultDesc: "Download clean official SSC CGL, CHSL, CPO shift paper PDFs with SSC Zone branding and attempt online CBT mock tests with instant scorecards.",
    defaultKeywords: ["SSC PYQ Shift Papers", "SSC CGL Shift Wise PDF", "SSC CHSL Tier 1 Shift PDF", "TCS CBT Mock Test Online"]
  },
  {
    path: "/exams",
    name: "Target Exams Directory (/exams)",
    defaultTitle: "SSC & Railways Exams Directory — Complete Syllabus-Wise Modules",
    defaultDesc: "Explore all SSC and Railways examinations categorized by official notification syllabus, subjects, and topics.",
    defaultKeywords: ["SSC Exams Directory", "SSC CGL Exam Syllabus", "SSC CHSL Exam Topics", "Railways RRB NTPC Group D"]
  },
  {
    path: "/notes",
    name: "Subject Notes & PDFs (/notes)",
    defaultTitle: "SSC Exam Chapter-Wise Notes & High-Yield Theory Capsules",
    defaultDesc: "Master core subjects with concise theory capsules, comparison tables, examiner trap warnings, and practice MCQs.",
    defaultKeywords: ["SSC Study Notes PDF", "SSC Maths Formula Capsule", "SSC English Grammar Rules", "SSC GS Revision Notes"]
  },
  {
    path: "/speed-test",
    name: "Speed Test Challenge (/speed-test)",
    defaultTitle: "SSC Speed Test Challenge (25 Qs / 15 Mins) | SSCZONE",
    defaultDesc: "High-speed exam practice drill for SSC CGL, CHSL, CPO, and MTS. Practice 25 questions in 15 minutes or 20-second Blitz mode across 12,200+ dynamic questions.",
    defaultKeywords: ["SSC Speed Test", "25 Questions 15 Minutes Drill", "SSC Rapid Fire MCQ", "SSC Math Speed Test"]
  },
  {
    path: "/daily-quiz",
    name: "Daily Free Quiz Drill (/daily-quiz)",
    defaultTitle: "Daily Free Quiz Drill | SSC CGL, CHSL, MTS, CPO Practice | SSCZONE",
    defaultDesc: "Practice daily free subject-wise mini quizzes for SSC CGL, CHSL, CPO, MTS and GD exams. High-yield questions with KaTeX formulas and instant scorecards.",
    defaultKeywords: ["SSC Daily Free Quiz", "Daily 10 Questions SSC Quiz", "Free SSC Mini Mock Test", "SSC Daily GK Quiz"]
  },
  {
    path: "/typing",
    name: "Typing Test Simulator (/typing)",
    defaultTitle: "SSC Typing Test & Speed Drill Simulator — CGL & CHSL TCS Interface",
    defaultDesc: "Practice SSC CGL, CHSL, and Steno typing test passages with real-time gross/net WPM, accuracy, error calculation, and TCS-pattern exam simulation.",
    defaultKeywords: ["SSC Typing Test Online", "SSC CGL Typing Speed Test", "TCS Typing Interface Simulator", "Gross WPM Net WPM Calculator"]
  },
  {
    path: "/about",
    name: "About Us (/about)",
    defaultTitle: "About Us — SSCZone Mission & Editorial Standards",
    defaultDesc: "Learn about SSCZone's mission to provide syllabus-wise MCQ practice and authentic test series for competitive exam aspirants across India.",
    defaultKeywords: ["About SSCZone", "SSC Exam Prep Team", "Syllabus Wise MCQ Learning"]
  },
  {
    path: "/blog",
    name: "Official Blog & Exam Alerts (/blog)",
    defaultTitle: "Official SSC Blog & Exam Alerts | SSC CGL, CHSL, CPO Updates - SSCZone",
    defaultDesc: "Stay ahead with official SSC exam notifications, admit cards, answer key objection links, cut-off analysis, and topper preparation strategies.",
    defaultKeywords: ["SSC Exam Alerts", "SSC CGL 2026 Notification", "SSC Answer Key Links", "SSC Preparation Tips"]
  }
];

export default function AdminSeoPage() {
  const [config, setConfig] = useState<SeoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "keywords" | "pages" | "social" | "indexing" | "webmaster" | "schema">("global");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewPagePath, setPreviewPagePath] = useState<string>("/");

  // Keyword states
  const [selectedKeywordCategory, setSelectedKeywordCategory] = useState<"all" | "cgl" | "chsl" | "pyq" | "subjects" | "tools" | "intent">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [bulkKeywordsInput, setBulkKeywordsInput] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Custom route states
  const [customPath, setCustomPath] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customKeywordsInput, setCustomKeywordsInput] = useState("");

  // Load SEO config from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/seo");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        } else {
          toast.error("Failed to load SEO configuration from server");
        }
      } catch (err: any) {
        toast.error("Error loading SEO configuration: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save & Publish SEO
  async function handleSave() {
    if (!config) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      const data = await res.json();

      if (res.ok) {
        setConfig(data.config);
        localStorage.setItem("ssczone_seo_cache", JSON.stringify(data.config));
        toast.success("SEO Metadata published & saved successfully! 🚀", {
          icon: "🌐",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" }
        });
      } else {
        toast.error(data.error || "Failed to publish SEO configuration");
      }
    } catch (err: any) {
      toast.error("Failed to publish SEO: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Add individual keyword
  function handleAddKeyword() {
    if (!newKeyword.trim() || !config) return;
    const kw = newKeyword.trim();
    if (!config.keywords.includes(kw)) {
      setConfig({ ...config, keywords: [...config.keywords, kw] });
      toast.success(`Added keyword: "${kw}"`);
    } else {
      toast.error("Keyword already exists in your active list");
    }
    setNewKeyword("");
  }

  // Remove individual keyword
  function handleRemoveKeyword(index: number) {
    if (!config) return;
    const updated = [...config.keywords];
    const removed = updated.splice(index, 1);
    setConfig({ ...config, keywords: updated });
    toast.success(`Removed: "${removed[0]}"`);
  }

  // Add suggested keyword
  function handleToggleSuggestedKeyword(tag: string) {
    if (!config) return;
    if (config.keywords.includes(tag)) {
      const updated = config.keywords.filter((k) => k !== tag);
      setConfig({ ...config, keywords: updated });
      toast.success(`Removed: "${tag}"`);
    } else {
      setConfig({ ...config, keywords: [...config.keywords, tag] });
      toast.success(`Added: "${tag}"`);
    }
  }

  // Add all keywords in currently selected category
  function handleAddAllCategoryKeywords() {
    if (!config) return;
    const candidates = CATEGORIZED_KEYWORDS.filter(
      (k) => selectedKeywordCategory === "all" || k.category === selectedKeywordCategory
    ).map((k) => k.tag);

    const combined = Array.from(new Set([...config.keywords, ...candidates]));
    const newlyAdded = combined.length - config.keywords.length;
    setConfig({ ...config, keywords: combined });
    toast.success(`Added ${newlyAdded} new keywords from this category!`);
  }

  // Bulk add keywords
  function handleBulkAddKeywords() {
    if (!bulkKeywordsInput.trim() || !config) return;
    const split = bulkKeywordsInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const combined = Array.from(new Set([...config.keywords, ...split]));
    const count = combined.length - config.keywords.length;
    setConfig({ ...config, keywords: combined });
    setBulkKeywordsInput("");
    setShowBulkInput(false);
    toast.success(`Successfully imported ${count} keywords!`);
  }

  // Copy all keywords as comma-separated
  function handleCopyAllKeywords() {
    if (!config || config.keywords.length === 0) return;
    navigator.clipboard.writeText(config.keywords.join(", "));
    toast.success("Copied all keywords to clipboard! (Comma-separated)");
  }

  // Clear all keywords
  function handleClearAllKeywords() {
    if (!config) return;
    if (confirm("Are you sure you want to clear all active keywords?")) {
      setConfig({ ...config, keywords: [] });
      toast.success("Keywords cleared");
    }
  }

  // Apply preset for a page override
  function handleApplyPagePreset(preset: typeof PRESET_PAGES[0]) {
    if (!config) return;
    setConfig({
      ...config,
      pageOverrides: {
        ...config.pageOverrides,
        [preset.path]: {
          title: preset.defaultTitle,
          description: preset.defaultDesc,
          keywords: preset.defaultKeywords
        }
      }
    });
    toast.success(`Applied high-rank preset for ${preset.name}!`);
  }

  // Filtered recommended keywords
  const filteredRecommendedKeywords = useMemo(() => {
    return CATEGORIZED_KEYWORDS.filter((k) => {
      const matchCategory = selectedKeywordCategory === "all" || k.category === selectedKeywordCategory;
      const matchSearch = searchKeyword.trim() === "" || k.tag.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedKeywordCategory, searchKeyword]);

  // Compute live SEO health score
  const seoHealth = useMemo(() => {
    if (!config) return { score: 0, items: [] };

    const titleLength = config.siteTitle.length;
    const descLength = config.metaDescription.length;
    const kwCount = config.keywords.length;

    // Keyword matching in title and description
    const titleLower = config.siteTitle.toLowerCase();
    const descLower = config.metaDescription.toLowerCase();
    const titleKwMatches = config.keywords.filter((kw) => titleLower.includes(kw.toLowerCase())).length;
    const descKwMatches = config.keywords.filter((kw) => descLower.includes(kw.toLowerCase())).length;

    const items = [
      {
        label: `Title length (${titleLength} chars)`,
        passed: titleLength >= 45 && titleLength <= 65,
        msg: titleLength >= 45 && titleLength <= 65 ? "Optimal (45-65 chars)" : titleLength > 65 ? "Too long (Google may truncate)" : "Too short",
        weight: 15
      },
      {
        label: `Meta description length (${descLength} chars)`,
        passed: descLength >= 120 && descLength <= 165,
        msg: descLength >= 120 && descLength <= 165 ? "Optimal (120-165 chars)" : descLength > 165 ? "Too long for SERP snippet" : "Too short",
        weight: 15
      },
      {
        label: `Active Keywords tagged (${kwCount})`,
        passed: kwCount >= 10,
        msg: kwCount >= 10 ? `Strong keyword base (${kwCount} tags)` : "Add at least 10 high-intent keywords",
        weight: 20
      },
      {
        label: "Keyword inclusion in Site Title",
        passed: titleKwMatches > 0,
        msg: titleKwMatches > 0 ? `${titleKwMatches} keyword(s) found in title` : "Include your primary keyword in Site Title",
        weight: 15
      },
      {
        label: "Keyword inclusion in Description",
        passed: descKwMatches > 0,
        msg: descKwMatches > 0 ? `${descKwMatches} keyword(s) found in description` : "Include secondary keywords in Meta Description",
        weight: 15
      },
      {
        label: "Social OpenGraph Image",
        passed: Boolean(config.openGraph?.imageUrl),
        msg: config.openGraph?.imageUrl ? "HD Image configured" : "Add OG Image URL for rich social sharing cards",
        weight: 15
      },
      {
        label: "Googlebot Crawl & Index Directives",
        passed: config.indexing?.index && config.indexing?.follow,
        msg: config.indexing?.index ? "Indexing & Following enabled" : "Warning: Site is blocked from indexing!",
        weight: 10
      }
    ];

    const score = items.reduce((acc, it) => acc + (it.passed ? it.weight : 0), 0);
    return { score, items, titleKwMatches, descKwMatches };
  }, [config]);

  // Determine current SERP preview content based on selected page
  const currentPreviewData = useMemo(() => {
    if (!config) return { title: "", desc: "", url: "" };

    const baseUrl = config.canonicalUrl || "https://ssczone.com";
    const cleanBase = baseUrl.replace(/\/$/, "");

    if (previewPagePath === "/") {
      const override = config.pageOverrides?.["/"];
      return {
        title: override?.title || config.siteTitle,
        desc: override?.description || config.metaDescription,
        url: cleanBase
      };
    }

    const override = config.pageOverrides?.[previewPagePath];
    const preset = PRESET_PAGES.find((p) => p.path === previewPagePath);

    return {
      title: override?.title || preset?.defaultTitle || `${config.siteTitle}`,
      desc: override?.description || preset?.defaultDesc || config.metaDescription,
      url: `${cleanBase}${previewPagePath}`
    };
  }, [config, previewPagePath]);

  if (loading || !config) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-bold text-slate-400">Loading SEO &amp; Keyword Engine...</p>
        </div>
      </div>
    );
  }

  const titleLength = config.siteTitle.length;
  const descLength = config.metaDescription.length;

  return (
    <div className="space-y-6 max-w-7xl pb-24 text-slate-900 font-sans">
      
      {/* ── Top Header & Real-time Live Status Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  SEO &amp; Professional Keywords Command Center
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage high-intent SSC keywords, page-specific meta tags, OpenGraph sharing, Google SERP snippets, and crawler indexing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors shadow-xs"
          >
            <FileCode className="h-3.5 w-3.5 text-blue-400" />
            <span>Sitemap.xml</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>

          <Link
            href="/robots.txt"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Robots.txt</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-blue-600/30 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Publishing Live..." : "Save & Publish SEO"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl overflow-x-auto border border-slate-800 shadow-inner">
        {[
          { id: "global", label: "Global Meta Tags", icon: Globe },
          { id: "keywords", label: "Professional Keyword Suite", icon: Tag, badge: config.keywords.length },
          { id: "pages", label: "Page-by-Page Overrides", icon: Layers, badge: Object.keys(config.pageOverrides || {}).length },
          { id: "social", label: "Social & Open Graph", icon: Share2 },
          { id: "indexing", label: "Robots & Crawling", icon: ShieldCheck },
          { id: "webmaster", label: "Webmaster & Analytics", icon: Code2 },
          { id: "schema", label: "Schema.org Rich Snippets", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? "bg-white text-blue-700" : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main 2-Column Grid (Workspace Editor + Live Real-time SERP Inspector) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Tab Workspaces */}
        <div className="lg:col-span-2 space-y-6">

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 1: GLOBAL META TAGS
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "global" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span>Global Meta Title &amp; Description</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    These appear on Google search engine result pages (SERPs) and browser tabs by default across the entire website.
                  </p>
                </div>
              </div>

              {/* Site Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>Site Title (मुख्य शीर्षक):</span>
                    <span className="text-[11px] text-gray-400 font-normal">Primary Google Blue Heading</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      titleLength >= 45 && titleLength <= 65
                        ? "text-emerald-700 font-black"
                        : "text-amber-600 font-black"
                    }`}
                  >
                    {titleLength}/60 chars {titleLength > 60 ? "(May truncate in Google)" : titleLength < 45 ? "(Recommended: 45-60)" : "✓ Optimal"}
                  </span>
                </div>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                  placeholder="e.g. SSCZone — Official SSC Syllabus-Wise MCQ Practice & Test Series Portal"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Title Suffix Template */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800">Title Suffix Template:</label>
                  <span className="text-gray-400 text-[11px]">Applied to inner pages automatically (%s replaced by page title)</span>
                </div>
                <input
                  type="text"
                  value={config.titleTemplate}
                  onChange={(e) => setConfig({ ...config, titleTemplate: e.target.value })}
                  placeholder="%s | SSCZone"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>Meta Description (मेटा विवरण):</span>
                    <span className="text-[11px] text-gray-400 font-normal">SERP Snippet beneath the title</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      descLength >= 120 && descLength <= 165
                        ? "text-emerald-700 font-black"
                        : "text-amber-600 font-black"
                    }`}
                  >
                    {descLength}/160 chars {descLength > 165 ? "(Truncated in SERP)" : descLength < 120 ? "(Add more details)" : "✓ Optimal"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={config.metaDescription}
                  onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                  placeholder="Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant bilingual solutions."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 bg-white leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Canonical URL & Primary Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Canonical Website Base URL:</label>
                  <input
                    type="url"
                    value={config.canonicalUrl}
                    onChange={(e) => setConfig({ ...config, canonicalUrl: e.target.value })}
                    placeholder="https://ssczone.com"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-mono text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400">Prevents duplicate content penalties in Google</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Primary Editorial Author / Organization:</label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => setConfig({ ...config, author: e.target.value })}
                    placeholder="SSCZone Editorial Team"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400">Displayed in article schema and author meta</p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 2: PROFESSIONAL KEYWORDS SUITE
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "keywords" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span>High-Intent SSC Keywords Suite</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Curate, monitor, and inject high-search-volume tags to rank on Google search for SSC 2026 exams and PYQs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAllKeywords}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    title="Copy all active keywords comma-separated"
                  >
                    <Copy className="h-3 w-3 text-gray-500" />
                    <span>Copy All ({config.keywords.length})</span>
                  </button>
                  <button
                    onClick={handleClearAllKeywords}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-rose-600" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Add Keyword Single & Bulk Inputs */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="Add custom keyword (e.g. SSC CGL 2026 Shift Paper PDF)..."
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 bg-white font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddKeyword}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Tag</span>
                  </button>
                  <button
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Bulk Paste</span>
                  </button>
                </div>

                {/* Collapsible Bulk Input */}
                {showBulkInput && (
                  <div className="p-4 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-900 uppercase">
                        Bulk Keyword Importer (Comma or Newline Separated):
                      </span>
                      <button
                        onClick={() => setShowBulkInput(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={bulkKeywordsInput}
                      onChange={(e) => setBulkKeywordsInput(e.target.value)}
                      placeholder="SSC CGL 2026 Mock Test, SSC CHSL Shift Papers PDF, TCS Pattern Questions, Bilingual Test Series..."
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-mono"
                    />
                    <button
                      onClick={handleBulkAddKeywords}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Import Keywords</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Active Keywords Tags Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <span>Active Meta Keywords:</span>
                    <span className="text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-black">
                      {config.keywords.length} tags active
                    </span>
                  </span>
                  <span className="text-gray-400 text-[11px]">Click 'x' to remove any keyword</span>
                </div>

                <div className="min-h-[90px] p-3 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                  {config.keywords.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-6 text-gray-400 text-xs italic">
                      No active keywords tagged. Select from recommendations below or add your own!
                    </div>
                  ) : (
                    config.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 shadow-2xs hover:border-blue-400 transition-colors"
                      >
                        <span>{kw}</span>
                        <button
                          onClick={() => handleRemoveKeyword(idx)}
                          className="text-gray-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Professional Recommendations Library */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Recommended High-Volume SSC Keywords Bank</span>
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Curated from Google Search Trends, Testbook, Adda247, and Gradeup high-traffic exam queries.
                    </p>
                  </div>
                  <button
                    onClick={handleAddAllCategoryKeywords}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add All ({filteredRecommendedKeywords.length})</span>
                  </button>
                </div>

                {/* Category Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-1">
                    {[
                      { id: "all", label: "All Categories" },
                      { id: "cgl", label: "SSC CGL 2026" },
                      { id: "chsl", label: "CHSL / CPO / MTS" },
                      { id: "pyq", label: "PYQs & Shifts" },
                      { id: "subjects", label: "Subject-Wise" },
                      { id: "tools", label: "Typing & Tools" },
                      { id: "intent", label: "High-Intent" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedKeywordCategory(cat.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedKeywordCategory === cat.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Search className="h-3 w-3 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Filter tag..."
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Recommended Keywords Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                  {filteredRecommendedKeywords.map((k) => {
                    const isAdded = config.keywords.includes(k.tag);
                    return (
                      <div
                        key={k.tag}
                        onClick={() => handleToggleSuggestedKeyword(k.tag)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isAdded
                            ? "border-emerald-300 bg-emerald-50/60 text-emerald-900"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-gray-800"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{k.tag}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className="text-gray-400">{k.intent}</span>
                            <span
                              className={`font-black uppercase ${
                                k.volume === "Very High"
                                  ? "text-rose-600"
                                  : k.volume === "Trending"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {k.volume} Vol
                            </span>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              <span>Add</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 3: PAGE-BY-PAGE SEO OVERRIDES
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "pages" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
              
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Page-Specific SEO &amp; Title Overrides</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Customize titles, descriptions, and keywords for high-traffic URLs. Click 'Preview SERP' to test how Google renders it.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Real-time Dynamic Server Mode</span>
                </span>
              </div>

              {/* Preset Core Pages */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  <span>Core Section Overrides</span>
                </h3>

                {PRESET_PAGES.map((preset) => {
                  const current = config.pageOverrides[preset.path] || { title: "", description: "", keywords: [] };
                  const isConfigured = Boolean(current.title || current.description);
                  const isPreviewing = previewPagePath === preset.path;

                  return (
                    <div
                      key={preset.path}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isPreviewing
                          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20"
                          : isConfigured
                          ? "border-blue-200 bg-blue-50/10"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-900 uppercase tracking-wide">
                            {preset.name}
                          </span>
                          {isConfigured && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                              Custom Override Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPagePath(preset.path)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isPreviewing
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Eye className="h-3 w-3" />
                            <span>{isPreviewing ? "Viewing SERP" : "Preview SERP"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyPagePreset(preset)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
                            title="Auto-fill high-traffic recommended title & description"
                          >
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            <span>Auto-Fill Preset</span>
                          </button>
                        </div>
                      </div>

                      {/* Custom Title Input */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <label>Custom Title (Google Heading &amp; Browser Tab):</label>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {current.title?.length || 0} chars
                          </span>
                        </div>
                        <input
                          type="text"
                          value={current.title}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pageOverrides: {
                                ...config.pageOverrides,
                                [preset.path]: { ...current, title: e.target.value }
                              }
                            })
                          }
                          placeholder={preset.defaultTitle}
                          className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Custom Description Input */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <label>Custom Meta Description (SERP Snippet):</label>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {current.description?.length || 0} chars
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={current.description}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pageOverrides: {
                                ...config.pageOverrides,
                                [preset.path]: { ...current, description: e.target.value }
                              }
                            })
                          }
                          placeholder={preset.defaultDesc}
                          className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Extra Routes Section */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Add Any Custom Route Override
                </h3>

                {/* List non-preset custom routes */}
                {Object.entries(config.pageOverrides || {})
                  .filter(([p]) => !PRESET_PAGES.some((pr) => pr.path === p))
                  .map(([p, val]) => (
                    <div key={p} className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900">{p}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPagePath(p)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...config.pageOverrides };
                              delete updated[p];
                              setConfig({ ...config, pageOverrides: updated });
                              toast.success(`Removed override for ${p}`);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pageOverrides: {
                              ...config.pageOverrides,
                              [p]: { ...val, title: e.target.value }
                            }
                          })
                        }
                        placeholder="Custom Title"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                      <input
                        type="text"
                        value={val.description}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pageOverrides: {
                              ...config.pageOverrides,
                              [p]: { ...val, description: e.target.value }
                            }
                          })
                        }
                        placeholder="Custom Description"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                  ))}

                {/* Add Custom Route Form Box */}
                <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Route Path:</label>
                      <input
                        type="text"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="e.g. /pricing or /books"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Custom Title:</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Custom Page Title"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Custom Description:</label>
                      <input
                        type="text"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="Custom Meta Description"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!customPath.trim()) {
                        toast.error("Please enter a route path (e.g. /pricing)");
                        return;
                      }
                      const p = customPath.trim().startsWith("/") ? customPath.trim() : `/${customPath.trim()}`;
                      setConfig({
                        ...config,
                        pageOverrides: {
                          ...config.pageOverrides,
                          [p]: { title: customTitle.trim(), description: customDesc.trim() }
                        }
                      });
                      setCustomPath("");
                      setCustomTitle("");
                      setCustomDesc("");
                      toast.success(`Override added for ${p}! Click 'Save & Publish SEO' to make it live.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Custom Route Override</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 4: SOCIAL & OPEN GRAPH
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "social" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-600" />
                  <span>OpenGraph &amp; Social Share Cards</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Controls how links to SSCZone look when shared on WhatsApp, Telegram, Facebook, LinkedIn, and Twitter/X.
                </p>
              </div>

              {/* OG Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">OpenGraph Title:</label>
                <input
                  type="text"
                  value={config.openGraph.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      openGraph: { ...config.openGraph, title: e.target.value }
                    })
                  }
                  placeholder="SSCZone — Syllabus-Wise SSC MCQ Practice & Test Series Portal"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* OG Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">OpenGraph Description:</label>
                <textarea
                  rows={2}
                  value={config.openGraph.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      openGraph: { ...config.openGraph, description: e.target.value }
                    })
                  }
                  placeholder="Crack SSC CGL, CHSL, CPO, MTS & Railways Exams with chapter-by-chapter MCQ practice and previous year test series."
                  className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* OG Image URL with Thumbnail Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800">Social Share Image URL (1200x630px recommended):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={config.openGraph.imageUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        openGraph: { ...config.openGraph, imageUrl: e.target.value }
                      })
                    }
                    placeholder="https://ssczone.com/icon-512.png"
                    className="flex-1 rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
                  />
                  {config.openGraph.imageUrl && (
                    <div className="h-10 w-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={config.openGraph.imageUrl}
                        alt="OG Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.target as any).style.display = "none")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Twitter Card Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Twitter Card Format:</label>
                  <select
                    value={config.twitter.card}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        twitter: { ...config.twitter, card: e.target.value }
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-bold text-gray-800 bg-white"
                  >
                    <option value="summary_large_image">summary_large_image (Large Banner Card - Recommended)</option>
                    <option value="summary">summary (Compact Square Thumbnail)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Twitter Handle / Site:</label>
                  <input
                    type="text"
                    value={config.twitter.site}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        twitter: { ...config.twitter, site: e.target.value }
                      })
                    }
                    placeholder="@ssczone"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-800 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 5: ROBOTS & INDEXING DIRECTIVES
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "indexing" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Robots &amp; Crawler Indexing Directives</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Instruct Googlebot, Bingbot, and other crawlers on how to index and discover your questions and shift papers.
                </p>
              </div>

              {/* Index & Follow Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-gray-900">
                    <input
                      type="checkbox"
                      checked={config.indexing.index}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          indexing: { ...config.indexing, index: e.target.checked }
                        })
                      }
                      className="h-4 w-4 rounded text-blue-600 border-gray-300"
                    />
                    <span>Allow Search Engine Indexing (Index)</span>
                  </label>
                  <p className="text-[11px] text-gray-500 pl-6.5">
                    When enabled, Googlebot crawls and displays your portal in Google search results.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-gray-900">
                    <input
                      type="checkbox"
                      checked={config.indexing.follow}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          indexing: { ...config.indexing, follow: e.target.checked }
                        })
                      }
                      className="h-4 w-4 rounded text-blue-600 border-gray-300"
                    />
                    <span>Follow Internal Links (Follow)</span>
                  </label>
                  <p className="text-[11px] text-gray-500 pl-6.5">
                    Instructs search spiders to follow links between exams, topics, and shift test papers.
                  </p>
                </div>
              </div>

              {/* Googlebot Preview Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Max Image Preview:</label>
                  <select
                    value={config.indexing.maxImagePreview}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        indexing: { ...config.indexing, maxImagePreview: e.target.value }
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-bold text-gray-800 bg-white"
                  >
                    <option value="large">large (Eligible for Google Discover Cards)</option>
                    <option value="standard">standard (Default thumbnail)</option>
                    <option value="none">none (Do not show images in SERP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Max Snippet Length:</label>
                  <input
                    type="number"
                    value={config.indexing.maxSnippet}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        indexing: { ...config.indexing, maxSnippet: parseInt(e.target.value) || -1 }
                      })
                    }
                    placeholder="-1"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-800 bg-white font-mono"
                  />
                  <p className="text-[11px] text-gray-400">-1 allows Google to choose optimal snippet length</p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 6: WEBMASTER & ANALYTICS
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "webmaster" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-blue-600" />
                  <span>Webmaster Verification &amp; Tracking Codes</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect Google Search Console, Google Analytics 4, and Google AdSense without editing code.
                </p>
              </div>

              {/* Google Search Console & Bing Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Google Search Console Verification Tag / Code:</label>
                  <input
                    type="text"
                    value={config.verification.google}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        verification: { ...config.verification, google: e.target.value }
                      })
                    }
                    placeholder="e.g. google-site-verification=abc123xyz"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Bing Webmaster Tools Verification Tag:</label>
                  <input
                    type="text"
                    value={config.verification.bing}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        verification: { ...config.verification, bing: e.target.value }
                      })
                    }
                    placeholder="e.g. 71A6992F67A..."
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* GA4 and AdSense */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Google Analytics 4 Measurement ID:</label>
                  <input
                    type="text"
                    value={config.verification.googleAnalyticsId}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        verification: { ...config.verification, googleAnalyticsId: e.target.value }
                      })
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Google AdSense Publisher ID:</label>
                  <input
                    type="text"
                    value={config.verification.adsenseId}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        verification: { ...config.verification, adsenseId: e.target.value }
                      })
                    }
                    placeholder="ca-pub-XXXXXXXXXX"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 7: SCHEMA.ORG RICH SNIPPETS
             ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === "schema" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Schema.org JSON-LD Structured Data</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically injected into the website &lt;head&gt; for Google Rich Snippets, Knowledge Panels, and Sitelinks Searchbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const jsonLd = {
                      "@context": "https://schema.org",
                      "@graph": [
                        {
                          "@type": "EducationalOrganization",
                          "name": "SSCZone",
                          "url": config.canonicalUrl,
                          "logo": `${config.canonicalUrl}/icon-512.png`,
                          "description": config.metaDescription
                        },
                        {
                          "@type": "WebSite",
                          "url": config.canonicalUrl,
                          "name": "SSCZone",
                          "potentialAction": {
                            "@type": "SearchAction",
                            "target": `${config.canonicalUrl}/search?q={search_term_string}`,
                            "query-input": "required name=search_term_string"
                          }
                        }
                      ]
                    };
                    navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
                    toast.success("JSON-LD Schema copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy JSON-LD</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-80">
                <pre>
{`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "${config.canonicalUrl}/#organization",
      "name": "SSCZone",
      "url": "${config.canonicalUrl}",
      "logo": "${config.canonicalUrl}/icon-512.png",
      "description": "${config.metaDescription.replace(/"/g, '\\"')}",
      "sameAs": ["https://t.me/ssczone"]
    },
    {
      "@type": "WebSite",
      "@id": "${config.canonicalUrl}/#website",
      "url": "${config.canonicalUrl}",
      "name": "SSCZone",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${config.canonicalUrl}/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            RIGHT SIDEBAR: REAL-TIME SERP SIMULATOR & SEO AUDIT SCORECARD
           ═════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-5 sticky top-6">
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            
            {/* Header & Device Switcher */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-blue-600" />
                <span>Google SERP Simulator</span>
              </h3>

              {/* Desktop / Mobile Switcher */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-bold">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    previewDevice === "desktop" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    previewDevice === "mobile" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Page Selector for Preview */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600">Simulate URL Preview:</label>
              <select
                value={previewPagePath}
                onChange={(e) => setPreviewPagePath(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-1.5 text-xs font-bold text-gray-800 bg-white"
              >
                <option value="/">Homepage (/)</option>
                <option value="/papers">Shift Papers (/papers)</option>
                <option value="/exams">Exams Directory (/exams)</option>
                <option value="/notes">Notes &amp; PDFs (/notes)</option>
                <option value="/daily-quiz">Daily Quiz (/daily-quiz)</option>
                <option value="/speed-test">Speed Test (/speed-test)</option>
                <option value="/typing">Typing Simulator (/typing)</option>
                <option value="/about">About Us (/about)</option>
                <option value="/blog">Blog &amp; Alerts (/blog)</option>
              </select>
            </div>

            {/* Google Search Card Simulator Box */}
            <div
              className={`rounded-xl border border-gray-200 bg-white p-3.5 font-sans space-y-1 shadow-2xs ${
                previewDevice === "mobile" ? "max-w-[280px] mx-auto border-dashed" : ""
              }`}
            >
              {/* URL & Breadcrumb */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0">
                  SZ
                </div>
                <div className="text-[11px] leading-tight overflow-hidden">
                  <div className="text-gray-800 font-bold truncate">SSCZone</div>
                  <div className="text-emerald-700 truncate font-mono text-[10px]">{currentPreviewData.url}</div>
                </div>
              </div>

              {/* Clickable Blue Title */}
              <div className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer leading-snug pt-1">
                {currentPreviewData.title}
              </div>

              {/* Grey Snippet Description */}
              <div className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                {currentPreviewData.desc}
              </div>
            </div>

            {/* SEO Health Scorecard */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-gray-600 flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                  <span>SEO Health Score</span>
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    seoHealth.score >= 85
                      ? "bg-emerald-100 text-emerald-800"
                      : seoHealth.score >= 65
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {seoHealth.score}/100
                </span>
              </div>

              {/* Score Bar */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    seoHealth.score >= 85
                      ? "bg-emerald-600"
                      : seoHealth.score >= 65
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${seoHealth.score}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-1.5 text-xs">
                {seoHealth.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {item.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className={item.passed ? "text-gray-700" : "text-amber-800 font-medium"}>
                      {item.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Publish CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-blue-600/30 active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Publishing Live..." : "Publish Live SEO"}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
