const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('scripts/physics_questions_clean.json', 'utf8'));

function cleanExamTag(rawTag) {
  if (!rawTag) return 'SSC Exam PYQ';
  let tag = String(rawTag).trim();

  // Remove (High-Yield)
  tag = tag.replace(/\s*\([Hh]igh-[Yy]ield\)/gi, '').trim();

  // If already generic
  if (tag === 'SSC Exam PYQ' || tag === 'SSC PYQ' || tag === 'SSC') {
    return 'SSC Exam PYQ';
  }

  // If contains SSC
  if (/ssc/i.test(tag)) {
    const sscWithYear = tag.match(/SSC\s*(?:\(10\+2\)|CGL|CHSL|CPO|MTS|Tier[-\s]?[I|II|1|2]*)?\s*(?:\d{4})/i);
    if (sscWithYear) {
      let sscTag = sscWithYear[0].trim();
      sscTag = sscTag.replace(/\(10\+2\)/i, 'CHSL');
      return sscTag;
    }
    const sscExamOnly = tag.match(/SSC\s*(?:\(10\+2\)|CGL|CHSL|CPO|MTS)/i);
    if (sscExamOnly) {
      let sscTag = sscExamOnly[0].trim().replace(/\(10\+2\)/i, 'CHSL');
      return sscTag;
    }
    return 'SSC Exam PYQ';
  }

  // Non-SSC exam (NDA, CDS, BPSC, WBCS, RRB, etc.)
  return 'SSC Exam PYQ';
}

function cleanExplanationText(exp) {
  if (!exp) return '';
  let res = exp;

  // Header replacement
  res = res.replace(/🎯\s*\*\*High-Yield\s+Exam\s+Takeaway:\*\*/gi, '🎯 **Key Takeaways:**');
  res = res.replace(/🎯\s*\*\*High-Yield\s+Takeaway:\*\*/gi, '🎯 **Key Takeaways:**');
  res = res.replace(/🎯\s*\*\*High-Yield\s+Points:\*\*/gi, '🎯 **Key Points:**');

  // Any inline high-yield
  res = res.replace(/\bhigh-yield\b/gi, 'key');
  res = res.replace(/\bhigh yield\b/gi, 'key');

  return res.trim();
}

const tagCounts = {};
let remainingHighYieldInExp = 0;
let remainingHighYieldInTags = 0;

qs.forEach(q => {
  const newTag = cleanExamTag(q.exam_tag);
  tagCounts[newTag] = (tagCounts[newTag] || 0) + 1;
  if (/high[-\s]?yield/i.test(newTag)) remainingHighYieldInTags++;

  const newExp = cleanExplanationText(q.explanation);
  if (/high[-\s]?yield/i.test(newExp)) remainingHighYieldInExp++;
});

console.log('Normalized Tags:');
console.log(JSON.stringify(tagCounts, null, 2));
console.log(`Remaining 'high-yield' in tags: ${remainingHighYieldInTags}`);
console.log(`Remaining 'high-yield' in explanations: ${remainingHighYieldInExp}`);
