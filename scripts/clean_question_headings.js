const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rmobqopitkjobcnyqzru.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing Supabase API key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseQuestionHeading(rawText) {
  if (!rawText) return { instruction: null, mainText: rawText };
  const text = rawText.trim();

  // 1. "Select the most appropriate synonym/antonym of the word 'XYZ'."
  let m = text.match(/^Select the most appropriate (synonym|antonym) of the word ["“']?([^"”'\.]+)["”']?\s*\.?$/i);
  if (m) {
    const type = m[1].toLowerCase() === 'synonym' ? 'Synonym' : 'Antonym';
    return {
      instruction: `Select the most appropriate ${type}`,
      mainText: `Word: "${m[2].trim()}"`
    };
  }

  // 2. "Select the most appropriate synonym/antonym of 'XYZ' in the following sentence: ..."
  m = text.match(/^Select the most appropriate (synonym|antonym) of ([\s\S]+?)\s*:\s*([\s\S]+)$/i);
  if (m) {
    const type = m[1].toLowerCase() === 'synonym' ? 'Synonym' : 'Antonym';
    return {
      instruction: `Select the most appropriate ${type} of ${m[2].trim()}`,
      mainText: m[3].trim()
    };
  }

  // 3. Active / Passive Voice
  m = text.match(/^(?:Select the correct active\/passive voice form of the given sentence|Select the correct active\/passive form of the given sentence|Change into active\/passive voice)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Active / Passive Voice',
      mainText: m[1].trim()
    };
  }

  // 4. Direct / Indirect Narration
  m = text.match(/^(?:Select the correct direct\/indirect form of the given sentence|Select the correct direct\/indirect form)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Direct / Indirect Narration',
      mainText: m[1].trim()
    };
  }

  // 5. One-word substitution or Segment substitution
  m = text.match(/^(?:Select the option that can be used as a one-word substitute for the given phrase|Select the option that can substitute the underlined segment in the given sentence|Select the option that can substitute the bracketed segment)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Substitute phrase / segment',
      mainText: m[1].trim()
    };
  }

  // 6. Spelling Test
  if (/^Select the (?:correctly|INCORRECTLY) spelt word\.?$/i.test(text)) {
    const isIncorrect = /INCORRECTLY/i.test(text);
    return {
      instruction: isIncorrect ? 'Select the INCORRECTLY spelt word' : 'Select the CORRECTLY spelt word',
      mainText: isIncorrect ? 'Which of the following words is spelt incorrectly?' : 'Which of the following words is spelt correctly?'
    };
  }

  // 7. Idioms and Phrases
  m = text.match(/^Select the most appropriate meaning of (?:the underlined idiom in the given sentence|the given idiom)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Meaning of Idiom / Phrase',
      mainText: m[1].trim()
    };
  }

  // 8. Grammatical Error Identification
  m = text.match(/^(?:The following sentence has been split into four segments|Parts of the following sentence have been given as options|Identify the segment in the sentence which contains a grammatical error)\s*\.?\s*(?:Identify the segment that contains a grammatical error|Select the option that contains an error)?\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Identify Grammatical Error',
      mainText: m[1].trim()
    };
  }

  // 9. Fill in the blank / Homophones
  m = text.match(/^(?:Select the most appropriate option to fill in the blank|Select the most appropriate homophone to fill in the blank)\s*[:\.]?\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Fill in the blank',
      mainText: m[1].trim()
    };
  }

  // 10. Cloze Test
  m = text.match(/^Read the following passage and select the most appropriate option to fill in blank No\.?\s*\(?(\d+)\)?\s*:\s*(?:Passage\s*:\s*)?([\s\S]+)$/i);
  if (m) {
    return {
      instruction: `Cloze Test (Blank No. ${m[1]})`,
      mainText: m[2].trim()
    };
  }

  // 11. Sentence Rearrangement
  m = text.match(/^Sentences of a paragraph are given below in jumbled order\.?\s*Select the option that gives their correct order\s*:\s*([\s\S]*)$/i);
  if (m) {
    return {
      instruction: 'Sentence Rearrangement (Para Jumble)',
      mainText: m[1].trim() || 'Select the correct order of the jumbled sentences:'
    };
  }

  // Generic Pattern
  m = text.match(/^(Select the [^:]+:|Identify the [^:]+:|In the following [^:]+:)\s*([\s\S]+)$/i);
  if (m && m[2].trim().length > 0) {
    return {
      instruction: m[1].replace(/:$/, '').trim(),
      mainText: m[2].trim()
    };
  }

  return { instruction: null, mainText: text };
}

async function auditAndClean() {
  console.log("Starting Question Heading Audit...");

  let page = 0;
  const pageSize = 500;
  let totalProcessed = 0;
  let totalModified = 0;

  while (true) {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, exam_tag')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching questions:", error);
      break;
    }

    if (!questions || questions.length === 0) break;

    totalProcessed += questions.length;

    for (const q of questions) {
      const parsed = parseQuestionHeading(q.question_text);
      if (parsed.instruction) {
        totalModified++;
        if (totalModified <= 10) {
          console.log(`[ID ${q.id}] Cleaned instruction: "${parsed.instruction}" | Text: "${parsed.mainText.slice(0, 80)}"`);
        }
      }
    }

    page++;
  }

  console.log(`\nAudit Complete! Total Scanned: ${totalProcessed} | Headings Audited: ${totalModified}`);
}

auditAndClean();
