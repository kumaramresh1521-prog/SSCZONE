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

    // Return questions of the requested paper
    const pid = Number(paperId);
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
    const { paperId, questionIds, topicId, customExamTag, tierLevel } = body;

    const pid = Number(paperId);
    const tid = Number(topicId);

    if (!pid || !tid || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: "Missing paperId, topicId, or questionIds" }, { status: 400 });
    }

    // 1. Fetch paper metadata to build accurate automatic exam tag
    const { data: paper, error: pErr } = await supabaseAdmin
      .from("previous_papers")
      .select("id, title, year, exams(title, slug)")
      .eq("id", pid)
      .maybeSingle();

    if (pErr || !paper) throw new Error("Paper not found");

    // Compute automatic exam tag: e.g. "SSC CGL 2024 Tier 1"
    const examTitle = (paper as any).exams?.title || "SSC Exam";
    const year = paper.year || 2024;
    const tier = tierLevel || (paper.title.toLowerCase().includes("tier 2") || paper.title.toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1");
    const autoExamTag = customExamTag?.trim() || `${examTitle} ${year} ${tier}`.trim();

    // 2. Fetch specific questions from paper_questions
    const { data: pyqQuestions, error: qErr } = await supabaseAdmin
      .from("paper_questions")
      .select("*")
      .eq("paper_id", pid)
      .in("id", questionIds);

    if (qErr || !pyqQuestions || pyqQuestions.length === 0) {
      throw new Error("No matching paper questions found");
    }

    // 3. Format questions for insertion into `questions` table (Question Bank)
    const formattedRows = pyqQuestions.map((q) => {
      const splitQ = splitBilingualText(q.question_text);
      const optA = splitBilingualOption(q.option_a);
      const optB = splitBilingualOption(q.option_b);
      const optC = splitBilingualOption(q.option_c);
      const optD = splitBilingualOption(q.option_d);

      return {
        topic_id: tid,
        question_text: splitQ.english || q.question_text,
        question_text_hi: splitQ.isBilingual ? splitQ.hindi : null,
        option_a: optA.english || q.option_a,
        option_b: optB.english || q.option_b,
        option_c: optC.english || q.option_c,
        option_d: optD.english || q.option_d,
        option_a_hi: optA.isBilingual ? optA.hindi : null,
        option_b_hi: optB.isBilingual ? optB.hindi : null,
        option_c_hi: optC.isBilingual ? optC.hindi : null,
        option_d_hi: optD.isBilingual ? optD.hindi : null,
        correct_answer: (q.correct_answer || "A").toUpperCase(),
        explanation: q.explanation || null,
        exam_tag: autoExamTag,
        tier_level: tier === "Tier 1" || tier === "Tier 2" ? tier : null,
        year_reference: year,
        difficulty: "medium",
        is_active: true,
      };
    });

    // 4. Batch insert into questions table
    const { error: insErr } = await supabaseAdmin
      .from("questions")
      .insert(formattedRows);

    if (insErr) throw insErr;

    return NextResponse.json({
      success: true,
      count: formattedRows.length,
      examTag: autoExamTag,
      message: `Successfully imported ${formattedRows.length} questions into Question Bank with tag "${autoExamTag}"!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to import questions" }, { status: 500 });
  }
}
