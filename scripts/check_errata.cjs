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

const f2 = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html', 'utf8'), 'QUESTIONS');
const f3 = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html', 'utf8'), 'QUESTIONS_DATA');

const letters = ['A', 'B', 'C', 'D'];

console.log('=== File 2 Errata / Audit Notes (v) ===');
f2.filter(q => q.v).forEach(q => {
  console.log(`Ch ${q.c} Q${q.n}: ans=${letters[q.a]} ("${q.o[q.a]}")`);
  console.log(`  Stem: ${q.q.substring(0, 80)}...`);
  console.log(`  Note: ${q.v}`);
  console.log(`  Exp: ${q.e.substring(0, 100)}...`);
  console.log('---');
});

console.log('\n=== File 3 Errata / Audit Notes (sourceNote) ===');
f3.filter(q => q.sourceNote).forEach(q => {
  console.log(`Ch ${q.chapter} Q${q.num} (${q.id}): ans=${letters[q.ans]} ("${q.options[q.ans]}")`);
  console.log(`  Stem: ${q.q.substring(0, 80)}...`);
  console.log(`  Note: ${q.sourceNote}`);
  console.log(`  Exp: ${q.exp.substring(0, 100)}...`);
  console.log('---');
});
