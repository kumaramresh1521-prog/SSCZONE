"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Save,
  X,
  FileText,
  Eye,
  Filter,
  Layers,
  Clock,
  Flame,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Code2,
  Table as TableIcon,
  Tag,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ALL_SUBJECTS, ChapterNote, SubjectMeta } from "@/lib/chapter-notes-store";

export default function AdminChapterNotesPage() {
  const [notes, setNotes] = useState<ChapterNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "chapter_note" | "educational_guide">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [hindiTitle, setHindiTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"chapter_note" | "educational_guide">("chapter_note");
  const [subjectId, setSubjectId] = useState("physics");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [readTime, setReadTime] = useState("6 min read");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [examTag, setExamTag] = useState("SSC CGL / CHSL");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [activePreviewTab, setActivePreviewTab] = useState<"editor" | "preview">("editor");

  // Load Notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/chapter-notes");
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err: any) {
      toast.error("Failed to load chapter notes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Subject filter
      if (selectedSubjectFilter !== "all" && n.subject_id !== selectedSubjectFilter) {
        return false;
      }
      // Type filter
      if (selectedTypeFilter !== "all" && n.type !== selectedTypeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "active" && !n.is_active) return false;
      if (statusFilter === "inactive" && n.is_active) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchHindi = n.hindi_title?.toLowerCase().includes(q);
        const matchSubj = n.subject_name?.toLowerCase().includes(q);
        const matchSlug = n.slug?.toLowerCase().includes(q);
        if (!matchTitle && !matchHindi && !matchSubj && !matchSlug) return false;
      }
      return true;
    });
  }, [notes, selectedSubjectFilter, selectedTypeFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = notes.length;
    const active = notes.filter((n) => n.is_active).length;
    const inactive = total - active;
    const chapterNotes = notes.filter((n) => n.type === "chapter_note").length;
    const guides = notes.filter((n) => n.type === "educational_guide").length;
    const subjectsCovered = new Set(notes.map((n) => n.subject_id)).size;
    return { total, active, inactive, chapterNotes, guides, subjectsCovered };
  }, [notes]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setHindiTitle("");
    setSlug("");
    setType("chapter_note");
    setSubjectId("physics");
    setCustomSubjectName("");
    setChapterNumber(notes.filter((n) => n.subject_id === "physics").length + 1);
    setChapterTitle("");
    setReadTime("6 min read");
    setExcerpt("");
    setContent(`<h2>1. Chapter Introduction & Theory</h2>
<p>Write chapter theory, definitions, and key SSC examination concepts here...</p>

<div class="callout-box info">
  <p><strong>💡 Key Formula / Rule:</strong> Insert important formula here.</p>
</div>

<h2>2. Important Tables & Comparisons</h2>
<table class="notes-table">
  <thead>
    <tr>
      <th>Topic / Parameter</th>
      <th>Key Concept</th>
      <th>SSC Exam Importance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Concept A</td>
      <td>Definition and explanation</td>
      <td>High Weightage</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>🔥 SSC PYQ Trend:</strong> Highlight repeated questions from recent shifts.</p>
</div>`);
    setExamTag("SSC CGL / CHSL");
    setSortOrder(notes.length + 1);
    setIsActive(true);
    setActivePreviewTab("editor");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (note: ChapterNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setHindiTitle(note.hindi_title || "");
    setSlug(note.slug);
    setType(note.type);
    setSubjectId(note.subject_id);
    setCustomSubjectName(note.subject_name || "");
    setChapterNumber(note.chapter_number || 1);
    setChapterTitle(note.chapter_title || note.title);
    setReadTime(note.read_time || "6 min read");
    setExcerpt(note.excerpt || "");
    setContent(note.content || "");
    setExamTag(note.exam_tag || "SSC CGL / CHSL");
    setSortOrder(note.sort_order || 1);
    setIsActive(note.is_active);
    setActivePreviewTab("editor");
    setIsModalOpen(true);
  };

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingId) {
      const generated = `${subjectId}-${newTitle}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
      if (!chapterTitle) setChapterTitle(newTitle);
    }
  };

  // Save Note
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter a chapter title");
    if (!content.trim()) return toast.error("Please enter chapter content");

    try {
      setSaving(true);
      const subjectObj = ALL_SUBJECTS.find((s) => s.id === subjectId);
      const resolvedSubjectName =
        subjectId === "custom" && customSubjectName.trim()
          ? customSubjectName.trim()
          : subjectObj
          ? `${subjectObj.name} (${subjectObj.hindi_name})`
          : "General Subject";

      const payload = {
        id: editingId || undefined,
        title: title.trim(),
        hindi_title: hindiTitle.trim() || undefined,
        slug: slug.trim() || undefined,
        type,
        subject_id: subjectId,
        subject_name: resolvedSubjectName,
        chapter_number: Number(chapterNumber) || 1,
        chapter_title: chapterTitle.trim() || title.trim(),
        read_time: readTime.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        exam_tag: examTag.trim(),
        sort_order: Number(sortOrder) || 1,
        is_active: isActive,
      };

      const res = await fetch("/api/admin/chapter-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save chapter note");
      }

      toast.success(editingId ? "Chapter note updated!" : "New chapter note published!");
      setIsModalOpen(false);
      loadNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  // One-Click ON / OFF Toggle
  const handleToggleStatus = async (note: ChapterNote) => {
    try {
      const newStatus = !note.is_active;
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, is_active: newStatus } : n))
      );

      const res = await fetch(`/api/admin/chapter-notes?id=${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle status");
      }

      toast.success(
        newStatus
          ? `🟢 "${note.title}" is now PUBLISHED (ON)`
          : `⚪ "${note.title}" is now HIDDEN / DRAFT (OFF)`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
      loadNotes(); // Revert on failure
    }
  };

  // Delete Note
  const handleDelete = async (id: string, noteTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${noteTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/chapter-notes?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete note");
      }

      toast.success("Chapter note deleted successfully");
      loadNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  // Quick insertion helpers for content editor
  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + "\n\n" + snippet);
    toast.success("Template inserted into editor!");
  };

  return (
    <div className="space-y-6 text-slate-900 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              <span>Chapter Notes & Educational Blog Manager</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-700 border border-blue-200">
              Interactive 2-Column Reader
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage subject-wise chapter notes, formulas, and random educational revision guides with instant 1-click ON/OFF toggle controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/blog/notes"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>View Reader UI</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Chapter Note</span>
          </button>
        </div>
      </div>

      {/* ── Stats Dashboard Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Notes</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Published (ON)</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">{stats.active}</p>
        </div>

        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Drafts / Hidden (OFF)</span>
          <p className="text-xl sm:text-2xl font-black text-slate-600 mt-0.5">{stats.inactive}</p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Chapter Modules</span>
          <p className="text-xl sm:text-2xl font-black text-blue-800 mt-0.5">{stats.chapterNotes}</p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Revision Tricks</span>
          <p className="text-xl sm:text-2xl font-black text-rose-800 mt-0.5">{stats.guides}</p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Subjects Live</span>
          <p className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">{stats.subjectsCovered}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by chapter title, hindi title, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects ({notes.length})</option>
              {ALL_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.hindi_name})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Content Types</option>
              <option value="chapter_note">📑 Structured Chapter Notes</option>
              <option value="educational_guide">💡 Random Educational Guides</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">🟢 Published Only (ON)</option>
              <option value="inactive">⚪ Drafts Only (OFF)</option>
            </select>
          </div>

          <button
            onClick={loadNotes}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Notes Table / List with One-Click ON/OFF Toggle ── */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-spin" />
            Loading chapter notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No chapter notes match your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try resetting the subject or search query, or click below to upload a new note.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Upload Chapter Note
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 w-16">Ch #</th>
                  <th className="py-3.5 px-4">Subject & Chapter Title</th>
                  <th className="py-3.5 px-4 w-32">Content Type</th>
                  <th className="py-3.5 px-4 w-28">Read Time</th>
                  <th className="py-3.5 px-4 w-36 text-center">Status (ON / OFF)</th>
                  <th className="py-3.5 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotes.map((note) => {
                  return (
                    <tr key={note.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Chapter number */}
                      <td className="py-3 px-4 font-black text-slate-400">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700">
                          {String(note.chapter_number || 1).padStart(2, "0")}
                        </span>
                      </td>

                      {/* Title & Hindi title & Subject badge */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                              {note.subject_name || note.subject_id}
                            </span>
                            {note.exam_tag && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                • {note.exam_tag}
                              </span>
                            )}
                          </div>

                          <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {note.title}
                          </p>

                          {note.hindi_title && (
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {note.hindi_title}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        {note.type === "chapter_note" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <BookOpen className="w-3 h-3" />
                            <span>Chapter Note</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            <Flame className="w-3 h-3 text-rose-500" />
                            <span>Revision Trick</span>
                          </span>
                        )}
                      </td>

                      {/* Read Time */}
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{note.read_time || "6 min"}</span>
                        </span>
                      </td>

                      {/* ── ON / OFF TOGGLE BUTTON ── */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(note)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-2xs ${
                            note.is_active
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle ON/OFF"
                        >
                          {note.is_active ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>LIVE (ON)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              <span>OFF (Draft)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/notes/${note.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Preview on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(note)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Chapter Note"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(note.id, note.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          CREATE / EDIT CHAPTER NOTE MODAL
         ════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingId ? "Edit Chapter Note" : "Upload New Chapter Note"}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in the details below. Chapter will be published immediately or saved as draft based on the toggle.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-left">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Content Category</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType("chapter_note")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      type === "chapter_note" ? "bg-white text-blue-700 shadow-xs font-black" : "text-slate-600"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>📑 Structured Subject Chapter Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("educational_guide")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      type === "educational_guide" ? "bg-white text-rose-700 shadow-xs font-black" : "text-slate-600"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>💡 Random Educational Guide / Trick</span>
                  </button>
                </div>
              </div>

              {/* Subject & Chapter Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.hindi_name})
                      </option>
                    ))}
                    <option value="custom">+ Add Other / Custom Subject</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chapter # / Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {subjectId === "custom" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Custom Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Environmental Studies (पर्यावरण अध्ययन)"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              )}

              {/* Title & Hindi Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chapter Title (English) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Units, Dimensions & Measurement"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hindi Title (हिंदी शीर्षक)</label>
                  <input
                    type="text"
                    placeholder="e.g. मात्रक, विमाएं एवं मापन"
                    value={hindiTitle}
                    onChange={(e) => setHindiTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Slug & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Live URL: /blog/notes/{slug || "slug"}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 7 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Excerpt / Exam Crux */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Crux & Summary (Top Box)</label>
                <textarea
                  rows={2}
                  placeholder="Key takeaways, SSC question frequency, and core formula highlights..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content Editor with Quick Snippet Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Chapter Content (HTML / Rich Format) *
                  </label>

                  {/* Snippet insertion shortcuts */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Snippets:</span>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(`<div class="formula-card">
  <code>Formula Name: F = m × a</code>
  <p style="margin-top: 6px; font-size: 13px;">SI Unit: Newton (N) | Dimensions: [M L T⁻²]</p>
</div>`)
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      + Formula Card
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(`<div class="callout-box alert">
  <p><strong>🔥 SSC PYQ Trend Alert:</strong> Mention repeated question patterns and safe tricks.</p>
</div>`)
                      }
                      className="px-2 py-0.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold"
                    >
                      + PYQ Alert
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(`<table class="notes-table">
  <thead>
    <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
  </thead>
  <tbody>
    <tr><td>Example 1</td><td>Data</td><td>Unit</td></tr>
  </tbody>
</table>`)
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      + Table
                    </button>
                  </div>
                </div>

                <textarea
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 font-mono border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status Toggle & Sort Order */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isActive ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Status: {isActive ? "🟢 Published & Live (ON)" : "⚪ Draft / Hidden (OFF)"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      When ON, students can immediately read this chapter in the reader UI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">Order:</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : editingId ? "Save Changes" : "Publish Chapter"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
