const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^\r\n"]+)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^\r\n"]+)/)[1];
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function listPapers() {
  const { data: papers } = await sb
    .from('previous_papers')
    .select('id, title, year, exam_id, exams(title), paper_questions(count)')
    .order('id', { ascending: true });

  console.log(`FOUND ${papers?.length} PAPERS:`);
  papers?.forEach(p => {
    const qCount = p.paper_questions?.[0]?.count ?? 0;
    console.log(`ID: ${p.id} | Exam: ${p.exams?.title || p.exam_id} | Year: ${p.year} | Qs: ${qCount} | Title: ${p.title}`);
  });
}
listPapers();
