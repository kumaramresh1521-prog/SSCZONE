"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Save,
  Sparkles,
  Layers,
  RotateCcw,
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle2,
  ListFilter,
  Eye,
  Sliders,
  Compass
} from "lucide-react";
import toast from "react-hot-toast";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-types";

export default function AdminHomepageBuilder() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [activeTab, setActiveTab] = useState<"hero" | "stats" | "target-exams" | "steps" | "exams" | "cta">("target-exams");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/admin/homepage");
        if (res.ok) {
          const data = await res.json();
          setConfig({
            ...DEFAULT_HOMEPAGE_CONFIG,
            ...data,
            targetExamsSection: {
              ...DEFAULT_HOMEPAGE_CONFIG.targetExamsSection,
              ...(data.targetExamsSection || {})
            }
          });
        } else {
          const saved = localStorage.getItem("ssczone_homepage_config");
          if (saved) setConfig(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load homepage config:", e);
        const saved = localStorage.getItem("ssczone_homepage_config");
        if (saved) setConfig(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error("Failed to save to server");
      }

      localStorage.setItem("ssczone_homepage_config", JSON.stringify(config));
      toast.success("Homepage published live successfully! 🎉", {
        icon: "🚀",
        style: { borderRadius: "12px", background: "#065f46", color: "#fff" }
      });
    } catch (e) {
      console.error(e);
      localStorage.setItem("ssczone_homepage_config", JSON.stringify(config));
      toast.success("Saved to local browser storage.");
    } finally {
      setSaving(false);
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
            Customize hero headline, stats, target examinations directory, upcoming roadmaps, and bottom CTAs.
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
          { id: "target-exams", label: "🎯 1. Target Exams & Roadmap" },
          { id: "hero", label: "🌟 2. Hero Header Banner" },
          { id: "stats", label: "📊 3. Stats Counters" },
          { id: "steps", label: "🪜 4. 3-Step Guide" },
          { id: "exams", label: "📚 5. Exam Feature Cards" },
          { id: "cta", label: "🚀 6. Bottom CTA Banner" },
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

      {/* Section: Target Exams & Upcoming Roadmap Manager */}
      {activeTab === "target-exams" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Controls Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>Target SSC Examinations &amp; Upcoming Shift Roadmap</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage the public homepage section showing active SSC target exams and upcoming shift curation cards.
                </p>
              </div>

              {/* Master Section Toggle */}
              <label className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={config.targetExamsSection?.enabled !== false}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      targetExamsSection: {
                        ...prev.targetExamsSection,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800">
                  {config.targetExamsSection?.enabled !== false ? "Section Enabled (Visible)" : "Section Disabled (Hidden)"}
                </span>
              </label>
            </div>

            {/* Section Header Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Main Heading
                </label>
                <input
                  type="text"
                  value={config.targetExamsSection?.title || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      targetExamsSection: {
                        ...prev.targetExamsSection,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. SSC Target Examinations"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={config.targetExamsSection?.subtitle || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      targetExamsSection: {
                        ...prev.targetExamsSection,
                        subtitle: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Active exams are open for practice. Upcoming exams are progressively unlocked as shift papers are curated."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Upcoming Roadmap Container Settings */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    Upcoming SSC Examinations (In Preparation) Grid Settings
                  </span>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.targetExamsSection?.showUpcomingRoadmap !== false}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        targetExamsSection: {
                          ...prev.targetExamsSection,
                          showUpcomingRoadmap: e.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4 rounded-md border-amber-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show Upcoming Roadmap Grid</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Card Status Badge Text
                  </label>
                  <input
                    type="text"
                    value={config.targetExamsSection?.upcomingBadgeText || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        targetExamsSection: {
                          ...prev.targetExamsSection,
                          upcomingBadgeText: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. ⏳ Launching Soon"
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Card Footer Note
                  </label>
                  <input
                    type="text"
                    value={config.targetExamsSection?.upcomingFooterText || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        targetExamsSection: {
                          ...prev.targetExamsSection,
                          upcomingFooterText: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Curating shift questions"
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Max Upcoming Exams to Show
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={config.targetExamsSection?.maxUpcomingDisplay ?? 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        targetExamsSection: {
                          ...prev.targetExamsSection,
                          maxUpcomingDisplay: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Enter <code className="bg-gray-200 px-1 rounded">0</code> to show all (currently 14), or enter e.g. <code className="bg-gray-200 px-1 rounded">6</code> to limit length.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action: Exam Management in Admin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
              <div>
                <h4 className="text-xs font-bold text-blue-900">
                  Want to move an upcoming exam into live practice or change exam status?
                </h4>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  You can toggle any exam between Active (Live Practice) and Inactive (Upcoming Roadmap) in the Exams Manager.
                </p>
              </div>

              <Link
                href="/admin/exams"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shrink-0"
              >
                <span>Go to Exams Manager</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="rounded-2xl border border-gray-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Live Landing Page Preview</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                config.targetExamsSection?.enabled !== false
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {config.targetExamsSection?.enabled !== false ? "Visible on Homepage" : "Hidden from Homepage"}
              </span>
            </div>

            {config.targetExamsSection?.enabled !== false ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {config.targetExamsSection?.title || "SSC Target Examinations"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {config.targetExamsSection?.subtitle || "Active exams are open for practice."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">View All Syllabi →</span>
                </div>

                {config.targetExamsSection?.showUpcomingRoadmap !== false && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                      <span>
                        Upcoming SSC Examinations • In Preparation (
                        {config.targetExamsSection?.maxUpcomingDisplay && config.targetExamsSection.maxUpcomingDisplay > 0
                          ? `Showing top ${config.targetExamsSection.maxUpcomingDisplay}`
                          : "14"}
                        )
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Admin unlocks exams as verified</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {["SSC CHSL", "SSC CPO", "SSC MTS"].map((sample, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{sample}</span>
                            <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                              {config.targetExamsSection?.upcomingBadgeText || "⏳ Launching Soon"}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                            <span>{config.targetExamsSection?.upcomingFooterText || "Curating shift questions"}</span>
                            <span>Roadmap 2026</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                Section is currently disabled. Toggle &quot;Section Enabled&quot; above to show on the public landing page.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Hero Header Editor */}
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Button Label</label>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Button Link</label>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Button Label</label>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Button Link</label>
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

      {/* Section 3: Stats Counters */}
      {activeTab === "stats" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Key Stats Badges</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {config.stats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-gray-500">Badge #{idx + 1}</span>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Stat Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...config.stats];
                      updated[idx].value = e.target.value;
                      setConfig((prev) => ({ ...prev, stats: updated }));
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Stat Label</label>
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

      {/* Section 4: 3 Steps Section */}
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

      {/* Section 5: Featured Exam Category Cards */}
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
                value={config.examsSection?.title || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    examsSection: {
                      title: e.target.value,
                      subtitle: prev.examsSection?.subtitle || "",
                      cards: prev.examsSection?.cards || [],
                    }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={config.examsSection?.subtitle || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    examsSection: {
                      title: prev.examsSection?.title || "",
                      subtitle: e.target.value,
                      cards: prev.examsSection?.cards || [],
                    }
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            {(config.examsSection?.cards || []).map((card, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-purple-700">Card #{idx + 1}</span>
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) => {
                    const updated = [...(config.examsSection?.cards || [])];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: {
                        title: prev.examsSection?.title || "",
                        subtitle: prev.examsSection?.subtitle || "",
                        cards: updated,
                      }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Exam Name"
                />
                <textarea
                  rows={2}
                  value={card.desc}
                  onChange={(e) => {
                    const updated = [...(config.examsSection?.cards || [])];
                    updated[idx] = { ...updated[idx], desc: e.target.value };
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: {
                        title: prev.examsSection?.title || "",
                        subtitle: prev.examsSection?.subtitle || "",
                        cards: updated,
                      }
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  placeholder="Exam Description"
                />
                <input
                  type="text"
                  value={card.badge}
                  onChange={(e) => {
                    const updated = [...(config.examsSection?.cards || [])];
                    updated[idx] = { ...updated[idx], badge: e.target.value };
                    setConfig((prev) => ({
                      ...prev,
                      examsSection: {
                        title: prev.examsSection?.title || "",
                        subtitle: prev.examsSection?.subtitle || "",
                        cards: updated,
                      }
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

      {/* Section 6: Bottom CTA Banner */}
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
