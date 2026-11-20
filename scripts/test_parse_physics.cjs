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

for (const [name, config] of Object.entries(files)) {
  console.log(`\n=================== Testing ${name} ===================`);
  const content = fs.readFileSync(config.path, 'utf8');

  // Find start of varName
  const searchStr = `const ${config.varName} = [`;
  const startIdx = content.indexOf(searchStr);
  if (startIdx === -1) {
    console.error(`Could not find ${searchStr}`);
    continue;
  }

  // Use balanced bracket to extract the array
  const arrStart = content.indexOf('[', startIdx);
  let depth = 0;
  let inBacktick = false;
  let inDouble = false;
  let inSingle = false;
  let escape = false;
  let endIdx = -1;

  for (let i = arrStart; i < content.length; i++) {
    const ch = content[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '`' && !inDouble && !inSingle) {
      inBacktick = !inBacktick;
      continue;
    }
    if (ch === '"' && !inBacktick && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === "'" && !inBacktick && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (!inBacktick && !inDouble && !inSingle) {
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx === -1) {
    console.error(`Could not balance brackets for ${name}`);
    continue;
  }

  console.log(`Extracted array text length: ${endIdx - arrStart + 1}`);
  const arrayCode = `globalThis.TARGET_DATA = ` + content.substring(arrStart, endIdx + 1);

  const sandbox = { globalThis: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(arrayCode, sandbox);
    const data = sandbox.globalThis.TARGET_DATA;
    console.log(`Successfully parsed ${name}! Total items: ${data.length}`);
    console.log('Sample item 0:', JSON.stringify(data[0], null, 2));
    console.log('Sample item last:', JSON.stringify(data[data.length - 1], null, 2));
  } catch (err) {
    console.error(`VM execution error for ${name}:`, err.message);
  }
}
