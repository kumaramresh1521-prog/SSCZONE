import Link from "next/link";
import { 
  BookOpen, 
  FileSpreadsheet, 
  Target, 
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Trophy,
  Keyboard,
  Clock,
  Layers,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Star,
  Flame,
  ChevronRight,
  Zap
} from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

interface ExamItem {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  subtitle?: string;
  is_active?: boolean | null;
  sort_order?: number | null;
}

// Fallback exams in case database is cold
const FALLBACK_EXAMS: ExamItem[] = [
  {
    id: 1,
    title: "SSC CGL",
    subtitle: "Combined Graduate Level (Tier 1 & Tier 2)",
    description: "Inspector (CGST/Examiner/PO), ASO (CSS/MEA/IB), Sub-Inspector (CBI), Tax Assistant & Group B/C Officers.",
    slug: "ssc-cgl",
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    title: "SSC CHSL",
    subtitle: "Combined Higher Secondary Level (10+2)",
    description: "Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), and Data Entry Operator (DEO).",
    slug: "ssc-chsl",
    is_active: false,
    sort_order: 2,
  },
  {
    id: 3,
    title: "SSC CPO",
    subtitle: "Central Police Organisation",
    description: "Sub-Inspector in Delhi Police and Central Armed Police Forces (CAPFs - BSF, CISF, CRPF, ITBP, SSB).",
    slug: "ssc-cpo",
    is_active: false,
    sort_order: 3,
  },
  {
    id: 9,
    title: "SSC MTS & Havaldar",
    subtitle: "Multi-Tasking Staff (10th Pass)",
    description: "General Central Service Group 'C' Non-Gazetted positions in central government ministries.",
    slug: "ssc-mts",
    is_active: false,
    sort_order: 4,
  },
  {
    id: 7,
    title: "SSC GD Constable",
    subtitle: "General Duty Constable",
    description: "Constable (GD) in BSF, CISF, CRPF, SSB, ITBP, Assam Rifles (AR), and SSF.",
    slug: "ssc-gd-constable",
    is_active: false,
    sort_order: 5,
  },
  {
    id: 4,
    title: "SSC Stenographer",
    subtitle: "Grade C & D Examination",
    description: "Stenographer posts in various Union Ministries, Departments, and attached offices.",
    slug: "ssc-stenographer",
    is_active: false,
    sort_order: 6,
  },
  {
    id: 8,
    title: "SSC Selection Post",
    subtitle: "Phase XII & Upcoming Phase XIII",
    description: "Matriculation, Higher Secondary, and Graduation level specialized regional vacancies.",
    slug: "ssc-selection-post",
    is_active: false,
    sort_order: 7,
  },
];

export default async function Home() {
  let allExams: ExamItem[] = FALLBACK_EXAMS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("exams")
      .select("id, title, slug, description, is_active, sort_order")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      allExams = data;
    }
  } catch {
    // Graceful fallback to static list
  }

  // Active exams (Live for practice)
  const activeExams = allExams.filter((e) => Boolean(e.is_active));
  
  // Flagship exam (SSC CGL primary)
  const flagshipExam = activeExams.find((e) => e.slug === "ssc-cgl" || e.title.toLowerCase().includes("cgl")) || activeExams[0] || FALLBACK_EXAMS[0];

  // Other active exams besides flagship
  const otherActiveExams = activeExams.filter((e) => e.id !== flagshipExam.id);

  // Inactive / Upcoming exams
  const upcomingExams = allExams.filter((e) => !e.is_active);

  const features = [
    {
      title: "Notification Syllabus Aligned",
      desc: "Every question is mapped strictly to the official SSC notification syllabus. No out-of-syllabus distraction.",
      icon: Layers,
    },
    {
      title: "Standard Reference Questions",
      desc: "Curated from standard reference books and official previous year shifts with clear step-by-step explanations.",
      icon: BookOpen,
    },
    {
      title: "Bilingual Practice Mode",
      desc: "Switch between English and Hindi with a single tap. Formulas, mathematical symbols, and diagrams are preserved.",
      icon: BrainCircuit,
    },
    {
      title: "Timed Exam Simulations",
      desc: "Attempt official shift papers with live countdown timer, sectional navigation, and instant negative marking scorecards.",
      icon: Trophy,
    },
  ];

  const quickTools = [
    {
      title: "Previous Year Papers",
      desc: "Solve full-length official SSC CGL shift papers with live timer, question palette, and rank analysis.",
      href: "/papers?exam=cgl",
      icon: FileSpreadsheet,
      action: "Attempt Shift Papers",
    },
    {
      title: "25-Question Speed Drill",
      desc: "Rapid-fire 15-minute sectional tests to build high accuracy under time pressure.",
      href: "/speed-test",
      icon: Zap,
      action: "Start Speed Drill",
    },
    {
      title: "136-WPM Typing Test",
      desc: "Practice with the official exam keyboard console, word timer, backspace lock, and error calculator.",
      href: "/typing",
      icon: Keyboard,
      action: "Open Typing Console",
    },
  ];

  const faqs = [
    {
      q: "Which exam is SSCZone currently focused on?",
      a: "SSCZone is currently laser-focused on SSC CGL 2026 (both Tier 1 and Tier 2). All subject modules, previous year shift papers, 100-Question mock tests, and typing modules are ready for immediate practice. Other SSC exams (CHSL, CPO, MTS, GD) will be activated progressively as verified shift question series are published.",
    },
    {
      q: "Are the questions based on the latest 2026 SSC pattern?",
      a: "Yes. All questions and test sets are organized strictly around official SSC shift questions and standard reference material.",
    },
    {
      q: "Can I practice in Hindi as well as English?",
      a: "Yes. Every question has bilingual support. You can view questions in English, Hindi, or dual bilingual mode anytime.",
    },
    {
      q: "Is SSCZone free to use?",
      a: "Yes. All chapter-wise MCQs, previous year shift papers, speed drills, and candidate tools are open and free for aspirants.",
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 font-sans antialiased">

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 md:pt-16 md:pb-20 px-4 w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Target Exam Focus Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 text-xs font-bold text-blue-900 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>Target Exam: SSC CGL 2026 (Tier 1 & Tier 2) Dedicated Practice</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Crack SSC CGL 2026,{" "}
            <span className="text-blue-600">Topic by Topic</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Master syllabus-mapped MCQs from standard reference books with instant explanations, attempt full 100-Question mock papers, and practice official previous year shift papers with live exam scorecards.
          </p>

          {/* Quick Hero Action CTAs */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <Link
              href={`/exams/${flagshipExam.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all"
            >
              <Target className="h-4 w-4" />
              <span>Start SSC CGL Practice</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/papers?exam=cgl"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 px-6 py-3.5 text-sm font-bold text-blue-900 transition-all shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <span>SSC CGL Shift Papers</span>
              <span className="rounded-full bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                2026 Live
              </span>
            </Link>

            <Link
              href="/speed-test"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all shadow-xs"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Speed Drills</span>
            </Link>
          </div>

          {/* Clean Metric Strip */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">10,000+</p>
              <p className="text-xs text-slate-500 mt-0.5">Topic MCQs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100+</p>
              <p className="text-xs text-slate-500 mt-0.5">CGL Shift Papers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">Bilingual</p>
              <p className="text-xs text-slate-500 mt-0.5">English & Hindi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100% Free</p>
              <p className="text-xs text-slate-500 mt-0.5">For All Aspirants</p>
            </div>
          </div>

        </div>
      </section>

      {/* Flagship SSC CGL Hero Showcase Card */}
      <section className="pt-10 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl border-2 border-blue-600/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          {/* Background Decorative Rings */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-black text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  PRIMARY FOCUS • 2026
                </span>
                <span className="rounded-full bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wide">
                  TIER 1 + TIER 2
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Live Practice & Full Test Series</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SSC Combined Graduate Level (SSC CGL)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                Inspector (CGST/Examiner/Preventive), ASO (CSS/MEA/IB), Sub-Inspector (CBI), Tax Assistant, and Group B & C Officer posts. Complete preparation coverage across Quantitative Aptitude, Reasoning, English, and General Awareness.
              </p>
            </div>

            {/* Direct Quick Action Modules inside CGL Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <Link
                href={`/exams/${flagshipExam.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    📚 Syllabus & Topics
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Math, English, GS & Reasoning
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Topics</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/papers?exam=cgl"
                className="group flex flex-col justify-between rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    📝 Shift Papers
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    100 Qs authentic official shifts
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Mock</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/speed-test"
                className="group flex flex-col justify-between rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    ⚡ 25 Qs Speed Drill
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    15-min high accuracy practice
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Speed Test</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/typing"
                className="group flex flex-col justify-between rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    ⌨️ Tier-2 Typing Test
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    136-WPM official console
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Typing Test</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Target SSC Exams Section (Live Active + Upcoming Roadmap) */}
      <section className="py-12 md:py-16 px-4 max-w-5xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              SSC Target Examinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active exams are open for practice. Upcoming exams are progressively unlocked as shift papers are curated.
            </p>
          </div>

          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View All Syllabi</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Other Active Exams (if admin activated any in addition to CGL) */}
        {otherActiveExams.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Also Live For Practice ({otherActiveExams.length})</span>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
              {otherActiveExams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Live Practice
                        </span>
                      </div>
                      {exam.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                          {exam.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Topics</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming SSC Exams Roadmap Container */}
        {upcomingExams.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Upcoming SSC Examinations • In Preparation ({upcomingExams.length})</span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Admin unlocks exams as verified question sets are added
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-slate-800">
                        {exam.title}
                      </span>
                      <span className="rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0">
                        ⏳ Launching Soon
                      </span>
                    </div>
                    {exam.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Curating shift questions</span>
                    <span className="font-semibold text-slate-500">Roadmap 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* Practice Modules & Tools */}
      <section className="bg-white py-16 md:py-20 border-y border-slate-200/80 px-4 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Preparation Modules
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Everything you need for daily MCQ drills, mock tests, and exam tools.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {quickTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{tool.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{tool.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/80">
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>{tool.action}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why SSCZone Section */}
      <section className="py-16 md:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Why Serious Aspirants Practice on SSCZone
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Designed to help you master accuracy, timing, and notification syllabus coverage.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white border-t border-slate-200/80 py-16 px-4 w-full max-w-full overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 pl-3 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-slate-900 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Start Your SSC CGL 2026 Preparation</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse syllabus-wise MCQs or attempt a full previous year question paper.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/exams/${flagshipExam.slug}`}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Start CGL Practice
            </Link>
            <Link
              href="/papers?exam=cgl"
              className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              CGL Shift Papers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
