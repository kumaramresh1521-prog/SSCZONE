const { createClient } = require('@supabase/supabase-js');
const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function run() {
  const pageSize = 1000;
  let offset = 0;
  const topicCounts = {};
  let totalFetched = 0;

  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('topic_id')
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    data.forEach(r => {
      topicCounts[r.topic_id] = (topicCounts[r.topic_id] || 0) + 1;
    });

    totalFetched += data.length;
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`Fetched ${totalFetched} total rows.`);
  console.log('Topic ID distribution:', topicCounts);

  // Fetch topic details for these IDs
  const topicIds = Object.keys(topicCounts).map(Number);
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, slug')
    .in('id', topicIds);

  console.log('Active Topics in Questions table:');
  topics.forEach(t => {
    console.log(`- ID: ${t.id} | Slug: ${t.slug} | Title: "${t.title}" | Count: ${topicCounts[t.id]}`);
  });
}

run();
