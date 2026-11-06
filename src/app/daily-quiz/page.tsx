import type { Metadata } from "next";
import DailyQuizClient from "./DailyQuizClient";

export const metadata: Metadata = {
  title: "Daily Free Quiz Drill | SSC CGL, CHSL, MTS, CPO Practice | SSCZONE",
  description:
    "Practice daily free subject-wise mini quizzes for SSC CGL, CHSL, CPO, MTS and GD exams. High-yield questions with KaTeX formulas, instant scorecards, and bilingual Hindi/English explanations.",
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
  openGraph: {
    title: "Daily Free Quiz Drill | SSCZONE",
    description: "Daily high-yield practice quizzes with instant rank, solutions, and KaTeX math support.",
    type: "website",
  },
};

export default function DailyQuizPage() {
  return <DailyQuizClient />;
}
