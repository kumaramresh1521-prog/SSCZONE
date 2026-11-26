/**
 * Shared chapter-title matching helpers.
 *
 * The syllabus (website + app) links to chapter practice with a human title
 * (e.g. "LCM and HCF"), while the Question Bank stores slightly different
 * spellings (e.g. "HCF and LCM"). These helpers resolve a title to a real
 * topic so practice uses that chapter's Question Bank when it exists.
 *
 * Deliberately dependency-free so both server routes and client components
 * can import it.
 */

const TOPIC_TITLE_STOP_WORDS = new Set([
  "and", "of", "the", "based", "on", "problem", "problems", "test", "practice",
  "set", "drill", "chapter", "questions", "question", "general", "science", "indian",
]);

export const TOPIC_TITLE_ALIASES: Record<string, string> = {
  "lcm and hcf": "hcf and lcm",
  "simple interest": "simple and interest",
  "speed time and distance": "time speed and distance",
  "time and work": "work and time",
  "statistics and data interpretation": "statistics data interpretation",
  "mensuration 2d": "area and perimeter",
  "mensuration 3d": "surface area and volume",
  "heights and distances": "height and distance",
  "geometry triangles": "geometry",
  "geometry circles": "geometry",
  "blood relations": "blood relationship",
  "venn diagrams": "logical venn diagram",
  "mirror images": "mirror image",
  "para jumbles": "para jumble",
  synonyms: "synonym",
  antonyms: "antonym",
  "spotting errors": "common error",
  "active and passive voice": "voice",
  "direct and indirect speech": "narration",
  "fill in the blanks": "filler",
  "number series": "series",
  "mathematical operations": "symbols and notations",
  "clock and calendar": "scheduled day date time",
  "dice and cube": "cubes and dices",
  "mughal empire delhi sultanate": "medieval history",
  "indian rivers": "geography",
  "climate and agriculture": "geography",
  "fundamental rights": "indian polity and constitution",
  "parliament and president": "indian polity and constitution",
  "constitutional amendments": "indian polity and constitution",
};

export function normalizeTopicTitle(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export interface TopicLike {
  id: number;
  title: string;
}

/**
 * Best-effort match: exact normalised title, alias, containment, then token
 * overlap. Returns null when nothing is confident enough, so callers can keep
 * their existing fallback instead of guessing.
 */
export function matchTopicByTitle<T extends TopicLike>(topics: T[], rawTitle: string): T | null {
  const title = String(rawTitle || "").trim();
  if (!title || topics.length === 0) return null;

  const baseKey = normalizeTopicTitle(title);
  const wanted = normalizeTopicTitle(TOPIC_TITLE_ALIASES[baseKey] || title);
  if (!wanted) return null;

  const normalized = topics.map((topic) => ({ topic, key: normalizeTopicTitle(topic.title) }));

  const exact = normalized.find((entry) => entry.key === wanted);
  if (exact) return exact.topic;

  const contained = normalized.find(
    (entry) => entry.key.includes(wanted) || wanted.includes(entry.key)
  );
  if (contained) return contained.topic;

  const wantedTokens = wanted
    .split(" ")
    .filter((word) => word.length > 2 && !TOPIC_TITLE_STOP_WORDS.has(word));
  if (wantedTokens.length === 0) return null;

  let best: { topic: T; score: number } | null = null;
  for (const entry of normalized) {
    const topicTokens = new Set(
      entry.key
        .split(" ")
        .filter((word) => word.length > 2 && !TOPIC_TITLE_STOP_WORDS.has(word))
    );
    let score = 0;
    for (const token of wantedTokens) {
      if (topicTokens.has(token)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic: entry.topic, score };
    }
  }

  if (!best) return null;
  const requiredScore = Math.ceil(wantedTokens.length / 2);
  return best.score >= requiredScore ? best.topic : null;
}
