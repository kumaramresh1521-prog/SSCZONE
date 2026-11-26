import { supabaseAdmin } from "./supabase-admin";

/**
 * Supabase/PostgREST returns rows in storage order, so a plain `.limit(N)`
 * query always samples the same head of a filtered pool. That makes practice
 * sets repeat even when thousands of questions exist (e.g. a 293-question
 * topic only ever exposed its first 50 rows).
 *
 * These helpers count the filtered pool (briefly cached) and let callers pick
 * a random window across the whole pool instead.
 */
const POOL_COUNT_TTL_MS = 5 * 60 * 1000;
const poolCountCache = new Map<string, { count: number; expiresAt: number }>();
const topicIdsCache = new Map<string, { ids: number[]; expiresAt: number }>();

export async function getQuestionBankPoolCount(options: {
  topicId?: number;
  subjectIds?: number[];
}): Promise<number> {
  const cacheKey = options.topicId
    ? `topic:${options.topicId}`
    : `subjects:${(options.subjectIds || []).join(",")}`;

  const cached = poolCountCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.count;

  let count: number | null = null;
  let error: unknown = null;

  if (options.topicId) {
    const result = await supabaseAdmin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", options.topicId)
      .eq("is_active", true);
    count = result.count;
    error = result.error;
  } else if (options.subjectIds && options.subjectIds.length > 0) {
    const result = await supabaseAdmin
      .from("questions")
      .select("id, topics!inner(subject_id)", { count: "exact", head: true })
      .in("topics.subject_id", options.subjectIds)
      .eq("is_active", true);
    count = result.count;
    error = result.error;
  }

  if (error) {
    console.error("Question bank pool count error:", error);
    return 0;
  }

  const total = count || 0;
  poolCountCache.set(cacheKey, { count: total, expiresAt: Date.now() + POOL_COUNT_TTL_MS });
  return total;
}

export function pickRandomWindowOffset(poolSize: number, windowSize: number): number {
  const safeWindow = Math.max(1, Math.floor(windowSize));
  if (poolSize <= safeWindow) return 0;
  return Math.floor(Math.random() * (poolSize - safeWindow + 1));
}

/**
 * Returns every active Question Bank question ID for a topic.
 * IDs are tiny, so this lets topic practice sample uniformly from the FULL
 * topic pool instead of whichever rows happen to sit at the head of the table.
 * Paginated because PostgREST caps a single response (default 1000 rows).
 */
export async function getQuestionBankTopicQuestionIds(topicId: number): Promise<number[]> {
  const cacheKey = `topic-ids:${topicId}`;
  const cached = topicIdsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.ids;

  const ids: number[] = [];
  const PAGE_SIZE = 1000;

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("topic_id", topicId)
      .eq("is_active", true)
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Question bank topic ID fetch error:", error);
      break;
    }

    const rows = data || [];
    for (const row of rows) ids.push(row.id);
    if (rows.length < PAGE_SIZE) break;
  }

  topicIdsCache.set(cacheKey, { ids, expiresAt: Date.now() + POOL_COUNT_TTL_MS });
  return ids;
}
