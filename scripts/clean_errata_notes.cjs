const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'physics_questions_clean.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function removeErrataNotes(text) {
  if (!text) return '';
  let res = text;

  // 1. Remove the entire "⚠️ **Errata & Key Verification Note:**" block
  res = res.replace(/⚠️\s*\*\*Errata\s*&\s*Key\s*Verification\s*Note:\*\*\s*\n[\s\S]*?(?=\n\n(?:🎯|✅|📝|💡|$))/g, '');

  // 2. Remove parenthetical errata / book key references
  // We match (Note: ... with book key / source key / printed key / source table / source PDF / misprint)
  // Using balanced bracket search for (Note: ... )
  let idx = 0;
  while ((idx = res.search(/\([Nn]ote:[^)]*?(?:[Bb]ook\s*key|[Ss]ource\s*(?:key|table|PDF)|[Pp]rinted\s*key|[Mm]isprinted?|Arihant\s*key)/)) !== -1) {
    // Find matching closing parenthesis
    let depth = 0;
    let endIdx = -1;
    for (let i = idx; i < res.length; i++) {
      if (res[i] === '(') depth++;
      else if (res[i] === ')') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      // Remove this (Note: ...)
      res = res.substring(0, idx).trimEnd() + res.substring(endIdx + 1);
    } else {
      break;
    }
  }

  // 3. Clean consecutive newlines
  res = res.replace(/\n{3,}/g, '\n\n').trim();

  return res;
}

let modified = 0;
const examples = [];

questions.forEach((q, i) => {
  const orig = q.explanation;
  const cleaned = removeErrataNotes(orig);
  if (cleaned !== orig) {
    modified++;
    if (examples.length < 5) {
      examples.push({
        qNum: i + 1,
        title: q.tier_level,
        stem: q.question_text.substring(0, 60),
        before: orig,
        after: cleaned
      });
    }
    q.explanation = cleaned;
  }
});

console.log(`Cleaned ${modified} questions out of ${questions.length}.`);

examples.forEach((ex, idx) => {
  console.log(`\n=================== Example ${idx + 1} (Q${ex.qNum}) ===================`);
  console.log('STEM:', ex.stem);
  console.log('\n--- AFTER CLEANING ---');
  console.log(ex.after);
});
