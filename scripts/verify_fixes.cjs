const { supabase } = require('./db_helper.cjs');

async function verify() {
  console.log('=== VERIFYING FIXES IN DATABASE ===\n');

  const checkPQIds = [17878, 17879, 18081, 14361, 15352, 17153, 17168, 17164, 17166, 2357, 2174, 2076, 17197, 17114, 17124, 17125, 16008, 26687, 26920];
  const { data: pqs, error: pqErr } = await supabase.from('paper_questions').select('id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation').in('id', checkPQIds);

  if (pqErr) {
    console.error('Error fetching paper_questions:', pqErr);
    return;
  }

  pqs.forEach(q => {
    console.log(`[PQ ID: ${q.id} | Q# ${q.question_number}]`);
    console.log(`   Q: ${q.question_text.slice(0, 100)}...`);
    console.log(`   Ans: ${q.correct_answer} | Has Explanation: ${Boolean(q.explanation)}`);
  });

  const checkQIds = [17762, 36496];
  const { data: qs, error: qErr } = await supabase.from('questions').select('id, question_text, option_b, correct_answer, explanation').in('id', checkQIds);
  if (qErr) {
    console.error('Error fetching questions:', qErr);
    return;
  }

  qs.forEach(q => {
    console.log(`[Q ID: ${q.id}]`);
    console.log(`   Q: ${q.question_text.slice(0, 100)}...`);
    console.log(`   Opt B: ${q.option_b}`);
    console.log(`   Ans: ${q.correct_answer} | Has Explanation: ${Boolean(q.explanation)}`);
  });

  // Verify status of question_reports
  const { data: unresolvedReports } = await supabase.from('question_reports').select('id').neq('status', 'resolved');
  console.log(`\nUnresolved question_reports remaining: ${unresolvedReports ? unresolvedReports.length : 0}`);

  // Verify status of blogs sys-reports
  const { data: blogList } = await supabase.from('blogs').select('id, content').ilike('slug', 'sys-report%');
  let unresolvedBlogs = 0;
  if (blogList) {
    blogList.forEach(b => {
      try {
        const p = JSON.parse(b.content);
        if (p.status !== 'resolved') unresolvedBlogs++;
      } catch (e) {}
    });
  }
  console.log(`Unresolved blog sys-reports remaining: ${unresolvedBlogs}`);
}

verify().catch(console.error);
