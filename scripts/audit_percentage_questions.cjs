const fs = require('fs');
const vm = require('vm');

const filePath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795093425678_6bfd1f50.html';
const content = fs.readFileSync(filePath, 'utf8');

const qMatch = content.indexOf('const QUESTIONS = [');
const endMatch = content.indexOf('];', qMatch);

const arrayCode = content.slice(qMatch, endMatch + 2).replace('const QUESTIONS =', 'global.QUESTIONS =');
const sandbox = { global: {} };
vm.createContext(sandbox);
vm.runInContext(arrayCode, sandbox);

const questions = sandbox.global.QUESTIONS;
console.log('Total Questions:', questions.length);

// Audit fields
let missingExam = 0;
let missingText = 0;
let missingOptions = 0;
let missingAns = 0;
let missingSolution = 0;
let invalidAnsKey = 0;

const ansFreq = { a: 0, b: 0, c: 0, d: 0, other: 0 };

questions.forEach((q, idx) => {
  const num = idx + 1;
  if (!q.exam || q.exam.trim() === '') missingExam++;
  if (!q.text || q.text.trim() === '') missingText++;
  if (!q.options || !q.options.a || !q.options.b || !q.options.c || !q.options.d) missingOptions++;
  if (!q.ans) missingAns++;
  else {
    const a = q.ans.toLowerCase();
    if (ansFreq[a] !== undefined) ansFreq[a]++;
    else ansFreq.other++;
    if (!['a', 'b', 'c', 'd'].includes(a)) invalidAnsKey++;
  }
  if (!q.steps && !q.concept && !q.given && !q.smart) missingSolution++;
});

console.log('--- AUDIT REPORT ---');
console.log('Missing exam tags:', missingExam);
console.log('Missing question text:', missingText);
console.log('Missing options:', missingOptions);
console.log('Missing answers:', missingAns);
console.log('Invalid answer keys:', invalidAnsKey);
console.log('Answer distribution:', ansFreq);
console.log('Missing solution components:', missingSolution);

// Inspect questions mentioned in previous summary: Q238 and Q244
console.log('\n--- INSPECTING Q238 & Q244 ---');
console.log('Q238:', JSON.stringify(questions[237], null, 2));
console.log('Q244:', JSON.stringify(questions[243], null, 2));
