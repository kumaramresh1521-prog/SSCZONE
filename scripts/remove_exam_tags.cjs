const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function cleanExamTags(text) {
  if (!text) return '';
  return text
    // Replace [SSC—CHSL (10 + 2) Exam, 2015], [CDS, 2016], etc.
    .replace(/\s*\[\s*(?:SSC|IBPS|CDS|NDA|UPSSSC|ESIC|RRB|CMAT|CTET|CLAT|CAT|MAT|Bank)[^\]]*\]/gi, '')
    // Replace (R.R.B., 2006), (M.B.A., 2005), (S.S.C., 2010), (CLAT, 2010), (P.C.S., 2007), (Campus Recruitment, 2007), (Hotel Management, 2009), (Bank P.O., 2009), (M.C.A., 2005), etc.
    .replace(/\s*\(\s*(?:R\.?R\.?B\.?|M\.?B\.?A\.?|S\.?S\.?C\.?|P\.?C\.?S\.?|C\.?A\.?T\.?|C\.?D\.?S\.?|N\.?D\.?A\.?|M\.?C\.?A\.?|I\.?A\.?M\.?|C\.?M\.?A\.?T\.?|C\.?T\.?E\.?T\.?|C\.?L\.?A\.?T\.?|Bank|Campus|Hotel|Railways|Section Officer)[^\)]*\)/gi, '')
    // Clean trailing directions text if accidentally captured in options
    .replace(/\s*Direction\s*\(Question\s*\d+\)[\s\S]*/gi, '')
    .trim();
}

async function removeTags() {
  console.log('Fetching all questions for topic 182...');
  const { data: rows, error } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', 182)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    process.exit(1);
  }

  console.log(`Fetched ${rows.length} rows. Removing exam tags...`);

  let modifiedCount = 0;
  const updates = rows.map((r, idx) => {
    const qNum = idx + 1;
    let qText = cleanExamTags(r.question_text);
    let optA = cleanExamTags(r.option_a);
    let optB = cleanExamTags(r.option_b);
    let optC = cleanExamTags(r.option_c);
    let optD = cleanExamTags(r.option_d);
    let explanation = cleanExamTags(r.explanation);

    // Specific check for Q361 (ID 25883)
    if (r.id === 25883) {
      optD = '1111';
    }

    if (qText !== r.question_text || optD !== r.option_d || r.exam_tag !== null || r.year_reference !== null) {
      modifiedCount++;
    }

    return {
      id: r.id,
      topic_id: 182,
      question_text: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: r.correct_answer,
      explanation: explanation,
      exam_tag: null,           // Clear exam_tag column
      year_reference: null,     // Clear year_reference column
      difficulty: r.difficulty || 'medium',
      is_active: true
    };
  });

  console.log(`Updating ${updates.length} rows in Supabase (Exam tags removed from ${modifiedCount} rows and all exam_tag columns set to NULL)...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const slice = updates.slice(i, i + BATCH_SIZE);
    const { error: upErr } = await supabase.from('questions').upsert(slice);
    if (upErr) {
      console.error(`Error updating batch ${Math.floor(i / BATCH_SIZE) + 1}:`, upErr);
      process.exit(1);
    }
    console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)}] Updated ${slice.length} rows.`);
  }

  console.log('--- VERIFICATION AFTER REMOVING EXAM TAGS ---');
  const { data: verifyRows } = await supabase
    .from('questions')
    .select('id, question_text, option_d, exam_tag, year_reference')
    .eq('topic_id', 182);

  let remainingColTags = 0;
  let remainingTextTags = 0;

  verifyRows.forEach(r => {
    if (r.exam_tag !== null) remainingColTags++;
    if (/\[\s*(?:SSC|IBPS|CDS|NDA|UPSSSC|ESIC|RRB|CMAT|CTET|CLAT|CAT|MAT|Bank)/i.test(r.question_text) ||
        /\(\s*(?:R\.?R\.?B\.?|M\.?B\.?A\.?|S\.?S\.?C\.?|P\.?C\.?S\.?|C\.?A\.?T\.?|C\.?D\.?S\.?|N\.?D\.?A\.?|M\.?C\.?A\.?|I\.?A\.?M\.?|C\.?M\.?A\.?T\.?|C\.?T\.?E\.?T\.?|C\.?L\.?A\.?T\.?|Bank|Campus|Hotel|Railways|Section Officer)/i.test(r.question_text)) {
      remainingTextTags++;
    }
  });

  console.log(`Remaining non-null exam_tag column count: ${remainingColTags}`);
  console.log(`Remaining exam tags in question_text: ${remainingTextTags}`);
}

removeTags().catch(console.error);
