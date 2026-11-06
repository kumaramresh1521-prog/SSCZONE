const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^\r\n"]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^\r\n"]+)/);
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(urlMatch[1], keyMatch[1]);

async function main() {
  const { data: exams } = await sb.from('exams').select('id, title');
  console.log('EXAMS:', exams);
  const { data: papers } = await sb.from('previous_papers').select('id, title, year, exam_id').order('id', { ascending: true });
  console.log('TOTAL PAPERS IN DB:', papers?.length);
  if (papers && papers.length > 0) {
    console.log('FIRST 3 PAPERS:', papers.slice(0, 3));
    console.log('LAST 3 PAPERS:', papers.slice(-3));
  }
}
main();
