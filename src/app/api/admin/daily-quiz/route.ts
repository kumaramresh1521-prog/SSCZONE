import { NextRequest, NextResponse } from "next/server";
import {
  getDailyQuizzes,
  getDailyQuizById,
  upsertDailyQuiz,
  deleteDailyQuiz,
  DailyQuiz,
  DailyQuizQuestion,
} from "@/lib/daily-quiz-store";

export const dynamic = "force-dynamic";

// Smart parser for Text/Smart format: Q1. ... (A) ... Ans: B Exp: ...
function parseSmartText(text: string): DailyQuizQuestion[] {
  const questions: DailyQuizQuestion[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentQ: Partial<DailyQuizQuestion> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for line-pipe format: Question||A||B||C||D||Ans||Exp
    if (line.includes("||")) {
      const parts = line.split("||").map((p) => p.trim());
      if (parts.length >= 6) {
        questions.push({
          id: `q_${Date.now()}_${questions.length + 1}`,
          question_text: parts[0],
          option_a: parts[1],
          option_b: parts[2],
          option_c: parts[3],
          option_d: parts[4],
          correct_answer: (parts[5].toUpperCase()[0] as any) || "A",
          explanation: parts[6] || undefined,
        });
      }
      continue;
    }

    // Numbered question pattern: "1. What is..." or "Q1. What is..."
    const qMatch = line.match(/^(?:Q\.?\s*)?(\d+)[.)]\s*(.+)/i);
    if (qMatch) {
      if (currentQ && currentQ.question_text && currentQ.option_a && currentQ.option_b) {
        questions.push({
          id: `q_${Date.now()}_${questions.length + 1}`,
          question_text: currentQ.question_text,
          option_a: currentQ.option_a || "",
          option_b: currentQ.option_b || "",
          option_c: currentQ.option_c || "",
          option_d: currentQ.option_d || "",
          correct_answer: (currentQ.correct_answer as any) || "A",
          explanation: currentQ.explanation,
        });
      }
      currentQ = { question_text: qMatch[2] };
      continue;
    }

    if (!currentQ) continue;

    // Options patterns: "(A) ..." or "A) ..." or "A. ..."
    const optMatch = line.match(/^\(?([A-Da-d])\)?[:.)]?\s*(.+)/);
    if (optMatch) {
      const letter = optMatch[1].toUpperCase();
      const val = optMatch[2].trim();
      if (letter === "A") currentQ.option_a = val;
      else if (letter === "B") currentQ.option_b = val;
      else if (letter === "C") currentQ.option_c = val;
      else if (letter === "D") currentQ.option_d = val;
      continue;
    }

    // Answer pattern: "Ans: B" or "Answer: C"
    const ansMatch = line.match(/^(?:Ans|Answer)[:.\s]*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch) {
      let rawAns = ansMatch[1].toUpperCase();
      if (rawAns === "1") rawAns = "A";
      else if (rawAns === "2") rawAns = "B";
      else if (rawAns === "3") rawAns = "C";
      else if (rawAns === "4") rawAns = "D";
      currentQ.correct_answer = (rawAns as any) || "A";
      continue;
    }

    // Explanation pattern: "Exp: ..." or "Explanation: ..."
    const expMatch = line.match(/^(?:Exp|Explanation)[:.\s]*(.+)/i);
    if (expMatch) {
      currentQ.explanation = expMatch[1].trim();
      continue;
    }

    // Append multi-line question text or explanation
    if (!currentQ.option_a) {
      currentQ.question_text = `${currentQ.question_text} ${line}`;
    } else if (currentQ.explanation) {
      currentQ.explanation = `${currentQ.explanation} ${line}`;
    }
  }

  // Final question push
  if (currentQ && currentQ.question_text && currentQ.option_a && currentQ.option_b) {
    questions.push({
      id: `q_${Date.now()}_${questions.length + 1}`,
      question_text: currentQ.question_text,
      option_a: currentQ.option_a || "",
      option_b: currentQ.option_b || "",
      option_c: currentQ.option_c || "",
      option_d: currentQ.option_d || "",
      correct_answer: (currentQ.correct_answer as any) || "A",
      explanation: currentQ.explanation,
    });
  }

  return questions;
}

// GET: All quizzes for admin
export async function GET() {
  try {
    const quizzes = getDailyQuizzes();
    // Sort descending by date
    quizzes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json({ success: true, quizzes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create or Update Daily Quiz
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      date,
      subject,
      subject_key,
      target_exam,
      duration_minutes,
      is_active,
      questions: incomingQuestions,
      rawText,
      rawJson,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Quiz title is required" }, { status: 400 });
    }

    const quizDate = date || new Date().toISOString().split("T")[0];
    const quizId = id || `dq_${quizDate.replace(/-/g, "")}_${subject_key || "mixed"}_${Math.random().toString(36).substring(2, 6)}`;

    let finalQuestions: DailyQuizQuestion[] = [];

    // 1. If explicit pre-parsed questions array is provided (e.g. from PDF parse or manual form)
    if (Array.isArray(incomingQuestions) && incomingQuestions.length > 0) {
      finalQuestions = incomingQuestions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx + 1}`,
        question_text: q.question_text || "",
        question_text_hi: q.question_text_hi || undefined,
        option_a: q.option_a || "",
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        correct_answer: (String(q.correct_answer || "A").trim().toUpperCase()[0] as any) || "A",
        explanation: q.explanation || undefined,
      }));
    } else if (rawJson) {
      // 2. If raw JSON string is provided
      try {
        const parsedJson = JSON.parse(rawJson);
        if (Array.isArray(parsedJson)) {
          finalQuestions = parsedJson.map((q, idx) => ({
            id: q.id || `q_${Date.now()}_${idx + 1}`,
            question_text: q.question_text || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: (String(q.correct_answer || "A").trim().toUpperCase()[0] as any) || "A",
            explanation: q.explanation || undefined,
          }));
        }
      } catch (e: any) {
        return NextResponse.json({ error: `Invalid JSON format: ${e.message}` }, { status: 400 });
      }
    } else if (rawText) {
      // 3. If raw Smart Text is provided
      finalQuestions = parseSmartText(rawText);
    }

    // Filter valid questions
    finalQuestions = finalQuestions.filter((q) => q.question_text && q.option_a && q.option_b);

    if (finalQuestions.length === 0) {
      return NextResponse.json(
        { error: "At least 1 valid question with Question Text and Options is required." },
        { status: 400 }
      );
    }

    const newQuiz: DailyQuiz = {
      id: quizId,
      title: title.trim(),
      date: quizDate,
      subject: subject || "Mixed",
      subject_key: subject_key || "mixed",
      target_exam: target_exam || "SSC CGL / CHSL 2026",
      duration_minutes: Number(duration_minutes) || 10,
      total_questions: finalQuestions.length,
      is_active: is_active !== false,
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: finalQuestions,
    };

    upsertDailyQuiz(newQuiz);

    return NextResponse.json({
      success: true,
      quiz: newQuiz,
      message: `Daily Quiz '${newQuiz.title}' saved successfully with ${finalQuestions.length} questions!`,
    });
  } catch (error: any) {
    console.error("Save daily quiz error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete Quiz
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }
    deleteDailyQuiz(id);
    return NextResponse.json({ success: true, message: "Daily Quiz deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle Active Status
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }
    const quiz = getDailyQuizById(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    quiz.is_active = !quiz.is_active;
    upsertDailyQuiz(quiz);
    return NextResponse.json({
      success: true,
      is_active: quiz.is_active,
      message: `Quiz status set to ${quiz.is_active ? "Active" : "Inactive"}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
