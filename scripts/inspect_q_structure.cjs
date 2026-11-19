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
console.log('Total questions loaded:', rawQuestions.length);

console.log('Sample Q1:');
console.log(JSON.stringify(rawQuestions[0], null, 2));

console.log('\nSample Q50:');
console.log(JSON.stringify(rawQuestions[49], null, 2));

console.log('\nSample Q230 (last):');
console.log(JSON.stringify(rawQuestions[rawQuestions.length - 1], null, 2));
