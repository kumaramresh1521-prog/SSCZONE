const fs = require('fs');

function parseQuestionsText(text) {
  if (!text || !text.trim()) return [];
  if (text.trim().startsWith("[")) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map((item, idx) => ({
          question_number: item.question_number || idx + 1,
          question_text: item.question_text || item.question || '',
          option_a: item.option_a || item.optionA || item.a || '',
          option_b: item.option_b || item.optionB || item.b || '',
          option_c: item.option_c || item.optionC || item.c || '',
          option_d: item.option_d || item.optionD || item.d || '',
          correct_answer: (item.correct_answer || item.answer || 'A').toUpperCase().trim().slice(0, 1),
          explanation: item.explanation || ''
        }));
      }
    } catch {}
  }

  // Regex split on Q<num>. or <num>.
  const qBlocks = text.split(/(?:^|\n)(?:Q\s*(\d+)[\.\:]|(\d+)[\.\:])\s*/i);
  const questions = [];

  if (qBlocks.length > 1) {
    for (let i = 1; i < qBlocks.length; i += 3) {
      const qNumStr = qBlocks[i] || qBlocks[i + 1] || `${questions.length + 1}`;
      const qNum = parseInt(qNumStr) || (questions.length + 1);
      const block = qBlocks[i + 2] || '';

      const optA = block.match(/(?:^|\n)\s*(?:\(?[A|a]\)?|\(?[A|a]\.|\(?[A|a]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[B-Db-d]\)?|\(?[B-Db-d]\.|\(?[B-Db-d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || '';
      const optB = block.match(/(?:^|\n)\s*(?:\(?[B|b]\)?|\(?[B|b]\.|\(?[B|b]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[C-Dc-d]\)?|\(?[C-Dc-d]\.|\(?[C-Dc-d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || '';
      const optC = block.match(/(?:^|\n)\s*(?:\(?[C|c]\)?|\(?[C|c]\.|\(?[C|c]\))\s*([\s\S]*?)(?=(?:\n\s*(?:\(?[D|d]\)?|\(?[D|d]\.|\(?[D|d]\))|\n\s*Correct Answer|\n\s*Ans|\n*$))/i)?.[1]?.trim() || '';
      const optD = block.match(/(?:^|\n)\s*(?:\(?[D|d]\)?|\(?[D|d]\.|\(?[D|d]\))\s*([\s\S]*?)(?=(?:\n\s*Correct Answer|\n\s*Ans|\n\s*Explanation|\n\s*---|\n*$))/i)?.[1]?.trim() || '';

      const qTextMatch = block.split(/(?:^|\n)\s*(?:\(?[A|a]\)?|\(?[A|a]\.|\(?[A|a]\))\s*/i)[0];
      const qText = qTextMatch ? qTextMatch.trim() : '';

      const ansMatch = block.match(/(?:Correct Answer|Ans(?:wer)?)\s*[:\-]\s*(?:Option\s*)?\(?([A-D|a-d])\)?/i);
      const ansRaw = ansMatch ? ansMatch[1].toUpperCase() : 'A';
      const correctAns = ['A', 'B', 'C', 'D'].includes(ansRaw) ? ansRaw : 'A';

      const expMatch = block.match(/(?:Explanation|Solution)\s*[:\-]\s*([\s\S]*?)(?=(?:\n\s*---|(?:\n\s*(?:Q\s*\d+|\d+)[\.\:])|$))/i);
      const explanation = expMatch ? expMatch[1].trim() : '';

      questions.push({
        question_number: qNum,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_answer: correctAns,
        explanation
      });
    }
  }
  return questions;
}

// Test against one of the clean files
const testFile = 'C:\\ssczone\\src\\data\\pyq_backup\\ssc-cgl-2025-tier-i-held-on-16-september-2025-shift-1.txt';
if (fs.existsSync(testFile)) {
  const content = fs.readFileSync(testFile, 'utf8');
  const parsed = parseQuestionsText(content);
  console.log(`PARSED QUESTIONS: ${parsed.length}`);
  console.log('FIRST QUESTION:', parsed[0]);
  console.log('LAST QUESTION:', parsed[parsed.length - 1]);
} else {
  console.log('File not found, testing string');
}
