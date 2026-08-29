"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import ReportQuestionModal from "@/components/ReportQuestionModal";

type ReportButtonProps = {
  questionId: number;
  questionText?: string;
};

export default function ReportButton({ questionId, questionText }: ReportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Report question mistake"
        title="Flag or report an error in this question"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:bg-red-50/70 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
      >
        <Flag className="h-4 w-4" />
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
