const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CHAPTER_NAMES = {
  1: 'Measurement',
  2: 'Motion',
  3: 'The Forces and Law of Motion',
  4: 'Work, Energy and Power',
  5: 'Gravitation',
  6: 'Mechanical Properties of Matter',
  7: 'Oscillation, Wave and Sound',
  8: 'Heat and Thermodynamics',
  9: 'Wave Optics',
  10: 'Electricity',
  11: 'Magnetism',
  12: 'Photoelectric Effect',
  13: 'Atomic & Nuclear Physics',
  14: 'Electronics & Semiconductor Devices',
  15: 'Communication System'
};

function extractArray(content, varName) {
  const searchStr = `const ${varName} = [`;
  const startIdx = content.indexOf(searchStr);
  const arrStart = content.indexOf('[', startIdx);
  let depth = 0, inBacktick = false, inDouble = false, inSingle = false, escape = false, endIdx = -1;
  for (let i = arrStart; i < content.length; i++) {
    const ch = content[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '`' && !inDouble && !inSingle) { inBacktick = !inBacktick; continue; }
    if (ch === '"' && !inBacktick && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === "'" && !inBacktick && !inDouble) { inSingle = !inSingle; continue; }
    if (!inBacktick && !inDouble && !inSingle) {
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
  }
  const arrayCode = `globalThis.TARGET_DATA = ` + content.substring(arrStart, endIdx + 1);
  const sandbox = { globalThis: {} };
  vm.createContext(sandbox);
  vm.runInContext(arrayCode, sandbox);
  return sandbox.globalThis.TARGET_DATA;
}

function cleanOptionText(opt) {
  if (!opt) return '';
  return String(opt)
    .trim()
    .replace(/^\([a-dA-D1-4]\)\s*/, '')
    .replace(/^[a-dA-D1-4][\.\)]\s*/, '')
    .trim();
}

function extractYear(text) {
  if (!text) return null;
  const m = String(text).match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1], 10) : null;
}

const letters = ['A', 'B', 'C', 'D'];

// Read raw files
const f1Raw = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965189_ecac2af2.html', 'utf8'), 'QUESTIONS');
const f2Raw = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965191_67cf3cec.html', 'utf8'), 'QUESTIONS');
const f3Raw = extractArray(fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795136965190_1584a310.html', 'utf8'), 'QUESTIONS_DATA');

console.log(`Raw counts: File 1=${f1Raw.length}, File 2=${f2Raw.length}, File 3=${f3Raw.length}`);

const allQuestions = [];

// ================= PROCESS FILE 1 (Chapters 1 to 5) =================
f1Raw.forEach((q, idx) => {
  const chNum = q.c;
  const chName = CHAPTER_NAMES[chNum] || `Chapter ${chNum}`;
  const ansIdx = q.a;
  const correctLetter = letters[ansIdx];

  const opts = q.o.map(cleanOptionText);
  const correctOptText = opts[ansIdx];

  const examTag = q.tag ? q.tag.trim() : 'SSC Exam PYQ (High-Yield)';
  const yearRef = extractYear(q.tag);

  // Explanation construction
  const expSections = [];
  
  // Concept / Main explanation
  if (q.e && q.e.trim()) {
    expSections.push(`💡 **Concept & Core Principle:**\n${q.e.trim()}`);
  }

  // High-Yield takeaways
  if (Array.isArray(q.hy) && q.hy.length > 0) {
    const bullets = q.hy.map(b => `- ${String(b).trim()}`).join('\n');
    expSections.push(`🎯 **High-Yield Exam Takeaway:**\n${bullets}`);
  }

  expSections.push(`✅ **Correct Answer:** Option (${correctLetter}) ${correctOptText}`);
  const explanation = expSections.join('\n\n');

  let difficulty = 'medium';
  if ((examTag.toLowerCase().includes('cgl') && examTag.toLowerCase().includes('tier-ii')) || (q.hy && q.hy.length >= 3)) {
    difficulty = 'hard';
  } else if (!q.tag || (q.hy && q.hy.length <= 1 && q.q.length < 90)) {
    difficulty = 'easy';
  }

  allQuestions.push({
    source_file: 'ch1_5',
    chapter_num: chNum,
    tier_level: chName,
    question_text: q.q.trim(),
    option_a: opts[0],
    option_b: opts[1],
    option_c: opts[2],
    option_d: opts[3],
    correct_answer: correctLetter,
    explanation,
    exam_tag: examTag,
    year_reference: yearRef,
    difficulty,
    is_active: true
  });
});

// ================= PROCESS FILE 2 (Chapters 6 to 10) =================
f2Raw.forEach((q, idx) => {
  const chNum = q.c;
  const chName = CHAPTER_NAMES[chNum] || `Chapter ${chNum}`;
  const ansIdx = q.a;
  const correctLetter = letters[ansIdx];

  const opts = q.o.map(cleanOptionText);
  const correctOptText = opts[ansIdx];

  // Check for specific exam tag inside stem, explanation, p, or v
  const textBlob = `${q.q} ${q.p || ''} ${q.v || ''} ${q.e || ''}`;
  const examMatch = textBlob.match(/\b(SSC\s*(?:CGL|CHSL|CPO|MTS|Tier[-\s]?[I|II|1|2]*|\(\d+\+\d+\))?\s*\d{4}|NDA\s*\d{4}|CDS\s*\d{4}|RRB\s*(?:NTPC|JE|Group[-\s]?D)?\s*\d{4}|UPSC\s*\d{4}|UPPSC\s*\d{4}|BPSC\s*\d{4})\b/i);
  
  const examTag = examMatch ? examMatch[0].trim() : 'SSC Exam PYQ (High-Yield)';
  const yearRef = extractYear(examTag);

  // Explanation construction
  const expSections = [];

  // Core concept heading and formula
  if (q.k || q.f) {
    const conceptLine = [q.k ? `**${q.k.trim()}**` : '', q.f ? q.f.trim() : ''].filter(Boolean).join(' — ');
    if (conceptLine) {
      expSections.push(`💡 **Concept & Core Principle:**\n${conceptLine}`);
    }
  }

  // Detailed scientific explanation
  if (q.e && q.e.trim()) {
    expSections.push(`📝 **Detailed Scientific Explanation:**\n${q.e.trim()}`);
  }

  // Exam angle / takeaway
  if (q.p && q.p.trim()) {
    expSections.push(`🎯 **High-Yield Exam Takeaway:**\n${q.p.trim()}`);
  }

  expSections.push(`✅ **Correct Answer:** Option (${correctLetter}) ${correctOptText}`);
  const explanation = expSections.join('\n\n');

  let difficulty = 'medium';
  if (q.q.length > 200 || (q.f && q.f.includes('=')) || (q.p && q.p.toLowerCase().includes('trap'))) {
    difficulty = 'hard';
  } else if (q.q.length < 80 && !q.f) {
    difficulty = 'easy';
  }

  allQuestions.push({
    source_file: 'ch6_10',
    chapter_num: chNum,
    tier_level: chName,
    question_text: q.q.trim(),
    option_a: opts[0],
    option_b: opts[1],
    option_c: opts[2],
    option_d: opts[3],
    correct_answer: correctLetter,
    explanation,
    exam_tag: examTag,
    year_reference: yearRef,
    difficulty,
    is_active: true
  });
});

// ================= PROCESS FILE 3 (Chapters 11 to 15) =================
f3Raw.forEach((q, idx) => {
  const chNum = q.chapter;
  const chName = CHAPTER_NAMES[chNum] || `Chapter ${chNum}`;
  const ansIdx = q.ans;
  const correctLetter = letters[ansIdx];

  const opts = q.options.map(cleanOptionText);
  const correctOptText = opts[ansIdx];

  const examTag = q.exam ? q.exam.trim() : 'SSC Exam PYQ (High-Yield)';
  const yearRef = extractYear(q.exam);

  // Explanation construction
  const expSections = [];

  // Detailed explanation
  if (q.exp && q.exp.trim()) {
    expSections.push(`📝 **Detailed Scientific Explanation:**\n${q.exp.trim()}`);
  }

  // High-Yield bullets
  if (Array.isArray(q.bullets) && q.bullets.length > 0) {
    const bulletList = q.bullets.map(b => `- ${String(b).trim()}`).join('\n');
    expSections.push(`🎯 **High-Yield Exam Takeaway:**\n${bulletList}`);
  }

  expSections.push(`✅ **Correct Answer:** Option (${correctLetter}) ${correctOptText}`);
  const explanation = expSections.join('\n\n');

  let difficulty = 'medium';
  if (examTag.toLowerCase().includes('nda') || examTag.toLowerCase().includes('cds') || (q.bullets && q.bullets.length >= 3)) {
    difficulty = 'hard';
  } else if (examTag.toLowerCase().includes('conceptual') || (q.bullets && q.bullets.length <= 1)) {
    difficulty = 'easy';
  }

  allQuestions.push({
    source_file: 'ch11_15',
    chapter_num: chNum,
    tier_level: chName,
    question_text: q.q.trim(),
    option_a: opts[0],
    option_b: opts[1],
    option_c: opts[2],
    option_d: opts[3],
    correct_answer: correctLetter,
    explanation,
    exam_tag: examTag,
    year_reference: yearRef,
    difficulty,
    is_active: true
  });
});

console.log(`\nTotal unified questions: ${allQuestions.length}`);

// Write clean questions JSON
const outPath = path.join(__dirname, 'physics_questions_clean.json');
fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`Saved clean questions to ${outPath}`);
