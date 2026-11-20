const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rmobqopitkjobcnyqzru.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const jsonPath = path.join(__dirname, 'physics_new_batch_clean.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Clean questions JSON not found at ${jsonPath}`);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Starting insertion of ${questions.length} new Physics questions into topic_id: 6 (SSC CGL Physics)...`);

  // Check current count
  const { count: existingCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 6);

  if (countErr) {
    console.error('Error checking existing count:', countErr);
    process.exit(1);
  }

  console.log(`Current existing questions in topic_id 6: ${existingCount}`);
  const expectedTotal = existingCount + questions.length;
  console.log(`Target total after insertion: ${expectedTotal}`);

  const BATCH_SIZE = 50;
  let insertedTotal = 0;
  const insertedIds = [];

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const slice = questions.slice(i, i + BATCH_SIZE);
    const dbRows = slice.map(q => ({
      topic_id: 6,
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
    data.forEach(d => insertedIds.push(d.id));
    process.stdout.write(`Inserted batch [${i + 1} - ${i + data.length}] (Total so far: ${insertedTotal}/${questions.length})\n`);
  }

  console.log(`\nAll ${insertedTotal} questions successfully inserted!`);

  // Verify new total in topic 6
  const { count: newCount, error: newCountErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 6);

  if (newCountErr) {
    console.error('Error verifying new count:', newCountErr);
  } else {
    console.log(`Verified new count in Topic 6: ${newCount} (Expected: ${expectedTotal})`);
  }

  // Save inserted IDs
  const metaPath = path.join(__dirname, 'physics_new_batch_inserted_ids.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    previous_count: existingCount,
    inserted_count: insertedTotal,
    new_total_count: newCount,
    inserted_ids: insertedIds
  }, null, 2), 'utf8');
  console.log(`Saved insertion metadata to ${metaPath}`);
}

main().catch(console.error);
