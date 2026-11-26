"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Smartphone,
  Bell,
  Sliders,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  ShieldAlert,
  Layout,
  ArrowUp,
  ArrowDown,
  BookOpen,
  BarChart3,
  DollarSign,
  Clock,
  ExternalLink,
  Flag,
  Users,
  CheckCircle2,
  Package,
  Bookmark,
  Globe,
  Zap,
  Target,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  MobileAppConfig,
  DEFAULT_MOBILE_APP_CONFIG,
  mergeMobileAppConfig,
  AdminNotificationItem,
  RemoteSyllabusAddedChapter,
  CustomStudyModuleItem,
  CustomStudyModuleColor,
  CustomStudyModuleIcon,
  CustomStudyModuleActionType,
} from "@/lib/mobile-app-config";

type AdminTab =
  | "announcement"
  | "banners"
  | "features"
  | "syllabus"
  | "monetization"
  | "telemetry"
  | "version";

interface TelemetryData {
  checkedAt?: string;
  counts?: {
    users: number;
    exams: number;
    totalExams: number;
    papers: number;
    questions: number;
    bookmarks: number;
    syllabusRows: number;
    testAttempts: number;
    reports: number;
    activeSubscriptions: number;
    packages: number;
  };
  exams?: Array<{
    id: number;
    title: string;
    slug: string;
    is_active?: boolean;
    papers_count?: number;
  }>;
  recentReports?: Array<{
    id: number | string;
    question_id: number;
    reason: string;
    status: string;
    created_at: string;
  }>;
  packages?: Array<{
    id: number;
    title: string;
    exam_id: number | null;
    price: number;
    duration_days: number;
  }>;
  adsSummary?: {
    enabledGlobally: boolean;
    inlineInterval: number;
    slots: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      enabled: boolean;
      title: string;
    }>;
  };
  pingSummary?: {
    totalPings: number;
    byVersion: Record<string, number>;
    byExam: Record<string, number>;
    lastPingAt: string | null;
  };
}

export default function MobileAppAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("announcement");
  const [config, setConfig] = useState<MobileAppConfig | null>(null);

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  // Syllabus Editor Draft State (D)
  const [selectedSylExam, setSelectedSylExam] = useState("ssc-cgl");
  const [newChapSubj, setNewChapSubj] =
    useState<RemoteSyllabusAddedChapter["subjectId"]>("quant");
  const [newChapCat, setNewChapCat] = useState("Arithmetic");
  const [newChapName, setNewChapName] = useState("");
  const [newChapHindi, setNewChapHindi] = useState("");
  const [newChapExpQ, setNewChapExpQ] = useState("2-3 Qs");
  const [newChapHighWt, setNewChapHighWt] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoadingTelemetry(true);
      const res = await fetch("/api/app-telemetry", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json);
      }
    } catch {
      // ignore non-fatal telemetry failure
    } finally {
      setLoadingTelemetry(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/app-config?includeWeb=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConfig(mergeMobileAppConfig(data));
        return;
      }
      setConfig(DEFAULT_MOBILE_APP_CONFIG);
    } catch {
      setConfig(DEFAULT_MOBILE_APP_CONFIG);
      toast.error("Using default app configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
    void fetchTelemetry();
  }, [fetchConfig, fetchTelemetry]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const res = await fetch("/api/app-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.config) setConfig(mergeMobileAppConfig(data.config));
        toast.success("Mobile App settings updated live!");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading Mobile App Gateway...</p>
        </div>
      </div>
    );
  }

  const activeSylOverride = config.syllabusSync.overrides[selectedSylExam] || {
    hiddenChapterIds: [],
    highWeightageIds: [],
    addedChapters: [],
  };

  const updateSylOverride = (
    patch: Partial<{
      hiddenChapterIds: string[];
      highWeightageIds: string[];
      addedChapters: RemoteSyllabusAddedChapter[];
    }>
  ) => {
    setConfig({
      ...config,
      syllabusSync: {
        ...config.syllabusSync,
        overrides: {
          ...config.syllabusSync.overrides,
          [selectedSylExam]: {
            ...activeSylOverride,
            ...patch,
          },
        },
      },
    });
  };

  const moveHomeSection = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= config.homeLayout.sections.length) return;
    const copy = [...config.homeLayout.sections];
    const [picked] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, picked);
    setConfig({
      ...config,
      homeLayout: { ...config.homeLayout, sections: copy },
    });
  };

  const examOptions = [
    { slug: "ssc-cgl", label: "SSC CGL" },
    { slug: "ssc-chsl", label: "SSC CHSL" },
    { slug: "ssc-cpo", label: "SSC CPO" },
    { slug: "ssc-mts", label: "SSC MTS" },
    { slug: "ssc-gd", label: "SSC GD" },
  ];

  const daysRemaining = (() => {
    if (!config.countdown.targetDate) return null;
    const target = new Date(`${config.countdown.targetDate}T00:00:00`);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  })();

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Smartphone className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                ● Live Mobile Gateway
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                New Modules Default: OFF (Zero UI Impact)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              SSCZone Mobile App Command Center
            </h1>
            <p className="text-xs text-slate-300 sm:text-sm">
              Remotely control countdowns, notifications, home layout, tool switches, syllabus sync,
              telemetry, ads &amp; packages without rebuilding the APK.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          {[
            { id: "announcement", label: "🚨 Popup & Alerts (B)", icon: Bell },
            { id: "banners", label: "🖼️ Home Layout & Banners (C)", icon: Layout },
            { id: "features", label: "🎛️ Switches & Maintenance (C)", icon: Sliders },
            { id: "syllabus", label: "📚 Remote Syllabus (D)", icon: BookOpen },
            { id: "monetization", label: "💰 Ads & Packages (G)", icon: DollarSign },
            { id: "telemetry", label: "📊 Telemetry & Usage (F)", icon: BarChart3 },
            { id: "version", label: "🔄 Version & Update", icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Form (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* TAB 1: POPUP, COUNTDOWN & NOTIFICATIONS FEED (B) */}
          {activeTab === "announcement" && (
            <div className="space-y-6">
              {/* Broadcast Popup */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      In-App Broadcast Popup
                    </h2>
                    <p className="text-xs text-slate-500">
                      Shown to students when they launch the mobile app.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.announcement.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                    <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {config.announcement.enabled ? "ACTIVE" : "OFF"}
                    </span>
                  </label>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Popup Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={config.announcement.badge}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, badge: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Headline Title
                    </label>
                    <input
                      type="text"
                      value={config.announcement.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, title: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message Body
                    </label>
                    <textarea
                      rows={2}
                      value={config.announcement.message}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, message: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Banner Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.announcement.imageUrl || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, imageUrl: e.target.value },
                        })
                      }
                      placeholder="https://..."
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={config.announcement.buttonText}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            announcement: {
                              ...config.announcement,
                              buttonText: e.target.value,
                            },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Button Action
                      </label>
                      <select
                        value={config.announcement.actionType}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            announcement: {
                              ...config.announcement,
                              actionType: e.target.value,
                            },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="daily_quiz">Open Daily Free Quiz</option>
                        <option value="papers">Open Previous Papers</option>
                        <option value="syllabus">Open Syllabus Tracker</option>
                        <option value="notes">Open Chapter Notes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* [B1] Exam Countdown Widget */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Exam Countdown Widget (B)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.countdown.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.countdown.enabled ? "LIVE ON HOME" : "OFF (UI UNCHANGED)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Shows days remaining to exam on Home screen only when turned ON.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.countdown.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Countdown Title
                    </label>
                    <input
                      type="text"
                      value={config.countdown.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, title: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target Exam Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={config.countdown.targetDate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, targetDate: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target Exam Scope
                    </label>
                    <select
                      value={config.countdown.examSlug}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, examSlug: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="all">All Exams</option>
                      {examOptions.map((ex) => (
                        <option key={ex.slug} value={ex.slug}>
                          {ex.label} Only
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tap Action
                    </label>
                    <select
                      value={config.countdown.actionType}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          countdown: { ...config.countdown, actionType: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="papers">Open PYQ Papers</option>
                      <option value="syllabus">Open Syllabus Tracker</option>
                      <option value="daily_quiz">Open Daily Quiz</option>
                      <option value="notes">Open Study Notes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* [B2] Updates & Activity Center Control */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Updates &amp; Activity Screen Control (B)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.notificationsFeed.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.notificationsFeed.enabled ? "ACTIVE" : "OFF (DEFAULT FEED)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Control the Bell icon &quot;Updates &amp; Activity&quot; screen headers, built-in sections, and custom alerts.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.notificationsFeed.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notificationsFeed: {
                            ...config.notificationsFeed,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                {/* Screen Titles & Section Controls */}
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Screen Header Title
                      </label>
                      <input
                        type="text"
                        value={config.notificationsFeed.screenTitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              screenTitle: e.target.value,
                            },
                          })
                        }
                        placeholder="Updates & Activity"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Header Subtitle (Empty = Auto Exam Name)
                      </label>
                      <input
                        type="text"
                        value={config.notificationsFeed.screenSubtitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              screenSubtitle: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Official Exam Alerts & Live Feed"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Top Section Heading
                      </label>
                      <input
                        type="text"
                        value={config.notificationsFeed.todayHeading}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              todayHeading: e.target.value,
                            },
                          })
                        }
                        placeholder="Live Today"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Second Section Heading
                      </label>
                      <input
                        type="text"
                        value={config.notificationsFeed.earlierHeading}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              earlierHeading: e.target.value,
                            },
                          })
                        }
                        placeholder="Latest Shift Papers"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Built-In Feed Switches */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {[
                      { key: "showBroadcastItem", label: "Show Broadcast Announcement Card" },
                      { key: "showDailyQuizItem", label: "Show Daily Free Quiz Card" },
                      { key: "showStreakItem", label: "Show Study Streak Activity Card" },
                      { key: "showLatestPapers", label: "Show Latest Shift Papers List" },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean((config.notificationsFeed as any)[opt.key])}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              notificationsFeed: {
                                ...config.notificationsFeed,
                                [opt.key]: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4 accent-blue-600"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>

                  {config.notificationsFeed.showLatestPapers && (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Latest Shift Papers Count (1–5)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={config.notificationsFeed.latestPapersLimit}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              latestPapersLimit: Math.max(1, Math.min(5, Number(e.target.value) || 3)),
                            },
                          })
                        }
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Quick Add + Custom Items */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Custom Updates &amp; Alerts ({config.notificationsFeed.items.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: "+ Exam Alert",
                          icon: "📅",
                          title: "SSC Exam Schedule & Important Dates",
                          subtitle: "Check tier dates and start high-weightage revision.",
                          actionType: "syllabus" as const,
                        },
                        {
                          label: "+ New PYQ Paper",
                          icon: "📝",
                          title: "Latest Official Shift Added!",
                          subtitle: "Attempt the newest full 100-question mock in CBT mode.",
                          actionType: "papers" as const,
                        },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const newItem: AdminNotificationItem = {
                              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                              icon: preset.icon,
                              title: preset.title,
                              subtitle: preset.subtitle,
                              group: "Today",
                              unread: true,
                              actionType: preset.actionType,
                              active: true,
                              createdAt: new Date().toISOString(),
                            };
                            setConfig({
                              ...config,
                              notificationsFeed: {
                                ...config.notificationsFeed,
                                items: [newItem, ...config.notificationsFeed.items],
                              },
                            });
                          }}
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {preset.label}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          const newItem: AdminNotificationItem = {
                            id: `notif_${Date.now()}`,
                            icon: "🔔",
                            title: "New SSC CGL Update Released",
                            subtitle: "Check official schedule & practice matching PYQs.",
                            badge: "NEW",
                            group: "Today",
                            unread: true,
                            actionType: "papers",
                            active: true,
                            createdAt: new Date().toISOString(),
                          };
                          setConfig({
                            ...config,
                            notificationsFeed: {
                              ...config.notificationsFeed,
                              items: [newItem, ...config.notificationsFeed.items],
                            },
                          });
                        }}
                        className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Custom
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {config.notificationsFeed.items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
                      No custom notification alerts added yet. Use quick buttons above to add one.
                    </p>
                  ) : (
                    config.notificationsFeed.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <input
                              type="text"
                              value={item.icon}
                              onChange={(e) => {
                                const list = [...config.notificationsFeed.items];
                                list[idx].icon = e.target.value;
                                setConfig({
                                  ...config,
                                  notificationsFeed: { ...config.notificationsFeed, items: list },
                                });
                              }}
                              className="w-10 rounded-lg border border-slate-300 px-2 py-1 text-center text-xs dark:border-slate-700 dark:bg-slate-800"
                            />
                            <select
                              value={item.group || "Today"}
                              onChange={(e) => {
                                const list = [...config.notificationsFeed.items];
                                list[idx].group = e.target.value as "Today" | "Earlier";
                                setConfig({
                                  ...config,
                                  notificationsFeed: { ...config.notificationsFeed, items: list },
                                });
                              }}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                              <option value="Today">Top Section (Today)</option>
                              <option value="Earlier">Second Section (Earlier)</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={item.unread !== false}
                                onChange={(e) => {
                                  const list = [...config.notificationsFeed.items];
                                  list[idx].unread = e.target.checked;
                                  setConfig({
                                    ...config,
                                    notificationsFeed: { ...config.notificationsFeed, items: list },
                                  });
                                }}
                              />
                              Unread Dot
                            </label>
                            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={item.active}
                                onChange={(e) => {
                                  const list = [...config.notificationsFeed.items];
                                  list[idx].active = e.target.checked;
                                  setConfig({
                                    ...config,
                                    notificationsFeed: { ...config.notificationsFeed, items: list },
                                  });
                                }}
                              />
                              Visible
                            </label>
                          </div>
                          <button
                            onClick={() => {
                              const list = config.notificationsFeed.items.filter(
                                (n) => n.id !== item.id
                              );
                              setConfig({
                                ...config,
                                notificationsFeed: { ...config.notificationsFeed, items: list },
                              });
                            }}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Alert title"
                            value={item.title}
                            onChange={(e) => {
                              const list = [...config.notificationsFeed.items];
                              list[idx].title = e.target.value;
                              setConfig({
                                ...config,
                                notificationsFeed: { ...config.notificationsFeed, items: list },
                              });
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <select
                            value={item.actionType}
                            onChange={(e) => {
                              const list = [...config.notificationsFeed.items];
                              list[idx].actionType = e.target.value as any;
                              setConfig({
                                ...config,
                                notificationsFeed: { ...config.notificationsFeed, items: list },
                              });
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="papers">Open Papers</option>
                            <option value="daily_quiz">Open Daily Quiz</option>
                            <option value="syllabus">Open Syllabus</option>
                            <option value="question_bank">Open Question Bank</option>
                            <option value="speed_test">Open Speed Test</option>
                            <option value="notes">Open Notes</option>
                            <option value="saved_vault">Open Saved Bookmarks</option>
                            <option value="progress">Open My Analytics</option>
                            <option value="url">Open External URL</option>
                          </select>
                        </div>

                        <input
                          type="text"
                          placeholder="Subtitle / detail message"
                          value={item.subtitle}
                          onChange={(e) => {
                            const list = [...config.notificationsFeed.items];
                            list[idx].subtitle = e.target.value;
                            setConfig({
                              ...config,
                              notificationsFeed: { ...config.notificationsFeed, items: list },
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        {item.actionType === "url" && (
                          <input
                            type="text"
                            placeholder="https://ssc.gov.in/..."
                            value={item.actionUrl || ""}
                            onChange={(e) => {
                              const list = [...config.notificationsFeed.items];
                              list[idx].actionUrl = e.target.value;
                              setConfig({
                                ...config,
                                notificationsFeed: { ...config.notificationsFeed, items: list },
                              });
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOME LAYOUT, BANNERS & TICKER (C) */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              {/* Ticker Control */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Announcement Ticker Text
                </h2>
                <p className="text-xs text-slate-500">
                  Live moving bar displayed inside Home header.
                </p>
                <input
                  type="text"
                  value={config.tickerText}
                  onChange={(e) => setConfig({ ...config, tickerText: e.target.value })}
                  className="mt-3 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* [C] Server-Driven Home Layout */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Server-Driven Home Layout (C)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.homeLayout.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.homeLayout.enabled ? "ACTIVE" : "OFF (DEFAULT LAYOUT)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Reorder Home sections, show carousel banners, or pin a Featured Paper ID.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.homeLayout.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          homeLayout: { ...config.homeLayout, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Display Home Carousel Banners on Mobile
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Requires Server-Driven Home Layout to be ON + at least 1 banner below.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.homeLayout.showHomeBanners}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          homeLayout: {
                            ...config.homeLayout,
                            showHomeBanners: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Featured Paper ID Override (0 = Latest Automatic)
                    </label>
                    <input
                      type="number"
                      value={config.homeLayout.featuredPaperId}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setConfig({
                          ...config,
                          featuredPaperId: val,
                          homeLayout: { ...config.homeLayout, featuredPaperId: val },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Home Sections Order &amp; Visibility
                    </p>
                    {config.homeLayout.sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={sec.visible}
                            onChange={(e) => {
                              const copy = [...config.homeLayout.sections];
                              copy[idx] = { ...sec, visible: e.target.checked };
                              setConfig({
                                ...config,
                                homeLayout: { ...config.homeLayout, sections: copy },
                              });
                            }}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const copy = [...config.homeLayout.sections];
                              copy[idx] = { ...sec, title: e.target.value };
                              setConfig({
                                ...config,
                                homeLayout: { ...config.homeLayout, sections: copy },
                              });
                            }}
                            className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-bold text-slate-900 hover:border-slate-200 focus:border-blue-500 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveHomeSection(idx, -1)}
                            disabled={idx === 0}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveHomeSection(idx, 1)}
                            disabled={idx === config.homeLayout.sections.length - 1}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Study Modules Builder (C) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Custom Study Modules Builder (C)
                      </h2>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Zero-Build Tabs
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Add extra Study Module tiles (In-app WebView tabs, Rapid Subject Quizzes,
                      Saved Vault, or Links) dynamically without rebuilding the APK.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        customStudyModules: {
                          ...config.customStudyModules,
                          enabled: !config.customStudyModules.enabled,
                        },
                      })
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      config.customStudyModules.enabled
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {config.customStudyModules.enabled
                      ? "LIVE ON MOBILE"
                      : "OFF (DEFAULT MODULES)"}
                  </button>
                </div>

                {!config.customStudyModules.enabled && (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    Abhi <strong>Custom Study Modules OFF</strong> hain, isliye mobile app ke Study
                    Modules me koi extra tab nahi dikhega (default UI unchanged). Yahan presets ya
                    custom tiles design karke upar toggle ON karein jab live karna ho.
                  </div>
                )}

                {/* 1-Click Quick Presets */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      {
                        label: "+ Web / PDF Tab",
                        preset: {
                          title: "Current Affairs",
                          subtitle: "Monthly PDF & daily digest reader",
                          tag: "WEB TAB",
                          icon: "globe" as CustomStudyModuleIcon,
                          color: "teal" as CustomStudyModuleColor,
                          layout: "half" as const,
                          actionType: "note_web" as CustomStudyModuleActionType,
                          actionTarget: "https://ssczone.com/notes",
                        },
                      },
                      {
                        label: "+ Rapid GA Quiz (15Q)",
                        preset: {
                          title: "Rapid GA Drill",
                          subtitle: "15 quick high-yield PYQ MCQs",
                          tag: "15 MCQS",
                          icon: "zap" as CustomStudyModuleIcon,
                          color: "orange" as CustomStudyModuleColor,
                          layout: "half" as const,
                          actionType: "cbt_subject" as CustomStudyModuleActionType,
                          actionTarget: "General Awareness",
                        },
                      },
                      {
                        label: "+ Formula Notes",
                        preset: {
                          title: "Quant Formulas",
                          subtitle: "All-in-one arithmetic & advance sheet",
                          tag: "FORMULA",
                          icon: "file" as CustomStudyModuleIcon,
                          color: "blue" as CustomStudyModuleColor,
                          layout: "half" as const,
                          actionType: "notes" as CustomStudyModuleActionType,
                          actionTarget: "",
                        },
                      },
                      {
                        label: "+ Saved Vault",
                        preset: {
                          title: "Saved Vault",
                          subtitle: "Bookmarked MCQs & offline papers",
                          tag: "REVISION",
                          icon: "bookmark" as CustomStudyModuleIcon,
                          color: "purple" as CustomStudyModuleColor,
                          layout: "half" as const,
                          actionType: "saved_vault" as CustomStudyModuleActionType,
                          actionTarget: "",
                        },
                      },
                      {
                        label: "+ Wide External Banner",
                        preset: {
                          title: "Join Telegram Channel",
                          subtitle: "Daily PDFs, shift alerts & doubt solving",
                          tag: "COMMUNITY",
                          icon: "globe" as CustomStudyModuleIcon,
                          color: "pink" as CustomStudyModuleColor,
                          layout: "wide" as const,
                          actionType: "url" as CustomStudyModuleActionType,
                          actionTarget: "https://ssczone.com",
                        },
                      },
                      {
                        label: "+ Blank Module",
                        preset: {
                          title: "New Study Tab",
                          subtitle: "Tap to open resource",
                          tag: "NEW",
                          icon: "book" as CustomStudyModuleIcon,
                          color: "green" as CustomStudyModuleColor,
                          layout: "half" as const,
                          actionType: "notes" as CustomStudyModuleActionType,
                          actionTarget: "",
                        },
                      },
                    ] as const
                  ).map(({ label, preset }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const newItem: CustomStudyModuleItem = {
                          id: `cmod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                          ...preset,
                          visible: true,
                        };
                        setConfig({
                          ...config,
                          customStudyModules: {
                            ...config.customStudyModules,
                            items: [...config.customStudyModules.items, newItem],
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Custom Modules List */}
                <div className="mt-4 space-y-3">
                  {config.customStudyModules.items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
                      No custom Study Module tabs created yet. Click any preset above to add one!
                    </div>
                  ) : (
                    config.customStudyModules.items.map((mod, idx) => {
                      const updateMod = (patch: Partial<CustomStudyModuleItem>) => {
                        const next = [...config.customStudyModules.items];
                        next[idx] = { ...next[idx], ...patch };
                        setConfig({
                          ...config,
                          customStudyModules: { ...config.customStudyModules, items: next },
                        });
                      };

                      const moveMod = (dir: -1 | 1) => {
                        const list = [...config.customStudyModules.items];
                        const target = idx + dir;
                        if (target < 0 || target >= list.length) return;
                        const [item] = list.splice(idx, 1);
                        list.splice(target, 0, item);
                        setConfig({
                          ...config,
                          customStudyModules: { ...config.customStudyModules, items: list },
                        });
                      };

                      const colorSwatch: Record<CustomStudyModuleColor, string> = {
                        green: "bg-emerald-100 text-emerald-700",
                        blue: "bg-blue-100 text-blue-700",
                        purple: "bg-purple-100 text-purple-700",
                        orange: "bg-orange-100 text-orange-700",
                        teal: "bg-teal-100 text-teal-700",
                        yellow: "bg-amber-100 text-amber-700",
                        pink: "bg-pink-100 text-pink-700",
                      };

                      return (
                        <div
                          key={mod.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-xs font-black text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                {idx + 1}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                  colorSwatch[mod.color] || colorSwatch.blue
                                }`}
                              >
                                {mod.icon === "globe" && <Globe className="h-3 w-3" />}
                                {mod.icon === "zap" && <Zap className="h-3 w-3" />}
                                {mod.icon === "target" && <Target className="h-3 w-3" />}
                                {mod.icon === "file" && <FileText className="h-3 w-3" />}
                                {mod.icon === "clock" && <Clock className="h-3 w-3" />}
                                {mod.icon === "bookmark" && <Bookmark className="h-3 w-3" />}
                                {mod.icon === "book" && <BookOpen className="h-3 w-3" />}
                                {mod.title || "Untitled Tab"}
                              </span>
                              <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {mod.layout === "wide" ? "Wide Card" : "Half Card"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="mr-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={mod.visible !== false}
                                  onChange={(e) => updateMod({ visible: e.target.checked })}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                                />
                                Visible
                              </label>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveMod(-1)}
                                className="rounded border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === config.customStudyModules.items.length - 1}
                                onClick={() => moveMod(1)}
                                className="rounded border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfig({
                                    ...config,
                                    customStudyModules: {
                                      ...config.customStudyModules,
                                      items: config.customStudyModules.items.filter(
                                        (m) => m.id !== mod.id
                                      ),
                                    },
                                  })
                                }
                                className="rounded border border-rose-200 bg-white p-1 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-900"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Tab Title
                              </label>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => updateMod({ title: e.target.value })}
                                placeholder="e.g. Current Affairs"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Subtitle
                              </label>
                              <input
                                type="text"
                                value={mod.subtitle}
                                onChange={(e) => updateMod({ subtitle: e.target.value })}
                                placeholder="Short 1-line description"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Bottom Tag
                              </label>
                              <input
                                type="text"
                                value={mod.tag}
                                onChange={(e) => updateMod({ tag: e.target.value })}
                                placeholder="NEW / LIVE / PDF"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Card Width Layout
                              </label>
                              <select
                                value={mod.layout}
                                onChange={(e) =>
                                  updateMod({ layout: e.target.value as "half" | "wide" })
                                }
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              >
                                <option value="half">Half Tile (2-Column Grid)</option>
                                <option value="wide">Full Width Wide Card</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Action on Tap
                              </label>
                              <select
                                value={mod.actionType}
                                onChange={(e) =>
                                  updateMod({
                                    actionType: e.target.value as CustomStudyModuleActionType,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              >
                                <option value="note_web">In-App WebView / PDF Reader</option>
                                <option value="cbt_subject">Rapid 15-Q Subject CBT Quiz</option>
                                <option value="question_bank">Topic-Wise Question Bank</option>
                                <option value="saved_vault">Saved Vault &amp; Bookmarks</option>
                                <option value="notes">Notes &amp; PDFs Study Hub</option>
                                <option value="papers">PYQ Papers Screen</option>
                                <option value="syllabus">Syllabus Tracker Screen</option>
                                <option value="daily_quiz">Daily Free Quiz</option>
                                <option value="speed_test">Speed Test Screen</option>
                                <option value="progress">My Analytics Screen</option>
                                <option value="url">External Browser / Telegram Link</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Icon
                              </label>
                              <select
                                value={mod.icon}
                                onChange={(e) =>
                                  updateMod({ icon: e.target.value as CustomStudyModuleIcon })
                                }
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              >
                                <option value="book">Book (Notes)</option>
                                <option value="zap">Zap (Quiz / Fast)</option>
                                <option value="target">Target (Goal / Bank)</option>
                                <option value="file">File (Paper / Formula)</option>
                                <option value="clock">Clock (Timed / Daily)</option>
                                <option value="bookmark">Bookmark (Saved)</option>
                                <option value="globe">Globe (Web / Current Affairs)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Pastel Color Theme
                              </label>
                              <select
                                value={mod.color}
                                onChange={(e) =>
                                  updateMod({ color: e.target.value as CustomStudyModuleColor })
                                }
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              >
                                <option value="green">Emerald Green</option>
                                <option value="blue">Sky Blue</option>
                                <option value="purple">Royal Purple</option>
                                <option value="orange">Vibrant Orange</option>
                                <option value="teal">Ocean Teal</option>
                                <option value="yellow">Warm Amber</option>
                                <option value="pink">Rose Pink</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                {mod.actionType === "note_web" || mod.actionType === "url"
                                  ? "Target Page / PDF URL"
                                  : mod.actionType === "cbt_subject" ||
                                      mod.actionType === "question_bank"
                                    ? "Subject Key / Filter (Optional)"
                                    : "Target Argument (Optional)"}
                              </label>
                              {mod.actionType === "question_bank" ? (
                                <select
                                  value={mod.actionTarget || ""}
                                  onChange={(e) => updateMod({ actionTarget: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  <option value="">All Subjects</option>
                                  <option value="quant">Quantitative Aptitude</option>
                                  <option value="reasoning">Reasoning</option>
                                  <option value="english">English Comprehension</option>
                                  <option value="ga">General Awareness</option>
                                  <option value="computer">Computer</option>
                                </select>
                              ) : mod.actionType === "cbt_subject" ? (
                                <select
                                  value={mod.actionTarget || "General Awareness"}
                                  onChange={(e) => updateMod({ actionTarget: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  <option value="General Awareness">General Awareness</option>
                                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                                  <option value="Reasoning">General Intelligence &amp; Reasoning</option>
                                  <option value="English Comprehension">English Comprehension</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={mod.actionTarget || ""}
                                  onChange={(e) => updateMod({ actionTarget: e.target.value })}
                                  placeholder={
                                    mod.actionType === "note_web" || mod.actionType === "url"
                                      ? "https://ssczone.com/..."
                                      : "Not needed for built-in tab"
                                  }
                                  disabled={
                                    mod.actionType !== "note_web" && mod.actionType !== "url"
                                  }
                                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800/50"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Banners List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Home Screen Carousel Banners
                    </h2>
                    <p className="text-xs text-slate-500">
                      Swipeable hero cards shown when Display Home Carousel Banners is ON.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newBanners = [
                        ...config.homeBanners,
                        {
                          id: `b_${Date.now()}`,
                          title: "New Exam Series",
                          subtitle: "Solve practice sets now",
                          badge: "NEW",
                          gradient: ["#1e3a8a", "#3b82f6"],
                          actionType: "papers",
                        },
                      ];
                      setConfig({ ...config, homeBanners: newBanners });
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Banner
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {config.homeBanners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Title
                              </label>
                              <input
                                type="text"
                                value={banner.title}
                                onChange={(e) => {
                                  const updated = [...config.homeBanners];
                                  updated[idx].title = e.target.value;
                                  setConfig({ ...config, homeBanners: updated });
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Badge
                              </label>
                              <input
                                type="text"
                                value={banner.badge}
                                onChange={(e) => {
                                  const updated = [...config.homeBanners];
                                  updated[idx].badge = e.target.value;
                                  setConfig({ ...config, homeBanners: updated });
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Action
                              </label>
                              <select
                                value={banner.actionType}
                                onChange={(e) => {
                                  const updated = [...config.homeBanners];
                                  updated[idx].actionType = e.target.value;
                                  setConfig({ ...config, homeBanners: updated });
                                }}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              >
                                <option value="papers">Papers</option>
                                <option value="daily_quiz">Daily Quiz</option>
                                <option value="syllabus">Syllabus</option>
                                <option value="notes">Notes</option>
                              </select>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={banner.subtitle}
                            onChange={(e) => {
                              const updated = [...config.homeBanners];
                              updated[idx].subtitle = e.target.value;
                              setConfig({ ...config, homeBanners: updated });
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const filtered = config.homeBanners.filter((b) => b.id !== banner.id);
                            setConfig({ ...config, homeBanners: filtered });
                          }}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE & TOOL SWITCHES + MAINTENANCE (C) */}
          {activeTab === "features" && (
            <div className="space-y-6">
              {/* Tool Master Gate (C) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Remote Module &amp; Tool Gate (C)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.toolSwitches.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.toolSwitches.enabled ? "ENFORCED" : "OFF (ALL ACTIVE)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Turn Master Gate ON only when you want the switches below to hide or lock modules.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.toolSwitches.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          toolSwitches: { ...config.toolSwitches, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      scope: "features",
                      key: "dailyQuizEnabled",
                      title: "Daily Free Quiz",
                      desc: "Show/enable Daily Free Quiz module",
                    },
                    {
                      scope: "features",
                      key: "syllabusTrackerEnabled",
                      title: "Interactive Syllabus Tracker",
                      desc: "Show/enable chapter checklist & progress sync",
                    },
                    {
                      scope: "features",
                      key: "papersEnabled",
                      title: "Previous Year Papers",
                      desc: "Show/enable PYQ shift mocks & study mode",
                    },
                    {
                      scope: "features",
                      key: "notesEnabled",
                      title: "Notes & PDFs Hub",
                      desc: "Show/enable chapter PDFs & study notes",
                    },
                    {
                      scope: "toolSwitches",
                      key: "speedTestEnabled",
                      title: "Speed Test Drill",
                      desc: "Allow timed 10/15/25 Q speed challenges",
                    },
                    {
                      scope: "toolSwitches",
                      key: "questionBankEnabled",
                      title: "Topic-Wise Question Bank",
                      desc: "Allow subject & topic MCQ practice",
                    },
                    {
                      scope: "toolSwitches",
                      key: "offlineDownloadEnabled",
                      title: "Offline Paper Saving",
                      desc: "Allow downloading shift papers offline",
                    },
                    {
                      scope: "toolSwitches",
                      key: "aiTranslationEnabled",
                      title: "On-Device Hindi Translation",
                      desc: "Allow dynamic Hindi toggle translation",
                    },
                  ].map((item) => {
                    const checked =
                      item.scope === "features"
                        ? (config.features as any)[item.key]
                        : (config.toolSwitches as any)[item.key];
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={Boolean(checked)}
                            onChange={(e) => {
                              if (item.scope === "features") {
                                setConfig({
                                  ...config,
                                  features: { ...config.features, [item.key]: e.target.checked },
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  toolSwitches: {
                                    ...config.toolSwitches,
                                    [item.key]: e.target.checked,
                                  },
                                });
                              }
                            }}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Maintenance Mode */}
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
                        Emergency Maintenance Mode
                      </p>
                      <p className="text-xs text-rose-700 dark:text-rose-400">
                        Locks the entire app with a maintenance notice.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={config.features.maintenanceMode}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            features: { ...config.features, maintenanceMode: e.target.checked },
                          })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                    </label>
                  </div>

                  {config.features.maintenanceMode && (
                    <div className="mt-3">
                      <label className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Maintenance Message
                      </label>
                      <input
                        type="text"
                        value={config.features.maintenanceMessage ?? ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            features: { ...config.features, maintenanceMessage: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-950 dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMOTE SYLLABUS MASTER SYNC (D) */}
          {activeTab === "syllabus" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Remote Syllabus Sync (D)
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        config.syllabusSync.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {config.syllabusSync.enabled ? "SYNC ENABLED" : "OFF (LOCAL BUNDLE)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Push new exam chapters or hide outdated chapters remotely without rebuilding the APK.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.syllabusSync.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        syllabusSync: { ...config.syllabusSync, enabled: e.target.checked },
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                </label>
              </div>

              <div className="mt-4 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Exam Syllabus
                  </label>
                  <select
                    value={selectedSylExam}
                    onChange={(e) => setSelectedSylExam(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {examOptions.map((ex) => (
                      <option key={ex.slug} value={ex.slug}>
                        {ex.label} ({ex.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Chapter Builder */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Add Remote Chapter to {selectedSylExam.toUpperCase()}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      value={newChapSubj}
                      onChange={(e) => setNewChapSubj(e.target.value as any)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="quant">Quantitative Aptitude</option>
                      <option value="reasoning">Reasoning</option>
                      <option value="english">English</option>
                      <option value="ga">General Awareness</option>
                      <option value="computer">Computer Knowledge</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Category (e.g. Arithmetic)"
                      value={newChapCat}
                      onChange={(e) => setNewChapCat(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Chapter Title (English)"
                      value={newChapName}
                      onChange={(e) => setNewChapName(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Hindi Name (Optional)"
                      value={newChapHindi}
                      onChange={(e) => setNewChapHindi(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Expected Qs (e.g. 2-3 Qs)"
                      value={newChapExpQ}
                      onChange={(e) => setNewChapExpQ(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={newChapHighWt}
                        onChange={(e) => setNewChapHighWt(e.target.checked)}
                      />
                      High Weightage Chapter
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      if (!newChapName.trim()) {
                        toast.error("Enter a chapter title first");
                        return;
                      }
                      const chapter: RemoteSyllabusAddedChapter = {
                        id: `remote_${selectedSylExam}_${Date.now()}`,
                        subjectId: newChapSubj,
                        category: newChapCat.trim() || "Added Topics",
                        name: newChapName.trim(),
                        hindi_name: newChapHindi.trim() || newChapName.trim(),
                        high_weightage: newChapHighWt,
                        expected_questions: newChapExpQ.trim() || "1-2 Qs",
                      };
                      updateSylOverride({
                        addedChapters: [...activeSylOverride.addedChapters, chapter],
                      });
                      setNewChapName("");
                      setNewChapHindi("");
                    }}
                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Remote Chapter
                  </button>
                </div>

                {/* Added Chapters List */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Remote Chapters Added for {selectedSylExam.toUpperCase()} (
                    {activeSylOverride.addedChapters.length})
                  </p>
                  {activeSylOverride.addedChapters.length === 0 ? (
                    <p className="text-xs text-slate-500">No remote chapters added yet.</p>
                  ) : (
                    activeSylOverride.addedChapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ch.name}
                          </span>
                          <span className="ml-2 text-slate-500">
                            [{ch.subjectId} · {ch.category}]
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            updateSylOverride({
                              addedChapters: activeSylOverride.addedChapters.filter(
                                (item) => item.id !== ch.id
                              ),
                            })
                          }
                          className="text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Hidden Chapter IDs */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hidden Chapter IDs (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. quant_old_topic, gk_misc"
                    value={activeSylOverride.hiddenChapterIds.join(", ")}
                    onChange={(e) =>
                      updateSylOverride({
                        hiddenChapterIds: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ADS & PACKAGES CONNECTION (G) */}
          {activeTab === "monetization" && (
            <div className="space-y-6">
              {/* Ads Control */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Mobile Ads &amp; Promo Slots (G)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.adsControl.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.adsControl.enabled ? "ACTIVE" : "OFF (NO ADS IN APP)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Syncs promo/affiliate cards from your Web Ads dashboard to mobile placements.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.adsControl.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          adsControl: { ...config.adsControl, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { key: "syncFromWebAds", label: "Sync Live Web Ad Slots (/admin/ads)" },
                    { key: "showInHome", label: "Show Promo Card on Mobile Home" },
                    { key: "showInQuestionBank", label: "Show Promo in Question Bank Feed" },
                    { key: "showAfterResult", label: "Show Promo on Test Result Screen" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((config.adsControl as any)[opt.key])}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            adsControl: { ...config.adsControl, [opt.key]: e.target.checked },
                          })
                        }
                        className="h-4 w-4 accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Fallback Promo Title"
                    value={config.adsControl.customPromo.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        adsControl: {
                          ...config.adsControl,
                          customPromo: {
                            ...config.adsControl.customPromo,
                            title: e.target.value,
                          },
                        },
                      })
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Target URL (https://ssczone.com/pricing)"
                    value={config.adsControl.customPromo.targetUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        adsControl: {
                          ...config.adsControl,
                          customPromo: {
                            ...config.adsControl.customPromo,
                            targetUrl: e.target.value,
                          },
                        },
                      })
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Connected Web Ad Slots ({telemetry?.adsSummary?.slots?.length || 0})
                    </p>
                    <Link
                      href="/admin/ads"
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Manage Web Ads <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(telemetry?.adsSummary?.slots || []).map((s) => (
                      <span
                        key={s.id}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          s.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {s.id} ({s.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Packages Control */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Mobile Packages &amp; Paywall Rules (G)
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          config.packagesControl.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {config.packagesControl.enabled ? "ACTIVE" : "OFF (ALL FREE)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Connect DB subscription packages to paper access limits when enabled.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.packagesControl.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packagesControl: {
                            ...config.packagesControl,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Access Policy
                    </label>
                    <select
                      value={config.packagesControl.paywallMode}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packagesControl: {
                            ...config.packagesControl,
                            paywallMode: e.target.value as any,
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="banner_only">Show Upgrade Promo Only (No Lock)</option>
                      <option value="lock_premium_papers">Lock Papers Above Free Limit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Free Papers Limit
                    </label>
                    <input
                      type="number"
                      value={config.packagesControl.freePapersLimit}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packagesControl: {
                            ...config.packagesControl,
                            freePapersLimit: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Active Supabase Packages ({telemetry?.packages?.length || 0})
                    </p>
                    <Link
                      href="/admin/packages"
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Edit Packages <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(telemetry?.packages || []).map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pkg.title}
                        </span>
                        <span className="font-extrabold text-emerald-600">
                          ₹{pkg.price} · {pkg.duration_days}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TELEMETRY & USAGE SNAPSHOT (F) */}
          {activeTab === "telemetry" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Live App &amp; Database Telemetry (F)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time Supabase snapshot across users, exams, tests, bookmarks &amp; reports.
                    </p>
                  </div>
                  <button
                    onClick={() => void fetchTelemetry()}
                    disabled={loadingTelemetry}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loadingTelemetry ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>

                {/* Heartbeat Toggle (OFF by default) */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Anonymous Mobile Launch Ping ({config.telemetry.enabled ? "ACTIVE" : "OFF"})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      While OFF, the app sends zero telemetry pings. Enable to track APK version breakdown.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.telemetry.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          telemetry: { ...config.telemetry, enabled: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                {/* 8 KPI Tiles */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Registered Users", val: telemetry?.counts?.users ?? 0, icon: Users },
                    { label: "Live PYQ Papers", val: telemetry?.counts?.papers ?? 0, icon: Layout },
                    { label: "Total Questions", val: telemetry?.counts?.questions ?? 0, icon: BookOpen },
                    { label: "Test Attempts", val: telemetry?.counts?.testAttempts ?? 0, icon: CheckCircle2 },
                    { label: "Cloud Bookmarks", val: telemetry?.counts?.bookmarks ?? 0, icon: Bell },
                    { label: "Syllabus Checkpoints", val: telemetry?.counts?.syllabusRows ?? 0, icon: BarChart3 },
                    { label: "Active Paid Subs", val: telemetry?.counts?.activeSubscriptions ?? 0, icon: Package },
                    { label: "Question Reports", val: telemetry?.counts?.reports ?? 0, icon: Flag },
                  ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                      <div
                        key={kpi.label}
                        className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">{kpi.label}</span>
                          <Icon className="h-3.5 w-3.5 text-indigo-500" />
                        </div>
                        <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                          {kpi.val.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* App Ping Version Breakdown */}
                {telemetry?.pingSummary && telemetry.pingSummary.totalPings > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Recorded Launch Pings ({telemetry.pingSummary.totalPings})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(telemetry.pingSummary.byVersion || {}).map(([ver, cnt]) => (
                        <span
                          key={ver}
                          className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700"
                        >
                          v{ver}: {cnt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Question Error Reports */}
                <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Latest Flagged Question Reports
                    </p>
                    <Link
                      href="/admin/reports"
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Open All Reports ›
                    </Link>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(telemetry?.recentReports || []).length === 0 ? (
                      <p className="text-xs text-slate-500">No question reports found.</p>
                    ) : (
                      telemetry!.recentReports!.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/50"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Q#{r.question_id} · {r.reason}
                          </span>
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            {r.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VERSION & FORCE UPDATE */}
          {activeTab === "version" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                App Version &amp; Remote Update
              </h2>
              <p className="text-xs text-slate-500">
                Notify or force students to download the latest APK when critical native releases drop.
              </p>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Latest Version
                    </label>
                    <input
                      type="text"
                      value={config.version.latestVersion}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          version: { ...config.version, latestVersion: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Minimum Required Version
                    </label>
                    <input
                      type="text"
                      value={config.version.minRequiredVersion}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          version: { ...config.version, minRequiredVersion: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Force Update Popup
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      If active, students with older versions must update before continuing.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.version.forceUpdate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          version: { ...config.version, forceUpdate: e.target.checked },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Download APK Direct URL
                  </label>
                  <input
                    type="text"
                    value={config.version.downloadUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        version: { ...config.version, downloadUrl: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Release Notes
                  </label>
                  <textarea
                    rows={2}
                    value={config.version.releaseNotes}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        version: { ...config.version, releaseNotes: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Phone Mockup Preview (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-white">
              Live Phone Preview
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Real-time simulation</span>
          </div>

          <div className="relative mx-auto flex h-[590px] w-full max-w-[300px] flex-col overflow-hidden rounded-[36px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl">
            <div className="absolute left-1/2 top-2 z-30 h-4 w-24 -translate-x-1/2 rounded-full bg-slate-800" />

            <div className="relative flex-1 overflow-y-auto bg-slate-50 p-3 pt-8 text-slate-900">
              {config.features.maintenanceMode ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-900 p-4 text-center text-white">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-black">Scheduled Maintenance</p>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-300">
                    {config.features.maintenanceMessage ||
                      "SSCZone servers are briefly undergoing maintenance."}
                  </p>
                  <div className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-[10px] font-bold text-white">
                    Check Status Again
                  </div>
                </div>
              ) : (
                <>
                  {config.tickerText && (
                    <div className="mb-2 rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">
                      {config.tickerText}
                    </div>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">My Exam</p>
                      <p className="text-xs font-black text-slate-900">SSC CGL ▾</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-blue-100 p-1 text-[9px]">🔔</span>
                    </div>
                  </div>

                  {/* Preview [B] Exam Countdown ONLY if enabled */}
                  {config.countdown.enabled && (
                    <div className="mb-2.5 flex items-center justify-between rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-sm">
                      <div>
                        <p className="text-[8px] font-bold text-indigo-200">
                          {config.countdown.badge || "COUNTDOWN"}
                        </p>
                        <p className="text-[10px] font-black">{config.countdown.title}</p>
                      </div>
                      <span className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-black">
                        {daysRemaining !== null
                          ? daysRemaining >= 0
                            ? `${daysRemaining}d left`
                            : "Live Now"
                          : config.countdown.targetDate}
                      </span>
                    </div>
                  )}

                  {/* Preview [C] Home Carousel ONLY if enabled */}
                  {config.homeLayout.enabled &&
                    config.homeLayout.showHomeBanners &&
                    config.homeBanners[0] && (
                      <div className="mb-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 p-3 text-white shadow-md">
                        <span className="rounded-full bg-blue-400/30 px-1.5 py-0.5 text-[8px] font-black">
                          {config.homeBanners[0].badge}
                        </span>
                        <p className="mt-1 text-[11px] font-black">
                          {config.homeBanners[0].title}
                        </p>
                        <p className="text-[9px] text-blue-200">
                          {config.homeBanners[0].subtitle}
                        </p>
                      </div>
                    )}

                  {/* Preview [C+] Custom Study Modules ONLY if enabled */}
                  {config.customStudyModules.enabled &&
                    config.customStudyModules.items.some((m) => m.visible !== false) && (
                      <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2">
                        <p className="mb-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                          + Custom Study Modules
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {config.customStudyModules.items
                            .filter((m) => m.visible !== false)
                            .map((m) => (
                              <div
                                key={m.id}
                                className={`rounded-lg bg-white p-1.5 shadow-sm ${
                                  m.layout === "wide"
                                    ? "col-span-2 flex items-center justify-between"
                                    : ""
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-[9px] font-black text-slate-900">
                                    {m.title || "Custom Tab"}
                                  </p>
                                  <p className="truncate text-[7px] text-slate-500">
                                    {m.subtitle || m.actionType}
                                  </p>
                                </div>
                                <span className="mt-0.5 inline-block text-[7px] font-extrabold uppercase text-blue-600">
                                  {m.tag || "NEW"}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Preview [G] Promo Card ONLY if enabled */}
                  {config.adsControl.enabled && config.adsControl.showInHome && (
                    <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 p-2.5">
                      <span className="text-[8px] font-extrabold text-indigo-700">
                        {config.adsControl.customPromo.badge}
                      </span>
                      <p className="text-[10px] font-black text-slate-900">
                        {config.adsControl.customPromo.title}
                      </p>
                      <p className="text-[9px] text-slate-600">
                        {config.adsControl.customPromo.ctaText}
                      </p>
                    </div>
                  )}

                  {activeTab === "version" && (
                    <div className="mt-2 rounded-2xl border border-indigo-200 bg-white p-3 shadow-lg">
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black text-emerald-700">
                        {config.version.forceUpdate ? "REQUIRED UPDATE" : "NEW UPDATE AVAILABLE"}
                      </span>
                      <p className="mt-1 text-xs font-bold text-slate-900">
                        Update SSCZone App (v{config.version.latestVersion})
                      </p>
                      <p className="mt-0.5 line-clamp-3 text-[9px] text-slate-600">
                        {config.version.releaseNotes || "Latest improvements ready."}
                      </p>
                      <div className="mt-2.5 rounded-lg bg-indigo-600 py-1.5 text-center text-[10px] font-bold text-white">
                        Download &amp; Update Now
                      </div>
                    </div>
                  )}

                  {activeTab !== "version" && config.announcement.enabled && (
                    <div className="mt-2 rounded-2xl border border-blue-200 bg-white p-3 shadow-lg">
                      <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[8px] font-black text-rose-600">
                        {config.announcement.badge}
                      </span>
                      <p className="mt-1 text-xs font-bold text-slate-900">
                        {config.announcement.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[9px] text-slate-600">
                        {config.announcement.message}
                      </p>
                      <div className="mt-2.5 rounded-lg bg-blue-600 py-1.5 text-center text-[10px] font-bold text-white">
                        {config.announcement.buttonText}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-around border-t border-slate-200 bg-white py-2 text-[8px] font-bold text-slate-500">
              <span className="font-black text-blue-600">🏠 Home</span>
              <span>📄 Papers</span>
              <span>⚡ Quiz</span>
              <span>📊 Syllabus</span>
              <span>👤 Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
