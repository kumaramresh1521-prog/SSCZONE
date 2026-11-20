const fs = require('fs');
const vm = require('vm');

function extractArray(content, varName) {
  const searchStr = `const ${varName} = [`;
  const startIdx = content.indexOf(searchStr);
  const arrStart = content.indexOf('[', startIdx);
  let depth = 0, inBacktick = false, inDouble = false, inSingle = false, escape = false, endIdx = -1;
  for (let i = arrStart; i < content.length; i++) {
    const ch = content[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '`' && !inDouble && !inSingle) { inBacktick = !inBacktick; continue; }
    if (ch === '"' && !inBacktick && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === "'" && !inBacktick && !inDouble) { inSingle = !inSingle; continue; }
    if (!inBacktick && !inDouble && !inSingle) {
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
  }
  const arrayCode = `globalThis.TARGET_DATA = ` + content.substring(arrStart, endIdx + 1);
  const sandbox = { globalThis: {} };
  vm.createContext(sandbox);
  vm.runInContext(arrayCode, sandbox);
  return sandbox.globalThis.TARGET_DATA;
}

const f1 = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965189_ecac2af2.html', 'utf8'), 'QUESTIONS');
const f2 = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html', 'utf8'), 'QUESTIONS');
const f3 = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html', 'utf8'), 'QUESTIONS_DATA');

console.log('File 1 count:', f1.length, 'tags count:', f1.filter(q => q.tag).length);
console.log('File 2 count:', f2.length, 'tags count:', f2.filter(q => q.tag).length);
console.log('File 3 count:', f3.length, 'exam count:', f3.filter(q => q.exam).length);

// In File 2, inspect what p (exam angle) contains:
console.log('\nSample p in File 2:');
f2.slice(0, 10).forEach(q => console.log(`Ch${q.c} Q${q.n}:`, q.p));
