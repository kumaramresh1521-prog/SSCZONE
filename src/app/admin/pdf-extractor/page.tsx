"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet,
  Link2,
  Upload,
  FileCode,
  Sparkles,
  Download,
  Database,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Save,
  Printer,
  Layers,
  ArrowRight
} from "lucide-react";

interface ExtractedQuestion {
  question_number: number;
  section: string;
  question_text: string;
  image_url: string;
  option_a: string;
  option_a_image_url: string;
  option_b: string;
  option_b_image_url: string;
  option_c: string;
  option_c_image_url: string;
  option_d: string;
  option_d_image_url: string;
  correct_answer: "A" | "B" | "C" | "D";
  candidate_chosen?: "A" | "B" | "C" | "D" | null;
  candidate_status?: "correct" | "wrong" | "unattempted";
  challenge_url?: string;
  explanation?: string;
}

interface ExtractionMetadata {
  candidateName: string;
  rollNumber: string;
  examName: string;
  testDate: string;
  testTime: string;
  venue: string;
  vendor: string;
  totalQuestions: number;
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  accuracy: string;
}

export default function AdminPdfExtractorPage() {
  const [activeTab, setActiveTab] = useState<"url" | "file" | "html">("url");
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string>("");
  const [rawHtmlCode, setRawHtmlCode] = useState<string>("");
  const [embedImages, setEmbedImages] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");

  // Extracted Result State
  const [metadata, setMetadata] = useState<ExtractionMetadata | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingQNum, setEditingQNum] = useState<number | null>(null);

  // Save to DB Modal State
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [paperTitle, setPaperTitle] = useState<string>("");
  const [examId, setExamId] = useState<number>(1);
  const [paperYear, setPaperYear] = useState<number>(new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [savingToDb, setSavingToDb] = useState<boolean>(false);

  // Handle extraction
  async function handleExtractQuestions() {
    if (activeTab === "url" && !answerKeyUrl.trim()) {
      toast.error("Please enter an official Answer Key URL.");
      return;
    }
    if (activeTab !== "url" && !rawHtmlCode.trim()) {
      toast.error("Please provide or upload the response sheet HTML code.");
      return;
    }

    setLoading(true);
    setLoadingStatus("Connecting to Answer Key server & fetching 4 Parts...");
    setMetadata(null);
    setQuestions([]);

    try {
      const res = await fetch("/api/admin/extract-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: activeTab === "url" ? answerKeyUrl.trim() : undefined,
          htmlContent: activeTab !== "url" ? rawHtmlCode.trim() : undefined,
          embedImages
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to extract questions.");
      }

      setMetadata(data.metadata);
      setQuestions(data.questions);

      // Default paper title based on extracted candidate exam
      const datePart = data.metadata.testDate || "Official";
      const shiftPart = data.metadata.testTime ? ` (${data.metadata.testTime})` : "";
      setPaperTitle(`${data.metadata.examName || "SSC CGL"} - ${datePart}${shiftPart}`);

      toast.success(`Successfully extracted ${data.questions.length} questions across 4 sections! 🎉`);
    } catch (err: any) {
      toast.error(err.message || "Extraction error occurred.");
    } finally {
      setLoading(false);
      setLoadingStatus("");
    }
  }

  // Handle direct file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || "";
      setRawHtmlCode(content);
      toast.success(`Loaded "${file.name}" (${(content.length / 1024).toFixed(1)} KB). Ready to extract!`);
    };
    reader.readAsText(file);
  }

  // Handle inline question edits
  function handleUpdateQuestion(qNum: number, field: keyof ExtractedQuestion, value: any) {
    setQuestions(prev => prev.map(q => q.question_number === qNum ? { ...q, [field]: value } : q));
  }

  // Export JSON
  function handleExportJson() {
    if (questions.length === 0) return;
    const blob = new Blob([JSON.stringify({ metadata, questions }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ssc-extracted-questions-${metadata?.rollNumber || "paper"}.json`;
    link.click();
    toast.success("Downloaded questions JSON!");
  }

  // Export CSV
  function handleExportCsv() {
    if (questions.length === 0) return;
    const headers = ["Q_Number", "Section", "Question_Text", "Option_A", "Option_B", "Option_C", "Option_D", "Correct_Answer", "Candidate_Answer", "Status"];
    const rows = questions.map(q => [
      q.question_number,
      `"${q.section.replace(/"/g, '""')}"`,
      `"${(q.question_text || q.image_url || "").replace(/"/g, '""')}"`,
      `"${(q.option_a || q.option_a_image_url || "").replace(/"/g, '""')}"`,
      `"${(q.option_b || q.option_b_image_url || "").replace(/"/g, '""')}"`,
      `"${(q.option_c || q.option_c_image_url || "").replace(/"/g, '""')}"`,
      `"${(q.option_d || q.option_d_image_url || "").replace(/"/g, '""')}"`,
      q.correct_answer,
      q.candidate_chosen || "Left",
      q.candidate_status || "unattempted"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ssc-questions-${metadata?.rollNumber || "key"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded CSV!");
  }

  // Save to Supabase Database
  async function handleSaveToDatabase() {
    if (!paperTitle.trim()) {
      toast.error("Please enter a title for the paper.");
      return;
    }

    setSavingToDb(true);
    try {
      // 1. Create previous_paper entry
      const createRes = await fetch("/api/admin/papers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: paperTitle.trim(),
          exam_id: examId,
          year: paperYear,
          duration_minutes: durationMinutes,
          total_questions: questions.length,
          is_active: true
        })
      });

      const paperData = await createRes.json();
      if (!createRes.ok || paperData.error) {
        throw new Error(paperData.error || "Failed to create paper record.");
      }

      const paperId = paperData.id || paperData.data?.id;

      // 2. Format questions for paper_questions bulk insert
      const formattedQuestions = questions.map((q, idx) => ({
        paper_id: paperId,
        question_number: q.question_number || idx + 1,
        section: q.section,
        question_text: q.question_text || `Question ${q.question_number}`,
        option_a: q.option_a || "Option A",
        option_b: q.option_b || "Option B",
        option_c: q.option_c || "Option C",
        option_d: q.option_d || "Option D",
        correct_answer: q.correct_answer,
        image_url: q.image_url || null,
        option_a_image_url: q.option_a_image_url || null,
        option_b_image_url: q.option_b_image_url || null,
        option_c_image_url: q.option_c_image_url || null,
        option_d_image_url: q.option_d_image_url || null,
        explanation: q.explanation || null
      }));

      // 3. Batch insert questions
      const insRes = await fetch("/api/admin/paper-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          paper_id: paperId,
          overwrite: true,
          questions: formattedQuestions
        })
      });

      const insData = await insRes.json();
      if (!insRes.ok || insData.error) {
        throw new Error(insData.error || "Failed to insert questions into paper.");
      }

      toast.success(`Successfully saved "${paperTitle}" with ${questions.length} questions to database! 🎉`);
      setShowSaveModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save paper to database.");
    } finally {
      setSavingToDb(false);
    }
  }

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchSec = selectedSection === "all" || q.section === selectedSection;
    const matchSearch = !searchQuery.trim() ||
      q.question_number.toString() === searchQuery.trim() ||
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSec && matchSearch;
  });

  const uniqueSections = Array.from(new Set(questions.map(q => q.section)));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              SSC Answer Key &amp; PDF Question Extractor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Extract all 100 questions with official answers, diagrams/images, equations &amp; sectional breakdowns from live CBExams / DigiALM URLs or offline HTML files.
          </p>
        </div>

        <Link
          href="/toolkit/rank-predictor"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <span>Open Public Rank Predictor</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── EXTRACTION INPUT CARD ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Source Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "url"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Method 1: Live Answer Key URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "file"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Method 2: Upload Saved HTML File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "html"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Method 3: Paste Raw HTML Code</span>
          </button>
        </div>

        {/* Tab 1: URL Input */}
        {activeTab === "url" && (
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide block">
              Official SSC Answer Key URL (CBExams or DigiALM link):
            </label>
            <input
              type="url"
              value={answerKeyUrl}
              onChange={(e) => setAnswerKeyUrl(e.target.value)}
              placeholder="e.g. https://sscexams.cbexams.com/CGLE2026jsdgheQchallengemshetsOct27/ViewCandResponse.aspx?enckey=..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-4 text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === "file" && (
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide block">
              Select Saved Response Sheet File (.html / .htm):
            </label>
            <div className="p-6 rounded-2xl bg-blue-50/50 border-2 border-dashed border-blue-300 text-center">
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-2">
                Tip: In browser, press <strong>Ctrl + S</strong> on the official answer key page to save it as HTML.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Paste HTML */}
        {activeTab === "html" && (
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide block">
              Paste Complete HTML Source Code (Ctrl+U &rarr; Ctrl+A &rarr; Ctrl+C):
            </label>
            <textarea
              rows={5}
              value={rawHtmlCode}
              onChange={(e) => setRawHtmlCode(e.target.value)}
              placeholder="Paste HTML source code starting with <html> or <div id='updHindi'>..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        {/* Extraction Settings & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={embedImages}
              onChange={(e) => setEmbedImages(e.target.checked)}
              className="rounded text-blue-600 w-4 h-4 cursor-pointer"
            />
            <span>Permanent Offline Mode (Download &amp; Cache all question images so they never expire)</span>
          </label>

          <button
            type="button"
            onClick={handleExtractQuestions}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                <span>{loadingStatus || "Extracting Questions..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Extract All 100 Questions &amp; Answers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EXTRACTED RESULTS SECTION ── */}
      {metadata && questions.length > 0 && (
        <div className="space-y-6">
          
          {/* Metadata & Quick Stats Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {metadata.vendor} Verified Response Sheet
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {metadata.candidateName} — {metadata.rollNumber}
                </h2>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                  <span><strong>Exam:</strong> {metadata.examName}</span>
                  <span>&bull;</span>
                  <span><strong>Shift:</strong> {metadata.testDate} {metadata.testTime}</span>
                  <span>&bull;</span>
                  <span><strong>Venue:</strong> {metadata.venue}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Save to Database (Create PYQ)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Download JSON"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Download CSV"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Print"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <div className="text-2xl font-black text-blue-900">{questions.length}</div>
                <div className="text-[11px] font-bold text-blue-700 mt-0.5">Total Questions</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-2xl font-black text-emerald-800">+{metadata.totalCorrect}</div>
                <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Correct Answers</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <div className="text-2xl font-black text-rose-800">-{metadata.totalWrong}</div>
                <div className="text-[11px] font-bold text-rose-700 mt-0.5">Wrong Answers</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                <div className="text-2xl font-black text-slate-800">{metadata.totalUnattempted}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-0.5">Unattempted</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
                <div className="text-2xl font-black text-amber-900">{metadata.accuracy}</div>
                <div className="text-[11px] font-bold text-amber-700 mt-0.5">Candidate Accuracy</div>
              </div>
            </div>
          </div>

          {/* ── QUESTION FILTER & SEARCH BAR ── */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Section Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSection("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSection === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All ({questions.length})
                </button>
                {uniqueSections.map((sec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSection === sec ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {sec} ({questions.filter(q => q.section === sec).length})
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Q.No or text..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* ── QUESTION CARDS LIST ── */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isEditing = editingQNum === q.question_number;
              const hasQuestionImg = !!q.image_url;
              const hasOptionImgs = !!(q.option_a_image_url || q.option_b_image_url || q.option_c_image_url || q.option_d_image_url);

              return (
                <div
                  key={q.question_number}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 transition-all hover:border-slate-300"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-black">
                        Q.{q.question_number}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {q.section}
                      </span>
                      {hasQuestionImg && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Diagram</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Candidate response pill */}
                      {q.candidate_status === "correct" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Candidate Chose Option {q.candidate_chosen} (+2.0)</span>
                        </span>
                      ) : q.candidate_status === "wrong" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Candidate Chose Option {q.candidate_chosen} (-0.5)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Not Attempted</span>
                        </span>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingQNum(isEditing ? null : q.question_number)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit question text or correct answer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Official Challenge link */}
                      {q.challenge_url && (
                        <a
                          href={q.challenge_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 underline hover:text-blue-800 cursor-pointer"
                        >
                          SSC Objection Link
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-3">
                    {q.question_text && (
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {q.question_text}
                      </p>
                    )}

                    {/* Question Image (High Resolution) */}
                    {q.image_url && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 inline-block max-w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.image_url}
                          alt={`Question ${q.question_number}`}
                          className="max-h-72 max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {[
                      { letter: "A" as const, text: q.option_a, img: q.option_a_image_url },
                      { letter: "B" as const, text: q.option_b, img: q.option_b_image_url },
                      { letter: "C" as const, text: q.option_c, img: q.option_c_image_url },
                      { letter: "D" as const, text: q.option_d, img: q.option_d_image_url }
                    ].map((opt) => {
                      const isOfficialCorrect = q.correct_answer === opt.letter;
                      const isCandidateChosen = q.candidate_chosen === opt.letter;

                      return (
                        <div
                          key={opt.letter}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                            isOfficialCorrect
                              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20"
                              : isCandidateChosen
                              ? "bg-rose-50/60 border-rose-200"
                              : "bg-slate-50/70 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isOfficialCorrect
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.letter}
                          </span>

                          <div className="flex-1 space-y-1">
                            {opt.text && (
                              <p className="text-xs font-semibold text-slate-800">
                                {opt.text}
                              </p>
                            )}

                            {opt.img && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={opt.img}
                                alt={`Option ${opt.letter}`}
                                className="max-h-24 max-w-full object-contain rounded-md"
                              />
                            )}

                            {isOfficialCorrect && (
                              <div className="text-[10px] font-black text-emerald-700 flex items-center gap-1 pt-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Official SSC Key Answer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Edit Form */}
                  {isEditing && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 pt-3">
                      <div className="text-xs font-black text-amber-900 flex items-center justify-between">
                        <span>Edit Question #{q.question_number} Details:</span>
                        <button
                          type="button"
                          onClick={() => setEditingQNum(null)}
                          className="text-[11px] text-amber-800 underline font-bold cursor-pointer"
                        >
                          Done
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 block">Question Text:</label>
                        <textarea
                          rows={2}
                          value={q.question_text}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "question_text", e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-amber-300 text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["A", "B", "C", "D"] as const).map((letter) => {
                          const fieldName = `option_${letter.toLowerCase()}` as keyof ExtractedQuestion;
                          return (
                            <div key={letter}>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Option {letter}:</label>
                              <input
                                type="text"
                                value={(q[fieldName] as string) || ""}
                                onChange={(e) => handleUpdateQuestion(q.question_number, fieldName, e.target.value)}
                                className="w-full p-2 rounded-lg bg-white border border-amber-300 text-xs font-medium text-slate-900"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <label className="text-xs font-bold text-slate-700">Official Correct Option:</label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "correct_answer", e.target.value as any)}
                          className="p-1.5 rounded-lg border border-amber-300 bg-white text-xs font-black text-slate-900"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── SAVE TO DATABASE MODAL ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Save Extracted Paper to Database</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Paper Title (Shown to Students):</label>
                <input
                  type="text"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Exam ID:</label>
                  <select
                    value={examId}
                    onChange={(e) => setExamId(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  >
                    <option value={1}>SSC CGL (Exam ID 1)</option>
                    <option value={2}>SSC CHSL (Exam ID 2)</option>
                    <option value={3}>SSC CPO (Exam ID 3)</option>
                    <option value={4}>SSC MTS (Exam ID 4)</option>
                    <option value={5}>SSC GD (Exam ID 5)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Exam Year:</label>
                  <input
                    type="number"
                    value={paperYear}
                    onChange={(e) => setPaperYear(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Test Duration (Minutes):</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div>✓ <strong>{questions.length} Questions</strong> will be bulk-inserted into <code>paper_questions</code>.</div>
                <div>✓ Will be immediately playable as an interactive online mock test paper.</div>
                <div>✓ Auto-syncs JSON/TXT local backups in <code>src/data/pyq_backup/</code>.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={savingToDb}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
              >
                {savingToDb ? "Saving All 100 Questions..." : "Confirm & Save Paper"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
