"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  Eye,
  ExternalLink,
  Save,
  X,
  Layers,
  GraduationCap,
  Clock,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChapterNote, SubjectWithChapters } from "@/lib/notes-data";

export default function AdminNotesPage() {
  const [subjects, setSubjects] = useState<SubjectWithChapters[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [subjectId, setSubjectId] = useState("physics");
  const [subjectName, setSubjectName] = useState("General Science - Physics");
  const [title, setTitle] = useState("");
  const [hindiTitle, setHindiTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [readTime, setReadTime] = useState("7 min read");
  const [subtopicsText, setSubtopicsText] = useState("");
  const [overview, setOverview] = useState("");
  const [keyPointsText, setKeyPointsText] = useState(""); // Label: Detail
  const [tableTitle, setTableTitle] = useState("");
  const [tableHeadersText, setTableHeadersText] = useState("");
  const [tableRowsText, setTableRowsText] = useState(""); // col1 | col2 | col3 per line
  const [tcsTrap, setTcsTrap] = useState("");
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqQuestionHi, setMcqQuestionHi] = useState("");
  const [mcqOptionA, setMcqOptionA] = useState("");
  const [mcqOptionB, setMcqOptionB] = useState("");
  const [mcqOptionC, setMcqOptionC] = useState("");
  const [mcqOptionD, setMcqOptionD] = useState("");
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0);
  const [mcqExplanation, setMcqExplanation] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  // Flatten all chapters for easy searching and display
  const allChapters = useMemo(() => {
    const list: ChapterNote[] = [];
    for (const sub of subjects) {
      for (const ch of sub.chapters) {
        list.push({ ...ch, subjectName: ch.subjectName || sub.name });
      }
    }
    return list;
  }, [subjects]);

  const filteredChapters = useMemo(() => {
    return allChapters.filter((ch) => {
      const matchSubject =
        selectedSubjectFilter === "all" ||
        ch.subjectId.toLowerCase() === selectedSubjectFilter.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSubject && matchSearch;
    });
  }, [allChapters, selectedSubjectFilter, searchQuery]);

  function handleOpenCreate() {
    setEditingId(null);
    setSubjectId("physics");
    setSubjectName("General Science - Physics");
    setTitle("");
    setHindiTitle("");
    setSlug("");
    setReadTime("6 min read");
    setSubtopicsText("");
    setOverview("");
    setKeyPointsText("");
    setTableTitle("");
    setTableHeadersText("");
    setTableRowsText("");
    setTcsTrap("");
    setMcqQuestion("");
    setMcqQuestionHi("");
    setMcqOptionA("");
    setMcqOptionB("");
    setMcqOptionC("");
    setMcqOptionD("");
    setMcqCorrectIndex(0);
    setMcqExplanation("");
    setIsActive(true);
    setIsModalOpen(true);
  }

  function handleOpenEdit(ch: ChapterNote) {
    setEditingId(ch.id);
    setSubjectId(ch.subjectId);
    setSubjectName(ch.subjectName || "Subject Note");
    setTitle(ch.title);
    setHindiTitle(ch.hindiTitle || "");
    setSlug(ch.slug);
    setReadTime(ch.readTime || "7 min read");
    setSubtopicsText((ch.subtopics || []).join(", "));
    setOverview(ch.overview || "");

    // Format key points
    if (ch.keyPoints && ch.keyPoints.length > 0) {
      setKeyPointsText(ch.keyPoints.map((kp) => `${kp.label}: ${kp.detail}`).join("\n"));
    } else {
      setKeyPointsText("");
    }

    // Format table
    if (ch.table) {
      setTableTitle(ch.table.title || "");
      setTableHeadersText((ch.table.headers || []).join(", "));
      setTableRowsText((ch.table.rows || []).map((r) => r.join(" | ")).join("\n"));
    } else {
      setTableTitle("");
      setTableHeadersText("");
      setTableRowsText("");
    }

    setTcsTrap(ch.tcsTrap || "");

    // Format MCQ
    if (ch.practiceMcq) {
      setMcqQuestion(ch.practiceMcq.question || "");
      setMcqQuestionHi(ch.practiceMcq.questionHi || "");
      setMcqOptionA(ch.practiceMcq.options[0] || "");
      setMcqOptionB(ch.practiceMcq.options[1] || "");
      setMcqOptionC(ch.practiceMcq.options[2] || "");
      setMcqOptionD(ch.practiceMcq.options[3] || "");
      setMcqCorrectIndex(ch.practiceMcq.correctIndex || 0);
      setMcqExplanation(ch.practiceMcq.explanation || "");
    } else {
      setMcqQuestion("");
      setMcqQuestionHi("");
      setMcqOptionA("");
      setMcqOptionB("");
      setMcqOptionC("");
      setMcqOptionD("");
      setMcqCorrectIndex(0);
      setMcqExplanation("");
    }

    setIsActive(ch.isActive ?? true);
    setIsModalOpen(true);
  }

  // Auto-generate slug from title
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and URL Slug are required!");
      return;
    }

    setSaving(true);

    // Parse subtopics
    const subtopics = subtopicsText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Parse key points
    const keyPoints = keyPointsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(":");
        if (parts.length > 1) {
          return { label: parts[0].trim(), detail: parts.slice(1).join(":").trim() };
        }
        return { label: "Key Point", detail: line };
      });

    // Parse table
    let table = null;
    if (tableTitle.trim() && tableHeadersText.trim()) {
      const headers = tableHeadersText.split(",").map((h) => h.trim()).filter(Boolean);
      const rows = tableRowsText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => r.split("|").map((cell) => cell.trim()));
      table = { title: tableTitle.trim(), headers, rows };
    }

    // Parse MCQ
    let practiceMcq = null;
    if (mcqQuestion.trim()) {
      practiceMcq = {
        question: mcqQuestion.trim(),
        questionHi: mcqQuestionHi.trim(),
        options: [mcqOptionA.trim(), mcqOptionB.trim(), mcqOptionC.trim(), mcqOptionD.trim()],
        correctIndex: Number(mcqCorrectIndex),
        explanation: mcqExplanation.trim(),
      };
    }

    const payload = {
      id: editingId,
      subjectId,
      subjectName,
      title: title.trim(),
      hindiTitle: hindiTitle.trim(),
      slug: slug.trim(),
      readTime: readTime.trim(),
      subtopics,
      overview: overview.trim(),
      keyPoints,
      table,
      tcsTrap: tcsTrap.trim(),
      practiceMcq,
      isActive,
    };

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save note");

      toast.success(editingId ? "Chapter note updated! 🚀" : "New chapter note published! 🎉");
      setIsModalOpen(false);
      loadNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(id: string, slugVal: string) {
    if (!confirm("Are you sure you want to delete this chapter note?")) return;

    try {
      const res = await fetch(`/api/notes?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slugVal)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Note deleted successfully.");
        loadNotes();
      } else {
        toast.error("Could not delete note.");
      }
    } catch {
      toast.error("Error deleting note.");
    }
  }

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300">
            <GraduationCap className="h-4 w-4" />
            <span>High-Yield Revision CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Subject Notes & Formula Sheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Manage comprehensive theory capsules, high-yield comparison tables, examiner TCS traps, and chapter-wise MCQs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/notes"
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview Live Site</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Chapter Note</span>
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-lg">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Subjects" },
            { id: "physics", label: "Physics" },
            { id: "chemistry", label: "Chemistry" },
            { id: "polity", label: "Indian Polity" },
            { id: "history", label: "History" },
            { id: "geography", label: "Geography" },
          ].map((sub) => {
            const isSelected = selectedSubjectFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectFilter(sub.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search chapters or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* CHAPTERS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Chapter Title & Hindi</th>
                <th className="py-3.5 px-4">Read Time</th>
                <th className="py-3.5 px-4">Key Points / MCQ</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredChapters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="font-bold">No chapter notes found.</p>
                    <p className="text-[11px] text-slate-500">Click &ldquo;Add Chapter Note&rdquo; above to create one.</p>
                  </td>
                </tr>
              ) : (
                filteredChapters.map((ch) => (
                  <tr key={ch.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-400 whitespace-nowrap">
                      <span className="rounded bg-blue-500/10 border border-blue-400/20 px-2 py-0.5 text-[10px] font-black">
                        {ch.subjectName.split(" ")[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-white line-clamp-1">{ch.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ch.hindiTitle || ch.slug}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {ch.readTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {ch.keyPoints?.length || 0} Points • {ch.practiceMcq ? "1 MCQ" : "No MCQ"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                        Active & Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(ch)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                          title="Edit Note"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(ch.id, ch.slug)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT NOTE MODAL                                     */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {editingId ? "Edit Subject Note" : "Create New Chapter Note"}
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in the high-yield theory, table, TCS trap, and practice MCQ for candidates.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNote} className="space-y-4">
              
              {/* Row 1: Subject Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubjectId(val);
                      if (val === "physics") setSubjectName("General Science - Physics");
                      if (val === "chemistry") setSubjectName("General Science - Chemistry");
                      if (val === "polity") setSubjectName("Indian Polity");
                      if (val === "history") setSubjectName("Indian History");
                      if (val === "geography") setSubjectName("Geography of India");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="physics">Physics (भौतिक विज्ञान)</option>
                    <option value="chemistry">Chemistry (रसायन विज्ञान)</option>
                    <option value="polity">Indian Polity (भारतीय राजव्यवस्था)</option>
                    <option value="history">Indian History (भारतीय इतिहास)</option>
                    <option value="geography">Geography (भारत का भूगोल)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 7 min read"
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Title & Hindi Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Chapter Title (English) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 1. Units & Dimensions"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Chapter Title (Hindi)</label>
                  <input
                    type="text"
                    value={hindiTitle}
                    onChange={(e) => setHindiTitle(e.target.value)}
                    placeholder="e.g. मात्रक एवं विमाएं"
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. physics-units-dimensions"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Subtopics */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subtopics (comma-separated pills)
                </label>
                <input
                  type="text"
                  value={subtopicsText}
                  onChange={(e) => setSubtopicsText(e.target.value)}
                  placeholder="SI Base Units, Derived Units, Important Measuring Instruments"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Overview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Exam Weightage & Importance Overview
                </label>
                <textarea
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="In SSC CGL and CHSL exams, 1 direct question is asked on SI units..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Key High-Yield Points */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Key Concept Points (Format: <code>Label: Detail</code> per line)
                </label>
                <textarea
                  rows={4}
                  value={keyPointsText}
                  onChange={(e) => setKeyPointsText(e.target.value)}
                  placeholder="Light Year: Unit of Distance (9.46 × 10¹⁵ meters), NOT time.&#10;Luminous Intensity: SI Unit Candela (cd)."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Comparison Table Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <span className="text-xs font-black uppercase text-amber-400">📊 High-Yield Comparison Table (Optional)</span>
                
                <input
                  type="text"
                  value={tableTitle}
                  onChange={(e) => setTableTitle(e.target.value)}
                  placeholder="Table Title (e.g. Top High-Yield Scientific Instruments Asked by TCS)"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />

                <input
                  type="text"
                  value={tableHeadersText}
                  onChange={(e) => setTableHeadersText(e.target.value)}
                  placeholder="Headers comma-separated (e.g. Instrument, Measures, Exam Frequency)"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />

                <textarea
                  rows={3}
                  value={tableRowsText}
                  onChange={(e) => setTableRowsText(e.target.value)}
                  placeholder="Rows format: col1 | col2 | col3 (one row per line)&#10;Pyrometer | Very High Temperatures | Repeated 6+ times&#10;Hygrometer | Atmospheric Humidity | Repeated 8+ times"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* TCS Trap Alert */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <label className="block text-xs font-black uppercase text-amber-400">
                  ⚠️ TCS Examiner Trap Warning (बार-बार गलत होने वाला पॉइंट)
                </label>
                <textarea
                  rows={2}
                  value={tcsTrap}
                  onChange={(e) => setTcsTrap(e.target.value)}
                  placeholder="TCS Trap Alert: Students confuse 'Hygrometer' (measures Humidity) with 'Hydrometer' (measures Liquid Density)..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Concept Check MCQ */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                <span className="text-xs font-black uppercase text-blue-400">⚡ Concept Verification MCQ</span>
                
                <input
                  type="text"
                  value={mcqQuestion}
                  onChange={(e) => setMcqQuestion(e.target.value)}
                  placeholder="Question in English"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                />

                <input
                  type="text"
                  value={mcqQuestionHi}
                  onChange={(e) => setMcqQuestionHi(e.target.value)}
                  placeholder="Question in Hindi"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={mcqOptionA}
                    onChange={(e) => setMcqOptionA(e.target.value)}
                    placeholder="Option A"
                    className="rounded-lg border border-white/10 bg-slate-800 p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={mcqOptionB}
                    onChange={(e) => setMcqOptionB(e.target.value)}
                    placeholder="Option B"
                    className="rounded-lg border border-white/10 bg-slate-800 p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={mcqOptionC}
                    onChange={(e) => setMcqOptionC(e.target.value)}
                    placeholder="Option C"
                    className="rounded-lg border border-white/10 bg-slate-800 p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={mcqOptionD}
                    onChange={(e) => setMcqOptionD(e.target.value)}
                    placeholder="Option D"
                    className="rounded-lg border border-white/10 bg-slate-800 p-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-300">Correct Option:</label>
                  <select
                    value={mcqCorrectIndex}
                    onChange={(e) => setMcqCorrectIndex(Number(e.target.value))}
                    className="rounded-lg border border-white/10 bg-slate-800 p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  value={mcqExplanation}
                  onChange={(e) => setMcqExplanation(e.target.value)}
                  placeholder="Detailed solution and explanation..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 p-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving to Supabase..." : "Save Chapter Note"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
