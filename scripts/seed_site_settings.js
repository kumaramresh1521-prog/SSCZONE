const fs = require('fs');
const path = require('path');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.substring(0, idx).trim();
    const v = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const MAPPINGS = [
  { key: 'homepage_config', file: 'homepage-config.json' },
  { key: 'navigation_config', file: 'navigation_config.json' },
  { key: 'footer_config', file: 'footer-config.json' },
  { key: 'announcement_config', file: 'announcement-config.json' },
  { key: 'ads_config', file: 'ads-config.json' },
  { key: 'seo_config', file: 'seo-config.json' },
  { key: 'session_gate_config', file: 'session_gate_config.json' },
  { key: 'testimonials_config', file: 'testimonials.json' },
  { key: 'books_config', file: 'books.json' },
  { key: 'typing_passages', file: 'typing_passages.json' },
  { key: 'daily_quizzes', file: 'daily_quizzes.json' },
  { key: 'subject_notes', file: 'subject_notes.json' },
  { key: 'blog_categories', file: 'blog_categories.json' },
  { key: 'paper_settings', file: 'paper_settings.json' },
  { key: 'chapter_notes', file: 'chapter_notes.json' }
];

async function main() {
  console.log('--- Starting Migration of Local JSON to Supabase site_settings ---');
  for (const item of MAPPINGS) {
    const filePath = path.join(__dirname, '..', 'src', 'data', item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] File not found: ${item.file}`);
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const val = JSON.parse(raw);
      
      // Check if already in Supabase
      const { data: existing } = await supabase
        .from('site_settings')
        .select('key')
        .eq('key', item.key)
        .maybeSingle();

      if (existing) {
        console.log(`[EXISTS] ${item.key} already in Supabase, keeping existing.`);
        continue;
      }

      const { error } = await supabase.from('site_settings').upsert({
        key: item.key,
        value: val,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

      if (error) {
        console.error(`[ERROR] Failed to seed ${item.key}:`, error.message);
      } else {
        console.log(`[SUCCESS] Seeded ${item.key} from ${item.file}`);
      }
    } catch (e) {
      console.error(`[EXCEPTION] ${item.key}:`, e.message);
    }
  }
  console.log('--- Migration Finished ---');
}

main().catch(console.error);
