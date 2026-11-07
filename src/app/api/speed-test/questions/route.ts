import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getQuestionFingerprint } from "@/lib/question-dedup";

export const dynamic = "force-dynamic";

export interface NormalizedSpeedQuestion {
  id: string;
  originalId: number;
  source: "pyq" | "bank";
  subject: string;
  subjectKey: "quant" | "reasoning" | "english" | "ga";
  topic?: string;
  question_text: string;
  question_text_hi?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_hi?: string | null;
  option_b_hi?: string | null;
  option_c_hi?: string | null;
  option_d_hi?: string | null;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string | null;
  explanation_hi?: string | null;
  image_url?: string | null;
  option_a_image_url?: string | null;
  option_b_image_url?: string | null;
  option_c_image_url?: string | null;
  option_d_image_url?: string | null;
  paper_id?: number;
  question_number?: number;
}

// Subject IDs mapping for questions table
const SUBJECT_ID_MAP: Record<"quant" | "reasoning" | "english" | "ga", number[]> = {
  quant: [1, 6, 10],
  english: [2, 7, 11],
  reasoning: [3, 8, 12],
  ga: [4, 9, 13],
};

const SUBJECT_NAMES: Record<"quant" | "reasoning" | "english" | "ga", string> = {
  quant: "Quantitative Aptitude",
  reasoning: "General Intelligence & Reasoning",
  english: "English Comprehension",
  ga: "General Awareness",
};

function getTopicSubject(q: any): { topicTitle: string; subjectTitle: string } {
  const topicObj = Array.isArray(q?.topics) ? q?.topics[0] : q?.topics;
  const subjObj = Array.isArray(topicObj?.subjects) ? topicObj?.subjects[0] : topicObj?.subjects;
  return {
    topicTitle: topicObj?.title || "",
    subjectTitle: subjObj?.title || "",
  };
}

// Question number range in PYQs (100 questions per paper)
const PYQ_RANGES: Record<"quant" | "reasoning" | "english" | "ga", { min: number; max: number }> = {
  reasoning: { min: 1, max: 25 },
  ga: { min: 26, max: 50 },
  quant: { min: 51, max: 75 },
  english: { min: 76, max: 100 },
};

function normalizeAnswer(ans: unknown): "A" | "B" | "C" | "D" {
  if (typeof ans !== "string" && typeof ans !== "number") return "A";
  const str = String(ans).trim().toUpperCase();
  if (str === "1" || str === "A") return "A";
  if (str === "2" || str === "B") return "B";
  if (str === "3" || str === "C") return "C";
  if (str === "4" || str === "D") return "D";
  return "A";
}

// Fisher-Yates shuffle with seed variation
function shuffleArray<T>(array: T[], seedNumber: number): T[] {
  const arr = [...array];
  let s = seedNumber;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const j = Math.floor(rnd * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") || "random") as "random" | "subject" | "topic";
    const subjectParam = (searchParams.get("subject") || "all") as "all" | "quant" | "reasoning" | "english" | "ga";
    const topicIdParam = searchParams.get("topicId");
    const topicId = topicIdParam ? parseInt(topicIdParam, 10) : null;
    const requestedCount = Math.min(Math.max(parseInt(searchParams.get("count") || "25", 10), 5), 50);
    const userId = searchParams.get("userId") || "";
    const attemptId = searchParams.get("attemptId") || "";

    // Generate seed for user-based and attempt-based distinct random results
    let seed = Date.now();
    for (let i = 0; i < (userId + attemptId).length; i++) {
      seed = (seed + (userId + attemptId).charCodeAt(i) * 31) % 1000000;
    }

    const allQuestions: NormalizedSpeedQuestion[] = [];
    const seenFingerprints = new Set<string>();

    function addQuestion(q: NormalizedSpeedQuestion): boolean {
      if (!q.question_text || !q.question_text.trim() || !q.option_a || !q.option_b) {
        return false;
      }
      const fp = getQuestionFingerprint(q);
      if (seenFingerprints.has(fp)) {
        return false;
      }
      seenFingerprints.add(fp);
      allQuestions.push(q);
      return true;
    }

    if (mode === "topic") {
      // 1. CHAPTER / TOPIC MODE: Resilient multi-tier question selection
      let topicTitle = (searchParams.get("topicTitle") || "").trim();
      let resolvedSubjectKey: "quant" | "reasoning" | "english" | "ga" =
        subjectParam !== "all" ? subjectParam : "quant";

      // A. Lookup topic details from topics table
      if (topicId) {
        try {
          const { data: topicRec } = await supabaseAdmin
            .from("topics")
            .select("id, title, subject_id, subjects(id, title)")
            .eq("id", topicId)
            .single();

          if (topicRec) {
            if (!topicTitle) topicTitle = topicRec.title?.trim() || "";
            const sObj: any = Array.isArray(topicRec.subjects) ? topicRec.subjects[0] : topicRec.subjects;
            const sTitle = (sObj?.title || "").toLowerCase();
            if (sTitle.includes("math")) resolvedSubjectKey = "quant";
            else if (sTitle.includes("reason")) resolvedSubjectKey = "reasoning";
            else if (sTitle.includes("english")) resolvedSubjectKey = "english";
            else if (sTitle.includes("general") || sTitle.includes("knowledge")) resolvedSubjectKey = "ga";
            else if (subjectParam !== "all") resolvedSubjectKey = subjectParam;
          }
        } catch (tErr) {
          console.warn("Topic lookup warning:", tErr);
        }
      }

      // B. Tier 1: Direct matches from Question Bank by topic_id
      if (topicId) {
        const { data: qbRows, error: qbError } = await supabaseAdmin
          .from("questions")
          .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_answer, explanation, explanation_hi, image_url, option_a_image_url, option_b_image_url, option_c_image_url, option_d_image_url")
          .eq("topic_id", topicId)
          .eq("is_active", true)
          .limit(requestedCount * 2);

        if (qbError) console.error("Error fetching topic questions:", qbError);

        if (qbRows && qbRows.length > 0) {
          qbRows.forEach((q: any) => {
            addQuestion({
              id: `bank_${q.id}`,
              originalId: q.id,
              source: "bank",
              subject: SUBJECT_NAMES[resolvedSubjectKey],
              subjectKey: resolvedSubjectKey,
              topic: topicTitle || "Chapter Drill",
              question_text: q.question_text || "",
              question_text_hi: q.question_text_hi || null,
              option_a: q.option_a || "",
              option_b: q.option_b || "",
              option_c: q.option_c || "",
              option_d: q.option_d || "",
              option_a_hi: q.option_a_hi || null,
              option_b_hi: q.option_b_hi || null,
              option_c_hi: q.option_c_hi || null,
              option_d_hi: q.option_d_hi || null,
              correct_answer: normalizeAnswer(q.correct_answer),
              explanation: q.explanation || null,
              explanation_hi: q.explanation_hi || null,
              image_url: q.image_url || null,
              option_a_image_url: q.option_a_image_url || null,
              option_b_image_url: q.option_b_image_url || null,
              option_c_image_url: q.option_c_image_url || null,
              option_d_image_url: q.option_d_image_url || null,
            });
          });
        }
      }

      // C. Tier 2: Keyword search across Official PYQs (50 Shift Papers) for this Topic
      if (allQuestions.length < requestedCount && topicTitle) {
        const pyqRange = PYQ_RANGES[resolvedSubjectKey] || PYQ_RANGES.quant;
        const keywords = topicTitle
          .replace(/[^a-zA-Z0-9s]/g, " ")
          .split(/\s+/)
          .filter(
            (w) =>
              w.length >= 4 &&
              !["from", "that", "with", "into", "part", "test", "also", "each", "both", "some", "none"].includes(
                w.toLowerCase()
              )
          );

        for (const kw of keywords.slice(0, 3)) {
          if (allQuestions.length >= requestedCount) break;
          const { data: kwPyqs } = await supabaseAdmin
            .from("paper_questions")
            .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
            .gte("question_number", pyqRange.min)
            .lte("question_number", pyqRange.max)
            .ilike("question_text", `%${kw}%`)
            .limit(requestedCount - allQuestions.length + 5);

          if (kwPyqs) {
            kwPyqs.forEach((q: any) => {
              const qId = `pyq_${q.id}`;
              addQuestion({
                id: qId,
                originalId: q.id,
                source: "pyq",
                subject: SUBJECT_NAMES[resolvedSubjectKey],
                subjectKey: resolvedSubjectKey,
                topic: topicTitle ? `${topicTitle} (PYQ Shift #${q.paper_id})` : `Shift Paper #${q.paper_id}`,
                question_text: q.question_text || "",
                question_text_hi: null,
                option_a: q.option_a || "",
                option_b: q.option_b || "",
                option_c: q.option_c || "",
                option_d: q.option_d || "",
                correct_answer: normalizeAnswer(q.correct_answer),
                explanation: q.explanation || null,
                paper_id: q.paper_id,
                question_number: q.question_number,
              });
            });
          }
        }
      }

      // D. Tier 3: Seamless Backfill from Official Shift Papers for that Subject
      if (allQuestions.length < requestedCount) {
        const pyqRange = PYQ_RANGES[resolvedSubjectKey] || PYQ_RANGES.quant;
        const needed = requestedCount - allQuestions.length + 10;
        const randomOffset = Math.floor(Math.random() * 250);

        const { data: pyqFill } = await supabaseAdmin
          .from("paper_questions")
          .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
          .gte("question_number", pyqRange.min)
          .lte("question_number", pyqRange.max)
          .range(randomOffset, randomOffset + needed);

        (pyqFill || []).forEach((q: any) => {
          const qId = `pyq_${q.id}`;
          addQuestion({
            id: qId,
            originalId: q.id,
            source: "pyq",
            subject: SUBJECT_NAMES[resolvedSubjectKey],
            subjectKey: resolvedSubjectKey,
            topic: topicTitle ? `${topicTitle} & ${SUBJECT_NAMES[resolvedSubjectKey]} Drill` : `PYQ Official Shift #${q.paper_id}`,
            question_text: q.question_text || "",
            question_text_hi: null,
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: normalizeAnswer(q.correct_answer),
            explanation: q.explanation || null,
            paper_id: q.paper_id,
            question_number: q.question_number,
          });
        });
      }

      // E. Tier 4: For English, also draw from Question Bank if still needed
      if (allQuestions.length < requestedCount && resolvedSubjectKey === "english") {
        const randomQbOffset = Math.floor(Math.random() * 400);
        const { data: qbFill } = await supabaseAdmin
          .from("questions")
          .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_answer, explanation, explanation_hi, image_url")
          .eq("is_active", true)
          .range(randomQbOffset, randomQbOffset + (requestedCount - allQuestions.length + 10));

        (qbFill || []).forEach((q: any) => {
          const qId = `bank_${q.id}`;
          addQuestion({
            id: qId,
            originalId: q.id,
            source: "bank",
            subject: SUBJECT_NAMES.english,
            subjectKey: "english",
            topic: topicTitle || "English Practice",
            question_text: q.question_text || "",
            question_text_hi: q.question_text_hi || null,
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            option_a_hi: q.option_a_hi || null,
            option_b_hi: q.option_b_hi || null,
            option_c_hi: q.option_c_hi || null,
            option_d_hi: q.option_d_hi || null,
            correct_answer: normalizeAnswer(q.correct_answer),
            explanation: q.explanation || null,
            explanation_hi: q.explanation_hi || null,
            image_url: q.image_url || null,
          });
        });
      }
    } else if (mode === "subject" && subjectParam !== "all") {
      // 2. SUBJECT MODE: 50% from PYQs in that subject range, 50% from Question Bank
      const pyqRange = PYQ_RANGES[subjectParam] || PYQ_RANGES.quant;
      const targetQbSubjectIds = SUBJECT_ID_MAP[subjectParam] || [1];

      // Pick 2-3 random paper IDs out of 50 papers
      const randomPaperIds = [
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
      ];

      // Random offset for QB
      const randomQbOffset = Math.floor(Math.random() * 400);

      const [pyqRes, qbRes] = await Promise.all([
        supabaseAdmin
          .from("paper_questions")
          .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
          .in("paper_id", randomPaperIds)
          .gte("question_number", pyqRange.min)
          .lte("question_number", pyqRange.max)
          .limit(30),

        supabaseAdmin
          .from("questions")
          .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_answer, explanation, explanation_hi, image_url, option_a_image_url, option_b_image_url, option_c_image_url, option_d_image_url, topics!inner(id, title, subject_id)")
          .in("topics.subject_id", targetQbSubjectIds)
          .eq("is_active", true)
          .range(randomQbOffset, randomQbOffset + 30),
      ]);

      (pyqRes.data || []).forEach((q: any) => {
        addQuestion({
          id: `pyq_${q.id}`,
          originalId: q.id,
          source: "pyq",
          subject: SUBJECT_NAMES[subjectParam],
          subjectKey: subjectParam,
          topic: `PYQ Official Shift Paper #${q.paper_id}`,
          question_text: q.question_text || "",
          question_text_hi: null,
          option_a: q.option_a || "",
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          correct_answer: normalizeAnswer(q.correct_answer),
          explanation: q.explanation || null,
          paper_id: q.paper_id,
          question_number: q.question_number,
        });
      });

      (qbRes.data || []).forEach((q: any) => {
        addQuestion({
          id: `bank_${q.id}`,
          originalId: q.id,
          source: "bank",
          subject: SUBJECT_NAMES[subjectParam],
          subjectKey: subjectParam,
          topic: q.topics?.title || "Topic Question",
          question_text: q.question_text || "",
          question_text_hi: q.question_text_hi || null,
          option_a: q.option_a || "",
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          option_a_hi: q.option_a_hi || null,
          option_b_hi: q.option_b_hi || null,
          option_c_hi: q.option_c_hi || null,
          option_d_hi: q.option_d_hi || null,
          correct_answer: normalizeAnswer(q.correct_answer),
          explanation: q.explanation || null,
          explanation_hi: q.explanation_hi || null,
          image_url: q.image_url || null,
          option_a_image_url: q.option_a_image_url || null,
          option_b_image_url: q.option_b_image_url || null,
          option_c_image_url: q.option_c_image_url || null,
          option_d_image_url: q.option_d_image_url || null,
        });
      });
    } else {
      // 3. RANDOM / MIXED MODE (DEFAULT): Balanced across all 4 subjects
      // Each section gets ~6-7 questions: half from PYQ shifts, half from Question Bank
      const subjects: ("quant" | "reasoning" | "english" | "ga")[] = ["reasoning", "ga", "quant", "english"];
      const randomPaper1 = Math.floor(Math.random() * 50) + 1;
      const randomPaper2 = Math.floor(Math.random() * 50) + 1;
      const randomOffset = Math.floor(Math.random() * 2000);

      const [pyqRes, qbRes] = await Promise.all([
        supabaseAdmin
          .from("paper_questions")
          .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
          .in("paper_id", [randomPaper1, randomPaper2])
          .limit(60),

        supabaseAdmin
          .from("questions")
          .select("id, question_text, question_text_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_answer, explanation, explanation_hi, image_url, option_a_image_url, option_b_image_url, option_c_image_url, option_d_image_url, topics(id, title, subject_id, subjects(title))")
          .eq("is_active", true)
          .range(randomOffset, randomOffset + 50),
      ]);

      (pyqRes.data || []).forEach((q: any) => {
        let sKey: "quant" | "reasoning" | "english" | "ga" = "reasoning";
        const qNum = q.question_number || 1;
        if (qNum <= 25) sKey = "reasoning";
        else if (qNum <= 50) sKey = "ga";
        else if (qNum <= 75) sKey = "quant";
        else sKey = "english";

        addQuestion({
          id: `pyq_${q.id}`,
          originalId: q.id,
          source: "pyq",
          subject: SUBJECT_NAMES[sKey],
          subjectKey: sKey,
          topic: `SSC CGL Official Shift #${q.paper_id}`,
          question_text: q.question_text || "",
          question_text_hi: null,
          option_a: q.option_a || "",
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          correct_answer: normalizeAnswer(q.correct_answer),
          explanation: q.explanation || null,
          paper_id: q.paper_id,
          question_number: q.question_number,
        });
      });

      (qbRes.data || []).forEach((q: any) => {
        const { topicTitle, subjectTitle } = getTopicSubject(q);
        const subTitle = subjectTitle.toLowerCase();
        let sKey: "quant" | "reasoning" | "english" | "ga" = "ga";
        if (subTitle.includes("math")) sKey = "quant";
        else if (subTitle.includes("reason")) sKey = "reasoning";
        else if (subTitle.includes("english")) sKey = "english";

        addQuestion({
          id: `bank_${q.id}`,
          originalId: q.id,
          source: "bank",
          subject: SUBJECT_NAMES[sKey],
          subjectKey: sKey,
          topic: topicTitle || "Practice Question",
          question_text: q.question_text || "",
          question_text_hi: q.question_text_hi || null,
          option_a: q.option_a || "",
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          option_a_hi: q.option_a_hi || null,
          option_b_hi: q.option_b_hi || null,
          option_c_hi: q.option_c_hi || null,
          option_d_hi: q.option_d_hi || null,
          correct_answer: normalizeAnswer(q.correct_answer),
          explanation: q.explanation || null,
          explanation_hi: q.explanation_hi || null,
          image_url: q.image_url || null,
          option_a_image_url: q.option_a_image_url || null,
          option_b_image_url: q.option_b_image_url || null,
          option_c_image_url: q.option_c_image_url || null,
          option_d_image_url: q.option_d_image_url || null,
        });
      });
    }

    // Shuffle thoroughly using user/attempt seed (allQuestions is guaranteed valid and deduplicated)
    const shuffled = shuffleArray(allQuestions, seed);

    // Take exactly requestedCount (default 25)
    const finalSet = shuffled.slice(0, requestedCount);

    return NextResponse.json({
      success: true,
      mode,
      subject: subjectParam,
      topicId,
      count: finalSet.length,
      requestedCount,
      questions: finalSet,
      meta: {
        totalPoolFound: allQuestions.length,
        pyqCount: finalSet.filter((q) => q.source === "pyq").length,
        bankCount: finalSet.filter((q) => q.source === "bank").length,
      },
    });
  } catch (error: unknown) {
    console.error("Speed test questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate speed test", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
