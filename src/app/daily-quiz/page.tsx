import type { Metadata } from "next";
import DailyQuizClient from "./DailyQuizClient";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/daily-quiz", {
    title: "Daily Free Quiz Drill | SSC CGL, CHSL, MTS, CPO Practice | SSCZONE",
    description: "Practice daily free subject-wise mini quizzes for SSC CGL, CHSL, CPO, MTS and GD exams. High-yield questions with KaTeX formulas, instant scorecards, and bilingual Hindi/English explanations.",
    keywords: [
      "SSC Daily Quiz",
      "Free SSC Quiz",
      "SSC CGL Daily Practice",
      "SSC Math Quiz",
      "SSC Reasoning Quiz",
      "SSC English Quiz",
      "SSC GK Daily Quiz",
      "SSCZONE Daily Quiz",
    ],
  });
}

export default function DailyQuizPage() {
  return <DailyQuizClient />;
}
