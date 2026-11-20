const fs = require('fs');
const vm = require('vm');

function parseBracketArray(content, varName) {
  const marker = varName + ' = [';
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) {
    throw new Error('Marker not found: ' + marker);
  }
  const pos = startIdx + (varName + ' = ').length; // points to '['
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
        i++; // skip next escaped char
      } else if (c === stringChar) {
        inString = false;
      }
    }
  }

  if (endPos === -1) {
    throw new Error('Failed to find matching closing bracket for ' + varName);
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

const file0Content = fs.readFileSync(file0Path, 'utf8');
const file1Content = fs.readFileSync(file1Path, 'utf8');
const file2Content = fs.readFileSync(file2Path, 'utf8');

const q0 = parseBracketArray(file0Content, 'const QUESTIONS');
console.log('File 0 questions count:', q0.length);

const q1 = parseBracketArray(file1Content, 'const RAW_QS');
console.log('File 1 questions count:', q1.length);

const q2 = parseBracketArray(file2Content, 'const QUESTIONS');
console.log('File 2 questions count:', q2.length);

console.log('Total raw questions across 3 files:', q0.length + q1.length + q2.length);
