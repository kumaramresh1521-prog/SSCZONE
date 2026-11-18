const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function directFix() {
  console.log('Fixing by exact ID...');

  // 1. ID 25695
  await supabase.from('questions').update({
    option_d: '28700'
  }).eq('id', 25695);

  // 2. ID 25713
  await supabase.from('questions').update({
    question_text: 'Match List I with List II and select the correct answer:\n\n' +
                   'List I (Product) | List II (Unit digit)\n' +
                   'A. (1827)¹⁶      | (1) 1\n' +
                   'B. (2153)¹⁹      | (2) 3\n' +
                   'C. (5129)²¹      | (3) 5\n' +
                   '                 | (4) 7\n' +
                   '                 | (5) 9',
    option_a: '1  4  3',
    option_b: '4  2  3',
    option_c: '1  4  5',
    option_d: '4  2  5',
    correct_answer: 'C',
    explanation: '• For A: (1827)¹⁶:\n' +
                 'Unit digit of 7⁴ is 1. Since 16 is divisible by 4, unit digit of (1827)¹⁶ is 1. (A → 1)\n\n' +
                 '• For B: (2153)¹⁹:\n' +
                 '19 = 4 × 4 + 3. Unit digit of 3³ is 7. So unit digit of (2153)¹⁹ is 7. (B → 4)\n\n' +
                 '• For C: (5129)²¹:\n' +
                 'Cyclicity of 9: 9¹ = 9 (odd power). So unit digit of (5129)²¹ is 9. (C → 5)\n\n' +
                 'Matching code: A → 1, B → 4, C → 5.\n' +
                 'Hence, option (c) is correct.'
  }).eq('id', 25713);

  // 3. ID 25865
  await supabase.from('questions').update({
    option_d: 'both 3 and 17'
  }).eq('id', 25865);

  // 4. ID 25871
  await supabase.from('questions').update({
    question_text: 'Find the product of all odd natural numbers less than 5000.',
    option_a: '5000! / (2500 × 2501)',
    option_b: '5000! / (2²⁵⁰⁰ × 2500!)',
    option_c: '5000! / 2⁵⁰⁰⁰',
    option_d: 'None of these',
    correct_answer: 'B',
    explanation: 'Product of all odd natural numbers less than 5000:\n' +
                 'P = 1 × 3 × 5 × 7 × ... × 4999\n' +
                 '= (1 × 2 × 3 × 4 × ... × 5000) / (2 × 4 × 6 × ... × 5000)\n' +
                 '= 5000! / [2²⁵⁰⁰ × (1 × 2 × 3 × ... × 2500)]\n' +
                 '= 5000! / (2²⁵⁰⁰ × 2500!).\n\n' +
                 'Hence, option (b) is correct.'
  }).eq('id', 25871);

  // 5. ID 25562
  await supabase.from('questions').update({
    option_c: 'xy is necessarily irrational, but x + y can be either rational or irrational',
    option_d: 'x + y is necessarily irrational, but xy can be either rational or irrational'
  }).eq('id', 25562);

  // 6. ID 25885 (Q363)
  await supabase.from('questions').update({
    correct_answer: 'D',
    explanation: 'Let the two-digit number be 10a + b.\n' +
                 'According to the question:\n' +
                 'a + b = 12  ...(i)\n' +
                 '|a – b| = 6 ...(ii)\n\n' +
                 'Case 1: If a – b = 6:\n' +
                 'Adding (i) and (ii): 2a = 18  ⇒  a = 9.\n' +
                 'Substitute in (i): 9 + b = 12  ⇒  b = 3.\n' +
                 'The number is 93.\n\n' +
                 'Case 2: If b – a = 6:\n' +
                 'Adding gives 2b = 18  ⇒  b = 9, so a = 3.\n' +
                 'The number is 39.\n\n' +
                 'Since both 39 and 93 are valid two-digit numbers satisfying the conditions, no single choice among (a) 39 or (c) 93 is uniquely specified.\n\n' +
                 'Hence, the correct answer is option (d) Other than the given options.'
  }).eq('id', 25885);

  console.log('All direct ID fixes completed successfully!');
}

directFix().catch(console.error);
