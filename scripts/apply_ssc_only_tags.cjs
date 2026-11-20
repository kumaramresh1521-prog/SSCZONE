const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function cleanExamTag(rawTag) {
  if (!rawTag) return 'SSC Exam PYQ';
  let tag = String(rawTag).trim();

  // Remove (High-Yield)
  tag = tag.replace(/\s*\([Hh]igh-[Yy]ield\)/gi, '').trim();

  // If already generic
  if (tag === 'SSC Exam PYQ' || tag === 'SSC PYQ' || tag === 'SSC') {
    return 'SSC Exam PYQ';
  }

  // If contains SSC
  if (/ssc/i.test(tag)) {
    const sscWithYear = tag.match(/SSC\s*(?:\(10\+2\)|CGL|CHSL|CPO|MTS|Tier[-\s]?[I|II|1|2]*)?\s*(?:\d{4})/i);
    if (sscWithYear) {
      let sscTag = sscWithYear[0].trim();
      sscTag = sscTag.replace(/\(10\+2\)/i, 'CHSL');
      return sscTag;
    }
    const sscExamOnly = tag.match(/SSC\s*(?:\(10\+2\)|CGL|CHSL|CPO|MTS)/i);
    if (sscExamOnly) {
      let sscTag = sscExamOnly[0].trim().replace(/\(10\+2\)/i, 'CHSL');
      return sscTag;
    }
    return 'SSC Exam PYQ';
  }

  // Non-SSC exam (NDA, CDS, BPSC, WBCS, RRB, Standard Conceptual, etc.) -> Standard SSC Tag
  return 'SSC Exam PYQ';
}

function cleanExplanationText(exp) {
  if (!exp) return '';
  let res = exp;

  // Header replacement
  res = res.replace(/🎯\s*\*\*High-Yield\s+Exam\s+Takeaway:\*\*/gi, '🎯 **Key Takeaways:**');
  res = res.replace(/🎯\s*\*\*High-Yield\s+Takeaway:\*\*/gi, '🎯 **Key Takeaways:**');
  res = res.replace(/🎯\s*\*\*High-Yield\s+Points:\*\*/gi, '🎯 **Key Points:**');

  // Any inline high-yield / High-yield
  res = res.replace(/\bhigh-yield\b/gi, 'key');
  res = res.replace(/\bhigh yield\b/gi, 'key');

  return res.trim();
}

async function main() {
  const jsonPath = path.join(__dirname, 'physics_questions_clean.json');
  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${questions.length} questions from ${jsonPath}`);

  questions.forEach(q => {
    q.exam_tag = cleanExamTag(q.exam_tag);
    const m = q.exam_tag.match(/\b(19\d{2}|20\d{2})\b/);
    q.year_reference = m ? parseInt(m[1], 10) : null;
    q.explanation = cleanExplanationText(q.explanation);
  });

  fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Updated clean JSON with SSC-only tags and no high-yield labels.`);

  // Fetch all existing question IDs for topic_id 6 from Supabase
  console.log('Fetching all existing question IDs for topic_id 6 from Supabase...');
  let allDbRows = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, exam_tag, year_reference, explanation')
      .eq('topic_id', 6)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allDbRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log(`Found ${allDbRows.length} questions in DB.`);

  // Update in parallel batches of 25 for maximum speed
  const BATCH_SIZE = 25;
  let updatedTotal = 0;

  for (let i = 0; i < allDbRows.length; i += BATCH_SIZE) {
    const chunkDb = allDbRows.slice(i, i + BATCH_SIZE);
    const chunkJson = questions.slice(i, i + BATCH_SIZE);

    const promises = chunkDb.map((dbRow, idx) => {
      const q = chunkJson[idx];
      return supabase
        .from('questions')
        .update({
          exam_tag: q.exam_tag,
          year_reference: q.year_reference,
          explanation: q.explanation
        })
        .eq('id', dbRow.id);
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.error) {
        console.error('Error during update:', r.error);
        process.exit(1);
      }
    }

    updatedTotal += chunkDb.length;
    console.log(`Updated ${updatedTotal}/${allDbRows.length} rows...`);
  }

  console.log(`\n🎉 Successfully updated all ${updatedTotal} rows in Supabase!`);

  // Verify non-SSC exam tags in DB
  const { data: nonSscCheck } = await supabase
    .from('questions')
    .select('exam_tag')
    .eq('topic_id', 6)
    .not('exam_tag', 'ilike', '%SSC%');

  console.log(`Non-SSC exam tags in DB: ${nonSscCheck ? nonSscCheck.length : 0} (Expected: 0)`);

  const { count: hyCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 6)
    .or('explanation.ilike.%high-yield%,exam_tag.ilike.%high-yield%');

  console.log(`Remaining 'high-yield' in DB: ${hyCount} (Expected: 0)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
