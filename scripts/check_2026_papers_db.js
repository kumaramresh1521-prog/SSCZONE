const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
});

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data: papers, error } = await sb
    .from('previous_papers')
    .select('id, title, year, exam_id')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total papers in DB: ${papers.length}`);
  const y2026 = papers.filter(p => p.year === 2026 || p.title.includes('2026'));
  console.log(`2026 papers in DB: ${y2026.length}`);
  y2026.forEach(p => console.log(`ID: ${p.id} | Year: ${p.year} | Title: ${p.title}`));
}

main().catch(console.error);
