"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const [slug, setSlug] = useState("");
  const [subjectId, setSubjectId] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quick subject dropdowns
  const [newSubExamId, setNewSubExamId] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [topRes, examsRes] = await Promise.all([
        fetch("/api/admin/topics", { cache: "no-store" }).then(r => r.json()),
        supabase.from("exams").select("id, title, is_active").order("sort_order"),
      ]);
      if (topRes.topics) setTopics(topRes.topics);
      if (topRes.subjects) setSubjects(topRes.subjects);
      if (examsRes.data) setExams(examsRes.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFree(id: number, current: boolean) {
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_free: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle free status");
      setTopics(prev => prev.map(t => t.id === id ? { ...t, is_free: !current } : t));
      toast.success(!current ? "Set as Free" : "Set as Paid");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle free status");
    }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle active status");
      setTopics(prev => prev.map(t => t.id === id ? { ...t, is_active: nextStatus } : t));
      toast.success(nextStatus ? "🟢 Topic turned ON" : "⚪ Topic turned OFF");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle active status");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Please enter a topic title"); return; }
    if (!subjectId) { toast.error("Please select a subject"); return; }
    setSaving(true);
    const payload = {
      id: editingId,
      title: title.trim(),
      description: description ? description.trim() : null,
      subject_id: subjectId,
      slug: slug ? slug.trim() : undefined,
      is_free: isFree,
      is_active: isActive,
    };
    
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save topic");
      toast.success(editingId ? "Topic updated successfully!" : "Topic created successfully!");
      setShowForm(false);
      setEditingId(null);
      setTitle("");
      setDescription("");
      setSlug("");
      setSubjectId(0);
      setNewSubExamId(0);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save topic");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(t: any) {
    setEditingId(t.id);
    setTitle(t.title || "");
    setDescription(t.description || "");
    setSlug(t.slug || "");
    setSubjectId(t.subject_id || 0);
    setIsFree(t.is_free !== false);
    setIsActive(t.is_active !== false);
    setNewSubExamId(t.subjects?.exam_id || 0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAddNew() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSlug("");
    setIsFree(true);
    setIsActive(true);
    setSubjectId(0);
    setNewSubExamId(0);
    setShowForm(true);
  }

  async function handleDelete(id: number, titleText: string) {
    if (!confirm(`Delete topic "${titleText}"? All questions under this topic will also be permanently removed.`)) return;
    try {
      const res = await fetch(`/api/admin/topics?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete topic");
      toast.success("Topic deleted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete topic");
    }
  }

  const filteredSubjectsForSelect = newSubExamId ? subjects.filter(s => s.exam_id === newSubExamId) : subjects;
  const filteredSubjectsForFilter = filterExam ? subjects.filter(s => s.exam_id === filterExam) : subjects;

  const filteredTopics = topics.filter(t => {
    if (filterExam && t.subjects?.exam_id !== filterExam) return false;
    if (filterSubject && t.subject_id !== filterSubject) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchSlug = t.slug?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSlug) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Topics / Chapters</h1>
          <p className="page-subtitle">Manage topics, chapters, and question categories</p>
        </div>
        <button
          onClick={handleAddNew}
          className="a-btn a-btn-primary"
        >
          ➕ Add Topic
        </button>
      </div>

      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem" }}>
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
            <h3 style={{ color: "#fff", fontWeight: 600, margin: 0 }}>
              {editingId ? `✏️ Edit Topic (#${editingId})` : "✨ New Topic"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Target Exam</label>
                <select
                  className="a-input a-select"
                  value={newSubExamId}
                  onChange={e => {
                    const exId = Number(e.target.value);
                    setNewSubExamId(exId);
                    if (subjectId) {
                      const currSub = subjects.find(s => s.id === subjectId);
                      if (currSub && currSub.exam_id !== exId && exId !== 0) {
                        setSubjectId(0);
                      }
                    }
                  }}
                >
                  <option value={0}>All Exams (Select to filter subjects)</option>
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
                  onChange={e => {
                    const subId = Number(e.target.value);
                    setSubjectId(subId);
                    const found = subjects.find(s => s.id === subId);
                    if (found && found.exam_id && !newSubExamId) {
                      setNewSubExamId(found.exam_id);
                    }
                  }}
                  required
                >
                  <option value={0}>Select Subject</option>
                  {filteredSubjectsForSelect.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.exams?.title ? `(${s.exams.title})` : ""} {s.is_active === false ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Topic Title *</label>
                <input
                  className="a-input"
                  placeholder="e.g. Percentage, Profit & Loss, Ancient History"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Sub-Topic / Section (Optional)</label>
                <input
                  className="a-input"
                  placeholder="e.g. Arithmetic, Indian History, Non-Verbal"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                URL Slug (Optional — e.g. <span className="text-gray-400 font-mono">ssc-ancient-history</span>)
              </label>
              <input
                className="a-input font-mono text-xs"
                placeholder={editingId ? "Leave as-is or enter a custom SEO slug" : "Auto-generated from title if left blank"}
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Public URL: <span className="text-blue-400 font-mono">/practice/{slug || (editingId ? "..." : "auto-generated")}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={e => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Free Access (Publicly Accessible without Pro)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-emerald-300 font-medium">Topic Active (Visible on practice & syllabus pages)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">
                Cancel
              </button>
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
            placeholder="Search topic, section, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
              <option key={s.id} value={s.id}>
                {s.title} {s.exams?.title ? `(${s.exams.title})` : ""}
              </option>
            ))}
          </select>

          {(filterSubject > 0 || filterExam > 0 || search) && (
            <button
              onClick={() => { setFilterSubject(0); setFilterExam(0); setSearch(""); }}
              className="text-xs font-bold text-red-400 hover:underline px-2 py-1"
            >
              Clear ✕
            </button>
          )}

          <div className="text-xs text-gray-400 pl-2 hidden sm:block">
            Showing <strong className="text-white">{filteredTopics.length}</strong> of {topics.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading topics...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No topics found matching your filters.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Topic & URL</th>
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
                  <td>
                    <span className="text-xs font-bold text-blue-400">
                      {t.subjects?.exams?.title || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-gray-200">
                      {t.subjects?.title || "—"}
                    </span>
                  </td>
                  <td>
                    {t.description ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 text-xs font-medium">
                        📂 {t.description}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs italic">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 600, color: "#fff" }}>{t.title}</span>
                      {t.slug && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          /practice/{t.slug}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="a-badge a-badge-blue">{t.questions?.[0]?.count ?? 0} Qs</span>
                  </td>
                  <td>
                    <button
                      className={`a-badge ${t.is_free ? "a-badge-green" : "a-badge-yellow"}`}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => toggleFree(t.id, t.is_free)}
                      title="Click to toggle Free / Paid"
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
                      title="Click to toggle active status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${(t.is_active ?? true) ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {(t.is_active ?? true) ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <Link
                        href={`/practice/${t.slug || t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="a-btn a-btn-ghost a-btn-sm"
                        title="View live practice page"
                      >
                        View ↗
                      </Link>
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
