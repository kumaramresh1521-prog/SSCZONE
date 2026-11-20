const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'physics_questions_clean.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Starting deep audit of ${questions.length} prepared Physics questions...`);

const validChapters = [
  'Measurement',
  'Motion',
  'The Forces and Law of Motion',
  'Work, Energy and Power',
  'Gravitation',
  'Mechanical Properties of Matter',
  'Oscillation, Wave and Sound',
  'Heat and Thermodynamics',
  'Wave Optics',
  'Electricity',
  'Magnetism',
  'Photoelectric Effect',
  'Atomic & Nuclear Physics',
  'Electronics & Semiconductor Devices',
  'Communication System'
];

let errors = 0;
const chapterCounts = {};
const diffCounts = { easy: 0, medium: 0, hard: 0 };
const examTagSample = new Set();

questions.forEach((q, idx) => {
  const num = idx + 1;

  // Check stem
  if (!q.question_text || !q.question_text.trim()) {
    console.error(`Q${num}: Empty question_text!`);
    errors++;
  }

  // Check options
  ['option_a', 'option_b', 'option_c', 'option_d'].forEach(optKey => {
    if (!q[optKey] || !q[optKey].trim()) {
      console.error(`Q${num}: Empty ${optKey}!`);
      errors++;
    }
  });

  // Check correct answer
  if (!['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
    console.error(`Q${num}: Invalid correct_answer: ${q.correct_answer}`);
    errors++;
  }

  // Check explanation and match
  if (!q.explanation || !q.explanation.trim()) {
    console.error(`Q${num}: Empty explanation!`);
    errors++;
  } else {
    const expectedMatch = `✅ **Correct Answer:** Option (${q.correct_answer})`;
    if (!q.explanation.includes(expectedMatch)) {
      console.error(`Q${num}: Explanation does not match correct_answer (${q.correct_answer})!`);
      errors++;
    }
  }

  // Check chapter
  if (!validChapters.includes(q.tier_level)) {
    console.error(`Q${num}: Invalid tier_level / chapter: ${q.tier_level}`);
    errors++;
  } else {
    chapterCounts[q.tier_level] = (chapterCounts[q.tier_level] || 0) + 1;
  }

  // Check difficulty
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
    console.error(`Q${num}: Invalid difficulty: ${q.difficulty}`);
    errors++;
  } else {
    diffCounts[q.difficulty]++;
  }

  // Check year reference
  if (q.year_reference !== null) {
    if (typeof q.year_reference !== 'number' || q.year_reference < 1980 || q.year_reference > 2030) {
      console.error(`Q${num}: Suspicious year_reference:`, q.year_reference);
      errors++;
    }
  }

  if (q.exam_tag) {
    examTagSample.add(q.exam_tag);
  }
});

console.log(`\nAudit Results: ${errors} errors found.`);
console.log('\n--- Chapter Distribution ---');
validChapters.forEach((ch, idx) => {
  console.log(`Ch ${idx + 1}: ${ch.padEnd(40)} -> ${chapterCounts[ch] || 0} Qs`);
});

console.log('\n--- Difficulty Distribution ---');
console.log(diffCounts);

console.log('\n--- Sample Exam Tags ---');
console.log(Array.from(examTagSample).slice(0, 15));
