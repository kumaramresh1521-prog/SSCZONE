const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

// Function to convert raw power patterns like x2 -> x², n3 -> n³, etc.
function cleanPowersAndSymbols(text) {
  if (!text) return '';
  let s = text;

  // Fix Pi as p
  s = s.replace(/\bThe number p is\b/g, 'The number π is');
  s = s.replace(/\bClearly, p is an irrational\b/g, 'Clearly, π is an irrational');

  // Fix square roots where radical was dropped
  s = s.replace(/\b2 is a\/an\b/g, '√2 is a/an');
  s = s.replace(/\bThe number 3 is\b/g, 'The number √3 is');

  // Fix exponents on numbers/variables
  s = s.replace(/\b232\s*\+\s*1\b/g, '2³² + 1');
  s = s.replace(/\b296\s*\+\s*1\b/g, '2⁹⁶ + 1');
  s = s.replace(/\b216\s*\+\s*1\b/g, '2¹⁶ + 1');
  s = s.replace(/\b216\s*–\s*1\b/g, '2¹⁶ – 1');
  s = s.replace(/\b216\s*-\s*1\b/g, '2¹⁶ – 1');
  s = s.replace(/\b7\s*×\s*233\b/g, '7 × 2³³');
  s = s.replace(/\b7\s*×\s*223\b/g, '7 × 2²³');
  s = s.replace(/\b248\s*–\s*1\b/g, '2⁴⁸ – 1');
  s = s.replace(/\b260\b/g, '2⁶⁰');
  s = s.replace(/\b2256\b/g, '2²⁵⁶');
  s = s.replace(/\b212\s*–\s*1\b/g, '2¹² – 1');
  s = s.replace(/\b2525\b/g, '25²⁵');
  s = s.replace(/\b6767\s*\+\s*67\b/g, '67⁶⁷ + 67');
  s = s.replace(/\(49\)15\b/g, '(49)¹⁵');
  s = s.replace(/\b784\b/g, '7⁸⁴');
  s = s.replace(/\b1523\s*\+\s*2323\b/g, '15²³ + 23²³');
  s = s.replace(/\b76n\s*–\s*66n\b/g, '7⁶ⁿ – 6⁶ⁿ');
  s = s.replace(/\b461\b/g, '4⁶¹');
  s = s.replace(/\b1736\b/g, '17³⁶');
  s = s.replace(/\(4743\s*\+\s*4343\)/g, '(47⁴³ + 43⁴³)');
  s = s.replace(/\(4747\s*\+\s*4347\)/g, '(47⁴⁷ + 43⁴⁷)');
  s = s.replace(/\(1024\)4\s*×\s*\(125\)11/g, '(1024)⁴ × (125)¹¹');

  s = s.replace(/\b34n\s*–\s*43n\b/g, '3⁴ⁿ – 4³ⁿ');
  s = s.replace(/\b34n\s*-\s*43n\b/g, '3⁴ⁿ – 4³ⁿ');
  s = s.replace(/\b10n\s*–\s*1\b/g, '10ⁿ – 1');
  s = s.replace(/\b10n\s*-\s*1\b/g, '10ⁿ – 1');
  s = s.replace(/\b6n\s*–\s*1\b/g, '6ⁿ – 1');
  s = s.replace(/\b6n\s*-\s*1\b/g, '6ⁿ – 1');
  s = s.replace(/\(1012\s*\+\s*25\)2/g, '(10¹² + 25)²');
  s = s.replace(/\(1012\s*–\s*25\)2/g, '(10¹² – 25)²');
  s = s.replace(/\(1012\s*-\s*25\)2/g, '(10¹² – 25)²');
  s = s.replace(/\b10025\s*–\s*25\b/g, '100²⁵ – 25');
  s = s.replace(/\b10025\s*-\s*25\b/g, '100²⁵ – 25');
  s = s.replace(/\b5n\s*\+\s*6m\b/g, '5ⁿ + 6ᵐ');
  s = s.replace(/\b553\s*\+\s*173\s*–\s*723\b/g, '55³ + 17³ – 72³');
  s = s.replace(/\bn65\s*–\s*n\b/g, 'n⁶⁵ – n');
  s = s.replace(/\b6n2\s*\+\s*6n\b/g, '6n² + 6n');
  s = s.replace(/\b610\s*·\s*717\s*·\s*1127\b/g, '6¹⁰ · 7¹⁷ · 11²⁷');
  s = s.replace(/\b307\s*×\s*225\s*×\s*3411\b/g, '30⁷ × 22⁵ × 34¹¹');

  // Strip any remaining exam tags
  s = s.replace(/\[\s*(?:SSC|RRB|UPSC|CDS|SNAP|MAT|CAT|CMAT|BANK|CPO|CGL|CHSL|PCS)[^\]]*\]/gi, '');
  s = s.replace(/\(\s*(?:S\.S\.C\.|R\.R\.B\.|C\.D\.S\.|M\.B\.A\.|M\.A\.T\.|P\.C\.S\.|Campus Recruitment|Bank P\.O\.|Bank Recruitment|L\.I\.C\.|C\.A\.D\.|Hotel Management|SNAP|I\.A\.M\.)[^)]*\)/gi, '');

  return s.trim();
}

console.log('Script initialized.');
