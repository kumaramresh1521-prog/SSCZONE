import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Bilingual Parsers
function splitBilingualText(text) {
  if (!text) return { english: "", hindi: "", isBilingual: false };
  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) return { english: text.trim(), hindi: "", isBilingual: false };

  const firstHi = text.search(devanagariRegex);
  const prefix = text.substring(0, firstHi).trim();
  const wordsInPrefix = prefix.split(/\s+/).filter(Boolean).length;
  if (wordsInPrefix < 3 && !/[?!.]\s*$/.test(prefix)) {
    return { english: text.trim(), hindi: text.trim(), isBilingual: false };
  }

  const m = prefix.match(/(\?|\.\s|\.\n|\:\s*)\s*(["'\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$/);
  if (m && m.index !== undefined) {
    const isDecimal = m[1].startsWith(".") && m.index > 0 && /\d/.test(prefix[m.index - 1]);
    if (!isDecimal) {
      const punctPos = m.index + m[1].length;
      const en = text.substring(0, punctPos).trim();
      const hi = text.substring(punctPos).trim();
      if (hi.length > 0 && en.length > 0) return { english: en, hindi: hi, isBilingual: true };
    }
  }

  if (wordsInPrefix >= 4) {
    return { english: text.substring(0, firstHi).trim(), hindi: text.substring(firstHi).trim(), isBilingual: true };
  }

  return { english: text.trim(), hindi: text.trim(), isBilingual: false };
}

function splitBilingualOption(text) {
  if (!text) return { english: "", hindi: "", isBilingual: false };
  const devanagariRegex = /[\u0900-\u097F]/;
  if (!devanagariRegex.test(text)) return { english: text.trim(), hindi: "", isBilingual: false };

  if (text.includes(" / ")) {
    const parts = text.split(" / ");
    if (parts.length >= 2) {
      const en = parts[0].trim();
      const hi = parts.slice(1).join(" / ").trim();
      if (devanagariRegex.test(hi)) return { english: en, hindi: hi, isBilingual: true };
    }
  }

  const firstHi = text.search(devanagariRegex);
  const prefix = text.substring(0, firstHi).trim();
  if (prefix.length === 0) return { english: text.trim(), hindi: text.trim(), isBilingual: false };

  return { english: prefix, hindi: text.substring(firstHi).trim(), isBilingual: true };
}

function normalizeForMatch(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[\u0900-\u097F]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 100);
}

/**
 * High-Precision Math Topic Classifier
 */
export function classifyMathTopic(text, topicMap) {
  const t = text.toLowerCase();

  // 1. Set Theory
  if (/\bset\s+[ab]\b|finite subset|infinite subset|subsets of|universal set|null set|समुच्चय/i.test(t)) {
    return topicMap["Set theory"] || 205;
  }

  // 2. Data Interpretation / Tables / Charts
  if (/table shows|table -|monthly sales|sales person|bar graph|pie chart|line graph|histogram|तालिका|दंड आरेख|पाई चार्ट/i.test(t)) {
    if (/pie/i.test(t)) return topicMap["Pie or Circular chart"] || 221;
    if (/bar/i.test(t)) return topicMap["Bar graph"] || 219;
    if (/line/i.test(t)) return topicMap["Line graph"] || 220;
    return topicMap["Tabulation"] || 218;
  }

  // 3. Height and Distance (must be before Geometry/Trig)
  if (/angle of elevation|angle of depression|top of a cliff|foot of the tower|top of a tree|height of the cliff|top of a building|shadow of a tower|two poles.*height.*road|elevation are \d+|उन्नयन कोण|अवनमन कोण|मीनार की ऊंचाई|खंभों की ऊंचाई/i.test(t)) {
    return topicMap["Height and Distance"] || 216;
  }

  // 4. Circles (Geometry) - Must be before Trig so "tangent" is matched here!
  if (/concentric circle|chord|tangent|radius of a circle|radii in the ratio|diameter of a circle|diameter of \d+|arc of a circle|in a circle|circle with centre|minor arc|major arc|वृत्त|जीवा|स्पर्श रेखा|स्पर्शरेखा|त्रिज्या|व्यास/i.test(t)) {
    return topicMap["Circle"] || 211;
  }

  // 5. Triangles (Geometry)
  if (/equilateral triangle|isosceles triangle|right-angled triangle|hypotenuse|orthocenter|centroid|incenter|circumcenter|in triangle abc|in △abc|in triangle pqr|in △pqr|median|congruent triangle|similar triangle|angles of a triangle|समबाहु त्रिभुज|समद्विबाहु त्रिभुज|समकोण त्रिभुज|केन्द्रक|माध्यिका|त्रिभुज/i.test(t)) {
    return topicMap["triangles"] || 209;
  }

  // 6. Quadrilateral and polygon (Geometry)
  if (/quadrilateral|parallelogram|rhombus|trapezium|trapezoid|polygon|regular hexagon|pentagon|interior angle.*polygon|exterior angle.*polygon|चतुर्भुज|समांतर चतुर्भुज|समचतुर्भुज|समलंब|बहुभुज/i.test(t)) {
    return topicMap["Quadrilateral and polygon"] || 210;
  }

  // 7. Lines and angles (Geometry)
  if (/parallel lines|transversal|supplementary angle|complementary angle|vertically opposite angle|lines ab and cd|angle between two lines|समानांतर रेखाएं|पूरक कोण|संपूरक कोण/i.test(t)) {
    return topicMap["Lines and angles"] || 208;
  }

  // 8. Surface Area and Volume (3D Mensuration)
  if (/cylinder|cone\b|sphere|hemisphere|cuboid|cube\b|prism|pyramid|curved surface area|total surface area|volume of|melted and recast|radius of sphere|radius of cone|radius of cylinder|height of cylinder|slant height|hexagonal prism|बेलन|शंकु|गोला|अर्धगोला|घनाभ|घन\b|प्रिज्म|पिरामिड|आयतन|पृष्ठीय क्षेत्रफल/i.test(t)) {
    return topicMap["Surface Area and Volume"] || 213;
  }

  // 9. Area and perimeter (2D Mensuration)
  if (/perimeter of|circumference|area of the rectangular|area of rectangle|area of square|area of a circle|cost of fencing|cost of paving|area of rhombus|area of trapezium|revolutions.*distance covered|परिमाप|परिधि|क्षेत्रफल/i.test(t)) {
    return topicMap["Area and perimeter"] || 212;
  }

  // 10. Coordinate Geometry
  if (/coordinate|slope of the line|collinear|x-axis|y-axis|distance between.*points|quadrant|ढलान|निर्देशांक/i.test(t)) {
    return topicMap["Coordinate Geometry"] || 214;
  }

  // 11. Trigonometry (High Precision: Only actual trig expressions, never common words)
  if (
    /(?<![a-z])(sin|cos|tan|cot|sec|cosec)(\^2|\^3|\^4|²|³|⁴|\s*[\(θθαβγφ\d]|(\s+(?:[A-Z]|[a-z]\b|\d+°)))|sin\^|cos\^|tan\^|cot\^|sec\^|cosec\^|sin²|cos²|tan²|cot²|sec²|cosec²|sin\(|cos\(|tan\(|cot\(|sec\(|cosec\(|value of θ|acute angle|त्रिकोणमिति/i.test(t)
  ) {
    return topicMap["Trigonometry"] || 215;
  }

  // 12. Boats and Streams
  if (/boat|motorboat|speed of.*stream|speed of.*boat|still water|downstream|upstream|नाव|धारा|शांत जल|अनुप्रवाह|ऊर्ध्वप्रवाह/i.test(t)) {
    return topicMap["Boats and Streams"] || 200;
  }

  // 13. Problem based on train
  if (/train|two trains|crosses a pole|crosses a platform|crosses a bridge|length of the train|speed of the train|speed of train|cross each other.*train|ट्रेन|रेलगाड़ी|प्लेटफॉर्म/i.test(t)) {
    return topicMap["Problem Based on train"] || 199;
  }

  // 14. Time, Speed and Distance
  if (/km\/h|kmph|m\/s\b|m\/sec|speed of a car|walking at a speed|travels a distance|average speed|reaches late|reaches early|journey|speed of \d+|cross paths.*minutes|चाल|दूरी|किमी\/घंटा|गति/i.test(t)) {
    return topicMap["Time , Speed and Distance"] || 198;
  }

  // 15. Pipes and Cisterns
  if (/cistern|pipe a|pipe b|tap a|tap b|empties the tank|fills the tank|leak in the tank|water every second|fills.*liters.*second|टंकी|पाइप|हौज|नल/i.test(t)) {
    return topicMap["Pipes and Cisterns"] || 197;
  }

  // 16. Work and Time
  if (/piece of work|complete the work|finish the work|working together|can do a work|efficiency of a|wages of a and b|alone can do|men can do|women can do|कार्य|काम पूरा कर सकता है|मिलकर कार्य/i.test(t)) {
    return topicMap["Work and TIME"] || 196;
  }

  // 17. Partnership
  if (/partnership|invested|investment of|started a business with|profit sharing ratio|joined him with|joined with ₹|withdrew ₹|profit ratio at the end|साझेदारी|व्यापार शुरू किया|निवेश/i.test(t)) {
    return topicMap["Partnership"] || 193;
  }

  // 18. Compound Interest
  if (/compound interest|compounded annually|compounded half-yearly|compounded quarterly|चक्रवृद्धि ब्याज/i.test(t)) {
    return topicMap["Compound Interest"] || 195;
  }

  // 19. Simple Interest
  if (/simple interest|rate of simple interest|sum doubles itself in|sum becomes \d+ times at simple|साधारण ब्याज/i.test(t)) {
    return topicMap["Simple and Interest"] || 194;
  }

  // 20. Discount
  if (/marked price|discount|successive discount|single equivalent discount|list price|allow a discount|marked at|छूट|अंकित मूल्य|बट्टा/i.test(t)) {
    return topicMap["Discount"] || 191;
  }

  // 21. Profit and Loss
  if (/cost price|selling price|loss percentage|profit percentage|sold for|bought for|marked up by|dishonest dealer|dishonest shopkeeper|\bcp\b.*\bsp\b|\bsp\b.*\bcp\b|gain of|loss of|gains \d+.*allowing|profit of|profit to the cost price|price of \d+ boxes|लाभ प्रतिशत|हानि प्रतिशत|क्रय मूल्य|विक्रय मूल्य/i.test(t)) {
    return topicMap["profit and loss"] || 190;
  }

  // 22. Problem based on ages
  if (/ratio of ages|years ago,.*age|present age|father.*son|mother.*daughter|years hence.*age|आयु|वर्तमान आयु|पिता.*पुत्र/i.test(t)) {
    return topicMap["Problem based on ages"] || 188;
  }

  // 23. Mixture and Alligation
  if (/mixture of|alligation|ratio of milk and water|acid and water|replaced with water|vessel contains|liters of pure syrup|drawn off.*syrup|मिश्रण|दूध और पानी|मिश्र धातु/i.test(t)) {
    return topicMap["Mixture and Alligation"] || 192;
  }

  // 24. Average
  if (/average salary|average weight|average score|average age|batting average|bowling average|average of \d+ numbers|average of first \d+|mean of|overall average|औसत/i.test(t)) {
    return topicMap["Average"] || 186;
  }

  // 25. Percentage
  if (/percent|percentage|increased by \d+%|decreased by \d+%|exam.*passed.*failed|population of a town|passed in|failed in|is \d+% more than|is \d+% less than|women constitute.*population|प्रतिशत|जनसंख्या/i.test(t)) {
    return topicMap["Percentage"] || 189;
  }

  // 26. Ratio and Proportion
  if (/ratio of|mean proportional|third proportional|fourth proportional|in the ratio|\ba : b\b|\ba:b\b|duplicate ratio|sub-duplicate ratio|marbles.*in the ratio|अनुपात|समानुपात|मध्याअनुपाती|तृतीयानुपाती|चतुर्थानुपाती/i.test(t)) {
    return topicMap["Ratio and Proportion"] || 187;
  }

  // 27. HCF and LCM
  if (/\bhcf\b|\blcm\b|highest common factor|least common multiple|greatest number which divides|smallest number divisible by|product of two numbers is \d+.*hcf|महत्तम समापवर्तक|लघुत्तम समापवर्त्य/i.test(t)) {
    return topicMap["HCF and LCM"] || 184;
  }

  // 28. Algebra & Polynomials
  if (/x \+ 1\/x|x\^2 \+ 1\/x\^2|x\^3 \+ 1\/x\^3|a\^3 \+ b\^3|p - q =|p\^2 \+ q\^2|polynomial|algebraic expression|a \+ b \+ c = 0|x \+ y \+ z =|find the value of x\^|31³ \+ 18³|p²\+ q2|बीजगणित/i.test(t)) {
    return topicMap["Algebric Polynomial and identities"] || 201;
  }

  // 29. Linear and Quadratic Equation
  if (/quadratic equation|roots of the equation|alpha and beta|discriminant|roots are equal|द्विघात समीकरण/i.test(t)) {
    return topicMap["Linear and Quadratic Equation"] || 202;
  }

  // 30. Progression (AP / GP)
  if (/arithmetic progression|geometric progression|\ba\.p\.\b|\bg\.p\.\b|first term.*common difference|sum of first \d+ terms|समांतर श्रेणी|गुणोत्तर श्रेणी/i.test(t)) {
    return topicMap["Progression"] || 203;
  }

  // 31. Permutation and Combination
  if (/permutation|combination|how many ways|can be arranged|can be selected|arranged in a row|committee of|क्रमचय|संचय/i.test(t)) {
    return topicMap["Permutation and Combination"] || 206;
  }

  // 32. Probability
  if (/probability|dice are rolled|die is thrown|cards.*drawn|pack of 52|coin is tossed|प्रायिकता/i.test(t)) {
    return topicMap["Probablity"] || 207;
  }

  // 33. Statistics
  if (/\bmode\b|\bmedian\b|\bvariance\b|standard deviation|mean deviation|frequency distribution|बहुलक|माध्यिका/i.test(t)) {
    return topicMap["Statistics"] || 217;
  }

  // 34. Number Series
  if (/number series|find the wrong term|find the next term in the series|complete the series|गलत पद|अगला पद/i.test(t)) {
    return topicMap["Number series"] || 183;
  }

  // 35. Indices and Surds / Simplification
  if (/√|cube root|surds|indices|powers of|घातांक|करणी/i.test(t)) {
    return topicMap["Indices and Surds"] || 204;
  }
  if (/simplify|bodmas|evaluate|value of \(|value of:|सरल करें|सरलीकृत/i.test(t)) {
    return topicMap["Simlpification"] || 185;
  }

  // 36. Number System (Divisibility, Unit digit, Remainder, Fractions)
  return topicMap["Number System"] || 182;
}

async function main() {
  console.log("===============================================================");
  console.log("⚡ STARTING MATH PYQ TO QUESTION BANK CHAPTER-WISE POPULATION");
  console.log("===============================================================\n");

  const startTime = Date.now();

  // 1. Fetch all Topics for Mathematics (Subject 1)
  const { data: topicList, error: tErr } = await supabase
    .from("topics")
    .select("id, title")
    .eq("subject_id", 1);

  if (tErr || !topicList) {
    console.error("Failed to load topics:", tErr);
    process.exit(1);
  }

  const topicMap = {};
  const topicNames = {};
  topicList.forEach((t) => {
    topicMap[t.title] = t.id;
    topicNames[t.id] = t.title;
  });

  console.log(`✓ Loaded ${topicList.length} Math Chapters/Topics from database.`);

  // 2. Fetch existing questions to build fingerprint index for Duplicate Prevention
  console.log("Building duplicate index from existing Question Bank...");
  let existingFingerprints = new Set();
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: existingBatch, error: ebErr } = await supabase
      .from("questions")
      .select("question_text")
      .range(from, from + pageSize - 1);

    if (ebErr) {
      console.error("Error reading existing questions:", ebErr);
      break;
    }

    if (existingBatch && existingBatch.length > 0) {
      existingBatch.forEach((q) => {
        const norm = normalizeForMatch(q.question_text);
        if (norm && norm.length >= 15) {
          existingFingerprints.add(norm);
        }
      });
      from += existingBatch.length;
      if (existingBatch.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }
  console.log(`✓ Indexed ${existingFingerprints.size} unique question fingerprints for duplicate check.\n`);

  // 3. Fetch all PYQ Papers
  const { data: papers, error: pErr } = await supabase
    .from("previous_papers")
    .select("id, title, year, exams(title)")
    .order("id");

  if (pErr || !papers) {
    console.error("Failed to fetch papers:", pErr);
    process.exit(1);
  }

  console.log(`✓ Found ${papers.length} Previous Year Shift Papers.`);

  // 4. Fetch all Math questions (question_number between 51 and 75)
  console.log("Fetching all Quantitative Aptitude (Q.51 - Q.75) questions from papers...");
  let allMathQuestions = [];
  let pFrom = 0;
  let pHasMore = true;

  while (pHasMore) {
    const { data: qBatch, error: qbErr } = await supabase
      .from("paper_questions")
      .select("*")
      .gte("question_number", 51)
      .lte("question_number", 75)
      .range(pFrom, pFrom + 1000 - 1);

    if (qbErr) {
      console.error("Error fetching math questions:", qbErr);
      break;
    }

    if (qBatch && qBatch.length > 0) {
      allMathQuestions.push(...qBatch);
      pFrom += qBatch.length;
      if (qBatch.length < 1000) pHasMore = false;
    } else {
      pHasMore = false;
    }
  }

  console.log(`✓ Total Math Questions Extracted from Papers: ${allMathQuestions.length}\n`);

  // Map paper metadata by paper_id
  const paperMeta = {};
  papers.forEach((p) => {
    const examName = p.exams?.title || "SSC CGL";
    const year = p.year || 2024;
    const tier = (p.title || "").toLowerCase().includes("tier 2") || (p.title || "").toLowerCase().includes("tier-ii") ? "Tier 2" : "Tier 1";
    paperMeta[p.id] = {
      tag: `${examName} ${year} ${tier}`,
      year: year,
      tier: tier,
    };
  });

  // 5. Process, Classify, Deduplicate & Prepare for Insertion
  console.log("Classifying questions into chapters & checking duplicates...");

  let insertedCount = 0;
  let skippedDuplicatesCount = 0;
  const chapterBreakdown = {};

  const rowsToInsert = [];

  for (const q of allMathQuestions) {
    const splitQ = splitBilingualText(q.question_text);
    const cleanEn = splitQ.english || q.question_text;
    const cleanHi = splitQ.isBilingual ? splitQ.hindi : null;
    const norm = normalizeForMatch(cleanEn);

    // Duplicate Check
    if (norm && norm.length >= 15 && existingFingerprints.has(norm)) {
      skippedDuplicatesCount++;
      continue;
    }

    if (norm && norm.length >= 15) {
      existingFingerprints.add(norm);
    }

    // Classify into exact Math Chapter
    const targetTopicId = classifyMathTopic(q.question_text, topicMap);
    const chapterName = topicNames[targetTopicId] || "Number System";

    chapterBreakdown[chapterName] = (chapterBreakdown[chapterName] || 0) + 1;

    const splitA = splitBilingualOption(q.option_a);
    const splitB = splitBilingualOption(q.option_b);
    const splitC = splitBilingualOption(q.option_c);
    const splitD = splitBilingualOption(q.option_d);

    const meta = paperMeta[q.paper_id] || { tag: "SSC CGL 2024 Tier 1", year: 2024, tier: "Tier 1" };

    rowsToInsert.push({
      topic_id: targetTopicId,
      question_text: cleanEn,
      question_text_hi: cleanHi,
      option_a: splitA.english || q.option_a,
      option_b: splitB.english || q.option_b,
      option_c: splitC.english || q.option_c,
      option_d: splitD.english || q.option_d,
      option_a_hi: splitA.isBilingual ? splitA.hindi : null,
      option_b_hi: splitB.isBilingual ? splitB.hindi : null,
      option_c_hi: splitC.isBilingual ? splitC.hindi : null,
      option_d_hi: splitD.isBilingual ? splitD.hindi : null,
      correct_answer: (q.correct_answer || "A").trim().toUpperCase(),
      explanation: q.explanation || null,
      exam_tag: meta.tag,
      tier_level: meta.tier,
      year_reference: meta.year,
      difficulty: "medium",
      is_active: true,
    });
  }

  console.log(`\nReady to insert ${rowsToInsert.length} new unique questions (${skippedDuplicatesCount} duplicates skipped).\n`);

  // 6. Batch Insert in chunks of 50
  const insertChunkSize = 50;
  for (let i = 0; i < rowsToInsert.length; i += insertChunkSize) {
    const chunk = rowsToInsert.slice(i, i + insertChunkSize);
    const { error: insErr } = await supabase.from("questions").insert(chunk);
    if (insErr) {
      console.error(`Error inserting chunk ${i} - ${i + chunk.length}:`, insErr);
    } else {
      insertedCount += chunk.length;
      process.stdout.write(`\rInserted: ${insertedCount} / ${rowsToInsert.length} questions into Question Bank...`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n\n===============================================================");
  console.log("📊 MATHEMATICS POPULATION & CLASSIFICATION ANALYSIS REPORT");
  console.log("===============================================================");
  console.log(`⏱️ Execution Time:             ${durationSec} seconds`);
  console.log(`📚 Total PYQ Papers Scanned:    ${papers.length}`);
  console.log(`🔢 Total Math Questions Found:  ${allMathQuestions.length}`);
  console.log(`✅ Newly Inserted to QB:        ${insertedCount} questions`);
  console.log(`🛡️ Duplicates Protected:       ${skippedDuplicatesCount} questions (Already in QB)`);
  console.log(`📁 Total Active Chapters:       ${Object.keys(chapterBreakdown).length}`);
  console.log("---------------------------------------------------------------");
  console.log("📋 CHAPTER-WISE BREAKDOWN:");
  console.log("---------------------------------------------------------------");

  const sortedChapters = Object.entries(chapterBreakdown).sort((a, b) => b[1] - a[1]);
  sortedChapters.forEach(([chap, count], idx) => {
    const padChap = chap.padEnd(35, " ");
    console.log(` ${String(idx + 1).padStart(2, " ")}. ${padChap} : ${count} Questions`);
  });

  console.log("===============================================================\n");
}

main();
