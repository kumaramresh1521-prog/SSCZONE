"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Flag,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Save,
  LoaderCircle,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  Check,
  SplitSquareVertical,
  Layers,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MathText from "@/components/MathText";
import toast from "react-hot-toast";

type QuestionReport = {
  id: number | string;
  question_id: number;
  user_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  record_source?: string;
  question?: {
    id?: number;
    question_text: string;
    topic_id?: number;
    paper_id?: number;
    paper_title?: string;
    question_number?: number;
    correct_answer: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    explanation?: string;
  };
};

type FullQuestionData = {
  id: number;
  question_text: string;
  question_text_hi?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_hi?: string;
  option_b_hi?: string;
  option_c_hi?: string;
  option_d_hi?: string;
  correct_answer: string;
  explanation?: string;
  explanation_hi?: string;
  paper_id?: number;
  question_number?: number;
  paper_title?: string;
  _isPaperQ?: boolean;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Inline Preview expansion state for cards
  const [expandedPreviews, setExpandedPreviews] = useState<Record<string, boolean>>({});

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<FullQuestionData | null>(null);
  const [originalQuestion, setOriginalQuestion] = useState<FullQuestionData | null>(null);
  const [editingReport, setEditingReport] = useState<QuestionReport | null>(null);
  const [editingReportId, setEditingReportId] = useState<number | string | null>(null);
  const [modalPreviewTab, setModalPreviewTab] = useState<"after" | "before" | "diff">("after");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Active input ref for Math Toolbar insert
  const activeInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
      } else {
        throw new Error("Failed to fetch reports");
      }
    } catch {
      // Fallback to local storage reports if offline
      const local = JSON.parse(localStorage.getItem("ssczone_local_reports") || "[]");
      setReports(
        local.map((item: any, index: number) => ({
          id: index + 1,
          question_id: item.question_id,
          user_id: item.user_id,
          reason: item.reason,
          description: item.description,
          status: "pending",
          created_at: item.timestamp,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePreview(id: string | number) {
    const key = String(id);
    setExpandedPreviews((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleAllPreviews() {
    const areAllOpen = reports.length > 0 && reports.every((r) => expandedPreviews[String(r.id)]);
    const next: Record<string, boolean> = {};
    reports.forEach((r) => {
      next[String(r.id)] = !areAllOpen;
    });
    setExpandedPreviews(next);
  }

  async function openEditModal(questionId: number, reportId: number | string) {
    setEditingReportId(reportId);
    const matchedRep = reports.find((r) => String(r.id) === String(reportId)) || null;
    setEditingReport(matchedRep);
    setLoadingQuestion(true);
    setModalPreviewTab("after");

    try {
      let { data } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .maybeSingle();

      let isPaperQ = false;
      if (!data) {
        const pqRes = await supabase
          .from("paper_questions")
          .select("*, paper:previous_papers(title)")
          .eq("id", questionId)
          .maybeSingle();
        if (pqRes.data) {
          data = {
            ...pqRes.data,
            paper_title: pqRes.data.paper?.title,
          };
          isPaperQ = true;
        }
      }

      if (!data) {
        // Fallback from report data if available
        if (matchedRep?.question) {
          data = {
            id: questionId,
            question_text: matchedRep.question.question_text,
            option_a: matchedRep.question.option_a || "",
            option_b: matchedRep.question.option_b || "",
            option_c: matchedRep.question.option_c || "",
            option_d: matchedRep.question.option_d || "",
            correct_answer: matchedRep.question.correct_answer || "A",
            explanation: matchedRep.question.explanation || "",
            paper_id: matchedRep.question.paper_id,
            question_number: matchedRep.question.question_number,
            paper_title: matchedRep.question.paper_title,
          };
          isPaperQ = !!matchedRep.question.paper_id;
        } else {
          toast.error("Could not fetch question details.");
          return;
        }
      }

      const qObj = { ...data, _isPaperQ: isPaperQ } as FullQuestionData;
      setEditingQuestion(qObj);
      setOriginalQuestion(JSON.parse(JSON.stringify(qObj)));
    } catch {
      toast.error("Failed to load question for editing.");
    } finally {
      setLoadingQuestion(false);
    }
  }

  function insertMathSnippet(snippet: string) {
    if (!editingQuestion) return;
    setEditingQuestion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        question_text: (prev.question_text || "") + " " + snippet,
      };
    });
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuestion) return;

    setSavingQuestion(true);
    try {
      if (editingQuestion._isPaperQ) {
        const res = await fetch("/api/papers/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingQuestion.id,
            paper_id: editingQuestion.paper_id || 1,
            question_number: editingQuestion.question_number || 1,
            question_text: editingQuestion.question_text,
            option_a: editingQuestion.option_a,
            option_b: editingQuestion.option_b,
            option_c: editingQuestion.option_c,
            option_d: editingQuestion.option_d,
            correct_answer: editingQuestion.correct_answer,
            explanation: editingQuestion.explanation,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to save");
      } else {
        const res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingQuestion.id,
            question_text: editingQuestion.question_text,
            option_a: editingQuestion.option_a,
            option_b: editingQuestion.option_b,
            option_c: editingQuestion.option_c,
            option_d: editingQuestion.option_d,
            correct_answer: editingQuestion.correct_answer,
            explanation: editingQuestion.explanation,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to save");
      }

      toast.success(`Question #${editingQuestion.id} updated & synced everywhere! 🎉`);

      // Automatically mark report as resolved
      if (editingReportId) {
        await updateStatus(editingReportId, "resolved", editingReport?.record_source);
      }

      setEditingQuestion(null);
      setOriginalQuestion(null);
      setEditingReport(null);
      setEditingReportId(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || "Failed to save question edits.");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function updateStatus(reportId: number | string, newStatus: string, recordSource?: string) {
    setReports((prev) =>
      prev.map((r: any) => (String(r.id) === String(reportId) ? { ...r, status: newStatus } : r))
    );
    toast.success(`Report marked as ${newStatus}!`);

    try {
      await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportId,
          status: newStatus,
          record_source: recordSource,
        }),
      });
    } catch {}
  }

  async function deleteReport(reportId: number | string, recordSource?: string) {
    setReports((prev) => prev.filter((r) => String(r.id) !== String(reportId)));
    toast.success("Report deleted.");

    try {
      if (recordSource === "blogs_sys" || (typeof reportId === "string" && reportId.includes("-"))) {
        await supabase.from("blogs").delete().eq("id", reportId);
      } else {
        await supabase.from("question_reports").delete().eq("id", reportId);
      }
      const local = JSON.parse(localStorage.getItem("ssczone_local_reports") || "[]");
      const updatedLocal = local.filter((r: any, idx: number) => idx + 1 !== reportId && r.id !== reportId);
      localStorage.setItem("ssczone_local_reports", JSON.stringify(updatedLocal));
    } catch {}
  }

  const filteredReports = reports.filter((r) => {
    if (filterStatus === "pending") return r.status === "pending";
    if (filterStatus === "resolved") return r.status === "resolved";
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Flag className="h-4 w-4 fill-red-500" />
            <span>Student Feedback & Quality Control</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span>Flagged Question Reports</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800">
              {pendingCount} Pending Fixes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Review user-reported typos, wrong answer keys, and broken symbols. Examine the{" "}
            <strong className="text-red-400">Error Preview</strong>, edit live, and verify the{" "}
            <strong className="text-emerald-400">After Changes Preview</strong> before saving.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {reports.length > 0 && (
            <button
              onClick={toggleAllPreviews}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <SplitSquareVertical className="h-3.5 w-3.5" />
              <span>Toggle All Previews</span>
            </button>
          )}

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {[
              { key: "all", label: "All", count: reports.length },
              { key: "pending", label: "Pending", count: pendingCount },
              { key: "resolved", label: "Resolved", count: resolvedCount },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setFilterStatus(st.key)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === st.key
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                <span>{st.label}</span>
                <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/30">
                  {st.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reports List ── */}
      {loading ? (
        <div className="flex py-16 items-center justify-center text-slate-400 gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin text-red-500" />
          <span className="text-xs font-bold">Loading flagged questions & previews...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-black text-white">No Flagged Questions Found!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterStatus === "pending"
              ? "All student question reports have been reviewed and resolved. Excellent quality!"
              : "No reports matching the current filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((rep) => {
            const isPreviewOpen = !!expandedPreviews[String(rep.id)];
            const hasFullQuestion = !!(rep.question && (rep.question.option_a || rep.question.question_text));

            return (
              <div
                key={rep.id}
                className={`rounded-2xl border transition-all ${
                  rep.status === "pending"
                    ? "border-red-900/60 bg-slate-900/90 shadow-lg"
                    : "border-slate-800 bg-slate-900/40 opacity-80"
                }`}
              >
                {/* ── Card Header / Main Row ── */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Meta & Complaint */}
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-md bg-red-950 px-2.5 py-1 text-[11px] font-black text-red-300 border border-red-800 uppercase tracking-wider">
                          {rep.reason.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          Question ID: <strong className="text-white">#{rep.question_id}</strong>
                        </span>
                        {rep.question?.paper_title && (
                          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/60 flex items-center gap-1">
                            <span>📄 {rep.question.paper_title}</span>
                            {rep.question.question_number && (
                              <span className="text-amber-200 font-extrabold ml-1">
                                [Q.{rep.question.question_number}]
                              </span>
                            )}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {new Date(rep.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Student Note / Reported Error Callout */}
                      {rep.description ? (
                        <div className="text-xs text-amber-200 bg-amber-950/50 border border-amber-900/80 p-3 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <strong className="text-amber-400 block font-black uppercase text-[10px] tracking-wide mb-0.5">
                              Student Report Note:
                            </strong>
                            <p className="font-medium text-amber-100">{rep.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 bg-slate-950/40 border border-slate-800 p-2 rounded-xl flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>Student flagged this question for: <strong className="text-slate-200">{rep.reason.replace(/_/g, " ")}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Toggle Preview Button */}
                      <button
                        onClick={() => togglePreview(rep.id)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                          isPreviewOpen
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                        title="Toggle Error Preview (Student Exam View)"
                      >
                        {isPreviewOpen ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-red-400" />
                            <span>Hide Preview</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-blue-400" />
                            <span>Error Preview</span>
                          </>
                        )}
                      </button>

                      {/* Edit Question Button */}
                      <button
                        onClick={() => openEditModal(rep.question_id, rep.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-blue-600/70 bg-blue-950/90 px-3.5 py-2 text-xs font-black text-blue-200 hover:bg-blue-900 transition-all cursor-pointer shadow-xs"
                      >
                        <Edit className="h-3.5 w-3.5 text-blue-400" />
                        <span>Edit & Fix</span>
                      </button>

                      {/* Mark Resolved / Pending Toggle */}
                      {rep.status === "pending" ? (
                        <button
                          onClick={() => updateStatus(rep.id, "resolved", rep.record_source)}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-950/80 px-3.5 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-900 transition-all cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Mark Resolved</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(rep.id, "pending", rep.record_source)}
                          title="Click to mark back as Pending"
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-slate-900" />
                          <span>Resolved</span>
                        </button>
                      )}

                      {/* Delete Report */}
                      <button
                        onClick={() => deleteReport(rep.id, rep.record_source)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition-all cursor-pointer"
                        title="Delete report entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Expandable Live Error Preview (Student Exam View) ── */}
                {isPreviewOpen && (
                  <div className="border-t border-slate-800 bg-slate-950/95 p-4 sm:p-6 rounded-b-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-950 border border-red-800 text-red-400 text-xs">
                          ❌
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-400">
                          Error Preview (As Seen by Students in Exam)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          Current DB Answer Key:{" "}
                          <strong className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            Option {rep.question?.correct_answer || "N/A"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Question Text Box */}
                    <div className="bg-white rounded-xl p-4 text-slate-900 shadow-md">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                        <span>Question Body:</span>
                      </div>
                      <div className="text-sm font-medium leading-relaxed">
                        <MathText text={rep.question?.question_text || "— No question text available —"} />
                      </div>
                    </div>

                    {/* Options Grid (A, B, C, D) */}
                    {rep.question && (rep.question.option_a || rep.question.option_b) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const optKey = `option_${opt.toLowerCase()}` as keyof typeof rep.question;
                          const val = String(rep.question?.[optKey] || "");
                          const isCorrect = (rep.question?.correct_answer || "").toUpperCase() === opt;

                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border text-xs transition-all ${
                                isCorrect
                                  ? "bg-emerald-950/40 border-emerald-700/80 text-emerald-200"
                                  : "bg-slate-900/80 border-slate-800 text-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-black text-[11px] px-2 py-0.5 rounded-md ${
                                    isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  Option {opt}
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Correct Key
                                  </span>
                                )}
                              </div>
                              <div className="pt-1">
                                <MathText text={val || "— empty —"} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {rep.question?.explanation && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300">
                        <strong className="text-blue-400 block font-bold mb-1">
                          Explanation / Solution:
                        </strong>
                        <MathText text={rep.question.explanation} />
                      </div>
                    )}

                    {/* Quick Button to Open Dual-Pane Editor */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => openEditModal(rep.question_id, rep.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-md"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Fix This Question Now</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dual-Pane Workbench: Live Error vs After Changes Preview Modal ── */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Edit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Edit Question #{editingQuestion.id}</span>
                    {editingQuestion.paper_title && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        {editingQuestion.paper_title} {editingQuestion.question_number ? `[Q.${editingQuestion.question_number}]` : ""}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dual-Pane Editor: Edit inputs on the left & verify real-time{" "}
                    <span className="text-emerald-400 font-bold">After Changes Preview</span> on the right.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setOriginalQuestion(null);
                  setEditingReport(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Split Workbench */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ── LEFT PANE: Editor Form ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    <span>Inputs & Question Editor</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Type or click math buttons below
                  </span>
                </div>

                {/* Math & KaTeX Quick Snippet Toolbar */}
                <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-indigo-400 mr-1 flex items-center gap-1">
                    📐 Math:
                  </span>
                  {[
                    { label: "Fraction", code: "\\frac{a}{b}" },
                    { label: "Root √", code: "\\sqrt{x}" },
                    { label: "Power x²", code: "x^{2}" },
                    { label: "Triangle △", code: "\\triangle ABC" },
                    { label: "Angle ∠", code: "\\angle B" },
                    { label: "Degree °", code: "^{\\circ}" },
                    { label: "Times ×", code: "\\times" },
                    { label: "Pi π", code: "\\pi" },
                    { label: "Theta θ", code: "\\theta" },
                    { label: "±", code: "\\pm" },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => insertMathSnippet(btn.code)}
                      className="px-2 py-1 text-[11px] font-mono font-bold bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 rounded hover:bg-indigo-900 hover:text-white transition-all cursor-pointer"
                      title={`Insert ${btn.code}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Question Text */}
                <div>
                  <label className="text-xs font-extrabold uppercase text-slate-300 block mb-1">
                    Question Text (LaTeX & Markdown supported)
                  </label>
                  <textarea
                    value={editingQuestion.question_text}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="Enter question text or math formulas..."
                    required
                  />
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-extrabold uppercase text-slate-300 block">
                    Options (A, B, C, D)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const key = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                      const isSelected = editingQuestion.correct_answer === opt;

                      return (
                        <div key={opt} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold text-slate-400">
                              Option {opt}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                                <Check className="h-3 w-3" /> Key
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={String(editingQuestion[key] || "")}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                [key]: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white font-mono focus:outline-none ${
                              isSelected
                                ? "border-emerald-600 focus:border-emerald-500 ring-1 ring-emerald-600/30"
                                : "border-slate-700 focus:border-blue-500"
                            }`}
                            placeholder={`Option ${opt} text`}
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Correct Answer Key Selector */}
                <div>
                  <label className="text-xs font-extrabold uppercase text-amber-400 block mb-1">
                    Correct Answer Key
                  </label>
                  <select
                    value={editingQuestion.correct_answer}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })
                    }
                    className="w-full rounded-xl border border-amber-600/70 bg-amber-950/40 p-2.5 text-xs font-black text-amber-300 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="A" className="bg-slate-900 text-white">
                      Option A
                    </option>
                    <option value="B" className="bg-slate-900 text-white">
                      Option B
                    </option>
                    <option value="C" className="bg-slate-900 text-white">
                      Option C
                    </option>
                    <option value="D" className="bg-slate-900 text-white">
                      Option D
                    </option>
                  </select>
                </div>

                {/* Explanation */}
                <div>
                  <label className="text-xs font-extrabold uppercase text-slate-300 block mb-1">
                    Explanation / Solution
                  </label>
                  <textarea
                    value={editingQuestion.explanation || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="Enter detailed solution..."
                  />
                </div>
              </div>

              {/* ── RIGHT PANE: Dual Preview (Tabs) ── */}
              <div className="space-y-4 flex flex-col">
                {/* Preview Tabs */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModalPreviewTab("after")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        modalPreviewTab === "after"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>After Changes Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalPreviewTab("before")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        modalPreviewTab === "before"
                          ? "bg-red-900 text-red-100 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      <span>Original Error State</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalPreviewTab("diff")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        modalPreviewTab === "diff"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      <span>Side-by-Side Diff</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                    Live KaTeX Renderer
                  </span>
                </div>

                {/* ── TAB 1: AFTER CHANGES PREVIEW (Live Exam Simulation) ── */}
                {modalPreviewTab === "after" && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="bg-emerald-950/40 border border-emerald-800/80 p-2.5 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        Live Student Exam Preview (Updates as you type)
                      </span>
                      <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/80 font-black">
                        Key: Option {editingQuestion.correct_answer}
                      </span>
                    </div>

                    {/* Question Canvas (White Paper Style) */}
                    <div className="bg-white rounded-xl p-5 text-slate-900 shadow-xl border border-slate-200 space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Question:
                        </div>
                        <div className="text-sm font-medium leading-relaxed">
                          <MathText text={editingQuestion.question_text || "— empty —"} />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const key = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                          const val = String(editingQuestion[key] || "");
                          const isKey = editingQuestion.correct_answer === opt;

                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-all ${
                                isKey
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            >
                              <span
                                className={`font-black px-2 py-0.5 rounded text-[11px] shrink-0 ${
                                  isKey
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {opt}
                              </span>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <MathText text={val || "— empty —"} />
                              </div>
                              {isKey && (
                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                                  Correct Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Preview */}
                      {editingQuestion.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-950">
                          <strong className="text-blue-700 block font-black uppercase text-[10px] mb-0.5">
                            Solution / Explanation Preview:
                          </strong>
                          <MathText text={editingQuestion.explanation} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB 2: ORIGINAL ERROR STATE (Before) ── */}
                {modalPreviewTab === "before" && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Student Complaint Alert */}
                    {editingReport?.description && (
                      <div className="bg-amber-950/60 border border-amber-900 p-3 rounded-xl text-amber-200 text-xs">
                        <strong className="text-amber-400 block font-black uppercase text-[10px] mb-1">
                          Student Reported Complaint:
                        </strong>
                        <p>{editingReport.description}</p>
                      </div>
                    )}

                    <div className="bg-slate-950/80 border border-red-950 p-4 rounded-xl space-y-3 flex-1 overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                          Original Untouched Database Content
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Original Key: Option {originalQuestion?.correct_answer || "N/A"}
                        </span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200 text-xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Original Question:
                        </div>
                        <MathText text={originalQuestion?.question_text || "— empty —"} />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const key = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                          const val = String(originalQuestion?.[key] || "");
                          const isKey = originalQuestion?.correct_answer === opt;
                          return (
                            <div
                              key={opt}
                              className={`p-2.5 rounded-lg border text-xs ${
                                isKey
                                  ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                                  : "bg-slate-900 border-slate-800 text-slate-300"
                              }`}
                            >
                              <div className="font-bold text-[10px] text-slate-400 mb-0.5">
                                Option {opt} {isKey ? "(Original Key)" : ""}
                              </div>
                              <MathText text={val || "— empty —"} />
                            </div>
                          );
                        })}
                      </div>

                      {originalQuestion?.explanation && (
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 text-xs">
                          <strong className="text-slate-400 block font-bold mb-1">
                            Original Explanation:
                          </strong>
                          <MathText text={originalQuestion.explanation} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: SIDE-BY-SIDE DIFF ── */}
                {modalPreviewTab === "diff" && (
                  <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
                    {/* Before Column */}
                    <div className="border border-red-950 bg-slate-950/80 p-3.5 rounded-xl space-y-3">
                      <div className="text-xs font-black text-red-400 border-b border-red-950/80 pb-1.5 flex items-center justify-between">
                        <span>🔴 Before (Original Error)</span>
                        <span className="text-[10px] bg-red-950 px-1.5 py-0.5 rounded text-red-300 font-bold">
                          Key: {originalQuestion?.correct_answer}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <strong className="text-slate-500 block text-[10px]">Question:</strong>
                        <MathText text={originalQuestion?.question_text || ""} />
                      </div>
                      <div className="space-y-1 text-xs">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const k = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                          return (
                            <div key={opt} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                              <span className="font-bold text-slate-400">{opt}: </span>
                              <MathText text={String(originalQuestion?.[k] || "")} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* After Column */}
                    <div className="border border-emerald-950 bg-slate-950/80 p-3.5 rounded-xl space-y-3">
                      <div className="text-xs font-black text-emerald-400 border-b border-emerald-950/80 pb-1.5 flex items-center justify-between">
                        <span>🟢 After (Fixed Version)</span>
                        <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                          Key: {editingQuestion.correct_answer}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200">
                        <strong className="text-slate-500 block text-[10px]">Question:</strong>
                        <MathText text={editingQuestion.question_text || ""} />
                      </div>
                      <div className="space-y-1 text-xs">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const k = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                          const changed =
                            String(editingQuestion[k] || "") !== String(originalQuestion?.[k] || "");
                          return (
                            <div
                              key={opt}
                              className={`p-1.5 rounded border ${
                                changed
                                  ? "bg-emerald-950/40 border-emerald-700 text-emerald-200"
                                  : "bg-slate-900 border-slate-800"
                              }`}
                            >
                              <span className="font-bold text-slate-400">{opt}: </span>
                              <MathText text={String(editingQuestion[k] || "")} />
                              {changed && (
                                <span className="ml-1 text-[9px] font-black uppercase text-emerald-400">
                                  [Edited]
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/80 shrink-0">
              <div className="text-xs text-slate-400">
                Saving will sync to Database, PYQ Backups, and auto-resolve this report.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setOriginalQuestion(null);
                    setEditingReport(null);
                  }}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  disabled={savingQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingQuestion ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes & Mark Resolved</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
