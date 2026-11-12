const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractPdfQuestions(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse(new Uint8Array(buf));
  const res = await parser.getText();
  const text = typeof res === 'string' ? res : res?.text || '';

  // Look for patterns like:
  // 01. ...
  // Ans: B
  const qBlocks = text.split(/\n(?=\s*\d{1,3}\.\s+[A-Za-z])/);
  console.log(`Found blocks: ${qBlocks.length}`);

  const results = [];
  qBlocks.forEach(b => {
    const numMatch = b.match(/^\s*(\d{1,3})\.\s+([\s\S]*?)(?=\n\s*\([A-D]\))/);
    const ansMatch = b.match(/Ans\s*[:\-]?\s*([A-D])/i);
    if (numMatch && ansMatch) {
      const qNum = parseInt(numMatch[1]);
      const ans = ansMatch[1].toUpperCase();
      results.push({ qNum, ans, preview: numMatch[2].replace(/\n/g, ' ').slice(0, 50) });
    }
  });

  console.log(`Parsed questions with Ans: ${results.length}`);
  return results;
}

async function main() {
  const pdfQuestions = await extractPdfQuestions('F:\\startup  send mail\\2026\\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf');
  console.log('Sample parsed PDF Qs 1-15:');
  console.log(pdfQuestions.slice(0, 15));
  console.log('Sample parsed PDF Qs 15-30:');
  console.log(pdfQuestions.slice(14, 30));

  // Check how many have Ans: A, B, C, D
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  pdfQuestions.forEach(q => dist[q.ans]++);
  console.log('Distribution in PDF:', dist);
}

main().catch(console.error);
