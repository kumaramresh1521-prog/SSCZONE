import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Smart Bilingual Question Statement Parser ──
export function splitBilingualText(text?: string | null): { english: string; hindi: string; isBilingual: boolean } {
  if (!text) return { english: "", hindi: "", isBilingual: false };

  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) {
    return { english: text.trim(), hindi: "", isBilingual: false };
  }

  const firstHi = text.search(devanagariRegex);
  const prefix = text.substring(0, firstHi).trim();

  const wordsInPrefix = prefix.split(/\s+/).filter(Boolean).length;
  if (wordsInPrefix < 3 && !/[?!.]\s*$/.test(prefix)) {
    return { english: text.trim(), hindi: text.trim(), isBilingual: false };
  }

  const m = prefix.match(/(\?|\.\s|\.\n|\:\s*)\s*(["'\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$/);
  if (m && m.index !== undefined) {
    const isDecimal = m[1].startsWith(".") && m.index > 0 && /\d/.test(prefix[m.index - 1]);
    if (!isDecimal) {
      const punctPos = m.index + m[1].length;
      const en = text.substring(0, punctPos).trim();
      const hi = text.substring(punctPos).trim();
      if (hi.length > 0 && en.length > 0) {
        return { english: en, hindi: hi, isBilingual: true };
      }
    }
  }

  if (wordsInPrefix >= 4) {
    const en = text.substring(0, firstHi).trim();
    const hi = text.substring(firstHi).trim();
    return { english: en, hindi: hi, isBilingual: true };
  }

  return { english: text.trim(), hindi: text.trim(), isBilingual: false };
}

// ── Smart Bilingual Option Parser ──
export function splitBilingualOption(text?: string | null): { english: string; hindi: string; isBilingual: boolean } {
  if (!text) return { english: "", hindi: "", isBilingual: false };

  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) {
    return { english: text.trim(), hindi: "", isBilingual: false };
  }

  if (text.includes(" / ")) {
    const parts = text.split(" / ");
    if (parts.length >= 2) {
      const en = parts[0].trim();
      const hi = parts.slice(1).join(" / ").trim();
      if (devanagariRegex.test(hi)) {
        return { english: en, hindi: hi, isBilingual: true };
      }
    }
  }

  const firstHi = text.search(devanagariRegex);
  const prefix = text.substring(0, firstHi).trim();
  if (prefix.length === 0) {
    return { english: text.trim(), hindi: text.trim(), isBilingual: false };
  }

  const words = prefix.split(/\s+/).filter(Boolean).length;
  if (words >= 1 && prefix.length >= 2) {
    const en = text.substring(0, firstHi).trim();
    const hi = text.substring(firstHi).trim();
    return { english: en, hindi: hi, isBilingual: true };
  }

  return { english: text.trim(), hindi: text.trim(), isBilingual: false };
}

// ── Token Similarity Calculator (Handles typos, added/removed words) ──
export function calculateSimilarity(str1?: string | null, str2?: string | null): number {
  if (!str1 || !str2) return 0;
  const words1 = new Set(str1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length >= 3));
  const words2 = new Set(str2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length >= 3));
  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  words1.forEach(w => {
    if (words2.has(w)) common++;
  });

  return (2 * common) / (words1.size + words2.size);
}

// ── Text Normalizer for robust question matching across tables ──
export function normalizeForMatch(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[\u0900-\u097F]/g, "") // remove devanagari for cross-language matching of base prompt
    .replace(/[^a-z0-9]/g, "") // remove punctuation and whitespace
    .substring(0, 100);
}

/**
 * 2-Way Sync: When a Question in the Question Bank (`questions`) is updated,
 * auto-sync changes to the corresponding PYQ Shift Paper Question (`paper_questions`).
 */
export async function syncQuestionBankToPyq(
  questionId: number,
  updatedData: {
    question_text?: string;
    question_text_hi?: string | null;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    option_a_hi?: string | null;
    option_b_hi?: string | null;
    option_c_hi?: string | null;
    option_d_hi?: string | null;
    correct_answer?: string;
    explanation?: string | null;
  }
): Promise<{ synced: boolean; paperQuestionId?: number }> {
  try {
    // 1. Fetch current question to get full context
    const { data: q } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer")
      .eq("id", questionId)
      .maybeSingle();

    if (!q) return { synced: false };

    const qText = updatedData.question_text || q.question_text;
    const cleanEn = splitBilingualText(qText).english || qText;
    const norm = normalizeForMatch(cleanEn);
    if (!norm || norm.length < 15) return { synced: false };

    // 2. Search for counterpart in paper_questions
    // Try exact or prefix match
    const prefixSample = cleanEn.substring(0, 40).replace(/[%_]/g, "");
    let candidates: any[] = [];
    if (prefixSample.length >= 10) {
      const { data } = await supabaseAdmin
        .from("paper_questions")
        .select("id, question_text, option_a, paper_id")
        .ilike("question_text", `%${prefixSample}%`)
        .limit(10);
      if (data) candidates = data;
    }

    // Fallback: search by significant keyword or option_a
    if (candidates.length === 0) {
      const stopWords = new Set([
        "which", "what", "where", "when", "how", "with", "from", "that", "this",
        "these", "those", "have", "been", "were", "following", "among", "select", "correct",
        "statement", "given", "below", "find", "choose"
      ]);
      const significantWords = cleanEn
        .split(/\s+/)
        .map((w: string) => w.replace(/[^a-z0-9]/gi, "").trim())
        .filter((w: string) => w.length >= 4 && !stopWords.has(w.toLowerCase()));

      for (const word of significantWords.slice(0, 3)) {
        const { data } = await supabaseAdmin
          .from("paper_questions")
          .select("id, question_text, option_a, paper_id")
          .ilike("question_text", `%${word}%`)
          .limit(20);
        if (data && data.length > 0) {
          candidates = data;
          break;
        }
      }

      if (candidates.length === 0 && q.option_a && q.option_a.length >= 4) {
        const { data } = await supabaseAdmin
          .from("paper_questions")
          .select("id, question_text, option_a, paper_id")
          .ilike("option_a", `%${q.option_a.substring(0, 20)}%`)
          .limit(20);
        if (data && data.length > 0) candidates = data;
      }
    }

    let targetPQ: any = null;
    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const candNorm = normalizeForMatch(cand.question_text);
        const sim = calculateSimilarity(cleanEn, cand.question_text);
        if (
          (candNorm && (candNorm.includes(norm) || norm.includes(candNorm))) ||
          sim >= 0.50
        ) {
          targetPQ = cand;
          break;
        }
      }
    }

    if (!targetPQ) return { synced: false };

    // 3. Construct unified bilingual text if Hindi exists
    let combinedQText = qText;
    if (updatedData.question_text_hi && !qText.includes(updatedData.question_text_hi)) {
      combinedQText = `${cleanEn} ${updatedData.question_text_hi}`;
    }

    const formatOpt = (en?: string, hi?: string | null) => {
      if (!en) return "";
      if (hi && !en.includes(hi)) {
        return `${en} / ${hi}`;
      }
      return en;
    };

    const pqUpdate: any = {};
    if (updatedData.question_text !== undefined || updatedData.question_text_hi !== undefined) {
      pqUpdate.question_text = combinedQText;
    }
    if (updatedData.option_a !== undefined || updatedData.option_a_hi !== undefined) {
      pqUpdate.option_a = formatOpt(updatedData.option_a ?? q.option_a, updatedData.option_a_hi);
    }
    if (updatedData.option_b !== undefined || updatedData.option_b_hi !== undefined) {
      pqUpdate.option_b = formatOpt(updatedData.option_b ?? q.option_b, updatedData.option_b_hi);
    }
    if (updatedData.option_c !== undefined || updatedData.option_c_hi !== undefined) {
      pqUpdate.option_c = formatOpt(updatedData.option_c ?? q.option_c, updatedData.option_c_hi);
    }
    if (updatedData.option_d !== undefined || updatedData.option_d_hi !== undefined) {
      pqUpdate.option_d = formatOpt(updatedData.option_d ?? q.option_d, updatedData.option_d_hi);
    }
    if (updatedData.correct_answer !== undefined) {
      pqUpdate.correct_answer = String(updatedData.correct_answer).toUpperCase();
    }
    if (updatedData.explanation !== undefined) {
      pqUpdate.explanation = updatedData.explanation;
    }

    if (Object.keys(pqUpdate).length > 0) {
      await supabaseAdmin
        .from("paper_questions")
        .update(pqUpdate)
        .eq("id", targetPQ.id);

      return { synced: true, paperQuestionId: targetPQ.id };
    }

    return { synced: false };
  } catch (err) {
    console.warn("syncQuestionBankToPyq warning (non-fatal):", err);
    return { synced: false };
  }
}

/**
 * 2-Way Sync: When a Question in a PYQ Shift Paper (`paper_questions`) is updated,
 * auto-sync changes to any mapped question in the Question Bank (`questions`).
 */
export async function syncPyqToQuestionBank(
  paperQuestionId: number,
  updatedData: {
    question_text?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: string;
    explanation?: string | null;
  }
): Promise<{ synced: boolean; questionBankId?: number }> {
  try {
    const qText = updatedData.question_text;
    if (!qText && !updatedData.correct_answer && !updatedData.option_a) return { synced: false };

    // 1. Fetch existing question from paper_questions to inspect prior state
    const { data: currPQ } = await supabaseAdmin
      .from("paper_questions")
      .select("id, question_text, option_a")
      .eq("id", paperQuestionId)
      .maybeSingle();

    const splitNew = splitBilingualText(qText);
    const cleanNewEn = splitNew.english || qText || "";
    const cleanNewHi = splitNew.isBilingual ? splitNew.hindi : null;
    const newNorm = normalizeForMatch(cleanNewEn);

    const splitOld = splitBilingualText(currPQ?.question_text);
    const cleanOldEn = splitOld.english || currPQ?.question_text || "";
    const oldNorm = normalizeForMatch(cleanOldEn);

    // 2. Search for counterpart in questions table using old or new text prefix
    const searchPrefix = (cleanOldEn || cleanNewEn).substring(0, 30).replace(/[%_]/g, "");
    let candidates: any[] = [];

    if (searchPrefix.length >= 10) {
      const { data } = await supabaseAdmin
        .from("questions")
        .select("id, question_text, option_a, topic_id")
        .ilike("question_text", `%${searchPrefix}%`)
        .limit(10);
      if (data) candidates = data;
    }

    // Fallback: If not found, try with significant keywords or option_a
    if (candidates.length === 0) {
      const stopWords = new Set([
        "which", "what", "where", "when", "how", "with", "from", "that", "this",
        "these", "those", "have", "been", "were", "following", "among", "select", "correct",
        "statement", "given", "below", "find", "choose"
      ]);

      const significantWords = (cleanNewEn || cleanOldEn)
        .split(/\s+/)
        .map((w: string) => w.replace(/[^a-z0-9]/gi, "").trim())
        .filter((w: string) => w.length >= 4 && !stopWords.has(w.toLowerCase()));

      for (const word of significantWords.slice(0, 3)) {
        const { data } = await supabaseAdmin
          .from("questions")
          .select("id, question_text, option_a, topic_id")
          .ilike("question_text", `%${word}%`)
          .limit(25);
        if (data && data.length > 0) {
          candidates = data;
          break;
        }
      }

      const cleanOptA = splitBilingualOption(currPQ?.option_a || updatedData.option_a).english;
      if (candidates.length === 0 && cleanOptA && cleanOptA.length >= 4) {
        const { data } = await supabaseAdmin
          .from("questions")
          .select("id, question_text, option_a, topic_id")
          .ilike("option_a", `%${cleanOptA.substring(0, 20)}%`)
          .limit(20);
        if (data && data.length > 0) candidates = data;
      }
    }

    let targetQ: any = null;
    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const candNorm = normalizeForMatch(cand.question_text);
        const simOld = calculateSimilarity(cleanOldEn, cand.question_text);
        const simNew = calculateSimilarity(cleanNewEn, cand.question_text);
        if (
          (candNorm &&
            ((oldNorm && (candNorm.includes(oldNorm) || oldNorm.includes(candNorm))) ||
             (newNorm && (candNorm.includes(newNorm) || newNorm.includes(candNorm))))) ||
          simOld >= 0.50 ||
          simNew >= 0.50
        ) {
          targetQ = cand;
          break;
        }
      }
    }

    if (!targetQ) return { synced: false };

    const splitA = splitBilingualOption(updatedData.option_a);
    const splitB = splitBilingualOption(updatedData.option_b);
    const splitC = splitBilingualOption(updatedData.option_c);
    const splitD = splitBilingualOption(updatedData.option_d);

    const qUpdate: any = {};
    if (updatedData.question_text !== undefined) {
      qUpdate.question_text = cleanNewEn;
      if (cleanNewHi) qUpdate.question_text_hi = cleanNewHi;
    }
    if (updatedData.option_a !== undefined) {
      qUpdate.option_a = splitA.english || updatedData.option_a;
      if (splitA.isBilingual) qUpdate.option_a_hi = splitA.hindi;
    }
    if (updatedData.option_b !== undefined) {
      qUpdate.option_b = splitB.english || updatedData.option_b;
      if (splitB.isBilingual) qUpdate.option_b_hi = splitB.hindi;
    }
    if (updatedData.option_c !== undefined) {
      qUpdate.option_c = splitC.english || updatedData.option_c;
      if (splitC.isBilingual) qUpdate.option_c_hi = splitC.hindi;
    }
    if (updatedData.option_d !== undefined) {
      qUpdate.option_d = splitD.english || updatedData.option_d;
      if (splitD.isBilingual) qUpdate.option_d_hi = splitD.hindi;
    }
    if (updatedData.correct_answer !== undefined) {
      qUpdate.correct_answer = String(updatedData.correct_answer).toUpperCase();
    }
    if (updatedData.explanation !== undefined) {
      qUpdate.explanation = updatedData.explanation;
    }

    if (Object.keys(qUpdate).length > 0) {
      await supabaseAdmin
        .from("questions")
        .update(qUpdate)
        .eq("id", targetQ.id);

      return { synced: true, questionBankId: targetQ.id };
    }

    return { synced: false };
  } catch (err) {
    console.warn("syncPyqToQuestionBank warning (non-fatal):", err);
    return { synced: false };
  }
}
