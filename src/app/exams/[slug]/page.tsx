import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import ExamSubjectsClient from "./ExamSubjectsClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { 
    title: `${title} Syllabus & Chapters — SSCZone`, 
    description: `Official syllabus-wise MCQ practice for ${title}. Practice chapter by chapter with step solutions.` 
  };
}

export default async function ExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase.from("exams").select("*").eq("slug", slug).single();
  if (!exam) notFound();

  const { data: rawSubjects } = await supabase
    .from("subjects")
    .select("*, topics(*)")
    .eq("exam_id", exam.id)
    .eq("is_active", true)
    .order("sort_order");

  const subjects = rawSubjects?.map((sub: any) => ({
    ...sub,
    topics: sub.topics ? [...sub.topics].filter((t: any) => t.is_active !== false).sort((a: any, b: any) => a.id - b.id) : []
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Clean Header */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/exams" className="hover:text-slate-800 transition-colors">Exams</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">{exam.title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {exam.description || "Official syllabus chapters organized category-wise for step-by-step practice."}
          </p>
        </div>
      </section>

      {/* Category-Wise Accordion List View */}
      <ExamSubjectsClient examTitle={exam.title} subjects={subjects} />
    </div>
  );
}
