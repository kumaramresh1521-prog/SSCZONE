const fs = require('fs');
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

console.log(`Auditing ${rawQuestions.length} Profit & Loss questions...`);

const issues = [];
const letterMap = ['A', 'B', 'C', 'D'];

rawQuestions.forEach((q, idx) => {
  const qNum = idx + 1;
  
  if (q.id !== qNum) {
    issues.push(`Q ID mismatch: expected ${qNum}, got ${q.id}`);
  }
  
  if (!q.text || q.text.trim().length === 0) {
    issues.push(`Q${qNum}: Empty question text`);
  }
  
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    issues.push(`Q${qNum}: Options is not an array of 4 (length = ${q.options ? q.options.length : 0})`);
  } else {
    q.options.forEach((opt, oIdx) => {
      if (opt === undefined || opt === null || String(opt).trim().length === 0) {
        issues.push(`Q${qNum}: Option ${letterMap[oIdx]} is empty`);
      }
    });
  }
  
  if (typeof q.ans !== 'number' || q.ans < 0 || q.ans > 3) {
    issues.push(`Q${qNum}: Invalid ans index: ${q.ans}`);
  }
  
  if (!q.exam || q.exam.trim().length === 0) {
    issues.push(`Q${qNum}: Missing exam tag`);
  }
  
  if (!q.topic || q.topic.trim().length === 0) {
    issues.push(`Q${qNum}: Missing topic`);
  }
  
  if (!q.steps || !Array.isArray(q.steps) || q.steps.length === 0) {
    issues.push(`Q${qNum}: Missing or non-array steps`);
  }
  
  // Verify that the answer text appears in or matches the steps conclusion
  const chosenOpt = String(q.options[q.ans]).trim();
  const stepsText = q.steps.join(' ');
  
  // Check if answer number/phrase is reflected in steps
  // E.g. if chosenOpt is "100", does stepsText mention 100?
});

console.log(`Audit Complete. Found ${issues.length} basic structural issues.`);
if (issues.length > 0) {
  console.log(issues.slice(0, 20));
}
