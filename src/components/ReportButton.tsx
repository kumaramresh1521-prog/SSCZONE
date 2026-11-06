"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import ReportQuestionModal from "@/components/ReportQuestionModal";

type ReportButtonProps = {
  questionId: number;
  questionText?: string;
  className?: string;
  showLabel?: boolean;
};

export default function ReportButton({
  questionId,
  questionText,
  className = "",
  showLabel = false,
}: ReportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Report question mistake"
        title="Flag or report an error in this question (सवाल में गलती रिपोर्ट करें)"
        className={
          className ||
          (showLabel
            ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
            : "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:bg-red-50/70 hover:text-red-600 transition-all cursor-pointer shadow-2xs")
        }
      >
        <Flag className="h-3.5 w-3.5 text-red-500 shrink-0" />
        {showLabel && <span>Report Error</span>}
      </button>

      <ReportQuestionModal
        questionId={questionId}
        questionText={questionText}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
