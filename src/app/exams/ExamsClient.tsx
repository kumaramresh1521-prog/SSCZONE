"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  ChevronDown, 
  ArrowRight, 
  Layers, 
  BookOpen, 
  Search,
  CheckCircle2,
  Shield,
  FileCheck
} from "lucide-react";

interface Exam {
  id: number;
  title: string;
  slug: string;
  description?: string;
  subjects?: { id: number; title: string; topics: { id: number }[] }[];
}

export default function ExamsClient({ exams }: { exams: Exam[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Categorize exams by qualification / level
  const getCategoryForExam = (title: string): string => {
    const t = title.toUpperCase();
    if (t.includes("CGL") || t.includes("GRADUATE")) return "Graduate Level";
    if (t.includes("CPO") || t.includes("POLICE")) return "Police & Defense";
    if (t.includes("CHSL") || t.includes("10+2") || t.includes("STENO")) return "10+2 (Higher Secondary)";
    if (t.includes("MTS") || t.includes("GD") || t.includes("CONSTABLE")) return "10th / Matric Level";
    return "All SSC Exams";
  };

  // State to track accordion open/close for each category
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Graduate Level": true,
    "10+2 (Higher Secondary)": true,
    "Police & Defense": true,
    "10th / Matric Level": true,
    "All SSC Exams": true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Dynamically compute levelTabs based on available categories
  const levelTabs = useMemo(() => {
    const presentCategories = new Set<string>();
    exams.forEach(ex => presentCategories.add(getCategoryForExam(ex.title)));
    const tabs = ["All"];
    ["Graduate Level", "10+2 (Higher Secondary)", "Police & Defense", "10th / Matric Level"].forEach(lvl => {
      if (presentCategories.has(lvl)) tabs.push(lvl);
    });
    return tabs.length > 1 ? tabs : ["All"];
  }, [exams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      const matchesSearch = 
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.description && ex.description.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      if (selectedLevel === "All") return true;
      return getCategoryForExam(ex.title) === selectedLevel;
    });
  }, [exams, searchTerm, selectedLevel]);

  // Group filtered exams by category
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Exam[]> = {};
    filteredExams.forEach(ex => {
      const cat = getCategoryForExam(ex.title);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ex);
    });
    return groups;
  }, [filteredExams]);

  const categoryKeys = Object.keys(groupedCategories);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam by title or eligibility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {levelTabs.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Category-Wise Accordion List */}
      {categoryKeys.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No exams found</p>
          <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryKeys.map(catName => {
            const catExams = groupedCategories[catName];
            const isOpen = searchTerm ? true : (openCategories[catName] ?? true);

            return (
              <div 
                key={catName}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                {/* Accordion Category Header */}
                <button
                  onClick={() => toggleCategory(catName)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 font-bold">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {catName}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {catExams.length} target exams categorized
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                      {isOpen ? "Collapse" : "View List"}
                    </span>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Exam Rows List */}
                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {catExams.map((exam, eIdx) => {
                      const totalSubjects = exam.subjects?.length || 0;
                      const totalTopics = exam.subjects?.reduce((acc: number, s: any) => acc + (s.topics?.length || 0), 0) || 0;

                      return (
                        <div
                          key={exam.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 pr-2">
                            <span className="text-xs font-semibold text-slate-400 w-6 text-left shrink-0 mt-0.5 sm:mt-0">
                              {eIdx + 1}.
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/exams/${exam.slug}`}
                                  className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                                >
                                  {exam.title}
                                </Link>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  Official Syllabus
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
                                {exam.description || "Comprehensive syllabus-wise practice questions organized by subjects and topics."}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-medium">
                                <span>{totalSubjects} Subjects</span>
                                <span>•</span>
                                <span>{totalTopics} Chapters</span>
                              </div>
                            </div>
                          </div>

                          <div className="self-end sm:self-center shrink-0">
                            <Link
                              href={`/exams/${exam.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs"
                            >
                              <span>Explore Chapters</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}
