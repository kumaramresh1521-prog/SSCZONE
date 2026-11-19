const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function checkMathTopics() {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(title, exams(title))')
    .ilike('subjects.title', '%math%')
    .order('id', { ascending: true });

  for (const t of (topics || []).slice(0, 25)) {
    const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', t.id);
    console.log(`Topic ${t.id} (${t.subjects?.exams?.title}) "${t.title}": ${count} Qs (Slug: ${t.slug})`);
  }
}

checkMathTopics().catch(console.error);
