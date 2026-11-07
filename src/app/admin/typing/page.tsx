"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Keyboard,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Sparkles,
  Eye,
  X,
  Clock,
  Zap,
  Target,
  FileText,
  RotateCcw,
  BookOpen,
  Filter,
  UploadCloud,
  Check,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  TypingPassage,
  DEFAULT_TYPING_PASSAGES,
  getStoredTypingPassages,
  saveTypingPassage,
  deleteTypingPassage,
  resetTypingPassagesToDefault
} from "@/lib/typing-store";

export default function AdminTypingPage() {
  const [passages, setPassages] = useState<TypingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExam, setFilterExam] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewPassage, setPreviewPassage] = useState<TypingPassage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState<"cgl" | "chsl-en" | "chsl-hi" | "deo" | "custom">("cgl");
  const [timeMinutes, setTimeMinutes] = useState<number>(15);
  const [targetWPM, setTargetWPM] = useState<number>(27);
  const [targetKeyDepressions, setTargetKeyDepressions] = useState<number>(2000);
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Load Passages
  useEffect(() => {
    loadPassages();
  }, []);

  const loadPassages = () => {
    setLoading(true);
    try {
      const stored = getStoredTypingPassages();
      setPassages(stored);
    } catch (e) {
      setPassages(DEFAULT_TYPING_PASSAGES);
    } finally {
      setLoading(false);
    }
  };

  // Sync examType defaults when creating
  const handleExamTypeChange = (type: "cgl" | "chsl-en" | "chsl-hi" | "deo" | "custom") => {
    setExamType(type);
    if (!editingId) {
      if (type === "cgl") {
        setTimeMinutes(15);
        setTargetWPM(27);
        setTargetKeyDepressions(2000);
      } else if (type === "chsl-en") {
        setTimeMinutes(10);
        setTargetWPM(35);
        setTargetKeyDepressions(1750);
      } else if (type === "chsl-hi") {
        setTimeMinutes(10);
        setTargetWPM(30);
        setTargetKeyDepressions(1500);
      } else if (type === "deo") {
        setTimeMinutes(15);
        setTargetWPM(50);
        setTargetKeyDepressions(3700);
      } else {
        setTimeMinutes(10);
        setTargetWPM(30);
        setTargetKeyDepressions(1500);
      }
    }
  };

  // Live auto-calculated stats for the form textarea
  const computedWords = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const computedChars = content.length;
  const suggestedDepressions = computedWords * 5;

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setExamType("cgl");
    setTimeMinutes(15);
    setTargetWPM(27);
    setTargetKeyDepressions(2000);
    setContent("");
    setDifficulty("Medium");
    setIsModalOpen(true);
  };

  const openEditModal = (p: TypingPassage) => {
    setEditingId(p.id);
    setTitle(p.title);
    setExamType(p.examType);
    setTimeMinutes(p.timeMinutes);
    setTargetWPM(p.targetWPM);
    setTargetKeyDepressions(p.targetKeyDepressions);
    setContent(p.content);
    setDifficulty(p.difficulty || "Medium");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are mandatory!");
      return;
    }

    setSaving(true);
    try {
      const examName =
        examType === "cgl"
          ? "SSC CGL DEST"
          : examType === "chsl-en"
          ? "SSC CHSL English"
          : examType === "chsl-hi"
          ? "SSC CHSL Hindi"
          : examType === "deo"
          ? "SSC DEO High Speed"
          : "Custom Practice";

      const savedItem = saveTypingPassage({
        id: editingId || undefined,
        title: title.trim(),
        content: content.trim(),
        examType,
        examName,
        timeMinutes: Number(timeMinutes),
        targetWPM: Number(targetWPM),
        targetKeyDepressions: Number(targetKeyDepressions) || computedWords * 5,
        wordCount: computedWords,
        difficulty,
      });

      // Also sync to server API
      try {
        await fetch("/api/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedItem),
        });
      } catch (err) {
        console.warn("Server API sync warning:", err);
      }

      toast.success(editingId ? "Passage updated successfully!" : "New Typing Passage added!");
      setIsModalOpen(false);
      loadPassages();
    } catch (err: any) {
      toast.error(err.message || "Failed to save passage");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, isDefault?: boolean) => {
    if (isDefault) {
      if (!confirm("This is a built-in default passage. Are you sure you want to delete it?")) return;
    } else {
      if (!confirm("Delete this typing passage permanently?")) return;
    }

    deleteTypingPassage(id);
    try {
      await fetch(`/api/typing?id=${id}`, { method: "DELETE" });
    } catch (e) {}

    toast.success("Passage removed");
    loadPassages();
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all passages back to the official default library? Custom passages might be replaced.")) {
      resetTypingPassagesToDefault();
      toast.success("Reset to default passages complete!");
      loadPassages();
    }
  };

  // Filtered list
  const filtered = useMemo(() => {
    return passages.filter((p) => {
      const matchExam = filterExam === "all" || p.examType === filterExam;
      const matchQuery =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchExam && matchQuery;
    });
  }, [passages, filterExam, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* ── TOP HEADER ── */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                SSCZone CMS Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Typing Test Passages Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload, edit, and organize typing test passages for SSC CGL DEST, CHSL & DEO examinations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/typing"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-blue-400" /> View Live Test Portal
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Passage
            </button>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Passages</p>
            <p className="text-2xl font-black text-white mt-1">{passages.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">CGL DEST (27 WPM)</p>
            <p className="text-2xl font-black text-blue-400 mt-1">
              {passages.filter((p) => p.examType === "cgl").length}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">CHSL (30-35 WPM)</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {passages.filter((p) => p.examType.startsWith("chsl")).length}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">DEO High Speed</p>
            <p className="text-2xl font-black text-violet-400 mt-1">
              {passages.filter((p) => p.examType === "deo").length}
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or paragraph content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter Exam:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "cgl", label: "CGL DEST" },
              { id: "chsl-en", label: "CHSL English" },
              { id: "chsl-hi", label: "CHSL Hindi" },
              { id: "deo", label: "DEO" },
              { id: "custom", label: "Custom" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterExam(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterExam === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={handleResetDefaults}
              title="Reset default library"
              className="ml-auto md:ml-3 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PASSAGES TABLE / LIST ── */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading passages...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-bold text-sm">No typing passages found.</p>
              <p className="text-slate-500 text-xs mt-1">Try another search or click "Add New Passage".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3.5 px-4">Exam & Title</th>
                    <th className="py-3.5 px-4">Target Speed</th>
                    <th className="py-3.5 px-4">Depressions</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Words</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              p.examType === "cgl"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : p.examType === "chsl-en"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : p.examType === "chsl-hi"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : p.examType === "deo"
                                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {p.examName}
                          </span>
                          {p.isDefault && (
                            <span className="text-[10px] text-slate-500 font-semibold">Official SSC</span>
                          )}
                        </div>
                        <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-mono">
                          {p.content}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-blue-400 text-sm">{p.targetWPM}</span>{" "}
                        <span className="text-slate-500">WPM</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-200">
                        {p.targetKeyDepressions}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-semibold">
                        {p.timeMinutes} Min
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                        {p.wordCount} words
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setPreviewPassage(p);
                              setIsPreviewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Preview Passage"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Passage"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.isDefault)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT PASSAGE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingId ? "Edit Typing Test Passage" : "Create New Typing Test Passage"}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure exam speed requirements and official content passage.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Exam Category */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Exam Type & Standard
                </label>
                <select
                  value={examType}
                  onChange={(e) => handleExamTypeChange(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="cgl">SSC CGL DEST (15 Min · 27 WPM · 2000 Depressions)</option>
                  <option value="chsl-en">SSC CHSL English (10 Min · 35 WPM · 1750 Depressions)</option>
                  <option value="chsl-hi">SSC CHSL Hindi (10 Min · 30 WPM · 1500 Depressions)</option>
                  <option value="deo">SSC DEO High Speed (15 Min · 50 WPM · 3700 Depressions)</option>
                  <option value="custom">Custom Practice Passage</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Passage Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parliamentary Democracy & Constitutional Governance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              {/* Grid: Time, Target WPM, Depressions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target WPM
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    required
                    value={targetWPM}
                    onChange={(e) => setTargetWPM(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Depressions
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    required
                    value={targetKeyDepressions}
                    onChange={(e) => setTargetKeyDepressions(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Passage Text / Content
                  </label>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>
                      Words: <strong className="text-white">{computedWords}</strong>
                    </span>
                    <span>
                      Chars: <strong className="text-white">{computedChars}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTargetKeyDepressions(suggestedDepressions)}
                      className="text-blue-400 hover:text-blue-300 underline font-sans text-[10px]"
                    >
                      Use ~{suggestedDepressions} Depressions
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste or type the official examination passage text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingId ? "Update Passage" : "Save Passage"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PREVIEW PASSAGE MODAL ── */}
      {isPreviewModalOpen && previewPassage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-[10px] uppercase border border-blue-500/30">
              {previewPassage.examName}
            </span>

            <h3 className="text-lg font-black text-white mt-2 mb-3">{previewPassage.title}</h3>

            <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Speed</p>
                <p className="font-extrabold text-blue-400 mt-0.5">{previewPassage.targetWPM} WPM</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Time</p>
                <p className="font-extrabold text-white mt-0.5">{previewPassage.timeMinutes} Min</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Depressions</p>
                <p className="font-extrabold text-white mt-0.5">{previewPassage.targetKeyDepressions}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Words</p>
                <p className="font-extrabold text-white mt-0.5">{previewPassage.wordCount}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-300 max-h-60 overflow-y-auto">
              {previewPassage.content}
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800">
              <Link
                href="/typing"
                target="_blank"
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                Launch in Typing Test Console &rarr;
              </Link>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
