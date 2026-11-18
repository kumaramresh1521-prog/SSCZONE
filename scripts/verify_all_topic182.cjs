const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function verify() {
  const { data: rows, error } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, exam_tag, year_reference')
    .eq('topic_id', 182)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    process.exit(1);
  }

  console.log(`Total questions in topic 182: ${rows.length}`);

  let examTagCount = 0;
  let yearRefCount = 0;
  let piAnomalies = 0;
  let rootAnomalies = 0;
  let flattenedExponents = 0;
  let mangledFractions = 0;

  rows.forEach((r, idx) => {
    const qNum = idx + 1;
    const all = `${r.question_text} ${r.option_a} ${r.option_b} ${r.option_c} ${r.option_d} ${r.explanation}`;

    if (r.exam_tag !== null) examTagCount++;
    if (r.year_reference !== null) yearRefCount++;

    if (/\bThe number p is\b/i.test(r.question_text)) {
      console.log(`[PI ANOMALY] Q#${qNum} (ID ${r.id})`);
      piAnomalies++;
    }

    if (/^\s*2 is a\/an/i.test(r.question_text) || /^\s*The number 3 is/i.test(r.question_text)) {
      console.log(`[ROOT ANOMALY] Q#${qNum} (ID ${r.id})`);
      rootAnomalies++;
    }

    if (/232\s*\+\s*1/.test(all) || /34n\s*–\s*43n/.test(all) || /10n\s*–\s*1/.test(all) || /10025\s*–\s*25/.test(all) || /5n\s*\+\s*6m/.test(all)) {
      console.log(`[EXPONENT ANOMALY] Q#${qNum} (ID ${r.id})`);
      flattenedExponents++;
    }

    if (/×\s*×\s*\+/.test(r.question_text) || /×\s*×\s*\+/.test(r.explanation)) {
      console.log(`[FRACTION ANOMALY] Q#${qNum} (ID ${r.id})`);
      mangledFractions++;
    }
  });

  console.log('--- AUDIT REPORT ---');
  console.log(`Exam tags remaining: ${examTagCount}`);
  console.log(`Year references remaining: ${yearRefCount}`);
  console.log(`Pi anomalies: ${piAnomalies}`);
  console.log(`Root anomalies: ${rootAnomalies}`);
  console.log(`Flattened exponent anomalies: ${flattenedExponents}`);
  console.log(`Mangled fraction anomalies: ${mangledFractions}`);
  console.log('--- AUDIT COMPLETE ---');
}

verify().catch(console.error);
