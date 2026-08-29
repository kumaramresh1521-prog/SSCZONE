"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [targetExamForSync, setTargetExamForSync] = useState<any | null>(null);
  
  // Single Exam Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Sync Modal State
  const [sourceExamId, setSourceExamId] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadExams(); }, []);

  async function loadExams() {
    setLoading(true);
    // Fetch exams with nested subjects and topics counts
    const { data } = await supabase
      .from("exams")
      .select("*, subjects(id, title, topics(id))")
      .order("sort_order");

    setExams(data ?? []);
    if (data && data.length > 0 && !sourceExamId) {
      // Find exam with most subjects as default source (e.g. SSC CGL)
      const masterExam = [...data].sort((a, b) => (b.subjects?.length || 0) - (a.subjects?.length || 0))[0];
      if (masterExam) setSourceExamId(masterExam.id);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { title, description: desc, slug: slugify(title) };
    if (editingId) {
      const { error } = await supabase.from("exams").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("exams").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setShowForm(false); setTitle(""); setDesc(""); setEditingId(null); setSaving(false);
    loadExams();
    toast.success(editingId ? "Exam updated!" : "Exam created!");
  }

  // ⚡ 1-Click Master Syllabus Cloning Function
  async function handleSyncSyllabus(targetIds: number[]) {
    if (!sourceExamId) { toast.error("Select a source exam first!"); return; }
    if (targetIds.length === 0) { toast.error("No target exams selected!"); return; }

    setSyncing(true);
    
    // Fetch source subjects and topics
    const { data: sourceSubjects, error: subErr } = await supabase
      .from("subjects")
      .select("*, topics(*)")
      .eq("exam_id", sourceExamId);

    if (subErr || !sourceSubjects || sourceSubjects.length === 0) {
      toast.error("Selected source exam has no subjects to copy.");
      setSyncing(false);
      return;
    }

    let clonedCount = 0;

    for (const targetId of targetIds) {
      if (targetId === sourceExamId) continue; // Don't copy to itself

      for (const sub of sourceSubjects) {
        // 1. Check or create Subject in target exam
        let { data: existingSub } = await supabase
          .from("subjects")
          .select("id")
          .eq("exam_id", targetId)
          .eq("title", sub.title)
          .maybeSingle();

        let targetSubId = existingSub?.id;

        if (!targetSubId) {
          const { data: newSub, error: createSubErr } = await supabase
            .from("subjects")
            .insert({
              title: sub.title,
              exam_id: targetId,
              slug: `${slugify(sub.title)}-${targetId}-${Date.now().toString().slice(-4)}`
            })
            .select()
            .single();

          if (!createSubErr && newSub) {
            targetSubId = newSub.id;
          }
        }

        // 2. Clone Topics inside Subject
        if (targetSubId && sub.topics && sub.topics.length > 0) {
          const { data: existingTopics } = await supabase
            .from("topics")
            .select("title")
            .eq("subject_id", targetSubId);

          const existingTitles = new Set(existingTopics?.map((t) => t.title) || []);

          const newTopics = sub.topics
            .filter((t: any) => !existingTitles.has(t.title))
            .map((t: any, idx: number) => ({
              title: t.title,
              description: t.description,
              subject_id: targetSubId,
              is_free: t.is_free,
              slug: `${slugify(t.title)}-${targetId}-${idx}-${Date.now().toString().slice(-4)}`
            }));

          if (newTopics.length > 0) {
            await supabase.from("topics").insert(newTopics);
            clonedCount += newTopics.length;
          }
        }
      }
    }

    setSyncing(false);
    setShowSyncModal(false);
    setTargetExamForSync(null);
    toast.success(`🎉 Done! Cloned ${clonedCount} topics across selected exams!`);
    loadExams();
  }

  // Toggle Exam Active/Inactive Status (ON/OFF)
  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    const { error } = await supabase.from("exams").update({ is_active: nextStatus }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    
    setExams((prev) => prev.map((ex) => (ex.id === id ? { ...ex, is_active: nextStatus } : ex)));
    toast.success(nextStatus ? "🟢 Exam turned ON (Visible to students)" : "⚪ Exam turned OFF (Hidden)");
  }

  function handleEdit(exam: any) {
    setTitle(exam.title); setDesc(exam.description || ""); setEditingId(exam.id); setShowForm(true);
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This will also remove all associated subjects and topics.`)) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Exam deleted!");
    loadExams();
  }

  // Find master source exam title
  const masterExamObj = exams.find((e) => e.id === sourceExamId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Exams & Syllabus Synchronizer</h1>
          <p className="page-subtitle">
            Manage exams & sync master syllabus (Math, Reasoning, History, Science) in 1 click across all exams!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ⚡ 1-Click Master Sync All Button */}
          <button
            onClick={() => {
              const emptyExams = exams.filter((e) => (e.subjects?.length || 0) === 0).map((e) => e.id);
              if (emptyExams.length === 0) {
                toast.error("All exams already have syllabus! Use per-exam Sync button to copy to specific exams.");
                return;
              }
              if (confirm(`⚡ Copy Master Syllabus (${masterExamObj?.title}) to ALL ${emptyExams.length} empty exams at once?`)) {
                handleSyncSyllabus(emptyExams);
              }
            }}
            className="a-btn a-btn-success"
            disabled={syncing}
          >
            ⚡ {syncing ? "Cloning..." : `Sync Master Syllabus to All Exams`}
          </button>

          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(""); setDesc(""); }}
            className="a-btn a-btn-primary"
          >
            ➕ Add Exam
          </button>
        </div>
      </div>

      {/* 🟢 Sync Syllabus Modal / Card */}
      {showSyncModal && (
        <div className="a-card border-amber-500/40 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-amber-400">
              ⚡ Import / Copy Master Syllabus {targetExamForSync ? `to "${targetExamForSync.title}"` : ""}
            </h3>
            <button onClick={() => setShowSyncModal(false)} className="text-gray-400 hover:text-white text-xs">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                1. Select Master Source Exam (Copy From) *
              </label>
              <select
                className="a-input a-select"
                value={sourceExamId}
                onChange={(e) => setSourceExamId(Number(e.target.value))}
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.subjects?.length || 0} subjects)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                2. Target Exam (Copy To)
              </label>
              <input
                className="a-input font-bold text-indigo-400"
                value={targetExamForSync ? targetExamForSync.title : "Selected Exams"}
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                if (targetExamForSync) {
                  handleSyncSyllabus([targetExamForSync.id]);
                }
              }}
              className="a-btn a-btn-primary"
              disabled={syncing}
            >
              {syncing ? "Cloning..." : `✓ Clone Syllabus Now`}
            </button>
            <button onClick={() => setShowSyncModal(false)} className="a-btn a-btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Single Add/Edit Exam Form */}
      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.2)" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: "1.25rem" }}>
            {editingId ? "Edit Exam" : "New Exam"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label className="a-label">Exam Title *</label>
                <input
                  className="a-input"
                  placeholder="e.g. SSC CGL, SSC CHSL, Railway RRB"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                {title && (
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem" }}>
                    Slug: {slugify(title)}
                  </div>
                )}
              </div>
              <div>
                <label className="a-label">Description</label>
                <textarea
                  className="a-input"
                  placeholder="Brief description of this exam..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Exam" : "Create Exam"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exams Grid */}
      {loading ? (
        <div className="exams-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="a-card exam-skeleton" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="a-card a-empty">
          <span className="a-empty-icon">📋</span>
          No exams yet. Create your first exam!
        </div>
      ) : (
        <div className="exams-grid">
          {exams.map(exam => {
            const subjectCount = exam.subjects?.length || 0;
            const topicCount = exam.subjects?.reduce((acc: number, s: any) => acc + (s.topics?.length || 0), 0) || 0;
            const isActive = exam.is_active ?? true;

            return (
              <div
                key={exam.id}
                className={`exam-card flex flex-col justify-between transition-all ${
                  !isActive ? "opacity-60 bg-slate-900/60 border-gray-800" : ""
                }`}
              >
                <div>
                  <div className="exam-card-header">
                    <div className="flex items-center gap-2">
                      <div className="exam-icon">📋</div>
                      
                      {/* 🔘 ON/OFF Toggle Switch Button */}
                      <button
                        onClick={() => toggleActive(exam.id, isActive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}
                        title={isActive ? "Click to turn OFF (Hide from site)" : "Click to turn ON (Show on site)"}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                        <span>{isActive ? "ON" : "OFF"}</span>
                      </button>
                    </div>

                    <div className="exam-actions">
                      <button onClick={() => handleEdit(exam)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                      <button onClick={() => handleDelete(exam.id, exam.title)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                    </div>
                  </div>

                  <h3 className="exam-title flex items-center justify-between">
                    <span>{exam.title}</span>
                  </h3>
                  {exam.description && <p className="exam-desc">{exam.description}</p>}
                </div>

                <div className="pt-3 border-t border-gray-800 space-y-2 mt-4">
                  {/* Live Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-semibold">Syllabus Status:</span>
                    {subjectCount > 0 ? (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        📚 {subjectCount} Subs ({topicCount} Q-Topics)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        ⚠️ 0 Subjects (Empty)
                      </span>
                    )}
                  </div>

                  {/* Per-Exam Sync / Copy Button */}
                  <button
                    onClick={() => {
                      setTargetExamForSync(exam);
                      setShowSyncModal(true);
                    }}
                    className="w-full text-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    ⚡ {subjectCount > 0 ? "Re-Sync / Import Syllabus" : "Copy Master Syllabus Here"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .exam-card {
          background: #1a1d2e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.875rem;
          padding: 1.25rem;
          transition: all 0.15s;
        }
        .exam-card:hover {
          border-color: rgba(99,102,241,0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .exam-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; }
        .exam-icon { font-size: 1.75rem; }
        .exam-actions { display: flex; gap: 0.375rem; }
        .exam-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.375rem; }
        .exam-desc { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.5; margin-bottom: 0.75rem; }
        .exam-skeleton { height: 160px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

