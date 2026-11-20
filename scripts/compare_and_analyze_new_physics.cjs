const fs = require('fs');
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
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let endPos = -1;

  for (let i = pos; i < content.length; i++) {
    const c = content[i];
    if (!inString && !inComment) {
      if (c === '/' && content[i + 1] === '/') {
        inComment = 'line';
        i++;
      } else if (c === '/' && content[i + 1] === '*') {
        inComment = 'block';
        i++;
      } else if (c === '"' || c === '\'' || c === '`') {
        inString = true;
        stringChar = c;
      } else if (c === '[') {
        depth++;
      } else if (c === ']') {
        depth--;
        if (depth === 0) {
          endPos = i + 1;
          break;
        }
      }
    } else if (inComment === 'line') {
      if (c === '\n') inComment = false;
    } else if (inComment === 'block') {
      if (c === '*' && content[i + 1] === '/') {
        inComment = false;
        i++;
      }
    } else if (inString) {
      if (c === '\\') {
        i++;
      } else if (c === stringChar) {
        inString = false;
      }
    }
  }
  const arrayStr = content.slice(pos, endPos);
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext('var DATA = ' + arrayStr + ';', sandbox);
  return sandbox.DATA;
}

function normalizeStem(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchAllDbStems() {
  const allStems = new Map();
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text')
      .eq('topic_id', 6)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const q of data) {
      allStems.set(normalizeStem(q.question_text), q.id);
    }
    from += data.length;
    if (data.length < PAGE_SIZE) break;
  }
  return allStems;
}

async function run() {
  console.log('Fetching DB stems...');
  const dbStems = await fetchAllDbStems();
  console.log('Fetched DB stems count:', dbStems.size);

  const file0Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445695_2c7d71ed.html';
  const file1Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_4ae44a20.html';
  const file2Path = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795139445699_185d10f3.html';

  const q0 = parseBracketArray(fs.readFileSync(file0Path, 'utf8'), 'const QUESTIONS');
  const q1 = parseBracketArray(fs.readFileSync(file1Path, 'utf8'), 'const RAW_QS');
  const q2 = parseBracketArray(fs.readFileSync(file2Path, 'utf8'), 'const QUESTIONS');

  console.log(`Raw counts: File0=${q0.length}, File1=${q1.length}, File2=${q2.length}, Total=${q0.length + q1.length + q2.length}`);

  let dupWithDb = 0;
  let dupInternal = 0;
  let uniqueNew = 0;
  const seenStems = new Map();
  const dbDuplicates = [];

  function testQuestion(stem, source, item) {
    const norm = normalizeStem(stem);
    if (dbStems.has(norm)) {
      dupWithDb++;
      dbDuplicates.push({ source, stem: stem.slice(0, 60), dbId: dbStems.get(norm) });
      return false;
    }
    if (seenStems.has(norm)) {
      dupInternal++;
      return false;
    }
    seenStems.set(norm, source);
    uniqueNew++;
    return true;
  }

  let file0Unique = 0;
  for (const item of q0) {
    if (testQuestion(item[3], 'File0', item)) file0Unique++;
  }

  let file1Unique = 0;
  for (const item of q1) {
    if (testQuestion(item[3], 'File1', item)) file1Unique++;
  }

  let file2Unique = 0;
  for (const item of q2) {
    if (testQuestion(item.question, 'File2', item)) file2Unique++;
  }

  console.log('--- Comparison Results ---');
  console.log('Duplicates with existing DB questions:', dupWithDb);
  console.log('Duplicates internal among 3 files:', dupInternal);
  console.log('Unique new questions to insert:', uniqueNew);
  console.log(`Breakdown of new unique: File0: ${file0Unique}, File1: ${file1Unique}, File2: ${file2Unique}`);
  if (dbDuplicates.length > 0) {
    console.log('Sample duplicates with DB (first 5):', dbDuplicates.slice(0, 5));
  }
}

run().catch(console.error);
