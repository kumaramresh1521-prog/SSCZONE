import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getQuestionFingerprint } from "@/lib/question-dedup";

export const dynamic = "force-dynamic";

function normalizeAnswer(ans: unknown): "A" | "B" | "C" | "D" {
  if (typeof ans !== "string" && typeof ans !== "number") return "A";
  const str = String(ans).trim().toUpperCase();
  if (str === "1" || str === "A") return "A";
  if (str === "2" || str === "B") return "B";
  if (str === "3" || str === "C") return "C";
  if (str === "4" || str === "D") return "D";
  return "A";
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const SECTION_CONFIG = [
  { key: "reasoning", name: "General Intelligence & Reasoning", min: 1, max: 25, count: 25 },
  { key: "ga", name: "General Awareness (GK & Current Affairs)", min: 26, max: 50, count: 25 },
  { key: "quant", name: "Quantitative Aptitude (Maths)", min: 51, max: 75, count: 25 },
  { key: "english", name: "English Comprehension", min: 76, max: 100, count: 25 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const totalTarget = parseInt(searchParams.get("count") || "100", 10);
    const targetPerSection = Math.floor(totalTarget / 4);

    const fullQuestionSet: any[] = [];
    const seenFingerprints = new Set<string>();

    // Fetch all active/valid paper IDs and their titles from previous_papers
    const { data: validPapers } = await supabaseAdmin
      .from("previous_papers")
      .select("id, title")
      .order("id", { ascending: true });

    const paperMap = new Map<number, string>();
    const validPaperIds: number[] = [];
    (validPapers || []).forEach((p: any) => {
      validPaperIds.push(p.id);
      paperMap.set(p.id, p.title);
    });

    // Fetch questions section by section to guarantee perfect 25/25/25/25 balance
    for (const sec of SECTION_CONFIG) {
      const sectionQuestions: any[] = [];

      // 1. Pull from Official Shift PYQs across random valid papers
      if (validPaperIds.length > 0) {
        try {
          const randomPapers = shuffle(validPaperIds).slice(0, 8);
          const { data: pyqRows } = await supabaseAdmin
            .from("paper_questions")
            .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
            .in("paper_id", randomPapers)
            .gte("question_number", sec.min)
            .lte("question_number", sec.max)
            .limit(targetPerSection * 2);

          (pyqRows || []).forEach((q: any) => {
            if (q.question_text && q.option_a && q.option_b) {
              const paperTitle = paperMap.get(q.paper_id) || `PYQ Shift #${q.paper_id}`;
              const item = {
                id: `pyq_${q.id}`,
                section_key: sec.key,
                section_name: sec.name,
                question_text: q.question_text.trim(),
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: (q.option_c || "").trim(),
                option_d: (q.option_d || "").trim(),
                correct_answer: normalizeAnswer(q.correct_answer),
                explanation: q.explanation ? q.explanation.trim() : `Official SSC Shift Question Solution (${paperTitle}, Q.${q.question_number}).`,
                source: paperTitle,
              };
              const fp = getQuestionFingerprint(item);
              if (!seenFingerprints.has(fp)) {
                seenFingerprints.add(fp);
                sectionQuestions.push(item);
              }
            }
          });
        } catch (err) {
          console.error(`Error fetching PYQs for ${sec.key}:`, err);
        }
      }

      // 2. Also backfill from Question Bank if needed
      if (sectionQuestions.length < targetPerSection) {
        try {
          const randomOffset = Math.floor(Math.random() * 500);
          const { data: qbRows } = await supabaseAdmin
            .from("questions")
            .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, correct_answer, explanation")
            .eq("is_active", true)
            .range(randomOffset, randomOffset + targetPerSection * 2);

          (qbRows || []).forEach((q: any) => {
            if (q.question_text && q.option_a && q.option_b) {
              const item = {
                id: `qb_${q.id}`,
                section_key: sec.key,
                section_name: sec.name,
                question_text: q.question_text.trim(),
                question_text_hi: q.question_text_hi ? q.question_text_hi.trim() : undefined,
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: (q.option_c || "").trim(),
                option_d: (q.option_d || "").trim(),
                correct_answer: normalizeAnswer(q.correct_answer),
                explanation: q.explanation ? q.explanation.trim() : "Detailed SSCZONE solution.",
                source: "Question Bank",
              };
              const fp = getQuestionFingerprint(item);
              if (!seenFingerprints.has(fp)) {
                seenFingerprints.add(fp);
                sectionQuestions.push(item);
              }
            }
          });
        } catch (err) {
          console.error(`Error backfilling QB for ${sec.key}:`, err);
        }
      }

      // Shuffle section questions and take exact targetPerSection
      const shuffledSec = shuffle(sectionQuestions);
      const chosenSec = shuffledSec.slice(0, targetPerSection);
      fullQuestionSet.push(...chosenSec);
    }

    // Assign clean sequential IDs
    const final100 = fullQuestionSet.map((q, idx) => ({
      ...q,
      serial_number: idx + 1,
      id: `q_${Date.now()}_${idx + 1}`,
    }));

    return NextResponse.json({
      success: true,
      total_count: final100.length,
      distribution: {
        reasoning: final100.filter((q) => q.section_key === "reasoning").length,
        ga: final100.filter((q) => q.section_key === "ga").length,
        quant: final100.filter((q) => q.section_key === "quant").length,
        english: final100.filter((q) => q.section_key === "english").length,
      },
      answer_key_counts: {
        A: final100.filter((q) => q.correct_answer === "A").length,
        B: final100.filter((q) => q.correct_answer === "B").length,
        C: final100.filter((q) => q.correct_answer === "C").length,
        D: final100.filter((q) => q.correct_answer === "D").length,
      },
      questions: final100,
    });
  } catch (error: any) {
    console.error("100 Qs generator error:", error);
    return NextResponse.json(
      { error: "Failed to generate 100 questions", details: error.message },
      { status: 500 }
    );
  }
}
