const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function inspectTables() {
  console.log('--- Checking previous_papers ---');
  const { data: pSample } = await supabase.from('previous_papers').select('*').limit(2);
  if (pSample && pSample.length > 0) {
    console.log('previous_papers columns:', Object.keys(pSample[0]));
    console.log('sample row:', pSample[0]);
  }

  console.log('\n--- Checking topics ---');
  const { data: tSample } = await supabase.from('topics').select('*').limit(2);
  if (tSample && tSample.length > 0) {
    console.log('topics columns:', Object.keys(tSample[0]));
    console.log('sample row:', tSample[0]);
  }

  console.log('\n--- Checking subjects ---');
  const { data: sSample } = await supabase.from('subjects').select('*').limit(2);
  if (sSample && sSample.length > 0) {
    console.log('subjects columns:', Object.keys(sSample[0]));
    console.log('sample row:', sSample[0]);
  }

  console.log('\n--- Checking exams ---');
  const { data: eSample } = await supabase.from('exams').select('*').limit(2);
  if (eSample && eSample.length > 0) {
    console.log('exams columns:', Object.keys(eSample[0]));
    console.log('sample row:', eSample[0]);
  }
}

inspectTables().catch(console.error);
