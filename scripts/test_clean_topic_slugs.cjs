const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function testCleanTopicSlugs() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(id, title, exam_id, exams(id, title, slug))')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  // Count how many times each base title appears
  const titleCount = new Map();
  topics.forEach(t => {
    const base = slugify(t.title);
    titleCount.set(base, (titleCount.get(base) || 0) + 1);
  });

  const generatedSlugs = new Map();
  const collisionList = [];

  const plannedUpdates = topics.map(t => {
    const base = slugify(t.title);
    const examSlug = t.subjects?.exams?.slug || '';
    let newSlug = base;

    // If duplicate across exams, prefix with examSlug
    if (titleCount.get(base) > 1 && examSlug) {
      newSlug = `${examSlug}-${base}`;
    }

    // Special priority for primary topic 182 (Number System)
    if (t.id === 182) {
      newSlug = 'number-system';
    }

    if (generatedSlugs.has(newSlug)) {
      // If still collision (e.g. same exam has 2 same topics), add subject
      const subjectSlug = slugify(t.subjects?.title || '');
      newSlug = `${newSlug}-${subjectSlug}`;
    }

    if (generatedSlugs.has(newSlug)) {
      collisionList.push({ id: t.id, title: t.title, newSlug, existing: generatedSlugs.get(newSlug) });
    } else {
      generatedSlugs.set(newSlug, t);
    }

    return {
      id: t.id,
      title: t.title,
      oldSlug: t.slug,
      newSlug
    };
  });

  console.log(`Total topics: ${topics.length}`);
  console.log(`Unique planned slugs: ${generatedSlugs.size}`);
  console.log(`Collisions: ${collisionList.length}`);
  if (collisionList.length > 0) {
    console.log('Collisions:', collisionList);
  }

  // Check if any slug ends in a number or number suffix
  const endsInNumber = plannedUpdates.filter(p => /-\d+(-\d+)*$/.test(p.newSlug));
  console.log(`Planned slugs ending in number: ${endsInNumber.length}`);
  if (endsInNumber.length > 0) {
    console.log('Sample ending in number:', endsInNumber.slice(0, 5));
  }

  console.log('\nSample planned updates:');
  plannedUpdates.slice(0, 20).forEach(p => {
    console.log(`ID ${p.id} (${p.title}): "${p.oldSlug}" -> "${p.newSlug}"`);
  });

  const t182 = plannedUpdates.find(p => p.id === 182);
  console.log('\nTopic 182 update:', t182);
}

testCleanTopicSlugs().catch(console.error);
