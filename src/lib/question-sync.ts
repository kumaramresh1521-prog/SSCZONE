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
    const { data: candidates } = await supabaseAdmin
      .from("paper_questions")
      .select("id, question_text, option_a, paper_id")
      .ilike("question_text", `%${prefixSample}%`)
      .limit(10);

    let targetPQ: any = null;
    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const candNorm = normalizeForMatch(cand.question_text);
        if (candNorm && (candNorm.includes(norm) || norm.includes(candNorm))) {
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
    if (!qText) return { synced: false };

    const splitQ = splitBilingualText(qText);
    const cleanEn = splitQ.english || qText;
    const cleanHi = splitQ.isBilingual ? splitQ.hindi : null;
    const norm = normalizeForMatch(cleanEn);
    if (!norm || norm.length < 15) return { synced: false };

    // Search for counterpart in questions table
    const prefixSample = cleanEn.substring(0, 40).replace(/[%_]/g, "");
    const { data: candidates } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, topic_id")
      .ilike("question_text", `%${prefixSample}%`)
      .limit(10);

    let targetQ: any = null;
    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const candNorm = normalizeForMatch(cand.question_text);
        if (candNorm && (candNorm.includes(norm) || norm.includes(candNorm))) {
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
      qUpdate.question_text = cleanEn;
      if (cleanHi) qUpdate.question_text_hi = cleanHi;
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
