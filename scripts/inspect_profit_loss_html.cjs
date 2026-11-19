const fs = require('fs');

const filePath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795103486547_a540221b.html';
const content = fs.readFileSync(filePath, 'utf8');

console.log('File size:', (content.length / 1024).toFixed(1), 'KB');

const qMatch = content.indexOf('const QUESTIONS = [');
console.log('qMatch index:', qMatch);

if (qMatch !== -1) {
  const endMatch = content.indexOf('];', qMatch);
  console.log('endMatch index:', endMatch);
  
  // Read a snippet
  console.log('Snippet of QUESTIONS:');
  console.log(content.slice(qMatch, qMatch + 500));
} else {
  // Let's search for "QUESTIONS" or whatever array name exists
  const matches = content.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\[/g);
  console.log('Found array declarations:', matches);
}
