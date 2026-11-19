const fs = require('fs');
const vm = require('vm');

const algPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795106553361_7f0bc6ea.html';
const alg = fs.readFileSync(algPath, 'utf8');

const qStart = alg.indexOf('const QUESTIONS = [');
const arrayStart = alg.indexOf('[', qStart);

let depth = 0;
let inString = false;
let stringChar = '';
let escape = false;
let arrayEnd = -1;

for (let i = arrayStart; i < alg.length; i++) {
  const c = alg[i];
  if (inString) {
    if (escape) {
      escape = false;
    } else if (c === '\\') {
      escape = true;
    } else if (c === stringChar) {
      inString = false;
    }
  } else {
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      stringChar = c;
    } else if (c === '[') {
      depth++;
    } else if (c === ']') {
      depth--;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }
}

console.log('arrayStart:', arrayStart, 'arrayEnd:', arrayEnd);
const code = 'globalThis.QUESTIONS = ' + alg.substring(arrayStart, arrayEnd + 1) + ';';
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code, ctx);
console.log('Successfully parsed! ALG QUESTIONS count:', ctx.QUESTIONS.length);
console.log('Sample question 0:', ctx.QUESTIONS[0]);
console.log('Sample last question:', ctx.QUESTIONS[ctx.QUESTIONS.length - 1]);
