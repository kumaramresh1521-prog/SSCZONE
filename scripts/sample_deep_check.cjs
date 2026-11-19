const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'percentage_questions_clean.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const testIndices = [14, 74, 124, 179, 249]; // Q15, Q75, Q125, Q180, Q250

testIndices.forEach(idx => {
  const q = questions[idx];
  console.log(`\n================== Q#${idx + 1} (ID: ${q.original_id}) ==================`);
  console.log(`Exam: ${q.exam_tag}`);
  console.log(`Sub-Topic: ${q.tier_level}`);
  console.log(`Question: ${q.question_text}`);
  console.log(`Options: A) ${q.option_a} | B) ${q.option_b} | C) ${q.option_c} | D) ${q.option_d}`);
  console.log(`Correct Answer: ${q.correct_answer}`);
  console.log(`--- Explanation ---`);
  console.log(q.explanation);
});
