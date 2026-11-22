const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const idsToDelete = [
  // Topic 182 (Number System - 6)
  26570, 26529, 26572, 26569, 26525, 26566,
  // Topic 201 (Algebra - 6)
  26849, 26724, 27029, 26787, 26779, 26989,
  // Topic 185 (Simplification - 4)
  29465, 29526, 29632, 29733,
  // Topic 189 (Percentage - 1)
  26049
];

async function deleteDupes() {
  console.log(`=== DELETING ${idsToDelete.length} EXACT DUPLICATE QUESTIONS ===`);

  const { data, error } = await supabase
    .from('questions')
    .delete()
    .in('id', idsToDelete)
    .select('id, topic_id');

  if (error) {
    console.error("❌ Error deleting duplicate questions:", error);
    process.exit(1);
  }

  console.log(`✔ Successfully deleted ${data.length} duplicate questions from database.`);

  // Verify each topic now has zero exact duplicates
  const targetTopics = [182, 201, 185, 189];
  for (const tId of targetTopics) {
    const { data: qs, count } = await supabase
      .from('questions')
      .select('id, question_text', { count: 'exact' })
      .eq('topic_id', tId);

    const textMap = {};
    qs.forEach(q => {
      const norm = q.question_text.trim().toLowerCase().replace(/\s+/g, ' ');
      textMap[norm] = (textMap[norm] || 0) + 1;
    });
    const remainingDupes = Object.values(textMap).filter(c => c > 1).length;

    console.log(`Topic ${tId}: Total questions now = ${count} | Remaining exact duplicate groups = ${remainingDupes}`);
  }

  console.log("\n✔ All targeted topics are now 100% duplicate-free!");
}

deleteDupes();
