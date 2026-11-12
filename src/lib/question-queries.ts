/**
 * Fetch all rows from `questions` for one or more topic IDs using deterministic `.range()` pagination
 * so topics exceeding PostgREST's default 1,000-row cap (e.g. Analogy with Type-I through Type-V)
 * are never truncated.
 */
export async function fetchAllQuestionsByTopics(
  supabase: any,
  topicIds: number | number[],
  options?: { activeOnly?: boolean; pageSize?: number }
): Promise<{ data: any[]; error: any }> {
  const ids = Array.isArray(topicIds) ? topicIds : [topicIds];
  if (ids.length === 0) return { data: [], error: null };

  const pageSize = options?.pageSize ?? 1000;
  const activeOnly = options?.activeOnly ?? false;
  const allRows: any[] = [];
  let offset = 0;

  while (true) {
    let query = supabase.from("questions").select("*");
    query = ids.length === 1 ? query.eq("topic_id", ids[0]) : query.in("topic_id", ids);
    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { data: allRows, error };
    }
    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...data);
    if (data.length < pageSize) {
      break;
    }
    offset += pageSize;
  }

  return { data: allRows, error: null };
}
