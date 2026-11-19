const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

// Simulate the logic from src/app/practice/[topicId]/page.tsx
async function getQuestionsForTopic(topicId) {
  const { data: topic } = await supabase.from('topics').select('id, title, slug').eq('id', topicId).single();

  // 1. Direct fetch
  const { data: directQs } = await supabase.from('questions').select('id').eq('topic_id', topic.id).eq('is_active', true);
  if (directQs && directQs.length > 0) {
    return { topic, count: directQs.length, mode: 'direct' };
  }

  // 2. Auto-sync fallback
  const { data: siblingTopics } = await supabase.from('topics').select('id').ilike('title', topic.title.trim());
  if (siblingTopics && siblingTopics.length > 0) {
    const siblingIds = siblingTopics.map(t => t.id);
    const { data: sharedQs } = await supabase.from('questions').select('id').in('topic_id', siblingIds).eq('is_active', true);
    return { topic, count: sharedQs ? sharedQs.length : 0, mode: 'auto-sync' };
  }

  return { topic, count: 0, mode: 'none' };
}

async function verifyAll() {
  const testIds = [
    { name: 'Number System (CGL Master)', id: 182 },
    { name: 'Number System (CHSL Sibling)', id: 267 },
    { name: 'Number System (CPO Sibling)', id: 350 },
    { name: 'Algebra (CGL Master)', id: 201 },
    { name: 'Algebra (CHSL Sibling)', id: 286 },
    { name: 'Algebra (CPO Sibling)', id: 369 },
  ];

  console.log('=== SYNC & VISIBILITY VERIFICATION ===');
  for (const t of testIds) {
    const res = await getQuestionsForTopic(t.id);
    console.log(`[${t.name}] ID ${t.id} (${res.topic.slug}): ${res.count} questions accessible via ${res.mode}`);
  }
}

verifyAll();
