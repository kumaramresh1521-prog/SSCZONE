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

const found = [];
f2.forEach(q => {
  const text = `${q.q} ${q.p || ''} ${q.v || ''} ${q.e || ''}`;
  const m = text.match(/\b(SSC\s*(?:CGL|CHSL|CPO|MTS|Tier[-\s]?[I|II|1|2]*|\(\d+\+\d+\))?\s*\d{4}|NDA\s*\d{4}|CDS\s*\d{4}|RRB\s*(?:NTPC|JE|Group[-\s]?D)?\s*\d{4}|UPSC\s*\d{4}|UPPSC\s*\d{4}|BPSC\s*\d{4})\b/i);
  if (m) {
    found.push({ c: q.c, n: q.n, tag: m[0] });
  }
});

console.log(`Found ${found.length} specific exam mentions in File 2:`);
console.log(found.slice(0, 10));
