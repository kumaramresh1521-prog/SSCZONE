"use client";

import { useEffect, useState } from "react";
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
  AlertCircle
} from "lucide-react";

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
  pageOverrides: Record<string, { title: string; description: string }>;
  updatedAt?: string;
}

const RECOMMENDED_KEYWORDS = [
  "SSC CGL Practice 2026",
  "SSC CHSL Tier-1 Mock",
  "SSC PYQ Shift Papers PDF",
  "SSC CPO MCQs Bilingual",
  "SSC MTS Syllabus Test",
  "Free SSC Mock Test Series",
  "SSC CGL 2025 Answer Key",
  "TCS Pattern SSC MCQs"
];

export default function AdminSeoPage() {
  const [config, setConfig] = useState<SeoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "social" | "indexing" | "webmaster" | "pages">("global");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [newKeyword, setNewKeyword] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");

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

  // Keywords handling
  function handleAddKeyword() {
    if (!newKeyword.trim() || !config) return;
    const kw = newKeyword.trim();
    if (!config.keywords.includes(kw)) {
      setConfig({ ...config, keywords: [...config.keywords, kw] });
    }
    setNewKeyword("");
  }

  function handleRemoveKeyword(index: number) {
    if (!config) return;
    const updated = [...config.keywords];
    updated.splice(index, 1);
    setConfig({ ...config, keywords: updated });
  }

  function handleAddPresetKeywords() {
    if (!config) return;
    const combined = Array.from(new Set([...config.keywords, ...RECOMMENDED_KEYWORDS]));
    setConfig({ ...config, keywords: combined });
    toast.success("Added recommended high-traffic SSC keywords!");
  }

  if (loading || !config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const titleLength = config.siteTitle.length;
  const descLength = config.metaDescription.length;

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Globe className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-white">
              SEO &amp; Metadata Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage site-wide meta tags, Google search snippets, OpenGraph sharing, indexing policies, and webmaster tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 transition-colors shadow-2xs"
          >
            <FileCode className="h-3.5 w-3.5 text-blue-600" />
            <span>View Sitemap</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Publishing Live..." : "Save & Publish SEO"}</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Grid (Editor + Live SERP Simulator) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Settings Tabs & Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Tab Selector Bar */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto border border-gray-200">
            {[
              { id: "global", label: "Global Tags", icon: Globe },
              { id: "social", label: "Social & OG", icon: Share2 },
              { id: "indexing", label: "Robots & Index", icon: ShieldCheck },
              { id: "webmaster", label: "Webmaster Codes", icon: Code2 },
              { id: "pages", label: "Page Overrides", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Global Tags */}
          {activeTab === "global" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Global Meta Title &amp; Description
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  These appear on search engine result pages and browser tabs by default.
                </p>
              </div>

              {/* Site Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800">Site Title (मुख्य शीर्षक):</label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      titleLength > 60 ? "text-amber-600 font-black" : "text-emerald-700"
                    }`}
                  >
                    {titleLength}/60 chars {titleLength > 60 && "(Might be truncated)"}
                  </span>
                </div>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                  placeholder="e.g. SSCZone — Syllabus-Wise MCQ Practice & Test Series Portal"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Title Template */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800">Title Suffix Template:</label>
                  <span className="text-gray-400 text-[11px]">Applied to inner pages</span>
                </div>
                <input
                  type="text"
                  value={config.titleTemplate}
                  onChange={(e) => setConfig({ ...config, titleTemplate: e.target.value })}
                  placeholder="%s | SSCZone"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-800">Meta Description (मेटा विवरण):</label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      descLength > 160 ? "text-amber-600 font-black" : "text-emerald-700"
                    }`}
                  >
                    {descLength}/160 chars {descLength > 160 && "(Might be truncated in Google)"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={config.metaDescription}
                  onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                  placeholder="Summarize the value of SSCZone for search engines and aspirants..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Canonical URL & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Canonical Base URL:</label>
                  <input
                    type="url"
                    value={config.canonicalUrl}
                    onChange={(e) => setConfig({ ...config, canonicalUrl: e.target.value })}
                    placeholder="https://ssczone.com"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-mono text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Author / Publisher:</label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => setConfig({ ...config, author: e.target.value })}
                    placeholder="SSCZone Editorial Team"
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-800"
                  />
                </div>
              </div>

              {/* Keywords Tag Manager */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-blue-600" />
                    <span>Target Meta Keywords ({config.keywords.length}):</span>
                  </label>
                  <button
                    onClick={handleAddPresetKeywords}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Add Recommended Tags</span>
                  </button>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200 min-h-[60px]">
                  {config.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs"
                    >
                      <span>{kw}</span>
                      <button
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag Input */}
                <div className="flex gap-2">
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
                    placeholder="Type keyword and press Enter..."
                    className="flex-1 rounded-xl border border-gray-300 p-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="rounded-xl bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Social Media & Open Graph */}
          {activeTab === "social" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Social Sharing &amp; OpenGraph (OG) Metadata
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Controls how cards appear when shared on WhatsApp, Telegram, Facebook, and Twitter.
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
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 font-medium"
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
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 font-medium"
                />
              </div>

              {/* OG Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">OpenGraph Banner Image URL:</label>
                <input
                  type="url"
                  value={config.openGraph.imageUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      openGraph: { ...config.openGraph, imageUrl: e.target.value }
                    })
                  }
                  placeholder="https://ssczone.com/og-banner.png"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-800"
                />
              </div>

              {/* Twitter Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Twitter Card Type:</label>
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
                    <option value="summary_large_image">summary_large_image (Large Banner - Recommended)</option>
                    <option value="summary">summary (Small Square Icon)</option>
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
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Robots & Indexing */}
          {activeTab === "indexing" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Robots &amp; Crawler Indexing Directives
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Instruct Googlebot, Bingbot, and other search engines on crawling policies.
                </p>
              </div>

              {/* Index & Follow Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-900">
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
                  <p className="text-[11px] text-gray-500 pl-6">
                    When enabled, Google will crawl and index your pages in search results.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-900">
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
                  <p className="text-[11px] text-gray-500 pl-6">
                    Allows search bots to follow links on your pages to discover other MCQs and shift papers.
                  </p>
                </div>
              </div>

              {/* Robots.txt Generated Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800">Generated Robots.txt Directives:</span>
                  <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Auto-served by Next.js
                  </span>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`User-agent: *
${config.indexing.index ? "Allow: /" : "Disallow: /"}
Disallow: /admin
Disallow: /api/
Sitemap: ${config.canonicalUrl}/sitemap.xml`}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: Webmaster & Verification Codes */}
          {activeTab === "webmaster" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Webmaster &amp; Search Console Verification
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify domain ownership with Google Search Console and Bing Webmaster Tools.
                </p>
              </div>

              {/* Google Verification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>Google Search Console Verification Token:</span>
                  <span className="text-[11px] font-mono text-gray-400">google-site-verification</span>
                </label>
                <input
                  type="text"
                  value={config.verification.google}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      verification: { ...config.verification, google: e.target.value }
                    })
                  }
                  placeholder="e.g. AbC123XyZ456..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900"
                />
              </div>

              {/* Bing Verification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>Bing Webmaster Tools Verification Token:</span>
                  <span className="text-[11px] font-mono text-gray-400">msvalidate.01</span>
                </label>
                <input
                  type="text"
                  value={config.verification.bing}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      verification: { ...config.verification, bing: e.target.value }
                    })
                  }
                  placeholder="e.g. 1234567890ABCDEF..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900"
                />
              </div>

              {/* Analytics & AdSense IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-gray-100">
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
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-mono text-gray-900"
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
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-mono text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Page Overrides */}
          {activeTab === "pages" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                      Route-Specific SEO &amp; Title Overrides
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Set custom title tags and meta descriptions for specific high-traffic sections. Saved overrides apply live instantly.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Live Dynamic Mode</span>
                  </span>
                </div>
              </div>

              {/* Preset Core Routes */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Core Website Sections
                </h3>

                {[
                  { path: "/", name: "Homepage Main Landing (/)" },
                  { path: "/papers", name: "PYQ Shift Papers Portal (/papers)" },
                  { path: "/exams", name: "Target Exams Directory (/exams)" },
                  { path: "/notes", name: "Subject Notes & PDFs (/notes)" },
                  { path: "/daily-quiz", name: "Daily Free Quiz Drill (/daily-quiz)" },
                  { path: "/speed-test", name: "Speed Test Challenge (/speed-test)" },
                  { path: "/typing", name: "Typing Test Simulator (/typing)" },
                  { path: "/about", name: "About Us (/about)" },
                  { path: "/blog", name: "Blog & Exam Alerts (/blog)" }
                ].map((p) => {
                  const current = config.pageOverrides[p.path] || { title: "", description: "" };
                  const isConfigured = Boolean(current.title || current.description);
                  return (
                    <div
                      key={p.path}
                      className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                        isConfigured
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-gray-200 bg-gray-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-900 uppercase tracking-wide">
                          {p.name}
                        </span>
                        {isConfigured && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Custom Override Active
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">Custom Title (Browser Tab &amp; Google Heading):</label>
                        <input
                          type="text"
                          value={current.title}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pageOverrides: {
                                ...config.pageOverrides,
                                [p.path]: { ...current, title: e.target.value }
                              }
                            })
                          }
                          placeholder={`Leave empty to use default title`}
                          className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">Custom Meta Description:</label>
                        <input
                          type="text"
                          value={current.description}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pageOverrides: {
                                ...config.pageOverrides,
                                [p.path]: { ...current, description: e.target.value }
                              }
                            })
                          }
                          placeholder={`Leave empty to use default description`}
                          className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Extra Route Overrides */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Add Custom Page Override (Any Route)
                </h3>
                
                {/* List extra routes if any */}
                {Object.entries(config.pageOverrides || {})
                  .filter(([p]) => ![
                    "/", "/papers", "/exams", "/notes", "/daily-quiz", "/speed-test", "/typing", "/about", "/blog"
                  ].includes(p))
                  .map(([p, val]) => (
                    <div key={p} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900">{p}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...config.pageOverrides };
                            delete updated[p];
                            setConfig({ ...config, pageOverrides: updated });
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
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

                {/* Add Custom Route Input Box */}
                <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Route Path:</label>
                      <input
                        type="text"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="e.g. /books or /pricing"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Custom Title:</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. SSC Books & Reference Guides"
                        className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Custom Description:</label>
                      <input
                        type="text"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="e.g. Standard books list for SSC..."
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Custom Route Override</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time Live Google Search SERP Preview (1 Column) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 sticky top-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-blue-600" />
                <span>Google SERP Preview</span>
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

            {/* Google Search Card Simulator */}
            <div
              className={`rounded-2xl border border-gray-200 bg-white p-4 font-sans space-y-1.5 shadow-2xs ${
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
                  <div className="text-emerald-700 truncate">{config.canonicalUrl}</div>
                </div>
              </div>

              {/* Clickable Blue Title */}
              <div className="text-sm sm:text-base font-bold text-[#1a0dab] hover:underline cursor-pointer leading-tight pt-1">
                {config.siteTitle}
              </div>

              {/* Grey Snippet Description */}
              <div className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                {config.metaDescription}
              </div>
            </div>

            {/* Health Checklist Indicators */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="text-[11px] font-black uppercase text-gray-500">SEO Health Checklist:</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {titleLength >= 40 && titleLength <= 65 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-gray-700">
                    Title length ({titleLength} chars) — {titleLength >= 40 && titleLength <= 65 ? "Optimal" : "Check length"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {descLength >= 120 && descLength <= 160 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-gray-700">
                    Description length ({descLength} chars) — {descLength >= 120 && descLength <= 160 ? "Optimal" : "Check length"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-gray-700">Keywords tagged ({config.keywords.length})</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-gray-700">OpenGraph sharing card active</span>
                </div>
              </div>
            </div>

            {/* Quick Publish CTA */}
            <div className="pt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
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
