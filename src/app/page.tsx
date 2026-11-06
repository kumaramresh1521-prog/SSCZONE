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
  Sparkles
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSCZone — Syllabus-Wise MCQ Practice & Test Series Portal",
  description: "Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant solutions.",
};

export default function Home() {
  const targetExams = [
    {
      name: "SSC CGL",
      subtitle: "Combined Graduate Level (Tier 1 & Tier 2)",
      desc: "Inspector, ASO, Tax Assistant and Group B & C Officer posts.",
      href: "/exams/ssc-cgl",
    },
    {
      name: "SSC CHSL",
      subtitle: "Combined Higher Secondary Level (10+2)",
      desc: "Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), and DEO.",
      href: "/exams/ssc-chsl",
    },
    {
      name: "SSC CPO",
      subtitle: "Central Police Organisation",
      desc: "Sub-Inspector in Delhi Police and Central Armed Police Forces (CAPFs).",
      href: "/exams/ssc-cpo",
    },
    {
      name: "SSC MTS & Havaldar",
      subtitle: "Multi-Tasking Staff",
      desc: "General Central Service Group 'C' Non-Gazetted and Non-Ministerial positions.",
      href: "/exams/ssc-mts",
    },
    {
      name: "SSC GD Constable",
      subtitle: "General Duty Constable",
      desc: "Constable posts in BSF, CISF, CRPF, SSB, ITBP, AR, and SSF.",
      href: "/exams/ssc-gd",
    },
    {
      name: "SSC Stenographer",
      subtitle: "Grade C & D Examination",
      desc: "Stenographer posts in various Union Ministries and Departments.",
      href: "/exams/ssc-steno",
    },
  ];

  const features = [
    {
      title: "Notification Syllabus Aligned",
      desc: "Every question is mapped strictly to the official SSC exam notification syllabus. No out-of-syllabus distraction.",
      icon: Layers,
    },
    {
      title: "Standard Reference Questions",
      desc: "Curated from standard reference books and official previous year shifts with clear step-by-step explanations.",
      icon: BookOpen,
    },
    {
      title: "Bilingual Practice Mode",
      desc: "Switch between English and Hindi with a single tap. Formulas, symbols, and mathematical steps are preserved.",
      icon: BrainCircuit,
    },
    {
      title: "Timed Exam Simulations",
      desc: "Attempt previous year shift papers with a live countdown timer, sectional navigation, and instant negative marking report.",
      icon: Trophy,
    },
  ];

  const quickTools = [
    {
      title: "Previous Year Papers",
      desc: "Solve full-length official SSC shift papers with live timer and rank analysis.",
      href: "/papers",
      icon: FileSpreadsheet,
      action: "Attempt Papers",
    },
    {
      title: "136-WPM Typing Test",
      desc: "Practice with the official exam keyboard console, word timer, and error calculator.",
      href: "/typing",
      icon: Keyboard,
      action: "Open Typing Console",
    },
    {
      title: "Candidate Toolkit",
      desc: "Rank predictor, post eligibility calculator, and photo & signature resizer.",
      href: "/toolkit",
      icon: Clock,
      action: "Explore Tools",
    },
  ];

  const faqs = [
    {
      q: "Are the questions based on the latest SSC exam pattern?",
      a: "Yes. All questions and test sets are organized strictly around official SSC shift questions and standard reference material.",
    },
    {
      q: "Can I practice in Hindi as well as English?",
      a: "Yes. Every question has bilingual support. You can view questions in English, Hindi, or dual bilingual mode anytime.",
    },
    {
      q: "Is SSCZone free to use?",
      a: "Yes. All chapter-wise MCQs, previous year papers, and candidate tools are open and free for aspirants.",
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 font-sans antialiased">

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80 pt-14 pb-16 md:pt-20 md:pb-24 px-4 w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Official SSC Exam Syllabus & Practice Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Master SSC Exams,{" "}
            <span className="text-blue-600">Topic by Topic</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Practice syllabus-mapped MCQs from standard reference books with instant explanations, and simulate authentic official previous year papers with timed scorecards.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore All Exams</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/papers"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 px-6 py-3.5 text-sm font-bold text-blue-900 transition-all shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <span>SSC PYQ Shift Papers</span>
              <span className="rounded-full bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                2026 Live
              </span>
            </Link>
          </div>

          {/* Clean Metric Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">10,000+</p>
              <p className="text-xs text-slate-500 mt-0.5">Topic MCQs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100+</p>
              <p className="text-xs text-slate-500 mt-0.5">PYQ Shift Papers</p>
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

      {/* Target Exams Section (Clean Categorized List View) */}
      <section className="py-14 md:py-18 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Target SSC Exams
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Organized by examination level and official syllabus.
            </p>
          </div>

          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View All Exams & Syllabi</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
          {targetExams.map((exam, idx) => (
            <Link
              key={idx}
              href={exam.href}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <span className="text-xs font-semibold text-slate-400 w-6 text-left shrink-0 mt-0.5 sm:mt-0">
                  {idx + 1}.
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {exam.name}
                    </span>
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      {exam.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                    {exam.desc}
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>Explore Syllabus</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
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
            Why Practice on SSCZone
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Designed to help serious aspirants focus on quality and syllabus coverage.
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

      {/* Clean Call to Action Banner */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-slate-900 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Start Your Chapter Practice Now</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse syllabus-wise MCQs or attempt a full previous year question paper.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/exams"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Browse Exams
            </Link>
            <Link
              href="/papers"
              className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              Previous Papers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
