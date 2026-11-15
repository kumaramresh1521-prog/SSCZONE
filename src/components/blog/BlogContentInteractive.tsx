"use client";

import React, { useState, useEffect } from "react";
import { Languages, CheckCircle2, XCircle, Sparkles, BookOpen } from "lucide-react";

interface Props {
  content: string;
}

export default function BlogContentInteractive({ content }: Props) {
  const [langMode, setLangMode] = useState<"bilingual" | "english" | "hindi">("bilingual");

  // Check if content has bilingual structure
  const isBilingual = content.includes("lang-en") && content.includes("lang-hi");

  useEffect(() => {
    // Interactive MCQ / Quiz option selection handler
    function handleOptionClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(".quiz-option, .option-btn") as HTMLElement;
      if (!target) return;
      const card = target.closest(".quiz-card, .mcq-card, .mcq-question-card, .practice-mcq") as HTMLElement;
      if (!card) return;

      const allOptions = card.querySelectorAll(".quiz-option, .option-btn");
      allOptions.forEach((opt) => {
        opt.classList.remove("selected-correct", "selected-wrong");
      });

      const isCorrect = target.getAttribute("data-is-correct") === "true";
      const correctOption = card.querySelector('.quiz-option[data-is-correct="true"], .option-btn[data-is-correct="true"]') as HTMLElement;

      if (isCorrect) {
        target.classList.add("selected-correct");
      } else {
        target.classList.add("selected-wrong");
        if (correctOption) {
          correctOption.classList.add("selected-correct");
        }
      }

      // Find or dynamically inject interactive explanation/feedback badge
      let feedback = card.querySelector(".quiz-dynamic-feedback") as HTMLElement;
      if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "quiz-dynamic-feedback";
        card.appendChild(feedback);
      }

      const correctKeyEl = correctOption?.querySelector(".quiz-option-key");
      const correctKeyText = correctKeyEl ? correctKeyEl.textContent?.trim() : "Correct Option";

      if (isCorrect) {
        feedback.innerHTML = `
          <div class="feedback-box correct-box">
            <span class="feedback-icon">✓</span>
            <div>
              <strong>Shabash! Sahi Utter (Correct Answer: Option ${correctKeyText})</strong>
              <p>Aapka answer bilkul sahi hai. SSC CGL aur CHSL me aise hi pattern ke direct questions aate hain.</p>
            </div>
          </div>
        `;
      } else {
        feedback.innerHTML = `
          <div class="feedback-box wrong-box">
            <span class="feedback-icon">✕</span>
            <div>
              <strong>Galat Uttar (Incorrect) — Sahi Answer Option ${correctKeyText} Hai</strong>
              <p>Dhyan dein: Is rule ko achhe se revise karein taaki exam me negative marking (-0.50) se bach sakein.</p>
            </div>
          </div>
        `;
      }
      feedback.style.display = "block";

      const explanation = card.querySelector(".mcq-explanation, .explanation-card, .quiz-explanation") as HTMLElement;
      if (explanation) {
        explanation.style.display = "block";
      }
    }

    document.addEventListener("click", handleOptionClick);
    return () => document.removeEventListener("click", handleOptionClick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Bilingual Language Switcher (if article is bilingual) */}
      {isBilingual && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 text-slate-900 p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Languages className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Choose Language Mode / भाषा चुनें</p>
              <p className="text-[11px] text-slate-500">Read in Dual Bilingual, English Only, or Hindi Only</p>
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setLangMode("bilingual")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                langMode === "bilingual"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              🌐 Bilingual (द्विभाषी)
            </button>
            <button
              type="button"
              onClick={() => setLangMode("english")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                langMode === "english"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLangMode("hindi")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                langMode === "hindi"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      )}

      {/* Main Sanitized Article Body with Dynamic CSS Classes */}
      <div
        className={`blog-rendered-content lang-mode-${langMode} prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-3xl shadow-xs border border-gray-200 text-sm sm:text-base leading-relaxed text-slate-800`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Injected CSS for Interactive MCQs & Bilingual Rendering */}
      <style jsx global>{`
        /* Language Toggle Visibility Rules */
        .lang-mode-english .lang-hi {
          display: none !important;
        }
        .lang-mode-hindi .lang-en {
          display: none !important;
        }
        .lang-mode-bilingual .lang-en {
          display: block;
        }
        .lang-mode-bilingual .lang-hi {
          display: block;
        }

        /* Inline language spans */
        .lang-mode-english span.lang-hi {
          display: none !important;
        }
        .lang-mode-hindi span.lang-en {
          display: none !important;
        }
        .lang-mode-bilingual span.lang-en {
          display: inline;
        }
        .lang-mode-bilingual span.lang-hi {
          display: inline;
        }

        /* Language Card Borders */
        .lang-card-en {
          border-left: 4px solid #3b82f6;
          background: #f8fafc;
          padding: 14px 18px;
          border-radius: 0 14px 14px 0;
          margin: 12px 0;
        }
        .lang-card-hi {
          border-left: 4px solid #10b981;
          background: #f0fdf4;
          padding: 14px 18px;
          border-radius: 0 14px 14px 0;
          margin: 12px 0;
        }

        /* Quiz / MCQ Card Styling */
        .quiz-card, .mcq-card, .mcq-question-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 18px;
          padding: 22px;
          margin: 28px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .quiz-badge, .mcq-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 14px;
        }
        .quiz-question, .mcq-stem {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .quiz-options, .mcq-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .quiz-option, .option-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .quiz-option:hover, .option-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          transform: translateX(3px);
        }
        .quiz-option-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          width: 24px;
          border-radius: 6px;
          background: #e2e8f0;
          font-weight: 800;
          font-size: 12px;
          color: #334155;
          shrink: 0;
        }
        .quiz-option.selected-correct, .option-btn.selected-correct {
          background: #ecfdf5 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }
        .quiz-option.selected-correct .quiz-option-key,
        .option-btn.selected-correct .quiz-option-key {
          background: #10b981;
          color: #ffffff;
        }
        .quiz-option.selected-correct::after, .option-btn.selected-correct::after {
          content: " ✓ Sahi (Correct)";
          margin-left: auto;
          font-size: 11px;
          font-weight: 800;
          color: #059669;
        }
        .quiz-option.selected-wrong, .option-btn.selected-wrong {
          background: #fef2f2 !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
        }
        .quiz-option.selected-wrong .quiz-option-key,
        .option-btn.selected-wrong .quiz-option-key {
          background: #ef4444;
          color: #ffffff;
        }
        .quiz-option.selected-wrong::after, .option-btn.selected-wrong::after {
          content: " ✕ Galat (Incorrect)";
          margin-left: auto;
          font-size: 11px;
          font-weight: 800;
          color: #dc2626;
        }

        /* Dynamic Feedback Card */
        .quiz-dynamic-feedback {
          margin-top: 16px;
          animation: fadeIn 0.25s ease-out;
        }
        .feedback-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }
        .feedback-icon {
          font-size: 16px;
          font-weight: 900;
          height: 24px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          shrink: 0;
        }
        .correct-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }
        .correct-box .feedback-icon {
          background: #10b981;
          color: white;
        }
        .wrong-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }
        .wrong-box .feedback-icon {
          background: #ef4444;
          color: white;
        }

        /* Rule Cards, Tables, Notes */
        .callout-box, .rule-card, .rule-box {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-left: 5px solid #2563eb;
          border-radius: 14px;
          padding: 18px 22px;
          margin: 22px 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .callout-box.alert {
          border-left-color: #ef4444;
          background: #fff5f5;
        }
        .callout-box.info {
          border-left-color: #3b82f6;
          background: #f0f7ff;
        }
        .notes-table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 13.5px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .notes-table th {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 800;
          text-align: left;
          padding: 14px 18px;
          border: 1px solid #cbd5e1;
        }
        .notes-table td {
          padding: 12px 18px;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        .notes-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .notes-table tr:hover {
          background: #f1f5f9;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
