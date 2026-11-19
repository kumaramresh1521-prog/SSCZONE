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

const yearCounts = {};
let missingYear = 0;

rawQuestions.forEach(q => {
  const m = q.exam.match(/\b(19\d{2}|20\d{2})\b/);
  if (m) {
    const yr = m[1];
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  } else {
    missingYear++;
    console.log(`Missing year for: ${q.exam}`);
  }
});

console.log('Year distribution:', yearCounts);
console.log('Missing year count:', missingYear);
