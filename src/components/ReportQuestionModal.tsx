"use client";

import React, { useState } from "react";
import { Flag, X, CheckCircle2, AlertTriangle, Send, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type ReportQuestionModalProps = {
  questionId: number;
  questionText?: string;
  isOpen: boolean;
  onClose: () => void;
};

const REPORT_REASONS = [
  { id: "wrong_answer", label: "❌ Wrong Answer Key", desc: "The correct answer marked is incorrect" },
  { id: "typo", label: "✍️ Typo / Spelling Error", desc: "Spelling mistake or missing text" },
  { id: "explanation_error", label: "📖 Incomplete Explanation", desc: "Solution explanation is wrong or unclear" },
  { id: "formatting", label: "📐 Math / Symbol Error", desc: "Formula or symbols rendering incorrectly" },
  { id: "other", label: "❓ Other Issue", desc: "Any other problem with this question" },
];

export default function ReportQuestionModal({
  questionId,
  questionText,
  isOpen,
  onClose,
}: ReportQuestionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("wrong_answer");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // Try inserting into question_reports table
      const { error } = await supabase.from("question_reports").insert({
        question_id: questionId,
        user_id: userId,
        reason: selectedReason,
        description: description.trim() || null,
        status: "pending",
      });

      if (error) {
        // Fallback: Store locally in localStorage for backup
        const existing = JSON.parse(localStorage.getItem("ssczone_local_reports") || "[]");
        existing.push({
          question_id: questionId,
          user_id: userId,
          reason: selectedReason,
          description: description.trim(),
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("ssczone_local_reports", JSON.stringify(existing));
      }

      setSubmitted(true);
      toast.success(`Question #${questionId} flagged for review! Thank you. 🚩`);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch {
      toast.error("Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Report Submitted!</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Our subject expert team will audit Question #{questionId} and update it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Flag className="h-5 w-5 fill-red-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Report Question Error</h3>
                <p className="text-xs text-gray-500 font-semibold">Question ID: #{questionId}</p>
              </div>
            </div>

            {questionText && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs text-gray-700 italic line-clamp-2">
                "{questionText.replace(/<[^>]*>?/gm, '')}"
              </div>
            )}

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Select Problem Type
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${
                      selectedReason === r.id
                        ? "border-red-500 bg-red-50/60 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-gray-900">{r.label}</div>
                      <div className="text-[11px] font-medium text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional details */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention what the correct option should be or explain the typo..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
