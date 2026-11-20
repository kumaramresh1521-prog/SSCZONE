const fs = require('fs');
const vm = require('vm');

const files = {
  ch1_5: {
    path: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965189_ecac2af2.html',
    varName: 'QUESTIONS'
  },
  ch6_10: {
    path: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html',
    varName: 'QUESTIONS'
  },
  ch11_15: {
    path: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html',
    varName: 'QUESTIONS_DATA'
  }
};

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

const d1 = extractArray(fs.readFileSync(files.ch1_5.path, 'utf8'), files.ch1_5.varName);
const d2 = extractArray(fs.readFileSync(files.ch6_10.path, 'utf8'), files.ch6_10.varName);
const d3 = extractArray(fs.readFileSync(files.ch11_15.path, 'utf8'), files.ch11_15.varName);

console.log('--- Checking File 1 (Ch 1-5) keys ---');
const k1 = new Set();
d1.forEach(q => Object.keys(q).forEach(k => k1.add(k)));
console.log('Keys in File 1:', Array.from(k1));
console.log('Chapters in File 1:', [...new Set(d1.map(q => q.c))]);
console.log('Sample tags in File 1:', d1.filter(q => q.tag).slice(0, 5).map(q => q.tag));

console.log('\n--- Checking File 2 (Ch 6-10) keys ---');
const k2 = new Set();
d2.forEach(q => Object.keys(q).forEach(k => k2.add(k)));
console.log('Keys in File 2:', Array.from(k2));
console.log('Chapters in File 2:', [...new Set(d2.map(q => q.c))]);
console.log('Sample tags/audit in File 2:');
console.log('Items with v:', d2.filter(q => q.v).length);
console.log('Items with tag:', d2.filter(q => q.tag).length);
console.log('Sample v items:', d2.filter(q => q.v).slice(0, 3).map(q => ({ c: q.c, n: q.n, v: q.v, a: q.a })));

console.log('\n--- Checking File 3 (Ch 11-15) keys ---');
const k3 = new Set();
d3.forEach(q => Object.keys(q).forEach(k => k3.add(k)));
console.log('Keys in File 3:', Array.from(k3));
console.log('Chapters in File 3:', [...new Set(d3.map(q => q.chapter))]);
console.log('Sample exams in File 3:', d3.slice(0, 5).map(q => q.exam));
console.log('Items with sourceNote:', d3.filter(q => q.sourceNote).length);
console.log('Sample sourceNotes:', d3.filter(q => q.sourceNote).slice(0, 3).map(q => ({ id: q.id, note: q.sourceNote, ans: q.ans })));
