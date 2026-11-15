const fs = require('fs');

// Read MathText.tsx and extract formatRawMathText and renderMath
const mathTextCode = fs.readFileSync('src/components/MathText.tsx', 'utf-8');

// Let's test how MathText processes 2023 Paper 110 questions
const p110 = JSON.parse(fs.readFileSync('src/data/pyq_backup/ssc-cgl-2023-20-july-2023-shift-1.json', 'utf-8'));

// Let's transpile and run MathText
const ts = require('typescript');
const compiled = ts.transpile(mathTextCode, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS });

// Mock katex
const m = { exports: {} };
const fn = new Function('module', 'exports', 'require', compiled);
const katexMock = {
  renderToString: (str) => `<span class="katex">${str}</span>`
};
fn(m, m.exports, (mod) => {
  if (mod === 'katex') return katexMock;
  if (mod === '@/lib/utils') return { resolveAssetUrl: (s) => s };
  return {};
});

// Let's test renderMath or formatRawMathText
console.log('MathText exports:', Object.keys(m.exports));

// Let's inspect first 10 questions
for (let i = 0; i < 10; i++) {
  const q = p110[i];
  const txt = q.question_text;
  // Let's see if there are still multiple blocks or breaks
  console.log(`--- Q.${q.question_number} ---`);
  console.log('Original:');
  console.log(JSON.stringify(txt));
}
