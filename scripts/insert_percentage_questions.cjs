const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function main() {
  const jsonPath = path.join(__dirname, 'percentage_questions_clean.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Clean questions JSON not found at ${jsonPath}`);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Starting insertion of ${questions.length} Percentage questions into topic_id: 189 (SSC CGL Percentage)...`);

  // First check if any questions already exist for topic_id 189
  const { count: existingCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 189);

  if (countErr) {
    console.error('Error checking existing count:', countErr);
    process.exit(1);
  }

  console.log(`Current questions in topic_id 189: ${existingCount}`);

  if (existingCount > 0) {
    console.log(`Cleaning up ${existingCount} old questions in topic_id 189 before fresh ingestion...`);
    const { error: delErr } = await supabase
      .from('questions')
      .delete()
      .eq('topic_id', 189);
    if (delErr) {
      console.error('Error cleaning old questions:', delErr);
      process.exit(1);
    }
    console.log('Cleanup complete.');
  }

  const BATCH_SIZE = 50;
  let insertedTotal = 0;
  const insertedIds = [];

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const slice = questions.slice(i, i + BATCH_SIZE);
    const payload = slice.map(q => ({
      topic_id: 189,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      exam_tag: q.exam_tag,
      tier_level: q.tier_level,
      year_reference: q.year_reference,
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

    data.forEach(r => insertedIds.push(r.id));
    insertedTotal += data.length;
    console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)}] Inserted ${data.length} questions (Total: ${insertedTotal}/${questions.length})`);
  }

  console.log('\n--- VERIFICATION AFTER INSERTION ---');
  const { count: finalCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 189);

  console.log(`Total questions in topic_id 189 now: ${finalCount}`);

  // Fetch 3 random questions from DB to inspect integrity
  const { data: samples } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, option_a, option_b, option_c, option_d, exam_tag, tier_level, explanation')
    .eq('topic_id', 189)
    .limit(3);

  console.log('Sample verified questions from database:');
  samples.forEach((s, idx) => {
    console.log(`\nSample #${idx + 1}: ID ${s.id} | Tag: ${s.exam_tag} | Tier: ${s.tier_level} | Ans: ${s.correct_answer}`);
    console.log(`Stem: ${s.question_text.slice(0, 90)}...`);
    console.log(`Options: A) ${s.option_a} | B) ${s.option_b} | C) ${s.option_c} | D) ${s.option_d}`);
  });

  // Verify Q238 and Q244
  const { data: q238 } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, exam_tag, tier_level')
    .eq('topic_id', 189)
    .ilike('question_text', '%reduction of 15% in the price of salt%');
  console.log('\nVerified Q238 in DB:', q238);

  const { data: q244 } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, exam_tag, tier_level')
    .eq('topic_id', 189)
    .ilike('question_text', '%A invested 30% more than B%');
  console.log('Verified Q244 in DB:', q244);
}

main().catch(console.error);
