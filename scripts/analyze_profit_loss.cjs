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

const topicCounts = {};
const examCounts = {};
let nullOrEmptyCount = 0;

rawQuestions.forEach((q, idx) => {
  topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  examCounts[q.examGroup] = (examCounts[q.examGroup] || 0) + 1;
  if (!q.text || !q.options || q.options.length !== 4 || q.ans === undefined || q.ans === null) {
    nullOrEmptyCount++;
    console.log(`Issue at index ${idx}: ID ${q.id}`);
  }
});

console.log('Total Questions:', rawQuestions.length);
console.log('Sub-Topic Breakdown:', topicCounts);
console.log('Exam Group Breakdown:', examCounts);
console.log('Defective / Empty Questions:', nullOrEmptyCount);
