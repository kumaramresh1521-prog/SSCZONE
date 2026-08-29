"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [examId, setExamId] = useState(0);
  const [year, setYear] = useState("");
  const [totalQ, setTotalQ] = useState("");
  const [duration, setDuration] = useState("180");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState(0);

  useEffect(() => { loadPapers(); loadExams(); }, []);

  async function loadPapers() {
    setLoading(true);
    const { data } = await supabase
      .from("previous_papers")
      .select("*, exams(title), paper_questions(count)")
      .order("year", { ascending: false });
    setPapers(data ?? []);
    setLoading(false);
  }

  async function loadExams() {
    const { data } = await supabase.from("exams").select("id, title");
    setExams(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examId) { toast.error("Select an exam"); return; }
    setSaving(true);
    const payload = {
      title,
      exam_id: examId,
      year: parseInt(year),
      total_questions: parseInt(totalQ),
      duration_minutes: parseInt(duration),
    };
    if (editingId) {
      const { error } = await supabase.from("previous_papers").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("previous_papers").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setShowForm(false); setTitle(""); setYear(""); setTotalQ(""); setDuration("180"); setEditingId(null);
    setSaving(false);
    loadPapers();
    toast.success(editingId ? "Paper updated!" : "Paper created!");
  }

  function handleEdit(p: any) {
    setTitle(p.title); setExamId(p.exam_id); setYear(p.year.toString());
    setTotalQ(p.total_questions.toString()); setDuration(p.duration_minutes.toString());
    setEditingId(p.id); setShowForm(true);
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete paper "${title}" and all its questions?`)) return;
    const { error } = await supabase.from("previous_papers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Paper deleted!");
    loadPapers();
  }

  const filtered = filterExam ? papers.filter(p => p.exam_id === filterExam) : papers;

  // Group papers by year
  const byYear = filtered.reduce((acc: Record<string, any[]>, p) => {
    const y = p.year?.toString() || "Unknown";
    if (!acc[y]) acc[y] = [];
    acc[y].push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Previous Papers</h1>
          <p className="page-subtitle">{papers.length} papers across {exams.length} exams</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setYear(""); setTotalQ(""); setDuration("180"); setExamId(0); }}
          className="a-btn a-btn-primary"
        >
          ➕ Add Paper
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.2)" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: "1.25rem" }}>
            {editingId ? "✏️ Edit Paper" : "📄 New Previous Paper"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="a-label">Paper Title *</label>
                <input className="a-input" placeholder="e.g. SSC CGL Tier 1 2023 Paper 1" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="a-label">Exam *</label>
                <select className="a-input a-select" value={examId} onChange={e => setExamId(Number(e.target.value))} required>
                  <option value={0}>Select Exam</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
              </div>
              <div>
                <label className="a-label">Year *</label>
                <input className="a-input" type="number" placeholder="2024" value={year} onChange={e => setYear(e.target.value)} required min="2000" max="2030" />
              </div>
              <div>
                <label className="a-label">Total Questions *</label>
                <input className="a-input" type="number" placeholder="100" value={totalQ} onChange={e => setTotalQ(e.target.value)} required min="1" />
              </div>
              <div>
                <label className="a-label">Duration (minutes) *</label>
                <input className="a-input" type="number" placeholder="180" value={duration} onChange={e => setDuration(e.target.value)} required min="1" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Paper" : "Create Paper"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Exam filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <button className={`filter-tab ${filterExam === 0 ? "active" : ""}`} onClick={() => setFilterExam(0)}>All Exams</button>
        {exams.map(ex => (
          <button key={ex.id} className={`filter-tab ${filterExam === ex.id ? "active" : ""}`} onClick={() => setFilterExam(ex.id)}>
            {ex.title}
          </button>
        ))}
      </div>

      {/* Papers by year */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="a-card a-empty">
          <span className="a-empty-icon">📄</span>
          No papers found. Add your first previous year paper!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {years.map(yr => (
            <div key={yr}>
              <div className="year-header">
                <span className="year-badge">{yr}</span>
                <span className="year-count">{byYear[yr].length} paper{byYear[yr].length !== 1 ? "s" : ""}</span>
              </div>
              <div className="papers-grid">
                {byYear[yr].map(p => {
                  const qCount = p.paper_questions?.[0]?.count ?? 0;
                  return (
                    <div key={p.id} className="paper-card">
                      <div className="paper-card-top">
                        <div>
                          <div className="paper-exam">{p.exams?.title}</div>
                          <h3 className="paper-title">{p.title}</h3>
                        </div>
                        <div className="paper-year-badge">{p.year}</div>
                      </div>
                      <div className="paper-stats">
                        <span className="paper-stat">
                          <span className="paper-stat-icon">❓</span>
                          {p.total_questions} Q total · {qCount} added
                        </span>
                        <span className="paper-stat">
                          <span className="paper-stat-icon">⏱️</span>
                          {p.duration_minutes} min
                        </span>
                      </div>
                      <div className="paper-progress-bar">
                        <div
                          className="paper-progress-fill"
                          style={{ width: `${Math.min(100, (qCount / p.total_questions) * 100)}%` }}
                        />
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", marginBottom: "0.875rem" }}>
                        {qCount}/{p.total_questions} questions added
                      </div>
                      <div className="paper-actions">
                        <Link href={`/admin/papers/${p.id}`} className="a-btn a-btn-primary a-btn-sm">
                          📝 Manage Questions
                        </Link>
                        <button onClick={() => handleEdit(p)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                        <button onClick={() => handleDelete(p.id, p.title)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .filter-tab {
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.4);
          transition: all 0.15s;
        }
        .filter-tab:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .filter-tab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

        .year-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .year-badge {
          font-size: 1.125rem;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
          border: 1px solid rgba(99,102,241,0.3);
          padding: 0.2rem 0.75rem;
          border-radius: 0.5rem;
        }
        .year-count { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

        .papers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .paper-card {
          background: #1a1d2e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.875rem;
          padding: 1.25rem;
          transition: all 0.15s;
        }
        .paper-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }

        .paper-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.875rem; gap: 0.5rem; }
        .paper-exam { font-size: 0.7rem; color: rgba(99,102,241,0.8); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
        .paper-title { font-size: 0.9rem; font-weight: 700; color: #fff; line-height: 1.3; }
        .paper-year-badge {
          flex-shrink: 0;
          padding: 0.25rem 0.625rem;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .paper-stats { display: flex; gap: 1rem; margin-bottom: 0.625rem; }
        .paper-stat { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        .paper-stat-icon { font-size: 0.875rem; }

        .paper-progress-bar {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          margin-bottom: 0.3rem;
          overflow: hidden;
        }
        .paper-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 999px;
          transition: width 0.5s ease;
        }

        .paper-actions { display: flex; gap: 0.375rem; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
