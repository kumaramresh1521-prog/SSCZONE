const { createClient } = require('@supabase/supabase-js');

const url = 'https://rmobqopitkjobcnyqzru.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA';
const supabase = createClient(url, key);

async function runFixes() {
  console.log('Fetching all questions for topic 182...');
  const { data: rows, error } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', 182)
    .order('id', { ascending: true });

  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  const updates = [];

  const context54to57 =
    'DIRECTIONS: For a 5-digit number without repetition of digits, the following information is available:\n' +
    '(i) The first digit is more than 5 times the last digit.\n' +
    '(ii) The two-digit number formed by the last two digits is the product of two prime numbers.\n' +
    '(iii) The first three digits are all odd.\n' +
    '(iv) The number does not contain the digits 3 or 0, and the first digit is also the largest.\n\n';

  rows.forEach((r, idx) => {
    const qNum = idx + 1;
    let modified = false;

    // 1. Context prepending for Questions 54 to 57
    if (qNum === 54 && !r.question_text.includes('DIRECTIONS')) {
      r.question_text = context54to57 + 'Question: What is the second digit of the number?';
      modified = true;
    } else if (qNum === 55 && !r.question_text.includes('DIRECTIONS')) {
      r.question_text = context54to57 + 'Question: What is the last digit of the number?';
      modified = true;
    } else if (qNum === 56 && !r.question_text.includes('DIRECTIONS')) {
      r.question_text = context54to57 + 'Question: What is the largest digit in the number?';
      modified = true;
    } else if (qNum === 57 && !r.question_text.includes('DIRECTIONS')) {
      r.question_text = context54to57 + 'Question: Which of the following is a factor of the given number?';
      modified = true;
    }

    // 2. Context for Questions 344 and 345
    if (qNum === 344 && !r.question_text.includes('Given N')) {
      r.question_text = 'Given N = 1! + 2! + 3! + ... + 99! + 100!, find the last two digits of N.';
      modified = true;
    } else if (qNum === 345 && !r.question_text.includes('Given N')) {
      r.question_text = 'Given N = 1! + 2! + 3! + ... + 99! + 100!, find the remainder when N is divided by 168.';
      modified = true;
    }

    // 3. Fix Q44 (ID 25566) options
    if (qNum === 44) {
      r.option_a = 'x';
      r.option_b = 'x²';
      r.option_c = '1/x';
      r.option_d = '1/x²';
      r.correct_answer = 'D';
      r.explanation = 'Since 0 < x < 1 (for example, let x = 1/2 = 0.5):\n' +
                      '• x² = (1/2)² = 1/4 = 0.25\n' +
                      '• x = 1/2 = 0.5\n' +
                      '• 1/x = 1 / (1/2) = 2\n' +
                      '• 1/x² = 1 / (1/4) = 4\n\n' +
                      'Since 4 > 2 > 0.5 > 0.25, 1/x² is the greatest.\n\n' +
                      'Hence, option (d) is correct.';
      modified = true;
    }

    // 4. Fix Q45 (ID 25567) options and explanation
    if (qNum === 45) {
      r.option_a = '1/p is less than 1';
      r.option_b = '1/p is a positive integer';
      r.option_c = 'p² is less than p';
      r.option_d = '(2/p) – p is a positive number';
      r.correct_answer = 'D';
      r.explanation = 'Given: p is a positive fraction less than 1 (0 < p < 1).\n' +
                      'Since 0 < p < 1, we have 1/p > 1 > p.\n' +
                      'Therefore, (2/p) > 2(1) = 2 > 1 > p.\n' +
                      'Hence, (2/p) – p > 0, which means (2/p – p) is always a positive number.\n\n' +
                      'Hence, option (d) is correct.';
      modified = true;
    }

    // 5. Fix Q46 (ID 25568) options
    if (qNum === 46) {
      r.option_a = 'less than 3/4';
      r.option_b = 'zero';
      r.option_c = 'equal to 1';
      r.option_d = 'greater than or equal to 3/4';
      r.correct_answer = 'D';
      r.explanation = 'Expression: x² + x + 1\n' +
                      'Completing the square:\n' +
                      'x² + x + 1 = (x + 1/2)² + 1 – 1/4 = (x + 1/2)² + 3/4\n\n' +
                      'Since for any real number x, (x + 1/2)² ≥ 0:\n' +
                      'x² + x + 1 ≥ 3/4.\n\n' +
                      'Hence, (x² + x + 1) is always greater than or equal to 3/4 (option d).';
      modified = true;
    }

    // 6. Fix Q48 (ID 25570) explanation conclusion
    if (qNum === 48) {
      r.correct_answer = 'C';
      r.explanation = 'Given expression: E = (16n² + 7n + 6) / n = 16n + 7 + 6/n\n' +
                      'For E to be an integer, n must divide 6.\n' +
                      'The positive integer divisors of 6 are: n = 1, 2, 3, 6 (total 4 values).\n\n' +
                      'Hence, option (c) is correct.';
      modified = true;
    }

    // 7. Fix Q53 (ID 25575) options
    if (qNum === 53) {
      r.option_a = '1/4';
      r.option_b = '1/2';
      r.option_c = '1';
      r.option_d = '2';
      modified = true;
    }

    // 8. Fix Q39 (ID 25561) options
    if (qNum === 39) {
      r.question_text = 'If x = (2/5)y + 3, how does y change when x increases from 1 to 2?';
      r.option_a = 'y increases from –5 to –5/2';
      r.option_b = 'y increases from 2 to 5/2';
      r.option_c = 'y increases from 5 to 5/2';
      r.option_d = 'y decreases from –5 to –5/2';
      r.correct_answer = 'A';
      r.explanation = 'Given: x = (2/5)y + 3  ⇒  (2/5)y = x – 3  ⇒  y = (5/2)(x – 3).\n\n' +
                      'When x = 1:\n' +
                      'y = (5/2)(1 – 3) = (5/2)(–2) = –5.\n\n' +
                      'When x = 2:\n' +
                      'y = (5/2)(2 – 3) = (5/2)(–1) = –5/2 = –2.5.\n\n' +
                      'Since –2.5 > –5, y increases from –5 to –5/2.\n\n' +
                      'Hence, option (a) is correct.';
      modified = true;
    }

    // 9. Fix Q42 (ID 25564) options
    if (qNum === 42) {
      r.option_a = 'a / 2';
      r.option_b = 'b / 2';
      r.option_c = 'ab / 2';
      r.option_d = '(a + b) / 2';
      r.correct_answer = 'D';
      r.explanation = 'If a and b are two distinct rational numbers, then their arithmetic mean (a + b) / 2 is a rational number that lies strictly between a and b.\n\n' +
                      'Hence, option (d) is correct.';
      modified = true;
    }

    // 10. Fix Q86 (ID 25695) option_d
    if (qNum === 86 && r.option_d.includes('\n')) {
      r.option_d = '28700';
      modified = true;
    }

    // 11. Fix Q139 (ID 25661) options
    if (qNum === 139) {
      r.option_a = '1/1000';
      r.option_b = '1/506';
      r.option_c = '253/500';
      r.option_d = 'None of these';
      modified = true;
    }

    // 12. Fix Q351 (ID 25873) explanation conclusion
    if (qNum === 351) {
      r.option_a = '1/3';
      r.option_b = '1 / (3√3)';
      r.option_c = '2/3';
      r.option_d = '1';
      r.correct_answer = 'B';
      r.explanation = 'Given: a² + b² + c² = 1.\n' +
                      'For positive real quantities whose sum is constant, their product is maximum when the quantities are equal:\n' +
                      'a² = b² = c² = 1/3  ⇒  a = b = c = 1/√3.\n\n' +
                      'Therefore, maximum value of abc = (1/√3) × (1/√3) × (1/√3) = 1 / (3√3).\n\n' +
                      'Hence, option (b) is correct.';
      modified = true;
    }

    // 13. Fix Q354 (ID 25876) explanation conclusion
    if (qNum === 354) {
      r.correct_answer = 'A';
      r.explanation = '100²⁵ – 25 = (10²)²⁵ – 25 = 10⁵⁰ – 25.\n' +
                      '10⁵⁰ is 1 followed by 50 zeros.\n' +
                      'Subtracting 25 gives forty-eight 9\'s followed by 75:\n' +
                      '9999...9975 (48 nines, one 7, one 5).\n\n' +
                      'Sum of digits = (48 × 9) + 7 + 5 = 432 + 12 = 444.\n\n' +
                      'Hence, option (a) is correct.';
      modified = true;
    }

    // 14. Fix Q363 (ID 25885) explanation typo
    if (qNum === 363) {
      r.correct_answer = 'D';
      r.explanation = 'Let the two-digit number be 10a + b.\n' +
                      'According to the question:\n' +
                      'a + b = 12  ...(i)\n' +
                      '|a – b| = 6 ...(ii)\n\n' +
                      'Case 1: If a – b = 6:\n' +
                      'Adding (i) and (ii): 2a = 18  ⇒  a = 9.\n' +
                      'Substitute in (i): 9 + b = 12  ⇒  b = 3.\n' +
                      'The number is 93 (Option C).\n\n' +
                      'Case 2: If b – a = 6:\n' +
                      'Adding gives 2b = 18  ⇒  b = 9, so a = 3.\n' +
                      'The number is 39 (Option A).\n\n' +
                      'Since both 39 and 93 are valid two-digit numbers satisfying the conditions, no single unique value among (a) or (c) is uniquely specified.\n\n' +
                      'Hence, the answer is option (d) Other than the given options / Cannot be determined uniquely.';
      modified = true;
    }

    if (modified) {
      updates.push(r);
    }
  });

  console.log(`Prepared ${updates.length} curated fixes. Updating Supabase...`);

  const { error: upErr } = await supabase.from('questions').upsert(updates);
  if (upErr) {
    console.error('Error updating fixes:', upErr);
    process.exit(1);
  }

  console.log('All curated fixes applied successfully in Supabase!');
}

runFixes().catch(console.error);
