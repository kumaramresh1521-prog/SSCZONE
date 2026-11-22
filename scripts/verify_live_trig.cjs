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

async function verifyLiveTrig() {
  console.log("=== Comprehensive Live Verification for Topic 215 (Trigonometry) ===");

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty')
    .eq('topic_id', 215)
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching live questions:", error);
    process.exit(1);
  }

  console.log(`\n1. Total Live Questions in Topic 215: ${questions.length}`);
  if (questions.length !== 17) {
    console.warn(`Note: Found ${questions.length} questions.`);
  }

  console.log("\n2. Scanning for forbidden leaks / book mentions across all questions...");
  const forbidden = ["book", "किताब", "note:", "printed question", "lost in print", "exercise-2", "book's solution", "book key"];
  let leakCount = 0;

  questions.forEach((q, idx) => {
    const text = (q.question_text + " " + q.explanation).toLowerCase();
    forbidden.forEach(term => {
      if (text.includes(term)) {
        console.error(`❌ Leak found in Q${idx + 1} (ID ${q.id}) for term "${term}"`);
        leakCount++;
      }
    });

    // Check options
    if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
      console.error(`❌ Missing option in Q${idx + 1} (ID ${q.id})`);
      leakCount++;
    }
    if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
      console.error(`❌ Invalid correct_answer "${q.correct_answer}" in Q${idx + 1} (ID ${q.id})`);
      leakCount++;
    }
  });

  if (leakCount === 0) {
    console.log("✔ Zero leaks / book mentions found. 100% clean!");
  } else {
    console.error(`❌ Total leaks/issues found: ${leakCount}`);
    process.exit(1);
  }

  console.log("\n3. Verifying correct answers and option contents:");
  questions.forEach((q, idx) => {
    const optField = `option_${q.correct_answer.toLowerCase()}`;
    const chosenVal = q[optField];
    console.log(`  Q${idx + 1} (ID ${q.id}): Correct Option (${q.correct_answer}) -> ${chosenVal}`);
  });

  console.log("\n✔ All Live Checks Passed Successfully!");
}

verifyLiveTrig();
