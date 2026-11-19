const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function checkTopicSlugs() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, is_active')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total topics: ${topics.length}`);
  const withoutSlug = topics.filter(t => !t.slug);
  console.log(`Topics without slug: ${withoutSlug.length}`);
  if (withoutSlug.length > 0) {
    console.log('Sample topics without slug:', withoutSlug.slice(0, 5));
  }

  const topic182 = topics.find(t => t.id === 182);
  console.log('Topic 182:', topic182);

  // Check some samples with slug
  console.log('Sample topics with slug:', topics.filter(t => t.slug).slice(0, 5));
}

checkTopicSlugs().catch(console.error);
