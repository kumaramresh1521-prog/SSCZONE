"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState(0);
  const [filterSubject, setFilterSubject] = useState(0);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quick subject dropdowns
  const [newSubExamId, setNewSubExamId] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [topicsRes, subjectsRes, examsRes] = await Promise.all([
      supabase.from("topics").select("*, subjects(title, exam_id, exams(title)), questions(count)").order("id"),
      supabase.from("subjects").select("id, title, exam_id, is_active, exams(title)").order("title"),
      supabase.from("exams").select("id, title, is_active").order("sort_order")
    ]);
    if (topicsRes.data) setTopics(topicsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (examsRes.data) setExams(examsRes.data);
    setLoading(false);
  }

  async function toggleFree(id: number, current: boolean) {
    const { error } = await supabase.from("topics").update({ is_free: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTopics(prev => prev.map(t => t.id === id ? { ...t, is_free: !current } : t));
    toast.success(!current ? "Set as Free" : "Set as Paid");
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    const { error } = await supabase.from("topics").update({ is_active: nextStatus }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setTopics(prev => prev.map(t => t.id === id ? { ...t, is_active: nextStatus } : t));
    toast.success(nextStatus ? "🟢 Topic turned ON" : "⚪ Topic turned OFF");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) { toast.error("Please select a subject"); return; }
    setSaving(true);
    const payload = { title, description: description || null, subject_id: subjectId, is_free: isFree };
    
    if (editingId) {
      const { error } = await supabase.from("topics").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Topic updated!");
    } else {
      const { error } = await supabase.from("topics").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Topic created!");
    }
    
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSaving(false);
    loadData();
  }

  function handleEdit(t: any) {
    setEditingId(t.id);
    setTitle(t.title);
    setDescription(t.description || "");
    setSubjectId(t.subject_id);
    setIsFree(t.is_free);
    setNewSubExamId(t.subjects?.exam_id || 0);
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleDelete(id: number, titleText: string) {
    if (!confirm(`Delete topic "${titleText}"? Questions under it will be deleted.`)) return;
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Topic deleted!");
    loadData();
  }

  const filteredSubjectsForSelect = newSubExamId ? subjects.filter(s => s.exam_id === newSubExamId) : subjects;
  const filteredSubjectsForFilter = filterExam ? subjects.filter(s => s.exam_id === filterExam) : subjects;

  const filteredTopics = topics.filter(t => {
    if (filterExam && t.subjects?.exam_id !== filterExam) return false;
    if (filterSubject && t.subject_id !== filterSubject) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Topics / Chapters</h1>
          <p className="page-subtitle">Manage topics inside subjects</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setDescription(""); setIsFree(true); setSubjectId(0); }}
          className="a-btn a-btn-primary"
        >
          ➕ Add Topic
        </button>
      </div>

      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: "1.25rem" }}>
            {editingId ? "✏️ Edit Topic" : "✨ New Topic"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Target Exam</label>
                <select
                  className="a-input a-select"
                  value={newSubExamId}
                  onChange={e => { setNewSubExamId(Number(e.target.value)); setSubjectId(0); }}
                >
                  <option value={0}>Select Exam</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} {ex.is_active === false ? "(Inactive)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Subject *</label>
                <select
                  className="a-input a-select"
                  value={subjectId}
                  onChange={e => setSubjectId(Number(e.target.value))}
                  required
                >
                  <option value={0}>Select Subject</option>
                  {filteredSubjectsForSelect.map(s => (
                    <option key={s.id} value={s.id}>{s.title} {s.is_active === false ? "(Inactive)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Topic Title *</label>
                <input
                  className="a-input"
                  placeholder="e.g. Percentage, Profit & Loss"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Sub-Topic / Section (Optional)</label>
                <input
                  className="a-input"
                  placeholder="e.g. Ancient History"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isFree" className="text-sm text-gray-300">This topic is Free (Publicly Accessible)</label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">Cancel</button>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Topic" : "Create Topic"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-gray-900/60 p-4 rounded-2xl border border-gray-800 mb-6">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-xs">🔍</span>
          <input
            className="a-input pl-9 text-xs"
            placeholder="Search topic or section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            className="a-input a-select text-xs w-auto"
            value={filterExam}
            onChange={(e) => {
              setFilterExam(Number(e.target.value));
              setFilterSubject(0);
            }}
          >
            <option value={0}>All Exams</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>

          <select
            className="a-input a-select text-xs w-auto"
            value={filterSubject}
            onChange={(e) => setFilterSubject(Number(e.target.value))}
          >
            <option value={0}>All Subjects</option>
            {filteredSubjectsForFilter.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          {(filterSubject > 0 || filterExam > 0) && (
            <button
              onClick={() => { setFilterSubject(0); setFilterExam(0); }}
              className="text-xs font-bold text-red-400 hover:underline px-2 py-1"
            >
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No topics found.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Topic</th>
                <th>Questions</th>
                <th>Access</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((t, i) => (
                <tr key={t.id}>
                  <td style={{ color: "rgba(255,255,255,0.25)", width: "40px" }}>{i + 1}</td>
                  <td><span className="text-xs font-bold text-blue-400">{t.subjects?.exams?.title}</span></td>
                  <td><span className="text-xs font-semibold text-gray-200">{t.subjects?.title}</span></td>
                  <td>
                    {t.description ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 text-xs font-bold">
                        📂 {t.description}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs italic">—</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{t.title}</td>
                  <td>
                    <span className="a-badge a-badge-blue">{t.questions?.[0]?.count ?? 0} Qs</span>
                  </td>
                  <td>
                    <button
                      className={`a-badge ${t.is_free ? "a-badge-green" : "a-badge-yellow"}`}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => toggleFree(t.id, t.is_free)}
                    >
                      {t.is_free ? "● Free" : "🔒 Paid"}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(t.id, t.is_active ?? true)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold transition-all border ${
                        (t.is_active ?? true)
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${(t.is_active ?? true) ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {(t.is_active ?? true) ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={() => handleEdit(t)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                      <button onClick={() => handleDelete(t.id, t.title)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}