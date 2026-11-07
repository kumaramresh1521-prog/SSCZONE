"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Check, Sparkles } from "lucide-react";
import {
  isQuestionCollected,
  saveCollectedQuestion,
  removeCollectedQuestion,
  type UserCollectedQuestion,
} from "@/lib/user-attempts-store";

interface CollectQuestionButtonProps {
  question: {
    id?: string | number;
    questionId?: number | string;
    question_text: string;
    question_text_hi?: string | null;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: "A" | "B" | "C" | "D";
    explanation?: string | null;
    subject?: string;
    topic?: string;
    source?: "speed_test" | "daily_quiz" | "pyq" | "bank";
    sourceTitle?: string;
  };
  showLabel?: boolean;
  className?: string;
}

export default function CollectQuestionButton({
  question,
  showLabel = false,
  className = "",
}: CollectQuestionButtonProps) {
  const [collected, setCollected] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state on mount or question change
  useEffect(() => {
    const isCol = isQuestionCollected(question.questionId || question.question_text);
    setCollected(isCol);

    const handleUpdate = () => {
      setCollected(isQuestionCollected(question.questionId || question.question_text));
    };

    window.addEventListener("ssczone-collected-questions-updated", handleUpdate);
    return () => window.removeEventListener("ssczone-collected-questions-updated", handleUpdate);
  }, [question]);

  const numQuestionId =
    typeof question.questionId === "number"
      ? question.questionId
      : parseInt(String(question.questionId || "").replace(/\D/g, ""), 10) || undefined;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (collected) {
      removeCollectedQuestion(question.questionId || question.question_text);
      setCollected(false);
      triggerToast("Question removed from collection");
    } else {
      saveCollectedQuestion({
        questionId: numQuestionId,
        source: question.source || "speed_test",
        sourceTitle: question.sourceTitle,
        subject: question.subject,
        topic: question.topic,
        question_text: question.question_text,
        question_text_hi: question.question_text_hi,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        tag: "Standard",
      });
      setCollected(true);
      triggerToast("Saved to your Dashboard Collection! 🔖");
    }
  };

  const handleTagChange = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    saveCollectedQuestion({
      questionId: numQuestionId,
      source: question.source || "speed_test",
      sourceTitle: question.sourceTitle,
      subject: question.subject,
      topic: question.topic,
      question_text: question.question_text,
      question_text_hi: question.question_text_hi,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      tag,
    });
    setCollected(true);
    setShowTagMenu(false);
    triggerToast(`Tagged as ${tag}! 🔖`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowTagMenu(!showTagMenu);
        }}
        aria-label={collected ? "Question collected" : "Collect question for revision"}
        title={collected ? "Collected! (Click to remove, right-click to change tag)" : "Collect/Save question to your Dashboard"}
        className={
          className ||
          (showLabel
            ? `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                collected
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/60"
              }`
            : `flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs ${
                collected
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:bg-amber-50/60 hover:text-amber-600"
              }`)
        }
      >
        {collected ? (
          <BookmarkCheck className="h-3.5 w-3.5 shrink-0 fill-current" />
        ) : (
          <Bookmark className="h-3.5 w-3.5 shrink-0" />
        )}
        {showLabel && <span>{collected ? "Collected" : "Collect"}</span>}
      </button>

      {/* Floating mini toast confirmation */}
      {toastMessage && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Tag selector dropdown (right click or click menu) */}
      {showTagMenu && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 w-40 text-xs animate-in fade-in zoom-in-95">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Choose Tag
          </p>
          {[
            { label: "📌 Standard", tag: "Standard" },
            { label: "🔥 High Priority", tag: "High Priority" },
            { label: "⚠️ Tricky / Hard", tag: "Tricky" },
            { label: "📐 Formula / Math", tag: "Formula" },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={(e) => handleTagChange(e, item.tag)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center justify-between"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
