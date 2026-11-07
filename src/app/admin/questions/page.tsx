"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import MathText from "@/components/MathText";

// Math Preview Component
function MathPreview({ text, className = "" }: { text: string; className?: string }) {
  return <MathText text={text} className={className} />;
}

// Math Toolbar Component
function MathToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const btnStyle = { padding: "4px 8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "4px", color: "#a5b4fc", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 as const };
  return (
    <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "8px", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", border: "1px solid rgba(99,102,241,0.3)" }}>
      <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600, marginRight: "0.5rem" }}>📐 MATH TOOLS:</span>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\frac{1}{x}\\)")}>Fraction (1/x)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\sqrt{x}\\)")}>Root (√)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(x^2\\)")}>Power (x²)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\times\\)")}>Multiply (×)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\div\\)")}>Divide (÷)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\pi\\)")}>Pi (π)</button>
      <button type="button" style={btnStyle} onClick={() => onInsert("\\(\\theta\\)")}>Theta (θ)</button>
    </div>
  );
}

export default function QuestionsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<number>(0);

  const filteredSubjects = useMemo(() => {
    if (!selectedExam) return [];
    return subjects.filter(s => s.exam_id === selectedExam);
  }, [subjects, selectedExam]);

  const filteredTopics = useMemo(() => {
    if (!selectedSubject) return [];
    return topics.filter(t => t.subject_id === selectedSubject);
  }, [topics, selectedSubject]);

  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [qText, setQText] = useState("");
  const [opA, setOpA] = useState(""); const [opB, setOpB] = useState("");
  const [opC, setOpC] = useState(""); const [opD, setOpD] = useState("");
  const [correct, setCorrect] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [search, setSearch] = useState("");
  // New features state
  const [showHindi, setShowHindi] = useState(false);
  const [examTag, setExamTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [opAImg, setOpAImg] = useState(""); const [opBImg, setOpBImg] = useState("");
  const [opCImg, setOpCImg] = useState(""); const [opDImg, setOpDImg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [qTextHi, setQTextHi] = useState("");
  const [opAHi, setOpAHi] = useState(""); const [opBHi, setOpBHi] = useState("");
  const [opCHi, setOpCHi] = useState(""); const [opDHi, setOpDHi] = useState("");
  const [explanationHi, setExplanationHi] = useState("");
  const [tierLevel, setTierLevel] = useState("General");
  const [bulkTierLevel, setBulkTierLevel] = useState("General");
  // Multi-Format Bulk State
  const [bulkMode, setBulkMode] = useState<"excel" | "smartText" | "json" | "sscZoneLine" | "pyq">("excel");
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<any[]>([]);
  const [selectedBulkIndices, setSelectedBulkIndices] = useState<Set<number>>(new Set());
  const [bulkSmartText, setBulkSmartText] = useState("");
  const [bulkJsonText, setBulkJsonText] = useState("");
  const [bulkSscZoneText, setBulkSscZoneText] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelDragging, setExcelDragging] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  // PYQ Shift Papers Direct Import State
  const [pyqPapers, setPyqPapers] = useState<any[]>([]);
  const [selectedPyqPaperId, setSelectedPyqPaperId] = useState<number>(0);
  const [pyqQuestionsList, setPyqQuestionsList] = useState<any[]>([]);
  const [selectedPyqQIds, setSelectedPyqQIds] = useState<Set<number>>(new Set());
  const [loadingPyq, setLoadingPyq] = useState(false);
  const [importingPyq, setImportingPyq] = useState(false);
  const [pyqSearch, setPyqSearch] = useState("");
  const [pyqCustomTag, setPyqCustomTag] = useState("");
  const [pyqSectionFilter, setPyqSectionFilter] = useState<"all" | "s1" | "s2" | "s3" | "s4">("all");
  // PDF state
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDragging, setPdfDragging] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [selectedParsed, setSelectedParsed] = useState<Set<number>>(new Set());
  const [importingPdf, setImportingPdf] = useState(false);
  const [isMathMode, setIsMathMode] = useState(false);
  const [activeField, setActiveField] = useState<"qText"|"opA"|"opB"|"opC"|"opD"|"explanation">("qText");
  const [selectedQIds, setSelectedQIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [examsRes, subjectsRes, topicsRes] = await Promise.all([
        supabase.from("exams").select("id, title, is_active").order("id", { ascending: true }),
        supabase.from("subjects").select("id, title, exam_id, is_active").order("id", { ascending: true }),
        supabase.from("topics").select("id, title, description, subject_id, is_active, subjects(exam_id)").order("id", { ascending: true })
      ]);
      if (examsRes.data) setExams(examsRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (topicsRes.data) setTopics(topicsRes.data);
    } catch (err: any) {
      console.error("Failed to load data:", err);
    }
  }

  function handleExamChange(examId: number) {
    setSelectedExam(examId);
    setSelectedSubject(0);
    setSelectedTopic(0);
    setQuestions([]);
  }

  function handleSubjectChange(subId: number) {
    setSelectedSubject(subId);
    setSelectedTopic(0);
    setQuestions([]);
  }

  async function handleTopicChange(topicId: number) {
    setSelectedTopic(topicId);
    setSelectedQIds(new Set());
    if (topicId) {
      setLoadingQ(true);
      try {
        const res = await fetch(`/api/admin/questions?topic_id=${topicId}`);
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          setQuestions([]);
        }
      } catch (err: any) {
        console.error("Failed to load questions:", err);
        setQuestions([]);
      } finally {
        setLoadingQ(false);
      }
    } else {
      setQuestions([]);
      setLoadingQ(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTopic) {
      toast.error("Please select a Chapter / Topic first!");
      return;
    }
    setSaving(true);
    const payload = {
      topic_id: selectedTopic,
      question_text: qText,
      option_a: opA, option_b: opB, option_c: opC, option_d: opD,
      correct_answer: correct,
      explanation,
      image_url: imageUrl || null,
      option_a_image_url: opAImg || null,
      option_b_image_url: opBImg || null,
      option_c_image_url: opCImg || null,
      option_d_image_url: opDImg || null,
      exam_tag: examTag || null,
      question_text_hi: showHindi ? (qTextHi || null) : null,
      option_a_hi: showHindi ? (opAHi || null) : null,
      option_b_hi: showHindi ? (opBHi || null) : null,
      option_c_hi: showHindi ? (opCHi || null) : null,
      option_d_hi: showHindi ? (opDHi || null) : null,
      explanation_hi: showHindi ? (explanationHi || null) : null,
      tier_level: tierLevel === "General" ? null : tierLevel,
    };

    try {
      if (editingId) {
        const res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Update failed");
        toast.success(data.message || (data.syncedToPyq ? "Question updated & synced to PYQ Shift Paper! ⚡" : "Question updated!"));
      } else {
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([payload]),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Insert failed");
        toast.success("Question added!");
      }
      setShowForm(false);
      resetForm();
      await handleTopicChange(selectedTopic);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setQText(""); setOpA(""); setOpB(""); setOpC(""); setOpD("");
    setCorrect("A"); setExplanation(""); setEditingId(null); setExamTag("");
    setImageUrl(""); setOpAImg(""); setOpBImg(""); setOpCImg(""); setOpDImg("");
    setQTextHi(""); setOpAHi(""); setOpBHi(""); setOpCHi(""); setOpDHi(""); setExplanationHi("");
    setIsMathMode(false);
    setTierLevel("General");
  }

  const handleInsertMath = (code: string) => {
    if (activeField === "qText") setQText(p => p + " " + code + " ");
    else if (activeField === "opA") setOpA(p => p + " " + code + " ");
    else if (activeField === "opB") setOpB(p => p + " " + code + " ");
    else if (activeField === "opC") setOpC(p => p + " " + code + " ");
    else if (activeField === "opD") setOpD(p => p + " " + code + " ");
    else if (activeField === "explanation") setExplanation(p => p + " " + code + " ");
  };

  function handleEdit(q: any) {
    setQText(q.question_text); setOpA(q.option_a); setOpB(q.option_b);
    setOpC(q.option_c); setOpD(q.option_d);
    setCorrect(q.correct_answer); setExplanation(q.explanation || "");
    setImageUrl(q.image_url || ""); setExamTag(q.exam_tag || "");
    setOpAImg(q.option_a_image_url || ""); setOpBImg(q.option_b_image_url || "");
    setOpCImg(q.option_c_image_url || ""); setOpDImg(q.option_d_image_url || "");
    setQTextHi(q.question_text_hi || ""); setOpAHi(q.option_a_hi || "");
    setOpBHi(q.option_b_hi || ""); setOpCHi(q.option_c_hi || "");
    setOpDHi(q.option_d_hi || ""); setExplanationHi(q.explanation_hi || "");
    setTierLevel(q.tier_level || "General");
    if (q.question_text_hi) setShowHindi(true);
    setEditingId(q.id); setShowForm(true); setShowBulk(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      toast.success("Deleted!");
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelectedQIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function toggleSelectAll() {
    if (selectedQIds.size === filteredQ.length && filteredQ.length > 0) {
      setSelectedQIds(new Set());
    } else {
      setSelectedQIds(new Set(filteredQ.map(q => q.id)));
    }
  }

  function toggleSelectOne(id: number) {
    setSelectedQIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteSelected() {
    if (selectedQIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedQIds.size} selected questions?`)) return;
    setSaving(true);
    try {
      const ids = Array.from(selectedQIds);
      const res = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      toast.success(`🗑️ Deleted ${ids.length} questions!`);
      setSelectedQIds(new Set());
      await handleTopicChange(selectedTopic);
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAllInTopic() {
    if (questions.length === 0) return;
    const count = questions.length;
    if (!confirm(`⚠️ DANGER: Are you sure you want to delete ALL ${count} questions from this topic? This cannot be undone!`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions?topic_id=${selectedTopic}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      toast.success(`🗑️ All ${count} questions deleted from this topic!`);
      setSelectedQIds(new Set());
      setQuestions([]);
    } catch (err: any) {
      toast.error("Failed to delete all: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to update status");
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_active: nextStatus } : q));
      toast.success(nextStatus ? "🟢 Question turned ON" : "⚪ Question turned OFF");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // ── Multi-Format Bulk Import Handlers ──
  function downloadExcelTemplate(type: "xlsx" | "csv" = "xlsx") {
    const sampleData = [
      {
        "Question Text": "If a sum of money doubles itself in 5 years at simple interest, in how many years will it become 4 times?",
        "Option A": "10 years",
        "Option B": "12 years",
        "Option C": "15 years",
        "Option D": "20 years",
        "Correct Answer": "C",
        "Explanation": "Interest for 1P = 5 years. For 3P interest (to become 4P), time = 3 * 5 = 15 years.",
        "Exam Tag": "SSC CGL 2023 Tier-1",
        "Tier Level": "Tier 1",
        "Hindi Question": "यदि कोई धनराशि साधारण ब्याज पर 5 वर्षों में दोगुनी हो जाती है, तो कितने वर्षों में यह 4 गुनी हो जाएगी?",
        "Hindi Option A": "10 वर्ष",
        "Hindi Option B": "12 वर्ष",
        "Hindi Option C": "15 वर्ष",
        "Hindi Option D": "20 वर्ष",
        "Hindi Explanation": "1P ब्याज = 5 वर्ष। 4P बनने के लिए 3P ब्याज चाहिए = 3 * 5 = 15 वर्ष。"
      },
      {
        "Question Text": "Find the unit digit in the product: (2137)^753",
        "Option A": "1",
        "Option B": "3",
        "Option C": "7",
        "Option D": "9",
        "Correct Answer": "C",
        "Explanation": "Cyclicity of 7 is 4. Remainder of 753 / 4 is 1. Unit digit = 7^1 = 7.",
        "Exam Tag": "SSC CHSL 2024",
        "Tier Level": "Tier 1",
        "Hindi Question": "(2137)^753 के गुणनफल में इकाई का अंक ज्ञात कीजिए।",
        "Hindi Option A": "1",
        "Hindi Option B": "3",
        "Hindi Option C": "7",
        "Hindi Option D": "9",
        "Hindi Explanation": "7 की चक्रीयता 4 होती है। 753 / 4 का शेषफल 1 है। इकाई अंक = 7^1 = 7。"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    if (type === "csv") {
      XLSX.writeFile(workbook, "SSCZone_Question_Template.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(workbook, "SSCZone_Question_Template.xlsx", { bookType: "xlsx" });
    }
    toast.success(`📥 Template downloaded: SSCZone_Question_Template.${type}`);
  }

  function handleExcelUpload(file: File) {
    if (!file) return;
    setExcelFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rows || rows.length === 0) {
          toast.error("Excel/CSV sheet is empty!");
          return;
        }

        const parsed = rows.map((row: any) => {
          const getVal = (possibleKeys: string[]) => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const pk of possibleKeys) {
                if (cleanKey === pk.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  return row[key]?.toString().trim() || "";
                }
              }
            }
            return "";
          };

          const qText = getVal(["Question Text", "Question", "QText", "Q", "question_text"]);
          const opA = getVal(["Option A", "Opt A", "A", "option_a"]);
          const opB = getVal(["Option B", "Opt B", "B", "option_b"]);
          const opC = getVal(["Option C", "Opt C", "C", "option_c"]);
          const opD = getVal(["Option D", "Opt D", "D", "option_d"]);
          let ans = getVal(["Correct Answer", "Correct", "Answer", "Ans", "correct_answer"]).toUpperCase();
          if (!["A", "B", "C", "D"].includes(ans)) ans = "A";

          const exp = getVal(["Explanation", "Solution", "Exp", "explanation"]);
          const tag = getVal(["Exam Tag", "Tag", "Exam", "exam_tag"]);
          const tier = getVal(["Tier Level", "Tier", "tier_level"]) || (bulkTierLevel !== "General" ? bulkTierLevel : "");
          const qTextHi = getVal(["Hindi Question", "Question Text (Hindi)", "question_text_hi", "Hindi QText"]);
          const opAHi = getVal(["Hindi Option A", "Option A (Hindi)", "option_a_hi"]);
          const opBHi = getVal(["Hindi Option B", "Option B (Hindi)", "option_b_hi"]);
          const opCHi = getVal(["Hindi Option C", "Option C (Hindi)", "option_c_hi"]);
          const opDHi = getVal(["Hindi Option D", "Option D (Hindi)", "option_d_hi"]);
          const expHi = getVal(["Hindi Explanation", "Explanation (Hindi)", "explanation_hi"]);

          return {
            topic_id: selectedTopic,
            question_text: qText,
            option_a: opA,
            option_b: opB,
            option_c: opC,
            option_d: opD,
            correct_answer: ans,
            explanation: exp,
            exam_tag: tag || null,
            tier_level: tier === "General" ? null : tier || null,
            question_text_hi: qTextHi || null,
            option_a_hi: opAHi || null,
            option_b_hi: opBHi || null,
            option_c_hi: opCHi || null,
            option_d_hi: opDHi || null,
            explanation_hi: expHi || null,
          };
        }).filter(q => q.question_text && (q.option_a || q.option_b));

        if (parsed.length === 0) {
          toast.error("No valid MCQ rows found. Please check column headers.");
          return;
        }

        setBulkParsedQuestions(parsed);
        setSelectedBulkIndices(new Set(parsed.map((_, i) => i)));
        toast.success(`🎉 ${parsed.length} questions parsed from Excel!`);
      } catch (err: any) {
        toast.error("Excel parse failed: " + err.message);
      }
    };

    reader.readAsBinaryString(file);
  }

  function parseSmartText() {
    const text = bulkSmartText.trim();
    if (!text) {
      toast.error("Please paste some questions first!");
      return;
    }

    const lines = text.split(/\r?\n/);
    const parsedList: any[] = [];

    let currentQ: any = null;
    let currentField: string | null = null;

    function finalizeCurrentQ() {
      if (!currentQ) return;
      if (currentQ.question_text && (currentQ.option_a || currentQ.option_b)) {
        currentQ.question_text = currentQ.question_text.trim();
        currentQ.option_a = currentQ.option_a.trim();
        currentQ.option_b = currentQ.option_b.trim();
        currentQ.option_c = currentQ.option_c.trim();
        currentQ.option_d = currentQ.option_d.trim();
        currentQ.explanation = currentQ.explanation.trim();
        currentQ.exam_tag = currentQ.exam_tag?.trim() || null;
        if (!['A', 'B', 'C', 'D'].includes(currentQ.correct_answer)) {
          currentQ.correct_answer = 'A';
        }
        parsedList.push(currentQ);
      }
      currentQ = null;
      currentField = null;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 1. Question Start Line: "1.", "1)", "Q1.", "Question 1:", "1 "
      const qStartMatch = line.match(/^(?:Q(?:uestion)?\s*\.?\s*\d+[\.\:\)]|\d+[\.\:\)]\s+)\s*(.*)/i);
      if (qStartMatch) {
        finalizeCurrentQ();
        currentQ = {
          topic_id: selectedTopic,
          question_text: qStartMatch[1] || "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "A",
          explanation: "",
          exam_tag: null,
          tier_level: bulkTierLevel === "General" ? null : bulkTierLevel,
        };
        currentField = 'question';
        continue;
      }

      if (!currentQ) {
        currentQ = {
          topic_id: selectedTopic,
          question_text: line,
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "A",
          explanation: "",
          exam_tag: null,
          tier_level: bulkTierLevel === "General" ? null : bulkTierLevel,
        };
        currentField = 'question';
        continue;
      }

      // 2. Strict Option Lines: "(A)", "(B)", "(C)", "(D)" or "A.", "B." (only if not a Para Jumble sentence)
      const isParaJumbleSentence = /^\s*[A-Za-d1-4P-Sp-s][\.\)]\s+[A-Za-z]/.test(line) && currentField === 'question';

      if (!isParaJumbleSentence) {
        const optAMatch = line.match(/^\s*(?:\([Aa]\)|[Aa][\.\:\)])\s*(.*)/i);
        if (optAMatch) {
          currentQ.option_a = optAMatch[1];
          currentField = 'optA';
          continue;
        }

        const optBMatch = line.match(/^\s*(?:\([Bb]\)|[Bb][\.\:\)])\s*(.*)/i);
        if (optBMatch) {
          currentQ.option_b = optBMatch[1];
          currentField = 'optB';
          continue;
        }

        const optCMatch = line.match(/^\s*(?:\([Cc]\)|[Cc][\.\:\)])\s*(.*)/i);
        if (optCMatch) {
          currentQ.option_c = optCMatch[1];
          currentField = 'optC';
          continue;
        }

        const optDMatch = line.match(/^\s*(?:\([Dd]\)|[Dd][\.\:\)])\s*(.*)/i);
        if (optDMatch) {
          currentQ.option_d = optDMatch[1];
          currentField = 'optD';
          continue;
        }
      }

      // 3. Answer Line: "Ans: B", "Answer: B", "Correct: B"
      const ansMatch = line.match(/^\s*(?:Ans(?:wer)?|Correct(?:\s*Answer)?)\s*[\:\.\-]?\s*\(?([A-Da-d1-4])\)?/i);
      if (ansMatch) {
        let val = ansMatch[1].toUpperCase();
        if (val === '1') val = 'A';
        else if (val === '2') val = 'B';
        else if (val === '3') val = 'C';
        else if (val === '4') val = 'D';
        currentQ.correct_answer = val;
        currentField = 'answer';
        continue;
      }

      // 4. Explanation Line: "Exp: ...", "Solution: ..."
      const expMatch = line.match(/^\s*(?:Exp(?:lanation)?|Solution|Sol)\s*[\:\.\-]?\s*(.*)/i);
      if (expMatch) {
        currentQ.explanation = expMatch[1];
        currentField = 'explanation';
        continue;
      }

      // 5. Exam Tag Line: "Exam: ...", "Tag: ..."
      const examMatch = line.match(/^\s*(?:Exam|Tag|Tier)\s*[\:\.\-]?\s*(.*)/i);
      if (examMatch) {
        currentQ.exam_tag = examMatch[1];
        currentField = 'examTag';
        continue;
      }

      // 6. Multi-line continuation
      if (currentField === 'question') {
        currentQ.question_text += "\n" + line;
      } else if (currentField === 'optA') {
        currentQ.option_a += " " + line;
      } else if (currentField === 'optB') {
        currentQ.option_b += " " + line;
      } else if (currentField === 'optC') {
        currentQ.option_c += " " + line;
      } else if (currentField === 'optD') {
        currentQ.option_d += " " + line;
      } else if (currentField === 'explanation') {
        currentQ.explanation += "\n" + line;
      } else if (currentField === 'examTag') {
        currentQ.exam_tag += " " + line;
      }
    }

    finalizeCurrentQ();

    if (parsedList.length === 0) {
      toast.error("Could not recognize MCQ format. Check sample format!");
      return;
    }

    setBulkParsedQuestions(parsedList);
    setSelectedBulkIndices(new Set(parsedList.map((_, i) => i)));
    toast.success(`🎉 ${parsedList.length} questions parsed!`);
  }

  function parseJsonText() {
    try {
      const raw = bulkJsonText.trim();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error("JSON must be a non-empty array `[{...}]`!");
        return;
      }
      const formatted = parsed.map(item => ({
        topic_id: selectedTopic,
        question_text: item.question_text || item.question || "",
        option_a: item.option_a || item.a || "",
        option_b: item.option_b || item.b || "",
        option_c: item.option_c || item.c || "",
        option_d: item.option_d || item.d || "",
        correct_answer: (item.correct_answer || item.answer || item.correct || "A").toString().trim().toUpperCase(),
        explanation: item.explanation || item.solution || "",
        exam_tag: item.exam_tag || item.tag || null,
        tier_level: item.tier_level || (bulkTierLevel === "General" ? null : bulkTierLevel),
        question_text_hi: item.question_text_hi || null,
        option_a_hi: item.option_a_hi || null,
        option_b_hi: item.option_b_hi || null,
        option_c_hi: item.option_c_hi || null,
        option_d_hi: item.option_d_hi || null,
        explanation_hi: item.explanation_hi || null,
      })).filter(q => q.question_text);

      setBulkParsedQuestions(formatted);
      setSelectedBulkIndices(new Set(formatted.map((_, i) => i)));
      toast.success(`🎉 ${formatted.length} questions parsed from JSON!`);
    } catch (e: any) {
      toast.error("Invalid JSON syntax: " + e.message);
    }
  }

  function parseSscZoneLineText() {
    const lines = bulkSscZoneText.split(/\r?\n/).filter(line => line.trim());
    const parsed: any[] = [];
    const invalidLines: number[] = [];

    lines.forEach((line, index) => {
      const fields = line.split("||").map(field => field.trim());
      if (fields.length !== 8 || !fields[0] || !fields[1] || !fields[2] || !fields[3] || !fields[4]) {
        invalidLines.push(index + 1);
        return;
      }

      const [question_text, option_a, option_b, option_c, option_d, answer, explanation, exam_tag] = fields;
      const correct_answer = answer.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
        invalidLines.push(index + 1);
        return;
      }

      parsed.push({
        topic_id: selectedTopic,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        exam_tag: exam_tag || null,
        tier_level: bulkTierLevel === "General" ? null : bulkTierLevel,
      });
    });

    if (parsed.length === 0) {
      toast.error("No valid SSCZone format rows found. Use the sample format.");
      return;
    }

    setBulkParsedQuestions(parsed);
    setSelectedBulkIndices(new Set(parsed.map((_, i) => i)));
    if (invalidLines.length > 0) {
      toast.error(`${invalidLines.length} row(s) skipped. Every row needs 8 fields and an A-D answer.`);
    }
    toast.success(`${parsed.length} questions parsed from SSCZone format!`);
  }

  async function handleSaveBulkParsed() {
    if (!selectedTopic || selectedTopic === 0) {
      toast.error("⚠️ Please select Target Exam, Subject, and Chapter first!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const selected = bulkParsedQuestions
      .filter((_, i) => selectedBulkIndices.has(i))
      .map(q => ({
        ...q,
        topic_id: selectedTopic // Dynamically bind to current selected chapter
      }));

    if (selected.length === 0) {
      toast.error("Please select at least 1 question to import!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save questions to database");
      }
      toast.success(`🚀 Successfully imported ${selected.length} questions into Question Bank!`);
      setShowBulk(false);
      setBulkParsedQuestions([]);
      setSelectedBulkIndices(new Set());
      setBulkSmartText("");
      setBulkJsonText("");
      setBulkSscZoneText("");
      setExcelFile(null);
      await handleTopicChange(selectedTopic);
    } catch (err: any) {
      console.error("Bulk import error:", err);
      toast.error("Import failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function insertSampleJson() {
    const sample = [
      {
        "question_text": "If a sum of money doubles itself in 5 years at simple interest, in how many years will it become 4 times?",
        "option_a": "10 years",
        "option_b": "12 years",
        "option_c": "15 years",
        "option_d": "20 years",
        "correct_answer": "C",
        "explanation": "Interest for 1P = 5 years. For 3P interest (to become 4P), time = 3 * 5 = 15 years.",
        "exam_tag": "SSC CGL 2023 Tier-1",
        "tier_level": "Tier 1"
      },
      {
        "question_text": "Find the unit digit in the product: (2137)^753",
        "option_a": "1",
        "option_b": "3",
        "option_c": "7",
        "option_d": "9",
        "correct_answer": "C",
        "explanation": "Cyclicity of 7 is 4. Remainder of 753 / 4 is 1. Unit digit = 7^1 = 7.",
        "exam_tag": "SSC CHSL 2024",
        "tier_level": "Tier 1"
      }
    ];
    setBulkJsonText(JSON.stringify(sample, null, 2));
  }

  function insertSampleSmartText() {
    const sample = `1. In what ratio must water be mixed with milk costing Rs. 12 per litre to get a mixture worth Rs. 8 per litre?
(A) 1 : 2
(B) 2 : 1
(C) 2 : 3
(D) 3 : 2
Ans: A
Exp: By rule of alligation, ratio is (12-8) : (8-0) = 4 : 8 = 1 : 2.
Exam: SSC CGL 2023 Tier-1

2. If x + 1/x = 5, then find the value of x^2 + 1/x^2.
(A) 23
(B) 25
(C) 27
(D) 21
Ans: A
Exp: x^2 + 1/x^2 = (5)^2 - 2 = 25 - 2 = 23.
Exam: SSC CHSL 2024`;
    setBulkSmartText(sample);
  }

  function insertSampleSscZoneLineText() {
    setBulkSscZoneText(
      'Select the most appropriate synonym of the word "Abundant".||Scarce||Plentiful||Empty||Rare||B||Plentiful means existing in large quantities.||SSC CGL 2024 Tier-1\n' +
      'What is 20% of 500?||100||200||50||150||A||20/100 * 500 = 100.||SSC CGL 2023 Tier-1'
    );
  }

  // ── PYQ Shift Papers Direct Import & Mapping Helpers ──
  async function loadPyqPapersList() {
    if (pyqPapers.length > 0) return;
    try {
      const res = await fetch("/api/admin/questions/import-pyq");
      const data = await res.json();
      if (data.papers) setPyqPapers(data.papers);
    } catch (err: any) {
      toast.error("Failed to load PYQ shift papers: " + err.message);
    }
  }

  async function handleSelectPyqPaper(pid: number) {
    setSelectedPyqPaperId(pid);
    setSelectedPyqQIds(new Set());
    if (!pid) {
      setPyqQuestionsList([]);
      return;
    }
    setLoadingPyq(true);
    try {
      const res = await fetch(`/api/admin/questions/import-pyq?paperId=${pid}`);
      const data = await res.json();
      if (data.questions) {
        setPyqQuestionsList(data.questions);
        if (data.paper) {
          const examTitle = data.paper.exams?.title || "SSC Exam";
          const year = data.paper.year || 2024;
          const tier = (data.paper.title || "").toLowerCase().includes("tier 2") || (data.paper.title || "").toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1";
          setPyqCustomTag(`${examTitle} ${year} ${tier}`.trim());
        }
      }
    } catch (err: any) {
      toast.error("Failed to load paper questions: " + err.message);
    } finally {
      setLoadingPyq(false);
    }
  }

  async function handleExecutePyqImport() {
    if (selectedPyqQIds.size === 0) {
      toast.error("Please select at least one question to import!");
      return;
    }
    if (!selectedTopic) {
      toast.error("Please select a Target Topic/Chapter above first!");
      return;
    }
    setImportingPyq(true);
    try {
      const res = await fetch("/api/admin/questions/import-pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: selectedPyqPaperId,
          questionIds: Array.from(selectedPyqQIds),
          topicId: selectedTopic,
          customExamTag: pyqCustomTag,
          tierLevel: bulkTierLevel === "General" ? "Tier 1" : bulkTierLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Import failed");
      toast.success(data.message || `Imported ${selectedPyqQIds.size} questions! 🎉`);
      setShowBulk(false);
      setSelectedPyqQIds(new Set());
      await handleTopicChange(selectedTopic);
    } catch (err: any) {
      toast.error(err.message || "Failed to import questions");
    } finally {
      setImportingPyq(false);
    }
  }

  // ── Auto Cloudinary Direct Image Upload Function ──
  async function uploadAnyImage(e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rglwv1bh";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

      const currSub = subjects.find(s => s.id === Number(selectedSubject));
      const subSlug = currSub ? currSub.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : "general";
      const folderName = `ssczone/${subSlug}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folderName);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      setUrl(data.secure_url);
      toast.success(`✅ Image saved to Cloudinary (Folder: ${folderName})!`);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // ── PDF Upload Functions ──
  async function handlePdfUpload(file: File) {
    if (!file || file.type !== "application/pdf") {
      toast.error("Sirf PDF files upload ho sakti hain"); return;
    }
    setPdfFile(file);
    setPdfParsing(true);
    setParsedQuestions([]);
    setSelectedParsed(new Set());
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "PDF parse failed"); return; }
      if (data.questions.length === 0) {
        toast.error("Koi MCQ questions nahi mili PDF mein. Format check karo.");
        return;
      }
      setParsedQuestions(data.questions);
      setSelectedParsed(new Set(data.questions.map((_: any, i: number) => i)));
      toast.success(`${data.questions.length} questions mil gayi PDF se!`);
    } catch (err: any) {
      toast.error("PDF upload failed: " + err.message);
    } finally {
      setPdfParsing(false);
    }
  }

  function updateParsedQuestion(idx: number, field: string, value: string) {
    setParsedQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function toggleSelectParsed(idx: number) {
    setSelectedParsed(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  async function importParsedQuestions() {
    const toImport = parsedQuestions
      .filter((_, i) => selectedParsed.has(i))
      .map(q => ({ ...q, topic_id: selectedTopic }));
    if (toImport.length === 0) { toast.error("Koi question select nahi ki"); return; }
    setImportingPdf(true);
    const { error } = await supabase.from("questions").insert(toImport);
    if (error) { toast.error(error.message); setImportingPdf(false); return; }
    toast.success(`🎉 ${toImport.length} questions import ho gayi!`);
    setImportingPdf(false);
    setShowPdf(false);
    setParsedQuestions([]);
    setPdfFile(null);
    handleTopicChange(selectedTopic);
  }

  const filteredQ = search
    ? questions.filter(q => q.question_text?.toLowerCase().includes(search.toLowerCase()))
    : questions;

  const correctColors: Record<string, string> = {
    A: "rgba(99,102,241,0.8)", B: "rgba(6,182,212,0.8)",
    C: "rgba(16,185,129,0.8)", D: "rgba(245,158,11,0.8)",
  };

  return (
    <div suppressHydrationWarning>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "1.25rem" }}>📚</span>
            <h1 className="page-title" style={{ margin: 0 }}>Question Bank Manager</h1>
          </div>
          <p className="page-subtitle">
            {selectedTopic > 0
              ? `Managing questions for: ${topics.find(t => t.id === selectedTopic)?.title || "Chapter"} (${questions.length} questions loaded)`
              : "Select Target Exam, Subject, and Chapter below to manage questions."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => { resetForm(); setShowForm(true); setShowBulk(false); setShowPdf(false); setIsMathMode(false); }}
            className="a-btn a-btn-primary"
            style={{ fontWeight: 700 }}
          >
            ➕ Add Question
          </button>
          <button
            onClick={() => { setShowBulk(!showBulk); setShowForm(false); setShowPdf(false); }}
            className="a-btn"
            style={{ background: showBulk ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" : "rgba(99,102,241,0.2)", borderColor: "#6366f1", color: "#fff", fontWeight: 700 }}
          >
            📥 3-in-1 Bulk Import (Excel/Text/JSON)
          </button>
          <button
            onClick={() => { setShowPdf(!showPdf); setShowForm(false); setShowBulk(false); }}
            className="a-btn a-btn-ghost"
            style={{ borderColor: "rgba(245,158,11,0.4)", color: "#fbbf24", fontWeight: 600 }}
          >
            📄 PDF Importer
          </button>
          {questions.length > 0 && selectedTopic > 0 && (
            <button
              onClick={handleDeleteAllInTopic}
              className="a-btn a-btn-danger"
              disabled={saving}
              style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
            >
              🗑️ Clear All ({questions.length})
            </button>
          )}
        </div>
      </div>

      {/* Systematic 3-Step Cascading Selector Card */}
      <div className="a-card" style={{ marginBottom: "1.5rem", border: "1px solid rgba(99,102,241,0.25)", background: "rgba(15,23,42,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📍 Step 1 ➔ 2 ➔ 3 Target Selector:
          </span>
          {selectedExam > 0 && (
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>
              {exams.find(e => e.id === selectedExam)?.title} {selectedSubject > 0 && `➔ ${subjects.find(s => s.id === selectedSubject)?.title}`} {selectedTopic > 0 && `➔ ${topics.find(t => t.id === selectedTopic)?.title}`}
            </span>
          )}
        </div>
        <div className="selector-grid">
          <div>
            <label className="a-label" style={{ fontWeight: 700, color: selectedExam ? "#818cf8" : "#94a3b8" }}>
              1. Target Exam *
            </label>
            <select className="a-input a-select" value={selectedExam} onChange={e => handleExamChange(Number(e.target.value))}>
              <option value={0}>Select Target Exam...</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} {ex.is_active === false ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="a-label" style={{ fontWeight: 700, color: selectedSubject ? "#818cf8" : "#94a3b8" }}>
              2. Subject *
            </label>
            <select className="a-input a-select" value={selectedSubject} onChange={e => handleSubjectChange(Number(e.target.value))} disabled={!selectedExam}>
              <option value={0}>Select Subject...</option>
              {filteredSubjects.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title} {sub.is_active === false ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="a-label" style={{ fontWeight: 700, color: selectedTopic ? "#818cf8" : "#94a3b8" }}>
              3. Chapter / Topic *
            </label>
            <select
              className="a-input a-select"
              value={selectedTopic}
              onChange={e => handleTopicChange(Number(e.target.value))}
              disabled={!selectedSubject}
            >
              <option value={0}>Select Topic / Chapter...</option>
              {(() => {
                const activeTopics = filteredTopics;
                const grouped: Record<string, any[]> = {};
                activeTopics.forEach((t: any) => {
                  const sec = t.description?.trim() || "General Topics";
                  if (!grouped[sec]) grouped[sec] = [];
                  grouped[sec].push(t);
                });

                const keys = Object.keys(grouped);
                if (keys.length <= 1 && keys[0] === "General Topics") {
                  return activeTopics.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ));
                }

                return keys.map((sec) => (
                  <optgroup key={sec} label={`📂 ${sec}`}>
                    {grouped[sec].map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </optgroup>
                ));
              })()}
            </select>
          </div>
        </div>
      </div>

      {/* ── PDF Upload Section ── */}
      {showPdf && selectedTopic > 0 && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(245,158,11,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ color: "#fff", fontWeight: 600 }}>📄 PDF se Questions Import</h3>
            {parsedQuestions.length > 0 && (
              <span className="a-badge a-badge-yellow">{parsedQuestions.length} questions milí</span>
            )}
          </div>

          {/* Drop Zone */}
          {!pdfFile && !pdfParsing && (
            <div
              className={`pdf-drop-zone ${pdfDragging ? "dragging" : ""}`}
              onDragOver={e => { e.preventDefault(); setPdfDragging(true); }}
              onDragLeave={() => setPdfDragging(false)}
              onDrop={e => { e.preventDefault(); setPdfDragging(false); const f = e.dataTransfer.files[0]; if(f) handlePdfUpload(f); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if(f) handlePdfUpload(f); }} />
              <div className="pdf-drop-icon">📄</div>
              <div className="pdf-drop-title">PDF yahan drop karo ya click karo</div>
              <div className="pdf-drop-hint">Text-based PDF · Max 10MB · MCQ format</div>
              <div className="pdf-supported">
                <span>✓ Numbered (Q1. Q2.)</span>
                <span>✓ Options (A) B) a.)</span>
                <span>✓ Answer: A/B/C/D</span>
              </div>
            </div>
          )}

          {/* Parsing loader */}
          {pdfParsing && (
            <div className="pdf-loading">
              <div className="pdf-spinner" />
              <div>
                <div style={{ color: "#fff", fontWeight: 600 }}>PDF parse ho rahi hai...</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Questions dhundh rahe hain</div>
              </div>
            </div>
          )}

          {/* Parsed questions preview */}
          {parsedQuestions.length > 0 && (
            <>
              <div className="pdf-preview-header">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={() => setSelectedParsed(new Set(parsedQuestions.map((_, i) => i)))}
                  >Select All</button>
                  <button
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={() => setSelectedParsed(new Set())}
                  >Deselect All</button>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                    {selectedParsed.size} / {parsedQuestions.length} selected
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={() => { setPdfFile(null); setParsedQuestions([]); setSelectedParsed(new Set()); }}
                  >🔄 New PDF</button>
                  <button
                    className="a-btn a-btn-primary"
                    onClick={importParsedQuestions}
                    disabled={importingPdf || selectedParsed.size === 0}
                  >
                    {importingPdf ? "Importing..." : `✅ Import ${selectedParsed.size} Questions`}
                  </button>
                </div>
              </div>

              <div className="parsed-list">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className={`parsed-q-card ${selectedParsed.has(idx) ? "selected" : "deselected"}`}>
                    <div className="parsed-q-header">
                      <label className="parsed-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedParsed.has(idx)}
                          onChange={() => toggleSelectParsed(idx)}
                        />
                        <span className="parsed-q-num">Q{idx + 1}</span>
                      </label>
                      {!q.correct_answer || q.correct_answer === "A" ? (
                        <span className="a-badge a-badge-yellow" style={{ fontSize: "0.65rem" }}>⚠ Answer verify karein</span>
                      ) : (
                        <span className="a-badge a-badge-green" style={{ fontSize: "0.65rem" }}>Ans: {q.correct_answer}</span>
                      )}
                    </div>

                    {/* Editable question text */}
                    <textarea
                      className="parsed-edit-input"
                      value={q.question_text}
                      onChange={e => updateParsedQuestion(idx, "question_text", e.target.value)}
                      rows={2}
                    />

                    {/* Options in 2-col grid */}
                    <div className="parsed-opts">
                      {(["A","B","C","D"] as const).map(opt => (
                        <div key={opt} className={`parsed-opt ${q.correct_answer === opt ? "correct" : ""}`}>
                          <button
                            className="parsed-opt-label"
                            style={q.correct_answer === opt ? { background: correctColors[opt] } : {}}
                            onClick={() => updateParsedQuestion(idx, "correct_answer", opt)}
                            title="Click to mark as correct"
                            type="button"
                          >{opt}</button>
                          <input
                            className="parsed-opt-input"
                            value={q[`option_${opt.toLowerCase()}`]}
                            onChange={e => updateParsedQuestion(idx, `option_${opt.toLowerCase()}`, e.target.value)}
                            placeholder={`Option ${opt}`}
                          />
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="parsed-explanation">💡 {q.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Professional Multi-Format Bulk Import Modal / Box ── */}
      {showBulk && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.4)", background: "rgba(15,23,42,0.85)" }}>
          {selectedTopic === 0 && (
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", padding: "0.6rem 1rem", borderRadius: "8px", color: "#fbbf24", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚠️</span>
              <span><b>Important:</b> Please make sure you select <b>1. Target Exam</b> ➔ <b>2. Subject</b> ➔ <b>3. Chapter</b> from the 3-step selector above before saving questions.</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem" }}>
            <div>
              <h3 style={{ color: "#fff", fontWeight: 800, margin: 0, fontSize: "1.1rem" }}>📥 Professional Bulk Question Importer</h3>
              <p style={{ margin: "0.25rem 0 0 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                Import questions using Excel, natural MCQ text, JSON, or the SSCZone line format.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {(() => {
                const s = subjects.find(sub => sub.id === Number(selectedSubject));
                const isMath = (s?.title || "").toLowerCase().includes("math") || (s?.title || "").toLowerCase().includes("quant");
                if (!isMath) return null;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label className="a-label" style={{ margin: 0, fontSize: "0.75rem" }}>Apply Tier to All:</label>
                    <select className="a-input a-select" style={{ padding: "0.25rem 0.5rem", minWidth: "110px", fontSize: "0.75rem" }} value={bulkTierLevel} onChange={e => setBulkTierLevel(e.target.value)}>
                      <option value="General">General / None</option>
                      <option value="Tier 1">Tier 1 Level</option>
                      <option value="Tier 2">Tier 2 Level</option>
                    </select>
                  </div>
                );
              })()}
              <button onClick={() => setShowBulk(false)} className="a-btn a-btn-ghost a-btn-sm">✕ Close</button>
            </div>
          </div>

          {/* Format Tabs Header */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => { setBulkMode("excel"); setBulkParsedQuestions([]); }}
              className={`a-btn a-btn-sm ${bulkMode === "excel" ? "a-btn-primary" : "a-btn-ghost"}`}
              style={{ fontWeight: 700 }}
            >
              📊 Excel / CSV Spreadsheet (Best)
            </button>
            <button
              type="button"
              onClick={() => { setBulkMode("smartText"); setBulkParsedQuestions([]); }}
              className={`a-btn a-btn-sm ${bulkMode === "smartText" ? "a-btn-primary" : "a-btn-ghost"}`}
              style={{ fontWeight: 700 }}
            >
              📝 Natural Exam MCQ Text
            </button>
            <button
              type="button"
              onClick={() => { setBulkMode("json"); setBulkParsedQuestions([]); }}
              className={`a-btn a-btn-sm ${bulkMode === "json" ? "a-btn-primary" : "a-btn-ghost"}`}
              style={{ fontWeight: 700 }}
            >
              💻 JSON Array
            </button>
            <button
              type="button"
              onClick={() => { setBulkMode("sscZoneLine"); setBulkParsedQuestions([]); }}
              className={`a-btn a-btn-sm ${bulkMode === "sscZoneLine" ? "a-btn-primary" : "a-btn-ghost"}`}
              style={{ fontWeight: 700 }}
            >
              ⚡ SSCZone Line Format
            </button>
            <button
              type="button"
              onClick={() => { setBulkMode("pyq"); loadPyqPapersList(); setBulkParsedQuestions([]); }}
              className={`a-btn a-btn-sm ${bulkMode === "pyq" ? "a-btn-primary" : "a-btn-ghost"}`}
              style={{ fontWeight: 700, borderColor: "rgba(99,102,241,0.5)", background: bulkMode === "pyq" ? "#4f46e5" : "rgba(79,70,229,0.15)", color: bulkMode === "pyq" ? "#fff" : "#a5b4fc" }}
            >
              🏛️ Import from PYQ Shift Papers
            </button>
          </div>

          {/* TAB 1: EXCEL / CSV DRAG & DROP */}
          {bulkMode === "excel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", padding: "0.75rem 1rem", borderRadius: "10px", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a5b4fc" }}>💡 Need standard column template?</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Download our ready-made Excel sheet pre-configured with questions, options, and explanation columns:</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" onClick={() => downloadExcelTemplate("xlsx")} className="a-btn a-btn-sm" style={{ background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)", color: "#34d399", fontWeight: 700 }}>
                    📥 Download Excel Template (.xlsx)
                  </button>
                  <button type="button" onClick={() => downloadExcelTemplate("csv")} className="a-btn a-btn-ghost a-btn-sm" style={{ fontSize: "0.75rem" }}>
                    CSV Template
                  </button>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className={`pdf-drop-zone ${excelDragging ? "dragging" : ""}`}
                onDragOver={e => { e.preventDefault(); setExcelDragging(true); }}
                onDragLeave={() => setExcelDragging(false)}
                onDrop={e => { e.preventDefault(); setExcelDragging(false); const f = e.dataTransfer.files[0]; if(f) handleExcelUpload(f); }}
                onClick={() => excelInputRef.current?.click()}
                style={{ padding: "2.5rem 1.5rem" }}
              >
                <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if(f) handleExcelUpload(f); }} />
                <div className="pdf-drop-icon" style={{ fontSize: "2rem" }}>📊</div>
                <div className="pdf-drop-title" style={{ fontSize: "1rem" }}>
                  {excelFile ? `Selected: ${excelFile.name}` : "Drop your Excel (.xlsx / .xls) or .csv file here"}
                </div>
                <div className="pdf-drop-hint">Click or drag & drop to auto-parse all questions instantly</div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART NATURAL MCQ TEXT PASTE */}
          {bulkMode === "smartText" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Paste questions copied from Word / Telegram / Books without any delimiters:
                </span>
                <button type="button" onClick={insertSampleSmartText} className="a-btn a-btn-ghost a-btn-sm" style={{ borderColor: "rgba(99,102,241,0.4)", color: "#818cf8", fontSize: "0.75rem" }}>
                  📋 Insert Sample MCQ Format
                </button>
              </div>

              <textarea
                className="a-input"
                rows={9}
                value={bulkSmartText}
                onChange={e => setBulkSmartText(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }}
                placeholder={`1. What is the value of (17)^3?
(A) 4913
(B) 4096
(C) 3375
(D) 2197
Ans: A
Exp: 17 * 17 * 17 = 4913
Exam: SSC CGL 2023 Tier-1`}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={parseSmartText} className="a-btn a-btn-primary" disabled={!bulkSmartText.trim()}>
                  ⚡ Parse Questions
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: JSON ARRAY IMPORTER */}
          {bulkMode === "json" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Paste structured JSON array for automated question dumps:
                </span>
                <button type="button" onClick={insertSampleJson} className="a-btn a-btn-ghost a-btn-sm" style={{ borderColor: "rgba(99,102,241,0.4)", color: "#818cf8", fontSize: "0.75rem" }}>
                  📋 Insert Sample JSON
                </button>
              </div>

              <textarea
                className="a-input"
                rows={9}
                value={bulkJsonText}
                onChange={e => setBulkJsonText(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }}
                placeholder={`[
  {
    "question_text": "What is 20% of 500?",
    "option_a": "100",
    "option_b": "200",
    "option_c": "50",
    "option_d": "150",
    "correct_answer": "A",
    "explanation": "20/100 * 500 = 100",
    "exam_tag": "SSC CGL 2023 Tier-1"
  }
]`}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={parseJsonText} className="a-btn a-btn-primary" disabled={!bulkJsonText.trim()}>
                  ⚡ Parse JSON Questions
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SSCZONE PIPE-DELIMITED FORMAT */}
          {bulkMode === "sscZoneLine" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  One question per line: Question || A || B || C || D || Answer || Explanation || Exam Tag
                </span>
                <button type="button" onClick={insertSampleSscZoneLineText} className="a-btn a-btn-ghost a-btn-sm" style={{ borderColor: "rgba(99,102,241,0.4)", color: "#818cf8", fontSize: "0.75rem" }}>
                  📋 Insert SSCZone Sample
                </button>
              </div>

              <textarea
                className="a-input"
                rows={10}
                value={bulkSscZoneText}
                onChange={e => setBulkSscZoneText(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }}
                placeholder={'Select the most appropriate synonym of the word "Hind".||Fore||Anterior||Ventral||Rear||D||Rear means the back part of something.||SSC Stenographer 10/12/2024 (Morning)'}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={parseSscZoneLineText} className="a-btn a-btn-primary" disabled={!bulkSscZoneText.trim()}>
                  ⚡ Parse SSCZone Questions
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: IMPORT DIRECTLY FROM PYQ SHIFT PAPERS */}
          {bulkMode === "pyq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", padding: "0.85rem 1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a5b4fc" }}>
                  🏛️ Import Real PYQ Questions into Chapter Bank (with 2-Way Sync)
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                  Select an official previous year shift paper below, choose questions belonging to this topic, and import them with 1-click automatic Exam Tags. Any future edits will automatically sync across both PYQ Paper and Question Bank!
                </div>
              </div>

              {/* Step 1: Select Shift Paper + Exam Tag preview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label className="a-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>1. Select PYQ Shift Paper:</label>
                  <select
                    className="a-input a-select"
                    value={selectedPyqPaperId}
                    onChange={(e) => handleSelectPyqPaper(Number(e.target.value))}
                    disabled={loadingPyq}
                  >
                    <option value={0}>-- Choose an Official Shift Paper --</option>
                    {pyqPapers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.year}) — {p.total_questions || 100} Qs
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="a-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>2. Auto Exam Tag (Editable):</label>
                  <input
                    type="text"
                    className="a-input"
                    value={pyqCustomTag}
                    onChange={(e) => setPyqCustomTag(e.target.value)}
                    placeholder="e.g. SSC CGL 2024 Tier 1"
                  />
                </div>
              </div>

              {loadingPyq && (
                <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                  ⏳ Loading paper questions...
                </div>
              )}

              {/* Step 2: Question Selector & Filters */}
              {selectedPyqPaperId > 0 && !loadingPyq && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    {/* Quick Section Filter */}
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setPyqSectionFilter("all")}
                        className={`a-btn a-btn-sm ${pyqSectionFilter === "all" ? "a-btn-primary" : "a-btn-ghost"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
                      >
                        All (1-100)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPyqSectionFilter("s1")}
                        className={`a-btn a-btn-sm ${pyqSectionFilter === "s1" ? "a-btn-primary" : "a-btn-ghost"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
                      >
                        Reasoning (1-25)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPyqSectionFilter("s2")}
                        className={`a-btn a-btn-sm ${pyqSectionFilter === "s2" ? "a-btn-primary" : "a-btn-ghost"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
                      >
                        GA (26-50)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPyqSectionFilter("s3")}
                        className={`a-btn a-btn-sm ${pyqSectionFilter === "s3" ? "a-btn-primary" : "a-btn-ghost"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
                      >
                        Quant / Maths (51-75)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPyqSectionFilter("s4")}
                        className={`a-btn a-btn-sm ${pyqSectionFilter === "s4" ? "a-btn-primary" : "a-btn-ghost"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
                      >
                        English (76-100)
                      </button>
                    </div>

                    {/* Search & Actions */}
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        className="a-input"
                        placeholder="Filter questions by word..."
                        value={pyqSearch}
                        onChange={(e) => setPyqSearch(e.target.value)}
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "160px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const visible = pyqQuestionsList.filter((q, idx) => {
                            const qNo = q.question_number || idx + 1;
                            if (pyqSectionFilter === "s1" && (qNo < 1 || qNo > 25)) return false;
                            if (pyqSectionFilter === "s2" && (qNo < 26 || qNo > 50)) return false;
                            if (pyqSectionFilter === "s3" && (qNo < 51 || qNo > 75)) return false;
                            if (pyqSectionFilter === "s4" && (qNo < 76 || qNo > 100)) return false;
                            if (pyqSearch && !q.question_text?.toLowerCase().includes(pyqSearch.toLowerCase())) return false;
                            return true;
                          });
                          setSelectedPyqQIds(new Set(visible.map((q) => q.id)));
                        }}
                        className="a-btn a-btn-ghost a-btn-sm"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Select Filtered
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPyqQIds(new Set())}
                        className="a-btn a-btn-ghost a-btn-sm"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Scrollable List of Questions */}
                  <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "0.5rem", background: "rgba(0,0,0,0.2)" }}>
                    {(() => {
                      const visible = pyqQuestionsList.filter((q, idx) => {
                        const qNo = q.question_number || idx + 1;
                        if (pyqSectionFilter === "s1" && (qNo < 1 || qNo > 25)) return false;
                        if (pyqSectionFilter === "s2" && (qNo < 26 || qNo > 50)) return false;
                        if (pyqSectionFilter === "s3" && (qNo < 51 || qNo > 75)) return false;
                        if (pyqSectionFilter === "s4" && (qNo < 76 || qNo > 100)) return false;
                        if (pyqSearch && !q.question_text?.toLowerCase().includes(pyqSearch.toLowerCase())) return false;
                        return true;
                      });

                      if (visible.length === 0) {
                        return (
                          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                            No questions match current filter.
                          </div>
                        );
                      }

                      return visible.map((q, idx) => {
                        const isSelected = selectedPyqQIds.has(q.id);
                        return (
                          <label
                            key={q.id}
                            style={{
                              display: "flex",
                              gap: "0.75rem",
                              alignItems: "flex-start",
                              padding: "0.6rem 0.75rem",
                              borderRadius: "8px",
                              border: isSelected ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.04)",
                              background: isSelected ? "rgba(99,102,241,0.12)" : "transparent",
                              cursor: "pointer",
                              marginBottom: "0.4rem",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedPyqQIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(q.id)) next.delete(q.id);
                                  else next.add(q.id);
                                  return next;
                                });
                              }}
                              style={{ marginTop: "0.2rem", cursor: "pointer" }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#4f46e5", color: "#fff", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                                  Q{q.question_number || idx + 1}
                                </span>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34d399" }}>
                                  Ans: ({q.correct_answer})
                                </span>
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#f1f5f9", lineHeight: 1.4, wordBreak: "break-word" }}>
                                {q.question_text}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem", marginTop: "0.35rem", fontSize: "0.7rem", color: "#94a3b8" }}>
                                <div>A: {q.option_a}</div>
                                <div>B: {q.option_b}</div>
                                <div>C: {q.option_c}</div>
                                <div>D: {q.option_d}</div>
                              </div>
                            </div>
                          </label>
                        );
                      });
                    })()}
                  </div>

                  {/* Execute Import CTA */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Selected: <strong style={{ color: "#a5b4fc" }}>{selectedPyqQIds.size} questions</strong> to import into <strong>{topics.find(t => t.id === selectedTopic)?.title || "Selected Chapter"}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleExecutePyqImport}
                      disabled={importingPyq || selectedPyqQIds.size === 0}
                      className="a-btn a-btn-primary"
                      style={{ fontWeight: 800, background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
                    >
                      {importingPyq ? "⏳ Importing..." : `📥 Import ${selectedPyqQIds.size} Questions to Chapter ➔`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LIVE PARSED QUESTIONS REVIEW TABLE & SAVE ACTION ── */}
          {bulkParsedQuestions.length > 0 && (
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>
                    🔍 Parsed Questions Review ({selectedBulkIndices.size} / {bulkParsedQuestions.length} Selected)
                  </span>
                  <span className="a-badge a-badge-green">Valid Format</span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={() => setSelectedBulkIndices(new Set(bulkParsedQuestions.map((_, i) => i)))}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={() => setSelectedBulkIndices(new Set())}
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBulkParsed}
                    className="a-btn a-btn-primary"
                    disabled={selectedBulkIndices.size === 0 || saving || !selectedTopic}
                    style={{
                      fontWeight: 800,
                      background: (!selectedTopic || selectedBulkIndices.size === 0)
                        ? "rgba(255,255,255,0.1)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderColor: "transparent",
                      padding: "0.5rem 1.25rem"
                    }}
                  >
                    {saving ? "Saving to Database..." : !selectedTopic ? "⚠️ Select Chapter Above First" : `🚀 Import ${selectedBulkIndices.size} Questions Now`}
                  </button>
                </div>
              </div>

              {/* Scrollable Preview Grid */}
              <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem", paddingRight: "0.5rem" }}>
                {bulkParsedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: selectedBulkIndices.has(idx) ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedBulkIndices.has(idx) ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBulkIndices.has(idx)}
                      onChange={() => {
                        setSelectedBulkIndices(prev => {
                          const next = new Set(prev);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        });
                      }}
                      style={{ cursor: "pointer", marginTop: "0.25rem", width: "16px", height: "16px" }}
                    />
                    <div style={{ flex: 1, fontSize: "0.8rem", lineHeight: "1.4" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#818cf8" }}>Q{idx + 1}.</span>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          {q.exam_tag && <span className="a-badge" style={{ fontSize: "0.65rem", background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>🎯 {q.exam_tag}</span>}
                          {q.tier_level && <span className="a-badge a-badge-yellow" style={{ fontSize: "0.65rem" }}>⚡ {q.tier_level}</span>}
                          <span className="a-badge a-badge-green" style={{ fontSize: "0.65rem" }}>Correct: Option ({q.correct_answer})</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: "#fff", marginBottom: "0.35rem" }}><MathText text={q.question_text} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem", fontSize: "0.75rem", color: "#94a3b8" }}>
                        <div><b>(A)</b> <MathText text={q.option_a} /></div>
                        <div><b>(B)</b> <MathText text={q.option_b} /></div>
                        <div><b>(C)</b> <MathText text={q.option_c} /></div>
                        <div><b>(D)</b> <MathText text={q.option_d} /></div>
                      </div>
                      {q.explanation && <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.35rem" }}>💡 <MathText text={q.explanation} /></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ color: "#fff", fontWeight: 600, margin: 0 }}>
              {editingId ? "✏️ Edit Question" : "➕ New Question"}
            </h3>
            {editingId && (
              <span className="a-badge a-badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                ⚡ 2-Way Sync Active: Edits auto-sync across PYQ Papers &amp; Question Bank
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", cursor: "pointer" }}>
                  <input type="checkbox" checked={showHindi} onChange={e => setShowHindi(e.target.checked)} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>🇮🇳 Enable Bilingual (Hindi) Fields</span>
                </label>
                <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "250px", flexWrap: "wrap" }}>
                  {(() => {
                    const s = subjects.find(sub => sub.id === Number(selectedSubject));
                    const title = (s?.title || "").toLowerCase();
                    const isMath = title.includes("math") || title.includes("quant") || title.includes("arithmetic") || title.includes("advance");
                    if (!isMath) return null;
                    return (
                      <div style={{ flex: 1 }}>
                        <label className="a-label">Tier Level</label>
                        <select className="a-input a-select" value={tierLevel} onChange={e => setTierLevel(e.target.value)}>
                          <option value="General">General / Basic</option>
                          <option value="Tier 1">Tier 1 Level</option>
                          <option value="Tier 2">Tier 2 Level</option>
                        </select>
                      </div>
                    );
                  })()}
                  <div style={{ flex: 1 }}>
                    <label className="a-label">Exam Tag (e.g. SSC CGL 2023)</label>
                    <input className="a-input" value={examTag} onChange={e => setExamTag(e.target.value)} placeholder="SSC CGL 2023 Tier-1" />
                  </div>
                </div>
              </div>

              <div>
                <label className="a-label">Question Image</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input type="file" accept="image/*" onChange={e => uploadAnyImage(e, setImageUrl)} disabled={uploadingImage} style={{ color: "#fff" }} />
                  {uploadingImage && <span style={{ color: "#fbbf24", fontSize: "0.8rem" }}>Uploading...</span>}
                  {imageUrl && <div style={{ position: "relative" }}><img src={imageUrl} alt="Uploaded" style={{ height: "40px", borderRadius: "4px" }} /><button type="button" onClick={() => setImageUrl("")} style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: "10px", border: "none", cursor: "pointer" }}>X</button></div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: showHindi ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                <div>
                  <label className="a-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Question Text (English) *</span>
                    {!isMathMode && (
                      <button type="button" onClick={() => setIsMathMode(true)} className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "2px 8px", fontSize: "0.7rem", borderColor: "rgba(99,102,241,0.5)", color: "#818cf8" }}>
                        📐 Enable Math Mode
                      </button>
                    )}
                  </label>
                  {isMathMode && <MathToolbar onInsert={handleInsertMath} />}
                  <textarea
                    className="a-input"
                    placeholder="Enter question. Powers x^2, roots √49, fractions 3/4, and TeX \(...\) all work."
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    onFocus={() => setActiveField("qText")}
                    rows={4}
                    required
                    style={{ resize: "vertical" }}
                  />
                  {isMathMode && qText && (
                    <div style={{ marginTop: "0.5rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed rgba(99,102,241,0.4)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#818cf8", marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase" }}>Live Preview:</div>
                      <MathPreview text={qText} className="text-gray-100" />
                    </div>
                  )}
                </div>
                {showHindi && (
                  <div>
                    <label className="a-label" style={{ color: "#818cf8" }}>Question Text (Hindi)</label>
                    <textarea
                      className="a-input"
                      placeholder="हिंदी में प्रश्न दर्ज करें..."
                      value={qTextHi}
                      onChange={e => setQTextHi(e.target.value)}
                      rows={3}
                      style={{ resize: "vertical", borderColor: "rgba(99,102,241,0.3)" }}
                    />
                  </div>
                )}
              </div>
              <div className="options-grid" style={{ gridTemplateColumns: showHindi ? "1fr" : "1fr 1fr" }}>
                {(["A", "B", "C", "D"] as const).map(opt => {
                  const val = opt === "A" ? opA : opt === "B" ? opB : opt === "C" ? opC : opD;
                  const setter = opt === "A" ? setOpA : opt === "B" ? setOpB : opt === "C" ? setOpC : setOpD;
                  const valHi = opt === "A" ? opAHi : opt === "B" ? opBHi : opt === "C" ? opCHi : opDHi;
                  const setterHi = opt === "A" ? setOpAHi : opt === "B" ? setOpBHi : opt === "C" ? setOpCHi : setOpDHi;
                  const imgVal = opt === "A" ? opAImg : opt === "B" ? opBImg : opt === "C" ? opCImg : opDImg;
                  const setImgVal = opt === "A" ? setOpAImg : opt === "B" ? setOpBImg : opt === "C" ? setOpCImg : setOpDImg;
                  
                  return (
                    <div key={opt} style={{ display: "grid", gridTemplateColumns: showHindi ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <label className="a-label" style={{ color: correct === opt ? correctColors[opt] : undefined }}>
                            Option {opt} (EN) {correct === opt ? "✓ (Correct)" : ""}
                          </label>
                        </div>
                        <input
                          className="a-input"
                          style={{ borderColor: correct === opt ? correctColors[opt] : undefined, marginBottom: "0.5rem" }}
                          placeholder={`Option ${opt}`}
                          value={val}
                          onChange={e => setter(e.target.value)}
                          onFocus={() => setActiveField(`op${opt}` as any)}
                        />
                        {isMathMode && val && (
                          <div style={{ marginTop: "0.25rem", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <MathPreview text={val} className="text-gray-200" />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <input type="file" accept="image/*" onChange={e => uploadAnyImage(e, setImgVal)} disabled={uploadingImage} style={{ color: "#fff", fontSize: "0.75rem", maxWidth: "150px" }} />
                          {imgVal && <div style={{ position: "relative" }}><img src={imgVal} alt="Uploaded" style={{ height: "30px", borderRadius: "4px" }} /><button type="button" onClick={() => setImgVal("")} style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", borderRadius: "50%", width: 14, height: 14, fontSize: "9px", border: "none", cursor: "pointer" }}>X</button></div>}
                        </div>
                      </div>
                      {showHindi && (
                        <div>
                          <label className="a-label" style={{ color: "#818cf8" }}>Option {opt} (HI)</label>
                          <input
                            className="a-input"
                            style={{ borderColor: "rgba(99,102,241,0.3)" }}
                            placeholder={`विकल्प ${opt}`}
                            value={valHi}
                            onChange={e => setterHi(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div>
                  <label className="a-label">Correct Answer *</label>
                  <div className="correct-pills">
                    {["A", "B", "C", "D"].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`correct-pill ${correct === opt ? "selected" : ""}`}
                        style={correct === opt ? { background: correctColors[opt], borderColor: correctColors[opt] } : {}}
                        onClick={() => setCorrect(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: showHindi ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                <div>
                  <label className="a-label">Explanation (EN, optional)</label>
                  <textarea
                    className="a-input"
                    placeholder="Explain why the correct answer is right..."
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600 }}>📷 Add Solution Figure / Diagram:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => uploadAnyImage(e, (url) => setExplanation(prev => (prev ? prev + "\n" : "") + `[Image: ${url}]`))}
                      disabled={uploadingImage}
                      style={{ color: "#fff", fontSize: "0.75rem" }}
                    />
                  </div>
                  {isMathMode && explanation && (
                    <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed rgba(99,102,241,0.4)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#818cf8", marginBottom: "0.35rem", fontWeight: 600, textTransform: "uppercase" }}>Solution Preview</div>
                      <MathPreview text={explanation} className="text-gray-200" />
                    </div>
                  )}
                </div>
                {showHindi && (
                  <div>
                    <label className="a-label" style={{ color: "#818cf8" }}>Explanation (HI, optional)</label>
                    <textarea
                      className="a-input"
                      placeholder="व्याख्या..."
                      value={explanationHi}
                      onChange={e => setExplanationHi(e.target.value)}
                      rows={2}
                      style={{ resize: "vertical", borderColor: "rgba(99,102,241,0.3)" }}
                    />
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600 }}>📷 हिंदी व्याख्या चित्र:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => uploadAnyImage(e, (url) => setExplanationHi(prev => (prev ? prev + "\n" : "") + `[Image: ${url}]`))}
                        disabled={uploadingImage}
                        style={{ color: "#fff", fontSize: "0.75rem" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Question" : "Save Question"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="a-btn a-btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      {selectedTopic > 0 && (
        <>
          {questions.length > 0 && (
            <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
                <input
                  className="a-input"
                  style={{ paddingLeft: "2.25rem" }}
                  placeholder={`Search in ${questions.length} questions...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Multi-Select & Batch Action Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.625rem 1rem", borderRadius: "10px", flexWrap: "wrap", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={filteredQ.length > 0 && selectedQIds.size === filteredQ.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <span>Select All ({selectedQIds.size}/{filteredQ.length})</span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {selectedQIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="a-btn a-btn-danger a-btn-sm"
                      disabled={saving}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      🗑️ Delete Selected ({selectedQIds.size})
                    </button>
                  )}

                  <button
                    onClick={handleDeleteAllInTopic}
                    className="a-btn a-btn-danger a-btn-sm"
                    disabled={saving}
                    style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171", display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    ⚠️ Delete All in Topic ({questions.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingQ ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
              Loading questions...
            </div>
          ) : filteredQ.length === 0 ? (
            <div className="a-card" style={{ padding: "3rem 2rem", textAlign: "center", border: "1px dashed rgba(99,102,241,0.35)", borderRadius: "16px", background: "rgba(15,23,42,0.4)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📚</div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                {questions.length === 0 ? `No Questions in this Chapter Yet!` : "No Matching Questions Found"}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", maxWidth: "480px", margin: "0 auto 1.5rem auto", lineHeight: "1.5" }}>
                {questions.length === 0
                  ? "Start building your high-quality Question Bank for this chapter. Choose one of the quick options below:"
                  : "Try searching with a different keyword or clear the search filter."}
              </p>
              {questions.length === 0 && (
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => { resetForm(); setShowForm(true); setShowBulk(false); setShowPdf(false); setIsMathMode(false); }}
                    className="a-btn a-btn-primary"
                    style={{ fontWeight: 700, padding: "0.6rem 1.2rem" }}
                  >
                    ➕ Add Single Question
                  </button>
                  <button
                    onClick={() => { setShowBulk(true); setShowForm(false); setShowPdf(false); }}
                    className="a-btn a-btn-ghost"
                    style={{ fontWeight: 700, padding: "0.6rem 1.2rem", borderColor: "rgba(99,102,241,0.4)", color: "#818cf8" }}
                  >
                    📥 Fast Bulk Text Import
                  </button>
                  <button
                    onClick={() => { setShowPdf(true); setShowForm(false); setShowBulk(false); }}
                    className="a-btn a-btn-ghost"
                    style={{ fontWeight: 700, padding: "0.6rem 1.2rem", borderColor: "rgba(245,158,11,0.4)", color: "#fbbf24" }}
                  >
                    📄 Upload from PDF
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredQ.map((q, i) => (
                <div key={q.id} className="q-card" style={selectedQIds.has(q.id) ? { borderColor: "rgba(99, 102, 241, 0.6)", background: "rgba(99, 102, 241, 0.05)" } : {}}>
                  <div className="q-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedQIds.has(q.id)}
                        onChange={() => toggleSelectOne(q.id)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      <div className="q-num">Q{i + 1}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {q.tier_level && (
                        <span style={{ display: "inline-block", background: "rgba(245,158,11,0.2)", color: "#fbbf24", padding: "2px 8px", borderRadius: "12px", fontSize: "0.65rem", fontWeight: "bold", marginBottom: "0.25rem", border: "1px solid rgba(245,158,11,0.4)" }}>
                          {q.tier_level}
                        </span>
                      )}
                      <p className="q-text"><MathText text={q.question_text} /></p>
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                      <button
                        onClick={() => toggleActive(q.id, q.is_active ?? true)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold transition-all border ${
                          (q.is_active ?? true)
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}
                        title={(q.is_active ?? true) ? "Turn OFF" : "Turn ON"}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${(q.is_active ?? true) ? "bg-emerald-400" : "bg-gray-500"}`} />
                        {(q.is_active ?? true) ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => handleEdit(q)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                      <button onClick={() => handleDelete(q.id)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                    </div>
                  </div>
                  <div className="q-options">
                    {(["A", "B", "C", "D"] as const).map(opt => {
                      const text = opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                      const isCorrect = q.correct_answer === opt;
                      return (
                        <div key={opt} className={`q-option ${isCorrect ? "correct" : ""}`}>
                          <span className="q-opt-label" style={isCorrect ? { background: correctColors[opt] } : {}}>
                            {opt}
                          </span>
                          <span className="q-opt-text">{text}</span>
                          {isCorrect && <span className="q-correct-check">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="q-explanation">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        .selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 768px) { .selector-grid { grid-template-columns: 1fr; } }

        .bulk-format-hint {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.03);
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .bulk-format-hint code { color: #fbbf24; font-family: monospace; }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 640px) { .options-grid { grid-template-columns: 1fr; } }

        .correct-pills { display: flex; gap: 0.5rem; margin-top: 0.375rem; }
        .correct-pill {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          font-weight: 700; font-size: 0.875rem;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .correct-pill:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
        .correct-pill.selected { color: #fff; }

        .q-card {
          background: #1a1d2e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.875rem;
          padding: 1.125rem;
          transition: border-color 0.15s;
        }
        .q-card:hover { border-color: rgba(255,255,255,0.12); }

        .q-header { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.875rem; }
        .q-num {
          flex-shrink: 0;
          width: 28px; height: 28px;
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #818cf8;
        }
        .q-text { flex: 1; font-size: 0.875rem; color: #fff; font-weight: 500; line-height: 1.5; }

        .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        @media (max-width: 600px) { .q-options { grid-template-columns: 1fr; } }

        .q-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.15s;
        }
        .q-option.correct {
          background: rgba(16,185,129,0.07);
          border-color: rgba(16,185,129,0.2);
        }
        .q-opt-label {
          width: 22px; height: 22px; flex-shrink: 0;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
        }
        .q-opt-text { font-size: 0.8rem; color: rgba(255,255,255,0.6); flex: 1; }
        .q-option.correct .q-opt-text { color: rgba(255,255,255,0.85); }
        .q-correct-check { color: #34d399; font-size: 0.8rem; font-weight: 700; margin-left: auto; }

        .q-explanation {
          margin-top: 0.75rem;
          padding: 0.625rem 0.875rem;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }

        /* ── PDF Upload CSS ── */
        .pdf-drop-zone {
          border: 2px dashed rgba(245,158,11,0.3);
          border-radius: 0.875rem;
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          background: rgba(245,158,11,0.03);
          transition: all 0.2s;
        }
        .pdf-drop-zone:hover, .pdf-drop-zone.dragging {
          border-color: #f59e0b;
          background: rgba(245,158,11,0.08);
        }
        .pdf-drop-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .pdf-drop-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem; }
        .pdf-drop-hint { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-bottom: 1rem; }
        .pdf-supported {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          font-size: 0.75rem; color: #fbbf24; opacity: 0.8;
        }

        .pdf-loading {
          display: flex; align-items: center; justify-content: center; gap: 1rem;
          padding: 2.5rem 1.5rem; text-align: center;
        }
        .pdf-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(245,158,11,0.2);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pdf-preview-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .parsed-list { display: flex; flex-direction: column; gap: 0.875rem; max-height: 600px; overflow-y: auto; padding-right: 0.25rem; }
        .parsed-q-card {
          background: #141724;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 1rem;
          transition: all 0.15s;
        }
        .parsed-q-card.selected { border-color: rgba(99,102,241,0.4); }
        .parsed-q-card.deselected { opacity: 0.4; }

        .parsed-q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.625rem; }
        .parsed-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .parsed-q-num { font-size: 0.8rem; font-weight: 700; color: #818cf8; }

        .parsed-edit-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          color: #fff; font-size: 0.85rem;
          margin-bottom: 0.625rem; outline: none;
          font-family: inherit; resize: vertical;
        }
        .parsed-edit-input:focus { border-color: #6366f1; background: rgba(255,255,255,0.08); }

        .parsed-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        @media (max-width: 600px) { .parsed-opts { grid-template-columns: 1fr; } }

        .parsed-opt {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.5rem; border-radius: 0.5rem;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .parsed-opt.correct { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.25); }
        .parsed-opt-label {
          width: 22px; height: 22px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: none;
          border-radius: 4px; color: #fff; font-size: 0.65rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .parsed-opt-input {
          width: 100%; background: transparent; border: none; color: #fff;
          font-size: 0.8rem; outline: none;
        }
        .parsed-explanation {
          margin-top: 0.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.5);
          background: rgba(245,158,11,0.06); padding: 0.4rem 0.625rem; border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}

// Trigger HMR

// Force rebuild for Turbopack cache invalidation 2
