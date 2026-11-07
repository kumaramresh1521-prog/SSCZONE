import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { splitBilingualText, splitBilingualOption } from "@/lib/question-sync";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function isCallerAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

// GET /api/admin/questions/import-pyq?paperId=123 OR GET /api/admin/questions/import-pyq (list papers)
export async function GET(req: NextRequest) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const paperId = searchParams.get("paperId");
  const checkStatus = searchParams.get("checkStatus");

  try {
    if (!paperId) {
      // Return list of available PYQ shift papers
      const { data: papers, error } = await supabaseAdmin
        .from("previous_papers")
        .select("id, title, year, total_questions, exams(title, slug)")
        .order("id", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ papers: papers ?? [] });
    }

    const pid = Number(paperId);

    // If checkStatus is requested, check which questions of this paper are in Question Bank
    if (checkStatus) {
      const { data: paper } = await supabaseAdmin
        .from("previous_papers")
        .select("id, title, year, exams(title, slug)")
        .eq("id", pid)
        .maybeSingle();

      const examTitle = (paper as any)?.exams?.title || "SSC CGL";
      const year = paper?.year || 2024;
      const tier = paper?.title?.toLowerCase().includes("tier 2") || paper?.title?.toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1";
      const autoExamTag = `${examTitle} ${year} ${tier}`.trim();

      // Find questions in QB with this exam_tag
      const { data: existingQBs } = await supabaseAdmin
        .from("questions")
        .select("id, topic_id, question_text, exam_tag, topics(id, title)")
        .eq("exam_tag", autoExamTag);

      // Also get paper questions to match by snippet
      const { data: pqs } = await supabaseAdmin
        .from("paper_questions")
        .select("id, question_number, question_text")
        .eq("paper_id", pid);

      const statusMap: Record<number, { inQb: boolean; qbId?: number; topicId?: number; topicTitle?: string }> = {};

      if (pqs && existingQBs) {
        const qbFingerprints = new Map<string, { id: number; topic_id: number; topicTitle?: string }>();
        existingQBs.forEach((q) => {
          const norm = (q.question_text || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 80);
          if (norm.length >= 10) {
            qbFingerprints.set(norm, {
              id: q.id,
              topic_id: q.topic_id,
              topicTitle: (q as any).topics?.title || undefined,
            });
          }
        });

        pqs.forEach((pq) => {
          const norm = (pq.question_text || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 80);
          if (qbFingerprints.has(norm)) {
            const hit = qbFingerprints.get(norm)!;
            statusMap[pq.id] = {
              inQb: true,
              qbId: hit.id,
              topicId: hit.topic_id,
              topicTitle: hit.topicTitle,
            };
          }
        });
      }

      return NextResponse.json({ statusMap, examTag: autoExamTag });
    }

    // Standard paper questions fetch
    const [paperRes, questionsRes] = await Promise.all([
      supabaseAdmin.from("previous_papers").select("id, title, year, exams(title, slug)").eq("id", pid).maybeSingle(),
      supabaseAdmin.from("paper_questions").select("*").eq("paper_id", pid).order("question_number", { ascending: true })
    ]);

    if (paperRes.error) throw paperRes.error;
    if (questionsRes.error) throw questionsRes.error;

    return NextResponse.json({
      paper: paperRes.data,
      questions: questionsRes.data ?? []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch PYQ data" }, { status: 500 });
  }
}

// POST /api/admin/questions/import-pyq
export async function POST(req: NextRequest) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { paperId, questionIds, topicId, customExamTag, tierLevel, assignments } = body;

    const pid = Number(paperId);
    if (!pid) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    // 1. Fetch paper metadata
    const { data: paper, error: pErr } = await supabaseAdmin
      .from("previous_papers")
      .select("id, title, year, exams(title, slug)")
      .eq("id", pid)
      .maybeSingle();

    if (pErr || !paper) throw new Error("Paper not found");

    const examTitle = (paper as any).exams?.title || "SSC Exam";
    const year = paper.year || 2024;
    const tier = tierLevel || (paper.title.toLowerCase().includes("tier 2") || paper.title.toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1");
    const autoExamTag = customExamTag?.trim() || `${examTitle} ${year} ${tier}`.trim();

    // 2. Build items list either from assignments (per-question topic) or questionIds + topicId
    let itemsToProcess: Array<{
      questionId: number;
      topicId: number;
      difficulty?: string;
      customTag?: string;
      overrideQText?: string;
      overrideQTextHi?: string;
      overrideOpA?: string;
      overrideOpB?: string;
      overrideOpC?: string;
      overrideOpD?: string;
      overrideExplanation?: string;
    }> = [];

    if (Array.isArray(assignments) && assignments.length > 0) {
      itemsToProcess = assignments.map((a: any) => ({
        questionId: Number(a.questionId),
        topicId: Number(a.topicId),
        difficulty: a.difficulty || "medium",
        customTag: a.customTag || autoExamTag,
        overrideQText: a.questionText,
        overrideQTextHi: a.questionTextHi,
        overrideOpA: a.optionA,
        overrideOpB: a.optionB,
        overrideOpC: a.optionC,
        overrideOpD: a.optionD,
        overrideExplanation: a.explanation,
      }));
    } else if (Array.isArray(questionIds) && questionIds.length > 0 && topicId) {
      const tid = Number(topicId);
      itemsToProcess = questionIds.map((qid: any) => ({
        questionId: Number(qid),
        topicId: tid,
        difficulty: "medium",
        customTag: autoExamTag,
      }));
    } else if (body.questionId && topicId) {
      // Single question forward
      itemsToProcess = [{
        questionId: Number(body.questionId),
        topicId: Number(topicId),
        difficulty: body.difficulty || "medium",
        customTag: autoExamTag,
        overrideQText: body.questionText,
        overrideQTextHi: body.questionTextHi,
        overrideOpA: body.optionA,
        overrideOpB: body.optionB,
        overrideOpC: body.optionC,
        overrideOpD: body.optionD,
        overrideExplanation: body.explanation,
      }];
    } else {
      return NextResponse.json({ error: "Missing questions or topicId" }, { status: 400 });
    }

    // 3. Fetch paper questions from DB
    const targetQIds = itemsToProcess.map((i) => i.questionId);
    const { data: pyqQuestions, error: qErr } = await supabaseAdmin
      .from("paper_questions")
      .select("*")
      .eq("paper_id", pid)
      .in("id", targetQIds);

    if (qErr || !pyqQuestions || pyqQuestions.length === 0) {
      throw new Error("No matching paper questions found");
    }

    const pqMap = new Map<number, any>();
    pyqQuestions.forEach((q) => pqMap.set(q.id, q));

    // 4. Format rows for questions table
    const formattedRows = itemsToProcess
      .filter((item) => pqMap.has(item.questionId))
      .map((item) => {
        const q = pqMap.get(item.questionId)!;

        const rawQText = item.overrideQText || q.question_text || "";
        const splitQ = splitBilingualText(rawQText);
        const optA = splitBilingualOption(item.overrideOpA || q.option_a);
        const optB = splitBilingualOption(item.overrideOpB || q.option_b);
        const optC = splitBilingualOption(item.overrideOpC || q.option_c);
        const optD = splitBilingualOption(item.overrideOpD || q.option_d);

        return {
          topic_id: item.topicId,
          question_text: splitQ.english || rawQText,
          question_text_hi: item.overrideQTextHi || (splitQ.isBilingual ? splitQ.hindi : null),
          option_a: optA.english || item.overrideOpA || q.option_a,
          option_b: optB.english || item.overrideOpB || q.option_b,
          option_c: optC.english || item.overrideOpC || q.option_c,
          option_d: optD.english || item.overrideOpD || q.option_d,
          option_a_hi: optA.isBilingual ? optA.hindi : null,
          option_b_hi: optB.isBilingual ? optB.hindi : null,
          option_c_hi: optC.isBilingual ? optC.hindi : null,
          option_d_hi: optD.isBilingual ? optD.hindi : null,
          correct_answer: (q.correct_answer || "A").toUpperCase(),
          explanation: item.overrideExplanation || q.explanation || null,
          exam_tag: item.customTag || autoExamTag,
          tier_level: tier === "Tier 1" || tier === "Tier 2" ? tier : null,
          year_reference: year,
          difficulty: item.difficulty || "medium",
          is_active: true,
        };
      });

    // 5. Batch insert into questions table
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("questions")
      .insert(formattedRows)
      .select("id, topic_id, question_text");

    if (insErr) throw insErr;

    return NextResponse.json({
      success: true,
      count: formattedRows.length,
      examTag: autoExamTag,
      insertedQuestions: inserted,
      message: `Successfully forwarded ${formattedRows.length} question(s) to Question Bank!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to import questions" }, { status: 500 });
  }
}
