"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
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
  Upload,
  Link as LinkIcon,
  Eye,
  Filter,
  Layers,
  Star,
  Download,
  AlertCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import type { SubjectNote } from "@/lib/subject-notes-store";

const EXAMS_LIST = [
  { id: "ssc-cgl", name: "SSC CGL (Tier 1 & Tier 2)" },
  { id: "ssc-chsl", name: "SSC CHSL (10+2)" },
  { id: "ssc-cpo", name: "SSC CPO (SI in DP & CAPFs)" },
  { id: "ssc-mts", name: "SSC MTS & Havaldar" },
  { id: "ssc-gd-constable", name: "SSC GD Constable" },
  { id: "ssc-stenographer", name: "SSC Stenographer" },
  { id: "all", name: "All SSC Examinations" },
];

const SUBJECTS_LIST = [
  { id: "quant", name: "Quantitative Aptitude (Maths)", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "reasoning", name: "Reasoning & Mental Ability", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "english", name: "English Language & Comprehension", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "history", name: "General Awareness - History", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { id: "polity", name: "General Awareness - Polity & Constitution", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { id: "geography", name: "General Awareness - Geography", badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  { id: "science", name: "General Awareness - Science (Phy/Chem/Bio)", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { id: "economy", name: "General Awareness - Economy", badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { id: "computer", name: "Computer Knowledge & Aptitude", badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { id: "static-gk", name: "Static GK & Art & Culture", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
];

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<SubjectNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "draft">("all");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [hindiTitle, setHindiTitle] = useState("");
  const [exam, setExam] = useState("ssc-cgl");
  const [subject, setSubject] = useState("quant");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileSize, setFileSize] = useState("1.8 MB");
  const [pageCount, setPageCount] = useState<number>(15);
  const [language, setLanguage] = useState<"Bilingual" | "English" | "Hindi">("Bilingual");
  const [isFree, setIsFree] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notes", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
      } else {
        toast.error(data.error || "Failed to load notes");
      }
    } catch {
      toast.error("Network error loading notes");
    } finally {
      setLoading(false);
    }
  }

  // Open Form for Adding New Note
  function handleOpenCreate() {
    setEditingId(null);
    setTitle("");
    setHindiTitle("");
    setExam("ssc-cgl");
    setSubject("quant");
    setTopic("");
    setDescription("");
    setPdfUrl("");
    setFileSize("1.5 MB");
    setPageCount(12);
    setLanguage("Bilingual");
    setIsFree(true);
    setIsFeatured(false);
    setIsActive(true);
    setSortOrder(notes.length + 1);
    setIsModalOpen(true);
  }

  // Open Form for Editing
  function handleOpenEdit(note: SubjectNote) {
    setEditingId(note.id);
    setTitle(note.title);
    setHindiTitle(note.hindi_title || "");
    setExam(note.exam);
    setSubject(note.subject);
    setTopic(note.topic);
    setDescription(note.description);
    setPdfUrl(note.pdf_url);
    setFileSize(note.file_size || "1.5 MB");
    setPageCount(note.page_count || 12);
    setLanguage(note.language || "Bilingual");
    setIsFree(note.is_free !== false);
    setIsFeatured(Boolean(note.is_featured));
    setIsActive(note.is_active !== false);
    setSortOrder(note.sort_order || 1);
    setIsModalOpen(true);
  }

  // Direct PDF File Upload Handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files (.pdf) are allowed");
      return;
    }

    setUploading(true);
    const tid = toast.loading(`Uploading "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch("/api/admin/notes/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPdfUrl(data.url);
        if (data.fileSize) setFileSize(data.fileSize);
        if (!title.trim()) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setTitle(autoTitle);
        }
        toast.success("PDF uploaded successfully!", { id: tid });
      } else {
        toast.error(data.error || "Upload failed", { id: tid });
      }
    } catch {
      toast.error("Network error while uploading PDF", { id: tid });
    } finally {
      setUploading(false);
    }
  }

  // Submit Note Form (Save / Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    if (!pdfUrl.trim()) {
      toast.error("Please provide a PDF link or upload a PDF file");
      return;
    }

    setSaving(true);
    const examObj = EXAMS_LIST.find((x) => x.id === exam);
    const subObj = SUBJECTS_LIST.find((x) => x.id === subject);

    const payload = {
      id: editingId,
      title: title.trim(),
      hindi_title: hindiTitle.trim() || undefined,
      exam,
      exam_name: examObj?.name.split(" ")[0] + " " + (examObj?.name.split(" ")[1] || "") || "SSC CGL",
      subject,
      subject_name: subObj?.name || "General Subject",
      topic: topic.trim() || "General",
      description: description.trim(),
      pdf_url: pdfUrl.trim(),
      file_size: fileSize.trim(),
      page_count: Number(pageCount) || 10,
      language,
      is_free: isFree,
      is_featured: isFeatured,
      is_active: isActive,
      sort_order: Number(sortOrder) || 1,
    };

    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", note: payload }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Note saved!");
        setIsModalOpen(false);
        loadNotes();
      } else {
        toast.error(data.error || "Failed to save note");
      }
    } catch {
      toast.error("Network error saving note");
    } finally {
      setSaving(false);
    }
  }

  // Toggle Active State
  async function handleToggleActive(id: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active", id, isActive: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, is_active: nextStatus } : n)));
        toast.success(nextStatus ? "🟢 Note is now Live on site!" : "⚪ Note set to Draft");
      } else {
        toast.error(data.error || "Failed to update note");
      }
    } catch {
      toast.error("Network error");
    }
  }

  // Delete Note
  async function handleDelete(id: string, noteTitle: string) {
    if (!confirm(`Delete "${noteTitle}"? This will remove the PDF note from the platform.`)) return;

    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Note deleted successfully!");
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    }
  }

  // Computed Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.hindi_title && n.hindi_title.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedExamFilter !== "all" && n.exam !== selectedExamFilter && n.exam !== "all") {
        return false;
      }

      if (selectedSubjectFilter !== "all" && n.subject !== selectedSubjectFilter) {
        return false;
      }

      if (statusTab === "active" && !n.is_active) return false;
      if (statusTab === "draft" && n.is_active) return false;

      return true;
    });
  }, [notes, searchQuery, selectedExamFilter, selectedSubjectFilter, statusTab]);

  const activeCount = useMemo(() => notes.filter((n) => n.is_active !== false).length, [notes]);
  const draftCount = useMemo(() => notes.filter((n) => n.is_active === false).length, [notes]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Subject Notes & PDFs CMS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload & organize chapter-wise PDF notes, formula sheets, and study materials for SSC CGL 2026 and other target exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notes"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors"
          >
            <span>Preview Notes Hub</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload New PDF Note</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
          <span className="text-slate-400 font-semibold">Total Documents</span>
          <p className="text-xl font-black text-white">{notes.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
          <span className="text-emerald-400 font-bold">🟢 Live on Website</span>
          <p className="text-xl font-black text-emerald-300">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
          <span className="text-slate-400 font-semibold">⏳ Drafts / Hidden</span>
          <p className="text-xl font-black text-slate-400">{draftCount}</p>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 space-y-1">
          <span className="text-blue-400 font-bold">🎯 SSC CGL Focus</span>
          <p className="text-xl font-black text-blue-300">
            {notes.filter((n) => n.exam === "ssc-cgl" || n.exam === "all").length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar (Search + Exam Dropdown + Subject Dropdown + Tabs) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Exam Dropdown */}
          <div>
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">🎯 All Target Exams</option>
              {EXAMS_LIST.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown */}
          <div>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">📚 All Subjects</option>
              {SUBJECTS_LIST.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
          <button
            onClick={() => setStatusTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusTab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Notes ({notes.length})
          </button>
          <button
            onClick={() => setStatusTab("active")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusTab === "active" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:bg-emerald-950/30"
            }`}
          >
            🟢 Live ({activeCount})
          </button>
          <button
            onClick={() => setStatusTab("draft")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusTab === "draft" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            ⏳ Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Notes List Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
          <BookOpen className="h-10 w-10 mx-auto text-slate-500" />
          <div>
            <h3 className="text-base font-bold text-white">No PDF notes found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {notes.length === 0
                ? "The previous dummy notes have been cleared. Click 'Upload New PDF Note' above to publish your first genuine study PDF!"
                : "No notes match your active filter. Try changing your search query or dropdown filter."}
            </p>
          </div>
          {notes.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Upload First PDF Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const subMeta = SUBJECTS_LIST.find((s) => s.id === note.subject);

            return (
              <div
                key={note.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  note.is_active
                    ? "bg-slate-900/80 border-slate-800 hover:border-blue-500/40 shadow-sm"
                    : "bg-slate-900/40 border-slate-800/80 opacity-70"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${subMeta?.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                        {subMeta?.name.split("-")[1] || subMeta?.name.split(" ")[0] || "Subject"}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                        {note.exam.toUpperCase()}
                      </span>
                      {note.is_featured && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                          <Star className="h-2.5 w-2.5 fill-amber-300" />
                          <span>PINNED</span>
                        </span>
                      )}
                    </div>

                    {/* Toggle Active Switch */}
                    <button
                      onClick={() => handleToggleActive(note.id, note.is_active)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                        note.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                      title={note.is_active ? "Live on site (Click to hide)" : "Draft (Click to make live)"}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${note.is_active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                      <span>{note.is_active ? "LIVE" : "DRAFT"}</span>
                    </button>
                  </div>

                  {/* Title & Topic */}
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                    {note.title}
                  </h3>
                  {note.topic && (
                    <p className="text-[11px] font-semibold text-blue-400 mt-1">
                      Chapter: {note.topic}
                    </p>
                  )}
                  {note.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {note.description}
                    </p>
                  )}
                </div>

                {/* Bottom Metadata & Actions */}
                <div className="pt-3.5 mt-3 border-t border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>📄 {note.page_count || 10} Pages • {note.file_size || "PDF"}</span>
                    <span>🌐 {note.language}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={note.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview PDF</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Note"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id, note.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit PDF Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <FileText className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingId ? "✏️ Edit PDF Note" : "➕ Publish New PDF Note"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* PDF Upload / Link Input Box */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    PDF File Source *
                  </span>
                  {uploading && <span className="text-amber-400 animate-pulse font-bold">Uploading to Storage...</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Direct File Upload */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400/30 hover:border-blue-400/60 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-slate-900/60">
                    <Upload className="h-5 w-5 text-blue-400 mb-1" />
                    <span className="font-bold text-slate-200">Upload PDF File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Click to choose .pdf from PC</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {/* Option B: Direct Link */}
                  <div className="flex flex-col justify-center space-y-1">
                    <label className="font-bold text-slate-300 flex items-center gap-1">
                      <LinkIcon className="h-3 w-3 text-slate-400" />
                      <span>Or Paste Direct PDF URL:</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (Google Drive, CDN, or Direct PDF link)"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {pdfUrl && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 text-emerald-300 text-[11px]">
                    <span className="truncate max-w-sm">✓ Attached: {pdfUrl}</span>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline shrink-0 ml-2">
                      Test Link ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Document Title */}
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                  Document Title (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Geometry 50 Golden Theorems & Formulas Capsule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Hindi Title (Optional) */}
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                  Hindi Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ज्यामिति के 50 महत्वपूर्ण सूत्र और नियम"
                  value={hindiTitle}
                  onChange={(e) => setHindiTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Exam & Subject Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    Target Examination *
                  </label>
                  <select
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {EXAMS_LIST.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    Subject Category *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {SUBJECTS_LIST.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter / Topic & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    Chapter / Topic Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Geometry, Number System, Modern History"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    Language of Content
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Bilingual">Bilingual (Hindi + English)</option>
                    <option value="English">English Medium Only</option>
                    <option value="Hindi">Hindi Medium Only</option>
                  </select>
                </div>
              </div>

              {/* File Size & Page Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    Page Count
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 18"
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                    File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.4 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-300 mb-1 uppercase tracking-wide text-[10px]">
                  Description / Key Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of theorems, formulas, or cheat sheets included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Options Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                  />
                  <span className="font-bold text-slate-200">100% Free for all aspirants</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-700 text-amber-500 focus:ring-0 bg-slate-800"
                  />
                  <span className="font-bold text-amber-300">⭐ Pin / Feature at Top</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-700 text-emerald-500 focus:ring-0 bg-slate-800"
                  />
                  <span className="font-bold text-emerald-400">🟢 Live immediately on site</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Publishing..." : editingId ? "Update Note" : "Publish PDF Note"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
