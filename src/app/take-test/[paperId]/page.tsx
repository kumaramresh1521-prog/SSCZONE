"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Flag,
  ListChecks,
  Send,
  X,
} from "lucide-react";
import MathText from "@/components/MathText";
import { supabase } from "@/lib/supabase";

const OPTIONS = ["A", "B", "C", "D"] as const;
type Option = (typeof OPTIONS)[number];
type Answers = Record<number, Option>;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function TakeTestPage({ params }: { params: Promise<{ paperId: string }> }) {
  const [paper, setPaper] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const attemptIdRef = useRef<number | null>(null);
  const userRef = useRef<any>(null);
  const submittingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      userRef.current = user;
    });

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    async function loadTest() {
      const { paperId } = await params;
      const [paperResult, questionResult] = await Promise.all([
        supabase.from("previous_papers").select("*").eq("id", paperId).maybeSingle(),
        supabase.from("paper_questions").select("*").eq("paper_id", paperId).order("question_number"),
      ]);

      if (!active) return;

      if (paperResult.error || !paperResult.data) {
        setErrorMessage("This test could not be loaded. Please return to the papers list and try again.");
      } else if (questionResult.error) {
        setErrorMessage("Questions could not be loaded right now. Please try again.");
      } else {
        setPaper(paperResult.data);
        setQuestions(questionResult.data ?? []);
        setTimeLeft((paperResult.data.duration_minutes ?? 0) * 60);
      }
      setLoading(false);
    }

    void loadTest();
    return () => {
      active = false;
    };
  }, [params]);

  async function startTest() {
    const user = userRef.current;
    if (!user || !paper || questions.length === 0 || starting) return;

    setStarting(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("test_attempts")
      .insert({ user_id: user.id, paper_id: paper.id, status: "in_progress" })
      .select("id")
      .single();

    if (error || !data) {
      setErrorMessage("Your test session could not start. Please try again.");
      setStarting(false);
      return;
    }

    attemptIdRef.current = data.id;
    setStarted(true);
    setStarting(false);
  }

  async function submitTest() {
    const user = userRef.current;
    const attemptId = attemptIdRef.current;
    if (!attemptId || !paper || !user || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage("");

    const score = questions.filter((question) => answers[question.id] === question.correct_answer).length;
    const answerRows = questions.map((question) => ({
      attempt_id: attemptId,
      question_id: question.id,
      selected_answer: answers[question.id] ?? null,
      is_correct: answers[question.id] === question.correct_answer,
    }));

    const { error: answersError } = await supabase.from("user_answers").insert(answerRows);
    const { error: attemptError } = answersError
      ? { error: answersError }
      : await supabase
          .from("test_attempts")
          .update({
            end_time: new Date().toISOString(),
            score,
            total_questions: questions.length,
            status: "completed",
          })
          .eq("id", attemptId);

    if (answersError || attemptError) {
      setErrorMessage("We could not save this attempt. Check your connection and submit again.");
      setSubmitting(false);
      submittingRef.current = false;
      return;
    }

    setShowSubmitDialog(false);
    setFinished(true);
    setSubmitting(false);
  }

  useEffect(() => {
    if (!started || finished || submitting) return;
    if (timeLeft <= 0) {
      void submitTest();
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((previous) => previous - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, finished, submitting, timeLeft]);

  function chooseAnswer(option: Option) {
    const question = questions[currentIndex];
    if (!question) return;
    setAnswers((previous) => ({ ...previous, [question.id]: option }));
  }

  function clearAnswer() {
    const question = questions[currentIndex];
    if (!question) return;
    setAnswers((previous) => {
      const next = { ...previous };
      delete next[question.id];
      return next;
    });
  }

  function toggleMarked() {
    const question = questions[currentIndex];
    if (!question) return;
    setMarkedQuestions((previous) => ({ ...previous, [question.id]: !previous[question.id] }));
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedQuestions).filter(Boolean).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.correct_answer).length;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const question = questions[currentIndex];

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-500">Loading test...</div>;
  }

  if (errorMessage && !paper) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <CircleAlert className="mx-auto h-9 w-9 text-red-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700">{errorMessage}</p>
          <Link href="/papers" className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">Back to papers</Link>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  if (finished && !reviewMode) {
    const accuracy = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
        <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-7 w-7" /></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Test complete</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950">{paper.title}</h1>
          <div className="mt-6 rounded-lg bg-slate-950 px-5 py-6 text-white">
            <div className="text-4xl font-extrabold">{correctCount}<span className="text-xl text-slate-400"> / {questions.length}</span></div>
            <p className="mt-1 text-sm font-semibold text-slate-300">{accuracy}% accuracy</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-left">
            <ResultMetric label="Correct" value={correctCount} className="text-emerald-700" />
            <ResultMetric label="Incorrect" value={incorrectCount} className="text-red-700" />
            <ResultMetric label="Skipped" value={unansweredCount} className="text-slate-700" />
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button onClick={() => setReviewMode(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"><ListChecks className="h-4 w-4" /> Review answers</button>
            <Link href="/papers" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Back to papers</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
        <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Previous year paper</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">{paper.title}</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <TestMetric icon={<ListChecks className="h-4 w-4" />} label="Questions" value={questions.length} />
            <TestMetric icon={<Clock3 className="h-4 w-4" />} label="Duration" value={`${paper.duration_minutes} min`} />
          </div>
          {questions.length === 0 ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">This paper has no questions yet.</div>
          ) : (
            <button disabled={starting} onClick={startTest} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Send className="h-4 w-4" /> {starting ? "Starting test..." : "Start test"}
            </button>
          )}
          {errorMessage && <InlineError message={errorMessage} />}
        </section>
      </main>
    );
  }

  if (!question) return null;

  if (finished && reviewMode) {
    return (
      <main className="min-h-screen bg-slate-50 pb-10">
        <TestHeader title="Answer review" subtitle={`Question ${currentIndex + 1} of ${questions.length}`} right={<button onClick={() => setReviewMode(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Score</button>} />
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ReviewQuestion question={question} answer={answers[question.id]} index={currentIndex} />
          <QuestionNavigator questions={questions} currentIndex={currentIndex} answers={answers} markedQuestions={markedQuestions} review onSelect={setCurrentIndex} />
        </div>
      </main>
    );
  }

  const selectedAnswer = answers[question.id];
  const isMarked = Boolean(markedQuestions[question.id]);
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <TestHeader
        title={paper.title}
        subtitle={`Question ${currentIndex + 1} of ${questions.length}`}
        right={<div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold ${timeLeft < 300 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-800"}`}><Clock3 className="h-4 w-4" /> {formatTime(timeLeft)}</div>}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} /></div>
          {errorMessage && <InlineError message={errorMessage} />}
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Question {currentIndex + 1}</p>
                <h1 className="mt-2 text-lg font-bold leading-8 text-slate-950 sm:text-xl"><MathText text={question.question_text} /></h1>
              </div>
              <button onClick={toggleMarked} className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition-colors ${isMarked ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`} aria-label={isMarked ? "Remove review mark" : "Mark for review"} title={isMarked ? "Remove review mark" : "Mark for review"}><Flag className="h-4 w-4" /></button>
            </div>
            {question.image_url && <img src={question.image_url} alt="Question figure" className="mt-5 max-h-80 w-auto max-w-full rounded-lg border border-slate-200 object-contain" />}
            <div className="mt-5 space-y-3">
              {OPTIONS.map((option) => {
                const isSelected = selectedAnswer === option;
                return <button key={option} onClick={() => chooseAnswer(option)} className={`flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors sm:px-4 ${isSelected ? "border-blue-700 bg-blue-50 text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"}`} aria-pressed={isSelected}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-extrabold ${isSelected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-500"}`}>{option}</span>
                  <span className="text-sm font-semibold leading-6"><MathText text={question[`option_${option.toLowerCase()}`]} /></span>
                </button>;
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0} className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
                {selectedAnswer && <button onClick={clearAnswer} className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-bold text-slate-500 hover:bg-slate-100">Clear</button>}
              </div>
              {currentIndex < questions.length - 1 ? <button onClick={() => setCurrentIndex((index) => index + 1)} className="inline-flex h-10 items-center gap-1 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800">Next <ChevronRight className="h-4 w-4" /></button> : <button onClick={() => setShowSubmitDialog(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"><Send className="h-4 w-4" /> Submit test</button>}
            </div>
          </article>
        </section>
        <QuestionNavigator questions={questions} currentIndex={currentIndex} answers={answers} markedQuestions={markedQuestions} onSelect={setCurrentIndex} />
      </div>
      <button onClick={() => setShowSubmitDialog(true)} className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 lg:hidden"><Send className="h-4 w-4" /> Submit</button>
      {showSubmitDialog && <SubmitDialog answeredCount={answeredCount} markedCount={markedCount} total={questions.length} submitting={submitting} onCancel={() => setShowSubmitDialog(false)} onSubmit={submitTest} />}
    </main>
  );
}

function TestHeader({ title, subtitle, right }: { title: string; subtitle: string; right: ReactNode }) {
  return <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{title}</p><p className="text-xs font-semibold text-slate-500">{subtitle}</p></div>{right}</div></header>;
}

function TestMetric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-500">{icon}{label}</div><div className="mt-2 text-lg font-extrabold text-slate-900">{value}</div></div>;
}

function ResultMetric({ label, value, className }: { label: string; value: number; className: string }) {
  return <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className={`mt-1 text-xl font-extrabold ${className}`}>{value}</p></div>;
}

function InlineError({ message }: { message: string }) {
  return <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>;
}

function QuestionNavigator({ questions, currentIndex, answers, markedQuestions, review = false, onSelect }: { questions: any[]; currentIndex: number; answers: Answers; markedQuestions: Record<number, boolean>; review?: boolean; onSelect: (index: number) => void }) {
  return <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-slate-900">Question palette</h2><span className="text-xs font-bold text-slate-500">{Object.keys(answers).length}/{questions.length}</span></div><div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">{questions.map((question, index) => { const selected = answers[question.id]; const isCurrent = index === currentIndex; const correct = selected === question.correct_answer; const state = review ? (selected ? (correct ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "border border-slate-200 bg-white text-slate-500") : selected ? "bg-blue-700 text-white" : markedQuestions[question.id] ? "border border-amber-400 bg-amber-50 text-amber-700" : "border border-slate-200 bg-white text-slate-600"; return <button key={question.id} onClick={() => onSelect(index)} className={`relative grid aspect-square place-items-center rounded-lg text-xs font-extrabold ${state} ${isCurrent ? "ring-2 ring-slate-950 ring-offset-2" : ""}`} aria-label={`Question ${index + 1}`}>{index + 1}{!review && markedQuestions[question.id] && <Flag className="absolute right-1 top-1 h-2.5 w-2.5" />}</button>; })}</div><div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-blue-700" />Answered</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-slate-300" />Not answered</span>{!review && <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-amber-400 bg-amber-50" />Marked</span>}</div></aside>;
}

function ReviewQuestion({ question, answer, index }: { question: any; answer?: Option; index: number }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Question {index + 1}</p><h1 className="mt-2 text-lg font-bold leading-8 text-slate-950 sm:text-xl"><MathText text={question.question_text} /></h1><div className="mt-5 space-y-3">{OPTIONS.map((option) => { const selected = answer === option; const correct = question.correct_answer === option; const state = correct ? "border-emerald-300 bg-emerald-50 text-emerald-950" : selected ? "border-red-300 bg-red-50 text-red-950" : "border-slate-200 text-slate-500"; return <div key={option} className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-3 sm:px-4 ${state}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-extrabold ${correct ? "border-emerald-600 bg-emerald-600 text-white" : selected ? "border-red-600 bg-red-600 text-white" : "border-slate-300"}`}>{option}</span><span className="text-sm font-semibold leading-6"><MathText text={question[`option_${option.toLowerCase()}`]} /></span>{correct && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-700" />}{selected && !correct && <X className="ml-auto h-4 w-4 shrink-0 text-red-700" />}</div>; })}</div>{question.explanation && <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700"><p className="font-extrabold text-blue-900">Solution</p><div className="mt-1"><MathText text={question.explanation} /></div></div>}</article>;
}

function SubmitDialog({ answeredCount, markedCount, total, submitting, onCancel, onSubmit }: { answeredCount: number; markedCount: number; total: number; submitting: boolean; onCancel: () => void; onSubmit: () => void }) {
  return <div className="fixed inset-0 z-30 grid place-items-end bg-slate-950/45 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="Submit test"><div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-lg font-extrabold text-slate-950">Submit test?</p><p className="mt-1 text-sm text-slate-600">{answeredCount} of {total} questions answered</p></div><button onClick={onCancel} disabled={submitting} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4" /></button></div><div className="mt-4 grid grid-cols-2 gap-3"><TestMetric icon={<ListChecks className="h-4 w-4" />} label="Unanswered" value={total - answeredCount} /><TestMetric icon={<Flag className="h-4 w-4" />} label="Marked" value={markedCount} /></div><div className="mt-5 flex gap-3"><button onClick={onCancel} disabled={submitting} className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">Continue test</button><button onClick={onSubmit} disabled={submitting} className="flex-1 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{submitting ? "Saving..." : "Submit"}</button></div></div></div>;
}
