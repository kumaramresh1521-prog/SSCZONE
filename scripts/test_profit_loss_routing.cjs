const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function testRouting(slugCandidate) {
  console.log(`\nTesting route resolution for: /practice/${slugCandidate}`);
  const isNumeric = /^\d+$/.test(slugCandidate);
  if (isNumeric) {
    const { data } = await supabase.from('topics').select('id, title, slug').eq('id', slugCandidate).maybeSingle();
    console.log('Resolved numeric:', data);
    return;
  }

  let { data: topic } = await supabase.from('topics').select('id, title, slug').eq('slug', slugCandidate).maybeSingle();
  if (topic) {
    console.log('Direct slug match:', topic);
    return;
  }

  // Fallback 1: stripped number
  if (/-\d+(-\d+)*$/.test(slugCandidate)) {
    const strippedSlug = slugCandidate.replace(/-\d+(-\d+)*$/, "");
    const { data: fallbackTopic } = await supabase.from('topics').select('id, title, slug').eq('slug', strippedSlug).maybeSingle();
    if (fallbackTopic) {
      console.log('Fallback 1 matched:', fallbackTopic);
      return;
    }
  }

  // Fallback 2: generic slug
  const cleanTitle = slugCandidate.replace(/-/g, " ");
  const { data: fallbackTopic } = await supabase
    .from('topics')
    .select('id, title, slug')
    .or(`slug.eq.ssc-cgl-${slugCandidate},slug.ilike.%-${slugCandidate},title.ilike.${cleanTitle}`)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallbackTopic) {
    console.log('Fallback 2 matched:', fallbackTopic);
  } else {
    console.log('NOT FOUND');
  }
}

async function run() {
  await testRouting('ssc-cgl-profit-and-loss');
  await testRouting('profit-and-loss');
  await testRouting('ssc-chsl-profit-and-loss');
  await testRouting('ssc-cpo-profit-and-loss');
  await testRouting('profit-loss');
}

run();
