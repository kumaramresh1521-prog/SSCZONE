const fs = require('fs');

async function testApi() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^\r\n"]+)/);
  const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^\r\n"]+)/);
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(urlMatch[1], keyMatch[1]);

  console.log('Testing Supabase direct connection...');
  const { data: exams, error: exErr } = await sb.from('exams').select('id, title');
  if (exErr) {
    console.error('Error fetching exams:', exErr);
  } else {
    console.log(`Successfully fetched ${exams.length} exams from Supabase!`);
  }

  const { data: papers, error: pErr } = await sb.from('previous_papers').select('id, title').limit(3);
  if (pErr) {
    console.error('Error fetching papers:', pErr);
  } else {
    console.log(`Successfully fetched ${papers.length} sample papers from Supabase!`);
  }

  const { data: questions, error: qErr } = await sb.from('paper_questions').select('id, question_number').limit(3);
  if (qErr) {
    console.error('Error fetching questions:', qErr);
  } else {
    console.log(`Successfully fetched ${questions.length} sample questions from Supabase!`);
  }
}
testApi();
