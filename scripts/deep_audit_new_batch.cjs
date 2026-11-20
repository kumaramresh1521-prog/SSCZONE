const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'physics_new_batch_clean.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`Auditing ${questions.length} questions from ${filePath}...`);

let errors = 0;
const validLetters = new Set(['A', 'B', 'C', 'D']);
const nonSscTags = [];
let highYieldCount = 0;
let errataCount = 0;
let keyMismatchCount = 0;
let optionMismatchCount = 0;

questions.forEach((q, idx) => {
  // 1. Check basic fields
  if (!q.question_text || q.question_text.trim().length === 0) {
    console.error(`Q#${idx}: Empty question text`);
    errors++;
  }
  if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
    console.error(`Q#${idx}: Empty option found`);
    errors++;
  }
  if (!validLetters.has(q.correct_answer)) {
    console.error(`Q#${idx}: Invalid correct_answer '${q.correct_answer}'`);
    errors++;
  }
  if (q.topic_id !== 6) {
    console.error(`Q#${idx}: Invalid topic_id ${q.topic_id}`);
    errors++;
  }

  // 2. Check exam tags - strictly SSC
  if (!q.exam_tag.toUpperCase().includes('SSC')) {
    nonSscTags.push({ idx, tag: q.exam_tag });
    errors++;
  }

  // 3. Check for high-yield
  const fullJson = JSON.stringify(q);
  if (/high[- ]?yield/i.test(fullJson)) {
    console.error(`Q#${idx}: Contains 'high-yield'`);
    highYieldCount++;
    errors++;
  }

  // 4. Check for errata
  if (/errata/i.test(fullJson)) {
    console.error(`Q#${idx}: Contains 'errata'`);
    errataCount++;
    errors++;
  }

  // 5. Check key matching in explanation
  const m = q.explanation.match(/✅ \*\*Correct Answer:\*\* Option \(([A-D])\)\s*(.*)$/m);
  if (!m) {
    console.error(`Q#${idx}: Missing Correct Answer line in explanation`);
    keyMismatchCount++;
    errors++;
  } else {
    const explLetter = m[1];
    const explOptText = m[2].trim();
    if (explLetter !== q.correct_answer) {
      console.error(`Q#${idx}: Key mismatch! Field is ${q.correct_answer}, but explanation says ${explLetter}`);
      keyMismatchCount++;
      errors++;
    }
    const fieldOptText = q[`option_${q.correct_answer.toLowerCase()}`].trim();
    if (explOptText !== fieldOptText) {
      console.error(`Q#${idx}: Option text mismatch! Field has "${fieldOptText}", but explanation has "${explOptText}"`);
      optionMismatchCount++;
      errors++;
    }
  }
});

console.log('--- Audit Results ---');
console.log(`Total questions audited: ${questions.length}`);
console.log(`Non-SSC tags: ${nonSscTags.length}`);
console.log(`'high-yield' occurrences: ${highYieldCount}`);
console.log(`'errata' occurrences: ${errataCount}`);
console.log(`Key mismatches: ${keyMismatchCount}`);
console.log(`Option text mismatches: ${optionMismatchCount}`);
console.log(`Total errors: ${errors}`);

if (errors === 0) {
  console.log('SUCCESS: All 734 questions passed the strict quality audit with 100% compliance!');
} else {
  console.error('FAILURE: Audit found errors that must be resolved before ingestion.');
  process.exit(1);
}
