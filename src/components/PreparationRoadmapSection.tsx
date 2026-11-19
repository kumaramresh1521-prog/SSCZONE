import Link from "next/link";
import {
  BookOpen,
  FileCheck2,
  Laptop,
  Keyboard,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function PreparationRoadmapSection() {
  const steps = [
    {
      step: "01",
      tag: "Foundation & Concepts",
      title: "Syllabus-Wise Topic Mastery",
      description:
        "Build rock-solid conceptual clarity across Quantitative Aptitude, Reasoning, English Comprehension, and General Awareness using standard NCERT and standard reference questions.",
      linkText: "Explore Syllabus Topics",
      href: "/exams",
      icon: BookOpen,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBg: "from-blue-500/10 to-indigo-500/5",
    },
    {
      step: "02",
      tag: "Official TCS Papers",
      title: "Shift-Wise Previous Year Questions",
      description:
        "Practice authentic 2023–2026 SSC CGL shift questions in real exam sequence with bilingual Hindi and English toggle, instant negative marking, and detailed explanations.",
      linkText: "Solve Shift Papers",
      href: "/papers?exam=cgl",
      icon: FileCheck2,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      accentBg: "from-indigo-500/10 to-purple-500/5",
    },
    {
      step: "03",
      tag: "Real Exam Hall Pressure",
      title: "Full-Length CBT Mock Test",
      description:
        "Experience the actual examination hall conditions with 60-minute countdown timer, TCS question palette (answered, marked for review), and granular accuracy reports.",
      linkText: "Attempt Full Mocks",
      href: "/mocks",
      icon: Laptop,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentBg: "from-emerald-500/10 to-teal-500/5",
    },
    {
      step: "04",
      tag: "Tier-2 Qualification",
      title: "Typing Test",
      description:
        "Master the mandatory CGL DEST typing test on the official keyboard layout with 15-minute timer, real-time error percentage, backspace toggle, and official evaluation rules.",
      linkText: "Open Typing Console",
      href: "/typing",
      icon: Keyboard,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBg: "from-amber-500/10 to-orange-500/5",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-700 border border-blue-200 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Proven 4-Stage Preparation Blueprint</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Structured Strategy to Crack SSC in First Attempt
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          A complete, step-by-step preparation framework built strictly around official Staff Selection Commission CBT standards.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br ${item.accentBg} bg-white p-7 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all duration-300 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black tracking-tight text-slate-300 group-hover:text-blue-600 transition-colors">
                    {item.step}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-2xs border border-slate-100 text-slate-800 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-semibold text-slate-400">100% Free</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Commitment Banner */}
      <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-200 border border-blue-400/30">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>SSCZone Aspirant Promise</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              100% Free Preparation — No Paywalls, No Subscriptions
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Every syllabus question, previous year shift paper, and typing test module is freely available to help serious aspirants clear SSC exams without financial barriers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/papers?exam=cgl"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              <span>Start Free Practice</span>
            </Link>
            <Link
              href="/typing"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all"
            >
              <Keyboard className="h-4 w-4 text-amber-400" />
              <span>2000 Depressions Test</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}