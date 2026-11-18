const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function main() {
  const jsonPath = path.join(__dirname, 'number_system_questions_clean.json');
  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Starting insertion of ${questions.length} Number System questions into topic_id: 182...`);

  // First check if any questions already exist for topic_id 182
  const { count: existingCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 182);

  if (countErr) {
    console.error('Error checking existing count:', countErr);
    process.exit(1);
  }

  console.log(`Current questions in topic_id 182: ${existingCount}`);

  const BATCH_SIZE = 50;
  let insertedTotal = 0;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const slice = questions.slice(i, i + BATCH_SIZE);
    const payload = slice.map(q => ({
      topic_id: 182,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      exam_tag: q.exam_tag || 'R.S. Aggarwal Quantitative Aptitude',
      year_reference: q.year_reference ? String(q.year_reference) : null,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(payload)
      .select('id');

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
      process.exit(1);
    }

    insertedTotal += data.length;
    console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)}] Inserted ${data.length} questions (Total: ${insertedTotal}/${questions.length})`);
  }

  console.log('\n--- VERIFICATION AFTER INSERTION ---');
  const { count: finalCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 182);

  console.log(`Total questions in topic_id 182 now: ${finalCount}`);

  // Fetch 3 random questions to inspect
  const { data: samples } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, option_a, option_b, option_c, option_d, explanation')
    .eq('topic_id', 182)
    .limit(3);

  console.log('Sample verified questions from database:', JSON.stringify(samples, null, 2));
}

main().catch(console.error);
