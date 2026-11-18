import { NextRequest, NextResponse } from "next/server";
import { getDailyQuizzesAsync } from "@/lib/daily-quiz-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const subjectParam = searchParams.get("subject");
    const includeQuestions = searchParams.get("includeQuestions") === "true";

    // Only show quizzes that are active AND have been approved by Admin (drafts remain hidden)
    const all = await getDailyQuizzesAsync();
    let quizzes = all.filter((q) => q.is_active && q.status !== "draft");

    if (dateParam) {
      quizzes = quizzes.filter((q) => q.date === dateParam);
    }

    if (subjectParam && subjectParam !== "all") {
      quizzes = quizzes.filter((q) => q.subject_key === subjectParam);
    }

    // Sort by date descending
    quizzes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Unless explicitly requested, strip questions from list view for lightweight payload
    const sanitized = quizzes.map((q) => {
      if (includeQuestions) return q;
      const { questions, ...rest } = q;
      return {
        ...rest,
        total_questions: questions?.length || q.total_questions || 0,
      };
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      quizzes: sanitized,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load daily quizzes" },
      { status: 500 }
    );
  }
}
