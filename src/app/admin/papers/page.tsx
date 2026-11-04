"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  FileText, 
  ExternalLink, 
  Upload, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Download
} from "lucide-react";
import { getPaperPdfUrl, uploadPaperPdf, isPaperDownloadAllowed, setPaperDownloadAllowed } from "@/lib/paper-pdf-store";

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [examId, setExamId] = useState(0);
  const [year, setYear] = useState("2025");
  const [totalQ, setTotalQ] = useState("100");
  const [duration, setDuration] = useState("60");
  const [pdfUrl, setPdfUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [allowDownload, setAllowDownload] = useState(true);

  useEffect(() => { 
    // Instant cache-load for high speed Admin panel rendering (0ms lag)
    try {
      const cached = sessionStorage.getItem("ssczone_admin_papers_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.papers) && parsed.papers.length > 0) {
          setPapers(parsed.papers);
          if (Array.isArray(parsed.exams)) setExams(parsed.exams);
          setLoading(false);
        }
      }
    } catch {
      // Ignore cache parse error
    }

    loadData(); 
  }, []);

  async function loadData() {
    try {
      const [papersRes, examsRes, settingsRes] = await Promise.all([
        supabase
          .from("previous_papers")
          .select("*, exams(title), paper_questions(count)")
          .order("year", { ascending: false }),
        supabase.from("exams").select("id, title"),
        fetch(`/api/papers/settings?t=${Date.now()}`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({}))
      ]);

      if (papersRes.error) {
        toast.error("Failed to load papers: " + papersRes.error.message);
      } else {
        const enriched = (papersRes.data ?? []).map((p: any) => {
          const setting = settingsRes?.[String(p.id)];
          const allowed = setting !== undefined 
            ? Boolean(setting.allow_download) 
            : (p.test_type !== "mock" && p.allow_download !== false);
          return {
            ...p,
            allow_download: allowed,
            test_type: allowed ? "pyq" : "mock"
          };
        });

        setPapers(enriched);
        if (examsRes.data) {
          setExams(examsRes.data);
        }

        // Cache for ultra-fast instant load next time
        try {
          sessionStorage.setItem("ssczone_admin_papers_cache", JSON.stringify({
            papers: enriched,
            exams: examsRes.data ?? []
          }));
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching papers");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleDownload(paper: any) {
    const current = isPaperDownloadAllowed(paper);
    const next = !current;
    
    // Update local state immediately for instant feedback
    setPapers((prev) => {
      const updated = prev.map((p) => (p.id === paper.id ? { ...p, allow_download: next, test_type: next ? "pyq" : "mock" } : p));
      try {
        sessionStorage.setItem("ssczone_admin_papers_cache", JSON.stringify({ papers: updated, exams }));
      } catch {}
      return updated;
    });

    const ok = await setPaperDownloadAllowed(paper.id, next);
    if (ok) {
      if (next) {
        toast.success(`Download enabled for candidates on "${paper.title}"`);
      } else {
        toast.error(`Download disabled for candidates on "${paper.title}"`);
      }
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Sirf PDF files (.pdf) upload ho sakti hain");
      return;
    }

    setUploadingPdf(true);
    const toastId = toast.loading("Uploading clean PDF to cloud storage...");

    const { url, error } = await uploadPaperPdf(file);
    setUploadingPdf(false);

    if (error) {
      toast.error("Upload error: " + error, { id: toastId });
    } else if (url) {
      setPdfUrl(url);
      toast.success("Clean PDF uploaded successfully!", { id: toastId });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examId) { toast.error("Please select an exam target"); return; }
    if (!title.trim()) { toast.error("Paper title is required"); return; }

    setSaving(true);
    
    // Core payload compatible with existing database schema
    const basePayload: any = {
      title: title.trim(),
      exam_id: examId,
      year: parseInt(year) || 2025,
      total_questions: parseInt(totalQ) || 100,
      duration_minutes: parseInt(duration) || 60,
    };

    // If pdf_url and allow_download are provided, attempt to save them
    const fullPayload: any = {
      ...basePayload,
      allow_download: allowDownload,
      ...(pdfUrl.trim() ? { pdf_url: pdfUrl.trim() } : {})
    };

    try {
      const res = await fetch("/api/admin/papers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: title.trim(),
          exam_id: examId,
          year: parseInt(year) || 2025,
          total_questions: parseInt(totalQ) || 100,
          duration_minutes: parseInt(duration) || 60,
          pdf_url: pdfUrl.trim() || null,
          allow_download: allowDownload
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save paper");

      const savedId = editingId || json.paper?.id;
      if (savedId) {
        await setPaperDownloadAllowed(savedId, allowDownload);
      }

      toast.success(editingId ? "PYQ Paper updated successfully!" : "New PYQ Paper created successfully!");
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save paper: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setYear("2025");
    setTotalQ("100");
    setDuration("60");
    setPdfUrl("");
    setExamId(0);
    setAllowDownload(true);
    setEditingId(null);
  }

  function handleEdit(p: any) {
    setTitle(p.title);
    setExamId(p.exam_id);
    setYear(p.year.toString());
    setTotalQ(p.total_questions.toString());
    setDuration(p.duration_minutes.toString());
    setPdfUrl(p.pdf_url || getPaperPdfUrl(p) || "");
    setAllowDownload(isPaperDownloadAllowed(p));
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleDelete(id: number, paperTitle: string) {
    if (!confirm(`Are you sure you want to delete paper "${paperTitle}" and its questions?`)) return;
    const { error } = await supabase.from("previous_papers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Paper deleted!");
    loadData();
  }

  // Download all questions of a paper as a clean formatted .txt file
  async function handleDownloadPaperTxt(paper: any) {
    const toastId = toast.loading(`Preparing questions TXT for ${paper.title}...`);
    try {
      const { data, error } = await supabase
        .from("paper_questions")
        .select("*")
        .eq("paper_id", paper.id)
        .order("question_number", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No questions found in this paper to download!", { id: toastId });
        return;
      }

      let content = `================================================================================\n`;
      content += `${(paper.title || "SSC ZONE PYQ PAPER").toUpperCase()}\n`;
      content += `Exam: ${paper.exams?.title || "SSC Examination"} | Year: ${paper.year || 2025}\n`;
      content += `Total Questions: ${data.length} | Duration: ${paper.duration_minutes || 60} Minutes\n`;
      content += `Extracted from Official Answer Key via SSC ZONE (www.ssczone.in)\n`;
      content += `Downloaded on: ${new Date().toLocaleString()}\n`;
      content += `================================================================================\n\n`;

      data.forEach((q: any, idx: number) => {
        const qNo = q.question_number || idx + 1;
        content += `Q${qNo}. ${q.question_text}\n`;
        content += `A) ${q.option_a}\n`;
        content += `B) ${q.option_b}\n`;
        content += `C) ${q.option_c}\n`;
        content += `D) ${q.option_d}\n`;
        content += `Correct Answer: Option ${q.correct_answer}\n`;
        if (q.explanation && q.explanation.trim()) {
          content += `Explanation: ${q.explanation.trim()}\n`;
        }
        content += `--------------------------------------------------------------------------------\n\n`;
      });

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = (paper.title || "paper_questions").toLowerCase().replace(/[^a-z0-9]+/g, "_");
      a.href = url;
      a.download = `${safeTitle}_extracted.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Questions .txt downloaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error("Failed to download questions: " + err.message, { id: toastId });
    }
  }

  // Filtered papers
  const filtered = useMemo(() => {
    return papers.filter((p) => {
      const matchExam = filterExam === 0 || p.exam_id === filterExam;
      const matchSearch =
        searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.year).includes(searchTerm) ||
        (p.exams?.title && p.exams.title.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchExam && matchSearch;
    });
  }, [papers, filterExam, searchTerm]);

  // Group papers by year
  const byYear = useMemo(() => {
    const acc: Record<string, any[]> = {};
    filtered.forEach((p) => {
      const y = p.year?.toString() || "Unknown";
      if (!acc[y]) acc[y] = [];
      acc[y].push(p);
    });
    return acc;
  }, [filtered]);

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  // High level metrics
  const totalQuestionsSum = papers.reduce((acc, p) => acc + (p.paper_questions?.[0]?.count ?? 0), 0);
  const totalPdfsCount = papers.filter((p) => !!getPaperPdfUrl(p)).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
              <Sparkles className="h-3 w-3 text-amber-300" />
              SSC Zone PYQ Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PYQ Shift Papers Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Publish authentic previous year shift papers, attach downloadable clean PDFs with answer keys, and manage online CBT mock tests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add New PYQ Paper</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>Total Shift Papers</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{papers.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {exams.length} SSC Exams</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span>Questions In Database</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalQuestionsSum}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready for online mock CBT</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FileText className="h-4 w-4 text-purple-600" />
            <span>PDFs Available</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalPdfsCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Clean SSC Zone branded</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
            <span>Online Portal Status</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">Live</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Visible on /papers route</p>
        </div>
      </div>

      {/* Add / Edit Form Modal / Card */}
      {showForm && (
        <div className="rounded-3xl border-2 border-blue-500/30 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editingId ? "✏️ Edit PYQ Paper" : "➕ Create New PYQ Shift Paper"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set paper exam category, year, duration, and attach the official clean PDF.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Paper Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSC CGL 2025 Tier-I (Held On 12 Sept 2025 Shift 1)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Target Exam *
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                  required
                >
                  <option value={0}>Select Target SSC Exam</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Exam Year *
                </label>
                <input
                  type="number"
                  placeholder="2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                  required
                  min="2015"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Total Questions *
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={totalQ}
                  onChange={(e) => setTotalQ(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                  required
                  min="1"
                />
              </div>

              {/* PDF URL / File Upload Section */}
              <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase text-slate-700">
                      Official Clean PDF Download (Optional)
                    </span>
                  </div>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      <span>Preview Linked PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      type="text"
                      placeholder="Paste PDF URL or leave as default..."
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Example: <code>/papers/ssc-cgl-2025-12-sept-shift-1.pdf</code>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors">
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>{uploadingPdf ? "Uploading..." : "📄 Upload New PDF (No Content Change)"}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingPdf}
                      />
                    </label>

                    {editingId && (
                      <Link
                        href={`/admin/papers/${editingId}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3.5 py-2.5 text-xs font-bold text-blue-800 transition-colors shadow-2xs"
                        title="Open 4-in-1 Bulk Importer to re-extract questions from PDF (With Content Change)"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Re-extract Questions (Content Change)</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Big Interactive Toggle Switch for Download Link Show/Hide */}
                <div className="mt-4 rounded-2xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        Website par Download PDF button show karna hai?
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        allowDownload ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {allowDownload ? "✓ Abhi DIKHEGA (Active)" : "✕ Abhi CHHIPA RAHEGA (Hidden)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-md">
                      {allowDownload
                        ? "Candidates ko website (/papers) par 'Download PDF' button dikhega."
                        : "Website (/papers) par 'Download PDF' button CHHIPA RAHEGA (sirf 'Attempt CBT Test' dikhega)."}
                    </p>
                  </div>

                  {/* Big Toggle Switch Button */}
                  <button
                    type="button"
                    onClick={() => setAllowDownload(!allowDownload)}
                    className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      allowDownload ? "bg-emerald-600 shadow-md shadow-emerald-500/20" : "bg-slate-300"
                    }`}
                    role="switch"
                    aria-checked={allowDownload}
                  >
                    <span
                      className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs font-black ${
                        allowDownload ? "translate-x-9 text-emerald-700" : "translate-x-0 text-slate-400"
                      }`}
                    >
                      {allowDownload ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving || uploadingPdf}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : editingId ? "Update Paper" : "Save PYQ Paper"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search PYQ paper by shift, exam, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterExam(0)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterExam === 0
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Exams
          </button>
          {exams.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setFilterExam(ex.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterExam === ex.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Grid by Year */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading PYQ shift papers...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">No previous papers found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Add New PYQ Paper" to publish your first shift paper.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map((yr) => {
            const yrPapers = byYear[yr];
            return (
              <div key={yr} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                    <Calendar className="h-3 w-3" />
                    Year {yr}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({yrPapers.length} shift paper{yrPapers.length > 1 ? "s" : ""})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yrPapers.map((p) => {
                    const qCount = p.paper_questions?.[0]?.count ?? 0;
                    const paperPdf = getPaperPdfUrl(p);
                    const pct = Math.min(100, Math.round((qCount / (p.total_questions || 100)) * 100));

                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                                {p.exams?.title || "SSC Examination"}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 leading-snug">
                                {p.title}
                              </h3>
                            </div>
                            <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                              {p.year}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                              {p.total_questions} Questions ({qCount} imported)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {p.duration_minutes} Mins
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <span>Questions Population</span>
                              <span className="font-bold text-slate-600">{pct}% Ready</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct === 100 ? "bg-emerald-500" : "bg-blue-600"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {/* PDF Status & Website PDF Show ON/OFF Toggle */}
                          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              {paperPdf ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  PDF Uploaded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                                  No PDF File
                                </span>
                              )}
                            </div>

                            {/* Prominent ON / OFF Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleDownload(p)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs border ${
                                isPaperDownloadAllowed(p)
                                  ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                                  : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                              }`}
                              title="Click to turn Candidate PDF Show/Download ON or OFF on website"
                            >
                              <span>PDF Show on Website:</span>
                              <span className={`px-1.5 py-0.5 rounded font-black text-[11px] ${
                                isPaperDownloadAllowed(p) ? "bg-white text-emerald-700" : "bg-rose-600 text-white"
                              }`}>
                                {isPaperDownloadAllowed(p) ? "ON (दिखेगा)" : "OFF (छिपेगा)"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/admin/papers/${p.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                              <span>Bulk Importer & Qs</span>
                            </Link>

                            {qCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleDownloadPaperTxt(p)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
                                title="Download all questions as clean formatted TXT"
                              >
                                <Download className="h-3.5 w-3.5 text-emerald-700" />
                                <span>TXT</span>
                              </button>
                            )}

                            {paperPdf && (
                              <a
                                href={paperPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5 text-slate-500" />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(p)}
                              className="rounded-lg p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Paper"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.title)}
                              className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Paper"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
