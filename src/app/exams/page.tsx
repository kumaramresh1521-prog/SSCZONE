import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import ExamsClient from "./ExamsClient";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/exams", {
    title: "Target Exams & Syllabi — SSCZone",
    description: "Select your target exam and start syllabus-wise MCQ practice for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways.",
    keywords: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD", "Railways RRB", "SSC Exam Syllabus"],
  });
}

export default async function ExamsPage() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select("*, subjects(id, title, topics(id))")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Clean Header */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">Target Exams</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Target SSC Exams
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Select an exam category below to browse subjects and chapters mapped directly to official examination notifications.
          </p>
        </div>
      </section>

      {/* Category-Wise Accordion List View */}
      <ExamsClient exams={exams ?? []} />
    </div>
  );
}
