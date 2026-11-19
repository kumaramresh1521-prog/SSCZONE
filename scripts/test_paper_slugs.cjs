const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function generatePaperSlug(title, year) {
  if (!title) return `paper-${year || 2025}`;

  let s = title.toLowerCase();

  // Normalize common phrases
  s = s.replace(/tier[- ]?i\b/g, 'tier-1');
  s = s.replace(/tier[- ]?ii\b/g, 'tier-2');
  s = s.replace(/\(held on\s+/g, '');
  s = s.replace(/\bheld on\s+/g, '');
  s = s.replace(/[\(\)]/g, ' ');
  s = s.replace(/\bshift\s*(\d+)/g, 'shift-$1');
  s = s.replace(/\bsept\b/g, 'september');
  s = s.replace(/\baug\b/g, 'august');
  s = s.replace(/\boct\b/g, 'october');
  s = s.replace(/\bnov\b/g, 'november');
  s = s.replace(/\bdec\b/g, 'december');
  s = s.replace(/\bjan\b/g, 'january');
  s = s.replace(/\bfeb\b/g, 'february');
  s = s.replace(/\bmar\b/g, 'march');
  s = s.replace(/\bapr\b/g, 'april');

  // Slugify
  let slug = s
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

async function testPaperSlugs() {
  const { data: papers, error } = await supabase
    .from('previous_papers')
    .select('id, title, year')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const slugMap = new Map();
  const duplicates = [];

  papers.forEach(p => {
    let slug = generatePaperSlug(p.title, p.year);
    if (slugMap.has(slug)) {
      duplicates.push({ slug, current: p, existing: slugMap.get(slug) });
    } else {
      slugMap.set(slug, p);
    }
  });

  console.log(`Total papers: ${papers.length}`);
  console.log(`Unique generated slugs: ${slugMap.size}`);
  console.log(`Duplicates: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('Duplicates found:', duplicates);
  }

  console.log('\nSample generated paper slugs:');
  papers.slice(0, 15).forEach(p => {
    console.log(`ID ${p.id} -> "${generatePaperSlug(p.title, p.year)}"`);
  });
}

testPaperSlugs().catch(console.error);
