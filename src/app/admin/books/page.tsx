"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Download,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import type { BookItem, SampleChapter } from "@/lib/books-types";

const SUBJECT_OPTIONS = [
  "Quantitative Aptitude",
  "English Language",
  "Reasoning Ability",
  "General Awareness",
  "PYQ Compilations",
] as const;

const EXAM_OPTIONS = [
  "SSC CGL",
  "SSC CHSL",
  "SSC CPO",
  "SSC MTS",
  "SSC GD",
  "SSC Steno",
  "State Exams",
];

const COVER_COLORS = [
  { label: "Ocean Blue", value: "from-blue-600 to-indigo-800" },
  { label: "Midnight Dark", value: "from-gray-900 to-slate-950" },
  { label: "Emerald Green", value: "from-emerald-700 to-teal-900" },
  { label: "Royal Purple", value: "from-purple-700 to-indigo-900" },
  { label: "Amber Gold", value: "from-amber-600 to-yellow-700" },
  { label: "Crimson Red", value: "from-rose-700 to-red-900" },
  { label: "Cyan Teal", value: "from-cyan-700 to-blue-900" },
];

const DEFAULT_FORM: Partial<BookItem> = {
  title: "",
  hindiTitle: "",
  author: "SSCZone Editorial Board",
  publisher: "SSCZone Publications",
  edition: "2026 TCS Pattern Edition",
  subject: "Quantitative Aptitude",
  exams: ["SSC CGL", "SSC CHSL", "SSC CPO"],
  language: "Bilingual",
  pages: 650,
  rating: 4.9,
  reviewCount: 1200,
  badge: "Topper's #1 Choice",
  coverColor: "from-blue-600 to-indigo-800",
  description: "",
  topperNote: "",
  freePdfAvailable: true,
  pdfUrl: "",
  buyUrl: "",
  practiceTopicSlug: "",
  is_active: true,
  sort_order: 1,
  sampleChapters: [
    { title: "Chapter 1: Theory Overview & Key Rules", pages: "1-40", highYield: true },
    { title: "Chapter 2: TCS Practice Questions & Solutions", pages: "41-90", highYield: true },
  ],
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BookItem>>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Load books from API
  async function loadBooks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/books");
      const data = await res.json();
      if (data.success && Array.isArray(data.books)) {
        setBooks(data.books);
      }
    } catch (e: any) {
      toast.error("Failed to load books: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSubject = selectedSubject === "All" || b.subject === selectedSubject;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.hindiTitle?.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q);
      return matchSubject && matchSearch;
    });
  }, [books, selectedSubject, search]);

  // Open Create Modal
  function handleOpenCreate() {
    setEditingBookId(null);
    setFormData({
      ...DEFAULT_FORM,
      sort_order: books.length + 1,
    });
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(book: BookItem) {
    setEditingBookId(book.id);
    setFormData({
      ...book,
      sampleChapters: book.sampleChapters || [],
    });
    setModalOpen(true);
  }

  // Handle Save
  async function handleSaveBook(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Book title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingBookId ? "Book updated & synced to Supabase!" : "New book created & synced to Supabase!");
        setModalOpen(false);
        loadBooks();
      } else {
        toast.error(data.error || "Failed to save book");
      }
    } catch (e: any) {
      toast.error("Error saving book: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  // Handle Delete
  async function handleDeleteBook(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/books?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Book deleted successfully");
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } else {
        toast.error(data.error || "Failed to delete book");
      }
    } catch (e: any) {
      toast.error("Error deleting book: " + e.message);
    }
  }

  // Toggle active status
  async function handleToggleActive(book: BookItem) {
    const updatedStatus = !book.is_active;
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...book, is_active: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Book is now ${updatedStatus ? "Active (Live)" : "Draft (Hidden)"}`);
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, is_active: updatedStatus } : b))
        );
      }
    } catch (e: any) {
      toast.error("Failed to update status");
    }
  }

  // Sample chapters helpers
  function addSampleChapter() {
    setFormData((prev) => ({
      ...prev,
      sampleChapters: [
        ...(prev.sampleChapters || []),
        { title: `Chapter ${(prev.sampleChapters?.length || 0) + 1}`, pages: "1-30", highYield: true },
      ],
    }));
  }

  function updateSampleChapter(index: number, field: keyof SampleChapter, value: any) {
    setFormData((prev) => {
      const copy = [...(prev.sampleChapters || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, sampleChapters: copy };
    });
  }

  function removeSampleChapter(index: number) {
    setFormData((prev) => ({
      ...prev,
      sampleChapters: (prev.sampleChapters || []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Database & Supabase Synced</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-500" />
            <span>Topper Books Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Control all topper recommended books shown on <code className="text-blue-300 font-mono">/books</code> with bilingual titles, sample chapters, cover styling, and direct PDF downloads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/books"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Books</span>
          <p className="text-2xl font-black text-white mt-1">{books.length}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active Live</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {books.filter((b) => b.is_active !== false).length}
          </p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Free PDFs</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {books.filter((b) => b.freePdfAvailable).length}
          </p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Sample Chapters</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {books.reduce((acc, b) => acc + (b.sampleChapters?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by book title, author, publisher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={loadBooks}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all flex items-center gap-1.5 shrink-0"
            title="Refresh from Server"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSubject("All")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedSubject === "All"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            All Subjects ({books.length})
          </button>
          {SUBJECT_OPTIONS.map((sub) => {
            const count = books.filter((b) => b.subject === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSubject === sub
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Books Table / Card List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading Topper Books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Books Found</h3>
          <p className="text-xs text-slate-500">
            {search ? "No book matches your search query." : "No books added in this subject yet."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Book</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-slate-800/80 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                book.is_active !== false
                  ? "border-slate-700 hover:border-slate-600"
                  : "border-rose-900/40 opacity-70 bg-slate-900/40"
              }`}
            >
              <div>
                {/* Book Header Meta */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                      {book.subject}
                    </span>
                    {book.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{book.badge}</span>
                      </span>
                    )}
                  </div>

                  <span
                    onClick={() => handleToggleActive(book)}
                    className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                      book.is_active !== false
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                    title="Click to toggle status"
                  >
                    {book.is_active !== false ? "● Live" : "○ Draft"}
                  </span>
                </div>

                {/* Color preview badge + Title */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-16 rounded-lg bg-gradient-to-br ${book.coverColor} shrink-0 shadow-md flex items-center justify-center p-1 text-center border border-white/10`}
                  >
                    <BookOpen className="w-5 h-5 text-white/80" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    {book.hindiTitle && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{book.hindiTitle}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      By {book.author} • {book.publisher}
                    </p>
                  </div>
                </div>

                {/* Specs row */}
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>📄 {book.pages} Pages</span>
                  <span>⭐ {book.rating} ({book.reviewCount})</span>
                  <span className={book.freePdfAvailable ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {book.freePdfAvailable ? "Free PDF" : "Physical Only"}
                  </span>
                </div>

                {/* Sample Chapters Count */}
                {book.sampleChapters && book.sampleChapters.length > 0 && (
                  <div className="mt-2 text-[10px] text-blue-400 font-semibold bg-blue-950/40 border border-blue-900/60 rounded-lg px-2.5 py-1">
                    📚 {book.sampleChapters.length} Sample Chapters Available for Preview
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(book)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Book</span>
                </button>

                <button
                  onClick={() => handleDeleteBook(book.id, book.title)}
                  className="p-1.5 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:text-white transition-all cursor-pointer"
                  title="Delete Book"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          ADD / EDIT BOOK MODAL
         ════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !saving && setModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black text-white">
                  {editingBookId ? "Edit Topper Book" : "Add New Topper Book"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveBook} className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
              {/* Title & Hindi Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Book Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Black Book of English Vocabulary"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hindi Title (Optional)</label>
                  <input
                    type="text"
                    value={formData.hindiTitle || ""}
                    onChange={(e) => setFormData({ ...formData, hindiTitle: e.target.value })}
                    placeholder="e.g. ब्लैक बुक ऑफ इंग्लिश वोकैबुलरी"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Author, Publisher, Edition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author || ""}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Nikhil Gupta"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher || ""}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="e.g. Gupta Publications"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Edition</label>
                  <input
                    type="text"
                    value={formData.edition || ""}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                    placeholder="e.g. 2026 TCS Edition"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Subject & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    value={formData.subject || "Quantitative Aptitude"}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Language Medium</label>
                  <select
                    value={formData.language || "Bilingual"}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Bilingual">Bilingual (द्विभाषी)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              {/* Target Exams Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Exams</label>
                <div className="flex flex-wrap gap-2">
                  {EXAM_OPTIONS.map((exam) => {
                    const isChecked = (formData.exams || []).includes(exam);
                    return (
                      <button
                        type="button"
                        key={exam}
                        onClick={() => {
                          const current = formData.exams || [];
                          if (isChecked) {
                            setFormData({ ...formData, exams: current.filter((x) => x !== exam) });
                          } else {
                            setFormData({ ...formData, exams: [...current, exam] });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                        }`}
                      >
                        {isChecked ? "✓ " : "+ "}{exam}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pages, Rating, Reviews, Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pages</label>
                  <input
                    type="number"
                    value={formData.pages || 500}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rating (out of 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating || 4.9}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.9 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Review Count</label>
                  <input
                    type="number"
                    value={formData.reviewCount || 1000}
                    onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Highlight Badge</label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Topper's #1 Choice"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Gradient Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Cover Color Style</label>
                <div className="flex flex-wrap gap-2">
                  {COVER_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setFormData({ ...formData, coverColor: c.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.coverColor === c.value
                          ? "border-white bg-slate-800 text-white shadow-xs"
                          : "border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${c.value}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Topper Note */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of book contents, question count, and methodology..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Topper Study Recommendation Note</label>
                <input
                  type="text"
                  value={formData.topperNote || ""}
                  onChange={(e) => setFormData({ ...formData, topperNote: e.target.value })}
                  placeholder="e.g. Must solve 3 times before exam for 50/50 score."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Sample Chapters Manager */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sample Chapters ({formData.sampleChapters?.length || 0})</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSampleChapter}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Chapter</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.sampleChapters || []).map((ch, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700">
                      <input
                        type="text"
                        value={ch.title}
                        onChange={(e) => updateSampleChapter(idx, "title", e.target.value)}
                        placeholder="Chapter Title"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={ch.pages}
                        onChange={(e) => updateSampleChapter(idx, "pages", e.target.value)}
                        placeholder="e.g. 1-45"
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ch.highYield !== false}
                          onChange={(e) => updateSampleChapter(idx, "highYield", e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>High Yield</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSampleChapter(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF Download link & Buy Online link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Direct PDF URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.pdfUrl || ""}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Buy Book Online Link (Optional Amazon/Flipkart)</label>
                  <input
                    type="text"
                    value={formData.buyUrl || ""}
                    onChange={(e) => setFormData({ ...formData, buyUrl: e.target.value })}
                    placeholder="https://amazon.in/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status and Sort Order */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.freePdfAvailable ?? true}
                    onChange={(e) => setFormData({ ...formData, freePdfAvailable: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Free PDF Sample Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Active & Live on /books</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-900/40 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingBookId ? "Save Changes" : "Create Book"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
