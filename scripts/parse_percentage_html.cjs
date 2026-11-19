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
console.log('Successfully extracted QUESTIONS! Count =', questions.length);
console.log('First question sample:', JSON.stringify(questions[0], null, 2));
console.log('Last question sample:', JSON.stringify(questions[questions.length - 1], null, 2));

// Summary by examGroup
const byGroup = {};
const byTopic = {};
questions.forEach(q => {
  byGroup[q.examGroup] = (byGroup[q.examGroup] || 0) + 1;
  byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
});

console.log('Breakdown by Exam Group:', byGroup);
console.log('Breakdown by Topic Sub-category:', byTopic);
