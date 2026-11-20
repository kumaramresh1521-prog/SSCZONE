const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function cleanExplanationText(res) {
  if (!res) return '';

  // 1. Remove the entire "⚠️ **Errata & Key Verification Note:**" block
  res = res.replace(/⚠️\s*\*\*Errata\s*&\s*Key\s*Verification\s*Note:\*\*\s*\n[\s\S]*?(?=\n\n(?:🎯|✅|📝|💡|$))/g, '');

  // 2. Remove parenthetical errata / book key references
  let idx = 0;
  while ((idx = res.search(/\([Nn]ote:[^)]*?(?:[Bb]ook\s*key|[Ss]ource\s*(?:key|table|PDF)|[Pp]rinted\s*key|[Mm]isprinted?|Arihant\s*key)/)) !== -1) {
    let depth = 0, endIdx = -1;
    for (let i = idx; i < res.length; i++) {
      if (res[i] === '(') depth++;
      else if (res[i] === ')') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      res = res.substring(0, idx).trimEnd() + res.substring(endIdx + 1);
    } else {
      break;
    }
  }

  // 3. Clean any stray dangling double periods or punctuation left before the bracket
  res = res.replace(/\.\s*\./g, '.');
  return res.replace(/\n{3,}/g, '\n\n').trim();
}

async function main() {
  const jsonPath = path.join(__dirname, 'physics_questions_clean.json');
  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${questions.length} questions from ${jsonPath}`);

  let cleanedCount = 0;
  questions.forEach(q => {
    const orig = q.explanation;
    const cleaned = cleanExplanationText(orig);
    if (cleaned !== orig) {
      cleanedCount++;
      q.explanation = cleaned;
    }
  });

  console.log(`Cleaned ${cleanedCount} questions.`);
  fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Updated ${jsonPath}`);

  // Fetch all existing question IDs in topic_id 6 ordered by id ascending
  console.log('Fetching all existing question IDs for topic_id 6 from Supabase...');
  let allDbRows = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, explanation')
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
  if (allDbRows.length !== questions.length) {
    console.error(`Mismatch in counts! DB has ${allDbRows.length}, JSON has ${questions.length}`);
    process.exit(1);
  }

  console.log('Updating DB rows with clean explanations...');
  let updatedCount = 0;

  for (let i = 0; i < allDbRows.length; i++) {
    const dbRow = allDbRows[i];
    const cleanQ = questions[i];

    if (dbRow.explanation !== cleanQ.explanation) {
      const { error: updErr } = await supabase
        .from('questions')
        .update({ explanation: cleanQ.explanation })
        .eq('id', dbRow.id);

      if (updErr) {
        console.error(`Error updating ID ${dbRow.id}:`, updErr);
        process.exit(1);
      }
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} rows in Supabase!`);

  // Verify that 0 rows have 'Errata' in explanation
  const { count: errataCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 6)
    .ilike('explanation', '%Errata%');

  console.log(`Verified DB count with 'Errata' in topic_id 6: ${errataCount} (Expected: 0)`);

  const { count: bookKeyCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 6)
    .ilike('explanation', '%Book key%');

  console.log(`Verified DB count with 'Book key' in topic_id 6: ${bookKeyCount} (Expected: 0)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
