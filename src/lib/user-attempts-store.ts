"use client";

import { supabase } from "./supabase";

export interface UserTestAttempt {
  id: string;
  type: "speed_test" | "daily_quiz" | "mock_test";
  title: string;
  subject?: string;
  targetExam?: string;
  mode?: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpentSeconds: number;
  completedAt: string;
  user_id?: string;
}

export interface UserCollectedQuestion {
  id: string; // unique ID e.g. "cq_1730000000000_1"
  questionId?: number; // original numeric ID if available
  source: "speed_test" | "daily_quiz" | "pyq" | "bank";
  sourceTitle?: string;
  subject?: string;
  topic?: string;
  question_text: string;
  question_text_hi?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string | null;
  tag?: string; // "Standard" | "High Priority" | "Tricky" | "Formula"
  collectedAt: string;
}

const ATTEMPTS_STORAGE_KEY = "ssczone_user_attempts_v1";
const COLLECTED_QUESTIONS_KEY = "ssczone_collected_questions_v1";

// ── Read attempts from localStorage ──
export function getUserAttempts(): UserTestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const list: UserTestAttempt[] = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()) : [];
  } catch {
    return [];
  }
}

// ── Save a new attempt ──
export function saveUserAttempt(
  data: Omit<UserTestAttempt, "id" | "completedAt">
): UserTestAttempt {
  const newAttempt: UserTestAttempt = {
    ...data,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    completedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getUserAttempts();
      const updated = [newAttempt, ...existing].slice(0, 100); // keep last 100
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("ssczone-attempts-updated"));
    } catch (e) {
      console.error("Failed to save attempt to localStorage:", e);
    }
  }

  // Also attempt async sync to Supabase if user is logged in
  if (typeof window !== "undefined") {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        newAttempt.user_id = user.id;
        try {
          await supabase.from("test_attempts").insert({
            user_id: user.id,
            score: Math.round(newAttempt.score),
            total_questions: newAttempt.totalQuestions,
            status: "completed",
            end_time: newAttempt.completedAt,
          });
        } catch (err) {
          // Fallback safely to localStorage
          console.warn("Attempt stored locally; Supabase sync skipped:", err);
        }
      }
    }).catch(() => {});
  }

  return newAttempt;
}

// ── Read collected questions ──
export function getUserCollectedQuestions(): UserCollectedQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTED_QUESTIONS_KEY);
    if (!raw) return [];
    const list: UserCollectedQuestion[] = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()) : [];
  } catch {
    return [];
  }
}

// ── Save/Collect a question ──
export function saveCollectedQuestion(
  q: Omit<UserCollectedQuestion, "id" | "collectedAt">
): UserCollectedQuestion {
  const existing = getUserCollectedQuestions();
  
  // Check if question already exists by numeric ID or exact question text match
  const matchIndex = existing.findIndex((item) => {
    if (q.questionId && item.questionId && q.questionId === item.questionId) return true;
    return item.question_text.trim() === q.question_text.trim();
  });

  const now = new Date().toISOString();
  let savedItem: UserCollectedQuestion;

  if (matchIndex >= 0) {
    savedItem = {
      ...existing[matchIndex],
      ...q,
      tag: q.tag || existing[matchIndex].tag || "Standard",
      collectedAt: now,
    };
    existing[matchIndex] = savedItem;
  } else {
    savedItem = {
      ...q,
      id: `cq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tag: q.tag || "Standard",
      collectedAt: now,
    };
    existing.unshift(savedItem);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COLLECTED_QUESTIONS_KEY, JSON.stringify(existing));
      window.dispatchEvent(new Event("ssczone-collected-questions-updated"));
    } catch (e) {
      console.error("Failed to save collected question:", e);
    }
  }

  // Sync with Supabase / API in background for logged in users
  if (typeof window !== "undefined") {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        try {
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.questionId,
              tag: q.tag || "Standard",
              source: q.source || "practice",
              questionData: {
                question_text: q.question_text,
                question_text_hi: q.question_text_hi,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                subject: q.subject,
                topic: q.topic,
                source: q.source,
                sourceTitle: q.sourceTitle,
              },
            }),
          });
        } catch {
          // Keep local fallback
        }
      }
    }).catch(() => {});
  }

  return savedItem;
}

// ── Synchronize Local Bookmarks with Cloud (Supabase) ──
export async function syncUserBookmarksWithSupabase(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const localList = getUserCollectedQuestions();

    // 1. Push any local bookmarks up to server
    if (localList.length > 0) {
      await fetch("/api/bookmarks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: localList }),
      }).catch(() => {});
    }

    // 2. Fetch all cloud bookmarks to hydrate local storage (handles cross-device / after logout-login)
    const res = await fetch("/api/bookmarks", { cache: "no-store" });
    const data = await res.json();

    if (data.success && Array.isArray(data.bookmarks)) {
      const serverBookmarks = data.bookmarks;
      const merged = [...localList];
      const seenIds = new Set(merged.map((m) => m.questionId).filter(Boolean));
      const seenTexts = new Set(merged.map((m) => m.question_text.trim()));

      for (const bm of serverBookmarks) {
        const qData = bm.question_data;
        if (qData && qData.question_text) {
          if (!seenTexts.has(qData.question_text.trim())) {
            seenTexts.add(qData.question_text.trim());
            merged.push({
              id: `bm_${bm.id}`,
              questionId: bm.question_id || undefined,
              source: qData.source || "bank",
              sourceTitle: qData.sourceTitle,
              subject: qData.subject,
              topic: qData.topic,
              question_text: qData.question_text,
              question_text_hi: qData.question_text_hi,
              option_a: qData.option_a,
              option_b: qData.option_b,
              option_c: qData.option_c,
              option_d: qData.option_d,
              correct_answer: qData.correct_answer,
              explanation: qData.explanation,
              tag: bm.tag || "Standard",
              collectedAt: bm.created_at || new Date().toISOString(),
            });
          }
        }
      }

      localStorage.setItem(COLLECTED_QUESTIONS_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event("ssczone-collected-questions-updated"));
    }
  } catch (err) {
    console.warn("Bookmark cloud sync skipped:", err);
  }
}

// ── Remove a collected question ──
export function removeCollectedQuestion(idOrQuestionId: string | number): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getUserCollectedQuestions();
    const updated = existing.filter((item) => {
      if (item.id === String(idOrQuestionId)) return false;
      if (item.questionId && String(item.questionId) === String(idOrQuestionId)) return false;
      return true;
    });
    localStorage.setItem(COLLECTED_QUESTIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ssczone-collected-questions-updated"));

    // Also sync deletion with server in background
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const numId = typeof idOrQuestionId === "number" ? idOrQuestionId : parseInt(String(idOrQuestionId).replace(/\D/g, ""), 10);
        if (numId) {
          fetch(`/api/bookmarks?questionId=${numId}`, { method: "DELETE" }).catch(() => {});
        }
      }
    }).catch(() => {});
  } catch (e) {
    console.error("Failed to remove collected question:", e);
  }
}

// ── Check if a question is already collected ──
export function isQuestionCollected(idOrText: string | number): boolean {
  if (typeof window === "undefined") return false;
  const list = getUserCollectedQuestions();
  return list.some((item) => {
    if (typeof idOrText === "number" && item.questionId === idOrText) return true;
    if (String(item.id) === String(idOrText)) return true;
    if (typeof idOrText === "string" && item.question_text.trim() === idOrText.trim()) return true;
    return false;
  });
}
