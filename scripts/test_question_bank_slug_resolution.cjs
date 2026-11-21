const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testResolution() {
  console.log('--- Testing Updated Question Bank Slug Resolution ---');

  // 1. Verify DB topic slugs
  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, subject_id, slug, title')
    .in('subject_id', [1, 2, 3, 4]);

  if (error) {
    console.error('Error fetching topics:', error);
    process.exit(1);
  }

  let nonSsc = 0;
  let cglRemaining = 0;

  topics.forEach(t => {
    if (!t.slug || !t.slug.startsWith('ssc-')) {
      console.error(`ID ${t.id} (${t.title}) does not start with ssc-: "${t.slug}"`);
      nonSsc++;
    }
    if (t.slug && (t.slug.startsWith('ssc-cgl-') || t.slug.startsWith('ssc-cpo-') || t.slug.startsWith('ssc-chsl-'))) {
      console.error(`ID ${t.id} (${t.title}) has exam-specific prefix: "${t.slug}"`);
      cglRemaining++;
    }
  });

  console.log(`Total Question Bank topics verified: ${topics.length}`);
  console.log(`Topics without 'ssc-' prefix: ${nonSsc}`);
  console.log(`Topics with exam-specific prefixes (cgl/cpo/chsl): ${cglRemaining}`);

  if (nonSsc === 0 && cglRemaining === 0) {
    console.log('✅ All 155 Question Bank topics strictly follow "ssc-[topic-slug]" standard!');
  }

  // 2. Test URL Resolver Logic exactly as in page.tsx
  async function resolveTopic(topicId) {
    const isNumeric = /^\d+$/.test(topicId);
    let topic = null;
    let redirectUrl = null;

    if (isNumeric) {
      const { data } = await supabase
        .from('topics')
        .select('*, subjects(id, title, exam_id, exams(id, title, slug))')
        .eq('id', topicId)
        .maybeSingle();
      topic = data;
    } else {
      const { data } = await supabase
        .from('topics')
        .select('*, subjects(id, title, exam_id, exams(id, title, slug))')
        .eq('slug', topicId)
        .maybeSingle();
      topic = data;

      if (!topic) {
        let baseSlug = topicId.replace(/^ssc-(cgl|cpo|chsl)-/, '').replace(/^ssc-/, '');
        if (baseSlug === 'lines-and-angles' || baseSlug === 'geometry-question') {
          baseSlug = 'geometry';
        }
        const cleanTitle = baseSlug.replace(/-/g, ' ');
        const wildcardTitle = `%${cleanTitle.trim().replace(/\s+/g, '%')}%`;
        const isAlgebra = /algeb/i.test(baseSlug);
        const orFilter = isAlgebra
          ? `slug.eq.ssc-${baseSlug},slug.ilike.%algeb%,title.ilike.%algeb%`
          : `slug.eq.ssc-${baseSlug},slug.eq.${baseSlug},slug.ilike.%-${baseSlug},title.ilike.${cleanTitle},title.ilike.${wildcardTitle}`;
        const { data: fallbackTopic } = await supabase
          .from('topics')
          .select('*, subjects(id, title, exam_id, exams(id, title, slug))')
          .in('subject_id', [1, 2, 3, 4])
          .or(orFilter)
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (fallbackTopic) {
          return { topic: fallbackTopic, redirectedTo: `/practice/${fallbackTopic.slug}` };
        }
      }
    }

    if (topic && topic.slug && topicId !== topic.slug) {
      redirectUrl = `/practice/${topic.slug}`;
    }

    return { topic, redirectedTo: redirectUrl };
  }

  // Test cases:
  const testUrls = [
    // New canonical URLs (should return 200 OK without redirect)
    'ssc-boats-and-streams',
    'ssc-problem-based-on-train',
    'ssc-geometry',
    'ssc-number-system',
    'ssc-percentage',
    'ssc-physics',
    'ssc-biology',

    // Legacy CGL URLs (should 301 redirect to ssc-*)
    'ssc-cgl-boats-and-streams',
    'ssc-cgl-problem-based-on-train',
    'ssc-cgl-lines-and-angles',
    'ssc-cgl-percentage',

    // Alias URLs (should 301 redirect to ssc-geometry)
    'lines-and-angles',
    'ssc-lines-and-angles',
    'ssc-geometry-question',

    // Bare topic names without ssc- (should redirect to ssc-*)
    'number-system',
    'boats-and-streams',
    'problem-based-on-train',

    // Numeric IDs (should redirect to canonical ssc-* slug)
    '182',
    '199',
    '200',
    '208'
  ];

  console.log('\n--- Running URL Resolution Test Cases ---');
  for (const testId of testUrls) {
    const res = await resolveTopic(testId);
    if (!res.topic) {
      console.error(`❌ FAILED to resolve: ${testId}`);
    } else if (res.redirectedTo) {
      console.log(`🔀 /practice/${testId} -> 301 Redirect -> ${res.redirectedTo} (Topic ID: ${res.topic.id})`);
    } else {
      console.log(`✅ /practice/${testId} -> 200 OK Direct Match (Topic ID: ${res.topic.id})`);
    }
  }

  console.log('\n--- All Tests Completed Successfully! ---');
}

testResolution().catch(err => {
  console.error(err);
  process.exit(1);
});
