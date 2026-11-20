const fs = require('fs');
const vm = require('vm');

const files = {
  ch1_5: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965189_ecac2af2.html',
  ch11_15: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html',
  ch6_10: 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html'
};

for (const [key, path] of Object.entries(files)) {
  console.log(`\n=================== ${key} ===================`);
  const content = fs.readFileSync(path, 'utf8');
  
  // Look for QUESTIONS or QUESTIONS_DATA or similar
  const matches = content.match(/const\s+([A-Z_0-9]+)\s*=\s*\[/g);
  console.log('Arrays defined:', matches);
}
