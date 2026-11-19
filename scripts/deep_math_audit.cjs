const fs = require('fs');
const vm = require('vm');

const filePath = 'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795103486547_a540221b.html';
const content = fs.readFileSync(filePath, 'utf8');

const qMatch = content.indexOf('const QUESTIONS = [');
const endMatch = content.indexOf('];', qMatch);

const arrayCode = content.slice(qMatch, endMatch + 2).replace('const QUESTIONS =', 'global.QUESTIONS =');
const sandbox = { global: {} };
vm.createContext(sandbox);
vm.runInContext(arrayCode, sandbox);

const rawQuestions = sandbox.global.QUESTIONS;
const letterMap = ['A', 'B', 'C', 'D'];

const flagged = [];

rawQuestions.forEach((q, idx) => {
  const chosenOpt = String(q.options[q.ans]).trim();
  const lastStep = q.steps[q.steps.length - 1];
  const allSteps = q.steps.join(' ');
  
  // Clean option for comparison (e.g. remove ₹, %, commas, spaces)
  const cleanOpt = chosenOpt.replace(/[₹%,]/g, '').trim();
  
  // Check if cleanOpt or chosenOpt is present in the steps
  // If cleanOpt is a fraction or complex string, check parts
  const isPresent = allSteps.includes(cleanOpt) || allSteps.includes(chosenOpt);
  
  if (!isPresent) {
    flagged.push({
      id: q.id,
      exam: q.exam,
      ansLetter: letterMap[q.ans],
      chosenOpt,
      lastStep: lastStep.slice(0, 120),
      smart: q.smart ? q.smart.slice(0, 120) : ''
    });
  }
});

console.log(`Flagged ${flagged.length} questions where option text wasn't a verbatim substring of steps:`);
flagged.forEach(f => {
  console.log(`Q${f.id} (${f.exam}) Ans: ${f.ansLetter} [${f.chosenOpt}] -> LastStep: "${f.lastStep}"`);
});
