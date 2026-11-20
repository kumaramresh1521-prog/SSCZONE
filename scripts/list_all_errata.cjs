const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function listAllErrata() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, explanation, tier_level')
    .eq('topic_id', 6)
    .ilike('explanation', '%Errata & Key Verification Note%')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} errata records in Supabase:`);
  data.forEach((q, idx) => {
    const lines = q.explanation.split('\n');
    const errIdx = lines.findIndex(l => l.includes('Errata & Key Verification Note'));
    const note = lines[errIdx + 1] ? lines[errIdx + 1].trim() : '';
    console.log(`${idx + 1}. [${q.tier_level}] ${q.question_text.replace(/\n/g, ' ').substring(0, 55)}...`);
    console.log(`   Correct: Option (${q.correct_answer}) | Note: ${note.substring(0, 110)}`);
  });
}

listAllErrata();
