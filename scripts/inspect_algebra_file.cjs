const fs = require('fs');

const algPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795106553361_7f0bc6ea.html';
const alg = fs.readFileSync(algPath, 'utf8');

const sStart = alg.lastIndexOf('<script');
const scriptPart = alg.substring(sStart);
console.log('Script tag starts at:', sStart);

const qStart = scriptPart.indexOf('const QUESTIONS = [');
console.log('qStart:', qStart);

const sEnd = scriptPart.indexOf('</script>');
const scriptBody = scriptPart.substring(0, sEnd);

const matches = [...scriptBody.matchAll(/\n(?:const|let|var|function)\s+([a-zA-Z0-9_$]+)/g)];
console.log('Definitions in script:', matches.map(m => m[1]));

// Let's see what is right after QUESTIONS array
// Find the last occurrence of id: 335
const lastQIdx = scriptBody.lastIndexOf('id: 335');
console.log('id: 335 index:', lastQIdx);
if (lastQIdx !== -1) {
  console.log('Context around id: 335:');
  console.log(scriptBody.substring(lastQIdx, lastQIdx + 800));
}
