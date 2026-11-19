const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function testWithWildcard(slugCandidate) {
  const cleanTitle = slugCandidate.replace(/-/g, " ");
  const wildcardTitle = `%${cleanTitle.trim().replace(/\s+/g, "%")}%`;
  
  const { data: fallbackTopic } = await supabase
    .from('topics')
    .select('id, title, slug')
    .or(`slug.eq.ssc-cgl-${slugCandidate},slug.ilike.%-${slugCandidate},title.ilike.${cleanTitle},title.ilike.${wildcardTitle}`)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  console.log(`Testing "${slugCandidate}" ->`, fallbackTopic ? `Matched: ${fallbackTopic.slug}` : 'NOT FOUND');
}

async function run() {
  await testWithWildcard('profit-and-loss');
  await testWithWildcard('profit-loss');
  await testWithWildcard('percentage');
  await testWithWildcard('discount');
}

run();
