const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const blogContent = `
<h2>1. Introduction: Why the SSC Typing Test is a Make-or-Break Stage</h2>
<p>In modern Staff Selection Commission examinations—including <strong>SSC CGL (Tier 2 DEST)</strong>, <strong>SSC CHSL (LDC/JSA)</strong>, and <strong>SSC DEO (Data Entry Operator)</strong>—the Data Entry Skill Test is no longer a mere formality. It is conducted on the <strong>very same day</strong> as the Tier 2 main written examination, and qualifying it is <strong>mandatory</strong>. Even if a candidate secures rank 1 in written papers (Quantitative Aptitude, Reasoning, English, General Awareness), exceeding the permissible typing error cutoff results in instantaneous disqualification from both DEST and non-DEST posts.</p>

<p>This master guide breaks down the official <strong>Tata Consultancy Services (TCS iON) evaluation formula</strong>, provides an authoritative <strong>A-to-Z glossary of every typing term</strong>, details the exact category-wise error cutoffs, explains the crucial distinction between <em>Full Mistakes</em> and <em>Half Mistakes</em>, and reveals time-tested strategies to build speed and pinpoint accuracy.</p>

<hr />

<h2>2. Official SSC & TCS Typing Evaluation Formula</h2>
<p>Candidates often misunderstand how speed and errors are evaluated in the official exam hall. SSC does not count "dictionary words" directly because some words have 3 letters while others have 12 letters. Instead, standard international typing norms are followed:</p>

<div style="background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; font-family: monospace;">
  <p style="color: #38bdf8; font-weight: bold; margin-bottom: 8px;">[STANDARD DEFINITIONS]</p>
  <p>1 Standard Word = Exactly 5 Key Depressions (Keystrokes, including spaces & punctuation)</p>
  <p>Total Words Typed = Total Key Depressions / 5</p>
  <p>Gross WPM = (Total Key Depressions / 5) / Time in Minutes</p>
  <p style="color: #fbbf24; font-weight: bold; margin-top: 14px;">[OFFICIAL TCS ERROR PERCENTAGE FORMULA]</p>
  <p style="font-size: 1.1em; color: #4ade80;">Error % = [ (Full Mistakes + (Half Mistakes / 2)) / Total Words in Master Passage ] × 100</p>
</div>

<p><strong>Example Calculation:</strong></p>
<ul>
  <li>Master Passage length: 2,000 Key Depressions (i.e., 400 standard words).</li>
  <li>Time allowed: 15 minutes.</li>
  <li>Candidate types: 2,010 key depressions.</li>
  <li>Full Mistakes committed: 8 words.</li>
  <li>Half Mistakes committed: 6 words.</li>
  <li><strong>Total Penalty Mistakes:</strong> 8 + (6 / 2) = 11 mistakes.</li>
  <li><strong>Error Percentage:</strong> (11 / 400) × 100 = <strong>2.75%</strong>.</li>
  <li><strong>Verdict:</strong> Since 2.75% is well below the 5% UR cutoff for Tax Assistant/DEST posts, the candidate <strong>QUALIFIES</strong>!</li>
</ul>

<hr />

<h2>3. Comprehensive A-to-Z Dictionary of All Typing Terms</h2>
<p>To master the typing test and prepare methodically, candidates must understand every technical term used in typing software, test engines, and SSC guidelines:</p>

<h3>1. Key Depressions (KD) / Keystrokes / Strokes</h3>
<p>Every single physical strike of a key on the keyboard is counted as one key depression. This includes letters (A–Z), digits (0–9), punctuation marks (, . ; : ' " ? !), symbols (@ # $ %), the spacebar, and the Enter key. In an SSC CGL 2,000 Key Depression test, every spacebar hit counts toward your 2,000 target.</p>

<h3>2. KPH / KDPH (Key Depressions Per Hour)</h3>
<p>The primary speed benchmark prescribed in official government recruitment gazettes:</p>
<ul>
  <li><strong>8,000 KDPH:</strong> Requires typing 2,000 keystrokes in 15 minutes (≈ 26.67 WPM). Mandatory for SSC CGL Tier 2 DEST.</li>
  <li><strong>10,500 KDPH:</strong> Requires typing 1,750 keystrokes in 10 minutes (≈ 35 WPM). Required for SSC CHSL English LDC/JSA.</li>
  <li><strong>9,000 KDPH:</strong> Requires typing 1,500 keystrokes in 10 minutes (≈ 30 WPM). Required for SSC CHSL Hindi typing.</li>
  <li><strong>15,000 KDPH:</strong> Requires typing 3,750 keystrokes in 15 minutes (≈ 50 WPM). Required for Data Entry Operator (DEO Grade A) in CAG.</li>
</ul>

<h3>3. WPM (Words Per Minute)</h3>
<p>The standard global measurement of typing speed. Since natural words vary in length, speed tests standardize 1 word as 5 key depressions. 2,000 keystrokes in 15 minutes = 400 words / 15 minutes = <strong>26.67 WPM</strong> (usually referred to as 27 WPM).</p>

<h3>4. Gross WPM vs Net WPM</h3>
<ul>
  <li><strong>Gross WPM (Raw Speed):</strong> Your overall typing speed without deducting mistakes: <code>Gross WPM = (Total Keystrokes / 5) / Time (min)</code>. It tells you how fast your fingers are moving.</li>
  <li><strong>Net WPM (Effective Speed):</strong> The speed after subtracting penalty errors: <code>Net WPM = Gross WPM - (Errors / Time)</code>. It reflects true productive output. In SSC, as long as your Net Error Percentage stays below the threshold, Net WPM determines your clean capability.</li>
</ul>

<h3>5. CPM (Characters Per Minute)</h3>
<p>The number of individual characters typed per minute. Directly related to WPM: <code>CPM = WPM × 5</code>. A speed of 30 WPM is equal to 150 CPM.</p>

<h3>6. Accuracy Rate (%)</h3>
<p>The percentage of correctly typed keystrokes or words compared to the total input. Calculated as <code>[(Correct Characters / Total Typed Characters) × 100]</code>. In competitive examinations, an accuracy of <strong>96% to 98%</strong> is recommended to guarantee safety against strict cutoffs.</p>

<h3>7. Full Mistake (100% Penalty)</h3>
<p>An error in which an entire word penalty is assessed (counts as 1 full mistake):</p>
<ul>
  <li><strong>Omission of Word:</strong> Skipping any word, number, or symbol present in the master text.</li>
  <li><strong>Substitution of Word:</strong> Typing a completely wrong word in place of the original word (e.g., typing "house" instead of "horse").</li>
  <li><strong>Addition of Word:</strong> Typing additional or extraneous words not found in the original text.</li>
  <li><strong>Spurious / Repeated Lines:</strong> Typing a sentence or line twice due to eye fatigue.</li>
</ul>

<h3>8. Half Mistake (50% Penalty)</h3>
<p>A minor discrepancy that attracts a 0.5 word penalty:</p>
<ul>
  <li><strong>Spacing Errors:</strong> Missing space between words (e.g. <code>inorder</code> instead of <code>in order</code>), or unnecessary spaces inside a word (e.g. <code>c omputer</code>).</li>
  <li><strong>Capitalization Mistakes:</strong> Typing small letters for capital or vice versa (e.g. <code>delhi</code> instead of <code>Delhi</code>, or <code>GOVERNMENT</code> instead of <code>Government</code>).</li>
  <li><strong>Punctuation Errors:</strong> Omitting or mistyping commas, full stops, hyphens, or colons.</li>
  <li><strong>Spelling / Transposition Errors:</strong> Transposing adjacent letters inside a word (e.g. <code>recieve</code> instead of <code>receive</code>, or <code>fro</code> instead of <code>for</code>).</li>
</ul>

<h3>9. DEST (Data Entry Skill Test)</h3>
<p>The official nomenclature for the 15-minute computer typing assessment conducted for SSC CGL, CHSL, and DEO. It is conducted on the TCS iON platform where candidates read a passage on the upper half of the screen and type into an active textbox on the lower half.</p>

<h3>10. Backspace & Navigation Key Rules</h3>
<p><strong>Is Backspace allowed in SSC Typing? YES!</strong> Candidates are fully permitted to use the Backspace key, Delete key, and the 4 Arrow Keys (Up, Down, Left, Right) to edit and correct any mistyped text at any point within the active 15-minute examination window. However, shortcut key combinations such as <code>Ctrl + A</code>, <code>Ctrl + C</code>, and <code>Ctrl + V</code> (Copy-Paste) and right-click mouse menus are strictly disabled by the examination software.</p>

<h3>11. Touch Typing</h3>
<p>The gold-standard typing technique where the typist looks exclusively at the master text or screen, never glancing down at the keyboard. Fingers locate keys purely through muscle memory and tactile reference points.</p>

<h3>12. Home Row & Tactile Bumps</h3>
<p>The baseline position where your fingers rest before and after pressing any key:</p>
<ul>
  <li><strong>Left Hand:</strong> <code>A - S - D - F</code> (Little finger on A, Ring on S, Middle on D, Index on F).</li>
  <li><strong>Right Hand:</strong> <code>J - K - L - ;</code> (Index on J, Middle on K, Ring on L, Little on semicolon).</li>
  <li><strong>Both Thumbs:</strong> Resting gently above the Spacebar.</li>
  <li><strong>Tactile Bumps (Nipples):</strong> Small raised plastic ridges on the <strong>F</strong> and <strong>J</strong> keys allow typists to reposition their index fingers instantly without looking down.</li>
</ul>

<h3>13. Muscle Memory</h3>
<p>The neuromuscular synchronization developed through repetitive typing practice. Once conditioned, your fingers instinctively strike the correct key coordinates upon seeing a letter, eliminating the mental bottleneck of searching for keys.</p>

<h3>14. Membrane vs Mechanical Keyboards in TCS Centers</h3>
<p>Almost all TCS iON testing centers provide <strong>standard wired desktop membrane keyboards</strong> (typically Dell KB216, HP 100/150, Lenovo, or ProDot). These keyboards have rubber dome switches with a full 3.5mm key travel depth. Candidates who practice exclusively on slim laptop chiclet keyboards often struggle on exam day because membrane keys require slightly more deliberate finger pressure.</p>

<h3>15. Word Wrap vs Enter Key Usage</h3>
<p>In modern computer typing software, lines automatically "wrap" to the next line when you reach the right margin. Candidates must <strong>never press the Enter key at the end of each visual line</strong>. The Enter key should ONLY be pressed when a genuine paragraph break occurs in the master passage.</p>

<h3>16. Typing Ergonomics & Posture</h3>
<ul>
  <li><strong>Elbows:</strong> Maintained at a 90-degree angle level with the desk.</li>
  <li><strong>Wrists:</strong> Kept straight and floating slightly above the keyboard, not resting heavy on the desk edge (which compresses the carpal tunnel).</li>
  <li><strong>Back & Shoulders:</strong> Upright posture with shoulders relaxed to prevent fatigue during the 15-minute sustained typing burst.</li>
</ul>

<hr />

<h2>4. Official SSC Typing Cutoffs & Eligibility Matrix</h2>
<p>The table below summarizes the exact category-wise error cutoffs across all major SSC examinations:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
  <thead>
    <tr style="background-color: #1e293b; color: #ffffff; text-align: left;">
      <th style="padding: 12px; border: 1px solid #334155;">Post / Examination</th>
      <th style="padding: 12px; border: 1px solid #334155;">Duration</th>
      <th style="padding: 12px; border: 1px solid #334155;">Required Depressions</th>
      <th style="padding: 12px; border: 1px solid #334155;">Approx WPM</th>
      <th style="padding: 12px; border: 1px solid #334155;">UR Cutoff (Max Error)</th>
      <th style="padding: 12px; border: 1px solid #334155;">OBC / EWS Cutoff</th>
      <th style="padding: 12px; border: 1px solid #334155;">SC / ST Cutoff</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold;">SSC CGL Tier 2 (All Non-DEST Posts)</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">15 Min</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">2,000</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">≈ 27 WPM</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">20% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">25% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">30% Max Error</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e40af;">SSC CGL DEST Posts (Tax Asst, Exec Asst, ASO)</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">15 Min</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">2,000</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">≈ 27 WPM</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">5% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">7% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">7% Max Error</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold;">SSC CHSL (LDC / JSA) - English</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">10 Min</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">1,750</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">≈ 35 WPM</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">7% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">10% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">10% Max Error</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold;">SSC CHSL (LDC / JSA) - Hindi</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">10 Min</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">1,500</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">≈ 30 WPM</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">7% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">10% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">10% Max Error</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #b45309;">SSC DEO Grade 'A' (CAG / Other Depts)</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">15 Min</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">3,700–4,000</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1;">≈ 50 WPM</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">5% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">7% Max Error</td>
      <td style="padding: 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">7% Max Error</td>
    </tr>
  </tbody>
</table>

<hr />

<h2>5. Crucial Exam Day Tips for TCS iON Test Centers</h2>
<ol>
  <li><strong>Test Every Key During Mock Trial:</strong> Before the actual 15-minute test starts, TCS provides a 10-minute trial typing session. Use this mock window to test every alphabet key, the Spacebar, Backspace, Enter, comma, full stop, and Shift keys. If any key feels sticky or unresponsive, immediately alert the invigilator and get your keyboard or system changed before the real test begins!</li>
  <li><strong>Do Not Panic in the First 2 Minutes:</strong> In the exam hall, the sound of 200 candidates typing simultaneously creates loud mechanical noise that can induce anxiety and cause finger shaking. Take 3 deep breaths, start at a relaxed 25 WPM pace for the first 2 minutes, and gradually accelerate once your rhythm stabilizes.</li>
  <li><strong>What to Do if You Finish Early:</strong> If you reach 2,000 key depressions in 12 or 13 minutes, <strong>DO NOT submit early</strong>. Scroll back up and proofread your typed text against the master passage. Correct capitalized letters, commas, and spelling slips using Backspace.</li>
  <li><strong>Keep Your Target at 35 WPM at Home:</strong> Although CGL only requires ≈27 WPM, aiming for exactly 27 WPM leaves zero margin for exam day nerves. Maintain a comfortable 35+ WPM speed at home on <a href="/typing" style="color: #2563eb; font-weight: bold;">SSCZone Typing Simulator</a> to ensure effortless qualification on test day.</li>
</ol>

<hr />

<h2>6. Practice with Real TCS Passages on SSCZone</h2>
<p>To experience the exact replica of the TCS iON typing interface—with strict backspace tracking, authentic passage lengths, real-time key depression counts, and instant SSC qualification scorecards—practice daily on our free portal:</p>
<p style="margin: 25px 0;">
  <a href="/typing" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    Launch SSCZone Typing Simulator &rarr;
  </a>
</p>
`;

async function publishTypingBlog() {
  console.log("=== PUBLISHING COMPREHENSIVE TYPING MASTER GUIDE BLOG ===");

  const slug = "ssc-typing-test-complete-guide-rules-cutoffs-terms";
  const title = "SSC Typing Test Complete Guide 2026: Official Rules, Speed Calculation Formula, Terms Glossary & Cutoffs";
  const excerpt = "The definitive guide to SSC CGL Tier 2, CHSL, and DEO typing tests. Learn the official TCS error calculation formula, full vs half mistake rules, comprehensive A-to-Z typing terms glossary (WPM, KPH, KD, Gross/Net speed), and post-wise cutoffs.";
  const seo_title = "SSC Typing Test Rules, Formula, Terms & Cutoffs Guide (2026)";

  const keywordsObj = {
    focus: "SSC Typing Test Rules, Formula, Cutoffs and Terms Complete Guide",
    category: "Preparation Guide",
    examTag: "SSC CGL / CHSL / DEO",
    seoScore: 98,
    secondary: "SSC typing speed formula, TCS DEST error calculation, half mistake full mistake rules, WPM to KPH conversion, CGL typing cutoff, touch typing home row"
  };

  // Check if blog already exists
  const { data: existing } = await supabase
    .from('blogs')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    console.log(`Blog with slug '${slug}' exists (ID: ${existing.id}). Updating...`);
    const { error: updErr } = await supabase
      .from('blogs')
      .update({
        title,
        content: blogContent,
        excerpt,
        seo_title,
        keywords: JSON.stringify(keywordsObj),
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (updErr) {
      console.error("Error updating blog:", updErr);
    } else {
      console.log("✔ Successfully updated Typing Master Guide Blog!");
    }
  } else {
    console.log(`Creating new blog post with slug '${slug}'...`);
    const { data: newBlog, error: insErr } = await supabase
      .from('blogs')
      .insert({
        title,
        slug,
        content: blogContent,
        excerpt,
        seo_title,
        keywords: JSON.stringify(keywordsObj),
        is_published: true
      })
      .select('id, slug, title')
      .single();

    if (insErr) {
      console.error("Error inserting blog:", insErr);
    } else {
      console.log("✔ Successfully published Typing Master Guide Blog! ID:", newBlog.id);
    }
  }
}

publishTypingBlog();
