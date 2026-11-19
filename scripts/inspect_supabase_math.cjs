const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function inspectAll() {
  const { data: rows, error } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation')
    .eq('topic_id', 182)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    process.exit(1);
  }

  console.log(`Fetched ${rows.length} rows.`);

  const flagged = [];

  rows.forEach((r, idx) => {
    const qNum = idx + 1;
    const allText = `${r.question_text} ${r.option_a} ${r.option_b} ${r.option_c} ${r.option_d} ${r.explanation}`;
    const issues = [];

    // 1. Pi check
    if (/\bThe number p is\b/i.test(r.question_text) || /\bClearly, p is an irrational\b/i.test(r.explanation)) {
      issues.push('pi_as_p');
    }

    // 2. Square root check
    if (/^\s*2 is a\/an/i.test(r.question_text) || /^\s*The number 3 is/i.test(r.question_text) || /\b437 > 20\b/.test(r.explanation) || /y = 2\b/.test(r.explanation) && /irrational/i.test(r.explanation)) {
      issues.push('missing_sqrt');
    }

    // 3. Mangled fraction formulas
    if (/×\s*×/.test(r.question_text) || /×\s*×/.test(r.explanation)) {
      issues.push('mangled_fractions');
    }

    // 4. Flattened powers
    if (/232\s*\+\s*1/.test(allText)) issues.push('2^32_as_232');
    if (/34n\s*–\s*43n/.test(allText) || /34n\s*-\s*43n/.test(allText)) issues.push('3^4n_as_34n');
    if (/10n\s*–\s*1/.test(allText) || /10n\s*-\s*1/.test(allText)) issues.push('10^n_as_10n');
    if (/6n\s*–\s*1/.test(allText) || /6n\s*-\s*1/.test(allText)) issues.push('6^n_as_6n');
    if (/1012\s*\+\s*25/.test(allText) || /1012\s*-\s*25/.test(allText)) issues.push('10^12_as_1012');
    if (/10025\s*–\s*25/.test(allText) || /10025\s*-\s*25/.test(allText)) issues.push('100^25_as_10025');
    if (/5n\s*\+\s*6m/.test(allText)) issues.push('5^n+6^m_as_5n+6m');
    if (/553\s*\+\s*173\s*–\s*723/.test(allText)) issues.push('55^3+17^3-72^3');
    if (/n65\s*–\s*n/.test(allText)) issues.push('n^65_as_n65');
    if (/6n2\s*\+\s*6n/.test(allText)) issues.push('6n^2_as_6n2');
    if (/\bn2\b/.test(allText) || /\ba2\b/.test(allText) || /\bb2\b/.test(allText) || /\bc2\b/.test(allText) || /\bx2\b/.test(allText) || /\by2\b/.test(allText)) {
      issues.push('variable_power_2');
    }
    if (/\bn3\b/.test(allText) || /\ba3\b/.test(allText) || /\bb3\b/.test(allText) || /\bc3\b/.test(allText) || /\bx3\b/.test(allText) || /\by3\b/.test(allText)) {
      issues.push('variable_power_3');
    }

    if (issues.length > 0) {
      flagged.push({ id: r.id, qNum, issues, question_text: r.question_text });
    }
  });

  console.log(`Found ${flagged.length} questions with potential math issues:`);
  flagged.forEach(f => {
    console.log(`Q#${f.qNum} (ID: ${f.id}): [${f.issues.join(', ')}] -> ${f.question_text.substring(0, 60)}...`);
  });
}

inspectAll().catch(console.error);
