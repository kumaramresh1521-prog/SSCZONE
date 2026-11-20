const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'physics_questions_clean.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('Total questions:', questions.length);

function cleanExplanation(exp) {
  if (!exp) return '';

  let cleaned = exp;

  // 1. Remove the entire "⚠️ **Errata & Key Verification Note:**" block
  cleaned = cleaned.replace(/⚠️\s*\*\*Errata\s*&\s*Key\s*Verification\s*Note:\*\*\s*\n[\s\S]*?(?=\n\n(?:🎯|✅|📝|💡|$))/g, '');

  // 2. Remove parenthetical book/errata remarks inside prose
  // e.g. "(Note: The printed book key lists (c) in error; (a) is physically correct.)"
  // e.g. "(Note: Book key misprinted (d); (c) is mathematically exact.)"
  cleaned = cleaned.replace(/\s*\([Nn]ote:\s*(?:The\s*)?[Bb]ook\s*key\s*[^)]*\)/g, '');
  cleaned = cleaned.replace(/\s*\([Nn]ote:\s*Key\s*Audit\s*Note:[^)]*\)/g, '');
  cleaned = cleaned.replace(/\s*\([Nn]ote:\s*(?:The\s*)?printed\s*(?:Arihant|book)?\s*key\s*[^)]*\)/g, '');

  // 3. Clean up extra blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

let modifiedCount = 0;
const sampleCleaned = [];

questions.forEach((q, idx) => {
  const original = q.explanation;
  const cleaned = cleanExplanation(original);
  if (cleaned !== original) {
    modifiedCount++;
    if (sampleCleaned.length < 5) {
      sampleCleaned.push({
        num: idx + 1,
        tier: q.tier_level,
        before: original,
        after: cleaned
      });
    }
    q.explanation = cleaned;
  }
});

console.log(`Cleaned ${modifiedCount} explanations.`);

console.log('\n--- SAMPLE 1 ---');
console.log('BEFORE:\n', sampleCleaned[0].before);
console.log('\nAFTER:\n', sampleCleaned[0].after);

console.log('\n--- SAMPLE 2 ---');
console.log('BEFORE:\n', sampleCleaned[1].before);
console.log('\nAFTER:\n', sampleCleaned[1].after);
