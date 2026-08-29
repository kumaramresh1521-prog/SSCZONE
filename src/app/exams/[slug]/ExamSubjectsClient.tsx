"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Folder, ChevronRight, Lock } from "lucide-react";

export default function ExamSubjectsClient({ subjects }: { subjects: any[] }) {
  const [activeTier, setActiveTier] = useState<string>("All");

  // Determine which tiers exist for these subjects
  const availableTiers = Array.from(
    new Set(subjects.map(s => s.tier_level && s.tier_level !== "None" ? s.tier_level : "General"))
  ).sort();

  const tabs = ["All"];
  if (availableTiers.includes("Tier 1")) tabs.push("Tier 1");
  if (availableTiers.includes("Tier 2")) tabs.push("Tier 2");

  // Filter subjects based on active tab
  const filteredSubjects = subjects.filter(sub => {
    if (activeTier === "All") return true;
    if (activeTier === "Tier 1") return sub.tier_level === "Tier 1";
    if (activeTier === "Tier 2") return sub.tier_level === "Tier 2";
    return true;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      
      {/* Tier Tabs */}
      {tabs.length > 1 && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTier(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTier === tab 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          No subjects available for the selected tier.
        </div>
      ) : (
        <div className="space-y-10">
          {filteredSubjects.map((subject) => {
            const rawTopics = subject.topics || [];
            
            // Group topics by Sub-Section (description) if present
            const grouped: Record<string, any[]> = {};
            rawTopics.forEach((t: any) => {
              const secName = t.description?.trim() || "General Topics";
              if (!grouped[secName]) grouped[secName] = [];
              grouped[secName].push(t);
            });

            const groupKeys = Object.keys(grouped);
            const hasMultipleSubSections = groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== "General Topics");

            return (
              <div key={subject.id} className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900">
                        {subject.title} 
                        {subject.tier_level && subject.tier_level !== "None" && (
                          <span className={`ml-3 text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            subject.tier_level === "Tier 1" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {subject.tier_level}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">{rawTopics.length} chapters available</p>
                    </div>
                  </div>
                </div>

                {hasMultipleSubSections ? (
                  /* Grouped Sub-Sections */
                  <div className="grid grid-cols-1 gap-6">
                    {groupKeys.map((secKey) => {
                      const secTopics = grouped[secKey];
                      let accentBg = "bg-indigo-50/80 border-indigo-100 text-indigo-900";
                      let folderColor = "text-indigo-600 fill-indigo-100";
                      let badgeBg = "bg-indigo-600 text-white";
                      let icon = "📜";

                      if (secKey.toLowerCase().includes("ancient")) {
                        accentBg = "bg-amber-50/80 border-amber-200/80 text-amber-950";
                        folderColor = "text-amber-600 fill-amber-100";
                        badgeBg = "bg-amber-600 text-white";
                        icon = "🏺";
                      } else if (secKey.toLowerCase().includes("medieval")) {
                        accentBg = "bg-purple-50/80 border-purple-200/80 text-purple-950";
                        folderColor = "text-purple-600 fill-purple-100";
                        badgeBg = "bg-purple-600 text-white";
                        icon = "⚔️";
                      } else if (secKey.toLowerCase().includes("modern")) {
                        accentBg = "bg-emerald-50/80 border-emerald-200/80 text-emerald-950";
                        folderColor = "text-emerald-600 fill-emerald-100";
                        badgeBg = "bg-emerald-600 text-white";
                        icon = "🇮🇳";
                      } else if (secKey.toLowerCase().includes("physics")) {
                        accentBg = "bg-sky-50/80 border-sky-200/80 text-sky-950";
                        folderColor = "text-sky-600 fill-sky-100";
                        badgeBg = "bg-sky-600 text-white";
                        icon = "⚡";
                      } else if (secKey.toLowerCase().includes("chem")) {
                        accentBg = "bg-rose-50/80 border-rose-200/80 text-rose-950";
                        folderColor = "text-rose-600 fill-rose-100";
                        badgeBg = "bg-rose-600 text-white";
                        icon = "🧪";
                      } else if (secKey.toLowerCase().includes("bio")) {
                        accentBg = "bg-teal-50/80 border-teal-200/80 text-teal-950";
                        folderColor = "text-teal-600 fill-teal-100";
                        badgeBg = "bg-teal-600 text-white";
                        icon = "🧬";
                      }

                      return (
                        <div key={secKey} className="rounded-2xl border border-gray-200 bg-gray-50/40 p-5 space-y-4">
                          <div className={`flex items-center justify-between rounded-xl border ${accentBg} p-3.5 shadow-2xs`}>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{icon}</span>
                              <Folder className={`h-5 w-5 ${folderColor}`} />
                              <h3 className="text-base font-extrabold tracking-tight">{secKey}</h3>
                            </div>
                            <span className={`rounded-full ${badgeBg} px-3 py-1 text-xs font-extrabold shadow-2xs`}>
                              {secTopics.length} Chapters
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {secTopics.map((topic: any) => (
                              <Link
                                key={topic.id}
                                href={`/practice/${topic.slug || topic.id}`}
                                className="group flex items-center justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs transition-all hover:bg-blue-50/70 hover:border-blue-300 hover:shadow-md"
                              >
                                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                  {topic.title}
                                </span>
                                {!topic.is_free ? (
                                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200 shrink-0">
                                    <Lock className="h-3 w-3" /> Pro
                                  </span>
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Flat Topics Grid */
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {rawTopics.map((topic: any) => (
                      <Link
                        key={topic.id}
                        href={`/practice/${topic.slug || topic.id}`}
                        className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-2xs transition-all hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md"
                      >
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {topic.title}
                        </span>
                        {!topic.is_free ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-100 shrink-0">
                            <Lock className="h-3 w-3" /> Pro
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                        )}
                      </Link>
                    ))}
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
