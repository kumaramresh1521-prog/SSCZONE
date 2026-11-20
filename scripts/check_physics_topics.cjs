const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function check() {
  console.log('--- Checking Physics in Topics ---');
  const { data: physTopics, error: physErr } = await supabase
    .from('topics')
    .select('id, subject_id, slug, title')
    .or('title.ilike.%physic%,slug.ilike.%physic%');

  if (physErr) console.error(physErr);
  else console.log('Topics matching "physic":', JSON.stringify(physTopics, null, 2));

  console.log('\n--- Checking Science / General Studies Subjects ---');
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('id, name, slug, exam_id')
    .or('name.ilike.%science%,name.ilike.%general%,slug.ilike.%science%,slug.ilike.%general%');
  if (subjErr) console.error(subjErr);
  else {
    console.log('Subjects:', JSON.stringify(subjects, null, 2));
    
    // Check all topics under these subjects
    if (subjects && subjects.length > 0) {
      const subjectIds = subjects.map(s => s.id);
      const { data: subTopics, error: stErr } = await supabase
        .from('topics')
        .select('id, subject_id, slug, title')
        .in('subject_id', subjectIds);
      if (stErr) console.error(stErr);
      else console.log('Topics under Science/General subjects:', JSON.stringify(subTopics, null, 2));
    }
  }
}

check();
