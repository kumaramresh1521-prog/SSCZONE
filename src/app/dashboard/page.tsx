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
  ExternalLink,
  FileSpreadsheet,
  Flame,
  History,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
  ArrowRight,
  Search,
  TrendingUp,
  Layers,
  ChevronRight,
  Filter,
  GraduationCap,
  Calendar,
  AlertCircle,
  HelpCircle,
  Activity,
  Gauge,
  Check,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
} from "lucide-react";
import {
  getUserAttempts,
  getUserCollectedQuestions,
  syncUserBookmarksWithSupabase,
  UserCollectedQuestion,
} from "@/lib/user-attempts-store";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    attempted: 0,
    correct: 0,
    tests: 0,
    bookmarks: 0,
    accuracy: 0,
    totalTimeSpentSeconds: 0,
  });

  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"all" | "speed_test" | "daily_quiz" | "mock_test">("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [targetExam, setTargetExam] = useState("SSC CGL 2026");
  const [recentBookmarks, setRecentBookmarks] = useState<UserCollectedQuestion[]>([]);

  const router = useRouter();

  // Load saved target exam preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ssczone_user_target_exam");
        if (saved) setTargetExam(saved);
      } catch {}
    }
  }, []);

  function handleTargetExamChange(newExam: string) {
    setTargetExam(newExam);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ssczone_user_target_exam", newExam);
      } catch {}
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return router.replace("/login");
      setUser(user);

      try {
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
          .limit(30);

        // Background sync offline bookmarks with cloud
        await syncUserBookmarksWithSupabase().catch(() => {});

        // 1. Fetch genuine database bookmarks with question and topic joins (or direct question_data)
        const { data: dbBookmarks, count: bookmarkCount } = await supabase
          .from("bookmarks")
          .select("id, tag, created_at, question_id, question_data, questions(id, question_text, topic_id, option_a, option_b, option_c, option_d, correct_answer, topics(title, subjects(title)))", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        // 2. Read local attempts and collections
        const localAttempts = getUserAttempts();
        const localCollected = getUserCollectedQuestions();

        // 3. Normalize DB bookmarks
        const normalizedDbBookmarks: UserCollectedQuestion[] = (dbBookmarks || []).map((bm: any) => {
          const qd = bm.question_data;
          const q = bm.questions;
          return {
            id: `bm_${bm.id}`,
            questionId: bm.question_id || undefined,
            source: (qd?.source || "bank") as "speed_test" | "daily_quiz" | "pyq" | "bank",
            sourceTitle: q?.topics?.title || qd?.sourceTitle || "Practice Question",
            subject: q?.topics?.subjects?.title?.trim() || qd?.subject || "General",
            topic: q?.topics?.title || qd?.topic || "Practice Question",
            question_text: q?.question_text || qd?.question_text || `Question #${bm.question_id || bm.id}`,
            option_a: q?.option_a || qd?.option_a || "",
            option_b: q?.option_b || qd?.option_b || "",
            option_c: q?.option_c || qd?.option_c || "",
            option_d: q?.option_d || qd?.option_d || "",
            correct_answer: (q?.correct_answer || qd?.correct_answer || "A") as "A" | "B" | "C" | "D",
            tag: bm.tag || "Standard",
            collectedAt: bm.created_at || new Date().toISOString(),
          };
        });

        // 4. Merge bookmarks without duplicates (DB bookmarks take priority)
        const seenQuestionIds = new Set<number>();
        const seenTexts = new Set<string>();
        const mergedBookmarks: UserCollectedQuestion[] = [];

        for (const item of normalizedDbBookmarks) {
          if (item.questionId) seenQuestionIds.add(item.questionId);
          seenTexts.add(item.question_text.trim());
          mergedBookmarks.push(item);
        }

        for (const item of localCollected) {
          const hasId = item.questionId && seenQuestionIds.has(item.questionId);
          const hasText = seenTexts.has(item.question_text.trim());
          if (!hasId && !hasText) {
            mergedBookmarks.push(item);
            if (item.questionId) seenQuestionIds.add(item.questionId);
            seenTexts.add(item.question_text.trim());
          }
        }

        setRecentBookmarks(mergedBookmarks.slice(0, 3));

        // Normalize local attempts (Speed Tests and Daily Quizzes)
        const normalizedLocal = localAttempts.map((la) => ({
          id: la.id,
          type: la.type,
          title: la.title,
          subject: la.subject || "General",
          score: la.score,
          maxScore: la.maxScore || la.totalQuestions * 2,
          total_questions: la.totalQuestions,
          attempted: la.attempted ?? la.totalQuestions,
          correct: la.correct,
          incorrect: la.incorrect,
          unattempted: la.unattempted,
          accuracy: la.accuracy,
          timeSpentSeconds: la.timeSpentSeconds || 0,
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
          attempted: ra.total_questions || 100,
          correct: Math.round((ra.score || 0) / 2),
          incorrect: Math.max(0, (ra.total_questions || 100) - Math.round((ra.score || 0) / 2)),
          unattempted: 0,
          accuracy: ra.total_questions
            ? Math.round(((ra.score || 0) / ((ra.total_questions || 100) * 2)) * 100)
            : 0,
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
        const totalTimeSpent = mergedAttempts.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);
        const totalBookmarks = Math.max(bookmarkCount || 0, mergedBookmarks.length);

        setStats({
          attempted: totalAttempted,
          correct: totalCorrect,
          tests: mergedAttempts.length,
          bookmarks: totalBookmarks,
          accuracy,
          totalTimeSpentSeconds: totalTimeSpent,
        });

        setAllAttempts(mergedAttempts);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  // Filter attempts based on tab & search text
  const filteredAttempts = useMemo(() => {
    let list = allAttempts;
    if (activeHistoryTab !== "all") {
      list = list.filter((a) => a.type === activeHistoryTab);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAttempts, activeHistoryTab, searchFilter]);

  // Format seconds to human readable
  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0m";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // ── 1. DYNAMIC SECTIONAL MASTERY MATRIX ──
  const sectionalAnalytics = useMemo(() => {
    const subjects = {
      quant: {
        name: "Quantitative Aptitude (Maths)",
        code: "quant",
        tag: "Calculation & Formula",
        barColor: "bg-amber-500",
        textColor: "text-amber-600",
        bgLight: "bg-amber-50",
        borderLight: "border-amber-200",
        weight: "25 Qs • 50 Marks",
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      reasoning: {
        name: "General Intelligence & Reasoning",
        code: "reasoning",
        tag: "High Scoring Booster",
        barColor: "bg-emerald-500",
        textColor: "text-emerald-600",
        bgLight: "bg-emerald-50",
        borderLight: "border-emerald-200",
        weight: "25 Qs • 50 Marks",
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      english: {
        name: "English Comprehension",
        code: "english",
        tag: "Speed & Accuracy Booster",
        barColor: "bg-indigo-600",
        textColor: "text-indigo-600",
        bgLight: "bg-indigo-50",
        borderLight: "border-indigo-200",
        weight: "25 Qs • 50 Marks",
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
      ga: {
        name: "General Awareness (GK / GS)",
        code: "ga",
        tag: "Rank & Cutoff Decider",
        barColor: "bg-blue-600",
        textColor: "text-blue-600",
        bgLight: "bg-blue-50",
        borderLight: "border-blue-200",
        weight: "25 Qs • 50 Marks",
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      },
    };

    allAttempts.forEach((att) => {
      const q = att.total_questions || att.attempted || 0;
      const c = att.correct || 0;
      const inc = att.incorrect || Math.max(0, q - c);
      const sub = (att.subject || "").toLowerCase();

      if (att.type === "mock_test" || sub.includes("full") || sub.includes("shift") || sub.includes("paper")) {
        // Distribute full shift mocks equally across all 4 sections
        const qPerSub = Math.round(q / 4);
        const cPerSub = Math.round(c / 4);
        const incPerSub = Math.round(inc / 4);
        Object.values(subjects).forEach((s) => {
          s.attempted += qPerSub;
          s.correct += cPerSub;
          s.incorrect += incPerSub;
        });
      } else if (sub.includes("math") || sub.includes("quant") || sub.includes("aptitude") || sub.includes("arithmetic")) {
        subjects.quant.attempted += q;
        subjects.quant.correct += c;
        subjects.quant.incorrect += inc;
      } else if (sub.includes("reason") || sub.includes("intelligence") || sub.includes("gi") || sub.includes("logic")) {
        subjects.reasoning.attempted += q;
        subjects.reasoning.correct += c;
        subjects.reasoning.incorrect += inc;
      } else if (sub.includes("english") || sub.includes("vocab") || sub.includes("comprehension") || sub.includes("grammar")) {
        subjects.english.attempted += q;
        subjects.english.correct += c;
        subjects.english.incorrect += inc;
      } else if (sub.includes("gk") || sub.includes("gs") || sub.includes("aware") || sub.includes("general") || sub.includes("science") || sub.includes("history") || sub.includes("polity")) {
        subjects.ga.attempted += q;
        subjects.ga.correct += c;
        subjects.ga.incorrect += inc;
      } else {
        // Mixed quiz: distribute evenly
        const qPerSub = Math.round(q / 4);
        const cPerSub = Math.round(c / 4);
        const incPerSub = Math.round(inc / 4);
        Object.values(subjects).forEach((s) => {
          s.attempted += qPerSub;
          s.correct += cPerSub;
          s.incorrect += incPerSub;
        });
      }
    });

    return Object.values(subjects).map((s) => {
      const accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
      let status = {
        label: "Not Attempted",
        color: "text-slate-500 bg-slate-100 border-slate-200",
        advice: "Take 10 Qs diagnostic",
      };
      if (s.attempted > 0) {
        if (accuracy >= 75) {
          status = {
            label: "🔥 Strong Zone",
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            advice: "Top Tier Performance",
          };
        } else if (accuracy >= 55) {
          status = {
            label: "⚡ Scope for Growth",
            color: "text-amber-700 bg-amber-50 border-amber-200",
            advice: "Formula revision needed",
          };
        } else {
          status = {
            label: "⚠️ High Priority",
            color: "text-rose-700 bg-rose-50 border-rose-200",
            advice: "Focus on basics & errors",
          };
        }
      }
      return {
        ...s,
        accuracy,
        status,
      };
    });
  }, [allAttempts]);

  // ── 2. CBT SPEED, TIME & NEGATIVE MARKING RADAR ──
  const speedAndPenaltyAnalytics = useMemo(() => {
    const totalAttempted = stats.attempted;
    const totalCorrect = stats.correct;
    const totalIncorrect = Math.max(0, totalAttempted - totalCorrect);
    const avgSecondsPerQ = totalAttempted > 0 ? Math.round(stats.totalTimeSpentSeconds / totalAttempted) : 0;

    // SSC CGL Tier-1 Benchmark is 36 seconds per question (100 Qs in 60 mins)
    const idealPace = 36;
    let paceBadge = { label: "No Data", color: "text-slate-500 bg-slate-100" };
    if (avgSecondsPerQ > 0) {
      if (avgSecondsPerQ <= 40) {
        paceBadge = { label: "⚡ Fast & Exam Ready", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
      } else if (avgSecondsPerQ <= 60) {
        paceBadge = { label: "⏱️ Balanced Pace", color: "text-blue-700 bg-blue-50 border border-blue-200" };
      } else {
        paceBadge = { label: "⚠️ Needs Speed Drills", color: "text-amber-700 bg-amber-50 border border-amber-200" };
      }
    }

    // Negative penalty: In SSC, each wrong answer deducts 0.50 marks
    const penaltyLost = Number((totalIncorrect * 0.5).toFixed(1));
    const grossMarks = totalCorrect * 2;
    const netMarks = Math.max(0, grossMarks - penaltyLost);
    const efficiency = grossMarks > 0 ? Math.round((netMarks / grossMarks) * 100) : 0;

    return {
      avgSecondsPerQ,
      idealPace,
      paceBadge,
      totalIncorrect,
      penaltyLost,
      grossMarks,
      netMarks,
      efficiency,
    };
  }, [stats]);

  // ── 3. EXAM READINESS INDEX & CUTOFF ZONE ──
  const readinessAnalytics = useMemo(() => {
    const examCutoffs: Record<string, { cutoff: number; totalMarks: number }> = {
      "SSC CGL 2026": { cutoff: 142, totalMarks: 200 },
      "SSC CHSL 2026": { cutoff: 148, totalMarks: 200 },
      "SSC CPO 2026": { cutoff: 128, totalMarks: 200 },
      "SSC MTS & Havaldar": { cutoff: 125, totalMarks: 150 },
      "SSC GD Constable": { cutoff: 132, totalMarks: 160 },
    };

    const targetConfig = examCutoffs[targetExam] || { cutoff: 140, totalMarks: 200 };
    const hasData = stats.attempted >= 5;

    // Projected standard Tier-1 score based on current accuracy
    const simulatedQuestions = targetConfig.totalMarks === 150 ? 75 : 100;
    const projectedCorrect = Math.round((stats.accuracy / 100) * simulatedQuestions);
    const projectedWrong = simulatedQuestions - projectedCorrect;
    const projectedRawScore = hasData
      ? Math.max(0, Math.round(projectedCorrect * 2 - projectedWrong * 0.5))
      : 0;

    const gapToCutoff = projectedRawScore - targetConfig.cutoff;
    const readinessPercent = hasData
      ? Math.min(100, Math.round((projectedRawScore / targetConfig.cutoff) * 100))
      : 0;

    let zone = {
      label: "Diagnostic Pending",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      description: "Attempt at least 5 questions to generate your Tier-1 Cutoff Projection.",
    };

    if (hasData) {
      if (projectedRawScore >= targetConfig.cutoff) {
        zone = {
          label: "🟢 Safe Selection Zone",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
          description: `Projected score (+${gapToCutoff} above cutoff). Keep practicing mocks to maintain raw speed!`,
        };
      } else if (gapToCutoff >= -20) {
        zone = {
          label: "🟡 Competitive Borderline",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
          description: `Only ${Math.abs(gapToCutoff)} marks away from clearing cutoff. Reducing negative marking will push you into safe zone.`,
        };
      } else {
        zone = {
          label: "🔴 Foundation Stage",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
          description: `Focus on high-weightage topics and basic concept revision to boost accuracy above 65%.`,
        };
      }
    }

    return {
      hasData,
      targetCutoff: targetConfig.cutoff,
      totalMarks: targetConfig.totalMarks,
      projectedRawScore,
      gapToCutoff,
      readinessPercent,
      zone,
    };
  }, [stats, targetExam]);

  // ── 4. 7-DAY CONSISTENCY & LEARNING STREAK ──
  const consistencyAnalytics = useMemo(() => {
    const days: { dayName: string; dateStr: string; questions: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3); // Mon, Tue...
      days.push({ dayName, dateStr, questions: 0 });
    }

    allAttempts.forEach((att) => {
      if (!att.start_time) return;
      const attDate = new Date(att.start_time).toISOString().split("T")[0];
      const match = days.find((d) => d.dateStr === attDate);
      if (match) {
        match.questions += att.total_questions || att.attempted || 0;
      }
    });

    const activeDaysCount = days.filter((d) => d.questions > 0).length;
    const maxQsInDay = Math.max(1, ...days.map((d) => d.questions));

    return {
      days,
      activeDaysCount,
      maxQsInDay,
    };
  }, [allAttempts]);

  // ── 5. AI SMART ACTION PLAN RECOMMENDATION ──
  const smartRecommendation = useMemo(() => {
    const attemptedSubjects = sectionalAnalytics.filter((s) => s.attempted > 0);
    const unattemptedSubjects = sectionalAnalytics.filter((s) => s.attempted === 0);

    if (unattemptedSubjects.length > 0) {
      const target = unattemptedSubjects[0];
      return {
        type: "diagnostic",
        title: `Take a 10 Qs Diagnostic in ${target.name}`,
        desc: `You haven't attempted any questions in ${target.name} yet. Complete a quick drill to map your baseline readiness.`,
        ctaText: `Start ${target.name.split(" ")[0]} Drill`,
        ctaLink: `/speed-test?subject=${target.code}`,
        tag: "Diagnostic Gap",
      };
    }

    if (attemptedSubjects.length > 0) {
      const weakest = [...attemptedSubjects].sort((a, b) => a.accuracy - b.accuracy)[0];
      if (weakest.accuracy < 65) {
        return {
          type: "weakness",
          title: `Focus on ${weakest.name} (Current Accuracy: ${weakest.accuracy}%)`,
          desc: `Your lowest accuracy is in ${weakest.name}. Practicing targeted topic tests can prevent 8-12 marks loss in Tier-1.`,
          ctaText: `Practice ${weakest.name.split(" ")[0]} Drills`,
          ctaLink: `/speed-test?subject=${weakest.code}`,
          tag: "High Priority Recovery",
        };
      }
    }

    if (stats.bookmarks > 0) {
      return {
        type: "bookmark",
        title: `Revise ${stats.bookmarks} Saved Question Flashcards`,
        desc: `You have ${stats.bookmarks} bookmarked questions. Reviewing them builds retention for tricky exam traps.`,
        ctaText: "Open Bookmark Revision",
        ctaLink: "/dashboard/bookmarks",
        tag: "Retention Booster",
      };
    }

    return {
      type: "speed",
      title: "Boost Your Exam Pace with a Full PYQ Shift",
      desc: "Attempt real SSC previous year papers under standard 60-minute exam timer conditions to build CBT muscle memory.",
      ctaText: "Launch PYQ Shift Mock",
      ctaLink: "/papers",
      tag: "Mock Stamina",
    };
  }, [sectionalAnalytics, stats.bookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const candidateName = profile?.full_name || user.email?.split("@")[0] || "Aspirant";
  const initials = candidateName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-16">
      
      {/* ========================================================= */}
      {/* 1. TOP HERO HEADER (Modern & Sleek)                       */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-slate-200/90 pt-8 pb-8 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle decorative gradient glow */}
        <div className="pointer-events-none absolute -top-24 right-10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-10 left-1/3 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* Candidate Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
                {initials}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    <span>Student Dashboard</span>
                  </span>

                  {subscription ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>VIP Member</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                      <span>SSC Aspirant</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>Consistent Learner</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {greeting}, {candidateName} 👋
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {user.email} • Track your speed, sectional accuracy & bookmark revisions.
                </p>
              </div>
            </div>

            {/* Target Exam Switcher & Settings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs">
                <Target className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-slate-400 font-normal hidden sm:inline">Exam:</span>
                <select
                  value={targetExam}
                  onChange={(e) => handleTargetExamChange(e.target.value)}
                  className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
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
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all shadow-xs"
                title="Account Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT                                 */}
      {/* ========================================================= */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        
        {/* 5 KEY METRIC TILES */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Tile 1: Questions Practiced */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Solved Qs</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.attempted.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Questions Attempted
              </p>
            </div>
          </div>

          {/* Tile 2: Overall Accuracy */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Accuracy</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className={`text-2xl sm:text-3xl font-black tracking-tight ${
                stats.accuracy >= 75 ? "text-emerald-600" : stats.accuracy >= 50 ? "text-amber-600" : "text-slate-900"
              }`}>
                {stats.accuracy}%
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {stats.correct} correct of {stats.attempted}
              </p>
            </div>
          </div>

          {/* Tile 3: Total Tests Taken */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Tests</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.tests}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Tests & Quizzes Taken
              </p>
            </div>
          </div>

          {/* Tile 4: Practice Time Invested */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Time Invested</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatTime(stats.totalTimeSpentSeconds)}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Practice Duration
              </p>
            </div>
          </div>

          {/* Tile 5: Saved Bookmarks */}
          <Link
            href="/dashboard/bookmarks"
            className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 group-hover:text-amber-800">Bookmarks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center">
                <Bookmark className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                {stats.bookmarks}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 group-hover:text-amber-700">
                Revise Collected MCQs &rarr;
              </p>
            </div>
          </Link>

        </div>

        {/* ========================================================= */}
        {/* 3. HERO ACTION ROADMAP & RIGHT PANEL                      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Quick Launch Hub, Sectional Focus, Attempts History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SPEED TEST & EXAM QUICK LAUNCH CARD */}
            <div className="rounded-3xl border border-blue-900/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-7 text-white relative overflow-hidden shadow-lg">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl" />

              <div className="space-y-4 relative z-10 text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-black text-amber-300">
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>TARGET TEST: {targetExam}</span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Fast-Track Your SSC Preparation
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-xl">
                    Take instant speed tests with user-based questions, practice daily free quizzes, or attempt PYQ shift papers from latest 2026 papers.
                  </p>
                </div>

                {/* 4 Launch Tiles */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <Link
                    href="/speed-test"
                    className="flex flex-col items-start p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-950/10 flex items-center justify-center mb-2">
                      <Zap className="h-4 w-4 fill-current text-slate-950" />
                    </div>
                    <span className="text-xs font-black">Speed Test</span>
                    <span className="text-[10px] text-slate-800 font-semibold">15m / 20s Blitz</span>
                  </Link>

                  <Link
                    href="/daily-quiz"
                    className="flex flex-col items-start p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-2">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </div>
                    <span className="text-xs font-black">Daily Quiz</span>
                    <span className="text-[10px] text-blue-100 font-semibold">Free 10 Qs</span>
                  </Link>

                  <Link
                    href="/papers"
                    className="flex flex-col items-start p-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
                    </div>
                    <span className="text-xs font-black">PYQ Papers</span>
                    <span className="text-[10px] text-blue-200">50 Real Shifts</span>
                  </Link>

                  <Link
                    href="/dashboard/bookmarks"
                    className="flex flex-col items-start p-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                      <Bookmark className="h-4 w-4 text-amber-300" />
                    </div>
                    <span className="text-xs font-black">Bookmarks</span>
                    <span className="text-[10px] text-blue-200">{stats.bookmarks} Saved MCQs</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* ASPIRANT INTELLIGENCE & PERFORMANCE ANALYTICS HUB       */}
            {/* ========================================================= */}
            <div className="space-y-6">

              {/* ROW 1: EXAM READINESS INDEX & CBT SPEED / NEGATIVE MARKING RADAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CARD 1: Exam Readiness Index (ERI) & Cutoff Zone Benchmark */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs text-left space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Tier-1 Exam Readiness Index
                          </h3>
                          <p className="text-[11px] text-slate-500">{targetExam} Cutoff Benchmark</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${readinessAnalytics.zone.badgeClass}`}>
                        {readinessAnalytics.zone.label}
                      </span>
                    </div>

                    {readinessAnalytics.hasData ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                              {readinessAnalytics.projectedRawScore}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {" "}/ {readinessAnalytics.totalMarks} Projected Raw Marks
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-500">
                              UR Cutoff Target: <strong>{readinessAnalytics.targetCutoff}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Cutoff Distance Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>Readiness Level</span>
                            <span>{readinessAnalytics.readinessPercent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                readinessAnalytics.projectedRawScore >= readinessAnalytics.targetCutoff
                                  ? "bg-emerald-500"
                                  : readinessAnalytics.gapToCutoff >= -20
                                  ? "bg-amber-500"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, readinessAnalytics.readinessPercent))}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {readinessAnalytics.zone.description}
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2">
                        <Award className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-600 font-bold">Live Cutoff Projection Pending</p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Attempt at least 5 questions to project your score against {targetExam} (Cutoff: {readinessAnalytics.targetCutoff} marks).
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Based on real test accuracy & penalties</span>
                    <Link
                      href="/papers"
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Full Mock Paper</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* CARD 2: CBT Speed & Negative Marking Radar */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs text-left space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Gauge className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            CBT Speed & Negative Marks Radar
                          </h3>
                          <p className="text-[11px] text-slate-500">Tier-1 60-Minute Benchmark</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${speedAndPenaltyAnalytics.paceBadge.color}`}>
                        {speedAndPenaltyAnalytics.paceBadge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Metric A: Average Question Pace */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Avg Question Pace</span>
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                          {speedAndPenaltyAnalytics.avgSecondsPerQ > 0 ? `${speedAndPenaltyAnalytics.avgSecondsPerQ}s` : "—"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Ideal CBT Target: <strong>36s / Q</strong>
                        </p>
                      </div>

                      {/* Metric B: Negative Marking Penalty */}
                      <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-rose-700 font-medium">
                          <span>Negative Lost</span>
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-rose-600">
                          -{speedAndPenaltyAnalytics.penaltyLost}
                        </p>
                        <p className="text-[10px] text-rose-700/80">
                          From {speedAndPenaltyAnalytics.totalIncorrect} wrong answers (-0.50 each)
                        </p>
                      </div>
                    </div>

                    {/* Net Scoring Efficiency */}
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-blue-900">Net Scoring Efficiency</span>
                        <p className="text-[10px] text-blue-700">Gross points retained after negative deductions</p>
                      </div>
                      <span className="text-sm font-black text-blue-800">
                        {speedAndPenaltyAnalytics.efficiency}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tip: Skipping low-confidence Qs protects cutoff rank</span>
                    <Link
                      href="/speed-test"
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Speed Blitz</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* ROW 2: DYNAMIC SECTIONAL MASTERY MATRIX (Live Data across 4 Subjects) */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Dynamic Sectional Mastery Matrix
                      </h3>
                      <p className="text-[11px] text-slate-500">Live accuracy & practice status calculated from your attempts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      Live Diagnostics
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {sectionalAnalytics.map((sec) => (
                    <div
                      key={sec.code}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {sec.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">{sec.weight}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${sec.status.color}`}>
                          {sec.status.label}
                        </span>
                      </div>

                      {/* Accuracy & Counts */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            {sec.attempted > 0 ? (
                              <span>
                                <strong>{sec.correct}</strong> of {sec.attempted} Qs correct
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">0 questions solved yet</span>
                            )}
                          </span>
                          <span className={`font-black ${sec.attempted > 0 ? sec.textColor : "text-slate-400"}`}>
                            {sec.attempted > 0 ? `${sec.accuracy}% Accuracy` : "—"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sec.barColor} transition-all duration-500`}
                            style={{ width: `${sec.attempted > 0 ? Math.max(5, sec.accuracy) : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 text-[10px] font-medium">{sec.tag}</span>
                        <Link
                          href={`/speed-test?subject=${sec.code}`}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Practice Drills</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 3: AI SMART ACTION RECOMMENDATION & 7-DAY CONSISTENCY ACTIVITY */}
              <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  
                  {/* Left: AI Smart Recommendation */}
                  <div className="space-y-2 max-w-lg text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
                        Smart Study Recommendation
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                        {smartRecommendation.tag}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {smartRecommendation.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {smartRecommendation.desc}
                    </p>

                    <div className="pt-1">
                      <Link
                        href={smartRecommendation.ctaLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-colors"
                      >
                        <span>{smartRecommendation.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Right: 7-Day Consistency Tracker */}
                  <div className="rounded-2xl border border-blue-200/70 bg-white/90 p-4 shrink-0 space-y-2.5 text-left w-full md:w-auto min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>7-Day Consistency</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {consistencyAnalytics.activeDaysCount}/7 Days Active
                      </span>
                    </div>

                    {/* 7-Day Mini Bar Graph */}
                    <div className="flex items-end justify-between gap-1.5 pt-1 h-16">
                      {consistencyAnalytics.days.map((d, idx) => {
                        const heightPct = d.questions > 0
                          ? Math.max(25, Math.round((d.questions / consistencyAnalytics.maxQsInDay) * 100))
                          : 12;
                        const isActive = d.questions > 0;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                            <div className="h-10 w-full flex items-end justify-center">
                              <div
                                className={`w-full max-w-[18px] rounded-t-md transition-all ${
                                  isActive ? "bg-blue-600" : "bg-slate-200"
                                }`}
                                style={{ height: `${heightPct}%` }}
                                title={`${d.dateStr}: ${d.questions} Questions`}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${isActive ? "text-blue-700" : "text-slate-400"}`}>
                              {d.dayName}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                      <span>Daily Practice Rhythm</span>
                      <span className="font-bold text-slate-700">
                        {consistencyAnalytics.days.reduce((acc, d) => acc + d.questions, 0)} Qs this week
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* FULL-DETAIL PRACTICE & TEST ATTEMPTS HISTORY */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    <span>In-Detail Practice & Test Attempts History</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live score cards, speed metrics, accuracy & question-by-question breakdown.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto shrink-0">
                  <button
                    onClick={() => setActiveHistoryTab("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activeHistoryTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({allAttempts.length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("speed_test")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activeHistoryTab === "speed_test" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-amber-800"
                    }`}
                  >
                    ⚡ Speed ({allAttempts.filter((a) => a.type === "speed_test").length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("daily_quiz")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activeHistoryTab === "daily_quiz" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-blue-800"
                    }`}
                  >
                    🎯 Quizzes ({allAttempts.filter((a) => a.type === "daily_quiz").length})
                  </button>
                  <button
                    onClick={() => setActiveHistoryTab("mock_test")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activeHistoryTab === "mock_test" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-800"
                    }`}
                  >
                    📄 PYQs ({allAttempts.filter((a) => a.type === "mock_test").length})
                  </button>
                </div>
              </div>

              {/* Search attempts */}
              {allAttempts.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search attempts by title, subject or exam..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {filteredAttempts.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">No attempts found in this selection.</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Take a 15-minute speed test or daily quiz to record your speed, sectional accuracy, and score history.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2.5">
                    <Link
                      href="/speed-test"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      ⚡ Start Speed Test
                    </Link>
                    <Link
                      href="/daily-quiz"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      🎯 Daily Free Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {filteredAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-white p-4 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            att.type === "speed_test"
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : att.type === "daily_quiz"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {att.type === "speed_test" ? (
                            <Zap className="h-4 w-4" />
                          ) : att.type === "daily_quiz" ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {att.type === "speed_test"
                                ? "Speed Test"
                                : att.type === "daily_quiz"
                                ? "Daily Quiz"
                                : "PYQ Shift"}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {new Date(att.start_time).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                            {att.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                            <span>
                              Questions: <strong>{att.total_questions}</strong>
                            </span>
                            {att.timeSpentSeconds > 0 && (
                              <span>
                                Time: <strong>{formatTime(att.timeSpentSeconds)}</strong>
                              </span>
                            )}
                            {att.subject && (
                              <span>
                                Subject: <strong>{att.subject}</strong>
                              </span>
                            )}
                            {att.correct !== undefined && (
                              <span className="text-emerald-700 font-semibold">
                                ✓ {att.correct} Correct
                              </span>
                            )}
                            {att.incorrect !== undefined && att.incorrect > 0 && (
                              <span className="text-rose-600 font-semibold">
                                ✗ {att.incorrect} Wrong
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score & Accuracy Badges */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-black text-slate-900">
                            {att.score}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              / {att.maxScore} Marks
                            </span>
                          </div>
                          <div className="text-[11px] font-bold mt-0.5">
                            <span
                              className={
                                att.accuracy >= 75
                                  ? "text-emerald-600"
                                  : att.accuracy >= 50
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }
                            >
                              {att.accuracy}% Accuracy
                            </span>
                          </div>
                        </div>

                        <Link
                          href={
                            att.type === "speed_test"
                              ? "/speed-test"
                              : att.type === "daily_quiz"
                              ? "/daily-quiz"
                              : "/papers"
                          }
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
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

          {/* Right Column: Bookmarks Widget, Membership, Aspirant Toolkit */}
          <div className="space-y-6">
            
            {/* 1. RECENT BOOKMARKS / SAVED MCQS WIDGET */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Saved Questions
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {stats.bookmarks} Total
                </span>
              </div>

              {recentBookmarks.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Bookmark className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    No questions bookmarked yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click the bookmark icon in any Speed Test or Daily Quiz to save tricky questions for revision.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentBookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1 hover:border-amber-200 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                          {bm.tag || "Standard"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {bm.subject || "General"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 line-clamp-2">
                        {bm.question_text}
                      </p>
                    </div>
                  ))}

                  <Link
                    href="/dashboard/bookmarks"
                    className="block w-full text-center rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-black text-white shadow-xs transition-colors"
                  >
                    Open Revision Flashcards ({stats.bookmarks}) &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* 2. MEMBERSHIP CARD (Visible only if an active subscription exists; upgrade CTA paused until official launch) */}
            {subscription && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-left space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Plan & Subscription
                  </h3>
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active VIP Membership</span>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-emerald-950">
                      {subscription.packages?.title || "SSC Pass Pro"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Valid till{" "}
                      {new Date(subscription.expires_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ASPIRANT TOOLKIT SHORTCUTS */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  SSC Aspirant Toolkit
                </h3>
                <GraduationCap className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: "Photo & Signature Resizer",
                    desc: "Format for SSC CGL & CHSL",
                    href: "/toolkit/photo-resizer",
                  },
                  {
                    name: "Age & Eligibility Calculator",
                    desc: "Calculate cutoff age accurately",
                    href: "/toolkit/age-calculator",
                  },
                  {
                    name: "Rank & Marks Predictor",
                    desc: "Tier-1 & Tier-2 normalization",
                    href: "/toolkit/rank-predictor",
                  },
                  {
                    name: "English & Hindi Typing Test",
                    desc: "CPT 35 WPM timed practice test",
                    href: "/typing",
                  },
                ].map((tool, idx) => (
                  <Link
                    key={idx}
                    href={tool.href}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{tool.desc}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
