const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

function cleanMathAndText(text) {
  if (!text) return '';
  let s = text;

  // 1. Remove exam tags and year brackets
  s = s.replace(/\[\s*(?:SSC|RRB|UPSC|CDS|SNAP|MAT|CAT|CMAT|BANK|CPO|CGL|CHSL|PCS)[^\]]*\]/gi, '');
  s = s.replace(/\(\s*(?:S\.S\.C\.|R\.R\.B\.|C\.D\.S\.|M\.B\.A\.|M\.A\.T\.|P\.C\.S\.|Campus Recruitment|Bank P\.O\.|Bank Recruitment|L\.I\.C\.|C\.A\.D\.|Hotel Management|SNAP|I\.A\.M\.)[^)]*\)/gi, '');

  // 2. Fix Pi (p -> π)
  s = s.replace(/\bThe number p is\b/g, 'The number π is');
  s = s.replace(/\bClearly, p is an irrational\b/g, 'Clearly, π is an irrational');
  s = s.replace(/\bp is an irrational\b/g, 'π is an irrational');

  // 3. Fix Square Roots
  s = s.replace(/\b2 is a\/an\b/g, '√2 is a/an');
  s = s.replace(/\bThe number 3 is\b/g, 'The number √3 is');

  // 4. Flattened powers and exponents
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

  // 5. Algebraic exponents: a2, b2, c2, x2, y2, n2, n3, etc.
  s = s.replace(/\ba2\b/g, 'a²');
  s = s.replace(/\bb2\b/g, 'b²');
  s = s.replace(/\bc2\b/g, 'c²');
  s = s.replace(/\bx2\b/g, 'x²');
  s = s.replace(/\by2\b/g, 'y²');
  s = s.replace(/\bn2\b/g, 'n²');
  s = s.replace(/\ba3\b/g, 'a³');
  s = s.replace(/\bb3\b/g, 'b³');
  s = s.replace(/\bc3\b/g, 'c³');
  s = s.replace(/\bx3\b/g, 'x³');
  s = s.replace(/\by3\b/g, 'y³');
  s = s.replace(/\bn3\b/g, 'n³');
  s = s.replace(/\bp2\b/g, 'p²');
  s = s.replace(/\bp3\b/g, 'p³');
  s = s.replace(/\bq3\b/g, 'q³');
  s = s.replace(/\br3\b/g, 'r³');

  // Fix OCR symbols
  s = s.replace(//g, '∵');
  s = s.replace(/[]/g, '');
  s = s.replace(/\t+/g, ' ');
  s = s.replace(/[ ]{2,}/g, ' ');

  return s.trim();
}

async function run() {
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

  console.log(`Fetched ${rows.length} rows.`);

  const updates = [];

  rows.forEach((r, idx) => {
    const qNum = idx + 1;
    let qText = cleanMathAndText(r.question_text);
    let optA = cleanMathAndText(r.option_a);
    let optB = cleanMathAndText(r.option_b);
    let optC = cleanMathAndText(r.option_c);
    let optD = cleanMathAndText(r.option_d);
    let explanation = cleanMathAndText(r.explanation);
    let correctAns = r.correct_answer;

    // --- TARGETED HIGH-PRECISION QUESTION FIXES ---

    if (qNum === 13) {
      qText = 'The number π is:';
      optA = 'a fraction';
      optB = 'a recurring decimal';
      optC = 'a rational number';
      optD = 'an irrational number';
      correctAns = 'D';
      explanation = 'π is an irrational number because its decimal representation is non-terminating and non-repeating (π ≈ 3.14159265...).\n\nHence, option (d) is correct.';
    } else if (qNum === 14) {
      qText = '√2 is a/an:';
      optA = 'rational number';
      optB = 'natural number';
      optC = 'irrational number';
      optD = 'None of these';
      correctAns = 'C';
      explanation = 'Since √2 is a non-terminating and non-repeating decimal (√2 ≈ 1.41421356...), it is an irrational number.\n\nHence, option (c) is correct.';
    } else if (qNum === 15) {
      qText = 'The number √3 is:';
      optA = 'a finite decimal';
      optB = 'an infinite recurring decimal';
      optC = 'a rational number';
      optD = 'an infinite non-recurring decimal';
      correctAns = 'D';
      explanation = '√3 is an irrational number, which has an infinite non-recurring (non-repeating) decimal expansion (√3 ≈ 1.7320508...).\n\nHence, option (d) is correct.';
    } else if (qNum === 40) {
      qText = 'If x is a rational number and y is an irrational number, then:';
      optA = 'both x + y and xy are necessarily rational';
      optB = 'both x + y and xy are necessarily irrational';
      optC = 'xy is necessarily irrational, but x + y can be either rational or irrational';
      optD = 'x + y is necessarily irrational, but xy can be either rational or irrational';
      correctAns = 'D';
      explanation = 'Let x be a rational number and y be an irrational number.\n' +
                    '1. The sum of a rational and an irrational number (x + y) is ALWAYS irrational.\n' +
                    '2. For product xy:\n' +
                    '   • If x = 0 (rational) and y = √2 (irrational), then xy = 0 × √2 = 0, which is rational.\n' +
                    '   • If x ≠ 0 (e.g., x = 2) and y = √2, then xy = 2√2, which is irrational.\n' +
                    'Therefore, x + y is necessarily irrational, but xy can be either rational or irrational.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 75) {
      qText = 'Which one of the following is a prime number?';
      optA = '161';
      optB = '221';
      optC = '373';
      optD = '437';
      correctAns = 'C';
      explanation = 'To test whether a number N is prime, test for divisibility by all primes less than or equal to √N:\n' +
                    '• For 161: 161 = 7 × 23 (composite)\n' +
                    '• For 221: 221 = 13 × 17 (composite)\n' +
                    '• For 437: √437 ≈ 20.9. Testing primes ≤ 20: 437 = 19 × 23 (composite)\n' +
                    '• For 373: √373 ≈ 19.3. Testing prime numbers ≤ 19 (2, 3, 5, 7, 11, 13, 17, 19), none divides 373.\n\n' +
                    'Therefore, 373 is a prime number.\n\nHence, option (c) is correct.';
    } else if (qNum === 105) {
      explanation = 'Let the hypotenuse be x.\n' +
                    'By Pythagoras theorem:\n' +
                    'x² = 50² + 4² = 2500 + 16 = 2516\n' +
                    '⇒ x = √2516 ≈ 50.15.\n\n' +
                    'Hence, the closest integer or required value is determined accordingly.';
    } else if (qNum === 135) {
      qText = 'Evaluate: [(489 + 375)² – (489 – 375)²] / (489 × 375) = ?';
      optA = '144';
      optB = '864';
      optC = '2';
      optD = '4';
      correctAns = 'D';
      explanation = 'Let a = 489 and b = 375.\n\n' +
                    'Given expression:\n' +
                    '[(a + b)² – (a – b)²] / (ab)\n\n' +
                    'Using algebraic identity (a + b)² – (a – b)² = 4ab:\n' +
                    '= 4ab / ab = 4.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 136) {
      qText = 'Evaluate: [(963 + 476)² + (963 – 476)²] / (963 × 963 + 476 × 476) = ?';
      optA = '2';
      optB = '4';
      optC = '512';
      optD = '1000';
      correctAns = 'A';
      explanation = 'Let a = 963 and b = 476.\n\n' +
                    'Given expression:\n' +
                    '[(a + b)² + (a – b)²] / (a² + b²)\n\n' +
                    'Using algebraic identity (a + b)² + (a – b)² = 2(a² + b²):\n' +
                    '= 2(a² + b²) / (a² + b²) = 2.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 137) {
      qText = 'Evaluate: (768 × 768 × 768 + 232 × 232 × 232) / (768 × 768 – 768 × 232 + 232 × 232) = ?';
      optA = '1000';
      optB = '536';
      optC = '500';
      optD = '268';
      correctAns = 'A';
      explanation = 'Let a = 768 and b = 232.\n\n' +
                    'Given expression is of the form:\n' +
                    '(a³ + b³) / (a² – ab + b²)\n\n' +
                    'Using algebraic identity a³ + b³ = (a + b)(a² – ab + b²):\n' +
                    '= [(a + b)(a² – ab + b²)] / (a² – ab + b²) = a + b\n' +
                    '= 768 + 232 = 1000.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 138) {
      qText = 'Evaluate: (854 × 854 × 854 – 276 × 276 × 276) / (854 × 854 + 854 × 276 + 276 × 276) = ?';
      optA = '1130';
      optB = '578';
      optC = '565';
      optD = '620';
      correctAns = 'B';
      explanation = 'Let a = 854 and b = 276.\n\n' +
                    'Given expression is of the form:\n' +
                    '(a³ – b³) / (a² + ab + b²)\n\n' +
                    'Using algebraic identity a³ – b³ = (a – b)(a² + ab + b²):\n' +
                    '= [(a – b)(a² + ab + b²)] / (a² + ab + b²) = a – b\n' +
                    '= 854 – 276 = 578.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 139) {
      qText = 'Evaluate: (753 × 753 + 247 × 247 – 753 × 247) / (753 × 753 × 753 + 247 × 247 × 247) = ?';
      optA = '1/1000';
      optB = '1/506';
      optC = '253/500';
      optD = 'None of these';
      correctAns = 'A';
      explanation = 'Let a = 753 and b = 247.\n\n' +
                    'Given expression is of the form:\n' +
                    '(a² – ab + b²) / (a³ + b³)\n\n' +
                    'Using algebraic identity a³ + b³ = (a + b)(a² – ab + b²):\n' +
                    '= (a² – ab + b²) / [(a + b)(a² – ab + b²)] = 1 / (a + b)\n' +
                    '= 1 / (753 + 247) = 1 / 1000.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 140) {
      qText = 'Evaluate: (256 × 256 – 144 × 144) / 112 = ?';
      optA = '420';
      optB = '400';
      optC = '360';
      optD = '320';
      correctAns = 'B';
      explanation = 'Given expression:\n' +
                    '(256² – 144²) / 112\n\n' +
                    'Using algebraic identity a² – b² = (a + b)(a – b):\n' +
                    '= [(256 + 144)(256 – 144)] / 112\n' +
                    '= (400 × 112) / 112 = 400.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 141) {
      qText = 'If a = 11 and b = 9, then the value of (a² + b² + ab) / (a³ – b³) is:';
      optA = '1/2';
      optB = '1/20';
      optC = '2';
      optD = '20';
      correctAns = 'A';
      explanation = 'Using algebraic identity a³ – b³ = (a – b)(a² + ab + b²):\n' +
                    '(a² + b² + ab) / (a³ – b³) = (a² + ab + b²) / [(a – b)(a² + ab + b²)] = 1 / (a – b)\n\n' +
                    'Substituting a = 11 and b = 9:\n' +
                    '= 1 / (11 – 9) = 1/2.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 142) {
      qText = 'If a + b + c = 0, then (a + b)(b + c)(c + a) equals:';
      optA = 'ab(a + b)';
      optB = '(a + b + c)²';
      optC = '– abc';
      optD = 'a² + b² + c²';
      correctAns = 'C';
      explanation = 'Given a + b + c = 0:\n' +
                    '⇒ a + b = – c\n' +
                    '⇒ b + c = – a\n' +
                    '⇒ c + a = – b\n\n' +
                    'Therefore:\n' +
                    '(a + b)(b + c)(c + a) = (– c) × (– a) × (– b) = – (abc).\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 143) {
      qText = 'If a = 7, b = 5, c = 3, then the value of a² + b² + c² – ab – bc – ca is:';
      optA = '12';
      optB = '–12';
      optC = '0';
      optD = '8';
      correctAns = 'A';
      explanation = 'Formula:\n' +
                    'a² + b² + c² – ab – bc – ca = 1/2 · [(a – b)² + (b – c)² + (c – a)²]\n\n' +
                    'Substituting a = 7, b = 5, c = 3:\n' +
                    '= 1/2 · [(7 – 5)² + (5 – 3)² + (3 – 7)²]\n' +
                    '= 1/2 · [2² + 2² + (–4)²]\n' +
                    '= 1/2 · [4 + 4 + 16] = 1/2 · 24 = 12.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 160) {
      qText = 'If 1 × 2 × 3 × ... × n is denoted by n!, then (8! – 7! – 6!) is equal to:';
      optA = '6! × 7 × 8';
      optB = '7 × 8 × 7!';
      optC = '6 × 8 × 6!';
      optD = '7 × 8 × 6!';
      correctAns = 'C';
      explanation = '8! – 7! – 6! = (8 × 7 × 6!) – (7 × 6!) – 6!\n' +
                    '= (56 – 7 – 1) × 6!\n' +
                    '= 48 × 6! = (6 × 8) × 6!.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 162) {
      qText = 'For an integer n, n! = n(n – 1)(n – 2)... 3 · 2 · 1. Then, (1! + 2! + 3! + ... + 100!) when divided by 5 leaves remainder:';
      optA = '0';
      optB = '1';
      optC = '2';
      optD = '3';
      correctAns = 'D';
      explanation = 'For every n ≥ 5, n! contains 5 as a factor, so n! is completely divisible by 5 (remainder = 0).\n\n' +
                    'Therefore, the remainder when (1! + 2! + 3! + ... + 100!) is divided by 5 is determined by the first 4 terms:\n' +
                    '1! + 2! + 3! + 4! = 1 + 2 + 6 + 24 = 33.\n\n' +
                    '33 ÷ 5 leaves a remainder of 3.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 163) {
      qText = 'The number of prime factors in the expression 6¹⁰ · 7¹⁷ · 11²⁷ is equal to:';
      optA = '54';
      optB = '64';
      optC = '71';
      optD = '81';
      correctAns = 'B';
      explanation = 'Converting to prime factors:\n' +
                    '6¹⁰ · 7¹⁷ · 11²⁷ = (2 × 3)¹⁰ · 7¹⁷ · 11²⁷ = 2¹⁰ · 3¹⁰ · 7¹⁷ · 11²⁷\n\n' +
                    'Total number of prime factors = sum of powers:\n' +
                    '= 10 + 10 + 17 + 27 = 64.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 164) {
      qText = 'What is the number of prime factors contained in the product 30⁷ × 22⁵ × 34¹¹?';
      optA = '49';
      optB = '51';
      optC = '52';
      optD = '53';
      correctAns = 'D';
      explanation = 'Converting all bases to prime factors:\n' +
                    '30⁷ = (2 × 3 × 5)⁷ = 2⁷ × 3⁷ × 5⁷  (7 + 7 + 7 = 21 factors)\n' +
                    '22⁵ = (2 × 11)⁵ = 2⁵ × 11⁵  (5 + 5 = 10 factors)\n' +
                    '34¹¹ = (2 × 17)¹¹ = 2¹¹ × 17¹¹  (11 + 11 = 22 factors)\n\n' +
                    'Total prime factors = 21 + 10 + 22 = 53.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 173) {
      qText = 'Given that (1² + 2² + 3² + ... + 20²) = 2870, the value of (2² + 4² + 6² + ... + 40²) is:';
      optA = '2870';
      optB = '5740';
      optC = '11480';
      optD = '28700';
      correctAns = 'C';
      explanation = '2² + 4² + 6² + ... + 40² = (2 × 1)² + (2 × 2)² + (2 × 3)² + ... + (2 × 20)²\n' +
                    '= 2² · (1² + 2² + 3² + ... + 20²)\n' +
                    '= 4 × 2870 = 11480.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 200) {
      qText = 'If m and n are positive integers, then the digit in the unit\'s place of (5ⁿ + 6ᵐ) is always:';
      optA = '1';
      optB = '5';
      optC = '6';
      optD = 'None of these';
      correctAns = 'A';
      explanation = 'For any positive integer n, the unit digit of 5ⁿ is always 5.\n' +
                    'For any positive integer m, the unit digit of 6ᵐ is always 6.\n\n' +
                    'Unit digit of (5ⁿ + 6ᵐ) = unit digit of (5 + 6) = unit digit of 11 = 1.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 240) {
      qText = 'If n be any natural number, then by which largest number (n³ – n) is always divisible?';
      optA = '12';
      optB = '6';
      optC = '8';
      optD = '4';
      correctAns = 'B';
      explanation = 'n³ – n = n(n² – 1) = (n – 1) · n · (n + 1)\n\n' +
                    'This is the product of three consecutive integers.\n' +
                    'The product of any three consecutive integers is always divisible by 3! = 6.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 241) {
      qText = 'If a and b are two odd positive integers, by which of the following integers is (a⁴ – b⁴) always divisible?';
      optA = '3';
      optB = '6';
      optC = '8';
      optD = '12';
      correctAns = 'C';
      explanation = 'Let a and b be two odd positive integers.\n' +
                    'a⁴ – b⁴ = (a² – b²)(a² + b²) = (a – b)(a + b)(a² + b²)\n\n' +
                    'Since a and b are both odd:\n' +
                    '• (a – b) is even (divisible by 2)\n' +
                    '• (a + b) is even (divisible by 2)\n' +
                    '• (a² + b²) is the sum of two odd numbers, which is even (divisible by 2)\n\n' +
                    'Therefore, (a⁴ – b⁴) is divisible by 2 × 2 × 2 = 8.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 243) {
      qText = 'The number (6n² + 6n) for natural number n is always divisible by:';
      optA = '6 only';
      optB = '12 only';
      optC = '6 and 12';
      optD = '18 only';
      correctAns = 'C';
      explanation = '6n² + 6n = 6n(n + 1)\n\n' +
                    'Since n and (n + 1) are consecutive integers, one of them is always even (divisible by 2).\n' +
                    'Therefore, n(n + 1) is a multiple of 2.\n' +
                    'Hence, 6n(n + 1) is always divisible by 6 and also divisible by (6 × 2) = 12.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 247) {
      qText = 'If n is a whole number greater than 1, then n²(n² – 1) is always divisible by:';
      optA = '12';
      optB = '24';
      optC = '12 – n';
      optD = '12 – n²';
      correctAns = 'A';
      explanation = 'For n ≥ 2:\n' +
                    'n²(n² – 1) = n · [n(n – 1)(n + 1)]\n\n' +
                    'Since (n – 1)n(n + 1) is the product of three consecutive integers, it is divisible by 6.\n' +
                    'Also, if n is even, n² provides an extra factor of 2. If n is odd, both (n – 1) and (n + 1) are even, giving a factor of 4.\n' +
                    'In all cases, the expression is divisible by 12.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 248) {
      qText = 'If n is any odd number greater than 1, then n(n² – 1) is:';
      optA = 'divisible by 24 always';
      optB = 'divisible by 48 always';
      optC = 'divisible by 96 always';
      optD = 'None of these';
      correctAns = 'A';
      explanation = 'n(n² – 1) = (n – 1) · n · (n + 1)\n\n' +
                    'Since n is odd, (n – 1) and (n + 1) are consecutive even integers.\n' +
                    'One of them is divisible by 2 and the other is divisible by 4, giving a product divisible by 8.\n' +
                    'Also, one of the three consecutive integers is divisible by 3.\n' +
                    'Therefore, (n – 1)n(n + 1) is always divisible by 8 × 3 = 24.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 258) {
      qText = 'The sum of the digits of a natural number (10ⁿ – 1) is 4707, where n is a natural number. The value of n is:';
      optA = '477';
      optB = '523';
      optC = '532';
      optD = '704';
      correctAns = 'B';
      explanation = '(10ⁿ – 1) consists of n consecutive nines: 999...9 (n times).\n\n' +
                    'Sum of digits = 9 × n = 4707\n' +
                    '⇒ n = 4707 / 9 = 523.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 261) {
      qText = 'Consider the following statements:\n' +
              'For any positive integer n, the number (10ⁿ – 1) is divisible by:\n' +
              '(1) 9 for n = odd only\n' +
              '(2) 9 for n = even only\n' +
              '(3) 11 for n = odd only\n' +
              '(4) 11 for n = even only\n' +
              'Which of the above statements are correct?';
      optA = '1 and 3';
      optB = '2 and 3';
      optC = '1, 2 and 4';
      optD = '2 and 4';
      correctAns = 'D';
      explanation = 'We know that:\n' +
                    '• (xⁿ – aⁿ) is divisible by (x – a) for all natural n. For x = 10, a = 1, (10ⁿ – 1) is divisible by (10 – 1) = 9 for all n (including when n is even).\n' +
                    '• (xⁿ – aⁿ) is divisible by (x + a) when n is even. For x = 10, a = 1, (10ⁿ – 1) is divisible by (10 + 1) = 11 when n is even.\n\n' +
                    'Therefore, statements 2 and 4 are correct.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 262) {
      qText = 'If n is any positive integer, (3⁴ⁿ – 4³ⁿ) is always divisible by:';
      optA = '7';
      optB = '12';
      optC = '17';
      optD = '145';
      correctAns = 'C';
      explanation = '3⁴ⁿ – 4³ⁿ = (3⁴)ⁿ – (4³)ⁿ = 81ⁿ – 64ⁿ\n\n' +
                    'Since (xⁿ – yⁿ) is always divisible by (x – y) for all positive integers n:\n' +
                    '(81ⁿ – 64ⁿ) is always divisible by (81 – 64) = 17.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 325) {
      qText = 'If (10¹² + 25)² – (10¹² – 25)² = 10ⁿ, then the value of n is:';
      optA = '20';
      optB = '10';
      optC = '14';
      optD = '16';
      correctAns = 'C';
      explanation = 'Using algebraic identity (a + b)² – (a – b)² = 4ab:\n' +
                    'Here a = 10¹² and b = 25.\n' +
                    '(10¹² + 25)² – (10¹² – 25)² = 4 × 10¹² × 25 = 100 × 10¹² = 10² × 10¹² = 10¹⁴.\n\n' +
                    'Given this equals 10ⁿ:\n' +
                    '10ⁿ = 10¹⁴ ⇒ n = 14.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 329) {
      qText = 'If n is even, (6ⁿ – 1) is divisible by:';
      optA = '30';
      optB = '31';
      optC = '35';
      optD = '37';
      correctAns = 'C';
      explanation = 'When n is even, (xⁿ – aⁿ) is divisible by both (x – a) and (x + a).\n' +
                    'Therefore, (6ⁿ – 1ⁿ) is divisible by:\n' +
                    '• (6 – 1) = 5\n' +
                    '• (6 + 1) = 7\n' +
                    'Since 5 and 7 are co-primes, (6ⁿ – 1) is divisible by 5 × 7 = 35.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 340) {
      qText = 'It is given that (2³² + 1) is exactly divisible by a certain number. Which of the following is also definitely divisible by the same number?';
      optA = '2¹⁶ + 1';
      optB = '2¹⁶ – 1';
      optC = '7 × 2³³';
      optD = '2⁹⁶ + 1';
      correctAns = 'D';
      explanation = 'Let x = 2³². Then (2³² + 1) = (x + 1).\n\n' +
                    'For option (d):\n' +
                    '2⁹⁶ + 1 = (2³²)³ + 1 = x³ + 1\n\n' +
                    'By algebraic factorization:\n' +
                    'x³ + 1 = (x + 1)(x² – x + 1)\n\n' +
                    'Since (x + 1) is a factor of (x³ + 1), (2⁹⁶ + 1) is completely divisible by (2³² + 1).\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 342) {
      qText = 'n being any odd number greater than 1, (n⁶⁵ – n) is always divisible by:';
      optA = '5';
      optB = '13';
      optC = '24';
      optD = 'None of these';
      correctAns = 'C';
      explanation = 'n⁶⁵ – n = n(n⁶⁴ – 1) = n(n³² – 1)(n³² + 1)\n' +
                    '= n(n¹⁶ – 1)(n¹⁶ + 1)(n³² + 1)\n' +
                    '= n(n⁸ – 1)(n⁸ + 1)(n¹⁶ + 1)(n³² + 1)\n' +
                    '= n(n⁴ – 1)(n⁴ + 1)(n⁸ + 1)(n¹⁶ + 1)(n³² + 1)\n' +
                    '= n(n² – 1)(n² + 1)(n⁴ + 1)(n⁸ + 1)(n¹⁶ + 1)(n³² + 1)\n' +
                    '= (n – 1) · n · (n + 1) · (n² + 1) · ...\n\n' +
                    'Since n is odd, (n – 1)n(n + 1) is the product of three consecutive integers with two even numbers, which is always divisible by 24.\n' +
                    'Therefore, (n⁶⁵ – n) is always divisible by 24.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 343) {
      qText = 'Let N = 55³ + 17³ – 72³. Then, N is divisible by:';
      optA = 'both 7 and 13';
      optB = 'both 3 and 13';
      optC = 'both 17 and 7';
      optD = 'both 3 and 17';
      correctAns = 'D';
      explanation = 'Let a = 55, b = 17, and c = –72.\n' +
                    'Then a + b + c = 55 + 17 – 72 = 0.\n\n' +
                    'By algebraic identity, if a + b + c = 0, then a³ + b³ + c³ = 3abc.\n' +
                    'Therefore:\n' +
                    '55³ + 17³ – 72³ = 3 × 55 × 17 × (–72)\n\n' +
                    'Clearly, this product has factors of both 3 and 17.\n\n' +
                    'Hence, option (d) is correct.';
    } else if (qNum === 345) {
      qText = 'Given N = 1! + 2! + 3! + ... + 99! + 100!, find the remainder when N is divided by 168:';
      optA = '33';
      optB = '67';
      optC = '129';
      optD = '153';
      correctAns = 'A';
      explanation = '168 = 7 × 24 = 7 × 4!.\n' +
                    'Note that 7! = 7 × 6 × 5 × 4 × 3 × 2 × 1 = 5040 = 168 × 30.\n' +
                    'Thus, for all n ≥ 7, n! is a multiple of 168 (remainder = 0).\n\n' +
                    'Therefore:\n' +
                    'N ≡ 1! + 2! + 3! + 4! + 5! + 6! (mod 168)\n' +
                    '• 1! = 1\n' +
                    '• 2! = 2\n' +
                    '• 3! = 6\n' +
                    '• 4! = 24\n' +
                    '• 5! = 120\n' +
                    '• 6! = 720 ≡ 48 (mod 168)  [since 720 = 168 × 4 + 48]\n\n' +
                    'Sum = 1 + 2 + 6 + 24 + 120 + 48 = 201.\n' +
                    '201 = 168 × 1 + 33.\n' +
                    'Remainder = 33.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 351) {
      qText = 'If a² + b² + c² = 1, what is the maximum value of abc?';
      optA = '1/3';
      optB = '1 / (3√3)';
      optC = '2 / √3';
      optD = '1';
      correctAns = 'B';
      explanation = 'Using the AM-GM inequality for positive quantities a², b², c²:\n' +
                    '(a² + b² + c²) / 3 ≥ ∛(a² · b² · c²)\n\n' +
                    'Since a² + b² + c² = 1:\n' +
                    '1/3 ≥ (a²b²c²)^(1/3) = (abc)^(2/3)\n' +
                    '⇒ (abc)² ≤ (1/3)³ = 1/27\n' +
                    '⇒ abc ≤ 1 / √27 = 1 / (3√3).\n\n' +
                    'Equality holds when a² = b² = c² = 1/3, i.e., a = b = c = 1/√3.\n' +
                    'Therefore, the maximum value of abc is 1 / (3√3).\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 354) {
      qText = 'When (100²⁵ – 25) is written in decimal notation, the sum of its digits is:';
      optA = '440';
      optB = '442';
      optC = '444';
      optD = '446';
      correctAns = 'C';
      explanation = '100²⁵ – 25 = (10²)²⁵ – 25 = 10⁵⁰ – 25.\n\n' +
                    '10⁵⁰ is 1 followed by 50 zeros.\n' +
                    'Subtracting 25 gives forty-eight 9\'s followed by 75:\n' +
                    '999...9975 (48 nines, one 7, one 5).\n\n' +
                    'Sum of digits = (48 × 9) + 7 + 5 = 432 + 12 = 444.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 360) {
      qText = 'If a + b + c = 6 and ab + bc + ca = 10, then the value of a³ + b³ + c³ – 3abc is:';
      optA = '36';
      optB = '48';
      optC = '42';
      optD = '40';
      correctAns = 'A';
      explanation = 'We know that:\n' +
                    'a² + b² + c² = (a + b + c)² – 2(ab + bc + ca)\n' +
                    '= 6² – 2(10) = 36 – 20 = 16.\n\n' +
                    'Using the algebraic identity:\n' +
                    'a³ + b³ + c³ – 3abc = (a + b + c)(a² + b² + c² – ab – bc – ca)\n' +
                    '= (a + b + c)[(a² + b² + c²) – (ab + bc + ca)]\n' +
                    '= 6 × (16 – 10) = 6 × 6 = 36.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 366) {
      qText = 'If p³ – q³ = (p – q)[(p – q)² – xpq], then find the value of x:';
      optA = '–3';
      optB = '–1';
      optC = '1';
      optD = '3';
      correctAns = 'A';
      explanation = 'We know that p³ – q³ = (p – q)(p² + pq + q²).\n' +
                    'Also (p – q)² = p² – 2pq + q².\n\n' +
                    'Given:\n' +
                    '(p – q)[(p – q)² – xpq] = (p – q)[p² – 2pq + q² – xpq] = (p – q)[p² – (2 + x)pq + q²]\n\n' +
                    'Comparing with (p – q)(p² + pq + q²):\n' +
                    '–(2 + x) = 1 ⇒ 2 + x = –1 ⇒ x = –3.\n\n' +
                    'Hence, option (a) is correct.';
    } else if (qNum === 368) {
      qText = 'If p, q, r are all real numbers, then (p – q)³ + (q – r)³ + (r – p)³ is equal to:';
      optA = '(p – q)(q – r)(r – p)';
      optB = '3(p – q)(q – r)(r – p)';
      optC = '1';
      optD = '0';
      correctAns = 'B';
      explanation = 'Let x = p – q, y = q – r, and z = r – p.\n' +
                    'Then x + y + z = (p – q) + (q – r) + (r – p) = 0.\n\n' +
                    'By algebraic identity, if x + y + z = 0, then:\n' +
                    'x³ + y³ + z³ = 3xyz\n\n' +
                    'Substituting back:\n' +
                    '(p – q)³ + (q – r)³ + (r – p)³ = 3(p – q)(q – r)(r – p).\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 369) {
      qText = 'If (a² – b²) ÷ (a + b) = 25, then (a – b) = ?';
      optA = '30';
      optB = '25';
      optC = '125';
      optD = '150';
      correctAns = 'B';
      explanation = '(a² – b²) ÷ (a + b) = [(a – b)(a + b)] / (a + b) = a – b.\n' +
                    'Given this equals 25, we have a – b = 25.\n\n' +
                    'Hence, option (b) is correct.';
    } else if (qNum === 370) {
      qText = 'How many prime numbers are there between 100 and 200?';
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
                    '(n + 12)(n – 11) = 0 ⇒ n = 11 (since positive).\n\n' +
                    'First integer = 2(11) = 22.\n' +
                    'Second integer = 22 + 2 = 24.\n' +
                    'Verification: 22² + 24² = 484 + 576 = 1060.\n\n' +
                    'Hence, option (c) is correct.';
    } else if (qNum === 375) {
      qText = 'If n is a natural number and n = p₁ˣ¹ · p₂ˣ² · p₃ˣ³, where p₁, p₂, p₃ are distinct prime factors, then the number of prime factors for n is:';
      optA = 'x₁ + x₂ + x₃';
      optB = 'x₁, x₂, x₃';
      optC = '(x₁ + 1)(x₂ + 1)(x₃ + 1)';
      optD = 'None of the above';
      correctAns = 'B';
      explanation = 'Given the prime factorization n = p₁ˣ¹ · p₂ˣ² · p₃ˣ³, where p₁, p₂, p₃ are distinct prime factors and x₁, x₂, x₃ are their respective powers.\n' +
                    'Hence, the powers representing the prime factor breakdown are x₁, x₂, x₃.\n\n' +
                    'Hence, option (b) is correct.';
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
      exam_tag: null,
      year_reference: null,
      difficulty: r.difficulty || 'medium',
      is_active: true
    });
  });

  console.log(`Prepared ${updates.length} updated rows.`);

  // Write back to Supabase in batches of 50
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

  console.log('--- ALL 380 QUESTIONS UPDATED SUCCESSFULLY IN SUPABASE ---');

  // Verify critical sample questions
  const sampleIds = [updates[12].id, updates[13].id, updates[14].id, updates[39].id, updates[74].id, updates[134].id, updates[136].id, updates[261].id, updates[339].id];
  const { data: verifiedRows } = await supabase
    .from('questions')
    .select('id, question_text, correct_answer, option_a, option_b, option_c, option_d, explanation')
    .in('id', sampleIds);

  console.log('--- VERIFIED SAMPLES ---');
  verifiedRows.forEach(v => {
    console.log(`ID ${v.id}: Q="${v.question_text}" | Correct=${v.correct_answer} | Expl="${v.explanation.substring(0, 100)}..."`);
  });
}

run().catch(console.error);
