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

async function prepareAllTopicSlugs() {
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, title, slug, subject_id, subjects(id, title, exam_id, exams(id, title, slug))')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
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

    // If still taken (e.g. duplicate topics in same subject like Minerals & Energy Resources 173, 348, 349)
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
      title: t.title,
      oldSlug: t.slug,
      newSlug
    });
  }

  console.log(`Total topics: ${topics.length}`);
  console.log(`Unique slugs generated: ${slugToTopic.size}`);
  
  const hasRandomDigits = updates.filter(u => /-\d{3,}/.test(u.newSlug));
  console.log(`Slugs with random 3+ digits: ${hasRandomDigits.length}`);

  console.log('\nVerified Key Topic Slugs:');
  const keyIds = [182, 267, 350, 2, 102, 432, 29, 30, 31, 52];
  updates.filter(u => keyIds.includes(u.id)).forEach(u => {
    console.log(`ID ${u.id} (${u.title}): "${u.oldSlug}" -> "${u.newSlug}"`);
  });

  return updates;
}

prepareAllTopicSlugs().catch(console.error);
