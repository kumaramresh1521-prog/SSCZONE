const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function check() {
  console.log('--- Checking Number System Topics ---');
  const { data: nsTopics, error: nsErr } = await supabase
    .from('topics')
    .select('id, subject_id, slug, title')
    .ilike('title', '%number%system%');

  if (nsErr) console.error(nsErr);
  else console.log(JSON.stringify(nsTopics, null, 2));

  console.log('--- Checking Algebra Topics ---');
  const { data: algTopics, error: algErr } = await supabase
    .from('topics')
    .select('id, subject_id, slug, title')
    .ilike('title', '%algebra%');

  if (algErr) console.error(algErr);
  else console.log(JSON.stringify(algTopics, null, 2));

  // Also check subject names
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('id, name, slug, exam_id');
  if (subjErr) console.error(subjErr);
  else {
    const sMap = {};
    subjects.forEach(s => sMap[s.id] = s);
    console.log('--- Subjects Map ---');
    console.log(JSON.stringify(sMap, null, 2));
  }
}

check();
