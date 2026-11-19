const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function checkPapers() {
  const { data: papers, error } = await supabase
    .from('previous_papers')
    .select('id, title, year, test_type, exam_id')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total papers: ${papers.length}`);
  console.log('Sample papers:');
  papers.slice(0, 10).forEach(p => console.log(`ID ${p.id}: "${p.title}" (year: ${p.year})`));
}

checkPapers().catch(console.error);
