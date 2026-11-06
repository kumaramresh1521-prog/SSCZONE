import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { requireAdmin } from "@/lib/api-auth";

// Smart MCQ parser — handles multiple common PDF formats
function parseMCQText(text: string): Array<{
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}> {
  const questions: any[] = [];

  // Normalize text: fix common PDF extraction issues
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n") // form feed
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00a0/g, " ") // non-breaking space
    .replace(/\n{3,}/g, "\n\n") // collapse excessive blank lines
    .trim();

  // ── Strategy 1: Adda247 / Split Solutions (Questions on top, Solutions S1. Ans at bottom) ──
  const strategy0 = parseSplitSolutionsMCQ(normalized);
  if (strategy0.length > 0) return strategy0;

  // ── Strategy 2: Numbered questions with labeled options ──
  const strategy1 = parseNumberedMCQ(normalized);
  if (strategy1.length > 0) return strategy1;

  // ── Strategy 3: Block-style ──
  const strategy2 = parseBlockMCQ(normalized);
  if (strategy2.length > 0) return strategy2;

  // ── Strategy 4: Pipe/delimiter separated ──
  const strategy3 = parsePipeSeparated(normalized);
  return strategy3;
}

function parseSplitSolutionsMCQ(text: string) {
  const solIndex = text.search(/\nS1\.\s*Ans/i);
  if (solIndex === -1) return [];

  const qSection = text.slice(0, solIndex);
  const solSection = text.slice(solIndex);

  const solMap: Record<number, { ans: string; explanation: string }> = {};
  const solBlocks = solSection.split(/\n(?=S\d+\.)/);

  solBlocks.forEach((b) => {
    const m = b.match(/S(\d+)\.\s*Ans\.?\s*\(?([a-dA-D])\)?/i);
    if (m) {
      const qNum = parseInt(m[1]);
      const ans = m[2].toUpperCase();
      const solText = b
        .replace(/^S\d+\.\s*Ans[^\n]*\n?/i, "")
        .replace(/^Sol\.\s*/i, "")
        .replace(/-- \d+ of \d+ --[\s\S]*?(?=\n|$)/g, "")
        .replace(/\d+\s+www\.[^\n]+/g, "")
        .trim();
      solMap[qNum] = { ans, explanation: solText };
    }
  });

  const questions: any[] = [];
  const qBlocks = qSection.split(/\n(?=\s*Q\d+[.)]\s)/);

  for (const block of qBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const qMatch = trimmed.match(/^Q(\d+)[.)]\s*([\s\S]+?)(?=\n\s*[\(\[]?[a-dA-D][\)\].]\s)/);
    if (!qMatch) continue;

    const qNum = parseInt(qMatch[1]);
    const qText = qMatch[2]
      .replace(/-- \d+ of \d+ --[\s\S]*?(?=\n|$)/g, "")
      .replace(/\d+\s+www\.[^\n]+/g, "")
      .replace(/\n+/g, " ")
      .trim();

    const optPattern = /[\(\[]?([a-dA-D])[\)\].]\s*([^\n]+)/g;
    const opts: Record<string, string> = {};
    let m;
    while ((m = optPattern.exec(trimmed)) !== null) {
      opts[m[1].toUpperCase()] = m[2].trim();
    }

    if (!opts.A || !opts.B || !opts.C || !opts.D) continue;

    const solInfo = solMap[qNum] || { ans: "A", explanation: "" };

    questions.push({
      question_text: qText,
      option_a: opts.A,
      option_b: opts.B,
      option_c: opts.C,
      option_d: opts.D,
      correct_answer: solInfo.ans || "A",
      explanation: solInfo.explanation || "",
    });
  }

  return questions;
}

function parseNumberedMCQ(text: string) {
  const questions: any[] = [];

  // Split on question numbers: "1.", "Q1.", "Q.1", "1)", "(1)"
  const qPattern = /(?:^|\n)[\s]*(?:Q\.?\s*)?(\d+)[.)]\s+/gm;
  const splits = text.split(/\n(?=\s*(?:Q\.?\s*)?\d+[.)]\s)/);

  for (const block of splits) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Extract question number and text
    const qMatch = trimmed.match(/^(?:Q\.?\s*)?(\d+)[.)]\s+([\s\S]*?)(?=\n\s*[\[\(（]?[AaBbCcDd][\]\)）.]\s)/);
    if (!qMatch) continue;

    const qText = qMatch[2].replace(/\n/g, " ").trim();
    if (qText.length < 5) continue;

    // Extract options — handles (A) A. A) [A] formats
    const optPattern = /[\[\(（]?([AaBbCcDd])[\]\)）.]\s*([^\n]+)/g;
    const opts: Record<string, string> = {};
    let m;
    while ((m = optPattern.exec(trimmed)) !== null) {
      opts[m[1].toUpperCase()] = m[2].trim();
    }

    if (!opts.A || !opts.B || !opts.C || !opts.D) continue;

    // Extract answer — "Ans:", "Answer:", "Correct Answer:", "Sol:", "Key:"
    const ansMatch = trimmed.match(
      /(?:Ans(?:wer)?|Correct(?:\s+Answer)?|Key|Sol(?:ution)?)\s*[:\-]\s*[\[\(]?([AaBbCcDd])[\]\)]?/i
    );
    const correct = ansMatch ? ansMatch[1].toUpperCase() : "";

    // Extract explanation after answer
    let explanation = "";
    const expMatch = trimmed.match(
      /(?:Explanation|Sol(?:ution)?|Hint)\s*[:\-]\s*([\s\S]+?)(?=\n\s*(?:Q\.?\s*)?\d+[.)]\s|$)/i
    );
    if (expMatch) explanation = expMatch[1].replace(/\n/g, " ").trim();

    questions.push({
      question_text: qText,
      option_a: opts.A,
      option_b: opts.B,
      option_c: opts.C,
      option_d: opts.D,
      correct_answer: correct || "A",
      explanation,
    });
  }

  return questions;
}

function parseBlockMCQ(text: string) {
  const questions: any[] = [];
  const blocks = text.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 5) continue;

    // First non-empty line that doesn't look like an option = question
    let qLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (!/^[\[\(（]?[AaBbCcDd][\]\)）.]/i.test(lines[i]) &&
          !/^(?:Ans|Answer|Key|Correct)/i.test(lines[i])) {
        // Remove leading number
        qLine = i;
        break;
      }
    }
    if (qLine === -1) continue;

    const qText = lines[qLine].replace(/^(?:Q\.?\s*)?\d+[.)]\s*/, "").trim();
    const opts: Record<string, string> = {};
    let correct = "";
    let explanation = "";

    for (let i = qLine + 1; i < lines.length; i++) {
      const optM = lines[i].match(/^[\[\(（]?([AaBbCcDd])[\]\)）.]\s*(.+)/i);
      if (optM) {
        opts[optM[1].toUpperCase()] = optM[2].trim();
        continue;
      }
      const ansM = lines[i].match(/(?:Ans(?:wer)?|Key|Correct)\s*[:\-]\s*[\[\(]?([AaBbCcDd])[\]\)]?/i);
      if (ansM) { correct = ansM[1].toUpperCase(); continue; }
      const expM = lines[i].match(/(?:Explanation|Sol|Hint)\s*[:\-]\s*(.+)/i);
      if (expM) { explanation = expM[1].trim(); }
    }

    if (!opts.A || !opts.B || !opts.C || !opts.D) continue;
    questions.push({ question_text: qText, option_a: opts.A, option_b: opts.B, option_c: opts.C, option_d: opts.D, correct_answer: correct || "A", explanation });
  }

  return questions;
}

function parsePipeSeparated(text: string) {
  const questions: any[] = [];
  const lines = text.split("\n").filter(l => l.includes("||") || l.includes("|"));

  for (const line of lines) {
    const sep = line.includes("||") ? "||" : "|";
    const parts = line.split(sep).map(p => p.trim());
    if (parts.length >= 5) {
      questions.push({
        question_text: parts[0],
        option_a: parts[1],
        option_b: parts[2],
        option_c: parts[3],
        option_d: parts[4],
        correct_answer: (parts[5] || "A").toUpperCase().charAt(0),
        explanation: parts[6] || "",
      });
    }
  }

  return questions;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be under 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Use PDFParse class with Uint8Array
    const parser = new PDFParse(uint8Array);
    const pdfResult = await parser.getText();

    const rawText = typeof pdfResult === "string" ? pdfResult : pdfResult?.text || "";
    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json({
        error: "Could not extract text from this PDF. It may be scanned/image-based. Try a text-based PDF.",
      }, { status: 422 });
    }

    const parsed = parseMCQText(rawText);

    return NextResponse.json({
      success: true,
      total_pages: (pdfResult as any)?.total || (pdfResult as any)?.numpages || 1,
      raw_text_preview: rawText.slice(0, 500),
      questions: parsed,
      count: parsed.length,
    });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse PDF" }, { status: 500 });
  }
}
