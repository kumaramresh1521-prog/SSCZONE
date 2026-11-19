const fs = require('fs');

const algPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795106553361_7f0bc6ea.html';
const alg = fs.readFileSync(algPath, 'utf8');

const qStart = alg.indexOf('const QUESTIONS = [');
console.log('qStart:', qStart);

// Let's search from end of file backwards for '];'
const lastClosingBracket = alg.lastIndexOf('];');
console.log('lastClosingBracket:', lastClosingBracket);

// Let's see what is around lastClosingBracket
console.log(alg.substring(lastClosingBracket - 200, lastClosingBracket + 100));
