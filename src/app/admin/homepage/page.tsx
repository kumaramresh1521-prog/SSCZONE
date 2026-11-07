"use client";

import { useEffect, useState } from "react";
import {
  LayoutTemplate,
  Save,
  Eye,
  Sparkles,
  Layers,
  CheckCircle2,
  RotateCcw,
  Smartphone,
  Monitor,
  Target,
  FileSpreadsheet,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

export interface HomepageConfig {
  hero: {
    badgeText: string;
    headline: string;
    highlightText: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
  };
  stats: Array<{ label: string; value: string }>;
  stepsSection: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; desc: string }>;
  };
  examsSection: {
    title: string;
    subtitle: string;
    cards: Array<{ name: string; desc: string; link: string; badge: string }>;
  };
  ctaBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
}

const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  hero: {
    badgeText: "Official Exam Syllabus Based Practice Platform",
    headline: "Crack Competitive Exams With",
    highlightText: "SSCZone",
    description: "Practice topic-wise MCQs from standard reference books, attempt previous year test papers, and track your accuracy chapter by chapter.",
    primaryBtnText: "Explore All Exams",
    primaryBtnLink: "/exams",
    secondaryBtnText: "Attempt PYQ Papers",
    secondaryBtnLink: "/papers",
  },
  stats: [
    { label: "Topic-wise MCQs", value: "10,000+" },
    { label: "Previous Papers", value: "100+ PYQs" },
    { label: "Detailed Solutions", value: "100% Explanations" },
    { label: "Syllabus Covered", value: "Complete SSC Exams" },
  ],
  stepsSection: {
    title: "3 Simple Steps to Master Any Exam",
    subtitle: "Our structured approach ensures you never miss a single topic from official exam notifications.",
    steps: [
      {
        title: "1. Select Official Exam Syllabus",
        desc: "Browse through official exam syllabi categorized neatly into subjects and topic chapters.",
      },
      {
        title: "2. Practice Chapter-by-Chapter",
        desc: "Solve MCQs from standard reference books with instant answer explanations and solution hints.",
      },
      {
        title: "3. Attempt Real Exam Papers",
        desc: "Test your speed and accuracy in timed mock test environment with actual previous year papers.",
      },
    ],
  },
  examsSection: {
    title: "Target Competitive Exams",
    subtitle: "Select an exam and start syllabus-wise preparation",
    cards: [
      { name: "SSC CGL", desc: "Combined Graduate Level Tier-1 & Tier-2", link: "/exams", badge: "Graduation Level" },
      { name: "SSC CHSL", desc: "Combined Higher Secondary Level Tier-1", link: "/exams", badge: "10+2 Level" },
      { name: "SSC CPO & MTS", desc: "Central Police Organisation & Multi-Tasking Staff Practice", link: "/exams", badge: "All Levels" },
    ],
  },
  ctaBanner: {
    enabled: true,
    title: "Ready to Crack SSC CGL / CHSL 2026?",
    subtitle: "Join thousands of serious aspirants practicing daily with structured chapter-wise drills.",
    buttonText: "Start Free Practice Now 🚀",
    buttonLink: "/exams",
  }
};

export default function AdminHomepageBuilder() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [activeTab, setActiveTab] = useState<"hero" | "stats" | "steps" | "exams" | "cta">("hero");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_homepage_config");
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load homepage config:", e);
    }
  }, []);

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem("ssczone_homepage_config", JSON.stringify(config));
      setTimeout(() => {
        setSaving(false);
        toast.success("Homepage UI updated live successfully! 🎉", {
          icon: "🚀",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" }
        });
      }, 400);
    } catch (e) {
      setSaving(false);
      toast.error("Failed to save settings");
    }
  }

  function handleResetDefaults() {
    if (confirm("Reset all homepage sections to default template?")) {
      setConfig(DEFAULT_HOMEPAGE_CONFIG);
      localStorage.removeItem("ssczone_homepage_config");
      toast.success("Reset to default homepage layout.");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <LayoutTemplate className="h-5 w-5" />
            </span>
            <span>Homepage UI Content &amp; Section Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize headlines, buttons, stats, steps, and featured cards on the main public homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-blue-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Changes..." : "Publish to Live Homepage"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Sections */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800">
        {[
          { id: "hero", label: "🌟 1. Hero Header Banner" },
          { id: "stats", label: "📊 2. Stats Counters" },
          { id: "steps", label: "🪜 3. 3-Step Guide" },
          { id: "exams", label: "🎯 4. Target Exam Cards" },
          { id: "cta", label: "🚀 5. Bottom CTA Banner" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Hero Header Editor */}
      {activeTab === "hero" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Hero Section Content</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Top Pill Badge Text</label>
              <input
                type="text"
                value={config.hero.badgeText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, badgeText: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Main Headline Prefix</label>
              <input
                type="text"
                value={config.hero.headline}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, headline: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Highlighted Brand Keyword</label>
              <input
                type="text"
                value={config.hero.highlightText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, highlightText: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold text-amber-600 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Hero Subtitle / Description</label>
              <textarea
                rows={2}
                value={config.hero.description}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Button Text</label>
              <input
                type="text"
                value={config.hero.primaryBtnText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, primaryBtnText: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Button URL</label>
              <input
                type="text"
                value={config.hero.primaryBtnLink}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, primaryBtnLink: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Button Text</label>
              <input
                type="text"
                value={config.hero.secondaryBtnText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, secondaryBtnText: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Button URL</label>
              <input
                type="text"
                value={config.hero.secondaryBtnLink}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, hero: { ...prev.hero, secondaryBtnLink: e.target.value } }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Stats Counter Bar */}
      {activeTab === "stats" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Target className="h-4 w-4 text-emerald-600" />
            <span>Hero Stats Counter Badges (4 Badges)</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.stats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-blue-700">Badge #{idx + 1}</span>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Value / Numbers</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].value = e.target.value;
                      setConfig((prev) => ({ ...prev, stats: updated }));
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-extrabold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Label / Title</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].label = e.target.value;
                      setConfig((prev) => ({ ...prev, stats: updated }));
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-gray-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: 3 Steps Section */}
      {activeTab === "steps" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Layers className="h-4 w-4 text-blue-600" />
            <span>3 Simple Steps Guide Section</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={config.stepsSection.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    stepsSection: { ...prev.stepsSection, title: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={config.stepsSection.subtitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    stepsSection: { ...prev.stepsSection, subtitle: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {config.stepsSection.steps.map((step, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-blue-700">Step #{idx + 1}</span>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => {
                    const updated = [...config.stepsSection.steps];
                    updated[idx].title = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      stepsSection: { ...prev.stepsSection, steps: updated }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Step Title"
                />
                <textarea
                  rows={2}
                  value={step.desc}
                  onChange={(e) => {
                    const updated = [...config.stepsSection.steps];
                    updated[idx].desc = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      stepsSection: { ...prev.stepsSection, steps: updated }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Step Description"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Target Exams Section */}
      {activeTab === "exams" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <span>Featured Exam Category Cards</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={config.examsSection.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    examsSection: { ...prev.examsSection, title: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={config.examsSection.subtitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    examsSection: { ...prev.examsSection, subtitle: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            {config.examsSection.cards.map((card, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-purple-700">Card #{idx + 1}</span>
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) => {
                    const updated = [...config.examsSection.cards];
                    updated[idx].name = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: { ...prev.examsSection, cards: updated }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Exam Name"
                />
                <textarea
                  rows={2}
                  value={card.desc}
                  onChange={(e) => {
                    const updated = [...config.examsSection.cards];
                    updated[idx].desc = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: { ...prev.examsSection, cards: updated }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Exam Description"
                />
                <input
                  type="text"
                  value={card.badge}
                  onChange={(e) => {
                    const updated = [...config.examsSection.cards];
                    updated[idx].badge = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: { ...prev.examsSection, cards: updated }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Badge (e.g. 10+2 Level)"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Bottom CTA Banner */}
      {activeTab === "cta" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Bottom Call to Action Banner</span>
            </h3>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.ctaBanner.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, enabled: e.target.checked }
                  }))
                }
                className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Enable CTA Banner</span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                value={config.ctaBanner.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, title: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={config.ctaBanner.buttonText}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, buttonText: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle / Sub-text</label>
              <input
                type="text"
                value={config.ctaBanner.subtitle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, subtitle: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
