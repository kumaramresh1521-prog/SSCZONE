import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PracticeClient from "./PracticeClient";

export const metadata: Metadata = {
  title: "Practice - SSCZone",
  description: "Topic-wise MCQ practice with step-by-step solutions",
};

export default async function PracticePage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const supabase = await createClient();

  const isNumeric = /^\d+$/.test(topicId);
  let topic: any = null;

  if (isNumeric) {
    const { data } = await supabase
      .from("topics")
      .select("*, subjects(id, title, exam_id, exams(id, title, slug))")
      .eq("id", topicId)
      .maybeSingle();
    topic = data;
  } else {
    const { data } = await supabase
      .from("topics")
      .select("*, subjects(id, title, exam_id, exams(id, title, slug))")
      .eq("slug", topicId)
      .maybeSingle();
    topic = data;
  }

  if (!topic) notFound();

  // Fetch full syllabus for left sidebar navigation
  const examId = topic.subjects?.exam_id;
  let fullSyllabus: any[] = [];
  if (examId) {
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*, topics(*)")
      .eq("exam_id", examId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    
    // Sort nested topics by id ascending and filter inactive
    if (subjectsData) {
      subjectsData.forEach((s: any) => {
        if (s.topics) {
          s.topics = s.topics.filter((t: any) => t.is_active !== false).sort((a: any, b: any) => a.id - b.id);
        }
      });
    }
    fullSyllabus = subjectsData ?? [];
  }

  let hasSubscription = false;
  if (!topic.is_free) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();
      hasSubscription = !!sub;
    }
  }

  if (!topic.is_free && !hasSubscription) {
    return <PracticeClient topic={topic} questions={[]} locked={true} fullSyllabus={fullSyllabus} />;
  }

  // 1. Fetch direct questions for this topic
  let { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("topic_id", topic.id)
    .eq("is_active", true)
    .order("id", { ascending: true });

  // 2. Intelligent Auto-Sync: If this topic has no questions yet, automatically share from matching chapter in other exams (e.g. CGL <-> CHSL)
  if (!questions || questions.length === 0) {
    const { data: siblingTopics } = await supabase
      .from("topics")
      .select("id")
      .ilike("title", topic.title.trim());

    if (siblingTopics && siblingTopics.length > 0) {
      const siblingIds = siblingTopics.map((t: any) => t.id);
      const { data: sharedQs } = await supabase
        .from("questions")
        .select("*")
        .in("topic_id", siblingIds)
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (sharedQs && sharedQs.length > 0) {
        questions = sharedQs;
      }
    }
  }

  return <PracticeClient topic={topic} questions={questions ?? []} locked={false} fullSyllabus={fullSyllabus} />;
}
