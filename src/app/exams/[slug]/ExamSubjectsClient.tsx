"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Lock, 
  Search, 
  CheckCircle2, 
  Layers,
  FolderOpen,
  ArrowRight
} from "lucide-react";

interface Topic {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  is_free?: boolean;
}

interface Subject {
  id: number;
  title: string;
  tier_level?: string;
  topics?: Topic[];
}

export default function ExamSubjectsClient({ 
  examTitle, 
  subjects 
}: { 
  examTitle: string; 
  subjects: Subject[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>("All");
  
  // Track open/collapsed state of each subject category dropdown
  const [openSubjects, setOpenSubjects] = useState<Record<number, boolean>>(() => {
    const initialState: Record<number, boolean> = {};
    subjects.forEach((s, idx) => {
      // Keep first 2 open by default for immediate preview, or all if few
      initialState[s.id] = idx < 2;
    });
    return initialState;
  });

  const toggleSubject = (id: number) => {
    setOpenSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const state: Record<number, boolean> = {};
    subjects.forEach(s => { state[s.id] = true; });
    setOpenSubjects(state);
  };

  const collapseAll = () => {
    const state: Record<number, boolean> = {};
    subjects.forEach(s => { state[s.id] = false; });
    setOpenSubjects(state);
  };

  // Filter subjects based on tab and search query
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => activeSubjectTab === "All" || String(s.id) === activeSubjectTab)
      .map(s => {
        const matchingTopics = (s.topics || []).filter(t => 
          !searchQuery || 
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return { ...s, filteredTopics: matchingTopics };
      })
      .filter(s => searchQuery ? s.filteredTopics.length > 0 : true);
  }, [subjects, activeSubjectTab, searchQuery]);

  const totalChapters = useMemo(() => {
    return subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  }, [subjects]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-6">
      
      {/* Controls Bar: Search & Quick Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search Chapters */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chapters or sub-topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Expand / Collapse Actions */}
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Category Tabs: Select Subject */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubjectTab("All")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeSubjectTab === "All"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Subjects ({totalChapters})
        </button>
        {subjects.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubjectTab(String(sub.id))}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubjectTab === String(sub.id)
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {sub.title} ({sub.topics?.length || 0})
          </button>
        ))}
      </div>

      {/* Category-Wise Accordion List */}
      <div className="space-y-4">
        {filteredSubjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No chapters found</p>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
          </div>
        ) : (
          filteredSubjects.map(subject => {
            const isOpen = searchQuery ? true : (openSubjects[subject.id] ?? false);
            const topicsToRender = searchQuery ? subject.filteredTopics : (subject.topics || []);

            // Group topics by sub-category if present (e.g. Ancient, Medieval, Modern)
            const groupedSubSections: Record<string, Topic[]> = {};
            topicsToRender.forEach(t => {
              const secName = t.description?.trim() || "Core Chapters";
              if (!groupedSubSections[secName]) groupedSubSections[secName] = [];
              groupedSubSections[secName].push(t);
            });
            const subSectionKeys = Object.keys(groupedSubSections);
            const hasMultipleSubSections = subSectionKeys.length > 1 || (subSectionKeys.length === 1 && subSectionKeys[0] !== "Core Chapters");

            return (
              <div 
                key={subject.id} 
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                {/* Accordion Category Header */}
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 font-bold">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>{subject.title}</span>
                        {subject.tier_level && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {subject.tier_level}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {topicsToRender.length} chapters available
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

                {/* Expanded Clean List View */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4 space-y-3">
                    {hasMultipleSubSections ? (
                      /* Sub-section Category Groups */
                      subSectionKeys.map(subKey => {
                        const subTopics = groupedSubSections[subKey];
                        return (
                          <div key={subKey} className="bg-white rounded-xl border border-slate-200/90 overflow-hidden p-3 space-y-2">
                            <div className="flex items-center justify-between px-1 py-1">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                                <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                                {subKey}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {subTopics.length} topics
                              </span>
                            </div>

                            {/* Clean List Rows */}
                            <div className="divide-y divide-slate-100">
                              {subTopics.map((topic, tIdx) => (
                                <Link
                                  key={topic.id}
                                  href={`/practice/${topic.slug || topic.id}`}
                                  className="group flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <span className="text-xs font-semibold text-slate-400 w-6 text-left shrink-0">
                                      {tIdx + 1}.
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                      {topic.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {!topic.is_free ? (
                                      <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                        <Lock className="h-3 w-3" /> Pro
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                        Practice <ArrowRight className="h-3.5 w-3.5" />
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Flat Clean List Rows */
                      <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
                        {topicsToRender.map((topic, tIdx) => (
                          <Link
                            key={topic.id}
                            href={`/practice/${topic.slug || topic.id}`}
                            className="group flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                              <span className="text-xs font-semibold text-slate-400 w-6 text-left shrink-0">
                                {tIdx + 1}.
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                {topic.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!topic.is_free ? (
                                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  <Lock className="h-3 w-3" /> Pro
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                  Practice <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </section>
  );
}
