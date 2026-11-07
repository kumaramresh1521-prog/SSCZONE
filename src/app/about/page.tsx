import Link from "next/link";
import type { Metadata } from "next";
import { Target, BookOpen, BrainCircuit, Award, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about", {
    title: "About Us — SSCZone",
    description: "Learn about SSCZone's mission to provide syllabus-wise MCQ practice and test series for competitive exam aspirants across India.",
    keywords: ["About SSCZone", "SSC Exam Preparation Portal", "SSC Test Series Team"],
  });
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Empowering Aspirants Across India
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
            About SSCZone
          </h1>
          <p className="mt-4 text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            India's dedicated platform for syllabus-wise MCQ practice, standard book questions, and real exam test series.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-12 space-y-12">
        {/* Mission Statement */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-xs space-y-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Our Mission</h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            SSCZone was built with a simple goal: <b>To make competitive exam preparation systematic, targeted, and affordable for every student.</b> Instead of random practice questions, we structure every single MCQ strictly according to official exam syllabi published by SSC, UPSC, State PSCs, and Railway Recruitment Boards.
          </p>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Whether you are preparing for <b>SSC CGL, CHSL, MTS, CPO, RRB NTPC, or UPSC CSAT</b>, SSCZone enables you to complete your preparation chapter-by-chapter with instant answer explanations and previous year question (PYQ) test papers.
          </p>
        </div>

        {/* Why Choose Us Grid */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Why Aspirants Trust SSCZone</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Strict Syllabus Alignment",
                desc: "Every topic is mapped directly to official exam notifications, ensuring zero wasted time on out-of-syllabus questions.",
                icon: Target
              },
              {
                title: "Standard Reference Books",
                desc: "Curated MCQs inspired by standard reference textbooks and previous year question banks.",
                icon: BookOpen
              },
              {
                title: "Detailed Explanations",
                desc: "Step-by-step solutions and explanations for every question to build conceptual clarity.",
                icon: BrainCircuit
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 md:p-10 text-center shadow-lg">
          <h3 className="text-2xl font-extrabold">Ready to start your exam preparation?</h3>
          <p className="mt-2 text-sm text-blue-100 max-w-lg mx-auto">
            Explore our syllabus-wise practice modules and attempt previous year papers today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-gray-950 shadow-md hover:bg-amber-300 transition-all"
            >
              Explore Exams <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-blue-900 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
