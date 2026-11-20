const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rmobqopitkjobcnyqzru.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseBracketArray(content, varName) {
  const marker = varName + ' = [';
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) throw new Error('Marker not found: ' + marker);
  const pos = startIdx + (varName + ' = ').length;
  let depth = 0, inString = false, stringChar = '', inComment = false, endPos = -1;
  for (let i = pos; i < content.length; i++) {
    const c = content[i];
    if (!inString && !inComment) {
      if (c === '/' && content[i + 1] === '/') { inComment = 'line'; i++; }
      else if (c === '/' && content[i + 1] === '*') { inComment = 'block'; i++; }
      else if (c === '"' || c === '\'' || c === '`') { inString = true; stringChar = c; }
      else if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { endPos = i + 1; break; } }
    } else if (inComment === 'line') { if (c === '\n') inComment = false; }
    else if (inComment === 'block') { if (c === '*' && content[i + 1] === '/') { inComment = false; i++; } }
    else if (inString) { if (c === '\\') i++; else if (c === stringChar) inString = false; }
  }
  const arrayStr = content.slice(pos, endPos);
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext('var DATA = ' + arrayStr + ';', sandbox);
  return sandbox.DATA;
}

function cleanText(t) {
  if (!t) return '';
  return String(t)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanOption(opt) {
  let s = cleanText(opt);
  s = s.replace(/^\([A-Da-d1-4]\)\s*/, '');
  s = s.replace(/^[A-Da-d1-4][\.\)]\s*/, '');
  return s.trim();
}

function normalizeStem(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractYear(text) {
  if (!text) return null;
  const m = String(text).match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function cleanExamTag(rawTag) {
  if (!rawTag) return { tag: 'SSC Exam PYQ', year: null };
  let str = cleanText(rawTag);

  // Remove (High-Yield)
  str = str.replace(/\s*\([Hh]igh-[Yy]ield\)/gi, '').trim();

  // If already generic
  if (str === 'SSC Exam PYQ' || str === 'SSC PYQ' || str === 'SSC') {
    return { tag: 'SSC Exam PYQ', year: null };
  }

  // Check if it's SSC Selection post without prefix
  if (/^(Matric Level|Higher Secondary|Graduate Level)/i.test(str)) {
    str = 'SSC Selection Post ' + str;
  }

  // If contains SSC
  if (/ssc/i.test(str)) {
    const yr = extractYear(str);
    return { tag: str, year: yr };
  }

  // If it's State PCS, Civil Services, or other non-SSC
  return { tag: 'SSC Exam PYQ', year: null };
}

const letters = ['A', 'B', 'C', 'D'];

const FILE0_CHAPTERS = {
  1: 'Measurement',
  2: 'Measurement',
  3: 'The Forces and Law of Motion',
  4: 'Gravitation',
  5: 'Mechanical Properties of Matter',
  6: 'Wave Optics'
};

const FILE1_CHAPTERS = {
  7: 'Heat and Thermodynamics',
  8: 'Oscillation, Wave and Sound',
  9: 'Oscillation, Wave and Sound',
  10: 'Electricity',
  11: 'Electricity'
};

const FILE2_TOPICS = {
  'Light and Optics': 'Wave Optics',
  'Heat and Thermodynamics': 'Heat and Thermodynamics',
  'Fluid Mechanics': 'Mechanical Properties of Matter',
  'Electric Current and Its Effects': 'Electricity',
  'Force and Pressure': 'The Forces and Law of Motion',
  'Sound': 'Oscillation, Wave and Sound',
  'Gravitation': 'Gravitation',
  'Work and Energy': 'Work, Energy and Power',
  'Waves': 'Oscillation, Wave and Sound',
  'Radioactivity': 'Atomic & Nuclear Physics',
  'Discoveries & Inventions': 'Measurement',
  'Units and Measurements': 'Measurement',
  'Miscellaneous': 'Measurement'
};

async function fetchDbStems() {
  const dbStems = new Set();
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('question_text')
      .eq('topic_id', 6)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const q of data) {
      dbStems.add(normalizeStem(q.question_text));
    }
    from += data.length;
    if (data.length < PAGE_SIZE) break;
  }
  return dbStems;
}

function buildExplanation(rawExpl, rawFacts, correctLetter, correctOptText) {
  let explText = cleanText(rawExpl);
  
  // Clean out any "high-yield" references
  explText = explText.replace(/high[- ]?yield/gi, 'key conceptual');

  // Clean out any "with errata notes)"
  explText = explText.replace(/\(with errata notes\)/gi, '');
  explText = explText.replace(/with errata notes\)/gi, '');
  explText = explText.replace(/with errata notes/gi, '');

  let factsList = [];
  if (Array.isArray(rawFacts)) {
    factsList = rawFacts.map(cleanText).filter(Boolean);
  } else if (typeof rawFacts === 'string') {
    factsList = rawFacts.split('|').map(cleanText).filter(Boolean);
  }

  // Clean facts
  factsList = factsList
    .map(f => f.replace(/high[- ]?yield/gi, 'core').replace(/\(with errata notes\)/gi, '').trim())
    .filter(Boolean);

  const sections = [];
  
  // Concept & Explanation
  sections.push(`💡 **Concept & Core Principle:**\n${explText}`);

  // Key Takeaways
  if (factsList.length > 0) {
    const bullets = factsList.map(f => `- ${f}`).join('\n');
    sections.push(`🎯 **Key Takeaways:**\n${bullets}`);
  }

  // Correct answer line
  sections.push(`✅ **Correct Answer:** Option (${correctLetter}) ${correctOptText}`);

  return sections.join('\n\n');
}

async function prepareAll() {
  console.log('Fetching DB stems to deduplicate...');
  const dbStems = await fetchDbStems();
  console.log(`Found ${dbStems.size} existing stems in Topic 6.`);

  const file0Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445695_2c7d71ed.html';
  const file1Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_4ae44a20.html';
  const file2Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_185d10f3.html';

  const q0 = parseBracketArray(fs.readFileSync(file0Path, 'utf8'), 'const QUESTIONS');
  const q1 = parseBracketArray(fs.readFileSync(file1Path, 'utf8'), 'const RAW_QS');
  const q2 = parseBracketArray(fs.readFileSync(file2Path, 'utf8'), 'const QUESTIONS');

  const seenStems = new Set();
  const processedQuestions = [];
  let skippedDbDups = 0;
  let skippedInternalDups = 0;

  // Process File 0: [ch, qnum, exam, stem, opts, ans, expl, facts]
  for (let i = 0; i < q0.length; i++) {
    const item = q0[i];
    const [chId, qNum, rawExam, rawStem, rawOpts, ansIdx, rawExpl, rawFacts] = item;
    const stem = cleanText(rawStem);
    const norm = normalizeStem(stem);

    if (dbStems.has(norm)) {
      skippedDbDups++;
      continue;
    }
    if (seenStems.has(norm)) {
      skippedInternalDups++;
      continue;
    }
    seenStems.add(norm);

    const opts = rawOpts.map(cleanOption);
    const correctLetter = letters[ansIdx];
    const correctOptText = opts[ansIdx];
    const { tag, year } = cleanExamTag(rawExam);
    const chapterName = FILE0_CHAPTERS[chId] || 'Measurement';
    const explanation = buildExplanation(rawExpl, rawFacts, correctLetter, correctOptText);

    let difficulty = 'medium';
    if (stem.length > 150 || (rawFacts && rawFacts.length >= 3)) difficulty = 'hard';
    else if (stem.length < 75) difficulty = 'easy';

    processedQuestions.push({
      topic_id: 6,
      question_text: stem,
      option_a: opts[0],
      option_b: opts[1],
      option_c: opts[2],
      option_d: opts[3],
      correct_answer: correctLetter,
      explanation,
      difficulty,
      exam_tag: tag,
      year_reference: year,
      tier_level: chapterName,
      is_active: true
    });
  }

  // Process File 1: [ch, qnum, exam, stem, opts, ans, expl, facts]
  for (let i = 0; i < q1.length; i++) {
    const item = q1[i];
    const [chId, qNum, rawExam, rawStem, rawOpts, ansIdx, rawExpl, rawFacts] = item;
    const stem = cleanText(rawStem);
    const norm = normalizeStem(stem);

    if (dbStems.has(norm)) {
      skippedDbDups++;
      continue;
    }
    if (seenStems.has(norm)) {
      skippedInternalDups++;
      continue;
    }
    seenStems.add(norm);

    const opts = rawOpts.map(cleanOption);
    const correctLetter = letters[ansIdx];
    const correctOptText = opts[ansIdx];
    const { tag, year } = cleanExamTag(rawExam);
    const chapterName = FILE1_CHAPTERS[chId] || 'Heat and Thermodynamics';
    const explanation = buildExplanation(rawExpl, rawFacts, correctLetter, correctOptText);

    let difficulty = 'medium';
    if (stem.length > 150) difficulty = 'hard';
    else if (stem.length < 75) difficulty = 'easy';

    processedQuestions.push({
      topic_id: 6,
      question_text: stem,
      option_a: opts[0],
      option_b: opts[1],
      option_c: opts[2],
      option_d: opts[3],
      correct_answer: correctLetter,
      explanation,
      difficulty,
      exam_tag: tag,
      year_reference: year,
      tier_level: chapterName,
      is_active: true
    });
  }

  // Process File 2: { id, topic, exam, question, options, answerIndex, explanation, facts }
  for (let i = 0; i < q2.length; i++) {
    const item = q2[i];
    const stem = cleanText(item.question);
    const norm = normalizeStem(stem);

    if (dbStems.has(norm)) {
      skippedDbDups++;
      continue;
    }
    if (seenStems.has(norm)) {
      skippedInternalDups++;
      continue;
    }
    seenStems.add(norm);

    const opts = item.options.map(cleanOption);
    const correctLetter = letters[item.answerIndex];
    const correctOptText = opts[item.answerIndex];
    const { tag, year } = cleanExamTag(item.exam);
    const chapterName = FILE2_TOPICS[item.topic] || 'Measurement';
    const explanation = buildExplanation(item.explanation, item.facts, correctLetter, correctOptText);

    let difficulty = 'medium';
    if (tag.toLowerCase().includes('cgl') && (item.explanation.length > 250 || stem.length > 120)) {
      difficulty = 'hard';
    } else if (tag.toLowerCase().includes('mts') || stem.length < 75) {
      difficulty = 'easy';
    }

    processedQuestions.push({
      topic_id: 6,
      question_text: stem,
      option_a: opts[0],
      option_b: opts[1],
      option_c: opts[2],
      option_d: opts[3],
      correct_answer: correctLetter,
      explanation,
      difficulty,
      exam_tag: tag,
      year_reference: year,
      tier_level: chapterName,
      is_active: true
    });
  }

  console.log('--- Summary of Processed Questions ---');
  console.log(`Skipped DB duplicates: ${skippedDbDups}`);
  console.log(`Skipped internal duplicates: ${skippedInternalDups}`);
  console.log(`Total new questions ready: ${processedQuestions.length}`);

  // Save to JSON file
  const outPath = path.join(__dirname, 'physics_new_batch_clean.json');
  fs.writeFileSync(outPath, JSON.stringify(processedQuestions, null, 2), 'utf8');
  console.log(`Saved cleanly to: ${outPath}`);
}

prepareAll().catch(console.error);
