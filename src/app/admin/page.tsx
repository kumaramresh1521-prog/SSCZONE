"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CreditCard,
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  Plus,
  Radio,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  Flag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate, formatPrice } from "@/lib/utils";

type DashboardTab = "overview" | "ticker" | "modules";

type Stats = {
  exams: number;
  subjects: number;
  topics: number;
  questions: number;
  users: number;
  subscriptions: number;
  revenue: number;
};

type TickerItem = {
  id: number;
  title: string;
  badge: string;
  link: string;
  is_active: boolean;
};

type RecentUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

type RecentPayment = {
  id: string;
  amount: number | string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  packages: { title: string | null } | null;
};

type ModuleItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  desc: string;
  accent: string;
};

const EMPTY_STATS: Stats = {
  exams: 0,
  subjects: 0,
  topics: 0,
  questions: 0,
  users: 0,
  subscriptions: 0,
  revenue: 0,
};

const DEFAULT_TICKERS: TickerItem[] = [
  {
    id: 1,
    title: "SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!",
    badge: "COUNTDOWN",
    link: "/exams/ssc-cgl",
    is_active: true,
  },
  {
    id: 2,
    title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released",
    badge: "LIVE",
    link: "/papers",
    is_active: true,
  },
  {
    id: 3,
    title: "SSC CPO 2026 Notification Out - 4,000+ Vacancies Announced",
    badge: "NEW",
    link: "/exams/ssc-cpo",
    is_active: true,
  },
];

const BADGE_OPTIONS = ["LIVE", "NEW", "HOT", "COUNTDOWN", "ANSWER KEY", "NOTIFICATION"];

const QUICK_LINKS = [
  { label: "SSC CGL exam page", value: "/exams/ssc-cgl" },
  { label: "SSC CHSL exam page", value: "/exams/ssc-chsl" },
  { label: "SSC CPO exam page", value: "/exams/ssc-cpo" },
  { label: "SSC MTS exam page", value: "/exams/ssc-mts" },
  { label: "Previous year papers", value: "/papers" },
  { label: "Pricing plans", value: "/pricing" },
  { label: "Question search", value: "/search" },
];

const MODULES: ModuleItem[] = [
  {
    title: "Exams",
    href: "/admin/exams",
    icon: BookOpen,
    desc: "Manage active exam targets and ordering.",
    accent: "text-blue-300 bg-blue-500/10 border-blue-400/20",
  },
  {
    title: "Subjects",
    href: "/admin/subjects",
    icon: Layers,
    desc: "Organize subject groups under each exam.",
    accent: "text-cyan-300 bg-cyan-500/10 border-cyan-400/20",
  },
  {
    title: "Topics",
    href: "/admin/topics",
    icon: FileText,
    desc: "Maintain chapters, access flags, and sequence.",
    accent: "text-violet-300 bg-violet-500/10 border-violet-400/20",
  },
  {
    title: "Questions",
    href: "/admin/questions",
    icon: HelpCircle,
    desc: "Add MCQs and import parsed content.",
    accent: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  },
  {
    title: "PYQ Papers",
    href: "/admin/papers",
    icon: FileSpreadsheet,
    desc: "Publish papers and manage test questions.",
    accent: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    desc: "Review users and manage admin access.",
    accent: "text-rose-300 bg-rose-500/10 border-rose-400/20",
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: CreditCard,
    desc: "Create pricing packages and subscription offers.",
    accent: "text-teal-300 bg-teal-500/10 border-teal-400/20",
  },
  {
    title: "Admin Tools",
    href: "/admin/tools",
    icon: Wrench,
    desc: "Run utilities for imports, parsing, and cleanup.",
    accent: "text-orange-300 bg-orange-500/10 border-orange-400/20",
  },
];

function normalizeTickers(value: unknown): TickerItem[] | null {
  if (!Array.isArray(value)) return null;

  const tickers = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const data = item as Partial<TickerItem>;
      if (typeof data.title !== "string" || typeof data.link !== "string") return null;

      return {
        id: typeof data.id === "number" ? data.id : Date.now(),
        title: data.title,
        badge: typeof data.badge === "string" ? data.badge : "LIVE",
        link: data.link,
        is_active: Boolean(data.is_active),
      };
    })
    .filter(Boolean) as TickerItem[];

  return tickers.length > 0 ? tickers : null;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Dashboard data could not be loaded.";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tickers, setTickers] = useState<TickerItem[]>(DEFAULT_TICKERS);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<"healthy" | "slow" | "error">("healthy");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("LIVE");
  const [link, setLink] = useState("/exams/ssc-cgl");
  const [isActive, setIsActive] = useState(true);

  const activeTickers = useMemo(() => tickers.filter((ticker) => ticker.is_active), [tickers]);

  const statCards = useMemo(
    () => [
      { label: "Exams", value: stats.exams, icon: BookOpen, color: "text-blue-300" },
      { label: "Subjects", value: stats.subjects, icon: Layers, color: "text-cyan-300" },
      { label: "Topics", value: stats.topics, icon: FileText, color: "text-violet-300" },
      { label: "Questions", value: stats.questions, icon: HelpCircle, color: "text-amber-300" },
      { label: "Users", value: stats.users, icon: Users, color: "text-emerald-300" },
      { label: "VIP Subs", value: stats.subscriptions, icon: CreditCard, color: "text-rose-300" },
      { label: "Revenue", value: formatPrice(stats.revenue), icon: TrendingUp, color: "text-teal-300" },
    ],
    [stats]
  );

  const contentTotal = stats.exams + stats.subjects + stats.topics + stats.questions;
  const contentRows = [
    { label: "Questions", value: stats.questions, color: "bg-amber-400" },
    { label: "Topics", value: stats.topics, color: "bg-violet-400" },
    { label: "Subjects", value: stats.subjects, color: "bg-cyan-400" },
    { label: "Exams", value: stats.exams, color: "bg-blue-400" },
  ];

  useEffect(() => {
    const savedTickers = localStorage.getItem("ssczone_live_tickers");
    if (savedTickers) {
      try {
        const parsed = normalizeTickers(JSON.parse(savedTickers));
        if (parsed) setTickers(parsed);
      } catch {
        localStorage.removeItem("ssczone_live_tickers");
      }
    }

    let alive = true;

    // Fast-path: Load cached dashboard data immediately for 0ms instant display
    try {
      const cached = sessionStorage.getItem("ssczone_dashboard_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.stats) {
          setStats(parsed.stats);
          if (parsed.recentUsers) setRecentUsers(parsed.recentUsers);
          if (parsed.recentPayments) setRecentPayments(parsed.recentPayments);
          setLoading(false);
        }
      }
    } catch (e) {
      // Ignore cache parse error
    }

    async function loadDashboard() {
      // If we already have cached data, don't show full-screen blocking loader
      if (!sessionStorage.getItem("ssczone_dashboard_cache")) {
        setLoading(true);
      }
      setLoadError("");

      try {
        const now = new Date().toISOString();
        const [
          examsResult,
          subjectsResult,
          topicsResult,
          questionsResult,
          profilesResult,
          activeSubsResult,
          recentUsersResult,
          recentPaymentsResult,
        ] = await Promise.all([
          supabase.from("exams").select("id", { count: "exact", head: true }),
          supabase.from("subjects").select("id", { count: "exact", head: true }),
          supabase.from("topics").select("id", { count: "exact", head: true }),
          supabase.from("questions").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("subscriptions").select("amount").eq("status", "active").gte("expires_at", now),
          supabase
            .from("profiles")
            .select("id, full_name, email, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("subscriptions")
            .select("id, amount, created_at, profiles(full_name, email), packages(title)")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const freshStats = {
          exams: examsResult?.count ?? 0,
          subjects: subjectsResult?.count ?? 0,
          topics: topicsResult?.count ?? 0,
          questions: questionsResult?.count ?? 0,
          users: profilesResult?.count ?? 0,
          subscriptions: activeSubsResult?.data ? activeSubsResult.data.length : 0,
          revenue: activeSubsResult?.data
            ? activeSubsResult.data.reduce((sum: number, sub: any) => sum + Number(sub.amount ?? 0), 0)
            : 0,
        };

        if (alive) {
          setStats(freshStats);
          if (recentUsersResult?.data) {
            setRecentUsers(recentUsersResult.data as RecentUser[]);
          }
          if (recentPaymentsResult?.data) {
            setRecentPayments(recentPaymentsResult.data as unknown as RecentPayment[]);
          }

          // Cache fresh snapshot for instant navigation
          try {
            sessionStorage.setItem(
              "ssczone_dashboard_cache",
              JSON.stringify({
                stats: freshStats,
                recentUsers: recentUsersResult?.data ?? [],
                recentPayments: recentPaymentsResult?.data ?? []
              })
            );
          } catch {}
        }

        const reportsResponse = await fetch("/api/reports?status=pending", { cache: "no-store" });
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          if (alive) setPendingReportsCount(reportsData.pendingCount || 0);
        }

        if (alive) setDbStatus("healthy");
      } catch (error) {
        if (alive) {
          setDbStatus("error");
        }
        setLoadError(getErrorMessage(error));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      alive = false;
    };
  }, []);

  function saveTickersToStorage(items: TickerItem[]) {
    try {
      setTickers(items);
      localStorage.setItem("ssczone_live_tickers", JSON.stringify(items));
      window.dispatchEvent(new StorageEvent("storage", { key: "ssczone_live_tickers" }));
    } catch {
      toast.error("Ticker changes could not be saved.");
    }
  }

  function handleSaveTicker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanLink = link.trim() || "/exams";

    if (!cleanTitle) {
      toast.error("Ticker title is required.");
      return;
    }

    if (editingId !== null) {
      saveTickersToStorage(
        tickers.map((ticker) =>
          ticker.id === editingId
            ? { ...ticker, title: cleanTitle, badge, link: cleanLink, is_active: isActive }
            : ticker
        )
      );
      toast.success("Ticker updated.");
    } else {
      saveTickersToStorage([
        { id: Date.now(), title: cleanTitle, badge, link: cleanLink, is_active: isActive },
        ...tickers,
      ]);
      toast.success("Ticker added.");
    }

    resetForm();
  }

  function handleEdit(ticker: TickerItem) {
    setEditingId(ticker.id);
    setTitle(ticker.title);
    setBadge(ticker.badge);
    setLink(ticker.link);
    setIsActive(ticker.is_active);
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this ticker alert?")) return;
    saveTickersToStorage(tickers.filter((ticker) => ticker.id !== id));
    toast.success("Ticker deleted.");
  }

  function toggleActive(id: number) {
    saveTickersToStorage(
      tickers.map((ticker) => (ticker.id === id ? { ...ticker, is_active: !ticker.is_active } : ticker))
    );
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setBadge("LIVE");
    setLink("/exams/ssc-cgl");
    setIsActive(true);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-slate-100">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/30 via-purple-900/10 to-slate-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"></div>
          
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-1.5 text-xs font-bold text-indigo-300 shadow-inner">
                <ShieldCheck className="h-4 w-4" />
                Protected Workspace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 md:text-5xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-300">
                Monitor content, users, subscriptions, and live alerts from a single focused control panel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/tools"
                className="group flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300 shadow-lg backdrop-blur-md transition-all hover:bg-amber-500/20 hover:text-amber-200"
              >
                <Wrench className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Tools
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 shadow-lg backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                View site
              </Link>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-red-500/10 bg-gradient-to-br from-red-950/20 to-slate-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/10 blur-[60px]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-300/70">Live Alerts</p>
              <p className="mt-1 text-4xl font-extrabold text-white">{activeTickers.length}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-400 shadow-inner">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <p className="relative z-10 mt-6 text-sm font-medium text-slate-400">
            Active ticker alerts are visible on the homepage to all users.
          </p>
        </div>
      </section>

      {/* STUDENT QUESTION ISSUES ALERT NOTIFICATION BANNER */}
      {pendingReportsCount > 0 ? (
        <Link
          href="/admin/reports"
          className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-red-950/40 to-slate-900/80 p-4 sm:p-5 shadow-xl transition-all hover:border-rose-400 hover:shadow-rose-950/30"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flag className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Action Required
                </span>
                <span className="text-xs text-rose-300 font-semibold">Student Flagged Questions</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white mt-1">
                {pendingReportsCount} Question {pendingReportsCount === 1 ? "Error" : "Errors"} Reported by Students
              </p>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                Students identified potential wrong answer keys or typos in practice MCQs. Click to review and fix in 1-click.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-900/40 group-hover:bg-rose-500 transition-colors">
              Review Questions Now &rarr;
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span><strong>All Question Reports Resolved:</strong> No pending student flags. Database and question bank are clean.</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supabase Cloud Connected & Live</span>
          </div>
        </div>
      )}

      <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-inner backdrop-blur-xl">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "ticker", label: `Tickers (${tickers.length})`, icon: Radio },
          { id: "modules", label: "Modules", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                selected
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${selected ? "text-blue-100" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
          <Activity className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Some dashboard data could not load.</p>
            <p className="mt-1 text-red-100/75">{loadError}</p>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <section className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20">
                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:opacity-40" style={{ backgroundColor: 'currentColor', color: item.color.replace('text-', 'bg-').split('-')[0] }}></div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${item.color} shadow-inner`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  {loading ? (
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />
                  ) : (
                    <p className="text-2xl font-extrabold text-white tracking-tight">{item.value}</p>
                  )}
                  <p className="mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 md:p-8 shadow-xl backdrop-blur-md">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px]"></div>
              
              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Content Distribution</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">Current database mix across exams and practice content.</p>
                </div>
                <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
              </div>

              <div className="relative z-10 space-y-5">
                {contentRows.map((row) => {
                  const percent = contentTotal ? Math.max(4, Math.round((row.value / contentTotal) * 100)) : 0;

                  return (
                    <div key={row.label} className="group">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 tracking-wide uppercase">{row.label}</span>
                        <span className="font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">{loading ? "--" : row.value}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.04] shadow-inner">
                        <div className={`h-full rounded-full ${row.color} transition-all duration-1000 ease-out`} style={{ width: `${loading ? 18 : percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <RecentUsersCard loading={loading} users={recentUsers} />
              <RecentPaymentsCard loading={loading} payments={recentPayments} />
            </div>
          </div>
        </section>
      )}

      {activeTab === "ticker" && (
        <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <form onSubmit={handleSaveTicker} className="rounded-xl border border-white/10 bg-[#151922] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{editingId ? "Edit Ticker" : "New Ticker"}</h2>
                <p className="mt-1 text-xs text-slate-500">Create crisp alerts for exam updates and paper links.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-200">
                <Radio className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Announcement title</label>
                <textarea
                  rows={3}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="SSC CGL admit card released for Tier 2"
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:bg-white/[0.06]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400">Badge</label>
                  <select
                    value={badge}
                    onChange={(event) => setBadge(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-amber-300/50"
                  >
                    {BADGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400">Quick link</label>
                  <select
                    value=""
                    onChange={(event) => {
                      if (event.target.value) setLink(event.target.value);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-amber-300/50"
                  >
                    <option value="">Choose page</option>
                    {QUICK_LINKS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">Target URL</label>
                <input
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:bg-white/[0.06]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-400"
                  />
                  Active on ticker
                </label>

                <div className="flex gap-2">
                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
                  >
                    {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#151922] p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Homepage Preview</h2>
                  <p className="mt-1 text-xs text-slate-500">{activeTickers.length} active of {tickers.length} alerts</p>
                </div>
                <Link
                  href="/admin/ticker"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Full manager
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#0f131b] p-3">
                <div className="inline-flex min-w-full items-center gap-3 whitespace-nowrap">
                  {activeTickers.length === 0 ? (
                    <span className="text-sm text-slate-500">No active ticker alerts.</span>
                  ) : (
                    activeTickers.map((ticker) => (
                      <span
                        key={ticker.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200"
                      >
                        <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {ticker.badge}
                        </span>
                        {ticker.title}
                        <span className="font-mono text-[10px] text-amber-200">{ticker.link}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {tickers.map((ticker) => (
                <div key={ticker.id} className="rounded-xl border border-white/10 bg-[#151922] p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {ticker.badge}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ticker.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {ticker.is_active ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{ticker.title}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{ticker.link}</p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(ticker.id)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        {ticker.is_active ? "Pause" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(ticker)}
                        className="rounded-lg border border-blue-300/20 bg-blue-300/10 p-2 text-blue-200 transition hover:bg-blue-300/15"
                        aria-label="Edit ticker"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ticker.id)}
                        className="rounded-lg border border-red-300/20 bg-red-300/10 p-2 text-red-200 transition hover:bg-red-300/15"
                        aria-label="Delete ticker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "modules" && (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {MODULES.map((module) => {
            const Icon = module.icon;
            // Map text color to background for the glow effect
            const glowColor = module.accent.replace('text-', 'bg-').split(' ')[0];

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/40"
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-30 ${glowColor}`}></div>
                
                <div className="mb-6 flex items-start justify-between relative z-10">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner transition-transform duration-300 group-hover:scale-110 ${module.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-500 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                
                <h3 className="relative z-10 text-lg font-bold text-white tracking-tight">{module.title}</h3>
                <p className="relative z-10 mt-2 text-sm font-medium leading-relaxed text-slate-400">{module.desc}</p>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}

function RecentUsersCard({ loading, users }: { loading: boolean; users: RecentUser[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151922] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Recent Users</h2>
          <p className="mt-1 text-xs text-slate-500">Latest registered aspirants.</p>
        </div>
        <Link href="/admin/users" className="text-xs font-semibold text-blue-300 hover:text-blue-200">
          View all
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />
          ))
        ) : users.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.full_name || "SSC Aspirant"}</p>
                <p className="truncate text-xs text-slate-500">{user.email || "No email"}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{formatDate(user.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentPaymentsCard({ loading, payments }: { loading: boolean; payments: RecentPayment[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151922] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Recent Payments</h2>
          <p className="mt-1 text-xs text-slate-500">Active subscription activity.</p>
        </div>
        <Link href="/admin/packages" className="text-xs font-semibold text-blue-300 hover:text-blue-200">
          Manage
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />
          ))
        ) : payments.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">No active payments found.</p>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {payment.profiles?.full_name || payment.profiles?.email || "Student"}
                </p>
                <p className="truncate text-xs text-amber-200">{payment.packages?.title || "VIP Pass"}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-emerald-300">{formatPrice(Number(payment.amount ?? 0))}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
