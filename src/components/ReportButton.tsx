"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import ReportQuestionModal from "@/components/ReportQuestionModal";

type ReportButtonProps = {
  questionId: number | string;
  questionText?: string;
  className?: string;
  showLabel?: boolean;
};

export default function ReportButton({
  questionId,
  questionText,
  className = "",
  showLabel = true,
}: ReportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Safely extract numeric ID from strings like "pyq_2003" or "bank_105"
  const numericId =
    typeof questionId === "number"
      ? questionId
      : parseInt(String(questionId || "").replace(/\D/g, ""), 10) || 1;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        aria-label="Report an error or mistake in this question"
        title="Flag or report an error in this question (सवाल में कोई गलती रिपोर्ट करें)"
        className={
          className ||
          `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 select-none ${
            showLabel ? "" : "w-8 h-8 justify-center p-0"
          }`
        }
      >
        <Flag className="h-3.5 w-3.5 text-rose-600 fill-rose-600 shrink-0" />
        {showLabel && (
          <span className="font-bold whitespace-nowrap">
            <span className="hidden sm:inline">Report Error</span>
            <span className="sm:hidden">Report</span>
          </span>
        )}
      </button>

      <ReportQuestionModal
        questionId={numericId}
        questionText={questionText}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
