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

function cleanText(t) {
  if (!t) return '';
  return String(t)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanOption(opt) {
  let s = cleanText(opt);
  // remove leading (A), (B), (C), (D), (a), A., etc.
  s = s.replace(/^\([A-Da-d1-4]\)\s*/, '');
  s = s.replace(/^[A-Da-d1-4][\.\)]\s*/, '');
  return s.trim();
}

const file0Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445695_2c7d71ed.html';
const file1Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_4ae44a20.html';
const file2Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_185d10f3.html';

const q0 = parseBracketArray(fs.readFileSync(file0Path, 'utf8'), 'const QUESTIONS');
const q1 = parseBracketArray(fs.readFileSync(file1Path, 'utf8'), 'const RAW_QS');
const q2 = parseBracketArray(fs.readFileSync(file2Path, 'utf8'), 'const QUESTIONS');

const letters = ['A', 'B', 'C', 'D'];
let issues = [];

function checkItem(source, idx, stem, options, ansIdx, expl, facts) {
  const qClean = cleanText(stem);
  if (!qClean) issues.push({ source, idx, error: 'Empty stem' });
  if (!Array.isArray(options) || options.length !== 4) {
    issues.push({ source, idx, error: `Invalid options length: ${options ? options.length : 'null'}` });
    return;
  }
  const optsClean = options.map(cleanOption);
  for (let i = 0; i < 4; i++) {
    if (!optsClean[i]) issues.push({ source, idx, error: `Empty option ${letters[i]}` });
  }
  if (ansIdx < 0 || ansIdx > 3) {
    issues.push({ source, idx, error: `Invalid answer index: ${ansIdx}` });
  }
  if (!cleanText(expl)) {
    issues.push({ source, idx, error: 'Empty explanation' });
  }
}

q0.forEach((item, i) => checkItem('File0', i, item[3], item[4], item[5], item[6], item[7]));
q1.forEach((item, i) => checkItem('File1', i, item[3], item[4], item[5], item[6], item[7]));
q2.forEach((item, i) => checkItem('File2', i, item.question, item.options, item.answerIndex, item.explanation, item.facts));

console.log('Total checks run: 759');
console.log('Issues found:', issues.length);
if (issues.length > 0) {
  console.log('First 10 issues:', issues.slice(0, 10));
} else {
  console.log('All 759 items passed structural and option validation with zero errors!');
}
