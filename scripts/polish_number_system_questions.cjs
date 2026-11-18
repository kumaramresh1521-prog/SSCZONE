const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function cleanGeneralText(str) {
  if (!str) return '';
  return str
    // Fix hyphenated broken words across newlines (e.g. 'consecu-\ntive' -> 'consecutive')
    .replace(/([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)/g, '$1$2')
    // Fix stray backslash used as therefore symbol
    .replace(/(?:^|\n)\s*\\\s+/g, '\n∴ ')
    .replace(/\\\s+/g, '∴ ')
    // Replace OCR since symbol
    .replace(//g, '∵')
    // Remove or clean OCR matrix parentheses brackets
    .replace(/[]/g, '')
    // Clean tabs
    .replace(/\t+/g, ' ')
    // Clean multiple spaces
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

async function polish() {
  console.log('Fetching all questions for topic 182...');
  const { data: rows, error } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', 182)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    process.exit(1);
  }

  console.log(`Fetched ${rows.length} rows. Starting quality polish...`);

  const updates = [];

  rows.forEach((r, idx) => {
    const qNum = idx + 1;
    let qText = cleanGeneralText(r.question_text);
    let optA = cleanGeneralText(r.option_a);
    let optB = cleanGeneralText(r.option_b);
    let optC = cleanGeneralText(r.option_c);
    let optD = cleanGeneralText(r.option_d);
    let explanation = cleanGeneralText(r.explanation);
    let correctAns = r.correct_answer;
    let examTag = r.exam_tag;
    let yearRef = r.year_reference;

    // Specific custom polish for mathematical formulas & book misprints:
    if (qNum === 19) {
      explanation = 'Formula for sum of squares of first n natural numbers:\n' +
                    '1² + 2² + 3² + ... + n² = [n(n + 1)(2n + 1)] / 6\n\n' +
                    'Here n = 9:\n' +
                    'Sum = (9 × 10 × 19) / 6 = 1710 / 6 = 285.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 45) {
      explanation = 'Given: p is a positive fraction less than 1 (0 < p < 1).\n' +
                    'Since 0 < p < 1, 1/p > 1 > p.\n' +
                    'Therefore, (1/p) – p > 0, which means (1/p – p) is always a positive number.\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 46) {
      explanation = 'Expression: x² + x + 1\n' +
                    'Completing the square:\n' +
                    'x² + x + 1 = (x + 1/2)² + 1 – 1/4 = (x + 1/2)² + 3/4\n\n' +
                    'Since for any real number x, (x + 1/2)² ≥ 0:\n' +
                    'x² + x + 1 ≥ 3/4.\n\n' +
                    'Hence, (x² + x + 1) is always greater than or equal to 3/4 (option d).';
    } else if (qNum === 47) {
      explanation = 'Given: (1/2 + 1/3 + 1/7 + 1/n) is a natural number.\n' +
                    'Sum of fractions = (21 + 14 + 6) / 42 + 1/n = 41/42 + 1/n\n' +
                    'For (41/42 + 1/n) to be an integer (specifically 1), we must have:\n' +
                    '1/n = 1 – 41/42 = 1/42  ⇒  n = 42.\n\n' +
                    'Since n = 42:\n' +
                    '• 2 divides 42 (true)\n' +
                    '• 3 divides 42 (true)\n' +
                    '• 7 divides 42 (true)\n' +
                    '• n > 84 is FALSE (since 42 < 84).\n\n' +
                    'Hence, option (d) is false and the correct answer.';
    } else if (qNum === 88) {
      explanation = '1260 ÷ 14 ÷ 9 = (1260 / 14) ÷ 9 = 90 ÷ 9 = 10.\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 124) {
      explanation = '112 × 5⁴ = 112 × 625 = 112 × (10000 / 16) = (112 / 16) × 10000 = 7 × 10000 = 70000.\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 157) {
      qText = 'If in the multiplication of a two-digit number ab by digits b and a, we have ab × b = 24 and ab × a = 12, then the values of a and b are:';
      optA = '1, 2';
      optB = '2, 3';
      optC = '1, 3';
      optD = 'None of these';
      correctAns = 'A';
      explanation = 'Given:\n' +
                    'ab × b = 24  ...(i)\n' +
                    'ab × a = 12  ...(ii)\n\n' +
                    'Dividing equation (i) by equation (ii):\n' +
                    '(ab × b) / (ab × a) = 24 / 12  ⇒  b / a = 2  ⇒  b = 2a\n\n' +
                    'Testing digits:\n' +
                    'If a = 1, then b = 2, so the number ab = 12.\n' +
                    'Check: 12 × 2 = 24 (verified), 12 × 1 = 12 (verified).\n\n' +
                    'Therefore, a = 1 and b = 2.\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 161) {
      explanation = 'Using Legendre\'s formula, highest power of 3 dividing 99! is:\n' +
                    'E₃(99!) = ⌊99/3⌋ + ⌊99/9⌋ + ⌊99/27⌋ + ⌊99/81⌋\n' +
                    '= 33 + 11 + 3 + 1 = 48.\n\n' +
                    'Since 9 = 3², the highest power of 9 dividing 99! is:\n' +
                    '48 / 2 = 24.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 174) {
      explanation = '5² + 6² + ... + 10² + 20²:\n' +
                    'Sum = (1² + 2² + ... + 10²) – (1² + 2² + 3² + 4²) + 20²\n' +
                    '= [10 × 11 × 21] / 6 – [1 + 4 + 9 + 16] + 400\n' +
                    '= 385 – 30 + 400 = 755.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 181) {
      explanation = 'Number of zeros at the end of 1000! equals the highest power of 5 in 1000!:\n' +
                    'E₅(1000!) = ⌊1000/5⌋ + ⌊1000/25⌋ + ⌊1000/125⌋ + ⌊1000/625⌋\n' +
                    '= 200 + 40 + 8 + 1 = 249 zeros.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 182) {
      explanation = 'N = 10 × 20 × 30 × ... × 1000 = 10¹⁰⁰ × (1 × 2 × 3 × ... × 100) = 10¹⁰⁰ × 100!\n' +
                    'Zeros from 10¹⁰⁰ = 100.\n' +
                    'Zeros in 100! = ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24.\n' +
                    'Total zeros = 100 + 24 = 124.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 183) {
      explanation = 'N = 5 × 10 × 15 × ... × 50 = 5¹⁰ × (1 × 2 × 3 × ... × 10) = 5¹⁰ × 10!\n' +
                    'Highest power of 2 in 10! = ⌊10/2⌋ + ⌊10/4⌋ + ⌊10/8⌋ = 5 + 2 + 1 = 8.\n' +
                    'Highest power of 5 in N = 10 + ⌊10/5⌋ = 12.\n' +
                    'Number of trailing zeros = min(power of 2, power of 5) = min(8, 12) = 8.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 184) {
      explanation = 'Number of zeros at the end of 60! = Highest power of 5 in 60!:\n' +
                    'E₅(60!) = ⌊60/5⌋ + ⌊60/25⌋ = 12 + 2 = 14 zeros.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 186) {
      explanation = 'N = 2 × 4 × 6 × ... × 100 = 2⁵⁰ × 50!\n' +
                    'Highest power of 5 in 50! = ⌊50/5⌋ + ⌊50/25⌋ = 10 + 2 = 12.\n' +
                    'Since powers of 2 exceed powers of 5, total trailing zeros = 12.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 188) {
      explanation = 'N = 3 × 6 × 9 × ... × 102 = 3³⁴ × 34!\n' +
                    'Number of trailing zeros = Highest power of 5 in 34!:\n' +
                    'E₅(34!) = ⌊34/5⌋ + ⌊34/25⌋ = 6 + 1 = 7 zeros.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 232) {
      explanation = 'A number is divisible by 33 if it is divisible by both 11 and 3 (co-primes).\n\n' +
                    '1. Divisibility by 11 for 5ABB7A:\n' +
                    '(A + B + A) – (7 + B + 5) = 2A – 12.\n' +
                    'For 2A – 12 to be divisible by 11, since A is a single non-zero digit:\n' +
                    '2A – 12 = 0  ⇒  A = 6.\n\n' +
                    '2. Divisibility by 3 for 56BB76:\n' +
                    'Sum of digits = 5 + 6 + B + B + 7 + 6 = 24 + 2B.\n' +
                    'For (24 + 2B) to be divisible by 3, 2B must be divisible by 3 (so B = 3 or 6 or 9).\n' +
                    'For non-zero digit B, taking B = 3 gives (A + B) = 6 + 3 = 9.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 325) {
      explanation = 'Using algebraic identity (a + b)² – (a – b)² = 4ab:\n' +
                    'Here a = 10¹² and b = 25.\n' +
                    '(10¹² + 25)² – (10¹² – 25)² = 4 × 10¹² × 25 = 100 × 10¹² = 10² × 10¹² = 10¹⁴.\n\n' +
                    'Given this equals 10ⁿ:\n' +
                    '10ⁿ = 10¹⁴  ⇒  n = 14.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 329) {
      explanation = 'When n is even, (xⁿ – aⁿ) is divisible by both (x – a) and (x + a).\n' +
                    'Therefore, (6ⁿ – 1ⁿ) is divisible by:\n' +
                    '• (6 – 1) = 5\n' +
                    '• (6 + 1) = 7\n' +
                    'Since 5 and 7 are co-primes, (6ⁿ – 1) is divisible by (5 × 7) = 35.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 351) {
      explanation = 'Given: a² + b² + c² = 1.\n' +
                    'For positive real quantities whose sum is constant, their product is maximum when the quantities are equal:\n' +
                    'a² = b² = c² = 1/3  ⇒  a = b = c = 1/√3.\n\n' +
                    'Therefore, maximum value of abc = (1/√3) × (1/√3) × (1/√3) = 1 / (3√3).\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 354) {
      explanation = '100²⁵ – 25 = (10²)²⁵ – 25 = 10⁵⁰ – 25.\n' +
                    '10⁵⁰ is 1 followed by 50 zeros.\n' +
                    'Subtracting 25 gives forty-eight 9\'s followed by 75:\n' +
                    '9999...9975 (48 nines, one 7, one 5).\n\n' +
                    'Sum of digits = (48 × 9) + 7 + 5 = 432 + 12 = 444.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 368) {
      qText = 'If p, q, r are all real numbers, then (p – q)³ + (q – r)³ + (r – p)³ is equal to: [SSC—CAPF/CPO Exam, 2016]';
      optA = '(p – q)(q – r)(r – p)';
      optB = '3(p – q)(q – r)(r – p)';
      optC = '1';
      optD = '0';
      correctAns = 'B';
      explanation = 'Let x = p – q, y = q – r, and z = r – p.\n' +
                    'Then:\n' +
                    'x + y + z = (p – q) + (q – r) + (r – p) = 0.\n\n' +
                    'By algebraic identity, if x + y + z = 0, then:\n' +
                    'x³ + y³ + z³ = 3xyz\n\n' +
                    'Substituting back:\n' +
                    '(p – q)³ + (q – r)³ + (r – p)³ = 3(p – q)(q – r)(r – p).\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 369) {
      qText = 'If (a² – b²) ÷ (a + b) = 25, then (a – b) = ? [RRB—NTPC Exam, 2016]';
      optA = '30';
      optB = '25';
      optC = '125';
      optD = '150';
      correctAns = 'B';
      explanation = 'Given:\n' +
                    '(a² – b²) ÷ (a + b) = 25\n\n' +
                    'Using algebraic identity a² – b² = (a – b)(a + b):\n' +
                    '[(a – b)(a + b)] / (a + b) = 25\n' +
                    '⇒ a – b = 25.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 370) {
      qText = 'How many prime numbers are there between 100 to 200? [CMAT, 2017]';
      optA = '21';
      optB = '20';
      optC = '16';
      optD = '11';
      correctAns = 'A';
      explanation = 'The prime numbers between 100 and 200 are:\n' +
                    '101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199.\n\n' +
                    'Total count = 21 prime numbers.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 373) {
      qText = 'Two consecutive even positive integers, sum of the squares of which is 1060, are:';
      optA = '12 and 14';
      optB = '20 and 22';
      optC = '22 and 24';
      optD = '24 and 26';
      correctAns = 'C';
      explanation = 'Let the two consecutive even integers be 2n and 2n + 2.\n' +
                    '(2n)² + (2n + 2)² = 1060\n' +
                    '4n² + 4n² + 8n + 4 = 1060\n' +
                    '8n² + 8n – 1056 = 0\n' +
                    'n² + n – 132 = 0\n' +
                    '(n + 12)(n – 11) = 0  ⇒  n = 11 (since positive).\n\n' +
                    'First integer = 2(11) = 22.\n' +
                    'Second integer = 22 + 2 = 24.\n' +
                    'Verification: 22² + 24² = 484 + 576 = 1060.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 375) {
      qText = 'If n is a natural number and n = p₁ˣ¹ · p₂ˣ² · p₃ˣ³, where p₁, p₂, p₃ are distinct prime factors, then the number of prime factors for n is: [CDS, 2016]';
      optA = 'x₁ + x₂ + x₃';
      optB = 'x₁, x₂, x₃';
      optC = '(x₁ + 1)(x₂ + 1)(x₃ + 1)';
      optD = 'None of the above';
      correctAns = 'B';
      explanation = 'Given prime factorization:\n' +
                    'n = p₁ˣ¹ · p₂ˣ² · p₃ˣ³\n' +
                    'where p₁, p₂, p₃ are distinct prime factors and x₁, x₂, x₃ are their respective powers.\n' +
                    'Hence, the powers representing the prime factor breakdown are x₁, x₂, x₃ (option b).';
    }

    updates.push({
      id: r.id,
      topic_id: 182,
      question_text: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correctAns,
      explanation: explanation,
      exam_tag: examTag,
      year_reference: yearRef,
      difficulty: 'medium',
      is_active: true
    });
  });

  console.log(`Prepared ${updates.length} polished rows. Writing back to Supabase in batches...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const slice = updates.slice(i, i + BATCH_SIZE);
    const { error: upErr } = await supabase.from('questions').upsert(slice);
    if (upErr) {
      console.error(`Error updating batch ${Math.floor(i / BATCH_SIZE) + 1}:`, upErr);
      process.exit(1);
    }
    console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)}] Updated ${slice.length} rows.`);
  }

  console.log('All questions polished successfully in Supabase!');
}

polish().catch(console.error);
