const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('scripts/physics_questions_clean.json', 'utf8'));

const yieldMatches = [];
qs.forEach((q, idx) => {
  const full = (q.question_text || '') + ' ' + (q.explanation || '') + ' ' + (q.exam_tag || '');
  const m = full.match(/[\w-]*yield[\w-]*/gi);
  if (m) {
    m.forEach(word => {
      yieldMatches.push({ q: idx + 1, word });
    });
  }
});
console.log('Total matches with yield:', yieldMatches.length);
const distinctWords = [...new Set(yieldMatches.map(x => x.word.toLowerCase()))];
console.log('Distinct words:', distinctWords);
