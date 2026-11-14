"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Filter,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import MathText from "@/components/MathText";

interface DailyQuizQuestion {
  id?: string;
  section_key?: "quant" | "reasoning" | "english" | "ga";
  section_name?: string;
  question_text: string;
  question_text_hi?: string;
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
  status?: "draft" | "approved";
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  questions: DailyQuizQuestion[];
}

export default function AdminDailyQuizPage() {
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "draft">("all");

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
  const [formStatus, setFormStatus] = useState<"draft" | "approved">("approved");

  // Question Import Method: "generator100" | "manual" | "txt" | "json" | "pdf"
  const [importTab, setImportTab] = useState<"generator100" | "manual" | "txt" | "json" | "pdf">("generator100");
  const [rawText, setRawText] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [questionsList, setQuestionsList] = useState<DailyQuizQuestion[]>([]);

  // 100 Qs Generator State
  const [generating100, setGenerating100] = useState(false);
  const [generatorCount, setGeneratorCount] = useState<number>(100);
  const [generatorSubject, setGeneratorSubject] = useState<string>("mixed");

  // Search & Filtering inside Question Review list
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionSectionFilter, setQuestionSectionFilter] = useState<string>("all");
  const [previewMode, setPreviewMode] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);

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
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "draft" && q.status === "draft") ||
        (statusFilter === "approved" && q.status !== "draft");
      return matchSearch && matchSub && matchStatus;
    });
  }, [quizzes, searchQuery, selectedSubjectFilter, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingQuizId(null);
    const today = new Date().toISOString().split("T")[0];
    setFormTitle(`SSC 2026 Full Mega Mock - 100 Questions: ${today}`);
    setFormDate(today);
    setFormSubjectKey("mixed");
    setFormTargetExam("SSC CGL / CHSL 2026");
    setFormDuration(60);
    setFormIsActive(false);
    setFormStatus("draft");
    setQuestionsList([]);
    setRawText("");
    setRawJson("");
    setPdfFile(null);
    setImportTab("generator100");
    setPreviewMode(false);
    setShowAnalysis(true);
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
    setFormStatus(quiz.status || "approved");
    setQuestionsList(quiz.questions || []);
    setRawText("");
    setRawJson("");
    setPdfFile(null);
    setImportTab("manual");
    setPreviewMode(false);
    setShowAnalysis(true);
    setModalOpen(true);
  };

  // Generate Questions Randomly from Question Bank & Shift PYQs
  const handleGenerate100 = async () => {
    setGenerating100(true);
    try {
      const res = await fetch(`/api/admin/daily-quiz/generate-100?count=${generatorCount}&subject=${generatorSubject}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate questions");

      if (data.questions && data.questions.length > 0) {
        setQuestionsList(data.questions);
        setFormDuration(data.questions.length >= 50 ? 60 : data.questions.length >= 25 ? 15 : 10);
        setFormSubjectKey(generatorSubject as any);
        if (generatorSubject === "mixed") {
          setFormTitle(`Daily Free Quiz: All India SSC CGL Tier-1 Shift Mock (${formDate})`);
        } else if (generatorSubject === "quant") {
          setFormTitle(`Daily Free Quiz: Quantitative Aptitude Speed Drill (${formDate})`);
        } else if (generatorSubject === "reasoning") {
          setFormTitle(`Daily Free Quiz: Reasoning & Intelligence Speed Drill (${formDate})`);
        } else if (generatorSubject === "ga") {
          setFormTitle(`Daily Free Quiz: General Awareness & Static GK Challenge (${formDate})`);
        } else if (generatorSubject === "english") {
          setFormTitle(`Daily Free Quiz: English Comprehension Speed Drill (${formDate})`);
        }
        setImportTab("manual"); // Switch to manual / analysis view
        const pyqNum = data.sources?.pyq_count ?? "N/A";
        const bankNum = data.sources?.bank_count ?? "N/A";
        toast.success(`🎉 Generated ${data.questions.length} questions (${pyqNum} Shift PYQs + ${bankNum} Question Bank)!`);
      }
    } catch (err: any) {
      toast.error("Generation failed: " + err.message);
    } finally {
      setGenerating100(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/daily-quiz?id=${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, is_active: data.is_active, status: data.status || q.status } : q
          )
        );
        toast.success(data.message);
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  // Approve and Publish Immediately from List
  const handleApproveQuiz = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/daily-quiz?id=${id}&action=approve`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, is_active: true, status: "approved" } : q))
        );
        toast.success(data.message);
      }
    } catch {
      toast.error("Approval failed");
    }
  };

  // Move to Draft from List
  const handleMoveToDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/daily-quiz?id=${id}&action=draft`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, is_active: false, status: "draft" } : q))
        );
        toast.success(data.message);
      }
    } catch {
      toast.error("Failed to move to draft");
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

  // Handle Save Quiz (Draft or Approved)
  const handleSaveQuiz = async (shouldApproveNow: boolean) => {
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
      status: shouldApproveNow ? "approved" : "draft",
      is_active: shouldApproveNow,
      approveNow: shouldApproveNow,
      saveAsDraft: !shouldApproveNow,
    };

    if (importTab === "manual" || questionsList.length > 0) {
      if (questionsList.length === 0) {
        toast.error("Please add or generate at least 1 question");
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

  // Add Empty Question Manually (User request: "kuch apne hisab se add kar pau")
  const handleAddEmptyQuestion = (position: "end" | "start" = "end") => {
    const newQ: DailyQuizQuestion = {
      id: `q_custom_${Date.now()}_${questionsList.length + 1}`,
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      explanation: "",
      section_key: "mixed" as any,
    };

    setQuestionsList((prev) => (position === "start" ? [newQ, ...prev] : [...prev, newQ]));
    toast.success("New question added! Edit its fields below.");
  };

  // Update specific question field
  const handleUpdateQuestion = (index: number, field: keyof DailyQuizQuestion, value: string) => {
    setQuestionsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Duplicate a question
  const handleDuplicateQuestion = (index: number) => {
    const item = questionsList[index];
    if (!item) return;
    const copy: DailyQuizQuestion = {
      ...item,
      id: `q_copy_${Date.now()}_${index + 1}`,
    };
    setQuestionsList((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    toast.success(`Duplicated Question ${index + 1}!`);
  };

  // Delete question from list
  const handleDeleteQuestion = (index: number) => {
    setQuestionsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Analytical Metrics for the current question set
  const analysisData = useMemo(() => {
    const total = questionsList.length;
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    let hasExplanation = 0;
    let hasMathFormula = 0;

    questionsList.forEach((q) => {
      if (q.correct_answer && counts[q.correct_answer] !== undefined) {
        counts[q.correct_answer]++;
      }
      if (q.explanation && q.explanation.trim().length > 5) {
        hasExplanation++;
      }
      if (q.question_text && (q.question_text.includes("$") || q.question_text.includes("\\") || q.question_text.includes("^"))) {
        hasMathFormula++;
      }
    });

    const keyDist = {
      A: total > 0 ? Math.round((counts.A / total) * 100) : 0,
      B: total > 0 ? Math.round((counts.B / total) * 100) : 0,
      C: total > 0 ? Math.round((counts.C / total) * 100) : 0,
      D: total > 0 ? Math.round((counts.D / total) * 100) : 0,
    };

    return { total, counts, keyDist, hasExplanation, hasMathFormula };
  }, [questionsList]);

  // Filtered view of questions within the modal
  const displayedQuestions = useMemo(() => {
    return questionsList
      .map((q, idx) => ({ q, originalIndex: idx }))
      .filter(({ q }) => {
        if (!questionSearch.trim()) return true;
        const s = questionSearch.toLowerCase();
        return (
          q.question_text.toLowerCase().includes(s) ||
          q.option_a.toLowerCase().includes(s) ||
          q.option_b.toLowerCase().includes(s) ||
          (q.explanation || "").toLowerCase().includes(s)
        );
      });
  }, [questionsList, questionSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Admin Content & Full Mock Manager
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily Free Quiz & 100 Qs <span className="text-blue-600">Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Generate 100-question random mega tests from PYQs, add custom questions, analyze balance, and approve before publishing live to website.
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
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate / Create Quiz</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Total Quizzes</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{quizzes.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Created tests</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Approved Live Quizzes</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {quizzes.filter((q) => q.is_active && q.status !== "draft").length}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">Live for students</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Pending Drafts</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {quizzes.filter((q) => q.status === "draft").length}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5 font-medium">Needs admin approval</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-bold">Total Questions</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {quizzes.reduce((acc, q) => acc + (q.questions?.length || q.total_questions || 0), 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MCQs in database</div>
        </div>
      </div>

      {/* Quizzes Management List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search & Status Filters */}
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

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({quizzes.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("approved")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === "approved" ? "bg-emerald-600 text-white shadow-2xs" : "text-emerald-700 hover:text-emerald-900"
                }`}
              >
                🟢 Approved Live
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === "draft" ? "bg-amber-500 text-white shadow-2xs" : "text-amber-700 hover:text-amber-900"
                }`}
              >
                🟡 Drafts
              </button>
            </div>
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
            <div>Click &quot;Generate / Create Quiz&quot; above to create and approve your first test!</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuizzes.map((quiz) => {
              const isApproved = quiz.status === "approved" || (!quiz.status && quiz.is_active);
              const isDraft = quiz.status === "draft";

              return (
                <div
                  key={quiz.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Approval Status Badge */}
                      {isDraft ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Draft (Unpublished)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Approved & Live
                        </span>
                      )}

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
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        {quiz.questions?.length || quiz.total_questions || 0} Questions
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {quiz.duration_minutes} Minutes
                      </span>
                      {quiz.approved_at && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Approved {new Date(quiz.approved_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Approval Trigger */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {/* Approve Action */}
                    {isDraft ? (
                      <button
                        type="button"
                        onClick={() => handleApproveQuiz(quiz.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        title="Approve quiz and publish immediately to students"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve & Go Live</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMoveToDraft(quiz.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Move back to draft (hides from students)"
                      >
                        Set to Draft
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleActive(quiz.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        quiz.is_active
                          ? "bg-slate-100 text-slate-700 border-slate-300"
                          : "bg-rose-50 text-rose-700 border-rose-200"
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
                      title="Edit Quiz / Questions"
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
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT / 100 Qs GENERATOR MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {editingQuizId ? "Edit Daily Free Quiz" : "Create & Approve Daily Free Quiz"}
                  </h2>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    formStatus === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {formStatus === "approved" ? "Status: Approved" : "Status: Draft"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate 100 questions automatically, add your own custom questions, perform audit analysis, and approve for website publication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Form Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Daily Free Quiz: Quantitative Aptitude Speed Drill"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quiz Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject Category</label>
                  <select
                    value={formSubjectKey}
                    onChange={(e) => setFormSubjectKey(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="mixed">Mixed (All 4 Subjects - Full Mock)</option>
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Question Importer & Generator Tabs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Question Source & Tools:</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs flex-wrap">
                    <button
                      type="button"
                      onClick={() => setImportTab("generator100")}
                      className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                        importTab === "generator100"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      🎲 100 Qs Generator
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("manual")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        importTab === "manual" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      ✍️ Questions & Audit ({questionsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("txt")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        importTab === "txt" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      📝 Smart TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("pdf")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        importTab === "pdf" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      📄 PDF Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportTab("json")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        importTab === "json" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      💻 JSON
                    </button>
                  </div>
                </div>

                {/* TAB 1: 100 Qs RANDOM GENERATOR */}
                {importTab === "generator100" && (
                  <div className="space-y-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 border border-blue-200/80">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold mb-1">
                          ⚡ Instant Full Mock Generator
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          Auto-Generate 100 Balanced Random Questions
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">
                          Automatically draws 25 Reasoning, 25 General Awareness, 25 Quantitative Aptitude, and 25 English Comprehension questions directly from Official SSC Shift PYQs and the active Question Bank.
                        </p>
                      </div>

                      <div className="bg-white border border-blue-200 px-4 py-2.5 rounded-xl shadow-xs text-right">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">Section Breakdown</div>
                        <div className="text-xs font-black text-blue-700 mt-0.5">
                          25 + 25 + 25 + 25 = 100 Qs
                        </div>
                      </div>
                    </div>

                    {/* Generator Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Section / Subject:</label>
                        <select
                          value={generatorSubject}
                          onChange={(e) => setGeneratorSubject(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="mixed">All 4 Sections (Mixed Mock - 25% each)</option>
                          <option value="quant">Quantitative Aptitude</option>
                          <option value="reasoning">General Intelligence & Reasoning</option>
                          <option value="ga">General Awareness & Static GK</option>
                          <option value="english">English Comprehension</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Question Count:</label>
                        <select
                          value={generatorCount}
                          onChange={(e) => setGeneratorCount(Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value={100}>100 Questions (Official Full Mock - 60 min)</option>
                          <option value={50}>50 Questions (Mini Mock - 30 min)</option>
                          <option value={25}>25 Questions (Speed Drill - 15 min)</option>
                          <option value={10}>10 Questions (Quick Quiz - 8 min)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={generating100}
                        onClick={handleGenerate100}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {generating100 ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Pulling Dual-Source Questions...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>⚡ Generate {generatorCount} Questions (PYQ + Bank)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {questionsList.length > 0 && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Currently {questionsList.length} questions loaded in this quiz! You can add custom questions or audit them in the next tab.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImportTab("manual")}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                        >
                          Review & Audit ➔
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: MANUAL / CUSTOM QUESTIONS & AUDIT ANALYSIS */}
                {importTab === "manual" && (
                  <div className="space-y-5">
                    {/* AUDIT & ANALYSIS DASHBOARD */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                            Quiz Quality & Balance Audit (Analysis Dashboard)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAnalysis(!showAnalysis)}
                          className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          {showAnalysis ? "Hide Analysis" : "Show Analysis"}
                        </button>
                      </div>

                      {showAnalysis && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Total MCQs</span>
                            <div className="text-lg font-black text-slate-900 mt-0.5">
                              {analysisData.total} Qs
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {analysisData.total === 100 ? "✅ Ideal 100 Qs Full Mock" : `${analysisData.total} Questions`}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Answer Key Balance</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-1">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">A:{analysisData.keyDist.A}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">B:{analysisData.keyDist.B}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">C:{analysisData.keyDist.C}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">D:{analysisData.keyDist.D}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Evenly spread keys</span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Explanations</span>
                            <div className="text-lg font-black text-indigo-600 mt-0.5">
                              {analysisData.hasExplanation} / {analysisData.total}
                            </div>
                            <span className="text-[10px] text-slate-400">Detailed rationale present</span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">KaTeX Math Formulas</span>
                            <div className="text-lg font-black text-purple-600 mt-0.5">
                              {analysisData.hasMathFormula} Qs
                            </div>
                            <span className="text-[10px] text-slate-400">Mathematical equations</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Row: Add Custom Question, Search, Student Preview Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddEmptyQuestion("end")}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Custom Question</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            previewMode
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{previewMode ? "Exit Student Preview" : "Student Preview Mode"}</span>
                        </button>
                      </div>

                      {/* In-list Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search questions in this test..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Questions Review List */}
                    {questionsList.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                        No questions in this test yet. Click &quot;🎲 100 Qs Generator&quot; or &quot;+ Add Custom Question&quot; above!
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {displayedQuestions.map(({ q, originalIndex }) => (
                          <div
                            key={q.id || originalIndex}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              previewMode
                                ? "bg-white border-slate-300 shadow-xs"
                                : "bg-white border-slate-200 space-y-3.5 shadow-2xs"
                            }`}
                          >
                            {/* Card Top Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-lg bg-blue-600 text-white text-xs font-black shadow-2xs">
                                  Q. {originalIndex + 1}
                                </span>
                                {q.section_name && (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {q.section_name}
                                  </span>
                                )}
                                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  Correct Key: {q.correct_answer}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateQuestion(originalIndex)}
                                  className="text-slate-500 hover:text-blue-600 p-1 rounded-md hover:bg-slate-100 text-xs flex items-center gap-1 cursor-pointer"
                                  title="Duplicate this question"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(originalIndex)}
                                  className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 text-xs flex items-center gap-1 cursor-pointer"
                                  title="Remove question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* PREVIEW MODE: EXACTLY AS STUDENTS SEE IT */}
                            {previewMode ? (
                              <div className="space-y-3 pt-1">
                                <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                                  <MathText text={q.question_text} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {(["A", "B", "C", "D"] as const).map((opt) => {
                                    const optVal = q[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}`];
                                    const isCorrect = q.correct_answer === opt;
                                    return (
                                      <div
                                        key={opt}
                                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                          isCorrect
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                                            : "border-slate-200 bg-slate-50/60 text-slate-800"
                                        }`}
                                      >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                          isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                                        }`}>
                                          {opt}
                                        </span>
                                        <MathText text={optVal} />
                                      </div>
                                    );
                                  })}
                                </div>
                                {q.explanation && (
                                  <div className="text-xs text-slate-600 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                                    <strong className="text-blue-800">Explanation: </strong>
                                    <MathText text={q.explanation} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* EDIT MODE: INLINE CUSTOM EDITING */
                              <>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-500">Question Statement (Supports LaTeX Math):</label>
                                  <textarea
                                    rows={2}
                                    value={q.question_text}
                                    onChange={(e) => handleUpdateQuestion(originalIndex, "question_text", e.target.value)}
                                    placeholder="Enter question statement..."
                                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500">Option A</span>
                                    <input
                                      type="text"
                                      value={q.option_a}
                                      onChange={(e) => handleUpdateQuestion(originalIndex, "option_a", e.target.value)}
                                      placeholder="Option A"
                                      className="w-full p-2 border border-slate-200 rounded-lg mt-0.5 font-medium"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500">Option B</span>
                                    <input
                                      type="text"
                                      value={q.option_b}
                                      onChange={(e) => handleUpdateQuestion(originalIndex, "option_b", e.target.value)}
                                      placeholder="Option B"
                                      className="w-full p-2 border border-slate-200 rounded-lg mt-0.5 font-medium"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500">Option C</span>
                                    <input
                                      type="text"
                                      value={q.option_c}
                                      onChange={(e) => handleUpdateQuestion(originalIndex, "option_c", e.target.value)}
                                      placeholder="Option C"
                                      className="w-full p-2 border border-slate-200 rounded-lg mt-0.5 font-medium"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500">Option D</span>
                                    <input
                                      type="text"
                                      value={q.option_d}
                                      onChange={(e) => handleUpdateQuestion(originalIndex, "option_d", e.target.value)}
                                      placeholder="Option D"
                                      className="w-full p-2 border border-slate-200 rounded-lg mt-0.5 font-medium"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                  <label className="text-xs font-bold text-slate-700">Correct Key:</label>
                                  {(["A", "B", "C", "D"] as const).map((opt) => (
                                    <label
                                      key={opt}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                                        q.correct_answer === opt
                                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`correct_${originalIndex}`}
                                        checked={q.correct_answer === opt}
                                        onChange={() => handleUpdateQuestion(originalIndex, "correct_answer", opt)}
                                        className="hidden"
                                      />
                                      <span>Option {opt}</span>
                                    </label>
                                  ))}
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold text-slate-500">Solution Rationale & Steps:</span>
                                  <input
                                    type="text"
                                    value={q.explanation || ""}
                                    onChange={(e) => handleUpdateQuestion(originalIndex, "explanation", e.target.value)}
                                    placeholder="Explanation (e.g. Formula, rationale, steps)..."
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg mt-0.5"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: TXT / SMART TEXT */}
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

                {/* TAB 4: PDF UPLOAD */}
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

                {/* TAB 5: JSON UPLOAD */}
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
              </div>

              {/* MODAL APPROVAL WORKFLOW ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800">Admin Control: </span>
                  Choose whether to save as an editable draft or approve immediately for students.
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  {/* Save as Draft (Hidden from students) */}
                  <button
                    type="button"
                    onClick={() => handleSaveQuiz(false)}
                    className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save as Draft (Unpublished)</span>
                  </button>

                  {/* Approve and Publish Live */}
                  <button
                    type="button"
                    onClick={() => handleSaveQuiz(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Approve & Publish Live to Website</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
