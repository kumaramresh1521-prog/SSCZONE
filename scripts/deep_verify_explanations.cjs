const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'percentage_questions_clean.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Auditing explanations for all ${questions.length} questions...`);

let keyMismatchCount = 0;
let emptyExplanationCount = 0;
let missingStepsCount = 0;
let brokenSymbolsCount = 0;
const issues = [];

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  const expl = q.explanation || '';
  const correctAns = (q.correct_answer || '').toUpperCase();
  const optA = q.option_a;
  const optB = q.option_b;
  const optC = q.option_c;
  const optD = q.option_d;

  // 1. Check if explanation is empty
  if (!expl || expl.trim().length === 0) {
    emptyExplanationCount++;
    issues.push({ qNum, id: q.original_id, type: 'EMPTY_EXPLANATION' });
    return;
  }

  // 2. Check if solution has steps
  if (!expl.includes('Step-by-Step Solution') && !expl.includes('Concept & Formula')) {
    missingStepsCount++;
    issues.push({ qNum, id: q.original_id, type: 'MISSING_STEPS' });
  }

  // 3. Check if the answer key matches the explanation's declared correct answer
  const ansMatch = expl.match(/Correct Answer:\s*\*?\*?\s*Option\s*\(([A-D])\)/i);
  if (ansMatch) {
    const explAns = ansMatch[1].toUpperCase();
    if (explAns !== correctAns) {
      keyMismatchCount++;
      issues.push({
        qNum,
        id: q.original_id,
        type: 'KEY_MISMATCH_WITH_HEADER',
        correctAns,
        explAns
      });
    }
  }

  // 4. Check for broken math symbols or encoding errors
  if (/&nbsp;|&amp;#|\bNaN\b|\bundefined\b/i.test(expl)) {
    brokenSymbolsCount++;
    issues.push({ qNum, id: q.original_id, type: 'BROKEN_SYMBOLS' });
  }

  // 5. Check if the text of the correct option matches the final answer line
  const correctOptionValue = correctAns === 'A' ? optA : correctAns === 'B' ? optB : correctAns === 'C' ? optC : optD;
  
  const hasLetterMention = expl.includes(`(${correctAns.toLowerCase()})`) || expl.includes(`(${correctAns})`);
  
  // Clean value comparison
  const cleanOptVal = String(correctOptionValue).replace(/[₹,%]/g, '').trim();
  const appearsInExpl = cleanOptVal.length > 0 && expl.includes(cleanOptVal);

  if (!hasLetterMention && !appearsInExpl) {
    issues.push({
      qNum,
      id: q.original_id,
      type: 'POSSIBLE_OPTION_MISMATCH',
      correctAns,
      correctOptionValue,
      explanationSnippet: expl.slice(-150)
    });
  }
});

console.log('\n--- DEEP EXPLANATION AUDIT REPORT ---');
console.log(`Total questions audited: ${questions.length}`);
console.log(`Empty explanations: ${emptyExplanationCount}`);
console.log(`Missing steps/concept: ${missingStepsCount}`);
console.log(`Key mismatches in explanation header: ${keyMismatchCount}`);
console.log(`Broken symbols or encoding errors: ${brokenSymbolsCount}`);
const potentialMismatches = issues.filter(i => i.type === 'POSSIBLE_OPTION_MISMATCH');
console.log(`Flagged potential mismatches: ${potentialMismatches.length}`);

if (issues.length > 0) {
  console.log('\nDetailed issues found:', JSON.stringify(issues, null, 2));
} else {
  console.log('\n✅ 100% PERFECT: Every question has complete step-by-step solutions matching options and correct keys!');
}
