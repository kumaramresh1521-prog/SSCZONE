"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [examId, setExamId] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterExam, setFilterExam] = useState<number>(0);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [subRes, exRes] = await Promise.all([
      supabase.from("subjects").select("*, exams(title), topics(count)").order("sort_order"),
      supabase.from("exams").select("id, title, is_active").order("id")
    ]);
    if (subRes.data) setSubjects(subRes.data);
    if (exRes.data) setExams(exRes.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examId) { toast.error("Please select an exam"); return; }
    setSaving(true);
    const payload = { title, exam_id: examId, slug: slugify(title) };
    if (editingId) {
      const { error } = await supabase.from("subjects").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("subjects").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setShowForm(false); setTitle(""); setEditingId(null); setSaving(false);
    loadData();
    toast.success(editingId ? "Subject updated!" : "Subject created!");
  }

  function handleEdit(sub: any) {
    setTitle(sub.title); setExamId(sub.exam_id); setEditingId(sub.id); setShowForm(true);
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? All topics under it will also be affected.`)) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subject deleted!");
    loadData();
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    const { error } = await supabase.from("subjects").update({ is_active: nextStatus }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, is_active: nextStatus } : s));
    toast.success(nextStatus ? "🟢 Subject turned ON" : "⚪ Subject turned OFF");
  }

  const filtered = filterExam ? subjects.filter(s => s.exam_id === filterExam) : subjects;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">{subjects.length} subjects across {exams.length} exams</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setExamId(0); }}
          className="a-btn a-btn-primary"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.2)" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: "1.25rem" }}>
            {editingId ? "✏️ Edit Subject" : "📚 New Subject"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="a-label">Exam *</label>
                <select
                  className="a-input a-select"
                  value={examId}
                  onChange={e => setExamId(Number(e.target.value))}
                  required
                >
                  <option value={0}>Select Exam</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} {ex.is_active === false ? "(Inactive)" : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="a-label">Subject Title *</label>
                <input
                  className="a-input"
                  placeholder="e.g. General Knowledge, Mathematics"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Subject" : "Create Subject"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Exam filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <button
          className={`filter-tab ${filterExam === 0 ? "active" : ""}`}
          onClick={() => setFilterExam(0)}
        >All Exams</button>
        {exams.map(ex => (
          <button
            key={ex.id}
            className={`filter-tab ${filterExam === ex.id ? "active" : ""}`}
            onClick={() => setFilterExam(ex.id)}
          >{ex.title}</button>
        ))}
      </div>

      {/* Table */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="a-empty">
            <span className="a-empty-icon">📚</span>
            No subjects found. Create your first subject!
          </div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Exam</th>
                <th>Slug</th>
                <th>Topics</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => (
                <tr key={sub.id}>
                  <td style={{ color: "rgba(255,255,255,0.25)", width: "40px" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{sub.title}</td>
                  <td>
                    <span className="a-badge a-badge-blue">{sub.exams?.title}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.7rem", color: "rgba(99,102,241,0.7)", background: "rgba(99,102,241,0.1)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                      {sub.slug}
                    </code>
                  </td>
                  <td>
                    <span className="a-badge a-badge-yellow">
                      {sub.topics?.[0]?.count ?? 0} topics
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(sub.id, sub.is_active ?? true)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold transition-all border ${
                        (sub.is_active ?? true)
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${(sub.is_active ?? true) ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {(sub.is_active ?? true) ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={() => handleEdit(sub)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                      <button onClick={() => handleDelete(sub.id, sub.title)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
      `}</style>
    </div>
  );
}
