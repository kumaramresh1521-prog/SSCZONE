import Link from "next/link";
import UserNav from "@/components/UserNav";
import { 
  BookOpen, 
  FileSpreadsheet, 
  Target, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  BrainCircuit
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSCZone — Syllabus-Wise MCQ Practice & Test Series Portal",
  description: "Prepare for SSC CGL, CHSL, CPO, MTS, GD & Railways Exams topic-by-topic. Practice high-quality MCQs with instant solutions.",
};

export default function Home() {
  const steps = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans antialiased">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-900 text-white py-16 md:py-24 px-4">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-200 border border-blue-400/30 mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Official Exam Syllabus Based Practice Platform
          </div>

          <h1 className="text-3xl font-extrabold md:text-5xl lg:text-6xl tracking-tight leading-tight">
            Crack Competitive Exams With <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">SSCZone</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Practice topic-wise MCQs from standard reference books, attempt previous year test papers, and track your accuracy chapter by chapter.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/exams"
              className="flex items-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 font-bold text-gray-950 shadow-lg hover:bg-amber-300 hover:scale-105 transition-all text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore All Exams</span>
            </Link>
            <Link
              href="/papers"
              className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur-xs hover:bg-white hover:text-blue-950 hover:scale-105 transition-all text-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              <span>Attempt PYQ Papers</span>
            </Link>
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-blue-800/60 pt-7 text-left max-w-4xl mx-auto">
            {[
              { label: "Topic-wise MCQs", value: "10,000+", icon: Target },
              { label: "Previous Papers", value: "100+ PYQs", icon: FileSpreadsheet },
              { label: "Detailed Solutions", value: "100% Explanations", icon: BrainCircuit },
              { label: "Syllabus Covered", value: "Complete SSC Exams", icon: ShieldCheck },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                  <Icon className="h-4 w-4 text-amber-400 mb-1.5" />
                  <p className="text-lg font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Prepare Step-by-Step */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              3 Simple Steps to Master Any Exam
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Our structured approach ensures you never miss a single topic from official exam notifications.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group relative rounded-3xl border border-gray-200 bg-white p-7 shadow-xs transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-5 shadow-inner">
                  0{i + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Exam Categories */}
      <section className="bg-white py-16 border-t border-b border-gray-100 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Target Competitive Exams</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Select an exam and start syllabus-wise preparation</p>
            </div>
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>View All Exams</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "SSC CGL", desc: "Combined Graduate Level Tier-1 & Tier-2", bg: "bg-blue-50/80 border-blue-100 text-blue-900" },
              { name: "SSC CHSL", desc: "Combined Higher Secondary Level (10+2)", bg: "bg-amber-50/80 border-amber-100 text-amber-900" },
              { name: "SSC CPO & MTS", desc: "Central Police Organisation & Multi-Tasking Staff Practice", bg: "bg-indigo-50/80 border-indigo-100 text-indigo-900" }
            ].map((cat, idx) => (
              <div key={idx} className={`rounded-2xl p-6 border ${cat.bg} space-y-2.5`}>
                <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold shadow-2xs">Exam Category</span>
                <h3 className="text-lg font-extrabold">{cat.name}</h3>
                <p className="text-xs opacity-80">{cat.desc}</p>
                <Link href="/exams" className="inline-block pt-1 text-xs font-bold text-blue-600 hover:underline">
                  Start Practice ➔
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      
    </div>
  );
}
