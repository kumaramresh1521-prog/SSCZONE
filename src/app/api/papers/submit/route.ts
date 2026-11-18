import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";
import { getMarkingScheme } from "@/lib/marking-scheme";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paperId, answers, timeSpentSeconds, attemptId } = body;

    if (!paperId || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
    }

    // 1. Fetch paper details and genuine questions
    const [paperRes, questionsRes] = await Promise.all([
      supabaseAdmin.from("previous_papers").select("*, exams(title)").eq("id", paperId).single(),
      supabaseAdmin.from("paper_questions").select("*").eq("paper_id", paperId).order("question_number", { ascending: true })
    ]);

    if (!paperRes.data || !questionsRes.data) {
      return NextResponse.json({ error: "Exam paper questions not found" }, { status: 404 });
    }

    const paper = paperRes.data;
    const questions = questionsRes.data;

    // 2. Official SSC marking scheme (shared with the client scorecard)
    const {
      positive: positiveMarks,
      negative: negativeMarks,
      maxMarks,
    } = getMarkingScheme({
      paperTitle: paper.title,
      examTitle: paper.exams?.title,
      questionCount: questions.length,
    });

    // 3. Evaluate candidate answers on server
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    const solutions: Record<number, { correct_answer: string; explanation: string | null; is_correct: boolean }> = {};

    questions.forEach((q) => {
      const selected = answers[q.id];
      const genuineAnswer = (q.correct_answer || "").trim().toUpperCase();
      const isCorrect = selected ? selected.trim().toUpperCase() === genuineAnswer : false;

      if (selected) {
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
      } else {
        unattemptedCount++;
      }

      // Populate solutions to return to candidate ONLY after submission
      solutions[q.id] = {
        correct_answer: genuineAnswer,
        explanation: q.explanation || null,
        is_correct: isCorrect,
      };
    });

    const rawScore = parseFloat((correctCount * positiveMarks - wrongCount * negativeMarks).toFixed(2));
    const finalScore = Math.max(0, rawScore);
    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? parseFloat(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

    // 4. Save attempt in DB if user is logged in
    try {
      const serverSupabase = await createClient();
      const { data: { user } } = await serverSupabase.auth.getUser();

      let savedAttemptId = attemptId;
      if (user) {
        const requestedAttemptId = Number(attemptId);
        const hasAttemptId =
          Number.isFinite(requestedAttemptId) && requestedAttemptId > 0;

        if (hasAttemptId) {
          // IDOR guard: only the owner of this attempt (and this paper) may update it.
          const { data: ownedAttempt } = await supabaseAdmin
            .from("test_attempts")
            .select("id")
            .eq("id", requestedAttemptId)
            .eq("user_id", user.id)
            .eq("paper_id", Number(paperId))
            .maybeSingle();

          if (!ownedAttempt) {
            return NextResponse.json(
              { error: "Attempt not found for this user." },
              { status: 403 }
            );
          }

          savedAttemptId = requestedAttemptId;

          await supabaseAdmin
            .from("test_attempts")
            .update({
              end_time: new Date().toISOString(),
              score: Math.round(finalScore),
              total_questions: questions.length,
              status: "completed",
            })
            .eq("id", requestedAttemptId)
            .eq("user_id", user.id);
        } else {
          const { data: newAttempt } = await supabaseAdmin
            .from("test_attempts")
            .insert({
              user_id: user.id,
              paper_id: paperId,
              score: Math.round(finalScore),
              total_questions: questions.length,
              status: "completed",
              end_time: new Date().toISOString(),
            })
            .select("id")
            .single();
          if (newAttempt) savedAttemptId = newAttempt.id;
        }

        if (savedAttemptId) {
          const userAnswersPayload = questions.map((q) => ({
            attempt_id: savedAttemptId,
            question_id: q.id,
            selected_answer: answers[q.id] ?? null,
            is_correct: solutions[q.id].is_correct,
          }));
          await supabaseAdmin.from("user_answers").insert(userAnswersPayload);
        }
      }
    } catch (dbErr) {
      console.error("Error storing test attempt in DB:", dbErr);
    }

    return NextResponse.json({
      success: true,
      score: finalScore,
      maxMarks,
      positiveMarks,
      negativeMarks,
      correctCount,
      wrongCount,
      unattemptedCount,
      totalQuestions: questions.length,
      accuracy: `${accuracy}%`,
      solutions, // Securely revealed only post-submission
    });
  } catch (error: any) {
    console.error("Test submission evaluation error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit test" }, { status: 500 });
  }
}
