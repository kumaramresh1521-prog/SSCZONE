import { NextRequest, NextResponse } from "next/server";
import { getDailyQuizById } from "@/lib/daily-quiz-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const quiz = getDailyQuizById(quizId);

    if (!quiz) {
      return NextResponse.json(
        { error: "Daily Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    console.error("Daily quiz fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily quiz", details: error.message },
      { status: 500 }
    );
  }
}
