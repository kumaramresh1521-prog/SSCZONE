import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, GraduationCap, ArrowRight, Sparkles, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "All SSC Exams - SSCZone",
  description: "Select your target exam and start syllabus-wise MCQ practice for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways.",
};

export default async function ExamsPage() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select("*, subjects(id, title, topics(id))")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50/60">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Syllabus-Wise MCQ Practice Portal
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
            Select Your Target Exam
          </h1>
          <p className="mt-3 text-base md:text-lg text-blue-100 max-w-2xl">
            Prepare chapter by chapter according to official exam syllabi with standard standard book questions and detailed explanations.
          </p>
        </div>
      </section>

      {/* Exams Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams?.map((exam) => {
            const totalSubjects = exam.subjects?.length || 0;
            const totalTopics = exam.subjects?.reduce((acc: number, s: any) => acc + (s.topics?.length || 0), 0) || 0;

            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                      Official Syllabus
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h2>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {exam.description || "Comprehensive syllabus-wise practice questions."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      {totalSubjects} Subjects
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                      {totalTopics} Chapters
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Start <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}

          {(!exams || exams.length === 0) && (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
              No active exams found in the system right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

