const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function main() {
  const fileBuf = fs.readFileSync('F:\\startup  send mail\\2026\\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf');
  const uint8 = new Uint8Array(fileBuf);
  const parser = new PDFParse(uint8);
  const res = await parser.getText();
  const rawText = typeof res === 'string' ? res : res?.text || '';
  
  console.log('Total characters:', rawText.length);
  console.log('\n--- FIRST 2000 CHARACTERS ---');
  console.log(rawText.slice(0, 2000));

  // Find occurrences of "Answer", "Chosen", "Option", "Correct", etc.
  console.log('\n--- SAMPLE QUESTION BLOCK ---');
  const qMatches = rawText.match(/Q\.?\s*1[.)\s][\s\S]*?(?=Q\.?\s*2[.)\s]|$)/i);
  if (qMatches) {
    console.log(qMatches[0].slice(0, 800));
  } else {
    console.log('No Q1 match found, printing slice 500..1500:');
    console.log(rawText.slice(500, 1500));
  }
}

main().catch(err => console.error(err));
