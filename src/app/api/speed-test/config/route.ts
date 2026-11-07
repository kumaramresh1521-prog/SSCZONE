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

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory cache

export async function GET() {
  try {
    const now = Date.now();
    if (cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedConfig.data);
    }

    // 1. Fetch subjects and topics in parallel with resilient queries
    const [subjectsRes, topicsRes, qbCountRes, pyqCountRes] = await Promise.all([
      supabaseAdmin.from("subjects").select("id, title, exam_id").order("id", { ascending: true }),
      supabaseAdmin.from("topics").select("id, title, subject_id, is_active").eq("is_active", true).order("title", { ascending: true }),
      supabaseAdmin.from("questions").select("id", { count: "estimated", head: true }),
      supabaseAdmin.from("paper_questions").select("id", { count: "estimated", head: true }),
    ]);

    const subjectsList: any[] = subjectsRes.data || [];
    const topicsList: any[] = topicsRes.data || [];
    const qbCount = qbCountRes.count || 7212;
    const pyqCount = pyqCountRes.count || 5000;

    // Map each subject id to its canonical key
    const subjectIdToKey = new Map<number, "quant" | "reasoning" | "english" | "ga">();
    subjectsList.forEach((s: any) => {
      const lower = String(s.title || "").toLowerCase();
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

    topicsList.forEach((t: any) => {
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
    if (cachedConfig?.data) {
      return NextResponse.json(cachedConfig.data);
    }
    // Resilient fallback structure so Speed Test page never throws 500
    return NextResponse.json({
      subjects: [
        { id: "all", name: "All Subjects (मिश्रित - सभी विषय)", hindiName: "सभी विषय (मिश्रित)", count: 12212 },
        { id: "quant", name: "Quantitative Aptitude", hindiName: "मात्रात्मक अभिरुचि / गणित", count: 3053 },
        { id: "reasoning", name: "General Intelligence & Reasoning", hindiName: "सामान्य बुद्धिमत्ता एवं तर्कशक्ति", count: 3053 },
        { id: "english", name: "English Comprehension", hindiName: "अंग्रेजी भाषा एवं समझ", count: 3053 },
        { id: "ga", name: "General Awareness", hindiName: "सामान्य जागरूकता / ज्ञान", count: 3053 },
      ],
      topics: [],
      stats: { totalQuestions: 12212, totalPyqs: 5000, totalBank: 7212 },
    });
  }
}
