const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

// Mimic fetchAllQuestionsByTopics from src/lib/question-queries.ts
async function fetchQuestions(topicIds) {
  const ids = Array.isArray(topicIds) ? topicIds : [topicIds];
  let all = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, exam_tag, tier_level, year_reference')
      .in('topic_id', ids)
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

async function verify() {
  console.log('--- Step 1: Direct Fetch for Topic 6 (SSC CGL Physics) ---');
  const cglQs = await fetchQuestions(6);
  console.log(`CGL Physics direct count: ${cglQs.length}`);

  console.log('\n--- Step 2: Sibling Auto-Sync for Topic 104 (SSC CHSL Physics) ---');
  let chslQs = await fetchQuestions(104);
  if (chslQs.length === 0) {
    const { data: siblings } = await supabase.from('topics').select('id').ilike('title', 'Physics');
    const sibIds = siblings.map(s => s.id);
    chslQs = await fetchQuestions(sibIds);
  }
  console.log(`CHSL Physics synced count: ${chslQs.length}`);

  console.log('\n--- Step 3: Sibling Auto-Sync for Topic 434 (SSC CPO Physics) ---');
  let cpoQs = await fetchQuestions(434);
  if (cpoQs.length === 0) {
    const { data: siblings } = await supabase.from('topics').select('id').ilike('title', 'Physics');
    const sibIds = siblings.map(s => s.id);
    cpoQs = await fetchQuestions(sibIds);
  }
  console.log(`CPO Physics synced count: ${cpoQs.length}`);

  console.log('\n--- Step 4: Sample Live Verification from Database ---');
  const sampleIndices = [0, 72, 127, 282, 335, 440, 644, 750, 820];
  sampleIndices.forEach(idx => {
    const q = cglQs[idx];
    if (q) {
      console.log(`\nSample #${idx + 1} (DB ID: ${q.id}, Chapter: ${q.tier_level}, Tag: ${q.exam_tag}, Year: ${q.year_reference}):`);
      console.log(`Stem: ${q.question_text.substring(0, 100)}...`);
      console.log(`Options: A) ${q.option_a} | B) ${q.option_b} | C) ${q.option_c} | D) ${q.option_d}`);
      console.log(`Correct Answer: ${q.correct_answer}`);
      console.log(`Explanation tail:\n${q.explanation.split('\n\n').slice(-2).join('\n\n')}`);
    }
  });

  // Verify 100% key match on all 821 rows in database
  let keyMismatchCount = 0;
  cglQs.forEach((q, i) => {
    const expected = `✅ **Correct Answer:** Option (${q.correct_answer})`;
    if (!q.explanation.includes(expected)) {
      console.error(`Mismatch at row ${i + 1} (ID ${q.id})! Key: ${q.correct_answer}`);
      keyMismatchCount++;
    }
  });
  console.log(`\nKey verification check across all ${cglQs.length} DB records: ${keyMismatchCount} mismatches found.`);
}

verify().catch(console.error);
