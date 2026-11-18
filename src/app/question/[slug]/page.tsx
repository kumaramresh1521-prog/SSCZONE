import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import {
  parseQuestionSlug,
  buildQuestionMetadata,
  generateQuestionJsonLd,
  getQuestionCanonicalPath,
  getPyqQuestionCanonicalPath,
} from "@/lib/question-seo";
import { getPaperSlug } from "@/lib/paper-slugs";
import QuestionClientView from "./QuestionClientView";
import { ChevronRight, Home, BookOpen, Layers, FileText } from "lucide-react";

export const revalidate = 3600; // 1-hour ISR cache

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { id, isPyq } = parseQuestionSlug(slug);
  if (!id) return { title: "Question Not Found | SSCZone" };

  try {
    const supabase = await createClient();

    // 1. If PYQ prefix is present
    if (isPyq) {
      const { data: pq } = await supabase
        .from("paper_questions")
        .select("*, previous_papers(id, title, year, exam_id, exams(id, title, slug))")
        .eq("id", id)
        .maybeSingle();

      if (pq) {
        const paperTitle = pq.previous_papers?.title || "Official SSC PYQ";
        const canonicalPath = getPyqQuestionCanonicalPath(pq.id, pq.question_text);
        const fullUrl = `https://ssczone.com${canonicalPath}`;
        return buildQuestionMetadata(pq, fullUrl, undefined, undefined, true, paperTitle);
      }
    }

    // 2. Question Bank question
    const { data: q } = await supabase
      .from("questions")
      .select("*, topics(id, title, subjects(id, title, exams(id, title)))")
      .eq("id", id)
      .maybeSingle();

    if (q) {
      const topicTitle = q.topics?.title;
      const examTitle = q.topics?.subjects?.exams?.title;
      const canonicalPath = getQuestionCanonicalPath(q.id, q.question_text);
      const fullUrl = `https://ssczone.com${canonicalPath}`;
      return buildQuestionMetadata(q, fullUrl, topicTitle, examTitle);
    }

    // 3. Fallback: check paper_questions even without pyq prefix
    const { data: fallbackPq } = await supabase
      .from("paper_questions")
      .select("*, previous_papers(id, title, year, exam_id, exams(id, title, slug))")
      .eq("id", id)
      .maybeSingle();

    if (fallbackPq) {
      const paperTitle = fallbackPq.previous_papers?.title || "Official SSC PYQ";
      const canonicalPath = getPyqQuestionCanonicalPath(fallbackPq.id, fallbackPq.question_text);
      const fullUrl = `https://ssczone.com${canonicalPath}`;
      return buildQuestionMetadata(fallbackPq, fullUrl, undefined, undefined, true, paperTitle);
    }

    return { title: "Question Not Found | SSCZone" };
  } catch {
    return { title: "SSC Question & Solution | SSCZone" };
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { slug } = await params;
  const { id, isPyq } = parseQuestionSlug(slug);
  if (!id) notFound();

  const supabase = await createClient();

  // ==========================================
  // CASE 1: PYQ Shift Paper Question
  // ==========================================
  if (isPyq) {
    const { data: pq } = await supabase
      .from("paper_questions")
      .select("*, previous_papers(id, title, year, exam_id, exams(id, title, slug))")
      .eq("id", id)
      .maybeSingle();

    if (!pq) notFound();

    const paper = pq.previous_papers;
    const exam = paper?.exams;
    const canonicalPath = getPyqQuestionCanonicalPath(pq.id, pq.question_text);
    const fullUrl = `https://ssczone.com${canonicalPath}`;

    // Redirect to canonical slug if mismatch
    const expectedSlug = canonicalPath.replace("/question/", "");
    if (slug !== expectedSlug) {
      redirect(canonicalPath);
    }

    // Fetch sibling questions in this shift paper
    let prevUrl: string | null = null;
    let nextUrl: string | null = null;
    let siblingQuestions: any[] = [];

    if (pq.paper_id) {
      const { data: siblings } = await supabase
        .from("paper_questions")
        .select("id, question_text, question_number")
        .eq("paper_id", pq.paper_id)
        .order("id", { ascending: true })
        .limit(50);

      if (siblings && siblings.length > 0) {
        siblingQuestions = siblings;
        const currentIndex = siblings.findIndex((s) => s.id === id);
        if (currentIndex > 0) {
          const prevQ = siblings[currentIndex - 1];
          prevUrl = getPyqQuestionCanonicalPath(prevQ.id, prevQ.question_text);
        }
        if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
          const nextQ = siblings[currentIndex + 1];
          nextUrl = getPyqQuestionCanonicalPath(nextQ.id, nextQ.question_text);
        }
      }
    }

    // Structured JSON-LD Schema
    const jsonLd = generateQuestionJsonLd(
      pq,
      fullUrl,
      undefined,
      exam?.title,
      true,
      paper?.title,
      paper?.id
    );

    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto pb-1 scrollbar-none">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            <Link href="/papers" className="hover:text-blue-600 transition-colors shrink-0 font-medium">
              PYQ Shift Papers
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {paper && (
              <>
                <Link
                  href={`/take-test/${getPaperSlug(paper)}`}
                  className="hover:text-blue-600 transition-colors font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs shrink-0"
                >
                  {paper.title}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </>
            )}

            <span className="text-slate-900 dark:text-white font-bold shrink-0">
              Question #{pq.question_number || pq.id}
            </span>
          </nav>

          {/* Client Interactive Question Card */}
          <QuestionClientView
            question={pq}
            paper={paper}
            prevQuestionUrl={prevUrl}
            nextQuestionUrl={nextUrl}
            canonicalUrl={fullUrl}
          />

          {/* Related Questions from this Shift Paper (Googlebot Spidering & Student Browsing) */}
          {siblingQuestions.length > 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    More Questions from {paper?.title || "this Shift Paper"}
                  </h2>
                </div>
                {paper && (
                  <Link
                    href={`/take-test/${getPaperSlug(paper)}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Attempt Full CBT Test (100 Qs) ➔
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {siblingQuestions
                  .filter((sq) => sq.id !== pq.id)
                  .slice(0, 8)
                  .map((sq, i) => {
                    const sqUrl = getPyqQuestionCanonicalPath(sq.id, sq.question_text);
                    const sqSnippet = (sq.question_text || "")
                      .replace(/^DIRECTIONS:[^\n]*\n+/i, "")
                      .replace(/^PASSAGE:[\s\S]*?\n\nQUESTION:\s*/i, "")
                      .replace(/^QUESTION:\s*/i, "")
                      .slice(0, 75);

                    return (
                      <Link
                        key={sq.id}
                        href={sqUrl}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 transition-all text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 group"
                      >
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                          {sq.question_number || i + 1}
                        </span>
                        <span className="line-clamp-2 leading-relaxed">
                          {sqSnippet}...
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // CASE 2: Chapter-Wise Question Bank
  // ==========================================
  const { data: question } = await supabase
    .from("questions")
    .select("*, topics(id, title, slug, subject_id, subjects(id, title, exam_id, exams(id, title, slug)))")
    .eq("id", id)
    .maybeSingle();

  // Fallback: If not in questions, check if it's in paper_questions
  if (!question) {
    const { data: fallbackPq } = await supabase
      .from("paper_questions")
      .select("id, question_text")
      .eq("id", id)
      .maybeSingle();

    if (fallbackPq) {
      redirect(getPyqQuestionCanonicalPath(fallbackPq.id, fallbackPq.question_text));
    }
    notFound();
  }

  // Canonical path
  const canonicalPath = getQuestionCanonicalPath(question.id, question.question_text);
  const fullUrl = `https://ssczone.com${canonicalPath}`;

  // Redirect to canonical slug if mismatch
  const expectedSlug = canonicalPath.replace("/question/", "");
  if (slug !== expectedSlug) {
    redirect(canonicalPath);
  }

  // Fetch sibling questions in this topic
  const topicId = question.topic_id;
  let prevUrl: string | null = null;
  let nextUrl: string | null = null;
  let siblingQuestions: any[] = [];

  if (topicId) {
    const { data: siblings } = await supabase
      .from("questions")
      .select("id, question_text")
      .eq("topic_id", topicId)
      .eq("is_active", true)
      .order("id", { ascending: true })
      .limit(30);

    if (siblings && siblings.length > 0) {
      siblingQuestions = siblings;
      const currentIndex = siblings.findIndex((s) => s.id === id);
      if (currentIndex > 0) {
        const prevQ = siblings[currentIndex - 1];
        prevUrl = getQuestionCanonicalPath(prevQ.id, prevQ.question_text);
      }
      if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
        const nextQ = siblings[currentIndex + 1];
        nextUrl = getQuestionCanonicalPath(nextQ.id, nextQ.question_text);
      }
    }
  }

  const topic = question.topics;
  const subject = topic?.subjects;
  const exam = subject?.exams;

  // Structured Schema for Google
  const jsonLd = generateQuestionJsonLd(question, fullUrl, topic?.title, exam?.title);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto pb-1 scrollbar-none">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {exam && (
            <>
              <Link href={`/exams/${exam.slug || exam.id}`} className="hover:text-blue-600 transition-colors shrink-0">
                {exam.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </>
          )}

          {topic && (
            <>
              <Link href={`/practice/${topic.slug || topic.id}`} className="hover:text-blue-600 transition-colors font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                {topic.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </>
          )}

          <span className="text-slate-900 dark:text-white font-bold shrink-0">
            Question #{question.id}
          </span>
        </nav>

        {/* Client Interactive Question Card */}
        <QuestionClientView
          question={question}
          topic={topic}
          prevQuestionUrl={prevUrl}
          nextQuestionUrl={nextUrl}
          canonicalUrl={fullUrl}
        />

        {/* Related Questions in this Topic (For Googlebot Internal Crawling) */}
        {siblingQuestions.length > 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  More Questions in {topic?.title || "this Topic"}
                </h2>
              </div>
              {topic && (
                <Link
                  href={`/practice/${topic.slug || topic.id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All MCQs ➔
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {siblingQuestions
                .filter((sq) => sq.id !== question.id)
                .slice(0, 8)
                .map((sq, i) => {
                  const sqUrl = getQuestionCanonicalPath(sq.id, sq.question_text);
                  const sqSnippet = sq.question_text
                    .replace(/^DIRECTIONS:[^\n]*\n+/i, "")
                    .replace(/^PASSAGE:[\s\S]*?\n\nQUESTION:\s*/i, "")
                    .replace(/^QUESTION:\s*/i, "")
                    .slice(0, 75);

                  return (
                    <Link
                      key={sq.id}
                      href={sqUrl}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 transition-all text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 group"
                    >
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="line-clamp-2 leading-relaxed">
                        {sqSnippet}...
                      </span>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
