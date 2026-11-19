const fs = require('fs');
const path = require('path');
const vm = require('vm');

const nsPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795106552989_0b2d1021.html';
const content = fs.readFileSync(nsPath, 'utf8');

const qStart = content.indexOf('const QUESTIONS = [');
const arrayStart = content.indexOf('[', qStart);

let depth = 0;
let inString = false;
let stringChar = '';
let escape = false;
let arrayEnd = -1;

for (let i = arrayStart; i < content.length; i++) {
  const c = content[i];
  if (inString) {
    if (escape) {
      escape = false;
    } else if (c === '\\') {
      escape = true;
    } else if (c === stringChar) {
      inString = false;
    }
  } else {
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      stringChar = c;
    } else if (c === '[') {
      depth++;
    } else if (c === ']') {
      depth--;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }
}

if (arrayEnd === -1) {
  console.error('Could not find closing bracket of QUESTIONS array');
  process.exit(1);
}

const arrayCode = 'globalThis.QUESTIONS = ' + content.substring(arrayStart, arrayEnd + 1) + ';';
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(arrayCode, sandbox);

const rawQuestions = sandbox.QUESTIONS;
console.log(`Loaded ${rawQuestions.length} raw Number System questions.`);

const letterIndexMap = {
  'a': 0, 'b': 1, 'c': 2, 'd': 3,
  'A': 0, 'B': 1, 'C': 2, 'D': 3,
  0: 0, 1: 1, 2: 2, 3: 3
};

const letters = ['A', 'B', 'C', 'D'];

const formattedQuestions = rawQuestions.map((q, idx) => {
  const qNum = idx + 1;
  const opts = q.opts || q.options || [];
  const optA = String(opts[0] ?? '').trim();
  const optB = String(opts[1] ?? '').trim();
  const optC = String(opts[2] ?? '').trim();
  const optD = String(opts[3] ?? '').trim();

  const ansKey = q.ans !== undefined ? q.ans : q.answer;
  const ansIdx = letterIndexMap[ansKey];
  if (ansIdx === undefined || ansIdx < 0 || ansIdx > 3) {
    console.error(`Invalid answer key for Q${q.id}:`, ansKey);
  }
  const correctAns = letters[ansIdx];
  const correctOptText = String(opts[ansIdx] ?? '').trim();

  // Extract year reference
  const tag = q.tag || q.exam || '';
  const yearMatch = tag.match(/\b(19\d{2}|20\d{2})\b/);
  const yearReference = yearMatch ? yearMatch[1] : null;

  // Format steps
  let formattedSteps = '';
  if (Array.isArray(q.steps)) {
    formattedSteps = q.steps.map((st, sIdx) => {
      const cleanStep = String(st).trim();
      if (/^step\s*\d+/i.test(cleanStep)) {
        return cleanStep;
      }
      return `Step ${sIdx + 1}: ${cleanStep}`;
    }).join('\n\n');
  } else if (typeof q.steps === 'string') {
    formattedSteps = q.steps.trim();
  }

  // Format smart shortcut
  let formattedSmart = '';
  if (q.smart && String(q.smart).trim()) {
    formattedSmart = String(q.smart)
      .replace(/<strong>/gi, '**')
      .replace(/<\/strong>/gi, '**')
      .replace(/<em>/gi, '*')
      .replace(/<\/em>/gi, '*')
      .trim();
  }

  // Format concept / rule if provided
  let formattedConcept = '';
  if (q.concept && String(q.concept).trim()) {
    formattedConcept = String(q.concept).trim();
  }

  // Build clean, well-structured explanation with standard headings
  const explanationParts = [];
  if (formattedConcept) {
    explanationParts.push(`💡 **Concept & Rule:**\n${formattedConcept}`);
  }
  if (formattedSteps) {
    explanationParts.push(`📝 **Step-by-Step Solution:**\n${formattedSteps}`);
  }
  if (formattedSmart) {
    explanationParts.push(`⚡ **Smart / Shortcut Approach:**\n${formattedSmart}`);
  }
  explanationParts.push(`✅ **Correct Answer:** Option (${correctAns}) ${correctOptText}`);

  const fullExplanation = explanationParts.join('\n\n');

  // Difficulty estimation: based on step count or tier
  let difficulty = 'medium';
  if (tag.toLowerCase().includes('tier-ii') || tag.toLowerCase().includes('mains') || (q.steps && q.steps.length >= 6)) {
    difficulty = 'hard';
  } else if (q.steps && q.steps.length <= 2) {
    difficulty = 'easy';
  }

  return {
    index: qNum,
    original_id: q.id,
    topic_id: 182, // SSC CGL Number System (Master Topic)
    question_text: String(q.q || q.stem || q.text).trim(),
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correctAns,
    explanation: fullExplanation,
    difficulty: difficulty,
    exam_tag: tag.trim(),
    tier_level: String(q.topic || 'Number System').trim(),
    year_reference: yearReference,
    is_active: true
  };
});

console.log(`Formatted ${formattedQuestions.length} Number System questions.`);

// Audit checks
let issues = 0;
formattedQuestions.forEach((q, i) => {
  if (!q.question_text) { console.error(`Q${i+1} missing question_text`); issues++; }
  if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) { console.error(`Q${i+1} missing options`); issues++; }
  if (!q.correct_answer || !['A','B','C','D'].includes(q.correct_answer)) { console.error(`Q${i+1} invalid correct_answer: ${q.correct_answer}`); issues++; }
  if (!q.explanation || q.explanation.length < 20) { console.error(`Q${i+1} empty explanation`); issues++; }
  if (!q.exam_tag) { console.error(`Q${i+1} missing exam_tag`); issues++; }
});

if (issues === 0) {
  console.log('✅ Audit passed: 0 validation issues found!');
} else {
  console.error(`❌ Audit failed with ${issues} issues!`);
}

const outputPath = path.join(__dirname, 'number_system_questions_clean.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedQuestions, null, 2), 'utf8');
console.log(`Saved clean questions to ${outputPath}`);
