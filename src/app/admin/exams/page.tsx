"use client";

import { useEffect, useState, useMemo } from "react";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Power, 
  RefreshCw, 
  Layers, 
  BookOpen, 
  Copy, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Trash2, 
  Star,
  Search,
  Filter
} from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [targetExamForSync, setTargetExamForSync] = useState<any | null>(null);
  
  // Single Exam Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(99);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Sync Modal State
  const [sourceExamId, setSourceExamId] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  // UI Filters
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadExams(); }, []);

  async function loadExams() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.exams) {
        setExams(data.exams);
        if (data.exams.length > 0 && !sourceExamId) {
          const masterExam = [...data.exams].sort((a, b) => (b.subjects?.length || 0) - (a.subjects?.length || 0))[0];
          if (masterExam) setSourceExamId(masterExam.id);
        }
      } else {
        toast.error(data.error || "Failed to load exams");
      }
    } catch {
      toast.error("Network error loading exams");
    } finally {
      setLoading(false);
    }
  }

  // 1-Click: Focus on SSC CGL Only
  async function handleFocusCGL() {
    if (!confirm("🎯 Activate SSC CGL Focus Mode?\n\nThis will make SSC CGL the ONLY live exam on the landing page & navigation. All other exams will be set to Upcoming/In-Prep.")) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "focus_cgl" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "SSC CGL Focus Mode activated!");
        loadExams();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ssczone-exams-changed"));
        }
      } else {
        toast.error(data.error || "Failed to activate CGL focus");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  // 1-Click: Enable All Core SSC Exams
  async function handleEnableAllCore() {
    if (!confirm("🟢 Activate all core SSC exams (CGL, CHSL, CPO, MTS, GD, Steno)?")) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable_all_core" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "All core exams activated!");
        loadExams();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ssczone-exams-changed"));
        }
      } else {
        toast.error(data.error || "Failed to activate core exams");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  // Toggle Exam Active/Inactive Status (ON/OFF)
  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active", id, isActive: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setExams((prev) => prev.map((ex) => (ex.id === id ? { ...ex, is_active: nextStatus } : ex)));
        toast.success(data.message || (nextStatus ? "🟢 Exam turned ON" : "⚪ Exam turned OFF"));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ssczone-exams-changed"));
        }
      } else {
        toast.error(data.error || "Failed to update exam");
      }
    } catch {
      toast.error("Network error");
    }
  }

  // Set Exam as Primary Focus (sort_order = 1)
  async function handleSetPrimary(id: number) {
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("⭐ Set as Primary Exam!");
        loadExams();
      } else {
        toast.error(data.error || "Failed to set primary");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_exam",
          id: editingId,
          title,
          description: desc,
          sort_order: sortOrder
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setTitle("");
        setDesc("");
        setEditingId(null);
        toast.success(data.message || "Exam saved!");
        loadExams();
      } else {
        toast.error(data.error || "Failed to save exam");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  // Master Syllabus Cloning Function
  async function handleSyncSyllabus(targetIds: number[]) {
    if (!sourceExamId) { toast.error("Select a source exam first!"); return; }
    if (targetIds.length === 0) { toast.error("No target exams selected!"); return; }

    setSyncing(true);
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_syllabus",
          sourceExamId,
          targetExamIds: targetIds
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSyncModal(false);
        setTargetExamForSync(null);
        toast.success(data.message || `🎉 Cloned ${data.clonedCount || 0} topics!`);
        loadExams();
      } else {
        toast.error(data.error || "Failed to sync syllabus");
      }
    } catch {
      toast.error("Network error syncing syllabus");
    } finally {
      setSyncing(false);
    }
  }

  function handleEdit(exam: any) {
    setTitle(exam.title);
    setDesc(exam.description || "");
    setSortOrder(exam.sort_order || 99);
    setEditingId(exam.id);
    setShowForm(true);
  }

  async function handleDelete(id: number, examTitle: string) {
    if (!confirm(`Delete "${examTitle}"? This will also remove all associated subjects and topics.`)) return;
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_exam", id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Exam deleted!");
        loadExams();
      } else {
        toast.error(data.error || "Failed to delete exam");
      }
    } catch {
      toast.error("Network error");
    }
  }

  // Computed Lists
  const activeExams = useMemo(() => exams.filter((e) => Boolean(e.is_active)), [exams]);
  const inactiveExams = useMemo(() => exams.filter((e) => !e.is_active), [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;

      if (activeTab === "active") return Boolean(e.is_active);
      if (activeTab === "inactive") return !e.is_active;
      return true;
    });
  }, [exams, activeTab, searchQuery]);

  const masterExamObj = exams.find((e) => e.id === sourceExamId);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Exams & Focus Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure live exams visible to students. Keep focus on SSC CGL 2026, and turn on additional exams (CHSL, CPO, MTS, GD) with 1 click as their test series are verified.
          </p>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleFocusCGL}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-2 text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Focus strictly on SSC CGL (Sets CGL to Live, turns others to Upcoming)"
          >
            <Star className="h-4 w-4 fill-slate-950" />
            <span>🎯 Focus on SSC CGL Only</span>
          </button>

          <button
            onClick={handleEnableAllCore}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>🟢 Activate All Core SSC</span>
          </button>

          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(""); setDesc(""); setSortOrder(99); }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Website Live Status Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-bold text-slate-200">Live Website Status Overview</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Preview Landing Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Active Live Strip */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                🟢 Live on Homepage & Nav ({activeExams.length})
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 text-[10px]">
                ACTIVE
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeExams.length === 0 ? (
                <span className="text-slate-400 italic">No exams live. Please activate at least SSC CGL!</span>
              ) : (
                activeExams.map((ex) => (
                  <span
                    key={ex.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-emerald-300 font-bold"
                  >
                    {ex.sort_order === 1 && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    <span>{ex.title}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Upcoming / In Prep Strip */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[11px]">
                ⏳ Upcoming / In Preparation ({inactiveExams.length})
              </span>
              <span className="rounded-full bg-slate-800 text-slate-400 font-bold px-2 py-0.5 text-[10px]">
                COMING SOON
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {inactiveExams.map((e) => e.title).join(", ") || "None"}
            </p>
          </div>

          {/* Master Syllabus Sync Shortcut */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400 uppercase tracking-wide text-[11px]">
                  Master Syllabus Sync
                </span>
                <span className="text-[10px] text-indigo-300 font-medium">Source: {masterExamObj?.title || "SSC CGL"}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Copy subjects & topics in 1 click across exams.
              </p>
            </div>
            <button
              onClick={() => {
                const emptyExams = exams.filter((e) => (e.subjects?.length || 0) === 0).map((e) => e.id);
                if (emptyExams.length === 0) {
                  toast.error("All exams already have subjects! Click 'Re-Sync' on any specific exam card below.");
                  return;
                }
                if (confirm(`⚡ Copy Master Syllabus to all ${emptyExams.length} empty exams at once?`)) {
                  handleSyncSyllabus(emptyExams);
                }
              }}
              disabled={syncing}
              className="mt-2 w-full rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              ⚡ {syncing ? "Cloning..." : "Sync to All Empty Exams"}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Syllabus Modal / Card */}
      {showSyncModal && (
        <div className="rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Clone / Sync Syllabus {targetExamForSync ? `to "${targetExamForSync.title}"` : ""}</span>
            </h3>
            <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                1. Select Master Source Exam (Copy From) *
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                2. Target Exam (Copy To)
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
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
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              disabled={syncing}
            >
              {syncing ? "Cloning..." : `✓ Clone Syllabus Now`}
            </button>
            <button 
              onClick={() => setShowSyncModal(false)} 
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Exam Form */}
      {showForm && (
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/95 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">
              {editingId ? "✏️ Edit Exam Details" : "➕ Create New Exam"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Exam Title *</label>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. SSC CGL, SSC CHSL, Railway RRB NTPC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {title && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Generated Slug: <code className="text-blue-400">{slugify(title)}</code>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Sort Priority Order</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="1 for primary, 2, 3..."
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
                <p className="text-[10px] text-slate-500 mt-1">1 = Flagship First</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description / Subtitle</label>
              <textarea
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Posts covered, eligibility, brief summary for landing page..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : editingId ? "Update Exam" : "Create Exam (Upcoming)"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-400 hover:bg-emerald-950/40"
            }`}
          >
            <span>🟢 Live ({activeExams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "inactive" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span>⏳ Upcoming ({inactiveExams.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
          <Target className="h-8 w-8 mx-auto text-slate-500" />
          <p className="text-sm font-semibold">No exams match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const subjectCount = exam.subjects?.length || 0;
            const topicCount = exam.subjects?.reduce((acc: number, s: any) => acc + (s.topics?.length || 0), 0) || 0;
            const isActive = Boolean(exam.is_active);
            const isPrimary = exam.sort_order === 1;

            return (
              <div
                key={exam.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? isPrimary
                      ? "bg-slate-900/90 border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg"
                      : "bg-slate-900/80 border-slate-700 shadow-sm hover:border-blue-500/40"
                    : "bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100"
                }`}
              >
                <div>
                  {/* Top Header Strip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {isPrimary && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black text-amber-300">
                          <Star className="h-3 w-3 fill-amber-300" />
                          PRIMARY FOCUS
                        </span>
                      )}

                      {/* 1-Click Toggle ON/OFF */}
                      <button
                        onClick={() => toggleActive(exam.id, isActive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition-all border cursor-pointer ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs hover:bg-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                        title={isActive ? "Click to turn OFF (Hide as upcoming)" : "Click to turn ON (Make live to students)"}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                        <span>{isActive ? "LIVE ON SITE" : "UPCOMING"}</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Exam"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title and details */}
                  <h3 className="text-base font-bold text-white flex items-center justify-between gap-2">
                    <span>{exam.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{exam.sort_order}</span>
                  </h3>
                  
                  {exam.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Syllabus:</span>
                    {subjectCount > 0 ? (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px]">
                        📚 {subjectCount} Subs ({topicCount} Topics)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[11px]">
                        ⚠️ 0 Subjects (Empty)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Make Primary Button */}
                    {!isPrimary ? (
                      <button
                        onClick={() => handleSetPrimary(exam.id)}
                        className="rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 py-1.5 text-[11px] font-bold transition-all text-center cursor-pointer"
                      >
                        ⭐ Set Primary
                      </button>
                    ) : (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 py-1.5 text-[11px] font-black text-center">
                        ⭐ Main Target
                      </div>
                    )}

                    {/* Clone Syllabus */}
                    <button
                      onClick={() => {
                        setTargetExamForSync(exam);
                        setShowSyncModal(true);
                      }}
                      className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 py-1.5 text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{subjectCount > 0 ? "Re-Sync" : "Sync"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
