"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  Star,
  ExternalLink,
  GraduationCap,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";
import type { SubjectNote } from "@/lib/subject-notes-store";

const EXAMS_FILTER_OPTIONS = [
  { id: "all", name: "All Target Exams" },
  { id: "ssc-cgl", name: "🎯 SSC CGL 2026 (Tier 1 & 2)" },
  { id: "ssc-chsl", name: "SSC CHSL (10+2)" },
  { id: "ssc-cpo", name: "SSC CPO (SI in Police)" },
  { id: "ssc-mts", name: "SSC MTS & Havaldar" },
  { id: "ssc-gd-constable", name: "SSC GD Constable" },
  { id: "ssc-stenographer", name: "SSC Stenographer" },
];

const SUBJECTS_FILTER_OPTIONS = [
  { id: "all", name: "All Subjects", iconName: "All" },
  { id: "quant", name: "Quantitative Aptitude (Maths)", shortName: "Maths", color: "blue" },
  { id: "reasoning", name: "Reasoning Ability", shortName: "Reasoning", color: "purple" },
  { id: "english", name: "English Language", shortName: "English", color: "emerald" },
  { id: "history", name: "History (Ancient/Med/Modern)", shortName: "History", color: "amber" },
  { id: "polity", name: "Polity & Constitution", shortName: "Polity", color: "indigo" },
  { id: "geography", name: "Geography & Mapping", shortName: "Geography", color: "teal" },
  { id: "science", name: "General Science (PCB)", shortName: "Science", color: "cyan" },
  { id: "computer", name: "Computer Knowledge", shortName: "Computer", color: "violet" },
  { id: "static-gk", name: "Static GK & Culture", shortName: "Static GK", color: "amber" },
];

export default function NotesClient({ initialNotes = [] }: { initialNotes: SubjectNote[] }) {
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter notes
  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      // 1. Exam filter
      if (selectedExam !== "all" && note.exam !== selectedExam && note.exam !== "all") {
        return false;
      }

      // 2. Subject filter
      if (selectedSubject !== "all" && note.subject !== selectedSubject) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = note.title.toLowerCase().includes(q);
        const matchTopic = note.topic?.toLowerCase().includes(q);
        const matchDesc = note.description?.toLowerCase().includes(q);
        const matchHindi = note.hindi_title?.toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchDesc && !matchHindi) {
          return false;
        }
      }

      return true;
    });
  }, [initialNotes, selectedExam, selectedSubject, searchQuery]);

  // Color mapping for cards
  const getSubjectColorClasses = (subId: string) => {
    switch (subId) {
      case "quant":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200/80",
          iconBg: "bg-blue-50 text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "reasoning":
        return {
          pill: "bg-purple-50 text-purple-700 border-purple-200/80",
          iconBg: "bg-purple-50 text-purple-600",
          button: "bg-purple-600 hover:bg-purple-700 text-white",
        };
      case "english":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          iconBg: "bg-emerald-50 text-emerald-600",
          button: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "history":
      case "static-gk":
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200/80",
          iconBg: "bg-amber-50 text-amber-600",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "polity":
        return {
          pill: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          iconBg: "bg-indigo-50 text-indigo-600",
          button: "bg-indigo-600 hover:bg-indigo-700 text-white",
        };
      case "geography":
        return {
          pill: "bg-teal-50 text-teal-700 border-teal-200/80",
          iconBg: "bg-teal-50 text-teal-600",
          button: "bg-teal-600 hover:bg-teal-700 text-white",
        };
      case "science":
        return {
          pill: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
          iconBg: "bg-cyan-50 text-cyan-600",
          button: "bg-cyan-600 hover:bg-cyan-700 text-white",
        };
      default:
        return {
          pill: "bg-slate-100 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-600",
          button: "bg-slate-900 hover:bg-blue-600 text-white",
        };
    }
  };

  const hasActiveFilters = selectedExam !== "all" || selectedSubject !== "all" || searchQuery.trim() !== "";

  const resetFilters = () => {
    setSelectedExam("all");
    setSelectedSubject("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      
      {/* Clean Header */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">Subject Notes & PDFs</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>SSC CGL 2026 & All SSC Exams • Official Revision Materials</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Subject Notes & Formula PDFs
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                Download verified chapter-wise revision notes, high-yield formula cheat sheets, and theory capsules curated strictly according to official SSC notification syllabus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        
        {/* Interactive 2-Column Chapter Notes Reader Banner */}
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/40">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Interactive Online Reader</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-white">
              Prefer Reading Chapter-Wise Notes Online?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Open our new 2-Column Chapter Reader (Left sidebar for all chapters, right for rich formulas & theory) with instant subject switching!
            </p>
          </div>

          <Link
            href="/blog/notes"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 text-xs font-black shadow-md transition-all shrink-0 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Launch Chapter Reader →</span>
          </Link>
        </div>

        {/* Modern Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapter, topic, or formula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Exam Dropdown */}
            <div>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
              >
                {EXAMS_FILTER_OPTIONS.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
              >
                {SUBJECTS_FILTER_OPTIONS.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            {SUBJECTS_FILTER_OPTIONS.slice(0, 6).map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`rounded-xl px-3 py-1.5 font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sub.shortName || sub.name}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0 px-2 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing <strong className="text-slate-800">{filteredNotes.length}</strong> study document{filteredNotes.length !== 1 ? "s" : ""}</span>
          {selectedExam !== "all" && (
            <span className="font-semibold text-blue-600">
              Exam: {EXAMS_FILTER_OPTIONS.find((e) => e.id === selectedExam)?.name}
            </span>
          )}
        </div>

        {/* PDF Notes Cards Grid */}
        {filteredNotes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3 shadow-xs">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {hasActiveFilters ? "No matching study notes found" : "No notes uploaded yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                {hasActiveFilters
                  ? "Try adjusting your target exam or subject filter to view available study materials."
                  : "Fresh chapter-wise PDFs and formula sheets are being verified by our academic team and will be published here shortly!"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>View All Notes</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const colors = getSubjectColorClasses(note.subject);

              return (
                <div
                  key={note.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colors.pill}`}>
                          {note.subject_name.split("-")[1] || note.subject_name.split("(")[0] || note.subject_name}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {note.exam.toUpperCase()}
                        </span>
                        {note.is_featured && (
                          <span className="flex items-center gap-0.5 text-[10px] font-black bg-amber-400/20 text-amber-900 border border-amber-400/40 px-1.5 py-0.5 rounded-md">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            <span>MUST REVISE</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400">
                        {note.language}
                      </span>
                    </div>

                    {/* Title & Topic */}
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {note.title}
                    </h3>
                    {note.hindi_title && (
                      <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
                        {note.hindi_title}
                      </p>
                    )}
                    {note.topic && (
                      <p className="text-xs font-semibold text-blue-600 mt-1">
                        Chapter: {note.topic}
                      </p>
                    )}
                    {note.description && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Meta & Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>📄 {note.page_count || 12} Pages</span>
                      <span>💾 {note.file_size || "PDF"}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                        FREE ACCESS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* View / Read Button */}
                      <a
                        href={note.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-600" />
                        <span>View PDF</span>
                      </a>

                      {/* Download Button */}
                      <a
                        href={note.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center shadow-2xs ${colors.button}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
