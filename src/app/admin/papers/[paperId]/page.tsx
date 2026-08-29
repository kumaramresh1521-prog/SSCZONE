"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
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
  Search
} from "lucide-react";

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

  // Bulk State
  const [bulkMode, setBulkMode] = useState<"file" | "text">("file");
  const [rawText, setRawText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedPaperQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("previous_papers")
      .select("*, exams(title)")
      .eq("id", paperId)
      .single()
      .then(({ data }) => setPaper(data));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
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
    if (editingId) {
      const { error } = await supabase.from("paper_questions").update(payload).eq("id", editingId);
      if (error) toast.error(error.message);
      else {
        toast.success("Question updated!");
        resetForm();
        setActiveTab("list");
        loadQuestions();
      }
    } else {
      const { error } = await supabase.from("paper_questions").insert(payload);
      if (error) toast.error(error.message);
      else {
        toast.success("Question added!");
        resetForm();
        setActiveTab("list");
        loadQuestions();
      }
    }
    setLoading(false);
  }

  // Parsers for CSV & JSON
  function parseCSV(text: string): ParsedPaperQuestion[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return [];

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("question") || firstLine.includes("option");
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

      // Check if first column is Question Number
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

  async function executeBulkImport() {
    const validQuestions = parsedPreview.filter((q) => q.isValid);
    if (validQuestions.length === 0) return toast.error("No valid questions found to import!");

    setIsUploading(true);
    setUploadProgress(0);

    const formattedPayloads = validQuestions.map((q) => ({
      paper_id: parseInt(paperId),
      question_number: q.question_number,
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

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} questions into paper!`);
      setParsedPreview([]);
      setRawText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab("list");
      loadQuestions();
    }
  }

  function downloadSampleCSV() {
    const csvContent = `QNo||Question Text||Option A||Option B||Option C||Option D||Correct Answer
1||What is the unit of electric current?||Ampere||Volt||Ohm||Watt||A
2||Who was the first President of India?||Dr. Rajendra Prasad||Mahatma Gandhi||Jawaharlal Nehru||Sardar Patel||A`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_paper_questions.csv";
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
          question_text: "Who was the first President of India?",
          option_a: "Dr. Rajendra Prasad",
          option_b: "Mahatma Gandhi",
          option_c: "Jawaharlal Nehru",
          option_d: "Sardar Patel",
          correct_answer: "A"
        }
      ],
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_paper_questions.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredQuestions = questions.filter(
    (q) =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option_c.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option_d.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(q.question_number).includes(searchTerm)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back Link & Paper Details */}
      <div className="mb-8">
        <Link
          href="/admin/papers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Papers
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {paper?.title || "Paper Questions"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Exam: <span className="font-semibold text-gray-800">{paper?.exams?.title}</span> • Year:{" "}
              <span className="font-semibold text-gray-800">{paper?.year}</span> • Total Questions:{" "}
              <span className="font-semibold text-gray-800">{questions.length} / {paper?.total_questions || 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-2 rounded-xl bg-gray-100 p-1.5">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            Paper Questions ({questions.length})
          </button>

          <button
            onClick={() => {
              resetForm();
              setActiveTab("add");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "add" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="h-4 w-4" />
            {editingId ? "Edit Question" : "Add Question"}
          </button>

          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "bulk" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="h-4 w-4" />
            Bulk Import Test Paper
          </button>
        </div>

        {activeTab === "list" && (
          <button
            onClick={loadQuestions}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh List
          </button>
        )}
      </div>

      {/* TAB 1: LIST */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search paper questions by text or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading paper questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
              No questions found in this paper. Use "Bulk Import Test Paper" or "Add Question" to populate!
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          Q.{q.question_number}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 leading-snug">
                        {q.question_text}
                      </h4>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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
                              className={`flex items-center gap-2 rounded-xl p-2.5 text-sm font-medium border ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                  : "bg-gray-50 border-gray-100 text-gray-700"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="flex-1">{opt.val}</span>
                              {isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SINGLE FORM */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editingId ? "Edit Paper Question" : "Add Question to Paper"}
          </h3>

          <div className="flex gap-4">
            <div className="w-28">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Q. Number</label>
              <input
                type="number"
                value={qNum}
                onChange={(e) => setQNum(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-bold text-center"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Question Statement</label>
              <textarea
                rows={2}
                placeholder="Enter question text..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Option A</label>
              <input
                type="text"
                value={opA}
                onChange={(e) => setOpA(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Option B</label>
              <input
                type="text"
                value={opB}
                onChange={(e) => setOpB(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Option C</label>
              <input
                type="text"
                value={opC}
                onChange={(e) => setOpC(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Option D</label>
              <input
                type="text"
                value={opD}
                onChange={(e) => setOpD(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Correct Answer</label>
            <div className="flex gap-2 max-w-md">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrect(opt)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold border ${
                    correct === opt ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700"
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Save Question"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("list");
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BULK */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Full Paper Question Importer
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Upload an entire previous year exam paper (100+ questions) in seconds via CSV/JSON.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Download Sample CSV
                </button>
                <button
                  onClick={downloadSampleJSON}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50"
                >
                  <FileJson className="h-4 w-4 text-amber-600" /> Download Sample JSON
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex gap-4 border-b border-gray-100 pb-3">
              <button
                onClick={() => setBulkMode("file")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 ${
                  bulkMode === "file" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                }`}
              >
                <Upload className="h-4 w-4" /> Upload CSV / JSON File
              </button>
              <button
                onClick={() => setBulkMode("text")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 ${
                  bulkMode === "text" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                }`}
              >
                <FileText className="h-4 w-4" /> Paste Raw Content / JSON
              </button>
            </div>

            {bulkMode === "file" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <Upload className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="text-base font-bold text-gray-800">Select Test Paper File (.csv or .json)</h4>
                <label className="mt-4 cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md">
                  Browse File
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  placeholder={`Example:\n1||Question 1 text||Opt A||Opt B||Opt C||Opt D||A\n2||Question 2 text||Opt A||Opt B||Opt C||Opt D||B`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4 font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={handleTextParse}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Parse Questions
                </button>
              </div>
            )}
          </div>

          {parsedPreview.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-base font-bold text-gray-900">
                  Validation Table ({parsedPreview.length} items parsed)
                </h4>
                <button
                  onClick={executeBulkImport}
                  disabled={isUploading}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Save All ({parsedPreview.filter((q) => q.isValid).length})
                </button>
              </div>

              <div className="max-h-80 overflow-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-gray-50 text-gray-700 font-bold uppercase border-b">
                    <tr>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Q.No</th>
                      <th className="px-3 py-2">Question</th>
                      <th className="px-3 py-2">Opt A</th>
                      <th className="px-3 py-2">Opt B</th>
                      <th className="px-3 py-2">Opt C</th>
                      <th className="px-3 py-2">Opt D</th>
                      <th className="px-3 py-2">Ans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? "hover:bg-gray-50" : "bg-red-50 text-red-900"}>
                        <td className="px-3 py-2">
                          {item.isValid ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        </td>
                        <td className="px-3 py-2 font-bold">{item.question_number}</td>
                        <td className="px-3 py-2 font-medium max-w-xs truncate">{item.question_text}</td>
                        <td className="px-3 py-2 text-gray-600">{item.option_a}</td>
                        <td className="px-3 py-2 text-gray-600">{item.option_b}</td>
                        <td className="px-3 py-2 text-gray-600">{item.option_c}</td>
                        <td className="px-3 py-2 text-gray-600">{item.option_d}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{item.correct_answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

