const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { buildQuestionBank } = require("./raw_trig_builder.js");

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function ingestTrig() {
  console.log("=== Ingesting Unique Moderate & Hard Trigonometry Questions into Topic 215 ===");

  const allQuestions = buildQuestionBank();

  const easyVariants = [
    "Complementary variant 0",
    "Complementary variant 1",
    "Complementary variant 2",
    "Height variant 0",
    "Height variant 1",
    "Height variant 3",
    "MaxMin variant 3",
    "Standard variant 0",
    "Standard variant 1",
    "Standard variant 4",
    "Ratio variant 0",
    "Ratio variant 3",
    "Ratio variant 4"
  ];

  const modHard = allQuestions.filter(q => !easyVariants.some(ev => q.variantType.includes(ev)));

  const subTypes = [];

  modHard.forEach(q => {
    let concept = q.variantType;
    if (q.variantType.includes("Identity variant 3")) {
      concept = q.question.includes("\\tan^3\\theta")
        ? "Identity: tan + cot = k -> tan^3 + cot^3 (Cubic)"
        : "Identity: tan + cot = k -> tan^2 + cot^2 (Square)";
    } else if (q.variantType.includes("Standard variant 2")) {
      concept = q.question.includes("\\tan(A + B)")
        ? "Standard: Tangent system tan(A+B), tan(A-B)"
        : "Standard: Sine/Cosine system sin(A+B), cos(A-B)";
    } else if (q.variantType.includes("MaxMin variant 1")) {
      concept = "MaxMin: a tan^2 + b cot^2 + c (AM-GM)";
    } else if (q.variantType.includes("MaxMin variant 2")) {
      concept = "MaxMin: a sin^2 + b cosec^2 (AM-GM with domain restriction)";
    } else if (q.variantType.includes("MaxMin variant 0")) {
      concept = "MaxMin: a sin + b cos + c (Range: c +/- sqrt(a^2+b^2))";
    } else if (q.variantType.includes("Identity variant 4")) {
      concept = "Identity: sin^6 + cos^6 + 3 sin^2 cos^2 higher powers";
    } else if (q.variantType.includes("Identity variant 0")) {
      concept = "Identity: sec + tan = p -> sin/cos";
    } else if (q.variantType.includes("Identity variant 1")) {
      concept = "Identity: cosec + cot = p -> cos/sin";
    } else if (q.variantType.includes("Identity variant 2")) {
      concept = "Identity: a sin + b cos = c (Pythagorean Triple matching)";
    } else if (q.variantType.includes("Complementary variant 3")) {
      concept = "Complementary: Linear acute angle solve sin(A) = cos(B)";
    } else if (q.variantType.includes("Complementary variant 4")) {
      concept = "Complementary: Product tan(m theta) tan(n theta) = 1";
    } else if (q.variantType.includes("Standard variant 3")) {
      concept = "Standard: Algebraic solve for x in trigonometric expression";
    } else if (q.variantType.includes("Ratio variant 1")) {
      concept = "Ratio: tan theta -> (k1 sin + cos)/(k1 sin - cos) homogeneous fraction";
    } else if (q.variantType.includes("Ratio variant 2")) {
      concept = "Ratio: sec theta -> cosec theta - cot theta";
    } else if (q.variantType.includes("Height variant 2")) {
      concept = "Height & Distance: Tower elevation walking d meters (30 to 60 deg)";
    }

    if (!subTypes.some(s => s.concept === concept)) {
      subTypes.push({ concept, q });
    }
  });

  console.log(`Found ${subTypes.length} unique concept questions.`);

  const optLetters = ['A', 'B', 'C', 'D'];

  const rowsToInsert = subTypes.map((item, idx) => {
    const q = item.q;
    const correctOptLetter = optLetters[q.correct];
    const correctOptVal = q.options[q.correct];

    // Clean up steps
    const cleanedSteps = q.steps.map((s, sIdx) => {
      let stepStr = s.trim();

      // Fix specific generator phrasing and formatting
      if (stepStr.includes("Taking the ratio cancels b:")) {
        stepStr = stepStr.replace("Taking the ratio cancels b: $\\dfrac{53}{43} = \\frac{53}{43}$.", "Taking the ratio of numerator to denominator gives $\\dfrac{53}{43}$.");
      }
      if (stepStr.includes("+ (-10^\\circ)")) {
        stepStr = stepStr.replace("+ (-10^\\circ)", "- 10^\\circ");
      }
      if (stepStr.includes("Thus 7\\theta + 2\\theta = 90^\\circ")) {
        stepStr = stepStr.replace("Thus 7\\theta + 2\\theta = 90^\\circ", "Thus $7\\theta + 2\\theta = 90^\\circ$");
      }
      if (stepStr.includes("Therefore, 3A - 1B = 3(60^\\circ) - 1(30^\\circ) = 150^\\circ.")) {
        stepStr = "Therefore, $3A - B = 3(60^\\circ) - 30^\\circ = 150^\\circ$.";
      }
      if (stepStr.includes("Therefore, 2A - 2B = 2(45^\\circ) - 2(15^\\circ) = 60^\\circ.")) {
        stepStr = "Therefore, $2A - 2B = 2(45^\\circ) - 2(15^\\circ) = 60^\\circ$.";
      }
      if (stepStr.includes("Equality occurs when $36\\sin^2\\theta = 9\\csc^2\\theta")) {
        stepStr = "Equality occurs when $36\\sin^2\\theta = 9\\csc^2\\theta \\Rightarrow \\sin^4\\theta = \\frac{9}{36} = \\frac{1}{4} \\Rightarrow \\sin^2\\theta = \\frac{1}{2}$, which corresponds to $\\theta = 45^\\circ$ (a valid acute angle).";
      }

      return `${sIdx + 1}. ${stepStr}`;
    });

    const explanation = `**Step-by-Step Solution:**\n\n${cleanedSteps.join("\n")}\n\n**Correct Answer:** Option (${correctOptLetter}) $${correctOptVal.replace(/^\$|\$$/g, '')}$`;

    const difficulty = (item.concept.includes("AM-GM") || item.concept.includes("higher powers") || item.concept.includes("Cubic"))
      ? "hard"
      : "medium";

    return {
      topic_id: 215,
      question_text: q.question,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: correctOptLetter,
      explanation: explanation,
      difficulty: difficulty,
      exam_tag: "Trigonometry Practice",
      is_active: true
    };
  });

  // Check if topic 215 already has questions
  const { count: existingCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', 215);

  console.log(`Current questions in Topic 215: ${existingCount}`);

  // Insert rows
  const { data: inserted, error: insertError } = await supabase
    .from('questions')
    .insert(rowsToInsert)
    .select('id, question_text, correct_answer');

  if (insertError) {
    console.error("❌ Error inserting questions:", insertError);
    process.exit(1);
  }

  console.log(`✔ Successfully inserted ${inserted.length} questions into Topic 215!`);
  inserted.forEach((q, i) => {
    console.log(`  [ID: ${q.id}] Q${i+1}: ${q.question_text.slice(0, 60)}... -> Ans: ${q.correct_answer}`);
  });
}

ingestTrig();
