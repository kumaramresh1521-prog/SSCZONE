const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function checkSample() {
  console.log('--- LIVE DB SAMPLE VERIFICATION ---\n');

  // Sample 3 from Number System (Topic 182)
  const { data: nsSample } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, exam_tag, tier_level, explanation')
    .eq('topic_id', 182)
    .limit(3);

  console.log('=== NUMBER SYSTEM SAMPLE ===');
  nsSample.forEach((q, i) => {
    console.log(`\n[NS #${i+1}] ID: ${q.id} | Exam: ${q.exam_tag} | Topic: ${q.tier_level}`);
    console.log(`Q: ${q.question_text}`);
    console.log(`(A) ${q.option_a}  (B) ${q.option_b}  (C) ${q.option_c}  (D) ${q.option_d}`);
    console.log(`Correct Answer: (${q.correct_answer}) -> ${q['option_' + q.correct_answer.toLowerCase()]}`);
    const firstLines = q.explanation.split('\n').filter(l => l.trim()).slice(0, 4).join('\n');
    console.log(`Solution Snippet:\n${firstLines}...`);
  });

  // Sample 3 from Algebra (Topic 201)
  const { data: algSample } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, exam_tag, tier_level, explanation')
    .eq('topic_id', 201)
    .limit(3);

  console.log('\n=== ALGEBRA SAMPLE ===');
  algSample.forEach((q, i) => {
    console.log(`\n[ALG #${i+1}] ID: ${q.id} | Exam: ${q.exam_tag} | Topic: ${q.tier_level}`);
    console.log(`Q: ${q.question_text}`);
    console.log(`(A) ${q.option_a}  (B) ${q.option_b}  (C) ${q.option_c}  (D) ${q.option_d}`);
    console.log(`Correct Answer: (${q.correct_answer}) -> ${q['option_' + q.correct_answer.toLowerCase()]}`);
    const firstLines = q.explanation.split('\n').filter(l => l.trim()).slice(0, 4).join('\n');
    console.log(`Solution Snippet:\n${firstLines}...`);
  });
}

checkSample();
