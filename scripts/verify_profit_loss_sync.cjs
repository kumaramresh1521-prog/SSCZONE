const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function fetchAllQuestionsByTopics(supabase, topicIds, options) {
  const ids = Array.isArray(topicIds) ? topicIds : [topicIds];
  if (ids.length === 0) return { data: [], error: null };

  const pageSize = options?.pageSize ?? 1000;
  const activeOnly = options?.activeOnly ?? false;
  const allRows = [];
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

async function verifySync() {
  console.log('Testing auto-sync query simulating /practice/ssc-cgl-profit-and-loss...');
  const { data: cglQs } = await fetchAllQuestionsByTopics(supabase, 190, { activeOnly: true });
  console.log(`CGL (Topic 190) direct questions fetched: ${cglQs.length}`);

  console.log('Testing auto-sync query simulating /practice/ssc-chsl-profit-and-loss...');
  let { data: chslQs } = await fetchAllQuestionsByTopics(supabase, 275, { activeOnly: true });
  if (!chslQs || chslQs.length === 0) {
    const { data: siblingTopics } = await supabase.from("topics").select("id").ilike("title", "profit and loss");
    const siblingIds = siblingTopics.map(t => t.id);
    const { data: sharedQs } = await fetchAllQuestionsByTopics(supabase, siblingIds, { activeOnly: true });
    chslQs = sharedQs;
  }
  console.log(`CHSL (Topic 275) auto-sync questions fetched: ${chslQs.length}`);

  console.log('Testing auto-sync query simulating /practice/ssc-cpo-profit-and-loss...');
  let { data: cpoQs } = await fetchAllQuestionsByTopics(supabase, 358, { activeOnly: true });
  if (!cpoQs || cpoQs.length === 0) {
    const { data: siblingTopics } = await supabase.from("topics").select("id").ilike("title", "profit and loss");
    const siblingIds = siblingTopics.map(t => t.id);
    const { data: sharedQs } = await fetchAllQuestionsByTopics(supabase, siblingIds, { activeOnly: true });
    cpoQs = sharedQs;
  }
  console.log(`CPO (Topic 358) auto-sync questions fetched: ${cpoQs.length}`);

  // Also check if any question has null stem or null options
  const nullChecks = cglQs.filter(q => !q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer || !q.explanation);
  console.log(`Integrity Check on 230 rows: Questions with missing fields = ${nullChecks.length}`);
}

verifySync().catch(console.error);
