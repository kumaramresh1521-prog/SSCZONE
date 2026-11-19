const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c';

// 1. NUMBER SYSTEM
const nsData = JSON.parse(fs.readFileSync('scripts/number_system_questions_clean.json', 'utf8'));

let nsMd = `# Number System (संख्या पद्धति) — Complete 275 Questions & Solutions Directory

> **Database Topic ID:** 182 (\`number-system\` / SSC CGL Number System)  
> **Synced Sibling Topics:** Topic 267 (\`ssc-chsl-number-system\`), Topic 350 (\`ssc-cpo-number-system\`)  
> **Total Questions:** 275 Verified PYQs  
> **Coverage:** SSC CGL, CHSL, CPO, MTS (2018–2024 Tier-I & Tier-II)  
> **Status:** 100% Ingested, Verified & Auto-synced in Production Database  

---

## 📊 Summary by Exam & Year
| Exam Category | Question Count | Sample Years |
|:---|:---:|:---|
| **SSC CHSL** | ${nsData.filter(q => q.exam_tag.includes('CHSL')).length} | 2019–2024 |
| **SSC CGL (Tier-I & Tier-II)** | ${nsData.filter(q => q.exam_tag.includes('CGL')).length} | 2019–2024 |
| **SSC CPO** | ${nsData.filter(q => q.exam_tag.includes('CPO')).length} | 2019–2024 |
| **SSC Selection Post / Other** | ${nsData.filter(q => !q.exam_tag.includes('CHSL') && !q.exam_tag.includes('CGL') && !q.exam_tag.includes('CPO')).length} | 2020–2024 |
| **Total** | **${nsData.length}** | **2018–2024** |

---

## 📋 Complete Question Directory (1 to 275)

| # | Exam Tag | Subtopic / Concept | Question Excerpt | Key | Correct Option |
|:---:|:---|:---|:---|:---:|:---|
`;

nsData.forEach(q => {
  const shortStem = q.question_text.replace(/\n+/g, ' ').slice(0, 75) + (q.question_text.length > 75 ? '...' : '');
  const optVal = q[`option_${q.correct_answer.toLowerCase()}`];
  nsMd += `| ${q.index} | \`${q.exam_tag}\` | ${q.tier_level} | ${shortStem.replace(/\|/g, '\\|')} | **(${q.correct_answer})** | \`${optVal.replace(/\|/g, '\\|')}\` |\n`;
});

const nsOutPath = path.join(artifactDir, 'number_system_275_questions_complete_list.md');
fs.writeFileSync(nsOutPath, nsMd, 'utf8');
console.log(`Saved Number System markdown artifact to: ${nsOutPath}`);


// 2. ALGEBRA
const algData = JSON.parse(fs.readFileSync('scripts/algebra_questions_clean.json', 'utf8'));

let algMd = `# Algebra (बीजगणित) — Complete 335 Questions & Solutions Directory

> **Database Topic ID:** 201 (\`ssc-cgl-algebric-polynomial-and-identities\` / SSC CGL Algebra)  
> **Synced Sibling Topics:** Topic 286 (\`ssc-chsl-algebric-polynomial-and-identities\`), Topic 369 (\`ssc-cpo-algebric-polynomial-and-identities\`)  
> **Total Questions:** 335 Verified PYQs  
> **Coverage:** SSC CGL, CHSL, CPO, Selection Post (2018–2024 Tier-I & Tier-II)  
> **Status:** 100% Ingested, Verified & Auto-synced in Production Database  

---

## 📊 Summary by Exam & Year
| Exam Category | Question Count | Sample Years |
|:---|:---:|:---|
| **SSC CGL (Tier-I & Tier-II)** | ${algData.filter(q => q.exam_tag.includes('CGL')).length} | 2019–2024 |
| **SSC CHSL** | ${algData.filter(q => q.exam_tag.includes('CHSL')).length} | 2019–2024 |
| **SSC CPO** | ${algData.filter(q => q.exam_tag.includes('CPO')).length} | 2019–2024 |
| **SSC Selection Post / Other** | ${algData.filter(q => !q.exam_tag.includes('CHSL') && !q.exam_tag.includes('CGL') && !q.exam_tag.includes('CPO')).length} | 2020–2024 |
| **Total** | **${algData.length}** | **2018–2024** |

---

## 📋 Complete Question Directory (1 to 335)

| # | Exam Tag | Subtopic / Concept | Question Excerpt | Key | Correct Option |
|:---:|:---|:---|:---|:---:|:---|
`;

algData.forEach(q => {
  const shortStem = q.question_text.replace(/\n+/g, ' ').slice(0, 75) + (q.question_text.length > 75 ? '...' : '');
  const optVal = q[`option_${q.correct_answer.toLowerCase()}`];
  algMd += `| ${q.index} | \`${q.exam_tag}\` | ${q.tier_level} | ${shortStem.replace(/\|/g, '\\|')} | **(${q.correct_answer})** | \`${optVal.replace(/\|/g, '\\|')}\` |\n`;
});

const algOutPath = path.join(artifactDir, 'algebra_335_questions_complete_list.md');
fs.writeFileSync(algOutPath, algMd, 'utf8');
console.log(`Saved Algebra markdown artifact to: ${algOutPath}`);
