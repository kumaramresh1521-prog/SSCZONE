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
  Layers,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  LayoutList,
  LayoutGrid,
  Share2,
  X,
  Send
} from "lucide-react";
import { classifyMathQuestion, MATH_TOPIC_NAMES } from "@/lib/math-classifier";
import { 
  getPaperPdfUrl, 
  isPaperDownloadAllowed, 
  setPaperDownloadAllowed, 
  isPaperTranslatorAllowed,
  setPaperTranslatorAllowed,
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
  const [isTranslating, setIsTranslating] = useState(false);

  // High-density space-saving View Mode: 'compact' (takes 75% less space!) vs 'cards'
  const [viewDensity, setViewDensity] = useState<"compact" | "cards">("compact");
  const [expandedQIds, setExpandedQIds] = useState<Set<number>>(new Set());

  // Hindi On/Off Lock System (Locked = Confirmed Hindi, Unlocked = Needs Translation)
  const [lockedHindiIds, setLockedHindiIds] = useState<Set<number>>(new Set());
  const [batchTranslating, setBatchTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);
  const [translatingQId, setTranslatingQId] = useState<number | null>(null);

  // Load saved Hindi Locks for this paper
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ssczone_paper_${paperId}_hindi_locks`);
      if (stored) {
        setLockedHindiIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, [paperId]);

  // ── FORWARD TO QUESTION BANK STATE ──
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [qbStatusMap, setQbStatusMap] = useState<Record<number, { inQb: boolean; qbId?: number; topicId?: number; topicTitle?: string }>>({});
  const [loadingQbStatus, setLoadingQbStatus] = useState(false);

  // Single Question Forward Modal State
  const [forwardModalQ, setForwardModalQ] = useState<any | null>(null);
  const [forwardSubjectId, setForwardSubjectId] = useState<number>(1);
  const [forwardTopicId, setForwardTopicId] = useState<number>(182);
  const [forwardExamTag, setForwardExamTag] = useState<string>("");
  const [forwardTier, setForwardTier] = useState<string>("Tier 1");
  const [forwardDifficulty, setForwardDifficulty] = useState<string>("medium");
  const [isForwardingSingle, setIsForwardingSingle] = useState(false);

  // Bulk Forward Modal State
  const [showBulkForwardModal, setShowBulkForwardModal] = useState(false);
  const [bulkForwardSection, setBulkForwardSection] = useState<"math" | "reasoning" | "ga" | "english" | "all">("math");
  const [selectedForwardQIds, setSelectedForwardQIds] = useState<Set<number>>(new Set());
  const [bulkForwardAssignments, setBulkForwardAssignments] = useState<Record<number, { topicId: number; subjectId: number }>>({});
  const [isForwardingBulk, setIsForwardingBulk] = useState(false);
  const [bulkForwardProgress, setBulkForwardProgress] = useState(0);

  // Load subjects and topics on mount
  useEffect(() => {
    Promise.all([
      supabase.from("subjects").select("id, title, exam_id").order("id"),
      supabase.from("topics").select("id, title, subject_id").order("id"),
    ]).then(([sRes, tRes]) => {
      if (sRes.data) setAllSubjects(sRes.data);
      if (tRes.data) setAllTopics(tRes.data);
    });
  }, []);

  // Load Question Bank Status
  const loadQbStatus = async () => {
    if (!paperId) return;
    try {
      setLoadingQbStatus(true);
      const res = await fetch(`/api/admin/questions/import-pyq?checkStatus=1&paperId=${paperId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.statusMap) {
          setQbStatusMap(json.statusMap);
        }
      }
    } catch {
    } finally {
      setLoadingQbStatus(false);
    }
  };

  useEffect(() => {
    if (paperId) {
      loadQbStatus();
    }
  }, [paperId]);

  // Filter topics for the currently selected forward subject
  const currentSubjectTopics = useMemo(() => {
    if (!forwardSubjectId) return [];
    return allTopics.filter((t) => t.subject_id === forwardSubjectId);
  }, [allTopics, forwardSubjectId]);

  // Helper to suggest subject and topic for a question
  const getSuggestedSubjectAndTopic = (q: any) => {
    const qNo = q.question_number || 1;
    let subId = 1; // Default Math
    if (qNo <= 25) {
      const reas = allSubjects.find((s) => s.title?.toLowerCase().includes("reasoning"));
      subId = reas?.id || 3;
    } else if (qNo <= 50) {
      const ga = allSubjects.find((s) => s.title?.toLowerCase().includes("general") || s.title?.toLowerCase().includes("gk"));
      subId = ga?.id || 4;
    } else if (qNo <= 75) {
      const math = allSubjects.find((s) => s.title?.toLowerCase().includes("math"));
      subId = math?.id || 1;
    } else {
      const eng = allSubjects.find((s) => s.title?.toLowerCase().includes("english"));
      subId = eng?.id || 2;
    }

    let topId = 182;
    if (subId === 1) {
      topId = classifyMathQuestion(q.question_text);
    } else {
      const matching = allTopics.filter((t) => t.subject_id === subId);
      topId = matching[0]?.id || 1;
    }

    return { subjectId: subId, topicId: topId };
  };

  const openForwardModal = (q: any) => {
    setForwardModalQ(q);
    const { subjectId, topicId } = getSuggestedSubjectAndTopic(q);
    setForwardSubjectId(subjectId);
    setForwardTopicId(topicId);

    const examName = paper?.exams?.title || "SSC CGL";
    const yr = paper?.year || 2024;
    const tier = paper?.title?.toLowerCase().includes("tier 2") || paper?.title?.toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1";
    setForwardExamTag(`${examName} ${yr} ${tier}`);
    setForwardTier(tier);
    setForwardDifficulty("medium");
  };

  const executeSingleForward = async () => {
    if (!forwardModalQ || !forwardTopicId) {
      toast.error("Please select a valid chapter / topic");
      return;
    }
    try {
      setIsForwardingSingle(true);
      const res = await fetch("/api/admin/questions/import-pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: Number(paperId),
          questionId: forwardModalQ.id,
          topicId: forwardTopicId,
          customExamTag: forwardExamTag,
          tierLevel: forwardTier,
          difficulty: forwardDifficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to forward question");

      const targetTopicTitle = allTopics.find((t) => t.id === forwardTopicId)?.title || "Chapter";
      toast.success(`✓ Question #${forwardModalQ.question_number} forwarded to Question Bank under [${targetTopicTitle}]!`);

      setQbStatusMap((prev) => ({
        ...prev,
        [forwardModalQ.id]: { inQb: true, topicId: forwardTopicId, topicTitle: targetTopicTitle },
      }));
      setForwardModalQ(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to forward question");
    } finally {
      setIsForwardingSingle(false);
    }
  };

  const openBulkForwardModal = (preferredSection: "math" | "reasoning" | "ga" | "english" | "all" = "math") => {
    setBulkForwardSection(preferredSection);
    setShowBulkForwardModal(true);

    const targetQs = questions.filter((q, idx) => {
      const qNo = q.question_number || idx + 1;
      if (preferredSection === "math") return qNo >= 51 && qNo <= 75;
      if (preferredSection === "reasoning") return qNo >= 1 && qNo <= 25;
      if (preferredSection === "ga") return qNo >= 26 && qNo <= 50;
      if (preferredSection === "english") return qNo >= 76 && qNo <= 100;
      return true;
    });

    const sel = new Set<number>(targetQs.map((q) => q.id));
    setSelectedForwardQIds(sel);

    const asg: Record<number, { topicId: number; subjectId: number }> = {};
    targetQs.forEach((q) => {
      const { subjectId, topicId } = getSuggestedSubjectAndTopic(q);
      asg[q.id] = { subjectId, topicId };
    });
    setBulkForwardAssignments(asg);
  };

  const handleBulkSectionChange = (sec: "math" | "reasoning" | "ga" | "english" | "all") => {
    setBulkForwardSection(sec);
    const targetQs = questions.filter((q, idx) => {
      const qNo = q.question_number || idx + 1;
      if (sec === "math") return qNo >= 51 && qNo <= 75;
      if (sec === "reasoning") return qNo >= 1 && qNo <= 25;
      if (sec === "ga") return qNo >= 26 && qNo <= 50;
      if (sec === "english") return qNo >= 76 && qNo <= 100;
      return true;
    });

    const sel = new Set<number>(targetQs.map((q) => q.id));
    setSelectedForwardQIds(sel);

    const asg = { ...bulkForwardAssignments };
    targetQs.forEach((q) => {
      if (!asg[q.id]) {
        const { subjectId, topicId } = getSuggestedSubjectAndTopic(q);
        asg[q.id] = { subjectId, topicId };
      }
    });
    setBulkForwardAssignments(asg);
  };

  const executeBulkForward = async () => {
    if (selectedForwardQIds.size === 0) {
      toast.error("Please select at least one question to forward");
      return;
    }

    try {
      setIsForwardingBulk(true);
      setBulkForwardProgress(10);

      const examName = paper?.exams?.title || "SSC CGL";
      const yr = paper?.year || 2024;
      const tier = paper?.title?.toLowerCase().includes("tier 2") || paper?.title?.toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1";
      const autoExamTag = `${examName} ${yr} ${tier}`.trim();

      const assignmentsList = Array.from(selectedForwardQIds).map((qid) => {
        const asg = bulkForwardAssignments[qid];
        return {
          questionId: qid,
          topicId: asg?.topicId || 182,
          difficulty: "medium",
        };
      });

      setBulkForwardProgress(40);

      const res = await fetch("/api/admin/questions/import-pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: Number(paperId),
          assignments: assignmentsList,
          customExamTag: autoExamTag,
          tierLevel: tier,
        }),
      });

      setBulkForwardProgress(80);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to forward questions");

      const updatedStatus = { ...qbStatusMap };
      assignmentsList.forEach((item) => {
        const tTitle = allTopics.find((t) => t.id === item.topicId)?.title || "Chapter";
        updatedStatus[item.questionId] = {
          inQb: true,
          topicId: item.topicId,
          topicTitle: tTitle,
        };
      });
      setQbStatusMap(updatedStatus);

      setBulkForwardProgress(100);
      toast.success(`✓ Successfully forwarded ${assignmentsList.length} verified questions into Question Bank!`);
      setShowBulkForwardModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to forward questions");
    } finally {
      setIsForwardingBulk(false);
      setBulkForwardProgress(0);
    }
  };

  // 4-in-1 Bulk Importer Studio State
  const [importerTab, setImporterTab] = useState<BulkImporterTab>("text");
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

  async function handleToggleTranslator() {
    if (!paper) return;
    const current = isPaperTranslatorAllowed(paper);
    const next = !current;
    setPaper({ ...paper, allow_translation: next });
    await setPaperTranslatorAllowed(Number(paperId), next);
    if (next) {
      toast.success("Exam Translator Enabled! Candidates can switch between Hindi & English during test.");
    } else {
      toast.error("Exam Translator Disabled! Test will run in strict English-only mode.");
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
        const allowed = setting !== undefined && setting.allow_download !== undefined
          ? Boolean(setting.allow_download)
          : (data.test_type !== "mock" && data.allow_download !== false);
        const transAllowed = setting !== undefined && setting.allow_translation !== undefined
          ? Boolean(setting.allow_translation)
          : (data.allow_translation !== false);
        setPaper({ ...data, allow_download: allowed, allow_translation: transAllowed, test_type: allowed ? "pyq" : "mock" });
      }
    });
    loadQuestions();
  }, [paperId]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/papers/questions?paperId=${paperId}&t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load questions");
      const json = await res.json();
      const list = json.questions ?? [];
      setQuestions(list);
      setQNum(list.length + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this paper question?")) return;
    try {
      const res = await fetch("/api/papers/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paper_id: Number(paperId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete question");
      toast.success("Question deleted!");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question");
    }
  }

  // ── Auto-Translate English to Hindi via Google Translate Engine ──
  async function handleAutoTranslateHindi() {
    if (!qText.trim()) {
      toast.error("Please enter English question statement first!");
      return;
    }
    setIsTranslating(true);
    const toastId = toast.loading("Translating English to authentic Hindi...");
    try {
      // Extract English part if already mixed
      const enMatch = qText.split(/[\u0900-\u097F]/)[0].trim();
      const textToTranslate = enMatch.length > 10 ? enMatch : qText.trim();

      const res = await fetch("/api/papers/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          options: { A: opA, B: opB, C: opC, D: opD },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      if (data.translated) {
        // Construct clean bilingual question statement
        const newStatement = `${textToTranslate} ${data.translated}`;
        setQText(newStatement);
      }

      // Also translate options if they contain English words and returned genuine Hindi
      if (data.translatedOptions) {
        const hasLetters = /[A-Za-z]{2,}/;
        const hasDevanagari = /[\u0900-\u097F]/;
        if (opA && hasLetters.test(opA) && data.translatedOptions.A && hasDevanagari.test(data.translatedOptions.A)) {
          const enA = opA.split(/[\u0900-\u097F/]/)[0].trim();
          setOpA(`${enA} / ${data.translatedOptions.A}`);
        }
        if (opB && hasLetters.test(opB) && data.translatedOptions.B && hasDevanagari.test(data.translatedOptions.B)) {
          const enB = opB.split(/[\u0900-\u097F/]/)[0].trim();
          setOpB(`${enB} / ${data.translatedOptions.B}`);
        }
        if (opC && hasLetters.test(opC) && data.translatedOptions.C && hasDevanagari.test(data.translatedOptions.C)) {
          const enC = opC.split(/[\u0900-\u097F/]/)[0].trim();
          setOpC(`${enC} / ${data.translatedOptions.C}`);
        }
        if (opD && hasLetters.test(opD) && data.translatedOptions.D && hasDevanagari.test(data.translatedOptions.D)) {
          const enD = opD.split(/[\u0900-\u097F/]/)[0].trim();
          setOpD(`${enD} / ${data.translatedOptions.D}`);
        }
      }

      toast.success("Question & Options translated into clean Hindi!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to auto-translate", { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  }

  // ── Toggle Hindi Confirmation Lock on Single Question ──
  function toggleHindiLock(qId: number) {
    setLockedHindiIds((prev) => {
      const next = new Set(prev);
      const isNowLocked = !next.has(qId);
      if (isNowLocked) {
        next.add(qId);
        toast.success("Hindi Confirmed! Translator will skip this question.", { icon: "🔒" });
      } else {
        next.delete(qId);
        toast("Hindi marked for Auto-Translation", { icon: "🌐" });
      }
      try {
        localStorage.setItem(`ssczone_paper_${paperId}_hindi_locks`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }

  function lockAllHindi() {
    const allIds = new Set(questions.map((q) => q.id));
    setLockedHindiIds(allIds);
    try {
      localStorage.setItem(`ssczone_paper_${paperId}_hindi_locks`, JSON.stringify(Array.from(allIds)));
    } catch {}
    toast.success("All questions marked as Hindi Confirmed (Locked)!", { icon: "🔒" });
  }

  function unlockAllHindi() {
    setLockedHindiIds(new Set());
    try {
      localStorage.setItem(`ssczone_paper_${paperId}_hindi_locks`, JSON.stringify([]));
    } catch {}
    toast("All questions marked for translation!", { icon: "🔓" });
  }

  function toggleExpandQ(qId: number) {
    setExpandedQIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  // ── Translate Single Question from List Row ──
  async function handleTranslateSingleQuestion(q: any) {
    setTranslatingQId(q.id);
    const toastId = toast.loading(`Translating Q.${q.question_number} into clean Hindi...`);
    try {
      const enMatch = q.question_text.split(/[\u0900-\u097F]/)[0].trim();
      const textToTranslate = enMatch.length > 10 ? enMatch : q.question_text.trim();

      const res = await fetch("/api/papers/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      const newQText = data.translated ? `${textToTranslate} ${data.translated}` : q.question_text;
      
      const newOptions = {
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
      };

      if (data.translatedOptions) {
        const hasLetters = /[A-Za-z]{2,}/;
        const hasDevanagari = /[\u0900-\u097F]/;
        if (q.option_a && hasLetters.test(q.option_a) && data.translatedOptions.A && hasDevanagari.test(data.translatedOptions.A)) {
          const enA = q.option_a.split(/[\u0900-\u097F/]/)[0].trim();
          newOptions.option_a = `${enA} / ${data.translatedOptions.A}`;
        }
        if (q.option_b && hasLetters.test(q.option_b) && data.translatedOptions.B && hasDevanagari.test(data.translatedOptions.B)) {
          const enB = q.option_b.split(/[\u0900-\u097F/]/)[0].trim();
          newOptions.option_b = `${enB} / ${data.translatedOptions.B}`;
        }
        if (q.option_c && hasLetters.test(q.option_c) && data.translatedOptions.C && hasDevanagari.test(data.translatedOptions.C)) {
          const enC = q.option_c.split(/[\u0900-\u097F/]/)[0].trim();
          newOptions.option_c = `${enC} / ${data.translatedOptions.C}`;
        }
        if (q.option_d && hasLetters.test(q.option_d) && data.translatedOptions.D && hasDevanagari.test(data.translatedOptions.D)) {
          const enD = q.option_d.split(/[\u0900-\u097F/]/)[0].trim();
          newOptions.option_d = `${enD} / ${data.translatedOptions.D}`;
        }
      }

      // Save to database
      const saveRes = await fetch("/api/papers/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: q.id,
          paper_id: parseInt(paperId),
          question_number: q.question_number,
          question_text: newQText,
          option_a: newOptions.option_a,
          option_b: newOptions.option_b,
          option_c: newOptions.option_c,
          option_d: newOptions.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error || "Failed to update question");

      // Auto-lock Hindi since it is now fresh and clean
      setLockedHindiIds((prev) => {
        const next = new Set(prev);
        next.add(q.id);
        try {
          localStorage.setItem(`ssczone_paper_${paperId}_hindi_locks`, JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });

      // Update in-place in local state immediately without wiping or reloading the screen!
      const updatedQ = {
        ...q,
        question_text: newQText,
        option_a: newOptions.option_a,
        option_b: newOptions.option_b,
        option_c: newOptions.option_c,
        option_d: newOptions.option_d,
      };
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? updatedQ : item)));

      toast.success(`Q.${q.question_number} translated & updated!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to translate question", { id: toastId });
    } finally {
      setTranslatingQId(null);
    }
  }

  // ── Batch Translate Only Unconfirmed Questions (Skip Confirmed/Locked) ──
  async function handleBatchTranslateUnconfirmed() {
    const toTranslate = questions.filter((q) => !lockedHindiIds.has(q.id) && q.question_number <= 75);
    if (toTranslate.length === 0) {
      toast.error("All questions are already Hindi Confirmed (Locked) or English Section!");
      return;
    }

    const ok = confirm(`Auto-translate ${toTranslate.length} unconfirmed questions into pure Hindi?\n\n✓ ${lockedHindiIds.size} already confirmed/locked questions will be completely SKIPPED and protected.`);
    if (!ok) return;

    setBatchTranslating(true);
    setTranslateProgress(0);
    const toastId = toast.loading(`Translating 0 / ${toTranslate.length} questions...`);

    let done = 0;
    const newlyLocked = new Set(lockedHindiIds);

    for (const q of toTranslate) {
      try {
        const enMatch = q.question_text.split(/[\u0900-\u097F]/)[0].trim();
        const textToTranslate = enMatch.length > 10 ? enMatch : q.question_text.trim();

        const res = await fetch("/api/papers/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToTranslate,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
          }),
        });
        const data = await res.json();
        if (res.ok && data.translated) {
          const newQText = `${textToTranslate} ${data.translated}`;
          const newOptions = {
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
          };

          if (data.translatedOptions) {
            const hasLetters = /[A-Za-z]{2,}/;
            const hasDevanagari = /[\u0900-\u097F]/;
            if (q.option_a && hasLetters.test(q.option_a) && data.translatedOptions.A && hasDevanagari.test(data.translatedOptions.A)) {
              const enA = q.option_a.split(/[\u0900-\u097F/]/)[0].trim();
              newOptions.option_a = `${enA} / ${data.translatedOptions.A}`;
            }
            if (q.option_b && hasLetters.test(q.option_b) && data.translatedOptions.B && hasDevanagari.test(data.translatedOptions.B)) {
              const enB = q.option_b.split(/[\u0900-\u097F/]/)[0].trim();
              newOptions.option_b = `${enB} / ${data.translatedOptions.B}`;
            }
            if (q.option_c && hasLetters.test(q.option_c) && data.translatedOptions.C && hasDevanagari.test(data.translatedOptions.C)) {
              const enC = q.option_c.split(/[\u0900-\u097F/]/)[0].trim();
              newOptions.option_c = `${enC} / ${data.translatedOptions.C}`;
            }
            if (q.option_d && hasLetters.test(q.option_d) && data.translatedOptions.D && hasDevanagari.test(data.translatedOptions.D)) {
              const enD = q.option_d.split(/[\u0900-\u097F/]/)[0].trim();
              newOptions.option_d = `${enD} / ${data.translatedOptions.D}`;
            }
          }

          await fetch("/api/papers/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: q.id,
              paper_id: parseInt(paperId),
              question_number: q.question_number,
              question_text: newQText,
              option_a: newOptions.option_a,
              option_b: newOptions.option_b,
              option_c: newOptions.option_c,
              option_d: newOptions.option_d,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
            }),
          });

          newlyLocked.add(q.id);

          // Update local state smoothly in real-time
          setQuestions((prev) =>
            prev.map((item) =>
              item.id === q.id
                ? {
                    ...item,
                    question_text: newQText,
                    option_a: newOptions.option_a,
                    option_b: newOptions.option_b,
                    option_c: newOptions.option_c,
                    option_d: newOptions.option_d,
                  }
                : item
            )
          );
        }
      } catch (e) {
        console.warn(`Translation skipped for Q.${q.question_number}:`, e);
      }

      done++;
      const pct = Math.round((done / toTranslate.length) * 100);
      setTranslateProgress(pct);
      toast.loading(`Translating ${done} / ${toTranslate.length} questions (${pct}%)...`, { id: toastId });
    }

    setLockedHindiIds(newlyLocked);
    try {
      localStorage.setItem(`ssczone_paper_${paperId}_hindi_locks`, JSON.stringify(Array.from(newlyLocked)));
    } catch {}

    toast.success(`Successfully translated ${done} questions into clean Hindi!`, { id: toastId });
    setBatchTranslating(false);
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
    const payload: any = {
      id: editingId || undefined,
      paper_id: parseInt(paperId),
      question_number: qNum,
      question_text: qText.trim(),
      option_a: opA.trim(),
      option_b: opB.trim(),
      option_c: opC.trim(),
      option_d: opD.trim(),
      correct_answer: correct,
      explanation: explanation.trim() || null,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/papers/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save question");

      toast.success(editingId ? "Question updated successfully! (Synced with Question Bank ⚡)" : "Question added successfully!");
      resetForm();
      setActiveTab("list");
      loadQuestions();
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

  // ── 3b. Natural & Delimited Text Parser ──
  function parseNaturalOrDelimitedText(text: string): ParsedPaperQuestion[] {
    if (!text || !text.trim()) return [];
    if (text.trim().startsWith("[")) {
      return parseJSON(text);
    }
    if (text.includes("||")) {
      return parseCSV(text);
    }

    // Natural SSC Format: Q1. ... A) ... B) ... C) ... D) ... Correct Answer: ...
    const questions: ParsedPaperQuestion[] = [];
    const qBlocks = text.split(/(?:^|\n)(?:Q\s*(\d+)[\.\:]|(\d+)[\.\:])\s*/i);

    if (qBlocks.length > 1) {
      for (let i = 1; i < qBlocks.length; i += 3) {
        const qNumStr = qBlocks[i] || qBlocks[i + 1] || `${questions.length + 1}`;
        const qNum = parseInt(qNumStr) || (questions.length + 1);
        const block = qBlocks[i + 2] || "";

        const optA = block.match(/(?:^|\n)\s*A[\)\.]\s*([\s\S]*?)(?=(?:\n\s*[B-D][\)\.]|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
        const optB = block.match(/(?:^|\n)\s*B[\)\.]\s*([\s\S]*?)(?=(?:\n\s*[C-D][\)\.]|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
        const optC = block.match(/(?:^|\n)\s*C[\)\.]\s*([\s\S]*?)(?=(?:\n\s*D[\)\.]|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
        const optD = block.match(/(?:^|\n)\s*D[\)\.]\s*([\s\S]*?)(?=(?:\n\s*Correct Answer|\n\s*Ans|\n\s*Explanation|\n*$))/i)?.[1]?.trim() || "";

        const qTextMatch = block.split(/(?:^|\n)\s*A[\)\.]/i)[0];
        const qText = qTextMatch ? qTextMatch.trim() : "";

        const ansMatch = block.match(/(?:Correct Answer|Ans(?:wer)?)\s*[:\-]\s*(?:Option\s*)?([A-D])/i);
        const ansRaw = ansMatch ? ansMatch[1].toUpperCase() : "A";
        const correctAns = (["A", "B", "C", "D"].includes(ansRaw) ? ansRaw : "A") as "A" | "B" | "C" | "D";

        const isValid = Boolean(qText && optA && optB && optC && optD);
        questions.push({
          question_number: qNum,
          question_text: qText,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_answer: correctAns,
          isValid,
          errorReason: isValid ? undefined : "Missing question text or options"
        });
      }
    }

    if (questions.length > 0) return questions;
    return parseCSV(text);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) return;
      if (file.name.endsWith(".json")) setParsedPreview(parseJSON(content));
      else if (file.name.endsWith(".txt")) setParsedPreview(parseNaturalOrDelimitedText(content));
      else setParsedPreview(parseCSV(content));
    };
    reader.readAsText(file);
  }

  function handleTextParse() {
    if (!rawText.trim()) return toast.error("Please paste content to parse!");
    setParsedPreview(parseNaturalOrDelimitedText(rawText));
  }

  // ── 4. Batch Importer Execution ──
  async function executeBulkImport() {
    const validQuestions = parsedPreview.filter((q) => q.isValid);
    if (validQuestions.length === 0) return toast.error("No valid questions found to import!");

    if (overwriteExisting && questions.length > 0) {
      const ok = confirm(`Caution: This will replace all ${questions.length} existing questions in this paper with ${validQuestions.length} newly extracted questions. Proceed?`);
      if (!ok) return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const formattedPayloads = validQuestions.map((q, idx) => ({
      paper_id: parseInt(paperId),
      question_number: overwriteExisting ? idx + 1 : q.question_number,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
    }));

    try {
      const res = await fetch("/api/papers/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          paper_id: parseInt(paperId),
          overwrite: overwriteExisting,
          questions: formattedPayloads,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk import failed");

      setUploadProgress(100);

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

      toast.success(`Successfully imported ${data.count || formattedPayloads.length} questions into this paper!`);
      setParsedPreview([]);
      setRawText("");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setActiveTab("list");
      loadQuestions();
    } catch (err: any) {
      toast.error(err.message || "Bulk import failed");
    } finally {
      setIsUploading(false);
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
    <div className="space-y-6 text-slate-900" style={{ colorScheme: "light", color: "#0f172a" }}>
      {/* Top Breadcrumb & Paper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-3xl shadow-xs" style={{ color: "#0f172a" }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/admin/papers" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
              <ArrowLeft className="h-3 w-3" /> Back to PYQ Papers
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-800">{paper?.exams?.title || "Exam"}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ color: "#0f172a" }}>
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
          </div>
        </div>

        {/* Right Header Controls: Full Paper Translator Toggle & Tabs */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center flex-wrap">
          {/* Full Paper Exam Translator ON/OFF Switch Button */}
          {paper && (
            <button
              type="button"
              onClick={handleToggleTranslator}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isPaperTranslatorAllowed(paper)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={
                isPaperTranslatorAllowed(paper)
                  ? "Exam Translator is ON: Candidates can switch between Hindi and English during test. Click to disable."
                  : "Exam Translator is OFF: Candidates can only take test in English. Click to enable."
              }
            >
              <Globe className={`h-4 w-4 ${isPaperTranslatorAllowed(paper) ? "text-emerald-600" : "text-slate-400"}`} />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Exam Translator</span>
                <span className="font-extrabold flex items-center gap-1.5">
                  {isPaperTranslatorAllowed(paper) ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      <span>ON (Bilingual)</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />
                      <span>OFF (English Only)</span>
                    </>
                  )}
                </span>
              </div>
            </button>
          )}

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
          {/* Hindi Quality Control & View Density Switcher Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 via-white to-blue-50/40 p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left: View Mode Toggle & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* View Density Switcher */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewDensity("compact")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewDensity === "compact"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    title="Compact space-saving view: 75% less vertical space, inline options"
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    <span>Compact View</span>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-blue-500/30 text-white px-1.5 py-0.2 rounded-md">
                      Space-Saving
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewDensity("cards")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewDensity === "cards"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    title="Traditional spacious cards view"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cards View</span>
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      <b>{questions.filter((q) => lockedHindiIds.has(q.id)).length}</b> Confirmed (Protected)
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                    <Unlock className="h-3.5 w-3.5 text-amber-600" />
                    <span>
                      <b>{questions.filter((q) => !lockedHindiIds.has(q.id) && q.question_number <= 75).length}</b> Needs Translation
                    </span>
                  </span>
                </div>
              </div>

              {/* Right: Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBatchTranslateUnconfirmed}
                  disabled={batchTranslating || questions.filter((q) => !lockedHindiIds.has(q.id) && q.question_number <= 75).length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition-all"
                  title="Translate all unconfirmed questions into pure Hindi, completely skipping confirmed/locked ones"
                >
                  <Globe className={`h-3.5 w-3.5 text-blue-200 ${batchTranslating ? "animate-spin" : ""}`} />
                  <span>
                    {batchTranslating
                      ? "Translating..."
                      : `Batch Translate (${questions.filter((q) => !lockedHindiIds.has(q.id) && q.question_number <= 75).length} Qs)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={lockAllHindi}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title="Mark all questions as Hindi Confirmed (Locks all questions from auto-translation)"
                >
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Lock All</span>
                </button>

                <button
                  type="button"
                  onClick={unlockAllHindi}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title="Mark all questions as unconfirmed (Allows auto-translation on all questions)"
                >
                  <Unlock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Unlock All</span>
                </button>
              </div>
            </div>

            {/* Translation Progress Bar */}
            {batchTranslating && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    Auto-translating unconfirmed questions to pure Hindi...
                  </span>
                  <span>{translateProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${translateProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions by text or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openBulkForwardModal("math")}
                className="flex items-center gap-1.5 rounded-2xl border border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Verify and Forward questions from this PYQ paper directly into Question Bank"
              >
                <Share2 className="h-3.5 w-3.5 text-indigo-700" />
                <span>Forward to QB</span>
              </button>

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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-xs" style={{ color: "#0f172a" }}>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
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
                  <span className="text-[11px] text-slate-600 font-bold">Jump to Q:</span>
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
                    className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-900 text-center"
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
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
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed text-slate-700"
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
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed text-slate-700"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && questions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading paper questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs" style={{ color: "#0f172a" }}>
              <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="text-base font-bold text-slate-900">No questions populated in this paper yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Use the <b>4-in-1 Bulk Importer</b> to instantly extract all 100 questions from a PDF, or upload CSV / JSON!
              </p>
              <button
                onClick={() => setActiveTab("bulk")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Open 4-in-1 Bulk Importer</span>
              </button>
            </div>
          ) : viewDensity === "compact" ? (
            /* ── Space-Saving High Density Compact View (75% less vertical height) ── */
            <div className="space-y-2">
              {paginatedQuestions.map((q) => {
                const isLocked = lockedHindiIds.has(q.id);
                const isExpanded = expandedQIds.has(q.id);
                const isTranslatingThis = translatingQId === q.id;
                const isEnglishSection = q.question_number > 75;

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-400 transition-all shadow-2xs text-slate-900"
                    style={{ color: "#0f172a" }}
                  >
                    {/* Header Row: Q# | Hindi Confirmed On/Off | Ans Key | Action Buttons */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-800">
                          Q.{q.question_number}
                        </span>

                        {/* ON / OFF Hindi Confirmed Lock Button */}
                        {!isEnglishSection ? (
                          <button
                            type="button"
                            onClick={() => toggleHindiLock(q.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                              isLocked
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse"
                            }`}
                            title={
                              isLocked
                                ? "Hindi is CONFIRMED (Translator will skip this question). Click to turn OFF/unlock."
                                : "Hindi is NOT confirmed (Translator can work on it). Click to turn ON/lock."
                            }
                          >
                            {isLocked ? (
                              <>
                                <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>Hindi Confirmed [ON]</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 text-amber-600 shrink-0" />
                                <span>Needs Translation [OFF]</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            English Section (Pure English)
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Ans: Option {q.correct_answer}
                        </span>

                        {qbStatusMap[q.id]?.inQb && (
                          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                            <span>In QB: {qbStatusMap[q.id]?.topicTitle || "Saved"}</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Quick Translate + Forward to QB + Edit + Delete + Expand */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openForwardModal(q)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all shadow-2xs ${
                            qbStatusMap[q.id]?.inQb
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                          }`}
                          title="Forward this question to Question Bank (with Chapter selection)"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>{qbStatusMap[q.id]?.inQb ? "Re-Forward" : "Forward to QB"}</span>
                        </button>
                        {!isEnglishSection && !isLocked && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleQuestion(q)}
                            disabled={isTranslatingThis}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 cursor-pointer shadow-2xs"
                            title="Auto-translate only this question into clean Hindi"
                          >
                            <Globe className={`h-3 w-3 text-blue-600 ${isTranslatingThis ? "animate-spin" : ""}`} />
                            <span>{isTranslatingThis ? "..." : "Translate"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(q)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition-colors"
                          title="Edit question"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleExpandQ(q.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                          title={isExpanded ? "Collapse details" : "Expand details / explanation"}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div
                      className="mt-2 text-xs sm:text-sm font-bold text-slate-900 leading-snug cursor-pointer select-text"
                      onClick={() => toggleExpandQ(q.id)}
                      style={{ color: "#0f172a" }}
                    >
                      <MathText text={q.question_text} className="text-slate-900 font-bold" />
                    </div>

                    {/* Inline Space-Saving Options Flow (Takes ~28px height instead of ~150px) */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {[
                        { label: "A", val: q.option_a },
                        { label: "B", val: q.option_b },
                        { label: "C", val: q.option_c },
                        { label: "D", val: q.option_d },
                      ].map((opt) => {
                        const isCorrect = q.correct_answer === opt.label;
                        return (
                          <div
                            key={opt.label}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs border font-medium transition-all ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                            style={{ color: isCorrect ? "#064e3b" : "#0f172a" }}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-800"
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="leading-snug">
                              <MathText
                                text={opt.val}
                                className={isCorrect ? "text-emerald-950 font-bold" : "text-slate-900 font-medium"}
                              />
                            </span>
                            {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-0.5" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expandable Explanation Drawer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        {q.explanation ? (
                          <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-3 text-xs sm:text-sm text-slate-900" style={{ color: "#0f172a" }}>
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                              <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>Detailed Explanation / व्याख्या:</span>
                            </div>
                            <div className="leading-relaxed text-slate-900 font-medium" style={{ color: "#0f172a" }}>
                              <MathText text={q.explanation} className="text-slate-900" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic">No explanation recorded for this question.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Traditional Spacious Cards View ── */
            <div className="grid gap-3">
              {paginatedQuestions.map((q) => {
                const isLocked = lockedHindiIds.has(q.id);
                const isTranslatingThis = translatingQId === q.id;
                const isEnglishSection = q.question_number > 75;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all text-slate-900"
                    style={{ color: "#0f172a" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800">
                            Q.{q.question_number}
                          </span>

                          {/* ON / OFF Hindi Confirmed Lock Button */}
                          {!isEnglishSection ? (
                            <button
                              type="button"
                              onClick={() => toggleHindiLock(q.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                                isLocked
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse"
                              }`}
                              title={
                                isLocked
                                  ? "Hindi is CONFIRMED (Translator will skip this question). Click to turn OFF/unlock."
                                  : "Hindi is NOT confirmed (Translator can work on it). Click to turn ON/lock."
                              }
                            >
                              {isLocked ? (
                                <>
                                  <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>Hindi Confirmed [ON]</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-3 w-3 text-amber-600 shrink-0" />
                                  <span>Needs Translation [OFF]</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              English Section (Pure English)
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            Answer: Option {q.correct_answer}
                          </span>

                          {qbStatusMap[q.id]?.inQb && (
                            <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                              <span>In QB: {qbStatusMap[q.id]?.topicTitle || "Saved"}</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug" style={{ color: "#0f172a" }}>
                          <MathText text={q.question_text} className="text-slate-900 font-bold" />
                        </h4>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          {[
                            { label: "A", val: q.option_a },
                            { label: "B", val: q.option_b },
                            { label: "C", val: q.option_c },
                            { label: "D", val: q.option_d },
                          ].map((opt) => {
                            const isCorrect = q.correct_answer === opt.label;
                            return (
                              <div
                                key={opt.label}
                                className={`flex items-start gap-2.5 rounded-xl p-3 text-xs sm:text-sm font-semibold border ${
                                  isCorrect
                                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                                    : "bg-slate-50 border-slate-200 text-slate-900"
                                }`}
                                style={{ color: isCorrect ? "#064e3b" : "#0f172a" }}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                    isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-800"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <span className="flex-1 leading-relaxed" style={{ color: isCorrect ? "#064e3b" : "#0f172a" }}>
                                  <MathText text={opt.val} className={isCorrect ? "text-emerald-950 font-bold" : "text-slate-900 font-medium"} />
                                </span>
                                {isCorrect && <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-3 rounded-xl bg-amber-50/90 border border-amber-200 p-3.5 text-xs sm:text-sm text-slate-900" style={{ color: "#0f172a" }}>
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1.5">
                              <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>Detailed Explanation / व्याख्या:</span>
                            </div>
                            <div className="leading-relaxed text-slate-900 font-medium" style={{ color: "#0f172a" }}>
                              <MathText text={q.explanation} className="text-slate-900" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {!isEnglishSection && !isLocked && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleQuestion(q)}
                            disabled={isTranslatingThis}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 cursor-pointer shadow-2xs"
                            title="Auto-translate this question into Hindi"
                          >
                            <Globe className={`h-3.5 w-3.5 text-blue-600 ${isTranslatingThis ? "animate-spin" : ""}`} />
                            <span>{isTranslatingThis ? "Translating..." : "Translate"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openForwardModal(q)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all shadow-2xs ${
                            qbStatusMap[q.id]?.inQb
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                          }`}
                          title="Forward this question to Question Bank (with Chapter selection)"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>{qbStatusMap[q.id]?.inQb ? "Re-Forward" : "Forward to QB"}</span>
                        </button>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(q)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                            title="Edit question"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-xs mt-2" style={{ color: "#0f172a" }}>
              <span className="text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed text-slate-700"
                >
                  ← Previous Page
                </button>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-30 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed text-slate-700"
                >
                  Next Page →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SINGLE QUESTION FORM (ADD / EDIT) ── */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5 text-slate-900" style={{ color: "#0f172a" }}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900" style={{ color: "#0f172a" }}>
                {editingId ? "✏️ Edit Paper Question" : "➕ Add Single Question to Paper"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingId
                  ? "Update the question statement, option choices, or answer key. Changes sync instantly across PYQ Papers and Question Bank! ⚡"
                  : "Create and attach a new question to this shift paper."}
              </p>
            </div>
            {editingId && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                Editing Question #{qNum} (ID: {editingId})
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-28 shrink-0">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1" style={{ color: "#334155" }}>
                Q. Number
              </label>
              <input
                type="number"
                value={qNum}
                onChange={(e) => setQNum(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 p-3 text-sm font-bold text-center focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-bold uppercase text-slate-700" style={{ color: "#334155" }}>
                  Question Statement (English / Hindi)
                </label>
                <button
                  type="button"
                  onClick={handleAutoTranslateHindi}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Translate English statement and options into clean, standard Hindi (with math preserved)"
                >
                  <Globe className={`h-3.5 w-3.5 ${isTranslating ? "animate-spin" : ""}`} />
                  <span>{isTranslating ? "Translating..." : "🌐 Auto-Translate (English ➔ शुद्ध Hindi)"}</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Enter question text in English / Hindi (LaTeX $x^2$, \frac{a}{b} supported)..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center justify-between" style={{ color: "#334155" }}>
                <span>Option A</span>
                {correct === "A" && <span className="text-[11px] text-emerald-700 font-black">✓ Correct Key</span>}
              </label>
              <input
                type="text"
                placeholder="Option A text..."
                value={opA}
                onChange={(e) => setOpA(e.target.value)}
                className={`w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:outline-none focus:ring-2 ${
                  correct === "A" ? "border-emerald-500 ring-1 ring-emerald-300" : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center justify-between" style={{ color: "#334155" }}>
                <span>Option B</span>
                {correct === "B" && <span className="text-[11px] text-emerald-700 font-black">✓ Correct Key</span>}
              </label>
              <input
                type="text"
                placeholder="Option B text..."
                value={opB}
                onChange={(e) => setOpB(e.target.value)}
                className={`w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:outline-none focus:ring-2 ${
                  correct === "B" ? "border-emerald-500 ring-1 ring-emerald-300" : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center justify-between" style={{ color: "#334155" }}>
                <span>Option C</span>
                {correct === "C" && <span className="text-[11px] text-emerald-700 font-black">✓ Correct Key</span>}
              </label>
              <input
                type="text"
                placeholder="Option C text..."
                value={opC}
                onChange={(e) => setOpC(e.target.value)}
                className={`w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:outline-none focus:ring-2 ${
                  correct === "C" ? "border-emerald-500 ring-1 ring-emerald-300" : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center justify-between" style={{ color: "#334155" }}>
                <span>Option D</span>
                {correct === "D" && <span className="text-[11px] text-emerald-700 font-black">✓ Correct Key</span>}
              </label>
              <input
                type="text"
                placeholder="Option D text..."
                value={opD}
                onChange={(e) => setOpD(e.target.value)}
                className={`w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:outline-none focus:ring-2 ${
                  correct === "D" ? "border-emerald-500 ring-1 ring-emerald-300" : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5" style={{ color: "#334155" }}>
              Correct Answer Key (Select Option)
            </label>
            <div className="flex gap-2 max-w-md">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrect(opt)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-black border transition-all cursor-pointer ${
                    correct === opt
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1" style={{ color: "#334155" }}>
              Detailed Explanation / Solution (व्याख्या) - Optional
            </label>
            <textarea
              rows={3}
              placeholder="Enter comprehensive solution, formulas used, shortcut tricks, or background facts (LaTeX $x^2$ supported)..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-3 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: Supports LaTeX math like $x^2 + y^2 = r^2$ and Hindi text. This explanation is shown to candidates in test review and solution sheets.
            </p>
          </div>

          {/* Live Preview Box */}
          {(qText || opA || opB) && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 mt-2" style={{ color: "#0f172a" }}>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-blue-900 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Live Preview / लाइव पूर्वावलोकन (Q.{qNum}):</span>
              </div>
              <div className="text-sm font-bold text-slate-900 leading-snug mb-3" style={{ color: "#0f172a" }}>
                <MathText text={qText || "Your question statement..."} className="text-slate-900 font-bold" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A", val: opA },
                  { label: "B", val: opB },
                  { label: "C", val: opC },
                  { label: "D", val: opD },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      correct === opt.label
                        ? "bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                    style={{ color: correct === opt.label ? "#064e3b" : "#0f172a" }}
                  >
                    <span className="font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 shrink-0">
                      {opt.label}
                    </span>
                    <span className="flex-1">
                      <MathText text={opt.val || "(empty)"} className="text-slate-900 font-medium" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : editingId ? "Update Question" : "Save Question to Paper"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("list");
              }}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer"
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
              <span>1. TXT File & Raw Text Importer (Primary)</span>
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
              <span>2. JSON Importer</span>
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
              <span>3. CSV / Excel Upload</span>
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
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1" style={{ color: "#334155" }}>
                    Or Paste JSON Array Directly:
                  </label>
                  <textarea
                    rows={4}
                    placeholder='[{"question_number": 1, "question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A"}]'
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-3 text-xs font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                  />
                  <button
                    onClick={handleTextParse}
                    className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Parse JSON Text
                  </button>
                </div>
              </div>
            )}

            {/* 1. TEXT TAB (PRIMARY) */}
            {importerTab === "text" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div>
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider">
                      📄 Upload .TXT Questions File (Zero PDF Glitches)
                    </h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Directly import questions from your exported <code>.txt</code> file or paste clean formatted text below.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-black text-white shadow-xs cursor-pointer transition-colors shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Upload .txt File</span>
                    <input
                      type="file"
                      accept=".txt,.text"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-700" style={{ color: "#334155" }}>
                      Or Paste Text Below:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Supports standard format (<code>Q1. ... A) ... B) ... Ans: A</code>) or pipe format (<code>1||Question||A||B||C||D||A</code>)
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    placeholder={`Q1. What is the unit of power?\nA) Joule\nB) Watt\nC) Newton\nD) Pascal\nCorrect Answer: Option B\n\nQ2. Who invented bulb?\nA) Edison\nB) Tesla\nC) Newton\nD) Einstein\nCorrect Answer: Option A`}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-3.5 text-xs font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTextParse}
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                    >
                      Parse Text Lines
                    </button>
                    {rawText && (
                      <button
                        onClick={() => setRawText("")}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
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
                          ? "bg-white border-slate-200 text-slate-900"
                          : "bg-red-50/60 border-red-200 text-red-900"
                      }`}
                      style={{ color: q.isValid ? "#0f172a" : "#7f1d1d" }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900">
                          Q.{q.question_number}
                        </span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Ans: {q.correct_answer}
                        </span>
                      </div>
                      <p className="text-slate-800 line-clamp-1 font-medium">{q.question_text}</p>
                      <div className="mt-1 flex gap-3 text-[11px] text-slate-600 font-semibold">
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

      {/* ── MODAL 1: SINGLE QUESTION FORWARD TO QUESTION BANK ── */}
      {forwardModalQ && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-indigo-200 px-2.5 py-0.5 rounded-full mb-1">
                  <Share2 className="h-3 w-3 text-indigo-300" />
                  Forward to Question Bank
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Forward Question #{forwardModalQ.question_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForwardModalQ(null)}
                className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-900" style={{ color: "#0f172a" }}>
              {/* Question Statement Preview */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Question Statement:
                </span>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  <MathText text={forwardModalQ.question_text} className="text-slate-900 font-bold" />
                </div>

                {/* Options Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                  {[
                    { label: "A", val: forwardModalQ.option_a },
                    { label: "B", val: forwardModalQ.option_b },
                    { label: "C", val: forwardModalQ.option_c },
                    { label: "D", val: forwardModalQ.option_d },
                  ].map((opt) => {
                    const isCorrect = forwardModalQ.correct_answer === opt.label;
                    return (
                      <div
                        key={opt.label}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="truncate">
                          <MathText text={opt.val} />
                        </span>
                        {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Target Subject:
                  </label>
                  <select
                    value={forwardSubjectId}
                    onChange={(e) => {
                      const sid = Number(e.target.value);
                      setForwardSubjectId(sid);
                      const matching = allTopics.filter((t) => t.subject_id === sid);
                      if (matching.length > 0) {
                        if (sid === 1) {
                          setForwardTopicId(classifyMathQuestion(forwardModalQ.question_text));
                        } else {
                          setForwardTopicId(matching[0].id);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {allSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter / Topic Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      2. Target Chapter:
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      Auto-Suggested
                    </span>
                  </div>
                  <select
                    value={forwardTopicId}
                    onChange={(e) => setForwardTopicId(Number(e.target.value))}
                    className="w-full rounded-xl border border-indigo-300 bg-indigo-50/40 px-3 py-2 text-xs font-bold text-indigo-950 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {currentSubjectTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Tag */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Exam Reference Tag:
                  </label>
                  <input
                    type="text"
                    value={forwardExamTag}
                    onChange={(e) => setForwardExamTag(e.target.value)}
                    placeholder="e.g. SSC CGL 2024 Tier 1"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Difficulty Level:
                  </label>
                  <select
                    value={forwardDifficulty}
                    onChange={(e) => setForwardDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="easy">Easy (सरल)</option>
                    <option value="medium">Medium (मध्यम)</option>
                    <option value="hard">Hard (कठिन)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setForwardModalQ(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSingleForward}
                disabled={isForwardingSingle}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                <span>{isForwardingSingle ? "Forwarding..." : "Confirm & Forward to QB"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: BULK FORWARD QUESTIONS TO QUESTION BANK ── */}
      {showBulkForwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-indigo-200 px-2.5 py-0.5 rounded-full mb-1">
                  <Share2 className="h-3 w-3 text-indigo-300" />
                  Bulk Question Forward Studio
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Bulk Forward Questions to Question Bank
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Verify questions and auto-suggested chapters, adjust if needed, and forward to Question Bank in one batch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkForwardModal(false)}
                className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section Filter Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleBulkSectionChange("math")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bulkForwardSection === "math"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  📐 Quant / Maths (51–75)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSectionChange("reasoning")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bulkForwardSection === "reasoning"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🧩 Reasoning (1–25)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSectionChange("ga")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bulkForwardSection === "ga"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🌍 GA / GK (26–50)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSectionChange("english")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bulkForwardSection === "english"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  📖 English (76–100)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSectionChange("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bulkForwardSection === "all"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  📋 All (1–100)
                </button>
              </div>

              {/* Selection Summary & Quick Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Selected: <b className="text-indigo-700">{selectedForwardQIds.size}</b> Qs
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const secQs = questions.filter((q, idx) => {
                      const qNo = q.question_number || idx + 1;
                      if (bulkForwardSection === "math") return qNo >= 51 && qNo <= 75;
                      if (bulkForwardSection === "reasoning") return qNo >= 1 && qNo <= 25;
                      if (bulkForwardSection === "ga") return qNo >= 26 && qNo <= 50;
                      if (bulkForwardSection === "english") return qNo >= 76 && qNo <= 100;
                      return true;
                    });
                    setSelectedForwardQIds(new Set(secQs.map((q) => q.id)));
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedForwardQIds(new Set())}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
              {(() => {
                const secQs = questions.filter((q, idx) => {
                  const qNo = q.question_number || idx + 1;
                  if (bulkForwardSection === "math") return qNo >= 51 && qNo <= 75;
                  if (bulkForwardSection === "reasoning") return qNo >= 1 && qNo <= 25;
                  if (bulkForwardSection === "ga") return qNo >= 26 && qNo <= 50;
                  if (bulkForwardSection === "english") return qNo >= 76 && qNo <= 100;
                  return true;
                });

                if (secQs.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">
                      No questions in this section.
                    </div>
                  );
                }

                return secQs.map((q) => {
                  const isChecked = selectedForwardQIds.has(q.id);
                  const asg = bulkForwardAssignments[q.id] || getSuggestedSubjectAndTopic(q);
                  const qSubjectTopics = allTopics.filter((t) => t.subject_id === asg.subjectId);
                  const isAlreadyInQb = qbStatusMap[q.id]?.inQb;

                  return (
                    <div
                      key={q.id}
                      className={`pt-2.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        isChecked
                          ? "bg-indigo-50/30 border-indigo-200"
                          : "bg-white border-slate-200 opacity-60"
                      }`}
                    >
                      {/* Left: Checkbox + Q# + Question Snippet */}
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedForwardQIds);
                            if (e.target.checked) next.add(q.id);
                            else next.delete(q.id);
                            setSelectedForwardQIds(next);
                          }}
                          className="h-4 w-4 rounded text-indigo-600 mt-1 cursor-pointer shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-black">
                              Q.{q.question_number}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              Ans: {q.correct_answer}
                            </span>
                            {isAlreadyInQb && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                                <span>In QB: {qbStatusMap[q.id]?.topicTitle}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 font-medium line-clamp-2 select-text">
                            {q.question_text}
                          </p>
                        </div>
                      </div>

                      {/* Right: Topic Dropdown */}
                      <div className="shrink-0 w-full sm:w-64">
                        <label className="block text-[10px] font-black uppercase text-indigo-900 tracking-wider mb-1">
                          Assign Chapter / Topic:
                        </label>
                        <select
                          value={asg.topicId}
                          onChange={(e) => {
                            const newTid = Number(e.target.value);
                            setBulkForwardAssignments((prev) => ({
                              ...prev,
                              [q.id]: { ...asg, topicId: newTid },
                            }));
                          }}
                          className="w-full rounded-xl border border-indigo-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          {qSubjectTopics.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-600 font-medium">
                Ready to forward <b>{selectedForwardQIds.size}</b> verified question(s) to Question Bank.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkForwardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeBulkForward}
                  disabled={isForwardingBulk || selectedForwardQIds.size === 0}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="h-4 w-4" />
                  <span>
                    {isForwardingBulk
                      ? `Forwarding (${bulkForwardProgress}%)...`
                      : `Forward ${selectedForwardQIds.size} Questions Now`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
