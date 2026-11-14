import fs from "fs";
import path from "path";
import { GET as generateQuestions } from "../src/app/api/admin/daily-quiz/generate-100/route";
import { NextRequest } from "next/server";

async function generateQuiz(count: number, subject: string) {
  const req = new NextRequest(`http://localhost:3000/api/admin/daily-quiz/generate-100?count=${count}&subject=${subject}`);
  const res = await generateQuestions(req);
  const data = await res.json();
  return {
    questions: (data.questions || []).map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      question_text_hi: q.question_text_hi || undefined,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      source: q.source,
      source_type: q.source_type,
      section_name: q.section_name,
    })),
    sources: data.sources,
  };
}

async function main() {
  const today = "2026-11-14";
  console.log(`Generating fresh dual-source daily quizzes for ${today}...`);

  console.log("1. Generating Mixed 100 Qs...");
  const mixedRes = await generateQuiz(100, "mixed");
  console.log("   Mixed sources:", mixedRes.sources);

  console.log("2. Generating Quant 25 Qs...");
  const quantRes = await generateQuiz(25, "quant");
  console.log("   Quant sources:", quantRes.sources);

  console.log("3. Generating Reasoning 25 Qs...");
  const reasoningRes = await generateQuiz(25, "reasoning");
  console.log("   Reasoning sources:", reasoningRes.sources);

  console.log("4. Generating GA 25 Qs...");
  const gaRes = await generateQuiz(25, "ga");
  console.log("   GA sources:", gaRes.sources);

  console.log("5. Generating English 25 Qs...");
  const englishRes = await generateQuiz(25, "english");
  console.log("   English sources:", englishRes.sources);

  const quizzes = [
    {
      id: `dq_${today}_mixed_100`,
      title: `Daily Free Quiz: All India SSC CGL Tier-1 Shift Mock (${today})`,
      date: today,
      subject: "Mixed All Subjects",
      subject_key: "mixed",
      target_exam: "SSC CGL / CHSL 2026",
      duration_minutes: 60,
      total_questions: mixedRes.questions.length,
      is_active: true,
      status: "approved",
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: mixedRes.questions,
    },
    {
      id: `dq_${today}_quant_25`,
      title: `Daily Free Quiz: Quantitative Aptitude Shift Drill (${today})`,
      date: today,
      subject: "Quantitative Aptitude",
      subject_key: "quant",
      target_exam: "SSC CGL / CHSL / CPO 2026",
      duration_minutes: 15,
      total_questions: quantRes.questions.length,
      is_active: true,
      status: "approved",
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: quantRes.questions,
    },
    {
      id: `dq_${today}_reasoning_25`,
      title: `Daily Free Quiz: Reasoning & Intelligence Shift Drill (${today})`,
      date: today,
      subject: "General Intelligence & Reasoning",
      subject_key: "reasoning",
      target_exam: "SSC CGL / CHSL / MTS 2026",
      duration_minutes: 15,
      total_questions: reasoningRes.questions.length,
      is_active: true,
      status: "approved",
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: reasoningRes.questions,
    },
    {
      id: `dq_${today}_ga_25`,
      title: `Daily Free Quiz: General Awareness & Static GK Shift Drill (${today})`,
      date: today,
      subject: "General Awareness",
      subject_key: "ga",
      target_exam: "SSC CGL / CHSL / CPO 2026",
      duration_minutes: 12,
      total_questions: gaRes.questions.length,
      is_active: true,
      status: "approved",
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: gaRes.questions,
    },
    {
      id: `dq_${today}_english_25`,
      title: `Daily Free Quiz: English Comprehension Shift Challenge (${today})`,
      date: today,
      subject: "English Comprehension",
      subject_key: "english",
      target_exam: "SSC CGL / CHSL / CPO 2026",
      duration_minutes: 15,
      total_questions: englishRes.questions.length,
      is_active: true,
      status: "approved",
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: englishRes.questions,
    },
  ];

  const targetPath = path.join(process.cwd(), "src", "data", "daily_quizzes.json");
  fs.writeFileSync(targetPath, JSON.stringify(quizzes, null, 2), "utf8");
  console.log(`Successfully saved 5 dual-source quizzes to ${targetPath}!`);
}

main().catch(console.error);
