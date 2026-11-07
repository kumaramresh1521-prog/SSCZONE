/**
 * Normalized Question Content Fingerprinting Utility
 *
 * Strips HTML, non-alphanumeric punctuation, currency markers, whitespace,
 * and extracts the English stem (even from bilingual PYQ format) to produce
 * a robust, collision-resistant deduplication fingerprint.
 */

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

export function cleanQuestionStem(text?: string | null): string {
  if (!text) return "";
  const s = String(text);
  const hiIdx = s.search(DEVANAGARI_REGEX);
  // If Devanagari appears after an English prefix of >= 10 chars, isolate English stem
  const enPart = hiIdx >= 10 ? s.substring(0, hiIdx) : s;
  return enPart
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/\b(rs|inr|rupees)\b/gi, "")
    .replace(/[^a-z0-9\u0900-\u097F]/g, "")
    .trim();
}

export function cleanOptionText(text?: string | null): string {
  if (!text) return "";
  const s = String(text);
  // Split on slash or Devanagari if bilingual option (e.g. "₹1,20,000 / ₹1,20,000" or "40 / चालीस")
  const firstPart = s.split(/[\/\u0900-\u097F]/)[0] || s;
  return firstPart
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/\b(rs|inr|rupees)\b/gi, "")
    .replace(/[^a-z0-9\u0900-\u097F]/g, "")
    .trim();
}

export function getQuestionFingerprint(q: {
  question_text?: string | null;
  option_a?: string | null;
  option_b?: string | null;
}): string {
  const cleanQ = cleanQuestionStem(q.question_text);
  const cleanA = cleanOptionText(q.option_a);
  const cleanB = cleanOptionText(q.option_b);

  // Composite fingerprint: Question stem (first 140 chars) + Option A (first 30 chars) + Option B (first 20 chars)
  return `${cleanQ.slice(0, 140)}|optA:${cleanA.slice(0, 30)}|optB:${cleanB.slice(0, 20)}`;
}
