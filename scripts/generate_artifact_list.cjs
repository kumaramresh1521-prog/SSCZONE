const fs = require('fs');
const path = require('path');

const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'percentage_questions_clean.json'), 'utf8'));

let md = '# SSC Percentage Chapter — Complete Ingested List of 287 Questions\n\n';
md += '> **Summary:** All 287 questions are active in Database (Topic 189) with full 4 options, bilingual auto-support, multi-part step-by-step solutions, and official exam shift tags.\n\n';
md += '| Q# | Exam Tag | Sub-Topic | Ans | Question Snippet |\n';
md += '| :---: | :--- | :--- | :---: | :--- |\n';

json.forEach((q, idx) => {
  const cleanStem = q.question_text.replace(/\r?\n+/g, ' ').replace(/\|/g, '/').slice(0, 95) + (q.question_text.length > 95 ? '...' : '');
  md += `| **${idx + 1}** | ${q.exam_tag} | ${q.tier_level} | **${q.correct_answer}** | ${cleanStem} |\n`;
});

const outPath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/percentage_287_questions_complete_list.md';
fs.writeFileSync(outPath, md, 'utf8');
console.log('Generated complete artifact table with', json.length, 'questions at', outPath);
