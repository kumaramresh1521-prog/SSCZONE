const fs = require('fs');

const ns = JSON.parse(fs.readFileSync('scripts/number_system_questions_clean.json', 'utf8'));
const alg = JSON.parse(fs.readFileSync('scripts/algebra_questions_clean.json', 'utf8'));

console.log('=== VERIFYING NUMBER SYSTEM (275 Questions) ===');
let nsMismatches = 0;
let nsEmptySteps = 0;
let nsLatexIssues = 0;

ns.forEach((q, idx) => {
  const match = q.explanation.match(/✅ \*\*Correct Answer:\*\* Option \(([A-D])\)/);
  if (!match) {
    console.error('NS Q' + (idx+1) + ': Missing correct answer line');
    nsMismatches++;
  } else if (match[1] !== q.correct_answer) {
    console.error('NS Q' + (idx+1) + ': Mismatch! Key=' + q.correct_answer + ', Expl=' + match[1]);
    nsMismatches++;
  }

  if (!q.explanation.includes('📝 **Step-by-Step Solution:**') || q.explanation.length < 50) {
    console.error('NS Q' + (idx+1) + ': Insufficient solution steps');
    nsEmptySteps++;
  }

  // Check dollar balance
  const dollars = (q.explanation.match(/\$/g) || []).length;
  if (dollars % 2 !== 0) {
    console.warn('NS Q' + (idx+1) + ': Unbalanced $ in explanation');
    nsLatexIssues++;
  }
});

console.log('NS Summary: Mismatches=' + nsMismatches + ', Empty/Short Steps=' + nsEmptySteps + ', LaTeX Balance Warnings=' + nsLatexIssues);


console.log('\n=== VERIFYING ALGEBRA (335 Questions) ===');
let algMismatches = 0;
let algEmptySteps = 0;
let algLatexIssues = 0;

alg.forEach((q, idx) => {
  const match = q.explanation.match(/✅ \*\*Correct Answer:\*\* Option \(([A-D])\)/);
  if (!match) {
    console.error('ALG Q' + (idx+1) + ': Missing correct answer line');
    algMismatches++;
  } else if (match[1] !== q.correct_answer) {
    console.error('ALG Q' + (idx+1) + ': Mismatch! Key=' + q.correct_answer + ', Expl=' + match[1]);
    algMismatches++;
  }

  if (!q.explanation.includes('📝 **Step-by-Step Solution:**') || q.explanation.length < 50) {
    console.error('ALG Q' + (idx+1) + ': Insufficient solution steps');
    algEmptySteps++;
  }

  // Check dollar balance
  const dollars = (q.explanation.match(/\$/g) || []).length;
  if (dollars % 2 !== 0) {
    console.warn('ALG Q' + (idx+1) + ': Unbalanced $ in explanation');
    algLatexIssues++;
  }
});

console.log('ALG Summary: Mismatches=' + algMismatches + ', Empty/Short Steps=' + algEmptySteps + ', LaTeX Balance Warnings=' + algLatexIssues);
