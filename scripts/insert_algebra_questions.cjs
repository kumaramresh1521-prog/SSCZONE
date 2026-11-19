const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function main() {
  const jsonPath = path.join(__dirname, 'algebra_questions_clean.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Clean questions JSON not found at ${jsonPath}`);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Starting insertion of ${questions.length} Algebra questions into topic_id: 201 (SSC CGL Algebric Polynomial and identities)...`);

  // First check if any questions already exist for topic_id 201
  const { count: existingCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 201);

  if (countErr) {
    console.error('Error checking existing count:', countErr);
    process.exit(1);
  }

  console.log(`Current questions in topic_id 201: ${existingCount}`);

  if (existingCount > 0) {
    console.log(`Cleaning up ${existingCount} old questions in topic_id 201 before fresh ingestion...`);
    const { error: delErr } = await supabase
      .from('questions')
      .delete()
      .eq('topic_id', 201);
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
    const dbRows = slice.map(q => ({
      topic_id: 201,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      exam_tag: q.exam_tag,
      tier_level: q.tier_level,
      year_reference: q.year_reference,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(dbRows)
      .select('id');

    if (error) {
      console.error(`Failed at batch ${i} - ${i + slice.length}:`, error);
      process.exit(1);
    }

    insertedTotal += data.length;
    insertedIds.push(...data.map(d => d.id));
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${data.length} questions (Total so far: ${insertedTotal}/${questions.length})`);
  }

  console.log(`\n🎉 Successfully inserted all ${insertedTotal} Algebra questions into topic_id: 201!`);

  // Verify final count in database
  const { count: finalCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 201);

  console.log(`Verified DB count for topic_id 201: ${finalCount}`);
}

main().catch(err => {
  console.error('Fatal error during insertion:', err);
  process.exit(1);
});
