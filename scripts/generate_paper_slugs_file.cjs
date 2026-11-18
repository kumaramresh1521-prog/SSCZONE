const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function slugifyTitle(title, year) {
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

  let slug = s
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

async function main() {
  const { data: papers, error } = await supabase
    .from('previous_papers')
    .select('id, title, year, total_questions, duration_minutes')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const idToSlug = {};
  const slugToId = {};

  papers.forEach(p => {
    const slug = slugifyTitle(p.title, p.year);
    idToSlug[p.id] = slug;
    slugToId[slug] = p.id;
  });

  const content = `// Auto-generated SEO Paper Slugs Mapping for SSCZone
// Provides high-performance, collision-free bidirectional lookup between numeric paper IDs and readable SEO slugs.

export function slugifyPaperTitle(title: string, year?: number | string): string {
  if (!title) return \`paper-\${year || 2025}\`;

  let s = title.toLowerCase();

  s = s.replace(/tier[- ]?i\\b/g, 'tier-1');
  s = s.replace(/tier[- ]?ii\\b/g, 'tier-2');
  s = s.replace(/\\(held on\\s+/g, '');
  s = s.replace(/\\bheld on\\s+/g, '');
  s = s.replace(/[\\(\\)]/g, ' ');
  s = s.replace(/\\bshift\\s*(\\d+)/g, 'shift-$1');
  s = s.replace(/\\bsept\\b/g, 'september');
  s = s.replace(/\\baug\\b/g, 'august');
  s = s.replace(/\\boct\\b/g, 'october');
  s = s.replace(/\\bnov\\b/g, 'november');
  s = s.replace(/\\bdec\\b/g, 'december');
  s = s.replace(/\\bjan\\b/g, 'january');
  s = s.replace(/\\bfeb\\b/g, 'february');
  s = s.replace(/\\bmar\\b/g, 'march');
  s = s.replace(/\\bapr\\b/g, 'april');

  return s
    .replace(/[^\\w\\s-]/g, '')
    .trim()
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PAPER_ID_TO_SLUG: Record<number, string> = ${JSON.stringify(idToSlug, null, 2)};

export const PAPER_SLUG_TO_ID: Record<string, number> = ${JSON.stringify(slugToId, null, 2)};

/**
 * Returns the canonical SEO slug for a paper.
 * Falls back to dynamic slugify if not in static pre-compiled map.
 */
export function getPaperSlug(paper: { id: number; title?: string; year?: number | string }): string {
  if (!paper) return '';
  if (PAPER_ID_TO_SLUG[paper.id]) {
    return PAPER_ID_TO_SLUG[paper.id];
  }
  if (paper.title) {
    return slugifyPaperTitle(paper.title, paper.year);
  }
  return String(paper.id);
}

/**
 * Resolves a paper identifier (which can be either a numeric ID like '58' or an SEO slug like 'ssc-cgl-2024-tier-1-18-september-2024-shift-3').
 * Returns the resolved numeric paper ID.
 */
export function resolvePaperId(param: string | number): number | null {
  if (!param) return null;
  const str = String(param).trim();

  // If purely numeric, return integer
  if (/^\\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Check slug dictionary
  if (PAPER_SLUG_TO_ID[str]) {
    return PAPER_SLUG_TO_ID[str];
  }

  // Partial match or suffix match
  const lower = str.toLowerCase();
  for (const [slug, id] of Object.entries(PAPER_SLUG_TO_ID)) {
    if (slug === lower || slug.endsWith(lower) || lower.endsWith(slug)) {
      return id;
    }
  }

  return null;
}
`;

  const targetPath = path.join(process.cwd(), 'src', 'lib', 'paper-slugs.ts');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Generated ${targetPath} with ${Object.keys(idToSlug).length} paper slugs.`);
}

main().catch(console.error);
