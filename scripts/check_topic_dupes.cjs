const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function checkTopicDuplicates() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(id, title, slug, exam_id, exams(id, title, slug))')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const baseSlugMap = new Map();
  topics.forEach(t => {
    const baseSlug = slugify(t.title);
    if (!baseSlugMap.has(baseSlug)) {
      baseSlugMap.set(baseSlug, []);
    }
    baseSlugMap.get(baseSlug).push(t);
  });

  const dupes = Array.from(baseSlugMap.entries()).filter(([k, v]) => v.length > 1);
  console.log(`Total topics: ${topics.length}`);
  console.log(`Unique base slugs: ${baseSlugMap.size}`);
  console.log(`Duplicate base slug groups: ${dupes.length}`);

  console.log('Sample duplicates:');
  dupes.slice(0, 5).forEach(([slug, list]) => {
    console.log(`Slug "${slug}": ${list.length} topics:`, list.map(t => ({
      id: t.id,
      title: t.title,
      subject: t.subjects?.title,
      exam: t.subjects?.exams?.slug,
      currentSlug: t.slug
    })));
  });
}

checkTopicDuplicates().catch(console.error);
