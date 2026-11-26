const { supabase } = require('./db_helper.cjs');
const fs = require('fs');
const path = require('path');

async function fixTriangleAndAngleQs() {
  console.log('Fixing Triangle and Angle Zoom questions in paper_questions...\n');

  const updates = [
    // 1. ID 19574: In a right angle triangle ABC, angle B = 90, if tanA = 1, then 4 sinA cosA = ?
    {
      id: 19574,
      paper_id: 74,
      question_number: 68,
      backupFile: 'ssc-cgl-2024-17-september-2024-shift-1.json',
      update: {
        question_text: 'In a right-angled $\\triangle ABC$ with $\\angle B = 90^\\circ$, if $\\tan A = 1$, then find the value of $4 \\sin A \\cos A$.',
        option_a: '1',
        option_b: '2',
        option_c: '$\\frac{1}{2}$',
        option_d: '4',
        correct_answer: 'B',
        explanation: '**Step-by-Step Solution:**\n1. In right-angled $\\triangle ABC$, $\\angle B = 90^\\circ$.\n2. Given: $\\tan A = 1 \\implies A = 45^\\circ$.\n3. Therefore:\n   $$\\sin A = \\sin 45^\\circ = \\frac{1}{\\sqrt{2}}$$\n   $$\\cos A = \\cos 45^\\circ = \\frac{1}{\\sqrt{2}}$$\n4. Calculating $4 \\sin A \\cos A$:\n   $$4 \\sin A \\cos A = 4 \\times \\frac{1}{\\sqrt{2}} \\times \\frac{1}{\\sqrt{2}} = 4 \\times \\frac{1}{2} = 2$$\n\n**Correct Answer:** Option (B) 2'
      }
    },
    // 2. ID 19372: ABC is equilateral triangle. Midpoints P, Q, R. Side 11 cm. Area of triangle PQR.
    {
      id: 19372,
      paper_id: 72,
      question_number: 66,
      backupFile: 'ssc-cgl-2024-13-september-2024-shift-2.json',
      update: {
        question_text: 'ABC is an equilateral triangle. P, Q and R are the mid-points of sides AB, BC and CA, respectively. If the length of the side of the triangle ABC is 11 cm, then the area (in $\\text{cm}^2$) of $\\triangle PQR$ is:',
        option_a: '$\\frac{21\\sqrt{3}}{16}$',
        option_b: '$\\frac{11\\sqrt{3}}{16}$',
        option_c: '$\\frac{121\\sqrt{3}}{16}$',
        option_d: '$\\frac{111\\sqrt{3}}{16}$',
        correct_answer: 'C',
        explanation: '**Key Geometry Concept:**\nThe triangle formed by joining the mid-points of the sides of a triangle has an area equal to $\\frac{1}{4}$ of the area of the original triangle.\n\n**Step-by-Step Solution:**\n1. Area of equilateral $\\triangle ABC$ with side $a = 11\\text{ cm}$:\n   $$\\text{Area}(\\triangle ABC) = \\frac{\\sqrt{3}}{4} a^2 = \\frac{\\sqrt{3}}{4} \\times 11^2 = \\frac{121\\sqrt{3}}{4}\\text{ cm}^2$$\n2. Since $P, Q, R$ are mid-points:\n   $$\\text{Area}(\\triangle PQR) = \\frac{1}{4} \\times \\text{Area}(\\triangle ABC) = \\frac{1}{4} \\times \\frac{121\\sqrt{3}}{4} = \\frac{121\\sqrt{3}}{16}\\text{ cm}^2$$\n\n**Correct Answer:** Option (C) $\\frac{121\\sqrt{3}}{16}$'
      }
    },
    // 3. ID 17971: The angles of triangle are such that one is average of other two
    {
      id: 17971,
      paper_id: 60,
      question_number: 65,
      backupFile: 'ssc-cgl-2024-9-september-2024-shift-2.json',
      update: {
        question_text: 'The angles of a triangle are such that one angle is the average of the other two. Which of the following can be the angles of the triangle (in radians)?',
        option_a: '$\\frac{\\pi}{6}, \\frac{\\pi}{3}, \\frac{\\pi}{2}$',
        option_b: '$\\frac{\\pi}{3}, \\frac{\\pi}{3}, \\frac{\\pi}{2}$',
        option_c: '$\\frac{\\pi}{6}, \\frac{\\pi}{3}, \\frac{\\pi}{4}$',
        option_d: '$\\frac{\\pi}{2}, \\frac{\\pi}{2}, \\frac{\\pi}{3}$',
        correct_answer: 'A',
        explanation: '**Step-by-Step Solution:**\nLet the angles be $A, B, C$ such that $B = \\frac{A + C}{2} \\implies A + C = 2B$.\nSum of angles of a triangle $= A + B + C = 180^\\circ = \\pi$.\nSubstituting $A + C = 2B$:\n$$2B + B = 180^\\circ \\implies 3B = 180^\\circ \\implies B = 60^\\circ = \\frac{\\pi}{3}$$\nTesting Option (A): $\\frac{\\pi}{6} (30^\\circ), \\frac{\\pi}{3} (60^\\circ), \\frac{\\pi}{2} (90^\\circ)$:\n$$30^\\circ + 60^\\circ + 90^\\circ = 180^\\circ$$\n$$60^\\circ = \\frac{30^\\circ + 90^\\circ}{2} = 60^\\circ \\quad \\text{(Satisfies the condition)}$$\n\n**Correct Answer:** Option (A) $\\frac{\\pi}{6}, \\frac{\\pi}{3}, \\frac{\\pi}{2}$'
      }
    },
    // 4. ID 21373: Circle arc subtends angle 138 at center, measure of angle CBP
    {
      id: 21373,
      paper_id: 92,
      question_number: 67,
      backupFile: 'ssc-cgl-2024-26-september-2024-shift-2.json',
      update: {
        question_text: 'In a circle with center $O$, an arc $ABC$ subtends an angle of $138^\\circ$ at the centre of the circle. The chord $AB$ is produced to a point $P$. Then, the measure of $\\angle CBP$ is:',
        option_a: '$108^\\circ$',
        option_b: '$42^\\circ$',
        option_c: '$111^\\circ$',
        option_d: '$69^\\circ$',
        correct_answer: 'D',
        explanation: '**Circle Theorem:**\nThe angle subtended by an arc at the circumference is half the angle subtended by it at the centre:\n$$\\angle ACB = \\frac{1}{2} \\times 138^\\circ = 69^\\circ$$\nIn cyclic geometry, the exterior angle at a vertex when a chord is produced equals the interior angle subtended by the arc:\n$$\\angle CBP = \\frac{1}{2} \\times 138^\\circ = 69^\\circ$$\n\n**Correct Answer:** Option (D) $69^\\circ$'
      }
    }
  ];

  for (const item of updates) {
    const { error } = await supabase.from('paper_questions').update(item.update).eq('id', item.id);
    if (error) {
      console.error(`Failed to update PQ ID ${item.id}:`, error.message);
    } else {
      console.log(`✓ Updated PQ ID ${item.id} (Paper ${item.paper_id} Q#${item.question_number})`);
    }

    if (item.backupFile) {
      const bPath = path.join('src/data/pyq_backup', item.backupFile);
      if (fs.existsSync(bPath)) {
        try {
          const raw = fs.readFileSync(bPath, 'utf8');
          const data = JSON.parse(raw);
          if (Array.isArray(data)) {
            const target = data.find(x => x.id === item.id || x.question_number === item.question_number);
            if (target) {
              Object.assign(target, item.update);
              fs.writeFileSync(bPath, JSON.stringify(data, null, 2), 'utf8');
              console.log(`   └─ Synced backup file: ${item.backupFile}`);
            }
          }
        } catch (e) {
          console.error(`   └─ Error syncing backup ${item.backupFile}:`, e.message);
        }
      }
    }
  }

  console.log('\nAll 4 triangle/angle zoom questions updated to clean KaTeX math!');
}

fixTriangleAndAngleQs().catch(console.error);
