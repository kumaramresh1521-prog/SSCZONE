"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  XCircle,
  SkipForward,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  Tag,
  BookOpen,
} from "lucide-react";
import { resolveAssetUrl } from "@/lib/utils";
import MathText from "@/components/MathText";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReviewStatus = "pending" | "approved" | "rejected" | "skipped";
type FilterStatus = "pending" | "approved" | "rejected" | "skipped" | "all";
type CategoryFilter = "all" | "maths" | "reasoning" | "gk" | "english";
type CategoryType = "maths" | "reasoning" | "gk" | "english" | "unknown";
type IssueTypeFilter = "all" | "figure" | "table" | "formula" | "passage" | "improvement" | "visual_tricks";

interface ReviewRow {
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

// ─── Category Detection ──────────────────────────────────────────────────────
function getQuestionCategory(qNum: number | null, notes?: string | null): CategoryType {
  if (notes) {
    const lower = notes.toLowerCase();
    if (lower.includes("[reasoning]") || lower.includes("reasoning")) return "reasoning";
    if (lower.includes("[gk]") || lower.includes("gk") || lower.includes("general awareness")) return "gk";
    if (lower.includes("[maths]") || lower.includes("math") || lower.includes("quant")) return "maths";
    if (lower.includes("[english]") || lower.includes("english")) return "english";
  }
  if (!qNum) return "unknown";
  if (qNum >= 1 && qNum <= 25) return "reasoning";
  if (qNum >= 26 && qNum <= 50) return "gk";
  if (qNum >= 51 && qNum <= 75) return "maths";
  if (qNum >= 76 && qNum <= 100) return "english";
  return "unknown";
}

// ─── Issue Type Detection ────────────────────────────────────────────────────
function getIssueType(row: ReviewRow): { type: IssueTypeFilter; label: string; badgeColor: string } {
  const notes = (row.review_notes || "").toLowerCase();
  const text = (row.original_text || "").toLowerCase();

  if (notes.includes("mirror image") || notes.includes("dice") || notes.includes("unfolded") || notes.includes("paper folding") || notes.includes("analogy") || notes.includes("venn")) {
    return { type: "visual_tricks", label: "Dice / Mirror / Visual", badgeColor: "#c084fc" };
  }
  if (notes.includes("match table") || notes.includes("di table") || notes.includes("table") || text.includes("column a") || text.includes("match the following")) {
    return { type: "table", label: "Table / Match Columns", badgeColor: "#38bdf8" };
  }
  if (notes.includes("passage") || text.includes("comprehension") || text.includes("read the passage") || text.includes("cloze")) {
    return { type: "passage", label: "Passage / Cloze Test", badgeColor: "#fbbf24" };
  }
  if (notes.includes("sentence improvement") || text.includes("underlined") || text.includes("bracketed") || text.includes("[")) {
    return { type: "improvement", label: "Sentence Improvement", badgeColor: "#f472b6" };
  }
  if (notes.includes("math formula") || text.includes("\\frac") || text.includes("\\sqrt") || text.includes("\\theta")) {
    return { type: "formula", label: "Math & Formula", badgeColor: "#60a5fa" };
  }
  if (row.source_image_url || text.includes("![]") || text.includes("figure") || text.includes(".png")) {
    return { type: "figure", label: "Figure / Image Crop", badgeColor: "#a78bfa" };
  }
  return { type: "all", label: "General Issue", badgeColor: "#94a3b8" };
}

const CATEGORY_CONFIG: Record<CategoryType, { label: string; hindi: string; icon: string; color: string; bg: string; border: string }> = {
  maths: {
    label: "Mathematics",
    hindi: "गणित (Q.51–75)",
    icon: "🧮",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(96,165,250,0.35)",
  },
  reasoning: {
    label: "Reasoning",
    hindi: "रीजनिंग (Q.1–25)",
    icon: "🧠",
    color: "#c084fc",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(192,132,252,0.35)",
  },
  gk: {
    label: "General Awareness",
    hindi: "GK / GS (Q.26–50)",
    icon: "🌍",
    color: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(52,211,153,0.35)",
  },
  english: {
    label: "English Comprehension",
    hindi: "अंग्रेजी (Q.76–100)",
    icon: "📖",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(251,191,36,0.35)",
  },
  unknown: {
    label: "General",
    hindi: "अन्य प्रश्न",
    icon: "📋",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.35)",
  },
};

// ─── Image Helper ────────────────────────────────────────────────────────────
function extractImageUrl(text?: string | null, sourceUrl?: string | null): string | null {
  if (sourceUrl && sourceUrl.trim()) return sourceUrl.trim();
  if (!text) return null;
  const m = text.match(/!\[.*?\]\((.*?)\)/);
  return m ? m[1].trim() : null;
}

// ─── Universal Review Page Component ─────────────────────────────────────────
export default function UniversalReviewPage() {
  const [allRows, setAllRows]                 = useState<ReviewRow[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState<number | null>(null);
  const [filterCategory, setFilterCategory]   = useState<CategoryFilter>("all");
  const [filterStatus, setFilterStatus]       = useState<FilterStatus>("pending");
  const [filterIssueType, setFilterIssueType] = useState<IssueTypeFilter>("all");
  const [selectedPaperId, setSelectedPaperId] = useState<string>("all");
  const [searchTerm, setSearchTerm]           = useState("");
  const [page, setPage]                       = useState(0);
  const [editValues, setEditValues]           = useState<Record<number, string>>({});
  const [notes, setNotes]                     = useState<Record<number, string>>({});
  const [papersMap, setPapersMap]             = useState<Record<number, { title: string; year: number }>>({});
  const [msg, setMsg]                         = useState<{ text: string; ok: boolean } | null>(null);

  const PAGE_SIZE = 10;

  // ── Fetch rows ────────────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("math_review")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMsg({ text: `DB Error: ${error.message}`, ok: false });
    } else {
      const rows = data ?? [];
      setAllRows(rows);

      const edits: Record<number, string> = {};
      const noteMap: Record<number, string> = {};
      for (const r of rows) {
        edits[r.id] = r.admin_latex ?? r.suggested_latex ?? r.original_text ?? "";
        noteMap[r.id] = r.review_notes ?? "";
      }
      setEditValues(edits);
      setNotes(noteMap);

      if (rows.length > 0) {
        const paperIds = Array.from(new Set(rows.map((r) => r.paper_id)));
        supabase
          .from("previous_papers")
          .select("id, title, year")
          .in("id", paperIds)
          .then(({ data: pData }) => {
            if (pData) {
              const pMap: Record<number, { title: string; year: number }> = {};
              pData.forEach((p) => {
                pMap[p.id] = { title: p.title, year: p.year };
              });
              setPapersMap((prev) => ({ ...prev, ...pMap }));
            }
          });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Flash timer
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  // ── Action: Approve / Reject / Skip ───────────────────────────────────────
  async function doAction(id: number, newStatus: ReviewStatus) {
    setSaving(id);
    const textVal = editValues[id] ?? "";
    const row = allRows.find((r) => r.id === id);

    if (!row) {
      setMsg({ text: "Row not found — please refresh.", ok: false });
      setSaving(null);
      return;
    }

    if (newStatus === "approved" && !textVal.trim()) {
      setMsg({ text: "Cannot approve: replacement text is empty.", ok: false });
      setSaving(null);
      return;
    }

    try {
      const res = await fetch("/api/admin/math-review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id:    row.id,
          question_id:  row.question_id,
          field_name:   row.field_name,
          new_value:    textVal,
          status:       newStatus,
          review_notes: notes[id] || null,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setMsg({ text: `❌ Failed: ${result?.error || res.statusText}`, ok: false });
        setSaving(null);
        return;
      }

      setMsg({
        text:
          newStatus === "approved"
            ? "✅ Approved & applied directly to live question!"
            : newStatus === "rejected"
            ? "❌ Rejected."
            : "⏭ Skipped for later.",
        ok: newStatus === "approved",
      });

      setAllRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: newStatus, admin_latex: textVal, reviewed_at: new Date().toISOString() }
            : r
        )
      );
    } catch (err: any) {
      setMsg({ text: `❌ Network error: ${err.message}`, ok: false });
    } finally {
      setSaving(null);
    }
  }

  // ── Compute Counts ────────────────────────────────────────────────────────
  const countsByStatus: Record<FilterStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    skipped: 0,
    all: allRows.length,
  };

  const countsByCategory: Record<CategoryFilter, number> = {
    all: allRows.length,
    maths: 0,
    reasoning: 0,
    gk: 0,
    english: 0,
  };

  const countsByIssueType: Record<IssueTypeFilter, number> = {
    all: allRows.length,
    figure: 0,
    table: 0,
    formula: 0,
    passage: 0,
    improvement: 0,
    visual_tricks: 0,
  };

  allRows.forEach((r) => {
    countsByStatus[r.status] = (countsByStatus[r.status] || 0) + 1;
    const cat = getQuestionCategory(r.question_number, r.review_notes);
    if (cat in countsByCategory) {
      countsByCategory[cat as CategoryFilter] = (countsByCategory[cat as CategoryFilter] || 0) + 1;
    }
    const issue = getIssueType(r);
    if (issue.type in countsByIssueType) {
      countsByIssueType[issue.type] = (countsByIssueType[issue.type] || 0) + 1;
    }
  });

  // ── Filtered Rows ─────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      // 1. Status Filter
      if (filterStatus !== "all" && row.status !== filterStatus) return false;

      // 2. Category Filter
      if (filterCategory !== "all") {
        const cat = getQuestionCategory(row.question_number, row.review_notes);
        if (cat !== filterCategory) return false;
      }

      // 3. Issue Type Filter
      if (filterIssueType !== "all") {
        const issue = getIssueType(row);
        if (issue.type !== filterIssueType) return false;
      }

      // 4. Paper Filter
      if (selectedPaperId !== "all" && String(row.paper_id) !== selectedPaperId) {
        return false;
      }

      // 5. Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchText = (row.original_text || "").toLowerCase().includes(term);
        const matchFix = (editValues[row.id] || "").toLowerCase().includes(term);
        const matchNotes = (row.review_notes || "").toLowerCase().includes(term);
        const matchQNum = String(row.question_number || "").includes(term);
        const matchQId = String(row.question_id).includes(term);
        if (!matchText && !matchFix && !matchNotes && !matchQNum && !matchQId) return false;
      }

      return true;
    });
  }, [allRows, filterStatus, filterCategory, filterIssueType, selectedPaperId, searchTerm, editValues]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const paginatedRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // List of unique papers in the current dataset
  const uniquePapers = useMemo(() => {
    const map = new Map<number, string>();
    allRows.forEach((r) => {
      if (!map.has(r.paper_id)) {
        map.set(r.paper_id, papersMap[r.paper_id]?.title || `Paper #${r.paper_id}`);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [allRows, papersMap]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "3rem" }}>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <span>Question Review & Approval Center</span>
            <span style={{ fontSize: "0.75rem", background: "#3b82f6", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 9999, fontWeight: 800 }}>
              {allRows.length} Total Issues
            </span>
          </div>
          <div className="page-subtitle">
            हर प्रकार के एरर (Figures, Math Formulas, Match Tables, Reading Passages, Cloze Blanks, Sentence Improvement) को विषय-वार रिव्यू करें और एक क्लिक में लाइव टेस्ट में लागू करें।
          </div>
        </div>
        <button className="a-btn a-btn-ghost" onClick={fetchRows} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Category Filter Tabs (Subject Switcher) ── */}
      <div style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "0.5rem 0.65rem",
        marginBottom: "0.75rem",
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(226,232,240,0.5)", textTransform: "uppercase", padding: "0 0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Layers size={13} />
          Subject:
        </div>

        {(
          [
            { key: "all",       label: "All Subjects", icon: "🌐", hindi: "सभी 4 विषय", color: "#60a5fa" },
            { key: "maths",     label: "Mathematics", icon: "🧮", hindi: "गणित (Q51-75)", color: "#60a5fa" },
            { key: "reasoning", label: "Reasoning",   icon: "🧠", hindi: "रीजनिंग (Q1-25)", color: "#c084fc" },
            { key: "gk",        label: "GK / GS",     icon: "🌍", hindi: "सामान्य ज्ञान (Q26-50)", color: "#34d399" },
            { key: "english",   label: "English",     icon: "📖", hindi: "अंग्रेजी (Q76-100)", color: "#fbbf24" },
          ] as const
        ).map((tab) => {
          const isActive = filterCategory === tab.key;
          const count = countsByCategory[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => { setFilterCategory(tab.key); setPage(0); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.42rem 0.85rem",
                borderRadius: 10,
                border: isActive ? `1.5px solid ${tab.color}` : "1px solid rgba(255,255,255,0.08)",
                background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                color: isActive ? "#ffffff" : "rgba(226,232,240,0.65)",
                fontWeight: isActive ? 800 : 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? tab.color : "rgba(255,255,255,0.08)",
                color: isActive ? "#0f172a" : "rgba(226,232,240,0.5)",
                fontSize: "0.72rem",
                fontWeight: 900,
                padding: "0.1rem 0.45rem",
                borderRadius: 9999,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Specific Issue Type Filter Bar (हर प्रकार के Error) ── */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: "0.45rem 0.65rem",
        marginBottom: "1rem",
        display: "flex",
        gap: "0.4rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "rgba(226,232,240,0.5)", textTransform: "uppercase", padding: "0 0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Tag size={12} />
          Error Type:
        </div>

        {(
          [
            { key: "all",           label: "All Types",              icon: "⚡", color: "#94a3b8" },
            { key: "figure",        label: "Figures & Images",       icon: "🖼️", color: "#a78bfa" },
            { key: "table",         label: "Match & DI Tables",      icon: "📊", color: "#38bdf8" },
            { key: "formula",       label: "Math & Formulas",        icon: "➗", color: "#60a5fa" },
            { key: "passage",       label: "Passages & Cloze",       icon: "📑", color: "#fbbf24" },
            { key: "improvement",   label: "Sentence Improvement",   icon: "✍️", color: "#f472b6" },
            { key: "visual_tricks", label: "Dice & Mirror Visuals",  icon: "🎲", color: "#c084fc" },
          ] as const
        ).map((item) => {
          const isActive = filterIssueType === item.key;
          const count = countsByIssueType[item.key];
          return (
            <button
              key={item.key}
              onClick={() => { setFilterIssueType(item.key); setPage(0); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.65rem",
                borderRadius: 8,
                border: isActive ? `1.5px solid ${item.color}` : "1px solid rgba(255,255,255,0.06)",
                background: isActive ? `${item.color}22` : "rgba(255,255,255,0.02)",
                color: isActive ? item.color : "rgba(226,232,240,0.6)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Status Bar, Paper Dropdown & Search Filter ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}>
        {/* Status Chips */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {(
            [
              { key: "pending",  label: "Pending",  color: "#fbbf24" },
              { key: "approved", label: "Approved", color: "#34d399" },
              { key: "rejected", label: "Rejected", color: "#f87171" },
              { key: "skipped",  label: "Skipped",  color: "#94a3b8" },
              { key: "all",      label: "All Statuses", color: "#60a5fa" },
            ] as const
          ).map((s) => {
            const isActive = filterStatus === s.key;
            const count = countsByStatus[s.key];
            return (
              <button
                key={s.key}
                onClick={() => { setFilterStatus(s.key); setPage(0); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.32rem 0.7rem",
                  borderRadius: 8,
                  border: isActive ? `1.5px solid ${s.color}` : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? `${s.color}22` : "rgba(255,255,255,0.03)",
                  color: isActive ? s.color : "rgba(226,232,240,0.6)",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                <span>{s.label}</span>
                <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Paper Filter & Search Bar */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Paper Select Dropdown */}
          <select
            value={selectedPaperId}
            onChange={(e) => { setSelectedPaperId(e.target.value); setPage(0); }}
            style={{
              padding: "0.38rem 0.75rem",
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: "0.78rem",
              outline: "none",
              cursor: "pointer",
              maxWidth: 240,
            }}
          >
            <option value="all" style={{ background: "#0f172a" }}>All Papers ({uniquePapers.length})</option>
            {uniquePapers.map(([pid, title]) => (
              <option key={pid} value={String(pid)} style={{ background: "#0f172a" }}>
                {title.length > 32 ? title.slice(0, 32) + "..." : title}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.4)" }} />
            <input
              type="text"
              placeholder="Search Q#, text, notes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              style={{
                width: "100%",
                padding: "0.38rem 0.75rem 0.38rem 2rem",
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#fff",
                fontSize: "0.78rem",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Flash Alert ── */}
      {msg && (
        <div style={{
          marginBottom: "1.25rem",
          padding: "0.75rem 1rem",
          borderRadius: 10,
          background: msg.ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${msg.ok ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
          color: msg.ok ? "#6ee7b7" : "#fca5a5",
          fontWeight: 700,
          fontSize: "0.88rem",
        }}>
          {msg.text}
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(226,232,240,0.5)" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 0.75rem auto" }} />
          Loading questions across all categories...
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && paginatedRows.length === 0 && (
        <div className="a-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.3rem" }}>
            No Questions Match Filters
          </h3>
          <p style={{ color: "rgba(226,232,240,0.5)", fontSize: "0.88rem", maxWidth: 450, margin: "0 auto" }}>
            {filterStatus === "pending"
              ? "All pending questions matching this criteria have been approved!"
              : `No questions found matching Category "${filterCategory}", Error Type "${filterIssueType}", Status "${filterStatus}".`}
          </p>
        </div>
      )}

      {/* ── Question Review Cards ── */}
      {!loading && paginatedRows.map((row) => {
        const textVal = editValues[row.id] ?? "";
        const isSaving = saving === row.id;
        const paperInfo = papersMap[row.paper_id];
        const category = getQuestionCategory(row.question_number, row.review_notes);
        const catConfig = CATEGORY_CONFIG[category];
        const issue = getIssueType(row);

        return (
          <div
            key={row.id}
            className="a-card"
            style={{
              marginBottom: "1.25rem",
              borderLeft: `4px solid ${catConfig.color}`,
              background: "rgba(30, 41, 59, 0.45)",
            }}
          >
            {/* Header / Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.45rem", alignItems: "center", flexWrap: "wrap" }}>
                {/* Subject Badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.22rem 0.65rem",
                    borderRadius: 9999,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: catConfig.color,
                    background: catConfig.bg,
                    border: `1px solid ${catConfig.border}`,
                  }}
                >
                  <span>{catConfig.icon}</span>
                  <span>{catConfig.label}</span>
                </span>

                {/* Specific Issue Type Tag */}
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: issue.badgeColor,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${issue.badgeColor}44`,
                    padding: "0.2rem 0.55rem",
                    borderRadius: 6,
                  }}
                >
                  {issue.label}
                </span>

                {/* Question Number Badge */}
                {row.question_number && (
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fbbf24", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                    Q.{row.question_number}
                  </span>
                )}

                {/* Question ID & Field */}
                <span className="a-badge a-badge-blue">ID #{row.question_id}</span>
                <span className="a-badge a-badge-yellow">{row.field_name}</span>

                {/* Status Badge */}
                <span className={`a-badge ${row.status === "approved" ? "a-badge-green" : row.status === "rejected" ? "a-badge-red" : ""}`}>
                  {row.status.toUpperCase()}
                </span>

                {/* Paper Title */}
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.08)", padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                  {paperInfo?.title || `Paper #${row.paper_id}`}
                </span>

                {/* Direct Link to Live Exam */}
                <a
                  href={`/take-test/${row.paper_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="a-btn a-btn-ghost a-btn-sm"
                  style={{ minHeight: "26px", padding: "0.2rem 0.65rem", fontSize: "0.72rem", color: "#60a5fa" }}
                  title="Open this paper in live test mode to check current appearance"
                >
                  <ExternalLink size={12} style={{ marginRight: "0.3rem" }} />
                  View Live in Exam
                </a>
              </div>
            </div>

            {/* Three Column Review Workbench: Original | Editable Fix | Live Student Preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "0.85rem" }}>
              {/* Column 1: Original in DB */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(226,232,240,0.45)", textTransform: "uppercase", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>Original DB Content</span>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "0.7rem 0.85rem",
                  fontSize: "0.82rem",
                  color: "rgba(226,232,240,0.75)",
                  minHeight: 180,
                  maxHeight: 260,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  <div>{row.original_text || <em style={{ color: "rgba(226,232,240,0.3)" }}>empty</em>}</div>

                  {/* Image Crop */}
                  {(() => {
                    const img = extractImageUrl(row.original_text, row.source_image_url);
                    if (!img) return null;
                    const fullUrl = resolveAssetUrl(img);
                    return (
                      <div style={{ marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.5rem" }}>
                        <div style={{ fontSize: "0.68rem", color: "#93c5fd", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <span>Image / Crop:</span>
                          <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 2 }}>
                            Open Full <ExternalLink size={10} />
                          </a>
                        </div>
                        <img
                          src={fullUrl}
                          alt="Question Crop"
                          style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, background: "#ffffff", padding: "4px", border: "1px solid rgba(255,255,255,0.2)" }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Column 2: Proposed Fix (Editable Textarea) */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>Proposed Fix (Editable)</span>
                </div>
                <textarea
                  value={textVal}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  disabled={isSaving || row.status !== "pending"}
                  rows={9}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontFamily: "monospace",
                    resize: "vertical",
                    outline: "none",
                    minHeight: 180,
                    opacity: row.status !== "pending" ? 0.6 : 1,
                  }}
                  placeholder="Enter replacement LaTeX / Markdown table / text here"
                />
              </div>

              {/* Column 3: Live Student Preview */}
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={11} />
                  <span>Student Live Preview (Exam View)</span>
                </div>
                <div style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: "0.85rem 1rem",
                  color: "#0f172a",
                  fontSize: "0.92rem",
                  minHeight: 180,
                  maxHeight: 260,
                  overflowY: "auto",
                  lineHeight: 1.5,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                  {textVal ? <MathText text={textVal} /> : <span style={{ color: "#94a3b8" }}>— empty —</span>}
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div style={{ marginBottom: "0.85rem" }}>
              <input
                type="text"
                value={notes[row.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                disabled={isSaving || row.status !== "pending"}
                placeholder="Review notes or issue explanation (optional)..."
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
                  disabled={isSaving || !textVal.trim()}
                  onClick={() => doAction(row.id, "approved")}
                  title={!textVal.trim() ? "Text cannot be empty to approve" : ""}
                >
                  <CheckCircle size={15} />
                  {isSaving ? "Saving…" : "Approve & Apply to Live DB"}
                </button>
                <button
                  className="a-btn a-btn-danger"
                  disabled={isSaving}
                  onClick={() => doAction(row.id, "rejected")}
                >
                  <XCircle size={15} />
                  Reject (Keep original)
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
          <button className="a-btn a-btn-ghost a-btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} /> Prev Page
          </button>
          <span style={{ color: "rgba(226,232,240,0.6)", fontSize: "0.85rem", fontWeight: 700 }}>
            Page {page + 1} of {totalPages} ({filteredRows.length} total items in current filter)
          </span>
          <button className="a-btn a-btn-ghost a-btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next Page <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
