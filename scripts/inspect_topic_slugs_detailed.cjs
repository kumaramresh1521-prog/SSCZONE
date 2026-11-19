const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function inspectTopicSlugs() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const numberSuffixSlugs = topics.filter(t => /-\d+(-\d+)*$/.test(t.slug));
  console.log(`Total topics: ${topics.length}`);
  console.log(`Topics with number suffixes at the end of their slug: ${numberSuffixSlugs.length}`);
  
  console.log('Sample topics with number suffixes:');
  numberSuffixSlugs.slice(0, 20).forEach(t => {
    console.log(`ID ${t.id}: title="${t.title}" -> slug="${t.slug}"`);
  });
}

inspectTopicSlugs().catch(console.error);
