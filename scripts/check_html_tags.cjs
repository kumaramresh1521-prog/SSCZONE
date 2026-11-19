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

const tagsFound = new Set();
rawQuestions.forEach(q => {
  [q.text, ...q.options, q.given, ...(q.steps || []), q.smart].forEach(field => {
    if (typeof field === 'string') {
      const matches = field.match(/<[^>]+>/g);
      if (matches) {
        matches.forEach(m => tagsFound.add(m));
      }
    }
  });
});

console.log('HTML tags found in questions:');
console.log(Array.from(tagsFound));
