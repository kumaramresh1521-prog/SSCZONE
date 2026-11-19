const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795103486547_a540221b.html';
const content = fs.readFileSync(filePath, 'utf8');

const qMatch = content.indexOf('const QUESTIONS = [');
const endMatch = content.indexOf('];', qMatch);

const arrayCode = content.slice(qMatch, endMatch + 2).replace('const QUESTIONS =', 'global.QUESTIONS =');
const sandbox = { global: {} };
vm.createContext(sandbox);
vm.runInContext(arrayCode, sandbox);

const rawQuestions = sandbox.global.QUESTIONS;
console.log(`Loaded ${rawQuestions.length} raw questions.`);

const letterMap = ['A', 'B', 'C', 'D'];

const formattedQuestions = rawQuestions.map((q, idx) => {
  const qNum = idx + 1;
  const optA = String(q.options[0]).trim();
  const optB = String(q.options[1]).trim();
  const optC = String(q.options[2]).trim();
  const optD = String(q.options[3]).trim();
  const correctAns = letterMap[q.ans];
  const correctOptText = String(q.options[q.ans]).trim();

  // Extract year reference
  const yearMatch = q.exam.match(/\b(19\d{2}|20\d{2})\b/);
  const yearReference = yearMatch ? yearMatch[1] : null;

  // Format steps
  let formattedSteps = "";
  if (Array.isArray(q.steps)) {
    formattedSteps = q.steps.map((st, sIdx) => {
      const cleanStep = st.trim();
      if (/^step\s*\d+/i.test(cleanStep)) {
        return cleanStep;
      }
      return `Step ${sIdx + 1}: ${cleanStep}`;
    }).join('\n\n');
  } else if (typeof q.steps === 'string') {
    formattedSteps = q.steps.trim();
  }

  // Format smart shortcut
  let formattedSmart = "";
  if (q.smart && q.smart.trim()) {
    formattedSmart = q.smart
      .replace(/<strong>/gi, '**')
      .replace(/<\/strong>/gi, '**')
      .replace(/<em>/gi, '*')
      .replace(/<\/em>/gi, '*')
      .trim();
  }

  // Build clean, well-structured explanation
  const explanationParts = [];
  if (q.given && q.given.trim()) {
    explanationParts.push(`📌 **Given:**\n${q.given.trim()}`);
  }
  if (formattedSteps) {
    explanationParts.push(`📝 **Step-by-Step Solution:**\n${formattedSteps}`);
  }
  if (formattedSmart) {
    explanationParts.push(`⚡ **Smart / Shortcut Approach:**\n${formattedSmart}`);
  }
  explanationParts.push(`✅ **Correct Answer:** Option (${correctAns}) ${correctOptText}`);

  const fullExplanation = explanationParts.join('\n\n');

  return {
    index: qNum,
    original_id: q.id,
    topic_id: 190, // SSC CGL Profit and Loss (Master Topic)
    question_text: q.text.trim(),
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correctAns,
    explanation: fullExplanation,
    difficulty: "medium",
    exam_tag: q.exam.trim(),
    tier_level: q.topic.trim(),
    year_reference: yearReference,
    is_active: true
  };
});

console.log(`Formatted ${formattedQuestions.length} questions successfully.`);

// Save clean JSON file for backup & reproducibility
const outputPath = path.join(__dirname, 'profit_loss_questions_clean.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedQuestions, null, 2), 'utf8');
console.log(`Saved clean questions to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB).`);

// Print sample questions
console.log('\n--- SAMPLE 1 (Q1) ---');
console.log(JSON.stringify(formattedQuestions[0], null, 2));

console.log('\n--- SAMPLE 50 ---');
console.log(JSON.stringify(formattedQuestions[49], null, 2));

console.log('\n--- SAMPLE 230 (Last) ---');
console.log(JSON.stringify(formattedQuestions[229], null, 2));
