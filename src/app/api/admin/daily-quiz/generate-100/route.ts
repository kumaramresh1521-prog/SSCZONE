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
  { key: "reasoning", name: "General Intelligence & Reasoning", min: 1, max: 25, qbSubjectIds: [3, 8, 12] },
  { key: "ga", name: "General Awareness (GK & Current Affairs)", min: 26, max: 50, qbSubjectIds: [4, 9, 13] },
  { key: "quant", name: "Quantitative Aptitude (Maths)", min: 51, max: 75, qbSubjectIds: [1, 6, 10] },
  { key: "english", name: "English Comprehension", min: 76, max: 100, qbSubjectIds: [2, 7, 11] },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const totalTarget = Math.max(parseInt(searchParams.get("count") || "100", 10), 5);
    const subjectParam = searchParams.get("subject") || "mixed"; // mixed | quant | reasoning | ga | english

    const fullQuestionSet: any[] = [];
    const seenFingerprints = new Set<string>();

    // Dynamically fetch all active papers from previous_papers (Zero hardcoded paper limits!)
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

    // Fallback if previous_papers is empty: discover distinct paper_ids dynamically from paper_questions
    if (validPaperIds.length === 0) {
      const { data: distinctPapers } = await supabaseAdmin
        .from("paper_questions")
        .select("paper_id")
        .limit(1000);
      const ids = Array.from(new Set((distinctPapers || []).map((p: any) => p.paper_id)));
      validPaperIds.push(...ids);
    }

    // Determine target sections
    const activeSections = subjectParam !== "mixed" && subjectParam !== "all"
      ? SECTION_CONFIG.filter((s) => s.key === subjectParam)
      : SECTION_CONFIG;

    const basePerSec = Math.floor(totalTarget / activeSections.length);
    const remainder = totalTarget % activeSections.length;

    for (let sIdx = 0; sIdx < activeSections.length; sIdx++) {
      const sec = activeSections[sIdx];
      const targetForSec = basePerSec + (sIdx < remainder ? 1 : 0);

      // Target: 50% Official Shift PYQs + 50% Question Bank
      const pyqQuota = Math.ceil(targetForSec * 0.5);
      const qbQuota = targetForSec - pyqQuota;

      const secPyqs: any[] = [];
      const secQb: any[] = [];

      // 1. Fetch from Official Shift PYQs across dynamically picked active papers
      if (validPaperIds.length > 0) {
        try {
          const randomPapers = shuffle(validPaperIds).slice(0, 10);
          const { data: pyqRows } = await supabaseAdmin
            .from("paper_questions")
            .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
            .in("paper_id", randomPapers)
            .gte("question_number", sec.min)
            .lte("question_number", sec.max)
            .limit(targetForSec * 3);

          const shuffled = shuffle(pyqRows || []);
          for (const q of shuffled) {
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
                source_type: "pyq",
              };
              const fp = getQuestionFingerprint(item);
              if (!seenFingerprints.has(fp)) {
                secPyqs.push({ item, fp });
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching PYQs for ${sec.key}:`, err);
        }
      }

      // 2. Fetch from Question Bank for this section
      try {
        const randomOffset = Math.floor(Math.random() * 200);
        const { data: qbRows } = await supabaseAdmin
          .from("questions")
          .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, correct_answer, explanation, topics!inner(id, title, subject_id)")
          .in("topics.subject_id", sec.qbSubjectIds)
          .eq("is_active", true)
          .range(randomOffset, randomOffset + targetForSec * 2);

        const rowsToUse = (qbRows && qbRows.length > 0)
          ? qbRows
          : (await supabaseAdmin
              .from("questions")
              .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, correct_answer, explanation, topics!inner(id, title, subject_id)")
              .in("topics.subject_id", sec.qbSubjectIds)
              .eq("is_active", true)
              .limit(targetForSec * 2)
            ).data || [];

        const shuffled = shuffle(rowsToUse);
        for (const q of shuffled) {
          if (q.question_text && q.option_a && q.option_b) {
            const topicObj: any = Array.isArray(q.topics) ? q.topics[0] : q.topics;
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
              explanation: q.explanation ? q.explanation.trim() : "Detailed SSCZONE question bank solution.",
              source: `Question Bank: ${topicObj?.title || "Practice"}`,
              source_type: "bank",
            };
            const fp = getQuestionFingerprint(item);
            if (!seenFingerprints.has(fp)) {
              secQb.push({ item, fp });
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching QB for ${sec.key}:`, err);
      }

      // Add up to pyqQuota from PYQs
      let secAdded = 0;
      let pyqCount = 0;
      let qbCount = 0;

      for (const { item, fp } of secPyqs) {
        if (pyqCount >= pyqQuota) break;
        seenFingerprints.add(fp);
        fullQuestionSet.push(item);
        pyqCount++;
        secAdded++;
      }

      // Add up to qbQuota from Question Bank
      for (const { item, fp } of secQb) {
        if (qbCount >= qbQuota || secAdded >= targetForSec) break;
        if (!seenFingerprints.has(fp)) {
          seenFingerprints.add(fp);
          fullQuestionSet.push(item);
          qbCount++;
          secAdded++;
        }
      }

      // Reciprocal fallback: If QB didn't have enough (e.g. Quant/GA), top up from PYQs!
      if (secAdded < targetForSec) {
        for (const { item, fp } of secPyqs) {
          if (secAdded >= targetForSec) break;
          if (!seenFingerprints.has(fp)) {
            seenFingerprints.add(fp);
            fullQuestionSet.push(item);
            pyqCount++;
            secAdded++;
          }
        }
      }

      // Reciprocal fallback: If PYQs didn't have enough, top up from Question Bank!
      if (secAdded < targetForSec) {
        for (const { item, fp } of secQb) {
          if (secAdded >= targetForSec) break;
          if (!seenFingerprints.has(fp)) {
            seenFingerprints.add(fp);
            fullQuestionSet.push(item);
            qbCount++;
            secAdded++;
          }
        }
      }
    }

    // Shuffle final set so PYQ and Question Bank questions are interspersed naturally
    const shuffledSet = shuffle(fullQuestionSet).slice(0, totalTarget);

    // Assign clean sequential serial numbers
    const final100 = shuffledSet.map((q, idx) => ({
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
      sources: {
        pyq_count: final100.filter((q) => q.source_type === "pyq").length,
        bank_count: final100.filter((q) => q.source_type === "bank").length,
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
