"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, CheckCircle2, Trash2, Edit, X, Save, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type QuestionReport = {
  id: number;
  question_id: number;
  user_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  question?: {
    question_text: string;
    topic_id: number;
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
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<FullQuestionData | null>(null);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

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
      setReports(local.map((item: any, index: number) => ({
        id: index + 1,
        question_id: item.question_id,
        user_id: item.user_id,
        reason: item.reason,
        description: item.description,
        status: "pending",
        created_at: item.timestamp,
      })));
    } finally {
      setLoading(false);
    }
  }

  async function openEditModal(questionId: number, reportId: number) {
    setEditingReportId(reportId);
    setLoadingQuestion(true);
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error || !data) {
        toast.error("Could not fetch question details.");
        return;
      }

      setEditingQuestion(data);
    } catch {
      toast.error("Failed to load question for editing.");
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuestion) return;

    setSavingQuestion(true);
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          question_text: editingQuestion.question_text,
          option_a: editingQuestion.option_a,
          option_b: editingQuestion.option_b,
          option_c: editingQuestion.option_c,
          option_d: editingQuestion.option_d,
          correct_answer: editingQuestion.correct_answer,
          explanation: editingQuestion.explanation,
        })
        .eq("id", editingQuestion.id);

      if (error) throw error;

      toast.success(`Question #${editingQuestion.id} updated successfully! 🎉`);

      // Automatically mark report as resolved
      if (editingReportId) {
        await updateStatus(editingReportId, "resolved");
      }

      setEditingQuestion(null);
      setEditingReportId(null);
      fetchReports();
    } catch {
      toast.error("Failed to save question edits.");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function updateStatus(reportId: number | string, newStatus: string, recordSource?: string) {
    // 1. Immediately update UI state
    setReports((prev) =>
      prev.map((r: any) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    toast.success(`Report marked as ${newStatus}!`);

    // 2. Persist in background via API
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

  async function deleteReport(reportId: number) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    toast.success("Report deleted.");

    try {
      await supabase.from("question_reports").delete().eq("id", reportId);
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

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Flag className="h-4 w-4 fill-red-500" />
            <span>Student Feedback & Quality Control</span>
          </div>
          <h1 className="text-2xl font-black text-white">Flagged Question Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user-reported typos, wrong option keys, and solution errors submitted by aspirants.
          </p>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          {["all", "pending", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / List */}
      {loading ? (
        <div className="flex py-16 items-center justify-center text-slate-400 gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span className="text-xs font-bold">Loading flagged questions...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-black text-white">No Flagged Questions Found!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All student question reports have been reviewed or resolved. Excellent question quality!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className={`rounded-2xl border p-5 transition-all ${
                rep.status === "pending"
                  ? "border-red-900/60 bg-slate-900/90 shadow-lg"
                  : "border-slate-800 bg-slate-900/40 opacity-75"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left side info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-red-950 px-2.5 py-1 text-[11px] font-black text-red-300 border border-red-800 uppercase tracking-wider">
                      {rep.reason.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Question ID: <strong className="text-white">#{rep.question_id}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(rep.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Question snippet */}
                  {rep.question && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
                      <strong className="text-slate-400 block mb-0.5">Question Text:</strong>
                      "{rep.question.question_text.replace(/<[^>]*>?/gm, "")}"
                      <div className="mt-1 text-[11px] font-bold text-emerald-400">
                        Current Key: Option {rep.question.correct_answer}
                      </div>
                    </div>
                  )}

                  {/* Student note */}
                  {rep.description && (
                    <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-xl">
                      <strong className="text-amber-400">Student Note:</strong> {rep.description}
                    </div>
                  )}
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* Edit Question Button */}
                  <button
                    onClick={() => openEditModal(rep.question_id, rep.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-600/60 bg-blue-950/80 px-3.5 py-2 text-xs font-black text-blue-300 hover:bg-blue-900 transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Question</span>
                  </button>

                  {/* Mark Resolved / Pending Toggle */}
                  {rep.status === "pending" ? (
                    <button
                      onClick={() => updateStatus(rep.id, "resolved")}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-950/80 px-3.5 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-900 transition-all cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(rep.id, "pending")}
                      title="Click to mark back as Pending"
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-800 bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-emerald-950" />
                      <span>Resolved (Click for Pending)</span>
                    </button>
                  )}

                  {/* Delete Report */}
                  <button
                    onClick={() => deleteReport(rep.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition-all"
                    title="Delete report entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-black">
                <Edit className="h-4 w-4" />
                <span>Quick Edit Question #{editingQuestion.id}</span>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="text-xs font-extrabold uppercase text-slate-400 block mb-1">
                  Question Text
                </label>
                <textarea
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const key = `option_${opt.toLowerCase()}` as keyof FullQuestionData;
                  return (
                    <div key={opt}>
                      <label className="text-xs font-extrabold uppercase text-slate-400 block mb-1">
                        Option {opt}
                      </label>
                      <input
                        type="text"
                        value={String(editingQuestion[key] || "")}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, [key]: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Selection */}
              <div>
                <label className="text-xs font-extrabold uppercase text-amber-400 block mb-1">
                  Correct Answer Key
                </label>
                <select
                  value={editingQuestion.correct_answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                  className="w-full rounded-xl border border-amber-600/60 bg-amber-950/40 p-2.5 text-xs font-extrabold text-amber-300 focus:border-amber-500 focus:outline-none"
                >
                  <option value="A" className="bg-slate-900 text-white">Option A</option>
                  <option value="B" className="bg-slate-900 text-white">Option B</option>
                  <option value="C" className="bg-slate-900 text-white">Option C</option>
                  <option value="D" className="bg-slate-900 text-white">Option D</option>
                </select>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-extrabold uppercase text-slate-400 block mb-1">
                  Explanation / Solution
                </label>
                <textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingQuestion ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save & Resolve Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
