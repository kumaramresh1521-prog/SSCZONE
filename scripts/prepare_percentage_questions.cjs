const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795093425678_6bfd1f50.html';
const content = fs.readFileSync(filePath, 'utf8');

const qMatch = content.indexOf('const QUESTIONS = [');
const endMatch = content.indexOf('];', qMatch);

const arrayCode = content.slice(qMatch, endMatch + 2).replace('const QUESTIONS =', 'global.QUESTIONS =');
const sandbox = { global: {} };
vm.createContext(sandbox);
vm.runInContext(arrayCode, sandbox);

const rawQuestions = sandbox.global.QUESTIONS;
console.log(`Loaded ${rawQuestions.length} raw questions.`);

// Reconstructed Q238 (Official SSC CGL 11/04/2022 Shift-03)
rawQuestions[237] = {
  id: 238,
  exam: "SSC CGL 11/04/2022 (Shift-03)",
  examGroup: "CGL",
  topic: "Price & Consumption",
  text: "The reduction of 15% in the price of salt enables a person to buy 2 kg more for ₹272. The reduced price of salt per kg (in ₹) is:",
  options: {
    a: "22.16",
    b: "24.25",
    c: "20.40",
    d: "25.00"
  },
  ans: "c",
  given: "• Reduction in price = 15%\n• Total expenditure = ₹272\n• Extra quantity obtained = 2 kg",
  concept: "Reduced Price Formula:\nSavings = Expenditure × Reduction% = 272 × (15/100) = ₹40.80.\nThis saving allows buying the extra 2 kg at the reduced price:\nReduced Price per kg = Total Savings / Extra Quantity = 40.80 / 2 = ₹20.40.",
  steps: "Step 1: Calculate total savings on ₹272 due to 15% reduction.\nSavings = 272 × (15 / 100) = 4,080 / 100 = ₹40.80\n\nStep 2: Relate savings to the extra 2 kg bought.\nThe ₹40.80 saved pays for exactly 2 kg of salt at the current (reduced) rate.\n\nStep 3: Calculate the reduced price per kg.\nReduced Price = 40.80 / 2 = ₹20.40 per kg",
  smart: "Direct Smart Formula: Reduced Price = (Expenditure × % Reduction) / (100 × Extra kg) = (272 × 15) / (100 × 2) = 4080 / 200 = ₹20.40/kg.",
  answerText: "(c) 20.40"
};

// Reconstructed Q244 (Official SSC CGL 13/08/2021 Shift-01)
rawQuestions[243] = {
  id: 244,
  exam: "SSC CGL 13/08/2021 (Shift-01)",
  examGroup: "CGL",
  topic: "Numbers & Ratios",
  text: "A invested 30% more than B. B invested 40% less than C, who invested ₹8,000. The average of the total amount invested by all of them together (to the nearest ₹) is:",
  options: {
    a: "6,347",
    b: "6,417",
    c: "6,215",
    d: "6,143"
  },
  ans: "a",
  given: "• C's investment = ₹8,000\n• B invested 40% less than C ⇒ B = 60% of C\n• A invested 30% more than B ⇒ A = 130% of B\n• Target: Average of total investment (A + B + C) / 3",
  concept: "Step-by-step ratio / percentage tracking:\n1. B = 8000 × (1 - 0.40) = ₹4,800\n2. A = 4800 × (1 + 0.30) = ₹6,240\n3. Total = A + B + C = 6,240 + 4,800 + 8,000 = ₹19,040\n4. Average = 19,040 / 3 ≈ ₹6,346.67 ≈ ₹6,347",
  steps: "Step 1: Calculate B's investment.\nB = 8,000 × (60 / 100) = ₹4,800\n\nStep 2: Calculate A's investment.\nA = 4,800 × (130 / 100) = 48 × 130 = ₹6,240\n\nStep 3: Calculate total investment.\nTotal = 6,240 + 4,800 + 8,000 = ₹19,040\n\nStep 4: Compute average of all three investments.\nAverage = 19,040 / 3 = 6,346.666... ≈ ₹6,347 (rounded to nearest rupee)",
  smart: "Let C = 100. Then B = 60, A = 60 × 1.3 = 78. Total = 78 + 60 + 100 = 238 units. Since 100 units = ₹8,000 ⇒ 1 unit = ₹80. Average = (238 × 80) / 3 = 19,040 / 3 ≈ ₹6,347.",
  answerText: "(a) 6,347"
};

// Now format each question for database insertion
const formattedQuestions = rawQuestions.map((q, idx) => {
  const qNum = idx + 1;
  const optA = String(q.options.a).trim();
  const optB = String(q.options.b).trim();
  const optC = String(q.options.c).trim();
  const optD = String(q.options.d).trim();
  const correctAns = q.ans.trim().toUpperCase();

  // Extract year reference from exam tag
  const yearMatch = q.exam.match(/\b(19\d{2}|20\d{2})\b/);
  const yearReference = yearMatch ? yearMatch[1] : null;

  // Build clean, well-structured explanation
  const explanationParts = [];
  if (q.given && q.given.trim()) {
    explanationParts.push(`📌 **Given:**\n${q.given.trim()}`);
  }
  if (q.concept && q.concept.trim()) {
    explanationParts.push(`💡 **Concept & Formula:**\n${q.concept.trim()}`);
  }
  if (q.steps && q.steps.trim()) {
    explanationParts.push(`📝 **Step-by-Step Solution:**\n${q.steps.trim()}`);
  }
  if (q.smart && q.smart.trim()) {
    explanationParts.push(`⚡ **Smart / Shortcut Approach:**\n${q.smart.trim()}`);
  }
  explanationParts.push(`✅ **Correct Answer:** Option (${correctAns}) ${q.answerText || ''}`.trim());

  const fullExplanation = explanationParts.join('\n\n');

  return {
    index: qNum,
    original_id: q.id,
    topic_id: 189, // SSC CGL Percentage (Master Topic)
    question_text: q.text.trim(),
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correctAns,
    explanation: fullExplanation,
    difficulty: "medium",
    exam_tag: q.exam.trim(),
    tier_level: q.topic.trim(),
    year_reference: yearReference,
    is_active: true
  };
});

console.log(`Formatted ${formattedQuestions.length} questions successfully.`);

// Save clean JSON file for backup & reproducibility
const outputPath = path.join(__dirname, 'percentage_questions_clean.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedQuestions, null, 2), 'utf8');
console.log(`Saved clean questions to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB).`);

// Verify first 2 and last 2
console.log('\n--- SAMPLE 1 (Q1) ---');
console.log(JSON.stringify(formattedQuestions[0], null, 2));

console.log('\n--- SAMPLE 238 ---');
console.log(JSON.stringify(formattedQuestions[237], null, 2));

console.log('\n--- SAMPLE 244 ---');
console.log(JSON.stringify(formattedQuestions[243], null, 2));

console.log('\n--- SAMPLE 287 (Last) ---');
console.log(JSON.stringify(formattedQuestions[286], null, 2));
