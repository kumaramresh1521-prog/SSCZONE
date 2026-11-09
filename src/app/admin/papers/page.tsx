"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  Download,
  Globe,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Layers,
  Filter,
  Check,
  AlertCircle,
  X,
  FileCheck
} from "lucide-react";
import { 
  getPaperPdfUrl, 
  uploadPaperPdf, 
  isPaperDownloadAllowed, 
  setPaperDownloadAllowed, 
  isPaperTranslatorAllowed, 
  setPaperTranslatorAllowed 
} from "@/lib/paper-pdf-store";

// Helper to normalize and extract metadata from paper
function parsePaperMeta(p: any) {
  const title: string = p.title || "";
  const lower = title.toLowerCase();

  // Tier detection
  let tier = "Tier-I";
  if (lower.includes("tier-ii") || lower.includes("tier 2") || lower.includes("tier-2") || lower.includes("mains")) {
    tier = "Tier-II";
  } else if (lower.includes("tier-i") || lower.includes("tier 1") || lower.includes("tier-1") || lower.includes("prelims")) {
    tier = "Tier-I";
  }

  // Shift name extraction
  let shift = title;
  const match = title.match(/\((?:Held On\s*)?([^)]+)\)/i);
  if (match) {
    shift = match[1].replace(/^Held On\s*/i, "").trim();
  } else {
    shift = title.replace(/^SSC\s+[A-Za-z0-9\s]+\d{4}\s+(Tier-[I|V]+|\w+)\s*/i, "").trim() || title;
  }

  const examTitle = (p.exams?.title || "SSC CGL").toUpperCase().trim();
  const year = Number(p.year) || (title.includes("2026") ? 2026 : 2025);
  const folderKey = `${examTitle}__${year}__${tier}`;

  return {
    examTitle,
    year,
    tier,
    shift,
    folderKey
  };
}

// Client-side parser for questions in standard SSC format or JSON
function parseRawQuestionsText(text: string) {
  if (!text || !text.trim()) return [];

  // 1. JSON Array format
  if (text.trim().startsWith("[")) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map((item: any, idx: number) => {
          const qNo = item.question_number || idx + 1;
          const qText = item.question_text || item.question || "";
          const opA = item.option_a || item.optionA || item.a || "";
          const opB = item.option_b || item.optionB || item.b || "";
          const opC = item.option_c || item.optionC || item.c || "";
          const opD = item.option_d || item.optionD || item.d || "";
          const ansRaw = (item.correct_answer || item.answer || "A").toUpperCase().trim().slice(0, 1);
          const correctAns = ["A", "B", "C", "D"].includes(ansRaw) ? (ansRaw as "A" | "B" | "C" | "D") : "A";
          const explanation = item.explanation || "";

          const isValid = Boolean(qText && opA && opB && opC && opD);
          return {
            question_number: qNo,
            question_text: qText,
            option_a: opA,
            option_b: opB,
            option_c: opC,
            option_d: opD,
            correct_answer: correctAns,
            explanation,
            isValid
          };
        });
      }
    } catch {}
  }

  // 2. Standard SSC Natural Text Format
  const questions: any[] = [];
  const qBlocks = text.split(/(?:^|\n)(?:Q\s*(\d+)[\.\:]|(\d+)[\.\:])\s*/i);

  if (qBlocks.length > 1) {
    for (let i = 1; i < qBlocks.length; i += 3) {
      const qNumStr = qBlocks[i] || qBlocks[i + 1] || `${questions.length + 1}`;
      const qNum = parseInt(qNumStr) || (questions.length + 1);
      const block = qBlocks[i + 2] || "";

      const optA = block.match(/(?:^|\n)\s*(?:\(?[A|a]\)?|\(?[A|a]\.|\(?[A|a]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[B-Db-d]\)?|\(?[B-Db-d]\.|\(?[B-Db-d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
      const optB = block.match(/(?:^|\n)\s*(?:\(?[B|b]\)?|\(?[B|b]\.|\(?[B|b]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[C-Dc-d]\)?|\(?[C-Dc-d]\.|\(?[C-Dc-d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
      const optC = block.match(/(?:^|\n)\s*(?:\(?[C|c]\)?|\(?[C|c]\.|\(?[C|c]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[D|d]\)?|\(?[D|d]\.|\(?[D|d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || "";
      const optD = block.match(/(?:^|\n)\s*(?:\(?[D|d]\)?|\(?[D|d]\.|\(?[D|d]\))\s*([\s\S]*?)(?=(?:\n\s*Correct Answer|\n\s*Ans|\n\s*Explanation|\n\s*---|\n*$))/i)?.[1]?.trim() || "";

      const qTextMatch = block.split(/(?:^|\n)\s*(?:\(?[A|a]\)?|\(?[A|a]\.|\(?[A|a]\))\s*/i)[0];
      const qText = qTextMatch ? qTextMatch.trim() : "";

      const ansMatch = block.match(/(?:Correct Answer|Ans(?:wer)?)\s*[:\-]\s*(?:Option\s*)?\(?([A-D|a-d])\)?/i);
      const ansRaw = ansMatch ? ansMatch[1].toUpperCase() : "A";
      const correctAns = ["A", "B", "C", "D"].includes(ansRaw) ? (ansRaw as "A" | "B" | "C" | "D") : "A";

      const expMatch = block.match(/(?:Explanation|Solution)\s*[:\-]\s*([\s\S]*?)(?=(?:\n\s*---|(?:\n\s*(?:Q\s*\d+|\d+)[\.\:])|$))/i);
      const explanation = expMatch ? expMatch[1].trim() : "";

      const isValid = Boolean(qText && optA && optB && optC && optD);

      questions.push({
        question_number: qNum,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_answer: correctAns,
        explanation,
        isValid
      });
    }
  }

  return questions;
}

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Navigation
  const [viewMode, setViewMode] = useState<"folders" | "flat">("folders");
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExam, setFilterExam] = useState<number>(0);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");

  // ─────────────────────────────────────────────────────────────
  // MODAL 1: Create / Edit Shift Paper Modal State
  // ─────────────────────────────────────────────────────────────
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [paperModalExamId, setPaperModalExamId] = useState<number>(1);
  const [paperModalYear, setPaperModalYear] = useState<string>("2025");
  const [paperModalTier, setPaperModalTier] = useState<string>("Tier-I");
  const [paperModalShiftName, setPaperModalShiftName] = useState<string>("");
  const [paperModalTitle, setPaperModalTitle] = useState<string>("");
  const [paperModalTotalQ, setPaperModalTotalQ] = useState<string>("100");
  const [paperModalDuration, setPaperModalDuration] = useState<string>("60");
  const [paperModalPdfUrl, setPaperModalPdfUrl] = useState<string>("");
  const [paperModalAllowDownload, setPaperModalAllowDownload] = useState<boolean>(true);
  const [editingPaperId, setEditingPaperId] = useState<number | null>(null);
  const [savingPaper, setSavingPaper] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // MODAL 2: Create Single Question Modal State (with Dropdowns)
  // ─────────────────────────────────────────────────────────────
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qExamId, setQExamId] = useState<number>(1);
  const [qYear, setQYear] = useState<string>("2025");
  const [qTier, setQTier] = useState<string>("Tier-I");
  const [qPaperId, setQPaperId] = useState<number | "new">("new");
  const [qNewShiftName, setQNewShiftName] = useState<string>("");
  const [qNumber, setQNumber] = useState<number>(1);
  const [qText, setQText] = useState<string>("");
  const [qOptionA, setQOptionA] = useState<string>("");
  const [qOptionB, setQOptionB] = useState<string>("");
  const [qOptionC, setQOptionC] = useState<string>("");
  const [qOptionD, setQOptionD] = useState<string>("");
  const [qCorrectAnswer, setQCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplanation, setQExplanation] = useState<string>("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // MODAL 3: Bulk Upload PYQ Questions Modal (with Dropdowns)
  // ─────────────────────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkExamId, setBulkExamId] = useState<number>(1);
  const [bulkYear, setBulkYear] = useState<string>("2026");
  const [bulkTier, setBulkTier] = useState<string>("Tier-I");
  const [bulkPaperId, setBulkPaperId] = useState<number | "new">("new");
  const [bulkNewShiftName, setBulkNewShiftName] = useState<string>("");
  const [bulkRawText, setBulkRawText] = useState<string>("");
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<any[]>([]);
  const [bulkOverwrite, setBulkOverwrite] = useState<boolean>(true);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load with sessionStorage cache for instant render
  useEffect(() => {
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
    } catch {}

    loadData();
  }, []);

  async function loadData() {
    try {
      const [papersRes, examsRes, settingsRes] = await Promise.all([
        supabase
          .from("previous_papers")
          .select("*, exams(title), paper_questions(count)")
          .order("id", { ascending: true }),
        supabase.from("exams").select("id, title").order("id", { ascending: true }),
        fetch(`/api/papers/settings?t=${Date.now()}`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({}))
      ]);

      if (papersRes.error) {
        toast.error("Failed to load papers: " + papersRes.error.message);
      } else {
        const enriched = (papersRes.data ?? []).map((p: any) => {
          const setting = settingsRes?.[String(p.id)];
          const allowed = setting?.allow_download !== undefined 
            ? Boolean(setting.allow_download) 
            : (p.test_type !== "mock" && p.allow_download !== false);
          
          let allowTrans = true;
          if (setting?.allow_translation !== undefined) {
            allowTrans = Boolean(setting.allow_translation);
          } else if (p.allow_translation !== undefined) {
            allowTrans = Boolean(p.allow_translation);
          } else if (String(p.year) === "2026" || (p.title && p.title.includes("2026"))) {
            allowTrans = false;
          }

          return {
            ...p,
            allow_download: allowed,
            allow_translation: allowTrans,
            test_type: allowed ? "pyq" : "mock"
          };
        });

        setPapers(enriched);
        if (examsRes.data) {
          setExams(examsRes.data);
          if (examsRes.data.length > 0 && !paperModalExamId) {
            setPaperModalExamId(examsRes.data[0].id);
            setQExamId(examsRes.data[0].id);
            setBulkExamId(examsRes.data[0].id);
          }
        }

        try {
          sessionStorage.setItem("ssczone_admin_papers_cache", JSON.stringify({
            papers: enriched,
            exams: examsRes.data ?? []
          }));
        } catch {}
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching papers");
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FOLDER GROUPING LOGIC (Exam > Year > Tier)
  // ─────────────────────────────────────────────────────────────
  const foldersMap = useMemo(() => {
    const map = new Map<string, {
      key: string;
      examId: number;
      examTitle: string;
      year: number;
      tier: string;
      papers: any[];
      totalQuestions: number;
    }>();

    papers.forEach((p) => {
      const meta = parsePaperMeta(p);
      const qCount = p.paper_questions?.[0]?.count ?? 0;

      if (!map.has(meta.folderKey)) {
        map.set(meta.folderKey, {
          key: meta.folderKey,
          examId: p.exam_id,
          examTitle: meta.examTitle,
          year: meta.year,
          tier: meta.tier,
          papers: [],
          totalQuestions: 0
        });
      }

      const folder = map.get(meta.folderKey)!;
      folder.papers.push({
        ...p,
        meta
      });
      folder.totalQuestions += qCount;
    });

    return map;
  }, [papers]);

  const allFolders = useMemo(() => {
    return Array.from(foldersMap.values()).sort((a, b) => {
      // Most recent year (e.g. 2026) always on top
      if (b.year !== a.year) return b.year - a.year;
      if (a.examTitle !== b.examTitle) return a.examTitle.localeCompare(b.examTitle);
      return a.tier.localeCompare(b.tier);
    });
  }, [foldersMap]);

  // Filtered Folders based on dropdown filters & search
  const filteredFolders = useMemo(() => {
    return allFolders.filter((f) => {
      const matchExam = filterExam === 0 || f.examId === filterExam;
      const matchYear = filterYear === "all" || String(f.year) === filterYear;
      const matchTier = filterTier === "all" || f.tier === filterTier;
      const matchSearch =
        searchTerm === "" ||
        f.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.year).includes(searchTerm) ||
        f.tier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.papers.some((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchExam && matchYear && matchTier && matchSearch;
    });
  }, [allFolders, filterExam, filterYear, filterTier, searchTerm]);

  // Currently selected folder
  const currentFolder = useMemo(() => {
    if (!selectedFolderKey) return null;
    return foldersMap.get(selectedFolderKey) || null;
  }, [foldersMap, selectedFolderKey]);

  // Filtered Flat Papers List
  const filteredFlatPapers = useMemo(() => {
    return papers.filter((p) => {
      const meta = parsePaperMeta(p);
      const matchExam = filterExam === 0 || p.exam_id === filterExam;
      const matchYear = filterYear === "all" || String(p.year) === filterYear;
      const matchTier = filterTier === "all" || meta.tier === filterTier;
      const matchSearch =
        searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.year).includes(searchTerm) ||
        (p.exams?.title && p.exams.title.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchExam && matchYear && matchTier && matchSearch;
    });
  }, [papers, filterExam, filterYear, filterTier, searchTerm]);

  // Helper list of distinct years for filter
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => {
      if (p.year) set.add(String(p.year));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [papers]);

  // Total summary metrics
  const totalQuestionsSum = useMemo(() => {
    return papers.reduce((acc, p) => acc + (p.paper_questions?.[0]?.count ?? 0), 0);
  }, [papers]);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: Create / Edit Paper
  // ─────────────────────────────────────────────────────────────
  function openNewPaperModal(initialExamId?: number, initialYear?: string, initialTier?: string) {
    setEditingPaperId(null);
    setPaperModalExamId(initialExamId || exams[0]?.id || 1);
    setPaperModalYear(initialYear || "2025");
    setPaperModalTier(initialTier || "Tier-I");
    setPaperModalShiftName("");
    setPaperModalTitle("");
    setPaperModalTotalQ("100");
    setPaperModalDuration("60");
    setPaperModalPdfUrl("");
    setPaperModalAllowDownload(true);
    setShowPaperModal(true);
  }

  function openEditPaperModal(p: any) {
    const meta = parsePaperMeta(p);
    setEditingPaperId(p.id);
    setPaperModalExamId(p.exam_id);
    setPaperModalYear(String(p.year || 2025));
    setPaperModalTier(meta.tier);
    setPaperModalShiftName(meta.shift);
    setPaperModalTitle(p.title);
    setPaperModalTotalQ(String(p.total_questions || 100));
    setPaperModalDuration(String(p.duration_minutes || 60));
    setPaperModalPdfUrl(p.pdf_url || getPaperPdfUrl(p) || "");
    setPaperModalAllowDownload(isPaperDownloadAllowed(p));
    setShowPaperModal(true);
  }

  async function handleSavePaper(e: React.FormEvent) {
    e.preventDefault();
    if (!paperModalExamId) { toast.error("Select target exam"); return; }
    
    const examObj = exams.find((x) => x.id === paperModalExamId);
    const examName = examObj?.title?.toUpperCase() || "SSC CGL";
    
    // Validate shift name
    if (!paperModalShiftName.trim() && !paperModalTitle.trim()) {
      toast.error("Please enter a Shift Name or Exam Date (e.g. 19 September 2025 Shift 1)");
      return;
    }

    // Auto-generate title if shift name is given and not editing
    let computedTitle = paperModalTitle.trim();
    if (!computedTitle) {
      const shiftStr = paperModalShiftName.trim();
      computedTitle = `${examName} ${paperModalYear} ${paperModalTier} (Held On ${shiftStr})`;
    }

    setSavingPaper(true);
    try {
      const res = await fetch("/api/admin/papers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPaperId,
          title: computedTitle,
          exam_id: paperModalExamId,
          year: parseInt(paperModalYear) || 2025,
          total_questions: parseInt(paperModalTotalQ) || 100,
          duration_minutes: parseInt(paperModalDuration) || 60,
          pdf_url: paperModalPdfUrl.trim() || null,
          allow_download: paperModalAllowDownload
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save paper");

      toast.success(editingPaperId ? "PYQ Paper updated successfully!" : "New PYQ Paper created successfully!");
      setShowPaperModal(false);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save paper: " + err.message);
    } finally {
      setSavingPaper(false);
    }
  }

  async function handleDeletePaper(id: number, paperTitle: string) {
    if (!confirm(`Are you sure you want to delete paper "${paperTitle}" and all its questions?`)) return;
    const { error } = await supabase.from("previous_papers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Paper deleted from Supabase!");
    await loadData();
  }

  async function handleToggleDownload(paper: any) {
    const current = isPaperDownloadAllowed(paper);
    const next = !current;
    setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, allow_download: next, test_type: next ? "pyq" : "mock" } : p)));
    await setPaperDownloadAllowed(paper.id, next);
    toast.success(next ? `Download enabled on "${paper.title}"` : `Download disabled on "${paper.title}"`);
  }

  async function handleToggleTranslator(paper: any) {
    const current = isPaperTranslatorAllowed(paper);
    const next = !current;
    await setPaperTranslatorAllowed(paper.id, next);
    setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, allow_translation: next } : p)));
    toast.success(next ? `Translator enabled for "${paper.title}"` : `Translator disabled for "${paper.title}"`);
  }

  async function handleToggleFolderTranslators(folder: any) {
    const allCurrentlyOff = folder.papers.every((p: any) => !isPaperTranslatorAllowed(p));
    const targetState = allCurrentlyOff;
    const targetLabel = targetState ? "enabled" : "disabled";

    const tid = toast.loading(`Setting translator ${targetLabel} for all papers in folder...`);
    try {
      await Promise.all(
        folder.papers.map((p: any) => setPaperTranslatorAllowed(p.id, targetState))
      );
      setPapers((prev) =>
        prev.map((p) => {
          const inFolder = folder.papers.some((fp: any) => fp.id === p.id);
          return inFolder ? { ...p, allow_translation: targetState } : p;
        })
      );
      toast.success(`Translator ${targetLabel} for all ${folder.papers.length} papers!`, { id: tid });
    } catch (err: any) {
      toast.error(`Error updating translators: ${err?.message || "Unknown error"}`, { id: tid });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: Create Question (with Dropdowns)
  // ─────────────────────────────────────────────────────────────
  function openQuestionCreator(preset?: { examId?: number; year?: string; tier?: string; paperId?: number }) {
    if (preset?.examId) setQExamId(preset.examId);
    else if (exams.length > 0) setQExamId(exams[0].id);

    if (preset?.year) setQYear(preset.year);
    if (preset?.tier) setQTier(preset.tier);
    if (preset?.paperId) {
      setQPaperId(preset.paperId);
      // Auto-calculate next question number
      const targetPaper = papers.find((p) => p.id === preset.paperId);
      const curCount = targetPaper?.paper_questions?.[0]?.count ?? 0;
      setQNumber(curCount + 1);
    } else {
      setQPaperId("new");
      setQNumber(1);
    }

    setQNewShiftName("");
    setQText("");
    setQOptionA("");
    setQOptionB("");
    setQOptionC("");
    setQOptionD("");
    setQCorrectAnswer("A");
    setQExplanation("");
    setShowQuestionModal(true);
  }

  // Papers that match current Question modal dropdowns (Exam, Year, Tier)
  const qAvailablePapers = useMemo(() => {
    return papers.filter((p) => {
      const meta = parsePaperMeta(p);
      return p.exam_id === qExamId && String(p.year) === String(qYear) && meta.tier === qTier;
    });
  }, [papers, qExamId, qYear, qTier]);

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qText.trim()) { toast.error("Question text is required"); return; }
    if (!qOptionA.trim() || !qOptionB.trim() || !qOptionC.trim() || !qOptionD.trim()) {
      toast.error("All 4 options (A, B, C, D) are required");
      return;
    }

    setSavingQuestion(true);
    try {
      let targetPaperId: number;

      // 1. If "new" shift paper requested, create it first in Supabase
      if (qPaperId === "new") {
        const examObj = exams.find((x) => x.id === qExamId);
        const examName = examObj?.title?.toUpperCase() || "SSC CGL";
        const shiftStr = qNewShiftName.trim() || "Shift 1";
        const newTitle = `${examName} ${qYear} ${qTier} (Held On ${shiftStr})`;

        const pRes = await fetch("/api/admin/papers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            exam_id: qExamId,
            year: parseInt(qYear) || 2025,
            total_questions: 100,
            duration_minutes: 60,
            allow_download: true
          })
        });
        const pJson = await pRes.json();
        if (!pRes.ok) throw new Error(pJson.error || "Failed to create shift paper");
        targetPaperId = pJson.paper?.id;
        if (!targetPaperId) throw new Error("Paper ID missing after creation");
      } else {
        targetPaperId = Number(qPaperId);
      }

      // 2. Insert Question into Supabase via paper-questions API
      const qRes = await fetch("/api/admin/paper-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_id: targetPaperId,
          question_number: qNumber,
          question_text: qText.trim(),
          option_a: qOptionA.trim(),
          option_b: qOptionB.trim(),
          option_c: qOptionC.trim(),
          option_d: qOptionD.trim(),
          correct_answer: qCorrectAnswer,
          explanation: qExplanation.trim() || null
        })
      });

      const qJson = await qRes.json();
      if (!qRes.ok) throw new Error(qJson.error || "Failed to save question to Supabase");

      toast.success(`Question #${qNumber} saved to Supabase successfully!`);
      
      // Keep modal open, increment question number, clear text fields for rapid next question entry
      setQNumber((prev) => prev + 1);
      setQText("");
      setQOptionA("");
      setQOptionB("");
      setQOptionC("");
      setQOptionD("");
      setQExplanation("");
      setQPaperId(targetPaperId); // Lock to the created/selected paper

      await loadData();
    } catch (err: any) {
      toast.error("Error saving question: " + err.message);
    } finally {
      setSavingQuestion(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: Bulk Upload PYQ Questions (with Dropdowns)
  // ─────────────────────────────────────────────────────────────
  function openBulkUploader(preset?: { examId?: number; year?: string; tier?: string; paperId?: number }) {
    if (preset?.examId) setBulkExamId(preset.examId);
    else if (exams.length > 0) setBulkExamId(exams[0].id);

    if (preset?.year) setBulkYear(preset.year);
    if (preset?.tier) setBulkTier(preset.tier);
    if (preset?.paperId) setBulkPaperId(preset.paperId);
    else setBulkPaperId("new");

    setBulkNewShiftName("");
    setBulkRawText("");
    setBulkParsedQuestions([]);
    setBulkOverwrite(true);
    setShowBulkModal(true);
  }

  const bulkAvailablePapers = useMemo(() => {
    return papers.filter((p) => {
      const meta = parsePaperMeta(p);
      return p.exam_id === bulkExamId && String(p.year) === String(bulkYear) && meta.tier === bulkTier;
    });
  }, [papers, bulkExamId, bulkYear, bulkTier]);

  function handleBulkTextChange(val: string) {
    setBulkRawText(val);
    const parsed = parseRawQuestionsText(val);
    setBulkParsedQuestions(parsed);
  }

  function handleBulkFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleBulkTextChange(content);
        toast.success(`Loaded "${file.name}"!`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  }

  async function handleExecuteBulkUpload() {
    if (bulkParsedQuestions.length === 0) {
      toast.error("No valid questions found to upload. Paste questions or load a file.");
      return;
    }

    const invalidCount = bulkParsedQuestions.filter((q) => !q.isValid).length;
    if (invalidCount > 0) {
      if (!confirm(`Warning: ${invalidCount} questions are incomplete. Upload valid ${bulkParsedQuestions.length - invalidCount} questions anyway?`)) {
        return;
      }
    }

    const validQuestions = bulkParsedQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      toast.error("All questions in the batch are invalid");
      return;
    }

    setUploadingBulk(true);
    const toastId = toast.loading(`Uploading ${validQuestions.length} questions to Supabase...`);

    try {
      let targetPaperId: number;

      // 1. If new paper requested, create it
      if (bulkPaperId === "new") {
        const examObj = exams.find((x) => x.id === bulkExamId);
        const examName = examObj?.title?.toUpperCase() || "SSC CGL";
        const shiftStr = bulkNewShiftName.trim() || `Shift 1`;
        const newTitle = `${examName} ${bulkYear} ${bulkTier} (Held On ${shiftStr})`;

        const pRes = await fetch("/api/admin/papers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            exam_id: bulkExamId,
            year: parseInt(bulkYear) || 2025,
            total_questions: validQuestions.length,
            duration_minutes: 60,
            allow_download: true
          })
        });
        const pJson = await pRes.json();
        if (!pRes.ok) throw new Error(pJson.error || "Failed to create shift paper");
        targetPaperId = pJson.paper?.id;
      } else {
        targetPaperId = Number(bulkPaperId);
      }

      // 2. Prepare payload for bulk insert
      const sanitizedList = validQuestions.map((q, idx) => ({
        paper_id: targetPaperId,
        question_number: q.question_number || idx + 1,
        question_text: String(q.question_text).trim(),
        option_a: String(q.option_a).trim(),
        option_b: String(q.option_b).trim(),
        option_c: String(q.option_c).trim(),
        option_d: String(q.option_d).trim(),
        correct_answer: q.correct_answer || "A",
        explanation: q.explanation ? String(q.explanation).trim() : null
      }));

      const res = await fetch("/api/admin/paper-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          paper_id: targetPaperId,
          questions: sanitizedList,
          overwrite: bulkOverwrite
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload questions");

      toast.success(`Successfully uploaded ${json.count || sanitizedList.length} questions to Supabase!`, { id: toastId });
      setShowBulkModal(false);
      setBulkRawText("");
      setBulkParsedQuestions([]);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Bulk upload failed", { id: toastId });
    } finally {
      setUploadingBulk(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: Download TXT file of questions
  // ─────────────────────────────────────────────────────────────
  async function handleDownloadPaperTxt(paper: any) {
    const toastId = toast.loading(`Preparing TXT for ${paper.title}...`);
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

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HERO HEADER & QUICK ACTION BUTTONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Hierarchical PYQ Folder Engine
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
              <CheckCircle2 className="h-3 w-3" />
              Supabase Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PYQ Papers & Question Bank Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Organized in dynamic folders by <strong className="text-white">Exam</strong>, <strong className="text-white">Year</strong>, and <strong className="text-white">Tier</strong>. Create single questions via dropdowns, bulk upload TXT question sets, or attach clean official PDFs.
          </p>
        </div>

        {/* Action Buttons: 3 Main Ways to Add Content */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Button A: Create Question Modal */}
          <button
            onClick={() => openQuestionCreator()}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            title="Add a single question using Exam, Year, and Tier dropdowns"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Question</span>
          </button>

          {/* Button B: Bulk Upload Modal */}
          <button
            onClick={() => openBulkUploader()}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            title="Bulk import questions from TXT or JSON into any folder"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload PYQs</span>
          </button>

          {/* Button C: New Folder / Shift Paper */}
          <button
            onClick={() => openNewPaperModal()}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            title="Create a new Exam/Year/Tier Shift Paper"
          >
            <Folder className="h-4 w-4" />
            <span>New Folder / Shift</span>
          </button>

          {/* Button D: Master Compiled Verification TXT */}
          <a
            href="/verification_txt/ALL_PAPERS_MASTER_50_SHIFTS_COMPILED.txt"
            download="ALL_PAPERS_MASTER_50_SHIFTS_COMPILED.txt"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-200 transition-all cursor-pointer hover:scale-[1.02]"
            title="Download compiled questions of all 50 shifts in one text file for offline verification"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Compiled Master TXT (50 Shifts)</span>
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. METRICS ROW
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Folder className="h-4 w-4 text-indigo-600" />
            <span>Total Folders</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{allFolders.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Exam + Year + Tier Groups</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>Total Shift Papers</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{papers.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {exams.length} SSC Categories</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span>Questions In Supabase</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalQuestionsSum}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Live in `paper_questions`</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>PYQ Portal Ready</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100% Active</div>
          <p className="text-[11px] text-slate-400 mt-0.5">CBT Mock Test & TXT Exports</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. NAVIGATION BAR (View Mode Toggle + Breadcrumbs + Search/Filter)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Breadcrumb Navigation when inside a Folder */}
        {selectedFolderKey && currentFolder && (
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <button
                onClick={() => setSelectedFolderKey(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Folders</span>
              </button>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-blue-700 font-extrabold">{currentFolder.examTitle}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 font-extrabold">{currentFolder.year}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
                {currentFolder.tier}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuestionCreator({ examId: currentFolder.examId, year: String(currentFolder.year), tier: currentFolder.tier })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question to Folder</span>
              </button>
              <button
                onClick={() => openBulkUploader({ examId: currentFolder.examId, year: String(currentFolder.year), tier: currentFolder.tier })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Bulk Upload to Folder</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode Toggle + Search Bar + Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 shrink-0 self-start">
            <button
              onClick={() => {
                setViewMode("folders");
                setSelectedFolderKey(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "folders" && !selectedFolderKey
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-indigo-600" />
              <span>Folders View</span>
            </button>
            <button
              onClick={() => {
                setViewMode("flat");
                setSelectedFolderKey(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "flat"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
              <span>All Papers List ({papers.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by shift, date, exam or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filters (Exam, Year, Tier) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Exam Filter */}
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value={0}>All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title?.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="Tier-I">Tier-I</option>
              <option value="Tier-II">Tier-II</option>
            </select>

            {(filterExam !== 0 || filterYear !== "all" || filterTier !== "all") && (
              <button
                onClick={() => {
                  setFilterExam(0);
                  setFilterYear("all");
                  setFilterTier("all");
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN CONTENT AREA (3 VIEW STATES)
      ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading PYQ Folders and Question Banks...</p>
        </div>
      ) : selectedFolderKey && currentFolder ? (
        /* ── VIEW STATE A: INSIDE A SELECTED FOLDER ── */
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <FolderOpen className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    {currentFolder.tier}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Year {currentFolder.year}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {currentFolder.examTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contains {currentFolder.papers.length} Shift Papers • {currentFolder.totalQuestions} Questions total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => openNewPaperModal(currentFolder.examId, String(currentFolder.year), currentFolder.tier)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 text-xs font-bold text-blue-800 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-blue-700" />
                <span>Add Shift to this Folder</span>
              </button>
              <button
                onClick={() => openBulkUploader({ examId: currentFolder.examId, year: String(currentFolder.year), tier: currentFolder.tier })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Bulk Upload to this Folder</span>
              </button>

              <button
                onClick={() => handleToggleFolderTranslators(currentFolder)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  currentFolder.papers.every((p: any) => !isPaperTranslatorAllowed(p))
                    ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
                title={
                  currentFolder.papers.every((p: any) => !isPaperTranslatorAllowed(p))
                    ? "Turn ON translator for all papers in this folder"
                    : "Turn OFF translator for all papers in this folder"
                }
              >
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {currentFolder.papers.every((p: any) => !isPaperTranslatorAllowed(p))
                    ? "🌐 Translators: OFF (Turn ON All)"
                    : "🌐 Turn OFF All Translators"}
                </span>
              </button>

              <a
                href={
                  Number(currentFolder.year) === 2026
                    ? "/verification_txt/SSC_CGL_2026_ALL_29_SHIFTS_COMPILED.txt"
                    : Number(currentFolder.year) === 2025
                    ? "/verification_txt/SSC_CGL_2025_ALL_21_SHIFTS_COMPILED.txt"
                    : "/verification_txt/ALL_PAPERS_MASTER_50_SHIFTS_COMPILED.txt"
                }
                download={`${currentFolder.examTitle}_${currentFolder.year}_${currentFolder.tier}_Compiled_Verification.txt`.replace(/\s+/g, "_")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
                title="Download all shifts in this folder compiled into one TXT file for offline verification"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span>📄 Download Folder Compiled .txt</span>
              </a>
            </div>
          </div>

          {/* Shift Papers Grid in this Folder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFolder.papers.map((p: any) => {
              const qCount = p.paper_questions?.[0]?.count ?? 0;
              const pct = Math.min(100, Math.round((qCount / (p.total_questions || 100)) * 100));

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {p.meta?.shift || p.title}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.duration_minutes || 60}m
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {p.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">
                        {qCount} / {p.total_questions || 100} Questions
                      </span>
                      <span className={`font-black ${pct === 100 ? "text-emerald-600" : "text-blue-600"}`}>
                        {pct}% Ready
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/admin/papers/${p.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>Manage & Qs</span>
                      </Link>

                      <button
                        onClick={() => openQuestionCreator({ examId: p.exam_id, year: String(p.year), tier: p.meta?.tier, paperId: p.id })}
                        className="rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        title="Add Single Question to this Paper"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => openBulkUploader({ examId: p.exam_id, year: String(p.year), tier: p.meta?.tier, paperId: p.id })}
                        className="rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        title="Bulk Upload Questions to this Paper"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>

                      {qCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDownloadPaperTxt(p)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                          title="Download Formatted Questions .txt"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-700" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => handleToggleTranslator(p)}
                        className={`text-[11px] font-bold ${
                          isPaperTranslatorAllowed(p) ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        🌐 Translator: {isPaperTranslatorAllowed(p) ? "ON" : "OFF"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPaperModal(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Edit Paper Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePaper(p.id, p.title)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Paper"
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
        </div>
      ) : viewMode === "folders" ? (
        /* ── VIEW STATE B: FOLDERS GRID VIEW (Default) ── */
        filteredFolders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            <Folder className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No folders match your current filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;New Folder / Shift&quot; to create a new folder, or reset your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Exam Folders ({filteredFolders.length})
              </h2>
              <span className="text-xs text-slate-400">
                Click any folder to inspect shift papers or upload questions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFolders.map((f) => {
                return (
                  <div
                    key={f.key}
                    onClick={() => setSelectedFolderKey(f.key)}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Folder Top Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                          <Folder className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            {f.tier}
                          </span>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {f.year}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            f.papers.length > 0 && f.papers.every((p: any) => !isPaperTranslatorAllowed(p))
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            🌐 {f.papers.length > 0 && f.papers.every((p: any) => !isPaperTranslatorAllowed(p)) ? "Trans: OFF" : "Trans: ON"}
                          </span>
                        </div>
                      </div>

                      {/* Folder Title */}
                      <div className="mt-4">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {f.examTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {f.year} • {f.tier}
                        </p>
                      </div>

                      {/* Folder Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400">Shifts</div>
                          <div className="text-base font-black text-slate-800">
                            {f.papers.length} Papers
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400">Questions</div>
                          <div className="text-base font-black text-emerald-600">
                            {f.totalQuestions} Qs
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Folder Footer Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Folder</span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openQuestionCreator({ examId: f.examId, year: String(f.year), tier: f.tier })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Add Question to this folder"
                        >
                          + Question
                        </button>
                        <button
                          onClick={() => openBulkUploader({ examId: f.examId, year: String(f.year), tier: f.tier })}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                          title="Bulk Upload to this folder"
                        >
                          Bulk Upload
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* ── VIEW STATE C: ALL PAPERS FLAT VIEW ── */
        filteredFlatPapers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No shift papers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlatPapers.map((p) => {
              const qCount = p.paper_questions?.[0]?.count ?? 0;
              const pct = Math.min(100, Math.round((qCount / (p.total_questions || 100)) * 100));
              const meta = parsePaperMeta(p);

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        {p.exams?.title || "SSC"}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.year} • {meta.tier}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {p.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">
                        {qCount} / {p.total_questions || 100} Questions
                      </span>
                      <span className={`font-black ${pct === 100 ? "text-emerald-600" : "text-blue-600"}`}>
                        {pct}% Ready
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/papers/${p.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>Manage & Qs</span>
                      </Link>

                      <button
                        onClick={() => openQuestionCreator({ examId: p.exam_id, year: String(p.year), tier: meta.tier, paperId: p.id })}
                        className="rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-2 text-xs font-bold text-slate-700 transition-colors"
                        title="Add Single Question"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => openBulkUploader({ examId: p.exam_id, year: String(p.year), tier: meta.tier, paperId: p.id })}
                        className="rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-2 text-xs font-bold text-slate-700 transition-colors"
                        title="Bulk Upload Questions"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>

                      {qCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDownloadPaperTxt(p)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-2 text-xs font-bold transition-colors"
                          title="Download Formatted TXT"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-700" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => handleToggleTranslator(p)}
                        className={`text-[11px] font-bold ${
                          isPaperTranslatorAllowed(p) ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        🌐 Translator: {isPaperTranslatorAllowed(p) ? "ON" : "OFF"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPaperModal(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Edit Paper"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePaper(p.id, p.title)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Paper"
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
        )
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: CREATE / EDIT SHIFT PAPER (with Dropdowns)
      ───────────────────────────────────────────────────────────── */}
      {showPaperModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-w-2xl w-full my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingPaperId ? "✏️ Edit PYQ Shift Paper" : "📁 Create New Folder / Shift Paper"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combine Exam, Year, and Tier to form the folder, then specify the shift.
                </p>
              </div>
              <button
                onClick={() => setShowPaperModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-4">
              {/* Folder Components: Exam, Year, Tier */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 block">
                  1. Folder Hierarchy Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exam *</label>
                    <select
                      value={paperModalExamId}
                      onChange={(e) => setPaperModalExamId(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                      required
                    >
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title?.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year *</label>
                    <select
                      value={paperModalYear}
                      onChange={(e) => setPaperModalYear(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                      required
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tier *</label>
                    <select
                      value={paperModalTier}
                      onChange={(e) => setPaperModalTier(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                      required
                    >
                      <option value="Tier-I">Tier-I (Prelims)</option>
                      <option value="Tier-II">Tier-II (Mains)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5 pt-1">
                  <Folder className="h-3.5 w-3.5" />
                  <span>
                    Target Folder: {exams.find((x) => x.id === paperModalExamId)?.title?.toUpperCase() || "SSC CGL"} / {paperModalYear} / {paperModalTier}
                  </span>
                </div>
              </div>

              {/* Shift Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift Name / Held Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 19 September 2025 Shift 1"
                    value={paperModalShiftName}
                    onChange={(e) => setPaperModalShiftName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Preview: <strong className="text-slate-800">{exams.find((x) => x.id === paperModalExamId)?.title?.toUpperCase() || "SSC CGL"} {paperModalYear} {paperModalTier} (Held On {paperModalShiftName || "..."})</strong>
                  </p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    💡 CBT exam mode is automatically enabled only on shift papers after questions are uploaded. Folders group shifts together and are not attempted as tests.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Questions</label>
                    <input
                      type="number"
                      value={paperModalTotalQ}
                      onChange={(e) => setPaperModalTotalQ(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={paperModalDuration}
                      onChange={(e) => setPaperModalDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaperModal(false)}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPaper}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPaper ? "Saving to Supabase..." : editingPaperId ? "Update Shift Paper" : "Create in Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: CREATE SINGLE QUESTION (with Dropdowns)
      ───────────────────────────────────────────────────────────── */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-w-3xl w-full my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  ➕ Create Question in Supabase
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select Exam, Year, and Tier via dropdowns to automatically target or create the folder & shift.
                </p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Dropdown Section: Exam > Year > Tier > Shift */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                  Folder & Shift Selection via Dropdowns
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">1. Exam *</label>
                    <select
                      value={qExamId}
                      onChange={(e) => {
                        setQExamId(Number(e.target.value));
                        setQPaperId("new");
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
                    >
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title?.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">2. Year *</label>
                    <select
                      value={qYear}
                      onChange={(e) => {
                        setQYear(e.target.value);
                        setQPaperId("new");
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3. Tier *</label>
                    <select
                      value={qTier}
                      onChange={(e) => {
                        setQTier(e.target.value);
                        setQPaperId("new");
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="Tier-I">Tier-I (Prelims)</option>
                      <option value="Tier-II">Tier-II (Mains)</option>
                    </select>
                  </div>
                </div>

                {/* Shift Paper Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Target Shift Paper in this Folder *
                  </label>
                  <select
                    value={qPaperId}
                    onChange={(e) => {
                      const val = e.target.value === "new" ? "new" : Number(e.target.value);
                      setQPaperId(val);
                      if (val !== "new") {
                        const target = papers.find((p) => p.id === val);
                        const c = target?.paper_questions?.[0]?.count ?? 0;
                        setQNumber(c + 1);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="new">➕ [Create New Shift Paper in this Folder]</option>
                    {qAvailablePapers.map((p) => {
                      const meta = parsePaperMeta(p);
                      const count = p.paper_questions?.[0]?.count ?? 0;
                      return (
                        <option key={p.id} value={p.id}>
                          {meta.shift || p.title} ({count} Qs existing)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {qPaperId === "new" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Shift Name / Date *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 19 September 2025 Shift 1"
                      value={qNewShiftName}
                      onChange={(e) => setQNewShiftName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Question Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Q. Number</label>
                    <input
                      type="number"
                      value={qNumber}
                      onChange={(e) => setQNumber(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Question Text * (Plain English or LaTeX supported)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter question text..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option A *</label>
                    <input
                      type="text"
                      placeholder="Option A"
                      value={qOptionA}
                      onChange={(e) => setQOptionA(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option B *</label>
                    <input
                      type="text"
                      placeholder="Option B"
                      value={qOptionB}
                      onChange={(e) => setQOptionB(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option C *</label>
                    <input
                      type="text"
                      placeholder="Option C"
                      value={qOptionC}
                      onChange={(e) => setQOptionC(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option D *</label>
                    <input
                      type="text"
                      placeholder="Option D"
                      value={qOptionD}
                      onChange={(e) => setQOptionD(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Correct Answer & Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correct Answer Option *
                    </label>
                    <select
                      value={qCorrectAnswer}
                      onChange={(e) => setQCorrectAnswer(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-emerald-800 bg-emerald-50/50 focus:border-emerald-600 focus:outline-none"
                      required
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Explanation (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Step-by-step solution or formula..."
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Submitting directly saves to Supabase & increments to Q.{qNumber + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Done / Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuestion}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingQuestion ? "Saving..." : "Save Question to Supabase"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: BULK UPLOAD PYQ QUESTIONS (with Dropdowns)
      ───────────────────────────────────────────────────────────── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-w-4xl w-full my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  ⚡ Bulk Upload PYQ Questions to Supabase
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste entire question sets in standard text format or upload a .txt / .json file directly.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Folder & Shift Dropdowns */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 block">
                Target Folder & Shift Paper via Dropdowns
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Exam *</label>
                  <select
                    value={bulkExamId}
                    onChange={(e) => {
                      setBulkExamId(Number(e.target.value));
                      setBulkPaperId("new");
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title?.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Year *</label>
                  <select
                    value={bulkYear}
                    onChange={(e) => {
                      setBulkYear(e.target.value);
                      setBulkPaperId("new");
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Tier *</label>
                  <select
                    value={bulkTier}
                    onChange={(e) => {
                      setBulkTier(e.target.value);
                      setBulkPaperId("new");
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Tier-I">Tier-I (Prelims)</option>
                    <option value="Tier-II">Tier-II (Mains)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Shift Paper Destination *
                </label>
                <select
                  value={bulkPaperId}
                  onChange={(e) => setBulkPaperId(e.target.value === "new" ? "new" : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                >
                  <option value="new">➕ [Create New Shift Paper in this Folder]</option>
                  {bulkAvailablePapers.map((p) => {
                    const meta = parsePaperMeta(p);
                    const count = p.paper_questions?.[0]?.count ?? 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {meta.shift || p.title} ({count} Qs existing)
                      </option>
                    );
                  })}
                </select>
              </div>

              {bulkPaperId === "new" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Shift Name / Date *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 19 September 2025 Shift 1"
                    value={bulkNewShiftName}
                    onChange={(e) => setBulkNewShiftName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* File Input & Paste Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Paste Questions Text or Upload File (.txt / .json)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.json"
                  onChange={handleBulkFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Choose .txt / .json File</span>
                </button>
              </div>

              <textarea
                rows={7}
                placeholder={`Q1. Which constitutional amendment introduced the Goods and Services Tax (GST) in India?\nA) 99th Amendment\nB) 100th Amendment\nC) 101st Amendment\nD) 102nd Amendment\nCorrect Answer: Option C\nExplanation: The 101st Constitutional Amendment Act 2016 introduced GST.\n--------------------------------------------------------------------------------\n\nQ2. ...`}
                value={bulkRawText}
                onChange={(e) => handleBulkTextChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
              />

              {/* Parser Detection Summary Bar */}
              <div className="flex items-center justify-between text-xs font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {bulkParsedQuestions.filter((q) => q.isValid).length} Valid Questions Detected
                  </span>
                  {bulkParsedQuestions.some((q) => !q.isValid) && (
                    <span className="text-amber-700 font-bold">
                      ({bulkParsedQuestions.filter((q) => !q.isValid).length} incomplete)
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 text-xs">
                  <input
                    type="checkbox"
                    checked={bulkOverwrite}
                    onChange={(e) => setBulkOverwrite(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Overwrite existing questions in target paper</span>
                </label>
              </div>

              {/* Quick Preview Table of first 2 questions */}
              {bulkParsedQuestions.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-1.5 text-xs">
                  {bulkParsedQuestions.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-black text-indigo-700">Q.{q.question_number}</span>
                        <span className="truncate text-slate-700">{q.question_text}</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                        Ans: {q.correct_answer}
                      </span>
                    </div>
                  ))}
                  {bulkParsedQuestions.length > 3 && (
                    <div className="text-center text-[11px] text-slate-400 font-bold py-0.5">
                      + {bulkParsedQuestions.length - 3} more questions in this batch
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploadingBulk || bulkParsedQuestions.length === 0}
                onClick={handleExecuteBulkUpload}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {uploadingBulk ? "Uploading to Supabase..." : `Upload ${bulkParsedQuestions.filter((q) => q.isValid).length} Questions to Supabase`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
