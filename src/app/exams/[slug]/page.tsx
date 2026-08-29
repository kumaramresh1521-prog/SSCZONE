import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, Folder, ChevronRight, Lock, Sparkles } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${title} - SSCZone`, description: `Syllabus-wise MCQ practice for ${title}` };
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
    <div className="min-h-screen bg-gray-50/60">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Official Syllabus & Chapter Modules
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">{exam.title}</h1>
          <p className="mt-2 text-sm text-blue-100 max-w-2xl">{exam.description}</p>
        </div>
      </section>

      {/* Subjects & Sub-Sections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 space-y-10">
        {subjects?.map((subject) => {
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
                    <h2 className="text-2xl font-extrabold text-gray-900">{subject.title}</h2>
                    <p className="text-xs text-gray-500">{rawTopics.length} chapters available</p>
                  </div>
                </div>
              </div>

              {hasMultipleSubSections ? (
                /* Grouped Sub-Sections (e.g. Ancient History, Medieval History, Modern History) */
                <div className="grid grid-cols-1 gap-6">
                  {groupKeys.map((secKey) => {
                    const secTopics = grouped[secKey];
                    
                    // Theme styling based on section name
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
                        {/* Folder Banner Header */}
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

                        {/* Topics List Grid */}
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
                /* Flat Topics Grid (e.g. Mathematics, Reasoning) */
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {rawTopics.map((topic: any) => (
                    <Link
                      key={topic.id}
                      href={`/practice/${topic.id}`}
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
      </section>
    </div>
  );
}
