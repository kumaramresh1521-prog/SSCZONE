const fs = require('fs');
const vm = require('vm');

function parseBracketArray(content, varName) {
  const marker = varName + ' = [';
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) throw new Error('Marker not found: ' + marker);
  const pos = startIdx + (varName + ' = ').length;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let endPos = -1;

  for (let i = pos; i < content.length; i++) {
    const c = content[i];
    if (!inString && !inComment) {
      if (c === '/' && content[i + 1] === '/') {
        inComment = 'line';
        i++;
      } else if (c === '/' && content[i + 1] === '*') {
        inComment = 'block';
        i++;
      } else if (c === '"' || c === '\'' || c === '`') {
        inString = true;
        stringChar = c;
      } else if (c === '[') {
        depth++;
      } else if (c === ']') {
        depth--;
        if (depth === 0) {
          endPos = i + 1;
          break;
        }
      }
    } else if (inComment === 'line') {
      if (c === '\n') inComment = false;
    } else if (inComment === 'block') {
      if (c === '*' && content[i + 1] === '/') {
        inComment = false;
        i++;
      }
    } else if (inString) {
      if (c === '\\') {
        i++;
      } else if (c === stringChar) {
        inString = false;
      }
    }
  }
  const arrayStr = content.slice(pos, endPos);
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext('var DATA = ' + arrayStr + ';', sandbox);
  return sandbox.DATA;
}

const file0Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445695_2c7d71ed.html';
const file1Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_4ae44a20.html';
const file2Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_185d10f3.html';

const q0 = parseBracketArray(fs.readFileSync(file0Path, 'utf8'), 'const QUESTIONS');
const q1 = parseBracketArray(fs.readFileSync(file1Path, 'utf8'), 'const RAW_QS');
const q2 = parseBracketArray(fs.readFileSync(file2Path, 'utf8'), 'const QUESTIONS');

console.log('--- Inspecting File 0 Tags & Patterns ---');
const file0Tags = new Map();
let file0HighYield = 0;
let file0Errata = 0;
for (const item of q0) {
  const [ch, qnum, exam, stem, opts, ans, expl, facts] = item;
  file0Tags.set(exam, (file0Tags.get(exam) || 0) + 1);
  const allText = JSON.stringify(item);
  if (/high[- ]?yield/i.test(allText)) file0HighYield++;
  if (/errata/i.test(allText)) file0Errata++;
}
console.log('File 0 total items:', q0.length, 'High yield mentions:', file0HighYield, 'Errata mentions:', file0Errata);
console.log('File 0 sample tags (first 10):', Array.from(file0Tags.entries()).slice(0, 10));

console.log('\n--- Inspecting File 1 Tags & Patterns ---');
const file1Tags = new Map();
let file1HighYield = 0;
let file1Errata = 0;
for (const item of q1) {
  const [ch, qnum, exam, stem, opts, ans, expl, facts] = item;
  file1Tags.set(exam, (file1Tags.get(exam) || 0) + 1);
  const allText = JSON.stringify(item);
  if (/high[- ]?yield/i.test(allText)) file1HighYield++;
  if (/errata/i.test(allText)) file1Errata++;
}
console.log('File 1 total items:', q1.length, 'High yield mentions:', file1HighYield, 'Errata mentions:', file1Errata);
console.log('File 1 sample tags (first 10):', Array.from(file1Tags.entries()).slice(0, 10));

console.log('\n--- Inspecting File 2 Tags & Patterns ---');
const file2Tags = new Map();
let file2HighYield = 0;
let file2Errata = 0;
for (const item of q2) {
  const exam = item.exam;
  file2Tags.set(exam, (file2Tags.get(exam) || 0) + 1);
  const allText = JSON.stringify(item);
  if (/high[- ]?yield/i.test(allText)) file2HighYield++;
  if (/errata/i.test(allText)) file2Errata++;
}
console.log('File 2 total items:', q2.length, 'High yield mentions:', file2HighYield, 'Errata mentions:', file2Errata);
console.log('File 2 sample tags (first 10):', Array.from(file2Tags.entries()).slice(0, 10));
