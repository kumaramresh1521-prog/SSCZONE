"use client";

import { useState } from "react";
import Link from "next/link";
import QuestionText from "@/components/QuestionText";
import MathText from "@/components/MathText";
import { resolveAssetUrl } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Share2,
  Bookmark,
  Check,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Award,
  Image as ImageIcon,
  Languages,
  FileText
} from "lucide-react";

interface QuestionProps {
  question: any;
  topic?: any;
  paper?: any;
  prevQuestionUrl?: string | null;
  nextQuestionUrl?: string | null;
  canonicalUrl: string;
}

export default function QuestionClientView({
  question,
  topic,
  paper,
  prevQuestionUrl,
  nextQuestionUrl,
  canonicalUrl,
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  // Bilingual support: English vs Hindi
  const hasHindi = Boolean(question.question_text_hi);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const correctLetter = (question.correct_answer || "A").toUpperCase();

  const currentQuestionText =
    lang === "hi" && question.question_text_hi ? question.question_text_hi : question.question_text;

  const currentExplanation =
    lang === "hi" && question.explanation_hi ? question.explanation_hi : question.explanation;

  const options = [
    {
      letter: "A",
      text: lang === "hi" && question.option_a_hi ? question.option_a_hi : question.option_a,
      img: question.option_a_image_url,
    },
    {
      letter: "B",
      text: lang === "hi" && question.option_b_hi ? question.option_b_hi : question.option_b,
      img: question.option_b_image_url,
    },
    {
      letter: "C",
      text: lang === "hi" && question.option_c_hi ? question.option_c_hi : question.option_c,
      img: question.option_c_image_url,
    },
    {
      letter: "D",
      text: lang === "hi" && question.option_d_hi ? question.option_d_hi : question.option_d,
      img: question.option_d_image_url,
    },
  ].filter((o) => !!o.text || !!o.img);

  const handleSelectOption = (letter: string) => {
    setSelectedOption(letter);
    setShowAnswer(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const examBadge = paper?.title || question.exam_tag || topic?.subjects?.exams?.title || "SSC Official PYQ";

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 shadow-2xs">
            <Award className="w-3.5 h-3.5" />
            <span className="truncate max-w-[280px]">{examBadge}</span>
          </span>
          {topic?.title && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{topic.title}</span>
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            Question #{question.question_number || question.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle (if Hindi translation exists) */}
          {hasHindi && (
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "हिन्दी में देखें" : "View in English"}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Share this Question"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              bookmarked
                ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-500 text-amber-600" : "text-slate-500"}`} />
            <span>{bookmarked ? "Saved" : "Bookmark"}</span>
          </button>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <QuestionText text={currentQuestionText} />

        {/* Question Image (Figures, Non-Verbal, Graphs) */}
        {question.image_url && (
          <div className="mt-4 mb-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Question Figure / प्रश्न आकृति:</span>
            </div>
            <div className="relative inline-block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 sm:p-3 shadow-xs max-w-full">
              <img
                src={resolveAssetUrl(question.image_url)}
                alt={`Question #${question.id} figure`}
                className="w-auto max-w-full sm:max-w-xl rounded-xl object-contain"
                style={{ maxHeight: "480px" }}
              />
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="mt-6 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            Select Option to Check Answer:
          </div>
          {options.map((opt) => {
            const isSelected = selectedOption === opt.letter;
            const isCorrect = opt.letter === correctLetter;

            let btnStyle =
              "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 dark:text-slate-200";
            let badgeStyle = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200";

            if (showAnswer) {
              if (isCorrect) {
                btnStyle =
                  "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30";
                badgeStyle = "bg-emerald-600 text-white font-black";
              } else if (isSelected) {
                btnStyle =
                  "border-red-400 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200";
                badgeStyle = "bg-red-600 text-white font-black";
              }
            }

            return (
              <button
                key={opt.letter}
                onClick={() => handleSelectOption(opt.letter)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer shadow-2xs ${btnStyle}`}
              >
                <span
                  className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold shrink-0 mt-0.5 shadow-2xs ${badgeStyle}`}
                >
                  {opt.letter}
                </span>
                <div className="flex-1 text-sm sm:text-base font-medium leading-relaxed pt-0.5">
                  {opt.text && <MathText text={opt.text} />}
                  {opt.img && (
                    <div className="mt-2 mb-1">
                      <img
                        src={resolveAssetUrl(opt.img)}
                        alt={`Option ${opt.letter} figure`}
                        className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1.5 shadow-2xs"
                        style={{ maxHeight: "140px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
                {showAnswer && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* View Answer Button (if not yet revealed) */}
        {!showAnswer && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setShowAnswer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Show Answer &amp; Explanation</span>
            </button>
          </div>
        )}

        {/* Detailed Explanation Block */}
        {showAnswer && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black">
                    ✓
                  </span>
                  <span className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                    Correct Answer: Option ({correctLetter})
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Official SSC Key
                </span>
              </div>

              {(() => {
                const correctOpt = options.find((o) => o.letter === correctLetter);
                if (correctOpt?.img) {
                  return (
                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                      <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct Figure / सही आकृति:</span>
                      </div>
                      <img
                        src={resolveAssetUrl(correctOpt.img)}
                        alt={`Correct Option ${correctLetter} figure`}
                        className="max-w-xs rounded-lg border border-emerald-300 bg-white p-1.5 shadow-2xs"
                        style={{ maxHeight: "140px", objectFit: "contain" }}
                      />
                    </div>
                  );
                }
                return null;
              })()}

              {currentExplanation && (
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Detailed Explanation:
                  </div>
                  <MathText text={currentExplanation} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Case A: PYQ Paper Conversion Banner */}
      {paper && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider">
              <span>📄 Official Shift PYQ Paper</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {paper.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Attempt this exact official SSC question paper in TCS online CBT exam pattern with timer, scorecards, and negative marking analysis.
            </p>
          </div>
          <Link
            href={`/take-test/${paper.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shrink-0 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Attempt Full CBT Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Case B: Topic Practice Mode Banner */}
      {!paper && topic && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider">
              <span>🎯 Free Practice Mode</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Practicing for {topic.title}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Attempt all official questions in CBT timed exam pattern with instant solutions and rank analytics on SSCZone.
            </p>
          </div>
          <Link
            href={`/practice/${topic.slug || topic.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shrink-0 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Practice this Chapter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Crawl Navigation Links (Googlebot & User Friendly) */}
      <div className="flex items-center justify-between pt-2">
        {prevQuestionUrl ? (
          <Link
            href={prevQuestionUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </Link>
        ) : (
          <div />
        )}

        {nextQuestionUrl ? (
          <Link
            href={nextQuestionUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
