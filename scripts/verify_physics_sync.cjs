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
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, exam_tag, tier_level, year_reference')
      .in('topic_id', ids)
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    from += data.length;
    if (data.length < PAGE_SIZE) break;
  }
  return all;
}

// Sibling topic map from src/lib/question-queries.ts
const TOPIC_SIBLINGS = {
  104: [104, 6, 434], // CHSL Physics -> includes CGL (6) and CPO (434)
  434: [434, 6, 104], // CPO Physics -> includes CGL (6) and CHSL (104)
  6: [6, 104, 434]    // CGL Physics -> includes CHSL (104) and CPO (434)
};

async function testSync() {
  console.log('--- Step 1: Direct Fetch for Topic 6 (SSC CGL Physics) ---');
  const cglDirect = await fetchQuestions([6]);
  console.log(`CGL Physics direct count: ${cglDirect.length}`);

  console.log('\n--- Step 2: Sibling Auto-Sync for Topic 104 (SSC CHSL Physics) ---');
  const chslSynced = await fetchQuestions(TOPIC_SIBLINGS[104]);
  console.log(`CHSL Physics synced count: ${chslSynced.length}`);

  console.log('\n--- Step 3: Sibling Auto-Sync for Topic 434 (SSC CPO Physics) ---');
  const cpoSynced = await fetchQuestions(TOPIC_SIBLINGS[434]);
  console.log(`CPO Physics synced count: ${cpoSynced.length}`);

  console.log('\n--- Step 4: Full Audit of All 1,555 Records ---');
  let nonSscCount = 0;
  let highYieldCount = 0;
  let errataCount = 0;
  let keyMismatchCount = 0;
  const tierDistribution = {};

  cglDirect.forEach((q, idx) => {
    tierDistribution[q.tier_level] = (tierDistribution[q.tier_level] || 0) + 1;

    // Check exam tag
    if (!q.exam_tag || !q.exam_tag.toUpperCase().includes('SSC')) {
      nonSscCount++;
    }

    // Check high yield
    const fullJson = JSON.stringify(q);
    if (/high[- ]?yield/i.test(fullJson)) {
      highYieldCount++;
    }

    // Check errata
    if (/errata/i.test(fullJson)) {
      errataCount++;
    }

    // Check key match in explanation
    const m = q.explanation ? q.explanation.match(/✅ \*\*Correct Answer:\*\* Option \(([A-D])\)/) : null;
    if (!m || m[1] !== q.correct_answer) {
      keyMismatchCount++;
    }
  });

  console.log('Chapter/Topic Distribution across all 1,555 questions:');
  Object.entries(tierDistribution).forEach(([tier, count]) => {
    console.log(`  - ${tier}: ${count} questions`);
  });

  console.log('\nAudit Results:');
  console.log(`Total questions checked: ${cglDirect.length}`);
  console.log(`Non-SSC exam tags found: ${nonSscCount}`);
  console.log(`'high-yield' occurrences: ${highYieldCount}`);
  console.log(`'errata' occurrences: ${errataCount}`);
  console.log(`Key mismatches in explanations: ${keyMismatchCount}`);

  if (cglDirect.length === 1555 && nonSscCount === 0 && highYieldCount === 0 && errataCount === 0 && keyMismatchCount === 0) {
    console.log('\nPERFECT SUCCESS: All 1,555 questions are completely verified and in full compliance!');
  } else {
    console.error('\nDiscrepancy detected during verification!');
  }
}

testSync().catch(console.error);
