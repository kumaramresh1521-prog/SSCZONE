import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

interface TopicItem {
  id: number;
  title: string;
  subject_id: number;
  subject_key: "quant" | "reasoning" | "english" | "ga";
}

let cachedConfig: {
  timestamp: number;
  data: {
    subjects: { id: string; name: string; hindiName: string; count: number }[];
    topics: TopicItem[];
    stats: { totalQuestions: number; totalPyqs: number; totalBank: number };
  };
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedConfig.data);
    }

    // 1. Fetch subjects and topics in parallel
    const [subjectsRes, topicsRes, qbCountRes, pyqCountRes] = await Promise.all([
      supabaseAdmin.from("subjects").select("id, title, exam_id").order("id", { ascending: true }),
      supabaseAdmin.from("topics").select("id, title, subject_id, is_active").eq("is_active", true).order("title", { ascending: true }),
      supabaseAdmin.from("questions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("paper_questions").select("id", { count: "exact", head: true }),
    ]);

    const subjectsList = subjectsRes.data || [];
    const topicsList = topicsRes.data || [];
    const qbCount = qbCountRes.count || 7212;
    const pyqCount = pyqCountRes.count || 5000;

    // Map each subject id to its canonical key
    const subjectIdToKey = new Map<number, "quant" | "reasoning" | "english" | "ga">();
    subjectsList.forEach((s) => {
      const lower = s.title.toLowerCase();
      if (lower.includes("math")) {
        subjectIdToKey.set(s.id, "quant");
      } else if (lower.includes("reason")) {
        subjectIdToKey.set(s.id, "reasoning");
      } else if (lower.includes("english")) {
        subjectIdToKey.set(s.id, "english");
      } else {
        subjectIdToKey.set(s.id, "ga");
      }
    });

    // Deduplicate topics by title and subject_key (since topics might exist per exam CGL/CHSL)
    const seenTopicNames = new Set<string>();
    const formattedTopics: TopicItem[] = [];

    topicsList.forEach((t) => {
      const key = subjectIdToKey.get(t.subject_id) || "ga";
      const uniqueKey = `${key}_${t.title.trim().toLowerCase()}`;
      if (!seenTopicNames.has(uniqueKey)) {
        seenTopicNames.add(uniqueKey);
        formattedTopics.push({
          id: t.id,
          title: t.title.trim(),
          subject_id: t.subject_id,
          subject_key: key,
        });
      }
    });

    // Canonical subjects
    const canonicalSubjects = [
      { id: "all", name: "All Subjects (मिश्रित - सभी विषय)", hindiName: "सभी विषय (मिश्रित)", count: qbCount + pyqCount },
      { id: "quant", name: "Quantitative Aptitude", hindiName: "मात्रात्मक अभिरुचि / गणित", count: Math.round((qbCount + pyqCount) / 4) },
      { id: "reasoning", name: "General Intelligence & Reasoning", hindiName: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति", count: Math.round((qbCount + pyqCount) / 4) },
      { id: "english", name: "English Comprehension", hindiName: "अंग्रेजी भाषा एवं समझ", count: Math.round((qbCount + pyqCount) / 4) },
      { id: "ga", name: "General Awareness (GK/GS)", hindiName: "सामान्य ज्ञान एवं जागरूकता", count: Math.round((qbCount + pyqCount) / 4) },
    ];

    const result = {
      subjects: canonicalSubjects,
      topics: formattedTopics,
      stats: {
        totalQuestions: qbCount + pyqCount,
        totalPyqs: pyqCount,
        totalBank: qbCount,
      },
    };

    cachedConfig = {
      timestamp: now,
      data: result,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Speed test config error:", error);
    return NextResponse.json(
      { error: "Failed to load speed test config", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
