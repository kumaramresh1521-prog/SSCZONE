"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import MathText from "@/components/MathText";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Sparkles,
  FileText,
  Check,
  RefreshCw,
  Search,
  Download,
  BookOpen,
  FileCheck,
  HelpCircle,
  Layers
} from "lucide-react";
import { 
  getPaperPdfUrl, 
  isPaperDownloadAllowed, 
  setPaperDownloadAllowed, 
  uploadPaperPdf, 
  setPaperPdfUrl 
} from "@/lib/paper-pdf-store";

interface ParsedPaperQuestion {
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  isValid: boolean;
  errorReason?: string;
}

type BulkImporterTab = "pdf" | "csv" | "json" | "text";

export default function PaperQuestionsPage() {
  const params = useParams();
  const paperId = params.paperId as string;
  const [paper, setPaper] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mode: 'list' | 'add' | 'bulk'
  const [activeTab, setActiveTab] = useState<"list" | "add" | "bulk">("list");

  // Single Question Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qNum, setQNum] = useState(1);
  const [qText, setQText] = useState("");
  const [opA, setOpA] = useState("");
  const [opB, setOpB] = useState("");
  const [opC, setOpC] = useState("");
  const [opD, setOpD] = useState("");
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [explanation, setExplanation] = useState("");

  // 4-in-1 Bulk Importer Studio State
  const [importerTab, setImporterTab] = useState<BulkImporterTab>("pdf");
  const [rawText, setRawText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedPaperQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isReplacingPdfOnly, setIsReplacingPdfOnly] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  // High-performance Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(25);
  const [jumpQ, setJumpQ] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function handleToggleDownload() {
    if (!paper) return;
    const current = isPaperDownloadAllowed(paper);
    const next = !current;
    setPaper({ ...paper, allow_download: next });
    await setPaperDownloadAllowed(Number(paperId), next);
    if (next) {
      toast.success("Candidate download enabled on website!");
    } else {
      toast.error("Candidate download disabled on website!");
    }
  }

  async function handleReplacePdfOnly(file: File) {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }
    setIsReplacingPdfOnly(true);
    const toastId = toast.loading(`Uploading "${file.name}" to cloud storage...`);
    try {
      const { url, error } = await uploadPaperPdf(file);
      if (error) throw new Error(error);
      if (url) {
        await setPaperPdfUrl(Number(paperId), url);
        setPaper((prev: any) => ({ ...prev, pdf_url: url }));
        toast.success("Clean PDF updated for student downloads! All existing questions were preserved.", { id: toastId });
        setPdfFile(null);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to replace PDF file", { id: toastId });
    } finally {
      setIsReplacingPdfOnly(false);
    }
  }

  useEffect(() => {
    Promise.all([
      supabase
        .from("previous_papers")
        .select("*, exams(title)")
        .eq("id", paperId)
        .single(),
      fetch(`/api/papers/settings?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({}))
    ]).then(([{ data }, settings]) => {
      if (data) {
        const setting = settings?.[String(paperId)];
        const allowed = setting !== undefined
          ? Boolean(setting.allow_download)
          : (data.test_type !== "mock" && data.allow_download !== false);
        setPaper({ ...data, allow_download: allowed, test_type: allowed ? "pyq" : "mock" });
      }
    });
    loadQuestions();
  }, [paperId]);

  async function loadQuestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("paper_questions")
      .select("*")
      .eq("paper_id", paperId)
      .order("question_number", { ascending: true });

    if (error) toast.error(error.message);
    else {
      setQuestions(data ?? []);
      setQNum((data?.length || 0) + 1);
    }
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setQText("");
    setOpA("");
    setOpB("");
    setOpC("");
    setOpD("");
    setCorrect("A");
    setExplanation("");
    setQNum(questions.length + 1);
  }

  function handleEdit(q: any) {
    setEditingId(q.id);
    setQNum(q.question_number);
    setQText(q.question_text || "");
    setOpA(q.option_a || "");
    setOpB(q.option_b || "");
    setOpC(q.option_c || "");
    setOpD(q.option_d || "");
    setCorrect(q.correct_answer || "A");
    setExplanation(q.explanation || "");
    setActiveTab("add");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this paper question?")) return;
    const { error } = await supabase.from("paper_questions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Question deleted!");
      loadQuestions();
    }
  }

  // ── Download Questions as Formatted Text (.txt) ──
  function handleDownloadTxt() {
    if (!questions || questions.length === 0) {
      toast.error("No questions available to download!");
      return;
    }

    let content = `================================================================================\n`;
    content += `${(paper?.title || "SSC ZONE PYQ PAPER").toUpperCase()}\n`;
    content += `Exam: ${paper?.exams?.title || "SSC Examination"} | Year: ${paper?.year || 2025}\n`;
    content += `Total Questions: ${questions.length} | Duration: ${paper?.duration_minutes || 60} Minutes\n`;
    content += `Extracted from Official Answer Key via SSC ZONE (www.ssczone.in)\n`;
    content += `Downloaded on: ${new Date().toLocaleString()}\n`;
    content += `================================================================================\n\n`;

    questions.forEach((q, idx) => {
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
    const safeTitle = (paper?.title || "paper_questions").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    a.href = url;
    a.download = `${safeTitle}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Questions .txt file downloaded!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payloadWithExp: any = {
      paper_id: parseInt(paperId),
      question_number: qNum,
      question_text: qText.trim(),
      option_a: opA.trim(),
      option_b: opB.trim(),
      option_c: opC.trim(),
      option_d: opD.trim(),
      correct_answer: correct,
      explanation: explanation.trim() || null
    };

    const payloadBase: any = {
      paper_id: parseInt(paperId),
      question_number: qNum,
      question_text: qText.trim(),
      option_a: opA.trim(),
      option_b: opB.trim(),
      option_c: opC.trim(),
      option_d: opD.trim(),
      correct_answer: correct
    };

    setLoading(true);
    try {
      if (editingId) {
        let { error } = await supabase.from("paper_questions").update(payloadWithExp).eq("id", editingId);
        if (error && error.message.includes("explanation")) {
          const res = await supabase.from("paper_questions").update(payloadBase).eq("id", editingId);
          error = res.error;
        }
        if (error) throw error;
        toast.success("Question updated successfully!");
        resetForm();
        setActiveTab("list");
        loadQuestions();
      } else {
        let { error } = await supabase.from("paper_questions").insert(payloadWithExp);
        if (error && error.message.includes("explanation")) {
          const res = await supabase.from("paper_questions").insert(payloadBase);
          error = res.error;
        }
        if (error) throw error;
        toast.success("Question added successfully!");
        resetForm();
        setActiveTab("list");
        loadQuestions();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save question");
    } finally {
      setLoading(false);
    }
  }

  // ── 1. PDF Parser Function ──
  async function handlePdfUpload(file: File) {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }
    setPdfFile(file);
    setPdfParsing(true);
    setParsedPreview([]);

    const toastId = toast.loading(`Parsing "${file.name}" for MCQs...`);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to parse PDF", { id: toastId });
        return;
      }

      if (!data.questions || data.questions.length === 0) {
        toast.error("No MCQ questions could be automatically extracted from this PDF.", { id: toastId });
        return;
      }

      // Convert to ParsedPaperQuestion format
      const formatted: ParsedPaperQuestion[] = data.questions.map((q: any, idx: number) => {
        const qNo = questions.length + idx + 1;
        const qText = q.question_text || "";
        const opA = q.option_a || "";
        const opB = q.option_b || "";
        const opC = q.option_c || "";
        const opD = q.option_d || "";
        const ansRaw = (q.correct_answer || "A").toUpperCase().trim();
        const correctAns = (["A", "B", "C", "D"].includes(ansRaw) ? ansRaw : "A") as "A" | "B" | "C" | "D";

        let isValid = true;
        let errorReason = "";
        if (!qText) { isValid = false; errorReason = "Missing question text"; }
        else if (!opA || !opB || !opC || !opD) { isValid = false; errorReason = "All 4 options required"; }

        return {
          question_number: qNo,
          question_text: qText,
          option_a: opA,
          option_b: opB,
          option_c: opC,
          option_d: opD,
          correct_answer: correctAns,
          isValid,
          errorReason
        };
      });

      setParsedPreview(formatted);
      toast.success(`Successfully parsed ${formatted.length} questions from PDF!`, { id: toastId });
    } catch (err: any) {
      toast.error("PDF upload error: " + err.message, { id: toastId });
    } finally {
      setPdfParsing(false);
    }
  }

  // ── 2. CSV Parser Function ──
  function parseCSV(text: string): ParsedPaperQuestion[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return [];

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("question") || firstLine.includes("option") || firstLine.includes("qno");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line, idx) => {
      let parts: string[] = [];
      if (line.includes("||")) {
        parts = line.split("||").map((s) => s.trim());
      } else if (line.includes("\t")) {
        parts = line.split("\t").map((s) => s.trim());
      } else {
        parts =
          line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)?.map((p) => {
            let str = p.replace(/^,/, "").trim();
            if (str.startsWith('"') && str.endsWith('"')) {
              str = str.slice(1, -1).replace(/""/g, '"');
            }
            return str;
          }) || [];
      }

      let startIdx = 0;
      let qNo = questions.length + idx + 1;
      if (!isNaN(parseInt(parts[0])) && parts.length >= 6) {
        qNo = parseInt(parts[0]);
        startIdx = 1;
      }

      const qText = parts[startIdx] || "";
      const opA = parts[startIdx + 1] || "";
      const opB = parts[startIdx + 2] || "";
      const opC = parts[startIdx + 3] || "";
      const opD = parts[startIdx + 4] || "";
      const ansRaw = (parts[startIdx + 5] || "").toUpperCase().trim();

      let isValid = true;
      let errorReason = "";

      if (!qText) { isValid = false; errorReason = "Missing question text"; }
      else if (!opA || !opB || !opC || !opD) { isValid = false; errorReason = "All 4 options required"; }
      else if (!["A", "B", "C", "D"].includes(ansRaw)) { isValid = false; errorReason = `Invalid answer '${ansRaw}'`; }

      const correctAns = (["A", "B", "C", "D"].includes(ansRaw) ? ansRaw : "A") as "A" | "B" | "C" | "D";

      return {
        question_number: qNo,
        question_text: qText,
        option_a: opA,
        option_b: opB,
        option_c: opC,
        option_d: opD,
        correct_answer: correctAns,
        isValid,
        errorReason
      };
    });
  }

  // ── 3. JSON Parser Function ──
  function parseJSON(text: string): ParsedPaperQuestion[] {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return [];
      return data.map((item: any, idx: number) => {
        const qNo = item.question_number || item.q_no || item.no || questions.length + idx + 1;
        const qText = item.question_text || item.question || "";
        const opA = item.option_a || item.optionA || item.a || "";
        const opB = item.option_b || item.optionB || item.b || "";
        const opC = item.option_c || item.optionC || item.c || "";
        const opD = item.option_d || item.optionD || item.d || "";
        const ansRaw = (item.correct_answer || item.answer || item.correct || "").toUpperCase().trim();

        let isValid = true;
        let errorReason = "";

        if (!qText) { isValid = false; errorReason = "Missing question text"; }
        else if (!opA || !opB || !opC || !opD) { isValid = false; errorReason = "All 4 options required"; }
        else if (!["A", "B", "C", "D"].includes(ansRaw)) { isValid = false; errorReason = `Invalid answer '${ansRaw}'`; }

        const correctAns = (["A", "B", "C", "D"].includes(ansRaw) ? ansRaw : "A") as "A" | "B" | "C" | "D";

        return {
          question_number: qNo,
          question_text: qText,
          option_a: opA,
          option_b: opB,
          option_c: opC,
          option_d: opD,
          correct_answer: correctAns,
          isValid,
          errorReason
        };
      });
    } catch (err: any) {
      toast.error("Invalid JSON syntax: " + err.message);
      return [];
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) return;
      if (file.name.endsWith(".json")) setParsedPreview(parseJSON(content));
      else setParsedPreview(parseCSV(content));
    };
    reader.readAsText(file);
  }

  function handleTextParse() {
    if (!rawText.trim()) return toast.error("Please paste content to parse!");
    if (rawText.trim().startsWith("[")) setParsedPreview(parseJSON(rawText));
    else setParsedPreview(parseCSV(rawText));
  }

  // ── 4. Batch Importer Execution ──
  async function executeBulkImport() {
    const validQuestions = parsedPreview.filter((q) => q.isValid);
    if (validQuestions.length === 0) return toast.error("No valid questions found to import!");

    setIsUploading(true);
    setUploadProgress(0);

    if (overwriteExisting && questions.length > 0) {
      const ok = confirm(`Caution: This will replace all ${questions.length} existing questions in this paper with ${validQuestions.length} newly extracted questions. Proceed?`);
      if (!ok) {
        setIsUploading(false);
        return;
      }
      const { error: delErr } = await supabase.from("paper_questions").delete().eq("paper_id", parseInt(paperId));
      if (delErr) {
        toast.error("Failed to clear old questions: " + delErr.message);
        setIsUploading(false);
        return;
      }
    }

    const formattedPayloads = validQuestions.map((q, idx) => ({
      paper_id: parseInt(paperId),
      question_number: overwriteExisting ? idx + 1 : q.question_number,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    }));

    const chunkSize = 50;
    let successCount = 0;

    for (let i = 0; i < formattedPayloads.length; i += chunkSize) {
      const chunk = formattedPayloads.slice(i, i + chunkSize);
      const { error } = await supabase.from("paper_questions").insert(chunk);
      if (error) {
        toast.error(`Chunk ${Math.floor(i / chunkSize) + 1} failed: ` + error.message);
        break;
      }
      successCount += chunk.length;
      setUploadProgress(Math.round((successCount / formattedPayloads.length) * 100));
    }

    // If PDF was selected, update attached PDF URL as well
    if (pdfFile) {
      try {
        const { url } = await uploadPaperPdf(pdfFile);
        if (url) {
          await setPaperPdfUrl(parseInt(paperId), url);
          setPaper((prev: any) => ({ ...prev, pdf_url: url }));
        }
      } catch (e) {
        console.warn("Could not sync PDF file:", e);
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} questions into this paper!`);
      setParsedPreview([]);
      setRawText("");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setActiveTab("list");
      loadQuestions();
    }
  }

  function downloadSampleCSV() {
    const csvContent = `QNo||Question Text||Option A||Option B||Option C||Option D||Correct Answer
1||What is the unit of electric current?||Ampere||Volt||Ohm||Watt||A
2||Who was the first President of India?||Dr. Rajendra Prasad||Mahatma Gandhi||Jawaharlal Nehru||Sardar Patel||A
3||Watt : Power :: Pascal : ?||Energy||Temperature||Pressure||Force||C`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sample_pyq_paper_questions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadSampleJSON() {
    const jsonContent = JSON.stringify(
      [
        {
          question_number: 1,
          question_text: "What is the unit of electric current?",
          option_a: "Ampere",
          option_b: "Volt",
          option_c: "Ohm",
          option_d: "Watt",
          correct_answer: "A"
        },
        {
          question_number: 2,
          question_text: "Watt : Power :: Pascal : ?",
          option_a: "Energy",
          option_b: "Temperature",
          option_c: "Pressure",
          option_d: "Force",
          correct_answer: "C"
        }
      ],
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sample_pyq_paper_questions.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      return (
        searchTerm === "" ||
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.question_number).includes(searchTerm)
      );
    });
  }, [questions, searchTerm]);

  const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredQuestions.length / pageSize);
  const paginatedQuestions = useMemo(() => {
    if (pageSize === "all") return filteredQuestions;
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const paperPdf = paper ? getPaperPdfUrl(paper) : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Paper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/admin/papers" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
              <ArrowLeft className="h-3 w-3" /> Back to PYQ Papers
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-800">{paper?.exams?.title || "Exam"}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {paper ? paper.title : "Loading PYQ Paper..."}
          </h1>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Year {paper?.year}
            </span>
            <span>•</span>
            <span>Target: {paper?.total_questions || 100} MCQs</span>
            <span>•</span>
            <span>Currently Added: {questions.length} MCQs</span>
            {paperPdf && (
              <>
                <span>•</span>
                <a
                  href={paperPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  <span>PDF Linked</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Header Controls: Prominent PDF Show Toggle & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 self-start sm:self-center">
          {/* Prominent PDF Show ON/OFF Toggle Button */}
          <button
            type="button"
            onClick={handleToggleDownload}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
              paper && isPaperDownloadAllowed(paper)
                ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-600/20"
                : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
            }`}
            title="Click to turn Candidate PDF Show/Download ON or OFF on website"
          >
            <FileText className="h-4 w-4" />
            <span>PDF on Website:</span>
            <span className={`px-2 py-0.5 rounded-lg font-black text-xs ${
              paper && isPaperDownloadAllowed(paper) ? "bg-white text-emerald-700" : "bg-rose-600 text-white"
            }`}>
              {paper && isPaperDownloadAllowed(paper) ? "ON (दिखेगा)" : "OFF (छिपेगा)"}
            </span>
          </button>

          {/* Tab Controls */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("list")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Questions ({questions.length})
          </button>

          <button
            onClick={() => {
              resetForm();
              setActiveTab("add");
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "add"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ➕ Single Q
          </button>

          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
              activeTab === "bulk"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>4-in-1 Bulk Importer</span>
          </button>
        </div>
      </div>
    </div>

      {/* ── TAB 1: QUESTIONS LIST ── */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions by text or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Download all questions and answer keys as a clean formatted .txt file"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span>Download Extracted (.txt)</span>
              </button>

              <button
                onClick={loadQuestions}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Fast Pagination Control Bar */}
          {filteredQuestions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-xs">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <span>
                  Showing{" "}
                  <b className="text-blue-700">
                    {pageSize === "all"
                      ? `all ${filteredQuestions.length}`
                      : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredQuestions.length)}`}
                  </b>{" "}
                  of <b>{filteredQuestions.length}</b> questions
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Jump to Question */}
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2 py-1 bg-slate-50">
                  <span className="text-[11px] text-slate-500 font-bold">Jump to Q:</span>
                  <input
                    type="number"
                    placeholder="Q#"
                    value={jumpQ}
                    onChange={(e) => {
                      const val = e.target.value;
                      setJumpQ(val);
                      const num = parseInt(val);
                      if (num > 0 && num <= questions.length) {
                        if (pageSize !== "all") {
                          const targetPage = Math.ceil(num / pageSize);
                          setCurrentPage(targetPage);
                        }
                      }
                    }}
                    className="w-12 bg-white border border-slate-300 rounded-lg px-1 py-0.5 text-xs font-bold text-center"
                  />
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {([25, 50, "all"] as const).map((size) => (
                    <button
                      key={String(size)}
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        pageSize === size
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {size === "all" ? "All" : `${size}/page`}
                    </button>
                  ))}
                </div>

                {/* Page Nav Buttons */}
                {pageSize !== "all" && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`h-6 w-6 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          currentPage === pg
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading paper questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-800">No questions populated in this paper yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Use the <b>4-in-1 Bulk Importer</b> to instantly extract all 100 questions from a PDF, or upload CSV / JSON!
              </p>
              <button
                onClick={() => setActiveTab("bulk")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Open 4-in-1 Bulk Importer</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {paginatedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800">
                          Q.{q.question_number}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Answer: Option {q.correct_answer}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        <MathText text={q.question_text} />
                      </h4>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        {[
                          { label: "A", val: q.option_a },
                          { label: "B", val: q.option_b },
                          { label: "C", val: q.option_c },
                          { label: "D", val: q.option_d }
                        ].map((opt) => {
                          const isCorrect = q.correct_answer === opt.label;
                          return (
                            <div
                              key={opt.label}
                              className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs sm:text-sm font-semibold border ${
                                isCorrect
                                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                                  : "bg-slate-50 border-slate-100 text-slate-700"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="flex-1">
                                <MathText text={opt.val} />
                              </span>
                              {isCorrect && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-3 rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-xs sm:text-sm text-slate-800">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>Detailed Explanation / व्याख्या:</span>
                          </div>
                          <div className="leading-relaxed">
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEdit(q)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        title="Edit question"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-xs mt-2">
              <span className="text-slate-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  ← Previous Page
                </button>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next Page →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SINGLE QUESTION FORM ── */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-lg font-black text-slate-900">
            {editingId ? "✏️ Edit Paper Question" : "➕ Add Single Question to Paper"}
          </h3>

          <div className="flex gap-4">
            <div className="w-28">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Q. Number</label>
              <input
                type="number"
                value={qNum}
                onChange={(e) => setQNum(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold text-center"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Question Statement</label>
              <textarea
                rows={2}
                placeholder="Enter question text in English / Hindi (LaTeX $x^2$ supported)..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Option A</label>
              <input
                type="text"
                value={opA}
                onChange={(e) => setOpA(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Option B</label>
              <input
                type="text"
                value={opB}
                onChange={(e) => setOpB(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Option C</label>
              <input
                type="text"
                value={opC}
                onChange={(e) => setOpC(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Option D</label>
              <input
                type="text"
                value={opD}
                onChange={(e) => setOpD(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Correct Answer Key</label>
            <div className="flex gap-2 max-w-md">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrect(opt)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-black border transition-all cursor-pointer ${
                    correct === opt
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Detailed Explanation / Solution (व्याख्या) - Optional
            </label>
            <textarea
              rows={4}
              placeholder="Enter comprehensive solution, formulas used, shortcut tricks, or background facts (LaTeX $x^2$ supported)..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Supports LaTeX math like $x^2 + y^2 = r^2$ and Hindi text. This explanation is shown to candidates in test review and solution sheets.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {editingId ? "Update Question" : "Save Question to Paper"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("list");
              }}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 3: SUPERCHARGED 4-IN-1 BULK IMPORTER STUDIO ── */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Smart Paper Importer Studio
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  4-in-1 Bulk Question Importer
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                  Import all 100 questions into this paper in seconds. Choose from <b>Direct PDF</b>, <b>CSV/Excel</b>, <b>JSON Data</b>, or <b>Smart Text Paste</b>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sample CSV</span>
                </button>
                <button
                  onClick={downloadSampleJSON}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white transition-colors"
                >
                  <FileJson className="h-3.5 w-3.5 text-amber-400" />
                  <span>Sample JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub Tabs Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              onClick={() => {
                setImporterTab("pdf");
                setParsedPreview([]);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                importerTab === "pdf"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>1. Direct PDF Parser (Fastest)</span>
            </button>

            <button
              onClick={() => {
                setImporterTab("csv");
                setParsedPreview([]);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                importerTab === "csv"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>2. CSV / Excel Upload</span>
            </button>

            <button
              onClick={() => {
                setImporterTab("json");
                setParsedPreview([]);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                importerTab === "json"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <FileJson className="h-4 w-4" />
              <span>3. JSON Importer</span>
            </button>

            <button
              onClick={() => {
                setImporterTab("text");
                setParsedPreview([]);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                importerTab === "text"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>4. Paste Raw Text</span>
            </button>
          </div>

          {/* ── Sub Tab Content ── */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            {/* 1. PDF TAB with With & Without Content Change Options */}
            {importerTab === "pdf" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-8 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Upload or Re-upload Question Paper PDF
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg">
                    Select an official paper PDF to replace the student download file, or re-extract questions.
                  </p>

                  <label className="mt-4 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>{pdfFile ? `Selected: ${pdfFile.name} (Click to change)` : "Select Paper PDF File"}</span>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setPdfFile(f);
                          setParsedPreview([]);
                        }
                      }}
                      className="hidden"
                      disabled={pdfParsing || isReplacingPdfOnly}
                    />
                  </label>

                  {pdfFile && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Ready: <b>{pdfFile.name}</b> ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                {/* 2 Clear Options when a PDF is selected */}
                {pdfFile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    {/* Option 1: Replace PDF File Only (WITHOUT Content Change) */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md mb-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Option 1: No Content Change
                        </div>
                        <h5 className="text-sm font-black text-slate-900">
                          Replace Download PDF Only
                        </h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Replaces the attached PDF for student downloads.
                          <b className="block mt-1.5 text-emerald-900 font-semibold">
                            ✓ Your existing {questions.length} questions, LaTeX formulas, and explanations in the database will NOT be touched or overwritten.
                          </b>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReplacePdfOnly(pdfFile)}
                        disabled={isReplacingPdfOnly || pdfParsing}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 px-4 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isReplacingPdfOnly ? "Uploading PDF..." : "📄 Replace PDF Only (Keep Questions)"}</span>
                      </button>
                    </div>

                    {/* Option 2: Re-extract Questions (WITH Content Change) */}
                    <div className="rounded-2xl border-2 border-blue-300 bg-blue-50/70 p-5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                          Option 2: With Content Change
                        </div>
                        <h5 className="text-sm font-black text-slate-900">
                          Re-extract & Overwrite All Questions
                        </h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Parses all MCQ questions, options A–D, and keys from this PDF into the preview table below.
                          <b className="block mt-1.5 text-blue-950 font-semibold">
                            ⚡ You can review the extracted questions and import them to replace old paper questions.
                          </b>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePdfUpload(pdfFile)}
                        disabled={pdfParsing || isReplacingPdfOnly}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 px-4 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>{pdfParsing ? "Extracting Questions..." : "⚡ Parse & Extract MCQs from PDF"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CSV TAB */}
            {importerTab === "csv" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Upload CSV or TSV File (.csv)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Supports pipe-separated (<code>||</code>), comma-separated, or tab-delimited columns.
                  </p>

                  <label className="mt-5 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Select CSV File</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. JSON TAB */}
            {importerTab === "json" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-8 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                    <FileJson className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Upload JSON File</h4>
                  <p className="text-xs text-slate-500 mt-1">Upload a <code>.json</code> file containing an array of questions.</p>

                  <label className="mt-4 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-2.5 text-xs font-bold text-white shadow-md">
                    <Upload className="h-4 w-4" />
                    <span>Select JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Or Paste JSON Array Directly:
                  </label>
                  <textarea
                    rows={4}
                    placeholder='[{"question_number": 1, "question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A"}]'
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-mono focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    onClick={handleTextParse}
                    className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Parse JSON Text
                  </button>
                </div>
              </div>
            )}

            {/* 4. TEXT TAB */}
            {importerTab === "text" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Paste Delimited Questions:
                </label>
                <p className="text-xs text-slate-500">
                  Format: <code>QNo || Question || Option A || Option B || Option C || Option D || CorrectAnswer</code>
                </p>
                <textarea
                  rows={6}
                  placeholder={`1||What is the unit of power?||Joule||Watt||Newton||Pascal||B\n2||Who invented bulb?||Edison||Tesla||Newton||Einstein||A`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs font-mono focus:border-blue-600 focus:outline-none"
                />
                <button
                  onClick={handleTextParse}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Parse Text Lines
                </button>
              </div>
            )}

            {/* ── LIVE PREVIEW & BULK SAVE BUTTON ── */}
            {parsedPreview.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Parsed Questions Preview: {parsedPreview.length} questions
                    </h4>
                    <p className="text-xs text-slate-500">
                      Valid: <b className="text-emerald-600">{parsedPreview.filter((q) => q.isValid).length}</b> • Invalid: <b className="text-red-500">{parsedPreview.filter((q) => !q.isValid).length}</b>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span>Overwrite Existing Questions</span>
                    </label>

                    <button
                      onClick={executeBulkImport}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-black text-white shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {isUploading
                          ? `Importing (${uploadProgress}%)...`
                          : `Import All ${parsedPreview.filter((q) => q.isValid).length} Questions Now`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {/* Question Preview List (First 10) */}
                <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
                  {parsedPreview.slice(0, 15).map((q, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 border text-xs ${
                        q.isValid
                          ? "bg-white border-slate-200"
                          : "bg-red-50/60 border-red-200 text-red-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-800">
                          Q.{q.question_number}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Ans: {q.correct_answer}
                        </span>
                      </div>
                      <p className="text-slate-700 line-clamp-1">{q.question_text}</p>
                      <div className="mt-1 flex gap-3 text-[11px] text-slate-500">
                        <span>A: {q.option_a}</span>
                        <span>B: {q.option_b}</span>
                        <span>C: {q.option_c}</span>
                        <span>D: {q.option_d}</span>
                      </div>
                    </div>
                  ))}
                  {parsedPreview.length > 15 && (
                    <p className="text-center text-xs text-slate-400 py-2">
                      ...and {parsedPreview.length - 15} more questions ready to import.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
