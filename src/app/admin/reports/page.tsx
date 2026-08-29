"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, CheckCircle2, Trash2, Edit, AlertCircle, ExternalLink, LoaderCircle } from "lucide-react";
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
  };
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("question_reports")
        .select("*, question:questions(question_text, topic_id, correct_answer)")
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback to local storage reports if table not in schema cache
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
      } else {
        setReports(data || []);
      }
    } catch {
      toast.error("Error fetching question reports.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reportId: number, newStatus: string) {
    try {
      const { error } = await supabase
        .from("question_reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (!error) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        toast.success(`Report #${reportId} marked as ${newStatus}!`);
      }
    } catch {
      toast.error("Failed to update report status.");
    }
  }

  async function deleteReport(reportId: number) {
    try {
      await supabase.from("question_reports").delete().eq("id", reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success("Report deleted.");
    } catch {
      toast.error("Could not delete report.");
    }
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
                  
                  {/* Edit Question Link */}
                  <Link
                    href={`/admin/questions?id=${rep.question_id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-xl border border-blue-600/60 bg-blue-950/80 px-3 py-2 text-xs font-black text-blue-300 hover:bg-blue-900 transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Question</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </Link>

                  {/* Mark Resolved */}
                  {rep.status === "pending" ? (
                    <button
                      onClick={() => updateStatus(rep.id, "resolved")}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-950/80 px-3 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-900 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-800">
                      ✓ Resolved
                    </span>
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
    </div>
  );
}
