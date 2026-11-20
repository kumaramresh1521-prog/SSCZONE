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

console.log(`Loaded: F1=${f1.length}, F2=${f2.length}, F3=${f3.length}, Total=${f1.length + f2.length + f3.length}`);

// Clean option function
function cleanOptionText(opt) {
  if (!opt) return '';
  return String(opt)
    .trim()
    .replace(/^\([a-dA-D1-4]\)\s*/, '') // remove (a), (A), (1)
    .replace(/^[a-dA-D1-4][\.\)]\s*/, '') // remove a., A), 1.
    .trim();
}

// Audit File 1
console.log('\n--- Auditing File 1 (Ch 1-5) ---');
f1.forEach((q, i) => {
  if (!q.q || !q.q.trim()) console.error(`F1 #${i + 1} empty question!`);
  if (!Array.isArray(q.o) || q.o.length !== 4) console.error(`F1 #${i + 1} options length !== 4:`, q.o);
  if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) console.error(`F1 #${i + 1} invalid answer index:`, q.a);
  q.o.forEach((opt, oIdx) => {
    if (!opt || !String(opt).trim()) console.error(`F1 #${i + 1} option ${oIdx} empty!`);
  });
});

// Audit File 2
console.log('\n--- Auditing File 2 (Ch 6-10) ---');
f2.forEach((q, i) => {
  if (!q.q || !q.q.trim()) console.error(`F2 #${i + 1} empty question!`);
  if (!Array.isArray(q.o) || q.o.length !== 4) console.error(`F2 #${i + 1} options length !== 4:`, q.o);
  if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) console.error(`F2 #${i + 1} invalid answer index:`, q.a);
  q.o.forEach((opt, oIdx) => {
    if (!opt || !String(opt).trim()) console.error(`F2 #${i + 1} option ${oIdx} empty!`);
  });
});

// Audit File 3
console.log('\n--- Auditing File 3 (Ch 11-15) ---');
f3.forEach((q, i) => {
  if (!q.q || !q.q.trim()) console.error(`F3 #${i + 1} empty question!`);
  if (!Array.isArray(q.options) || q.options.length !== 4) console.error(`F3 #${i + 1} options length !== 4:`, q.options);
  if (typeof q.ans !== 'number' || q.ans < 0 || q.ans > 3) console.error(`F3 #${i + 1} invalid answer index:`, q.ans);
  q.options.forEach((opt, oIdx) => {
    if (!opt || !String(opt).trim()) console.error(`F3 #${i + 1} option ${oIdx} empty!`);
  });
});

console.log('Options & indices audit complete.');
