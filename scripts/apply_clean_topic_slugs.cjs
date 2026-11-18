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

async function applyCleanTopicSlugs() {
  console.log('Fetching all topics...');
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(id, title, exam_id, exams(id, title, slug))')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching topics:', error);
    process.exit(1);
  }

  // Count base titles
  const titleCount = new Map();
  topics.forEach(t => {
    const base = slugify(t.title);
    titleCount.set(base, (titleCount.get(base) || 0) + 1);
  });

  const slugToTopic = new Map();
  const updates = [];

  for (const t of topics) {
    const base = slugify(t.title);
    const examSlug = t.subjects?.exams?.slug || '';
    const subjectTitle = t.subjects?.title || '';
    let newSlug = base;

    // Special priority for primary topic 182 (Number System with 380 questions)
    if (t.id === 182) {
      newSlug = 'number-system';
    } else if (titleCount.get(base) > 1 && examSlug) {
      newSlug = `${examSlug}-${base}`;
    }

    // If still taken, append subject keyword
    if (slugToTopic.has(newSlug)) {
      const subjWord = slugify(subjectTitle);
      if (subjWord && !newSlug.includes(subjWord)) {
        newSlug = `${newSlug}-${subjWord}`;
      }
    }

    // If still taken, append part-counter
    if (slugToTopic.has(newSlug)) {
      let counter = 2;
      while (slugToTopic.has(`${newSlug}-part-${counter}`)) {
        counter++;
      }
      newSlug = `${newSlug}-part-${counter}`;
    }

    slugToTopic.set(newSlug, t);
    updates.push({
      id: t.id,
      slug: newSlug
    });
  }

  console.log(`Prepared ${updates.length} topic slug updates. Applying to database in batches...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const slice = updates.slice(i, i + BATCH_SIZE);
    for (const item of slice) {
      const { error: updateErr } = await supabase
        .from('topics')
        .update({ slug: item.slug })
        .eq('id', item.id);

      if (updateErr) {
        console.error(`Error updating topic ${item.id}:`, updateErr);
      }
    }
    console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)}] Updated ${slice.length} topic slugs.`);
  }

  console.log('--- ALL TOPIC SLUGS UPDATED SUCCESSFULLY ---');

  // Verify Topic 182
  const { data: verified182 } = await supabase.from('topics').select('id, title, slug').eq('id', 182).single();
  console.log('Verified Topic 182:', verified182);
}

applyCleanTopicSlugs().catch(console.error);
