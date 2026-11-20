const fs = require('fs');

const files = [
  'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965189_ecac2af2.html',
  'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html',
  'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html'
];

files.forEach((f, idx) => {
  console.log(`\n=================== FILE ${idx + 1} ===================`);
  const content = fs.readFileSync(f, 'utf8');
  
  // Find script tags
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let sIdx = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    sIdx++;
    const sBody = match[1];
    console.log(`Script ${sIdx} length: ${sBody.length}`);
    const lines = sBody.trim().split('\n').slice(0, 15);
    console.log('Start of script:', lines.map(l => l.substring(0, 100)).join('\n'));
  }
});
