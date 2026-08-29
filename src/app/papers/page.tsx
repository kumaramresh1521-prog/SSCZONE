"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FileSpreadsheet, Clock, HelpCircle, Search, ArrowRight, Calendar, Sparkles } from "lucide-react";

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    supabase
      .from("previous_papers")
      .select("*, exams(title)")
      .eq("is_active", true)
      .order("year", { ascending: false })
      .then(({ data }) => {
        setPapers(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.exams?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.year).includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/60">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Real Exam Simulation Mode
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
            Previous Year Papers & Test Series
          </h1>
          <p className="mt-3 text-base md:text-lg text-blue-100 max-w-2xl">
            Attempt real previous year exam papers with live timer, automatic scoring, and detailed subject analysis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search paper by title, exam, or year (e.g. 2023)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-gray-800 shadow-xs focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading previous year papers...</div>
        ) : filteredPapers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-xs">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Test Papers Found</h3>
            <p className="mt-1 text-sm">Try searching for another exam title or year.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <Link
                key={paper.id}
                href={`/take-test/${paper.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                      <Calendar className="h-3 w-3" />
                      {paper.year} PYQ
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                      {paper.exams?.title}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {paper.title}
                  </h2>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                      {paper.total_questions} Questions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      {paper.duration_minutes} Mins
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Start Test <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

