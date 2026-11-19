const fs = require('fs');

const ns = JSON.parse(fs.readFileSync('scripts/number_system_questions_clean.json', 'utf8'));
const alg = JSON.parse(fs.readFileSync('scripts/algebra_questions_clean.json', 'utf8'));

console.log('=== DEEP AUDIT: NUMBER SYSTEM (275 Questions) ===');
let nsErrors = 0;
ns.forEach((q, idx) => {
  // Check options
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
  const uniqueOpts = new Set(opts);
  if (uniqueOpts.size < 4) {
    console.warn(`[NS Q${idx + 1}] Duplicate options:`, opts);
  }

  // Check correct option exists
  const correctOpt = q[`option_${q.correct_answer.toLowerCase()}`];
  if (!correctOpt) {
    console.error(`[NS Q${idx + 1}] Missing correct option text for ${q.correct_answer}`);
    nsErrors++;
  }

  // Check LaTeX / Dollar balance in stem
  const stemDollars = (q.question_text.match(/\$/g) || []).length;
  if (stemDollars % 2 !== 0) {
    console.warn(`[NS Q${idx + 1}] Unbalanced $ in question text:`, q.question_text);
  }

  // Check explanation structure
  if (!q.explanation.includes('📝 **Step-by-Step Solution:**')) {
    console.warn(`[NS Q${idx + 1}] Missing Step-by-Step heading in explanation`);
  }
  if (!q.explanation.includes('✅ **Correct Answer:**')) {
    console.error(`[NS Q${idx + 1}] Missing Correct Answer heading in explanation`);
    nsErrors++;
  }
});
console.log(`Number System audit complete. Errors: ${nsErrors}`);

console.log('\n=== DEEP AUDIT: ALGEBRA (335 Questions) ===');
let algErrors = 0;
alg.forEach((q, idx) => {
  // Check options
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
  const uniqueOpts = new Set(opts);
  if (uniqueOpts.size < 4) {
    console.warn(`[ALG Q${idx + 1}] Duplicate options:`, opts);
  }

  // Check correct option exists
  const correctOpt = q[`option_${q.correct_answer.toLowerCase()}`];
  if (!correctOpt) {
    console.error(`[ALG Q${idx + 1}] Missing correct option text for ${q.correct_answer}`);
    algErrors++;
  }

  // Check LaTeX / Dollar balance in stem
  const stemDollars = (q.question_text.match(/\$/g) || []).length;
  if (stemDollars % 2 !== 0) {
    console.warn(`[ALG Q${idx + 1}] Unbalanced $ in question text:`, q.question_text);
  }

  // Check explanation structure
  if (!q.explanation.includes('📝 **Step-by-Step Solution:**')) {
    console.warn(`[ALG Q${idx + 1}] Missing Step-by-Step heading in explanation`);
  }
  if (!q.explanation.includes('✅ **Correct Answer:**')) {
    console.error(`[ALG Q${idx + 1}] Missing Correct Answer heading in explanation`);
    algErrors++;
  }
});
console.log(`Algebra audit complete. Errors: ${algErrors}`);
