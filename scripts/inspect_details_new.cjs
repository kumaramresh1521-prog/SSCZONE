const fs = require('fs');
const vm = require('vm');

function parseBracketArray(content, varName) {
  const marker = varName + ' = [';
  const startIdx = content.indexOf(marker);
  const pos = startIdx + (varName + ' = ').length;
  let depth = 0, inString = false, stringChar = '', inComment = false, endPos = -1;
  for (let i = pos; i < content.length; i++) {
    const c = content[i];
    if (!inString && !inComment) {
      if (c === '/' && content[i + 1] === '/') { inComment = 'line'; i++; }
      else if (c === '/' && content[i + 1] === '*') { inComment = 'block'; i++; }
      else if (c === '"' || c === '\'' || c === '`') { inString = true; stringChar = c; }
      else if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { endPos = i + 1; break; } }
    } else if (inComment === 'line') { if (c === '\n') inComment = false; }
    else if (inComment === 'block') { if (c === '*' && content[i + 1] === '/') { inComment = false; i++; } }
    else if (inString) { if (c === '\\') i++; else if (c === stringChar) inString = false; }
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

console.log('--- File 2 Tags Check ---');
const nonSscFile2 = [];
for (const item of q2) {
  if (!item.exam || !item.exam.toUpperCase().includes('SSC')) {
    nonSscFile2.push({ id: item.id, exam: item.exam });
  }
}
console.log('Non-SSC tags in File 2:', nonSscFile2.length, nonSscFile2);

console.log('\n--- Sample explanation from File 0 ---');
console.log('Item 0:');
console.log('Options:', q0[0][4]);
console.log('Answer index:', q0[0][5]);
console.log('Explanation:', q0[0][6]);
console.log('Facts:', q0[0][7]);

console.log('\n--- Sample explanation from File 1 ---');
console.log('Item 0:');
console.log('Options:', q1[0][4]);
console.log('Answer index:', q1[0][5]);
console.log('Explanation:', q1[0][6]);
console.log('Facts:', q1[0][7]);

console.log('\n--- Sample explanation from File 2 ---');
console.log('Item 0:');
console.log('Options:', q2[0].options);
console.log('Answer index:', q2[0].answerIndex);
console.log('Explanation:', q2[0].explanation);
console.log('Facts:', q2[0].facts);
