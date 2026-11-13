"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, SkipForward, RefreshCw, FlaskConical, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { resolveAssetUrl } from "@/lib/utils";
import MathText from "@/components/MathText";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReviewStatus = "pending" | "approved" | "rejected" | "skipped";

interface MathReviewRow {
  id: number;
  question_id: number;
  paper_id: number;
  question_number: number | null;
  field_name: string;
  original_text: string;
  suggested_latex: string | null;
  admin_latex: string | null;
  final_latex: string | null;
  status: ReviewStatus;
  source_image_url: string | null;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

type FilterStatus = "pending" | "approved" | "rejected" | "skipped" | "all";

// ─── Image URL Extractor Helper ────────────────────────────────────────────────
function extractImageUrl(text?: string | null, sourceUrl?: string | null): string | null {
  if (sourceUrl && sourceUrl.trim()) return sourceUrl.trim();
  if (!text) return null;
  const m = text.match(/!\[.*?\]\((.*?)\)/);
  return m ? m[1].trim() : null;
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ counts }: { counts: Record<FilterStatus, number> }) {
  const chips: { label: string; key: FilterStatus; color: string }[] = [
    { label: "Pending",  key: "pending",  color: "#fbbf24" },
    { label: "Approved", key: "approved", color: "#34d399" },
    { label: "Rejected", key: "rejected", color: "#f87171" },
    { label: "Skipped",  key: "skipped",  color: "#94a3b8" },
    { label: "Total",    key: "all",      color: "#60a5fa" },
  ];
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
      {chips.map(({ label, key, color }) => (
        <div key={key} style={{
          background: "rgba(255,255,255,0.045)",
          border: `1px solid ${color}33`,
          borderRadius: 10,
          padding: "0.4rem 0.9rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
          <span style={{ color: "rgba(226,232,240,0.6)", fontSize: "0.78rem" }}>{label}</span>
          <span style={{ color, fontWeight: 800, fontSize: "0.95rem" }}>{counts[key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MathReviewPage() {
  const [rows, setRows]           = useState<MathReviewRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<number | null>(null);
  const [filterStatus, setFilter] = useState<FilterStatus>("pending");
  const [page, setPage]           = useState(0);
  const [counts, setCounts]       = useState<Record<FilterStatus, number>>({
    pending: 0, approved: 0, rejected: 0, skipped: 0, all: 0,
  });
  const [editLatex, setEditLatex] = useState<Record<number, string>>({});
  const [notes, setNotes]         = useState<Record<number, string>>({});
  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null);

  const PAGE_SIZE = 10;

  // ── Fetch counts ──────────────────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    const statuses: ReviewStatus[] = ["pending", "approved", "rejected", "skipped"];
    const results: Record<FilterStatus, number> = { pending: 0, approved: 0, rejected: 0, skipped: 0, all: 0 };
    await Promise.all(
      statuses.map(async (s) => {
        const { count } = await supabase.from("math_review").select("*", { count: "exact", head: true }).eq("status", s);
        results[s] = count ?? 0;
        results.all += count ?? 0;
      })
    );
    setCounts(results);
  }, []);

  // ── Fetch rows ────────────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("math_review")
      .select("*")
      .order("created_at", { ascending: true })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (filterStatus !== "all") q = q.eq("status", filterStatus);

    const { data, error } = await q;
    if (error) {
      setMsg({ text: `DB Error: ${error.message}`, ok: false });
    } else {
      setRows(data ?? []);
      // Pre-fill edit fields with existing admin_latex or suggested_latex
      const edits: Record<number, string> = {};
      const noteMap: Record<number, string> = {};
      for (const r of data ?? []) {
        edits[r.id]   = r.admin_latex ?? r.suggested_latex ?? "";
        noteMap[r.id] = r.review_notes ?? "";
      }
      setEditLatex(edits);
      setNotes(noteMap);
    }
    setLoading(false);
  }, [filterStatus, page]);

  useEffect(() => { fetchRows(); fetchCounts(); }, [fetchRows, fetchCounts]);

  // ── Auto-clear flash message ───────────────────────────────────────────────
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  // ── Action: Approve / Reject / Skip ───────────────────────────────────────
  async function doAction(id: number, newStatus: ReviewStatus) {
    setSaving(id);
    const latex = editLatex[id] ?? "";
    const { error } = await supabase
      .from("math_review")
      .update({
        status:       newStatus,
        admin_latex:  latex || null,
        review_notes: notes[id] || null,
        reviewed_at:  new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMsg({ text: `Error: ${error.message}`, ok: false });
      setSaving(null);
      return;
    }

    // If approved → patch paper_questions
    if (newStatus === "approved") {
      const row = rows.find((r) => r.id === id);
      if (row && latex.trim()) {
        const { error: pqError } = await supabase
          .from("paper_questions")
          .update({ [row.field_name]: latex.trim() })
          .eq("id", row.question_id);
        if (pqError) {
          setMsg({ text: `Approved but DB patch failed: ${pqError.message}`, ok: false });
          setSaving(null);
          return;
        }
      }
    }

    setMsg({ text: newStatus === "approved" ? "✅ Approved & applied to DB!" : newStatus === "rejected" ? "❌ Rejected." : "⏭ Skipped.", ok: newStatus === "approved" });
    setSaving(null);
    setRows((prev) => prev.filter((r) => r.id !== id));
    fetchCounts();
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil((filterStatus === "all" ? counts.all : counts[filterStatus] || 0) / PAGE_SIZE);
  const workingLatex = (id: number) => editLatex[id] ?? "";

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FlaskConical style={{ color: "#fbbf24" }} size={22} />
            Question Content & Math Review
          </div>
          <div className="page-subtitle">
            Review equations, tables, and image questions. Approve to apply to live questions. Reject to keep as-is.
          </div>
        </div>
        <button className="a-btn a-btn-ghost" onClick={() => { fetchRows(); fetchCounts(); }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <StatsBar counts={counts} />

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {(["pending", "approved", "rejected", "skipped", "all"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => { setPage(0); setFilter(s); }}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: 8,
              border: filterStatus === s ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.1)",
              background: filterStatus === s ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.04)",
              color: filterStatus === s ? "#93c5fd" : "rgba(226,232,240,0.6)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s} {s !== "all" && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.65rem 1rem",
          borderRadius: 10,
          background: msg.ok ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${msg.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: msg.ok ? "#6ee7b7" : "#fca5a5",
          fontWeight: 700,
          fontSize: "0.85rem",
        }}>
          {msg.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "rgba(226,232,240,0.4)", fontSize: "0.9rem" }}>
          Loading...
        </div>
      )}

      {/* Empty */}
      {!loading && rows.length === 0 && (
        <div className="a-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
          <div style={{ color: "rgba(226,232,240,0.5)", fontSize: "0.9rem" }}>
            {filterStatus === "pending"
              ? "No pending items. All reviewed! Run extract_math.py to scan more papers."
              : `No items with status "${filterStatus}".`}
          </div>
        </div>
      )}

      {/* Review Cards */}
      {!loading && rows.map((row) => {
        const latex = workingLatex(row.id);
        const isSaving = saving === row.id;

        return (
          <div key={row.id} className="a-card" style={{ marginBottom: "1rem" }}>
            {/* Card Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <span className="a-badge a-badge-blue">Q#{row.question_id}</span>
                <span className="a-badge">Paper {row.paper_id}</span>
                {row.question_number && <span className="a-badge">Q.{row.question_number}</span>}
                <span className="a-badge a-badge-yellow">{row.field_name}</span>
                <span className={`a-badge ${row.status === "approved" ? "a-badge-green" : row.status === "rejected" ? "a-badge-red" : ""}`}>
                  {row.status}
                </span>
              </div>
            </div>

            {/* Three columns: Original | Edit Content | Preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
              {/* Original */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Original Text & Image (DB)
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.82rem",
                  color: "rgba(226,232,240,0.7)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 240,
                  overflowY: "auto",
                }}>
                  <div>{row.original_text || <em style={{ color: "rgba(226,232,240,0.3)" }}>empty</em>}</div>
                  {(() => {
                    const img = extractImageUrl(row.original_text, row.source_image_url);
                    if (!img) return null;
                    const fullUrl = resolveAssetUrl(img);
                    return (
                      <div style={{ marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.5rem" }}>
                        <div style={{ fontSize: "0.68rem", color: "#93c5fd", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <span>Original Crop:</span>
                          <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 2 }}>
                            Open <ExternalLink size={10} />
                          </a>
                        </div>
                        <img
                          src={fullUrl}
                          alt="Original Crop"
                          style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 6, background: "#ffffff", padding: "4px", border: "1px solid rgba(255,255,255,0.2)" }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Edit LaTeX / Table */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Proposed Replacement (Editable)
                </div>
                <textarea
                  value={latex}
                  onChange={(e) => setEditLatex((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  disabled={isSaving || row.status !== "pending"}
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontFamily: "monospace",
                    resize: "vertical",
                    outline: "none",
                    opacity: row.status !== "pending" ? 0.5 : 1,
                  }}
                  placeholder="Enter replacement text / table / LaTeX here"
                />
              </div>

              {/* Live Preview */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Live Preview (Exam View)
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  color: "#0f172a",
                  fontSize: "0.92rem",
                  minHeight: 80,
                  maxHeight: 240,
                  overflowY: "auto",
                  lineHeight: 1.5,
                }}>
                  {latex ? <MathText text={latex} /> : <span style={{ color: "#94a3b8" }}>— empty —</span>}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(226,232,240,0.4)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes[row.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                disabled={isSaving || row.status !== "pending"}
                placeholder="Any note about this entry..."
                style={{
                  width: "100%",
                  padding: "0.45rem 0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "rgba(226,232,240,0.7)",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Action Buttons */}
            {row.status === "pending" && (
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  className="a-btn a-btn-success"
                  disabled={isSaving || !latex.trim()}
                  onClick={() => doAction(row.id, "approved")}
                  title={!latex.trim() ? "LaTeX field cannot be empty to approve" : ""}
                >
                  <CheckCircle size={15} />
                  {isSaving ? "Saving…" : "Approve & Apply"}
                </button>
                <button
                  className="a-btn a-btn-danger"
                  disabled={isSaving}
                  onClick={() => doAction(row.id, "rejected")}
                >
                  <XCircle size={15} />
                  Reject (keep image)
                </button>
                <button
                  className="a-btn a-btn-ghost"
                  disabled={isSaving}
                  onClick={() => doAction(row.id, "skipped")}
                >
                  <SkipForward size={15} />
                  Skip for now
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
          <button className="a-btn a-btn-ghost a-btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ color: "rgba(226,232,240,0.5)", fontSize: "0.82rem" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button className="a-btn a-btn-ghost a-btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
