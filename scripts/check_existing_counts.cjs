const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function check() {
  const { count: nsCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 182);

  const { count: algCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', 201);

  console.log(`Topic 182 (Number System) existing questions: ${nsCount}`);
  console.log(`Topic 201 (Algebra) existing questions: ${algCount}`);

  // Check sibling topics too
  const { count: nsChsl } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', 267);
  const { count: nsCpo } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', 350);
  console.log(`Sibling Topic 267 (CHSL Number System): ${nsChsl}`);
  console.log(`Sibling Topic 350 (CPO Number System): ${nsCpo}`);

  const { count: algChsl } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', 286);
  const { count: algCpo } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', 369);
  console.log(`Sibling Topic 286 (CHSL Algebra): ${algChsl}`);
  console.log(`Sibling Topic 369 (CPO Algebra): ${algCpo}`);
}

check();
