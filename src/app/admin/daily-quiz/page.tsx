"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  FileText,
  Upload,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Search,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import MathText from "@/components/MathText";

interface DailyQuizQuestion {
  id?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string;
}

interface DailyQuiz {
  id: string;
  title: string;
  date: string;
  subject: string;
  subject_key: "quant" | "reasoning" | "english" | "ga" | "mixed";
  target_exam: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: DailyQuizQuestion[];
}

export default function AdminDailyQuizPage() {
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formSubjectKey, setFormSubjectKey] = useState<"quant" | "reasoning" | "english" | "ga" | "mixed">("mixed");
  const [formTargetExam, setFormTargetExam] = useState("SSC CGL / CHSL 2026");
  const [formDuration, setFormDuration] = useState<number>(10);
  const [formIsActive, setFormIsActive] = useState(true);

  // Question Import Method: "manual" | "txt" | "json" | "pdf"
  const [importTab, setImportTab] = useState<"manual" | "txt" | "json" | "pdf">("txt");
  const [rawText, setRawText] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [questionsList, setQuestionsList] = useState<DailyQuizQuestion[]>([]);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);

  // Load Quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/daily-quiz");
      const data = await res.json();
      if (data.quizzes) {
        setQuizzes(data.quizzes);
      }
    } catch (err: any) {
      toast.error("Failed to load quizzes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filtered Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.date.includes(searchQuery) ||
        q.target_exam.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSub = selectedSubjectFilter === "all" || q.subject_key === selectedSubjectFilter;
      return matchSearch && matchSub;
    });
  }, [quizzes, searchQuery, selectedSubjectFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingQuizId(null);
    const today = new Date().toISOString().split("T")[0];
    setFormTitle(`Daily Free Quiz - ${today}: Speed Drill`);
    setFormDate(today);
    setFormSubjectKey("mixed");
    setFormTargetExam("SSC CGL / CHSL 2026");
    setFormDuration(10);
    setFormIsActive(true);
    setQuestionsList([]);
    setRawText("");
    setRawJson("");
    setPdfFile(null);
    setImportTab("txt");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (quiz: DailyQuiz) => {
    setEditingQuizId(quiz.id);
    setFormTitle(quiz.title);
    setFormDate(quiz.date);
    setFormSubjectKey(quiz.subject_key);
    setFormTargetExam(quiz.target_exam);
    setFormDuration(quiz.duration_minutes);
    setFormIsActive(quiz.is_active);
    setQuestionsList(quiz.questions || []);
    setRawText("");
    setRawJson("");
    setPdfFile(null);
    setImportTab("manual");
    setModalOpen(true);
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/daily-quiz?id=${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, is_active: data.is_active } : q))
        );
        toast.success(data.message);
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete '${title}'? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/daily-quiz?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
        toast.success("Quiz deleted successfully");
      }
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  // Insert Samples
  const handleInsertSampleTxt = () => {
    const sample = `1. In what ratio must water be mixed with milk costing Rs. 12 per litre to get a mixture worth Rs. 8 per litre?
(A) 1 : 2
(B) 2 : 1
(C) 2 : 3
(D) 3 : 2
Ans: A
Exp: By rule of alligation, ratio is (12-8) : (8-0) = 4 : 8 = 1 : 2.

2. If x + 1/x = 5, then find the value of x^2 + 1/x^2.
(A) 23
(B) 25
(C) 27
(D) 21
Ans: A
Exp: x^2 + 1/x^2 = (5)^2 - 2 = 25 - 2 = 23.

3. Select the related word from the given alternatives: Mekong : Tibet :: Amazon : ?
(A) Chile
(B) Peru
(C) Colombia
(D) Ecuador
Ans: B
Exp: Mekong originates in Tibet. Amazon originates in Peru.`;
    setRawText(sample);
    toast.success("Sample Smart TXT loaded!");
  };

  const handleInsertSampleJson = () => {
    const sample = [
      {
        question_text: "Who among the following was the founder of the Brahmo Samaj in 1828?",
        option_a: "Swami Vivekananda",
        option_b: "Raja Ram Mohan Roy",
        option_c: "Dayanand Saraswati",
        option_d: "Ishwar Chandra Vidyasagar",
        correct_answer: "B",
        explanation: "Raja Ram Mohan Roy founded Brahmo Sabha in 1828, which later became Brahmo Samaj."
      },
      {
        question_text: "What is 25% of 400 plus 20% of 500?",
        option_a: "180",
        option_b: "190",
        option_c: "200",
        option_d: "210",
        correct_answer: "C",
        explanation: "25% of 400 = 100. 20% of 500 = 100. 100 + 100 = 200."
      }
    ];
    setRawJson(JSON.stringify(sample, null, 2));
    toast.success("Sample JSON array loaded!");
  };

  // Handle PDF Upload & Parse
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file");
      return;
    }
    setPdfFile(file);
    setPdfParsing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse PDF");
      if (!data.questions || data.questions.length === 0) {
        toast.error("No MCQ questions found in this PDF. Please check the format.");
        return;
      }
      setQuestionsList(data.questions);
      setImportTab("manual");
      toast.success(`🎉 Successfully extracted ${data.questions.length} questions from PDF! You can now review them.`);
    } catch (err: any) {
      toast.error("PDF parse failed: " + err.message);
    } finally {
      setPdfParsing(false);
    }
  };

  // Handle Save Quiz
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Please enter a Quiz Title");
      return;
    }

    const subjectMap: Record<string, string> = {
      quant: "Quantitative Aptitude",
      reasoning: "General Intelligence & Reasoning",
      english: "English Comprehension",
      ga: "General Awareness",
      mixed: "Mixed (All Subjects)",
    };

    const payload: any = {
      id: editingQuizId || undefined,
      title: formTitle.trim(),
      date: formDate,
      subject: subjectMap[formSubjectKey] || "Mixed",
      subject_key: formSubjectKey,
      target_exam: formTargetExam,
      duration_minutes: formDuration,
      is_active: formIsActive,
    };

    if (importTab === "manual" || questionsList.length > 0) {
      if (questionsList.length === 0) {
        toast.error("Please add at least 1 question");
        return;
      }
      payload.questions = questionsList;
    } else if (importTab === "txt") {
      if (!rawText.trim()) {
        toast.error("Please paste question text or load a sample");
        return;
      }
      payload.rawText = rawText;
    } else if (importTab === "json") {
      if (!rawJson.trim()) {
        toast.error("Please paste JSON or load a sample");
        return;
      }
      payload.rawJson = rawJson;
    }

    try {
      const res = await fetch("/api/admin/daily-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to save quiz");

      toast.success(data.message || "Quiz saved successfully! 🎉");
      setModalOpen(false);
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Add Empty Question Manually
  const handleAddEmptyQuestion = () => {
    setQuestionsList((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        explanation: "",
      },
    ]);
  };

  // Update specific question field
  const handleUpdateQuestion = (index: number, field: keyof DailyQuizQuestion, value: string) => {
    setQuestionsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Delete question from list
  const handleDeleteQuestion = (index: number) => {
    setQuestionsList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Admin Content Manager
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily Free Quiz <span className="text-blue-600">Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create and publish daily speed quizzes with multi-format question uploads (PDF, TXT, JSON, or Manual).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/daily-quiz"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live Student Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Total Quizzes</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{quizzes.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All time created</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Active Live Quizzes</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {quizzes.filter((q) => q.is_active).length}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">Available to students</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Today&apos;s Quizzes</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {quizzes.filter((q) => q.date === new Date().toISOString().split("T")[0]).length}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-0.5 font-medium">Published today</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Total Questions</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {quizzes.reduce((acc, q) => acc + (q.questions?.length || q.total_questions || 0), 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MCQs in database</div>
        </div>
      </div>

      {/* Quizzes Management List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search quiz title, date, exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "all", label: "All Subjects" },
              { key: "quant", label: "Quant" },
              { key: "reasoning", label: "Reasoning" },
              { key: "english", label: "English" },
              { key: "ga", label: "GK/GA" },
              { key: "mixed", label: "Mixed" },
            ].map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSubjectFilter(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubjectFilter === s.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            Loading Daily Quizzes...
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-bold text-slate-600">No Daily Quizzes Found</div>
            <div>Click &quot;Create New Quiz&quot; above to add your first daily test!</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2.5 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      📅 {quiz.date}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {quiz.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{quiz.target_exam}</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{quiz.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      {quiz.questions?.length || quiz.total_questions || 0} Questions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.duration_minutes} Minutes
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(quiz.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      quiz.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {quiz.is_active ? "Active" : "Inactive"}
                  </button>

                  <Link
                    href={`/daily-quiz?quizId=${quiz.id}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                    title="Preview Quiz as Student"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(quiz)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                    title="Edit Quiz"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingQuizId ? "Edit Daily Free Quiz" : "Create New Daily Free Quiz"}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in quiz details and import questions via PDF, TXT, JSON, or Manual editor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-6">
              {/* Form Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Daily Free Quiz: Quantitative Aptitude Speed Drill"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quiz Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject Category</label>
                  <select
                    value={formSubjectKey}
                    onChange={(e) => setFormSubjectKey(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="mixed">Mixed (All Subjects)</option>
                    <option value="quant">Quantitative Aptitude</option>
                    <option value="reasoning">General Intelligence & Reasoning</option>
                    <option value="english">English Comprehension</option>
                    <option value="ga">General Awareness</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Exam</label>
                  <input
                    type="text"
                    value={formTargetExam}
                    onChange={(e) => setFormTargetExam(e.target.value)}
                    placeholder="e.g. SSC CGL / CHSL 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={3}
                    max={120}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Question Importer Section */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Choose Question Import Method:</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setImportTab("txt")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        importTab === "txt" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📝 Smart TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("pdf")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        importTab === "pdf" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📄 PDF Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("json")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        importTab === "json" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      💻 JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("manual")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        importTab === "manual" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ✍️ Questions ({questionsList.length})
                    </button>
                  </div>
                </div>

                {/* TAB 1: TXT / SMART TEXT */}
                {importTab === "txt" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Paste questions in standard numbered format:</span>
                      <button
                        type="button"
                        onClick={handleInsertSampleTxt}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Insert Sample TXT
                      </button>
                    </div>

                    <textarea
                      rows={10}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={`1. What is the capital of India?
(A) Mumbai
(B) New Delhi
(C) Kolkata
(D) Chennai
Ans: B
Exp: New Delhi has been the capital since 1911.`}
                      className="w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}

                {/* TAB 2: PDF UPLOAD */}
                {importTab === "pdf" && (
                  <div className="space-y-4 py-4 text-center">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white space-y-3">
                      <Upload className="w-10 h-10 text-blue-600 mx-auto" />
                      <div>
                        <div className="font-extrabold text-sm text-slate-800">Upload MCQ Question PDF</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Supports official SSC shifts, Adda247, and standard coaching PDFs
                        </div>
                      </div>

                      <label className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer">
                        {pdfParsing ? "Extracting Questions from PDF..." : "Choose PDF File"}
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={pdfParsing}
                          onChange={handlePdfUpload}
                          className="hidden"
                        />
                      </label>

                      {pdfFile && (
                        <div className="text-xs text-slate-600 font-medium">Selected: {pdfFile.name}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: JSON UPLOAD */}
                {importTab === "json" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Paste or load JSON array of questions:</span>
                      <button
                        type="button"
                        onClick={handleInsertSampleJson}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Insert Sample JSON
                      </button>
                    </div>

                    <textarea
                      rows={10}
                      value={rawJson}
                      onChange={(e) => setRawJson(e.target.value)}
                      placeholder='[ { "question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "B", "explanation": "..." } ]'
                      className="w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}

                {/* TAB 4: MANUAL / EDIT QUESTIONS */}
                {importTab === "manual" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Total Questions in Quiz: {questionsList.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddEmptyQuestion}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {questionsList.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs relative"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-extrabold text-blue-600">Q. {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>

                          <textarea
                            rows={2}
                            value={q.question_text}
                            onChange={(e) => handleUpdateQuestion(idx, "question_text", e.target.value)}
                            placeholder="Question text (Supports LaTeX Math e.g. x^2, \sqrt{x})..."
                            className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              value={q.option_a}
                              onChange={(e) => handleUpdateQuestion(idx, "option_a", e.target.value)}
                              placeholder="Option A"
                              className="p-2 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={q.option_b}
                              onChange={(e) => handleUpdateQuestion(idx, "option_b", e.target.value)}
                              placeholder="Option B"
                              className="p-2 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={q.option_c}
                              onChange={(e) => handleUpdateQuestion(idx, "option_c", e.target.value)}
                              placeholder="Option C"
                              className="p-2 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={q.option_d}
                              onChange={(e) => handleUpdateQuestion(idx, "option_d", e.target.value)}
                              placeholder="Option D"
                              className="p-2 border border-slate-200 rounded-lg"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-700">Correct Answer:</label>
                            {(["A", "B", "C", "D"] as const).map((opt) => (
                              <label key={opt} className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct_${idx}`}
                                  checked={q.correct_answer === opt}
                                  onChange={() => handleUpdateQuestion(idx, "correct_answer", opt)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>

                          <input
                            type="text"
                            value={q.explanation || ""}
                            onChange={(e) => handleUpdateQuestion(idx, "explanation", e.target.value)}
                            placeholder="Explanation / Solution rationale (optional)..."
                            className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  {editingQuizId ? "Update Quiz" : "Publish Daily Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
