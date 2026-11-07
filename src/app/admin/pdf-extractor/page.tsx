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
  const [savedPaperId, setSavedPaperId] = useState<number | null>(null);

  // Question Bank Modal State
  const [showQBankModal, setShowQBankModal] = useState<boolean>(false);
  const [qBankTopicId, setQBankTopicId] = useState<number>(1);
  const [savingToQBank, setSavingToQBank] = useState<boolean>(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState<boolean>(false);

  // Companion Folder / Multi-File Upload State
  const [htmlFileName, setHtmlFileName] = useState<string>("");
  const [loadedHtmlText, setLoadedHtmlText] = useState<string>("");
  const [pendingImageMap, setPendingImageMap] = useState<Record<string, string>>({});
  const [linkedImagesCount, setLinkedImagesCount] = useState<number>(0);

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

  // Replaces relative companion image paths with embedded Base64 data URLs
  function applyImagesToHtml(html: string, imgMap: Record<string, string>) {
    if (!html) return;
    let updated = html;
    if (Object.keys(imgMap).length > 0) {
      updated = updated.replace(/src=['"]([^'"]+)['"]/gi, (match, srcPath) => {
        const cleanFileName = srcPath.split("?")[0].split("/").pop()!.split("\\").pop()!;
        if (imgMap[cleanFileName]) {
          return `src="${imgMap[cleanFileName]}"`;
        }
        return match;
      });
    }
    setRawHtmlCode(updated);
  }

  // 1. Handle HTML File Selection
  function handleHtmlFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHtmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || "";
      setLoadedHtmlText(content);
      applyImagesToHtml(content, pendingImageMap);
      toast.success(`Loaded "${file.name}"!`);
    };
    reader.readAsText(file);
  }

  // 2. Handle Companion Images Selection (from _files folder)
  async function handleCompanionImagesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    toast.loading(`Processing ${files.length} companion images...`, { id: "img-loader" });
    const imgMap: Record<string, string> = { ...pendingImageMap };

    await Promise.all(
      files.map(async (img) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || "");
          reader.readAsDataURL(img);
        });
        const cleanName = img.name.split("/").pop()!.split("\\").pop()!;
        imgMap[cleanName] = base64;
      })
    );

    setPendingImageMap(imgMap);
    setLinkedImagesCount(Object.keys(imgMap).length);
    applyImagesToHtml(loadedHtmlText, imgMap);
    toast.success(`Linked ${files.length} images to HTML! All diagrams ready.`, { id: "img-loader" });
  }

  // 3. Handle Drag & Drop / Multiple Files at once
  async function handleMultiFilesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const htmlFile = files.find(f => f.name.endsWith(".html") || f.name.endsWith(".htm"));
    const imgFiles = files.filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f.name));

    if (htmlFile) {
      setHtmlFileName(htmlFile.name);
      const htmlText = await htmlFile.text();
      setLoadedHtmlText(htmlText);

      if (imgFiles.length > 0) {
        toast.loading(`Processing ${imgFiles.length} companion images...`, { id: "multi-loader" });
        const imgMap: Record<string, string> = {};
        await Promise.all(
          imgFiles.map(async (img) => {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve((ev.target?.result as string) || "");
              reader.readAsDataURL(img);
            });
            const cleanName = img.name.split("/").pop()!.split("\\").pop()!;
            imgMap[cleanName] = base64;
          })
        );
        setPendingImageMap(imgMap);
        setLinkedImagesCount(Object.keys(imgMap).length);
        applyImagesToHtml(htmlText, imgMap);
        toast.success(`Loaded "${htmlFile.name}" and linked ${imgFiles.length} pictures!`, { id: "multi-loader" });
      } else {
        setRawHtmlCode(htmlText);
        toast.success(`Loaded "${htmlFile.name}"!`);
      }
    } else if (imgFiles.length > 0) {
      await handleCompanionImagesSelected(e);
    }
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

      setSavedPaperId(paperId);
      toast.success(`Successfully published "${paperTitle}" with ${questions.length} questions to PYQ Section! 🎉`);
      setShowSaveModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save paper to database.");
    } finally {
      setSavingToDb(false);
    }
  }

  // Push to Question Bank
  async function handleSaveToQuestionBank() {
    if (!qBankTopicId) {
      toast.error("Please enter a valid Topic ID.");
      return;
    }
    setSavingToQBank(true);
    try {
      const qBankPayload = questions.map((q) => ({
        topic_id: qBankTopicId,
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
        explanation: q.explanation || null,
        exam_tag: `${metadata?.examName || "SSC CGL"} ${metadata?.testDate || "Official"}`.trim()
      }));

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qBankPayload)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to push to Question Bank");

      toast.success(`Successfully pushed ${questions.length} questions into Question Bank! 🎉`);
      setShowQBankModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save to Question Bank.");
    } finally {
      setSavingToQBank(false);
    }
  }

  // Generate and download publication-ready clean PDF
  function handleDownloadCleanPdf(mode: "student" | "solution") {
    if (!metadata || questions.length === 0) return;

    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Popup blocked! Please allow popups in your browser to print/save PDF.");
      return;
    }

    const title = metadata.examName || "SSC CGL 2026 Official Paper";
    const shiftInfo = `${metadata.testDate || ""} ${metadata.testTime || ""}`.trim();

    // Group questions by section
    const secGroups: Record<string, ExtractedQuestion[]> = {};
    for (const q of questions) {
      if (!secGroups[q.section]) secGroups[q.section] = [];
      secGroups[q.section].push(q);
    }

    let questionsHtml = "";
    Object.keys(secGroups).forEach((secName, sIdx) => {
      questionsHtml += `
        <div class="section-header">
          PART ${String.fromCharCode(65 + sIdx)}: ${secName.toUpperCase()} (${secGroups[secName].length} QUESTIONS)
        </div>
      `;

      secGroups[secName].forEach((q) => {
        const isSolution = mode === "solution";
        questionsHtml += `
          <div class="q-card">
            <div class="q-title">
              <span class="q-badge">Q.${q.question_number}</span>
              ${q.question_text ? `<span>${q.question_text}</span>` : ""}
            </div>
            ${q.image_url ? `<img src="${q.image_url}" class="q-img" />` : ""}
            <div class="options-container">
              ${(["A", "B", "C", "D"] as const).map(letter => {
                const optText = q[`option_${letter.toLowerCase()}` as keyof ExtractedQuestion] as string;
                const optImg = q[`option_${letter.toLowerCase()}_image_url` as keyof ExtractedQuestion] as string;
                const isCorrect = q.correct_answer === letter;
                const highlight = isSolution && isCorrect ? 'style="background: #dcfce7; border-color: #86efac; font-weight: bold;"' : "";
                return `
                  <div class="opt-row" ${highlight}>
                    <span class="opt-tag">(${letter})</span>
                    <div class="opt-body">
                      ${optText ? `<span>${optText}</span>` : ""}
                      ${optImg ? `<img src="${optImg}" class="opt-img" />` : ""}
                    </div>
                    ${isSolution && isCorrect ? `<span class="correct-badge">&#10003; Correct Answer</span>` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      });
    });

    let answerKeyHtml = "";
    if (mode === "student") {
      answerKeyHtml = `
        <div class="answer-key-page">
          <div class="section-header" style="background: #1e3a8a; color: white;">
            OFFICIAL ANSWER KEY &amp; SCORE DISTRIBUTION
          </div>
          <p style="font-size: 9pt; color: #4b5563; margin: 4px 0 10px 0;">
            Official scoring key extracted directly from SSC Response Sheet. Marking Scheme: +2.0 marks per correct question, -0.50 negative deduction.
          </p>
          <table class="key-grid">
            <thead>
              <tr>
                ${Array.from({ length: 10 }).map(() => `<th>Q</th><th>Ans</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }).map((_, row) => `
                <tr>
                  ${Array.from({ length: 10 }).map((_, col) => {
                    const qNum = col * 10 + row + 1;
                    const q = questions.find(item => item.question_number === qNum);
                    return `
                      <td class="q-num-cell"><strong>${qNum}</strong></td>
                      <td class="ans-cell"><strong>${q?.correct_answer || "-"}</strong></td>
                    `;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 8.5pt;">
            <strong>Expected Safe Score (Tier 1 Prelims):</strong> General/UR: 138-145 | OBC: 132-140 | EWS: 128-135 | SC: 112-120 | ST: 102-110.
          </div>
        </div>
      `;
    }

    const fullDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - ${shiftInfo} | SSC ZONE Official</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 14mm 14mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 10pt;
            line-height: 1.4;
          }
          .header-banner {
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo-text {
            font-size: 18pt;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
          }
          .logo-sub {
            font-size: 8pt;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .tagline-badge {
            font-size: 8pt;
            font-weight: 800;
            background: #eff6ff;
            color: #1e40af;
            border: 1px solid #bfdbfe;
            padding: 3px 8px;
            border-radius: 4px;
          }
          .exam-heading {
            font-size: 13pt;
            font-weight: 900;
            color: #0f172a;
            margin: 6px 0 2px 0;
          }
          .meta-bar {
            font-size: 8.5pt;
            color: #475569;
            font-weight: 600;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .section-header {
            background: #f1f5f9;
            border-left: 4px solid #2563eb;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            padding: 5px 10px;
            margin: 16px 0 10px 0;
            font-size: 10pt;
            font-weight: 800;
            color: #0f172a;
            page-break-after: avoid;
            break-after: avoid;
          }
          .q-card {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 11px;
            padding-bottom: 9px;
            border-bottom: 1px dashed #e2e8f0;
          }
          .q-title {
            font-size: 9.5pt;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
            display: flex;
            align-items: flex-start;
            gap: 6px;
          }
          .q-badge {
            background: #1e3a8a;
            color: white;
            font-size: 8pt;
            font-weight: 800;
            padding: 1px 6px;
            border-radius: 4px;
            shrink: 0;
          }
          .q-img {
            max-height: 180px;
            max-width: 95%;
            margin: 4px 0 6px 0;
            display: block;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
          }
          .options-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 12px;
            margin-top: 5px;
          }
          .opt-row {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 9pt;
            background: #fafafa;
          }
          .opt-tag {
            font-weight: 800;
            color: #475569;
          }
          .opt-body {
            flex: 1;
          }
          .opt-img {
            max-height: 65px;
            max-width: 90%;
            display: block;
          }
          .correct-badge {
            font-size: 7.5pt;
            font-weight: 800;
            color: #15803d;
            background: #dcfce7;
            padding: 1px 5px;
            border-radius: 3px;
          }
          .answer-key-page {
            page-break-before: always;
            break-before: always;
            margin-top: 20px;
          }
          .key-grid {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-top: 8px;
          }
          .key-grid th, .key-grid td {
            border: 1px solid #94a3b8;
            padding: 4px 2px;
            text-align: center;
          }
          .key-grid th {
            background: #f1f5f9;
            font-weight: 800;
            color: #1e293b;
          }
          .q-num-cell {
            background: #f8fafc;
            color: #334155;
          }
          .ans-cell {
            color: #1e3a8a;
            font-weight: 900;
          }
          .footer-note {
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div class="top-row">
            <div>
              <div class="logo-text">SSC ZONE</div>
              <div class="logo-sub">www.ssczone.in &bull; Official Shift Paper Series</div>
            </div>
            <div class="tagline-badge">
              ${mode === "student" ? "STUDENT QUESTION PAPER" : "COMPLETE SOLUTION BOOKLET"}
            </div>
          </div>
          <div class="exam-heading">${title.toUpperCase()}</div>
          <div class="meta-bar">
            <span><strong>Date &amp; Shift:</strong> ${shiftInfo || "Official Response Sheet"}</span>
            <span>&bull;</span>
            <span><strong>Total Questions:</strong> ${questions.length} Qs</span>
            <span>&bull;</span>
            <span><strong>Max Marks:</strong> 200 Marks</span>
            <span>&bull;</span>
            <span><strong>Duration:</strong> 60 Minutes</span>
          </div>
        </div>

        ${questionsHtml}
        ${answerKeyHtml}

        <div class="footer-note">
          Published by SSC ZONE &bull; Practice Unlimited SSC PYQ &amp; CBT Mock Tests online at www.ssczone.in
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(fullDoc);
    printWin.document.close();
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

        {/* Tab 2: Upload Saved Offline Files (HTML + Companion Images Folder) */}
        {activeTab === "file" && (
          <div className="space-y-4">
            
            {/* Informative Tip Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <span className="p-1 rounded-md bg-amber-300 text-amber-950 shrink-0 font-black text-[10px]">INFO</span>
              <div className="space-y-1">
                <div>
                  <strong>How Chrome saves answer keys:</strong> When you press <code>Ctrl + S</code> in Chrome, it creates an <code>.html</code> file AND a companion folder (e.g. <code>ViewCandResponse_files/</code>) containing all the question images.
                </div>
                <div className="text-[11px] text-amber-800">
                  Select the <strong>.html file</strong> in Box 1, and the <strong>images folder/files</strong> in Box 2. We automatically link all pictures! (Or simply use <strong>Method 1: Live URL</strong> to avoid saving any files).
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: HTML File */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border-2 border-dashed border-blue-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800">
                    Step 1: Select Main HTML File (.html):
                  </label>
                  {htmlFileName && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-black">
                      ✓ Loaded: {htmlFileName}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleHtmlFileSelected}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Select the main <code>.html</code> file saved by Chrome.
                </p>
              </div>

              {/* Box 2: Companion Images Folder */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border-2 border-dashed border-indigo-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800">
                    Step 2: Select Images from &ldquo;_files&rdquo; Folder:
                  </label>
                  {linkedImagesCount > 0 && (
                    <span className="text-[10px] text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full font-black">
                      ✓ {linkedImagesCount} Pictures Linked
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleCompanionImagesSelected}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Open the companion <code>_files</code> folder, press <code>Ctrl+A</code> and select all images.
                </p>
              </div>

            </div>

            {/* Single multi-file / drag & drop box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong>Alternative: Select Both Together at once</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  You can also select both the .html file and all picture files together in a single selection.
                </p>
              </div>
              <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto">
                <Upload className="w-3.5 h-3.5" />
                <span>Select Multiple Files</span>
                <input
                  type="file"
                  multiple
                  accept=".html,.htm,.zip,.jpg,.jpeg,.png"
                  onChange={handleMultiFilesUpload}
                  className="hidden"
                />
              </label>
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
                
                {/* PDF Download Button with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPdfDropdownOpen(!pdfDropdownOpen)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-blue-200" />
                    <span>Download Clean PDF</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  {pdfDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPdfDropdownOpen(false);
                          handleDownloadCleanPdf("student");
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 text-slate-900 transition-colors cursor-pointer group"
                      >
                        <div className="text-xs font-black text-blue-900 flex items-center justify-between">
                          <span>🎓 Student Practice PDF</span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Key at End</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Clean test paper layout with 10x10 answer key grid at the last page.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPdfDropdownOpen(false);
                          handleDownloadCleanPdf("solution");
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-slate-900 transition-colors cursor-pointer group"
                      >
                        <div className="text-xs font-black text-emerald-900 flex items-center justify-between">
                          <span>📖 Complete Solution Booklet</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Answers Marked</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Every question has its official answer highlighted in green.
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Save to PYQ Section Button */}
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Publish to PYQ Section (/papers)</span>
                </button>

                {/* Push to Question Bank Button */}
                <button
                  type="button"
                  onClick={() => setShowQBankModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Add to Question Bank</span>
                </button>

                {/* JSON Export */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Download JSON"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>JSON</span>
                </button>

                {/* CSV Export */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Download CSV"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Live Paper Published Notification */}
            {savedPaperId && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black text-emerald-950">
                      Paper &ldquo;{paperTitle}&rdquo; is now LIVE on your website!
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                      Paper ID #{savedPaperId} &bull; Students can attempt this test online right now.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/papers"
                    target="_blank"
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-black hover:bg-emerald-100 transition-colors"
                  >
                    View in PYQ Portal (/papers)
                  </Link>
                  <Link
                    href={`/take-test/${savedPaperId}`}
                    target="_blank"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Attempt Test Online &rarr;
                  </Link>
                </div>
              </div>
            )}

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

      {/* ── QUESTION BANK MODAL ── */}
      {showQBankModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Add Extracted Questions to Question Bank</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQBankModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Target Topic / Chapter ID:</label>
                <input
                  type="number"
                  value={qBankTopicId}
                  onChange={(e) => setQBankTopicId(parseInt(e.target.value, 10))}
                  placeholder="e.g. 1"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  All 100 questions will be tagged with this Topic and will automatically appear in Chapter-Wise Practice and Daily Quiz Generator.
                </p>
              </div>

              <div>
                <label className="block mb-1">Exam Tag Label:</label>
                <input
                  type="text"
                  readOnly
                  value={`${metadata?.examName || "SSC CGL"} ${metadata?.testDate || "Official"}`}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 space-y-1">
                <div>✓ Questions will be inserted into the global <code>questions</code> table.</div>
                <div>✓ Available across Chapter Practice, Speed Tests, and AI Question Search.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQBankModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveToQuestionBank}
                disabled={savingToQBank}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
              >
                {savingToQBank ? "Pushing Questions..." : "Confirm & Push to Bank"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
