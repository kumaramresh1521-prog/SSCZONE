"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
  History,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  getUserAttempts,
  getUserCollectedQuestions,
} from "@/lib/user-attempts-store";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    attempted: 0,
    correct: 0,
    tests: 0,
    bookmarks: 0,
    accuracy: 0,
  });
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"all" | "speed_test" | "daily_quiz" | "mock_test">("all");
  const [targetExam, setTargetExam] = useState("SSC CGL 2026");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return router.replace("/login");
      setUser(user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(prof);

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*, packages(title)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(subs);

      const { data: attempts } = await supabase
        .from("test_attempts")
        .select("id, score, total_questions, start_time, end_time, status, paper_id, previous_papers(title, year)")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .limit(20);

      const { count: bookmarkCount } = await supabase
        .from("bookmarks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Read local attempts and collections
      const localAttempts = getUserAttempts();
      const localCollected = getUserCollectedQuestions();

      // Normalize local attempts (Speed Tests and Daily Quizzes)
      const normalizedLocal = localAttempts.map((la) => ({
        id: la.id,
        type: la.type,
        title: la.title,
        subject: la.subject || "General",
        score: la.score,
        maxScore: la.maxScore || (la.totalQuestions * 2),
        total_questions: la.totalQuestions,
        correct: la.correct,
        incorrect: la.incorrect,
        unattempted: la.unattempted,
        accuracy: la.accuracy,
        timeSpentSeconds: la.timeSpentSeconds,
        start_time: la.completedAt,
        status: "completed",
        isLocal: true,
      }));

      // Normalize remote attempts (PYQ Full Shift Papers)
      const normalizedRemote = (attempts || []).map((ra) => ({
        id: `pyq_${ra.id}`,
        type: "mock_test" as const,
        title: ra.previous_papers?.title || `SSC Shift Mock #${ra.id}`,
        subject: "Full Shift Paper",
        score: ra.score,
        maxScore: (ra.total_questions || 100) * 2,
        total_questions: ra.total_questions || 100,
        correct: Math.round((ra.score || 0) / 2),
        incorrect: 0,
        unattempted: 0,
        accuracy: ra.total_questions ? Math.round(((ra.score || 0) / ((ra.total_questions || 100) * 2)) * 100) : 0,
        timeSpentSeconds: 3600,
        start_time: ra.start_time,
        status: ra.status,
        isLocal: false,
      }));

      // Merge and sort in-detail history
      const mergedAttempts = [...normalizedLocal, ...normalizedRemote].sort(
        (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      const totalAttempted = mergedAttempts.reduce((s, a) => s + (a.total_questions || 0), 0);
      const totalCorrect = mergedAttempts.reduce((s, a) => s + (a.correct || 0), 0);
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      const totalBookmarks = Math.max(bookmarkCount || 0, localCollected.length);

      setStats({
        attempted: totalAttempted,
        correct: totalCorrect,
        tests: mergedAttempts.length,
        bookmarks: totalBookmarks,
        accuracy,
      });

      setAllAttempts(mergedAttempts);
      setRecentAttempts(mergedAttempts.slice(0, 5));
    });
  }, [router]);

  // Filter attempts based on tab
  const filteredAttempts = useMemo(() => {
    if (activeHistoryTab === "all") return allAttempts;
    return allAttempts.filter((a) => a.type === activeHistoryTab);
  }, [allAttempts, activeHistoryTab]);

  if (!user) return null;

  const candidateName = profile?.full_name || user.email?.split("@")[0] || "Aspirant";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================= */}
      {/* DASHBOARD HERO HEADER                                     */}
      {/* ========================================================= */}
      <section className="border-b border-gray-200 bg-white pt-8 pb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>Student Learning Dashboard</span>
                </span>
                
                {subscription ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>VIP Member</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    <span>Free Plan</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                Welcome back, {candidateName} 👋
              </h1>

              <p className="text-xs sm:text-sm text-gray-500 font-normal">
                Track your speed, accuracy, and topic-wise mastery across SSC Tier-1 & Tier-2 examinations.
              </p>
            </div>

            {/* Target Exam Selection & Quick Settings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-800">
                <Target className="h-4 w-4 text-blue-600" />
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                  <option value="SSC CGL 2026">SSC CGL 2026</option>
                  <option value="SSC CHSL 2026">SSC CHSL 2026</option>
                  <option value="SSC CPO 2026">SSC CPO 2026</option>
                  <option value="SSC MTS & Havaldar">SSC MTS & Havaldar</option>
                  <option value="SSC GD Constable">SSC GD Constable</option>
                </select>
              </div>

              <Link
                href="/dashboard/settings"
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-950 transition-colors"
                title="Account Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN DASHBOARD CONTENT                                    */}
      {/* ========================================================= */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        
        {/* 4 KEY METRIC TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tile 1: Questions Practiced */}
          <div className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-xs text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Questions Solved</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">{stats.attempted}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Across all drills & papers</p>
            </div>
          </div>

          {/* Tile 2: Overall Accuracy */}
          <div className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-xs text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Average Accuracy</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {stats.accuracy}%
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {stats.correct} correct of {stats.attempted}
              </p>
            </div>
          </div>

          {/* Tile 3: Total Tests Taken */}
          <div className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-xs text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Tests & Drills Taken</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">{stats.tests}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Mocks, Speed Tests & Quizzes</p>
            </div>
          </div>

          {/* Tile 4: Saved Questions */}
          <Link
            href="/dashboard/bookmarks"
            className="group rounded-3xl border border-gray-200/90 bg-white p-5 shadow-xs text-left space-y-3 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 group-hover:text-amber-800">Saved Bookmarks</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100">
                <Bookmark className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{stats.bookmarks}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5 group-hover:text-amber-700">Click to revise collected MCQs &rarr;</p>
            </div>
          </Link>

        </div>

        {/* ========================================================= */}
        {/* QUICK ACTION HUB & STUDY ROADMAP                          */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Shortcuts, Weightage, and In-Detail History */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl"></div>

              <div className="space-y-4 relative z-10 text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-black text-amber-300">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>TARGET EXAM: {targetExam}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Continue Your Preparation Journey
                </h2>

                <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed max-w-xl">
                  Pick up right where you left off. Practice rapid speed tests, solve daily subject drills, or simulate actual exam conditions with timed PYQs.
                </p>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Link
                    href="/speed-test"
                    className="flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-black text-gray-950 shadow-md transition-all cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>Speed Test Drill</span>
                  </Link>

                  <Link
                    href="/daily-quiz"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Daily Free Quiz</span>
                  </Link>

                  <Link
                    href="/papers"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Attempt Full Paper</span>
                  </Link>

                  <Link
                    href="/notes"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Subject Notes</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* SUBJECT PROFICIENCY MATRIX */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Tier-1 Sectional Weightage & Focus</span>
                </h3>
                <span className="text-xs text-gray-400 font-semibold">TCS Pattern</span>
              </div>

              <div className="space-y-4">
                {[
                  { name: "General Awareness (GK / GS)", weight: "25 Qs / 50 Marks", progress: 65, color: "bg-blue-600", link: "/notes" },
                  { name: "Quantitative Aptitude (Maths)", weight: "25 Qs / 50 Marks", progress: 45, color: "bg-amber-500", link: "/exams/ssc-cgl" },
                  { name: "General Intelligence & Reasoning", weight: "25 Qs / 50 Marks", progress: 80, color: "bg-emerald-500", link: "/exams" },
                  { name: "English Comprehension", weight: "25 Qs / 50 Marks", progress: 55, color: "bg-indigo-600", link: "/exams" },
                ].map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Link href={sec.link} className="font-bold text-gray-800 hover:text-blue-600 transition-colors">
                        {sec.name}
                      </Link>
                      <span className="text-gray-400 font-medium">{sec.weight}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${sec.color}`} style={{ width: `${sec.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FULL-DETAIL PRACTICE & TEST ATTEMPTS HISTORY */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    <span>In-Detail Practice & Test Attempts History</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Detailed performance record across Speed Tests, Daily Quizzes, and PYQ Shifts.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
                  <button
                    onClick={() => setActiveHistoryTab("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeHistoryTab === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All ({allAttempts.length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("speed_test")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeHistoryTab === "speed_test" ? "bg-amber-500 text-white shadow-xs" : "text-gray-600 hover:text-amber-800"
                    }`}
                  >
                    ⚡ Speed Tests ({allAttempts.filter((a) => a.type === "speed_test").length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("daily_quiz")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeHistoryTab === "daily_quiz" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-blue-800"
                    }`}
                  >
                    🎯 Daily Quizzes ({allAttempts.filter((a) => a.type === "daily_quiz").length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("mock_test")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeHistoryTab === "mock_test" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-emerald-800"
                    }`}
                  >
                    📄 PYQ Shifts ({allAttempts.filter((a) => a.type === "mock_test").length})
                  </button>
                </div>
              </div>

              {filteredAttempts.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-700">No attempts found in this category.</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Take a speed test drill or daily free quiz to see your live score breakdown, speed metrics, and accuracy here.
                  </p>
                  <div className="pt-2 flex justify-center gap-2.5">
                    <Link href="/speed-test" className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition-colors">
                      ⚡ Start Speed Test
                    </Link>
                    <Link href="/daily-quiz" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors">
                      🎯 Daily Free Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="rounded-2xl border border-gray-200/90 hover:border-blue-300 bg-white p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          att.type === "speed_test" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                          att.type === "daily_quiz" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                          "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}>
                          {att.type === "speed_test" ? <Zap className="h-4 w-4" /> :
                           att.type === "daily_quiz" ? <Sparkles className="h-4 w-4" /> :
                           <FileSpreadsheet className="h-4 w-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              {att.type === "speed_test" ? "Speed Drill" : att.type === "daily_quiz" ? "Daily Quiz" : "PYQ Shift"}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(att.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                            {att.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap font-medium">
                            <span>Questions: <strong>{att.total_questions}</strong></span>
                            {att.timeSpentSeconds > 0 && (
                              <span>Time: <strong>{Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s</strong></span>
                            )}
                            {att.subject && <span>Subject: <strong>{att.subject}</strong></span>}
                          </div>
                        </div>
                      </div>

                      {/* Score & Accuracy Badges */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-black text-gray-900">
                            {att.score} <span className="text-xs text-gray-400 font-normal">/ {att.maxScore} Marks</span>
                          </div>
                          <div className="text-[11px] font-bold mt-0.5">
                            <span className={att.accuracy >= 75 ? "text-emerald-600" : att.accuracy >= 50 ? "text-amber-600" : "text-rose-600"}>
                              {att.accuracy}% Accuracy
                            </span>
                          </div>
                        </div>

                        <Link
                          href={att.type === "speed_test" ? "/speed-test" : att.type === "daily_quiz" ? "/daily-quiz" : "/papers"}
                          className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-bold text-gray-700 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Re-attempt</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Subscription & Recent Activity */}
          <div className="space-y-6">
            
            {/* SUBSCRIPTION CARD */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Membership</h3>
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>

              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active VIP Membership</span>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-emerald-950">{subscription.packages?.title || "SSC Pass Pro"}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Valid till {new Date(subscription.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Unlock Full Test Series</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Upgrade to unlock 500+ TCS full mock tests, detailed Hindi solutions, and unlimited bookmarking.
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="block w-full text-center rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                  >
                    View VIP Plans &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY CARD */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Recent Activity</h3>
                <Clock className="h-3.5 w-3.5 text-gray-400" />
              </div>

              {recentAttempts.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">No tests completed yet.</p>
                  <Link
                    href="/speed-test"
                    className="inline-block text-xs font-bold text-blue-600 hover:underline"
                  >
                    Start a quick drill &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">
                          {attempt.title}
                        </p>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800 shrink-0">
                          {attempt.score} / {attempt.maxScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>
                          {new Date(attempt.start_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="font-semibold text-emerald-600">{attempt.accuracy}% Acc</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
