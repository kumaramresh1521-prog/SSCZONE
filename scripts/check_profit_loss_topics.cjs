const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function run() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(title, exams(title, slug))')
    .or('title.ilike.%profit%,title.ilike.%discount%,title.ilike.%loss%');
    
  if (error) {
    console.error('Error fetching topics:', error);
    return;
  }
  
  console.log(`Found ${topics.length} Profit/Loss/Discount topics:`);
  for (const t of topics) {
    const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', t.id);
    const examTitle = t.subjects?.exams?.title || 'Unknown Exam';
    const subTitle = t.subjects?.title || 'Unknown Subject';
    console.log(`- Topic ID: ${t.id} | Slug: ${t.slug} | Title: "${t.title}" | Exam: ${examTitle} | Subject: ${subTitle} | Existing Qs: ${count}`);
  }
}

run();
