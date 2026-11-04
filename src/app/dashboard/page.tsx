"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

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
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
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
        .limit(5);

      const { count: bookmarkCount } = await supabase
        .from("bookmarks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const completedAttempts = attempts?.filter((a) => a.status === "completed") || [];
      const totalAttempted = completedAttempts.reduce((s, a) => s + (a.total_questions || 0), 0);
      const totalCorrect = completedAttempts.reduce((s, a) => s + (a.score || 0), 0);
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      setStats({
        attempted: totalAttempted,
        correct: totalCorrect,
        tests: completedAttempts.length,
        bookmarks: bookmarkCount || 0,
        accuracy,
      });

      setRecentAttempts(attempts || []);
    });
  }, [router]);

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
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Across all exam modules</p>
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
                {stats.correct} correct out of {stats.attempted}
              </p>
            </div>
          </div>

          {/* Tile 3: Full Length Tests */}
          <div className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-xs text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Mock Tests Taken</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">{stats.tests}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Previous year full papers</p>
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
              <p className="text-[11px] text-gray-400 font-medium mt-0.5 group-hover:text-amber-700">Click to revise tricky MCQs &rarr;</p>
            </div>
          </Link>

        </div>

        {/* ========================================================= */}
        {/* QUICK ACTION HUB & STUDY ROADMAP                          */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Quick Practice Shortcuts (2 Cols on lg) */}
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
                  Pick up right where you left off. Practice chapter-wise MCQs, revise formula sheets, or simulate real exam conditions with timed PYQs.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/exams"
                    className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-gray-950 hover:bg-amber-300 shadow-md transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Practice Topic MCQs</span>
                  </Link>

                  <Link
                    href="/papers"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Attempt Full Paper</span>
                  </Link>

                  <Link
                    href="/notes"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
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
                    className="block w-full text-center rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
                  >
                    View VIP Plans &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* RECENT MOCK ATTEMPTS */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Recent Test History</h3>
                <Clock className="h-3.5 w-3.5 text-gray-400" />
              </div>

              {recentAttempts.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">No tests completed yet.</p>
                  <Link
                    href="/papers"
                    className="inline-block text-xs font-bold text-blue-600 hover:underline"
                  >
                    Attempt your first paper &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">
                          {attempt.previous_papers?.title || `Test #${attempt.id}`}
                        </p>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800">
                          {attempt.score} / {attempt.total_questions}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {new Date(attempt.start_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
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
