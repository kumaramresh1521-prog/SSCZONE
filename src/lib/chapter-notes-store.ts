import fs from "fs";
import path from "path";
import { ChapterNote, SubjectMeta, ALL_SUBJECTS } from "./chapter-notes-types";

export type { ChapterNote, SubjectMeta };
export { ALL_SUBJECTS };

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "chapter_notes.json");

// Default initial seed data for Chapter Notes & Educational Blog
const SEED_NOTES: ChapterNote[] = [
  // ── PHYSICS CHAPTERS ──
  {
    id: "cn_phy_01",
    slug: "physics-units-dimensions-measurements",
    title: "Units, Dimensions & Measurement",
    hindi_title: "मात्रक, विमाएं एवं मापन",
    excerpt: "Comprehensive study notes covering SI Base Units, Derived Units, Dimensional Formulae, and Significant Figures for SSC CGL & CHSL.",
    type: "chapter_note",
    subject_id: "physics",
    subject_name: "Physics (भौतिक विज्ञान)",
    chapter_number: 1,
    chapter_title: "Units, Dimensions & Measurement",
    read_time: "7 min read",
    sort_order: 1,
    is_active: true,
    is_featured: true,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-01T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <div class="note-intro-card">
        <h3>🎯 Chapter Overview & SSC Weightage</h3>
        <p>This chapter forms the cornerstone of Physics in all SSC examinations (CGL, CHSL, CPO, MTS). On average, <strong>1 to 2 direct questions</strong> are asked every year regarding SI units, derived physical quantities, or dimensional formulas.</p>
      </div>

      <h2>1. Physical Quantities & The SI System</h2>
      <p>Any quantity that can be measured directly or indirectly is termed a <strong>Physical Quantity</strong>. The International System of Units (SI) establishes <strong>7 Fundamental (Base) Units</strong> and <strong>2 Supplementary Units</strong>.</p>

      <table class="notes-table">
        <thead>
          <tr>
            <th>Base Physical Quantity</th>
            <th>SI Unit</th>
            <th>Symbol</th>
            <th>Dimensional Symbol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Length (लंबाई)</td>
            <td>Meter (मीटर)</td>
            <td>m</td>
            <td><strong>[L]</strong></td>
          </tr>
          <tr>
            <td>Mass (द्रव्यमान)</td>
            <td>Kilogram (किलोग्राम)</td>
            <td>kg</td>
            <td><strong>[M]</strong></td>
          </tr>
          <tr>
            <td>Time (समय)</td>
            <td>Second (सेकंड)</td>
            <td>s</td>
            <td><strong>[T]</strong></td>
          </tr>
          <tr>
            <td>Electric Current (विद्युत धारा)</td>
            <td>Ampere (एम्पीयर)</td>
            <td>A</td>
            <td><strong>[A] or [I]</strong></td>
          </tr>
          <tr>
            <td>Thermodynamic Temperature (ताप)</td>
            <td>Kelvin (केल्विन)</td>
            <td>K</td>
            <td><strong>[K] or [θ]</strong></td>
          </tr>
          <tr>
            <td>Luminous Intensity (ज्योति तीव्रता)</td>
            <td>Candela (कैंडेला)</td>
            <td>cd</td>
            <td><strong>[cd]</strong></td>
          </tr>
          <tr>
            <td>Amount of Substance (पदार्थ की मात्रा)</td>
            <td>Mole (मोल)</td>
            <td>mol</td>
            <td><strong>[mol]</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="callout-box info">
        <p><strong>💡 Supplementary Units:</strong></p>
        <ul>
          <li><strong>Plane Angle (समतल कोण):</strong> Radian (rad) — Dimensionless [M⁰L⁰T⁰]</li>
          <li><strong>Solid Angle (ठोस कोण):</strong> Steradian (sr) — Dimensionless [M⁰L⁰T⁰]</li>
        </ul>
      </div>

      <h2>2. High-Yield Derived Quantities & Formulas</h2>
      <p>Derived quantities are formed by combining base quantities through algebraic multiplication or division.</p>

      <div class="formula-card">
        <div class="formula-header">⚡ Frequently Asked in SSC Shifts</div>
        <div class="formula-body">
          <p><strong>• Force (बल):</strong> F = m × a &nbsp;→&nbsp; SI Unit: <code>Newton (N)</code> &nbsp;|&nbsp; Dimensions: <code>[M L T⁻²]</code></p>
          <p><strong>• Work / Energy (कार्य / ऊर्जा):</strong> W = F × d &nbsp;→&nbsp; SI Unit: <code>Joule (J)</code> &nbsp;|&nbsp; Dimensions: <code>[M L² T⁻²]</code></p>
          <p><strong>• Power (शक्ति):</strong> P = W / t &nbsp;→&nbsp; SI Unit: <code>Watt (W)</code> &nbsp;|&nbsp; Dimensions: <code>[M L² T⁻³]</code></p>
          <p><strong>• Pressure (दाब / प्रतिबल):</strong> P = F / A &nbsp;→&nbsp; SI Unit: <code>Pascal (Pa) or N/m²</code> &nbsp;|&nbsp; Dimensions: <code>[M L⁻¹ T⁻²]</code></p>
          <p><strong>• Universal Gravitational Constant (G):</strong> SI Unit: <code>N·m²/kg²</code> &nbsp;|&nbsp; Dimensions: <code>[M⁻¹ L³ T⁻²]</code></p>
        </div>
      </div>

      <h2>3. Important Multiplier Prefixes</h2>
      <p>SSC frequently tests metric prefixes in scientific measurement questions:</p>
      <ul>
        <li><strong>Nano (n):</strong> 10⁻⁹ meter</li>
        <li><strong>Micro (μ):</strong> 10⁻⁶ meter</li>
        <li><strong>Milli (m):</strong> 10⁻³ meter</li>
        <li><strong>Kilo (k):</strong> 10³</li>
        <li><strong>Mega (M):</strong> 10⁶</li>
        <li><strong>Giga (G):</strong> 10⁹</li>
        <li><strong>Tera (T):</strong> 10¹²</li>
      </ul>

      <div class="callout-box alert">
        <p><strong>🔥 SSC PYQ Trend Alert:</strong> Questions like <em>"1 Light Year is the unit of?"</em> are repeated every few shifts. Remember: <strong>Light Year (प्रकाश वर्ष) is a unit of Distance</strong>, NOT Time! (1 Light Year ≈ 9.46 × 10¹⁵ m).</p>
      </div>
    `,
  },
  {
    id: "cn_phy_02",
    slug: "physics-kinematics-laws-of-motion",
    title: "Kinematics & Newton's Laws of Motion",
    hindi_title: "गति एवं न्यूटन के गति के नियम",
    excerpt: "Equations of motion, scalar vs vector quantities, Newton's 3 laws, momentum conservation, and frictional force concepts simplified.",
    type: "chapter_note",
    subject_id: "physics",
    subject_name: "Physics (भौतिक विज्ञान)",
    chapter_number: 2,
    chapter_title: "Kinematics & Newton's Laws of Motion",
    read_time: "8 min read",
    sort_order: 2,
    is_active: true,
    is_featured: true,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-02T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <div class="note-intro-card">
        <h3>🎯 Chapter Overview</h3>
        <p>Kinematics deals with the motion of bodies without considering the causes of motion, while Dynamics (Newton's Laws) explains the forces causing motion.</p>
      </div>

      <h2>1. Kinematic Equations of Linear Motion</h2>
      <p>For uniform acceleration along a straight line:</p>
      <div class="formula-card">
        <div class="formula-body">
          <p><strong>1. Velocity-Time Relation:</strong> <code>v = u + at</code></p>
          <p><strong>2. Position-Time Relation:</strong> <code>s = ut + ½at²</code></p>
          <p><strong>3. Velocity-Position Relation:</strong> <code>v² = u² + 2as</code></p>
          <p><em>Where: u = initial velocity, v = final velocity, a = uniform acceleration, t = time, s = displacement.</em></p>
        </div>
      </div>

      <h2>2. Newton's Three Laws of Motion</h2>
      
      <h3>First Law (Law of Inertia / जड़त्व का नियम):</h3>
      <p>A body continues in its state of rest or uniform motion in a straight line unless compelled by an external unbalanced force. Inertia depends directly on the <strong>mass</strong> of the object.</p>
      <p><strong>Practical Examples:</strong> Passengers leaning backward when a bus starts suddenly; shaking branches to make fruits fall.</p>

      <h3>Second Law (Law of Force / संवेग परिवर्तन का नियम):</h3>
      <p>The rate of change of linear momentum is directly proportional to the applied force: <code>F = dp/dt = m × a</code>.</p>
      <p><strong>Practical Examples:</strong> A cricket fielder pulls his hands backwards while catching a fast ball to increase impact time, thereby reducing the impulsive force.</p>

      <h3>Third Law (Action-Reaction / क्रिया-प्रतिक्रिया का नियम):</h3>
      <p>To every action, there is always an equal and opposite reaction acting on two different bodies: <code>F₁₂ = -F₂₁</code>.</p>
      <p><strong>Practical Examples:</strong> Rocket propulsion, recoil of a gun, swimming in water, rowing a boat.</p>

      <div class="callout-box info">
        <p><strong>💡 Law of Conservation of Linear Momentum:</strong> When no external force acts on a system of interacting particles, the total linear momentum remains constant: <code>m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂</code>.</p>
      </div>
    `,
  },
  {
    id: "cn_phy_03",
    slug: "physics-work-energy-power",
    title: "Work, Energy & Power",
    hindi_title: "कार्य, ऊर्जा और शक्ति",
    excerpt: "Detailed notes on positive/negative/zero work, kinetic and potential energy formulas, mechanical energy conservation, and commercial power units.",
    type: "chapter_note",
    subject_id: "physics",
    subject_name: "Physics (भौतिक विज्ञान)",
    chapter_number: 3,
    chapter_title: "Work, Energy & Power",
    read_time: "6 min read",
    sort_order: 3,
    is_active: true,
    is_featured: false,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-03T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. Scientific Definition of Work</h2>
      <p>Work is done only when a force causes displacement along or at an angle to the direction of force: <code>W = F · d · cos(θ)</code>.</p>
      <ul>
        <li><strong>Positive Work (θ &lt; 90°):</strong> Force and displacement in same general direction (e.g., pulling a toy car).</li>
        <li><strong>Negative Work (θ &gt; 90°):</strong> Opposing force (e.g., Frictional force doing negative work on moving tires).</li>
        <li><strong>Zero Work (θ = 90° or d = 0):</strong> A coolie carrying luggage on his head walking horizontally does <strong>Zero work against gravity</strong> because the gravitational force is perpendicular to displacement (cos 90° = 0).</li>
      </ul>

      <h2>2. Energy & Conservation Principle</h2>
      <p>Energy is the capacity of doing work. Common forms in SSC syllabus:</p>
      <ul>
        <li><strong>Kinetic Energy (गतिज ऊर्जा):</strong> <code>KE = ½ m v² = p² / (2m)</code></li>
        <li><strong>Gravitational Potential Energy (स्थितिज ऊर्जा):</strong> <code>PE = m g h</code></li>
      </ul>

      <div class="callout-box alert">
        <p><strong>🔥 SSC Numerical Shortcut:</strong> If the momentum of a body increases by 100%, its kinetic energy increases by <strong>300%</strong>! (Because KE ∝ p²).</p>
      </div>

      <h2>3. Commercial Unit of Electrical Energy</h2>
      <p>In electric utility billing, <strong>1 Kilowatt-hour (1 kWh)</strong> is also known as <strong>1 Board of Trade Unit (B.O.T.)</strong>:</p>
      <div class="formula-card">
        <p style="font-size: 16px; font-weight: bold; margin: 0;">1 kWh = 1,000 Watts × 3,600 Seconds = 3.6 × 10⁶ Joules</p>
      </div>
    `,
  },
  {
    id: "cn_phy_04",
    slug: "physics-gravitation-planetary-motion",
    title: "Gravitation & Planetary Motion",
    hindi_title: "गुरुत्वाकर्षण एवं उपग्रह गति",
    excerpt: "Newton's law of gravitation, variation of 'g' with altitude and depth, Kepler's laws, escape velocity, and artificial satellites.",
    type: "chapter_note",
    subject_id: "physics",
    subject_name: "Physics (भौतिक विज्ञान)",
    chapter_number: 4,
    chapter_title: "Gravitation & Planetary Motion",
    read_time: "7 min read",
    sort_order: 4,
    is_active: true,
    is_featured: false,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-04T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. Universal Law of Gravitation</h2>
      <p>Every particle in the universe attracts every other particle with a force proportional to product of masses and inversely proportional to square of distance:</p>
      <div class="formula-card">
        <code>F = G · (m₁ · m₂) / r²</code>
        <p style="margin-top: 8px; font-size: 13px;">G = 6.674 × 10⁻¹¹ N·m²/kg² (Cavendish measured G using Torsion Balance).</p>
      </div>

      <h2>2. Acceleration Due to Gravity (g)</h2>
      <p>Standard value at sea level: <code>g = 9.8 m/s²</code>.</p>
      <ul>
        <li><strong>At Poles:</strong> 'g' is maximum (Earth is flattened at poles, smaller radius).</li>
        <li><strong>At Equator:</strong> 'g' is minimum.</li>
        <li><strong>At Earth's Center:</strong> 'g' is ZERO. Weight of an object at Earth's center is 0.</li>
        <li><strong>With Altitude (Height):</strong> 'g' decreases: <code>g' ≈ g(1 - 2h/R)</code>.</li>
        <li><strong>With Depth:</strong> 'g' decreases: <code>g' = g(1 - d/R)</code>.</li>
      </ul>

      <h2>3. Escape Velocity (पलायन वेग)</h2>
      <p>The minimum speed needed for an object to break free from Earth's gravitational pull without further propulsion:</p>
      <div class="formula-card">
        <code>v_e = √(2gR) = √(2GM/R) ≈ 11.2 km/s (for Earth)</code>
        <p style="margin-top: 6px; font-size: 13px;">For Moon, escape velocity is ~2.38 km/s (too low to hold gas molecules, hence Moon has no atmosphere!).</p>
      </div>
    `,
  },

  // ── POLITY CHAPTERS ──
  {
    id: "cn_pol_01",
    slug: "polity-preamble-sources-constitution",
    title: "Preamble & Borrowed Sources of Indian Constitution",
    hindi_title: "संविधान की प्रस्तावना एवं विदेशी स्रोत",
    excerpt: "Key phrases in the Preamble, 42nd Amendment changes, and country-wise borrowed features of the world's longest written constitution.",
    type: "chapter_note",
    subject_id: "polity",
    subject_name: "Indian Polity & Constitution (भारतीय राजव्यवस्था)",
    chapter_number: 1,
    chapter_title: "Preamble & Borrowed Sources",
    read_time: "6 min read",
    sort_order: 1,
    is_active: true,
    is_featured: true,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-01T11:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. The Preamble (प्रस्तावना)</h2>
      <p>The Preamble is based on the <em>'Objective Resolution'</em> drafted and moved by Pt. Jawaharlal Nehru on <strong>13 December 1946</strong> and unanimously adopted by the Constituent Assembly on <strong>22 January 1947</strong>.</p>
      
      <div class="callout-box alert">
        <p><strong>42nd Constitutional Amendment Act, 1976:</strong> Added three new words to the Preamble: <strong>Socialist (समाजवादी), Secular (पंथनिरपेक्ष), and Integrity (अखंडता)</strong>. The Preamble has been amended only ONCE till date.</p>
      </div>

      <h2>2. Major Borrowed Features (विदेशी स्रोत)</h2>
      <table class="notes-table">
        <thead>
          <tr>
            <th>Country / Act</th>
            <th>Borrowed Features in Indian Constitution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Govt. of India Act 1935</strong></td>
            <td>Federal Scheme, Office of Governor, Judiciary, Public Service Commissions (UPSC), Emergency provisions.</td>
          </tr>
          <tr>
            <td><strong>United Kingdom (UK)</strong></td>
            <td>Parliamentary form of Government, Rule of Law, Single Citizenship, Bicameralism, Cabinet System, Prerogative Writs.</td>
          </tr>
          <tr>
            <td><strong>United States (USA)</strong></td>
            <td>Fundamental Rights (Part III), Judicial Review, Independence of Judiciary, Impeachment of President, Removal of SC/HC Judges, Preamble concept.</td>
          </tr>
          <tr>
            <td><strong>Ireland</strong></td>
            <td>Directive Principles of State Policy (DPSP - Part IV), Nomination of 12 members to Rajya Sabha, Method of President's election.</td>
          </tr>
          <tr>
            <td><strong>Australia</strong></td>
            <td>Concurrent List, Joint Sitting of both Houses of Parliament (Article 108), Freedom of trade and commerce.</td>
          </tr>
          <tr>
            <td><strong>USSR (Now Russia)</strong></td>
            <td>Fundamental Duties (Article 51A), Ideals of Justice (Social, Economic, Political) in Preamble.</td>
          </tr>
          <tr>
            <td><strong>South Africa</strong></td>
            <td>Procedure for Constitutional Amendment (Article 368), Election of Rajya Sabha members.</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    id: "cn_pol_02",
    slug: "polity-fundamental-rights-writs",
    title: "Fundamental Rights & Constitutional Writs (Articles 12-35)",
    hindi_title: "मौलिक अधिकार एवं संवैधानिक उपचार (अनुच्छेद 12-35)",
    excerpt: "6 Fundamental Rights, Magna Carta of India, Article 32 vs 226, Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo-Warranto.",
    type: "chapter_note",
    subject_id: "polity",
    subject_name: "Indian Polity & Constitution (भारतीय राजव्यवस्था)",
    chapter_number: 2,
    chapter_title: "Fundamental Rights & Constitutional Writs",
    read_time: "9 min read",
    sort_order: 2,
    is_active: true,
    is_featured: false,
    exam_tag: "SSC CGL / CHSL / CPO",
    created_at: "2026-11-02T11:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. Overview of Part III</h2>
      <p>Part III of the Constitution (Articles 12 to 35) is described as the <strong>Magna Carta of India</strong>. Originally there were 7 Fundamental Rights, but the <em>Right to Property (Article 31)</em> was deleted by the 44th Amendment Act, 1978 and made a legal right under <strong>Article 300A</strong>.</p>

      <h2>2. Six Fundamental Rights at a Glance</h2>
      <ul>
        <li><strong>Right to Equality (Articles 14–18):</strong> Equality before law (14), Prohibition of discrimination (15), Equal opportunity in public employment (16), Abolition of Untouchability (17), Abolition of Titles (18).</li>
        <li><strong>Right to Freedom (Articles 19–22):</strong> Protection of 6 freedoms (19), Protection in conviction of offences (20), Protection of Life & Personal Liberty (21), Right to Education 6-14 yrs (21A - 86th Amdt), Protection against arrest/detention (22).</li>
        <li><strong>Right against Exploitation (Articles 23–24):</strong> Prohibition of human trafficking & forced labor (23), Prohibition of employment of children in hazardous industries (24).</li>
        <li><strong>Right to Freedom of Religion (Articles 25–28):</strong> Conscience and profession (25), Religious affairs (26), Tax exemption (27), Religious instruction (28).</li>
        <li><strong>Cultural & Educational Rights (Articles 29–30):</strong> Protection of minority interests (29), Right of minorities to establish educational institutions (30).</li>
        <li><strong>Right to Constitutional Remedies (Article 32):</strong> Dr. B.R. Ambedkar termed Article 32 as the <em>"Heart and Soul of the Indian Constitution"</em>.</li>
      </ul>

      <h2>3. The Five Constitutional Writs</h2>
      <p>Supreme Court under Article 32 and High Courts under Article 226 can issue 5 types of writs:</p>
      <div class="callout-box info">
        <p><strong>1. Habeas Corpus (बंदी प्रत्यक्षीकरण):</strong> "To have the body of" — protects against unlawful detention.</p>
        <p><strong>2. Mandamus (परमादेश):</strong> "We Command" — orders a public official to perform statutory duties.</p>
        <p><strong>3. Prohibition (प्रतिषेध):</strong> Issued by higher court to lower court to prevent exceeding jurisdiction.</p>
        <p><strong>4. Certiorari (उत्प्रेषण):</strong> "To be certified" — quashes an order passed by a lower court/tribunal lacking jurisdiction.</p>
        <p><strong>5. Quo-Warranto (अधिकार पृच्छा):</strong> "By what authority" — enquires into legality of claim of a person to public office.</p>
      </div>
    `,
  },

  // ── QUANT / MATHS CHAPTER ──
  {
    id: "cn_mth_01",
    slug: "maths-percentage-fraction-conversion-shortcuts",
    title: "Percentage & Fraction Equivalence Shortcuts",
    hindi_title: "प्रतिशत एवं भिन्न मान: शॉर्ट ट्रिक व मास्टर शीट",
    excerpt: "Master the 1/1 to 1/20 fraction-to-percentage table, successive percentage changes, and AB rule tricks for lightning-fast calculations in SSC CGL.",
    type: "chapter_note",
    subject_id: "maths",
    subject_name: "Quantitative Aptitude (गणित)",
    chapter_number: 1,
    chapter_title: "Percentage & Fraction Shortcuts",
    read_time: "5 min read",
    sort_order: 1,
    is_active: true,
    is_featured: true,
    exam_tag: "SSC CGL / CHSL / MTS",
    created_at: "2026-11-01T12:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. The Sacred Fraction-to-Percentage Table</h2>
      <p>Memorizing these fractions turns 2-minute percentage questions into 10-second mental arithmetic:</p>
      
      <table class="notes-table">
        <thead>
          <tr>
            <th>Fraction</th>
            <th>Percentage</th>
            <th>Fraction</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1/2</td><td>50%</td><td>1/9</td><td>11.11% (11 ⅑%)</td></tr>
          <tr><td>1/3</td><td>33.33% (33 ⅓%)</td><td>1/10</td><td>10%</td></tr>
          <tr><td>1/4</td><td>25%</td><td>1/11</td><td>9.09% (9 ¹/₁₁%)</td></tr>
          <tr><td>1/5</td><td>20%</td><td>1/12</td><td>8.33% (8 ⅓%)</td></tr>
          <tr><td>1/6</td><td>16.66% (16 ⅔%)</td><td>1/13</td><td>7.69% (7 ⁹/₁₃%)</td></tr>
          <tr><td>1/7</td><td>14.28% (14 ⅖%)</td><td>1/14</td><td>7.14% (7 ⅐%)</td></tr>
          <tr><td>1/8</td><td>12.5% (12 ½%)</td><td>1/15</td><td>6.66% (6 ⅔%)</td></tr>
          <tr><td>3/8</td><td>37.5%</td><td>1/16</td><td>6.25% (6 ¼%)</td></tr>
          <tr><td>5/8</td><td>62.5%</td><td>1/20</td><td>5%</td></tr>
        </tbody>
      </table>

      <h2>2. Successive Percentage Formula (AB Formula)</h2>
      <div class="formula-card">
        <p><strong>Net Effective Change = (A + B + AB/100)%</strong></p>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Use positive sign for increase/profit and negative sign for decrease/discount.</p>
      </div>
      <p><strong>Example:</strong> If price increases by 20% and consumption increases by 10%, Net expenditure increase = 20 + 10 + (20 × 10)/100 = <strong>32%</strong>.</p>

      <h2>3. Product Constancy (A × B = Constant) Rule</h2>
      <p>If consumption decreases so expenditure stays constant when price rises:</p>
      <div class="callout-box info">
        <p>If Price increases by <strong>a / b</strong>, Consumption must decrease by <strong>a / (a + b)</strong>.</p>
        <p><strong>Example:</strong> Sugar price rises by 25% (¼). Then consumption must decrease by 1 / (1 + 4) = <strong>⅕ = 20%</strong> to maintain same monthly budget!</p>
      </div>
    `,
  },

  // ── RANDOM EDUCATIONAL GUIDES / BLOGS ──
  {
    id: "cn_gen_01",
    slug: "top-50-static-gk-mnemonics-ssc-cgl",
    title: "Top 50 High-Yield Static GK Mnemonics & Memory Tricks",
    hindi_title: "स्टैटिक जीके टॉप 50 शार्ट ट्रिक्स व याद करने के आसान तरीके",
    excerpt: "Clever mnemonics to effortlessly remember Classical Dances, Mughal Rulers chronologies, UNESCO World Heritage Sites, and Indian Boundaries.",
    type: "educational_guide",
    subject_id: "general",
    subject_name: "Quick Revision & Guides (क्विक रिवीजन)",
    chapter_number: 1,
    chapter_title: "Static GK Mnemonics & Tricks",
    read_time: "6 min read",
    sort_order: 1,
    is_active: true,
    is_featured: true,
    exam_tag: "All SSC Exams",
    created_at: "2026-11-05T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. The 8 Classical Dances of India (Sangeet Natak Akademi)</h2>
      <p>Easy memory trick to never confuse dance forms with states:</p>
      <div class="callout-box info">
        <ul>
          <li><strong>Bharatnatyam:</strong> Tamil Nadu (Trick: <em>Bharat</em> milne <em>Tamil</em> Nadu gaya)</li>
          <li><strong>Kathak:</strong> Uttar Pradesh (North India) (Trick: <em>Katha</em> sunane <em>UP</em> gaye)</li>
          <li><strong>Kathakali:</strong> Kerala (Trick: <em>Kerala</em> me <em>Katha</em> aur <em>Kali</em>)</li>
          <li><strong>Mohiniyattam:</strong> Kerala</li>
          <li><strong>Kuchipudi:</strong> Andhra Pradesh (Trick: <em>Andha</em> aadmi <em>Kachi Puri</em> khata hai)</li>
          <li><strong>Odissi:</strong> Odisha</li>
          <li><strong>Manipuri:</strong> Manipur</li>
          <li><strong>Sattriya:</strong> Assam (Introduced by Mahapurush Srimanta Sankardev in 15th century)</li>
        </ul>
      </div>

      <h2>2. Mughal Emperors Chronology Trick: "BHAJSA"</h2>
      <ul>
        <li><strong>B:</strong> Babur (1526–1530)</li>
        <li><strong>H:</strong> Humayun (1530–1540 & 1555–1556)</li>
        <li><strong>A:</strong> Akbar (1556–1605)</li>
        <li><strong>J:</strong> Jahangir (1605–1627)</li>
        <li><strong>S:</strong> Shah Jahan (1628–1658)</li>
        <li><strong>A:</strong> Aurangzeb (1658–1707)</li>
      </ul>

      <h2>3. Countries Bordering India: "बचपन में MBA किया"</h2>
      <ol>
        <li><strong>ब:</strong> Bangladesh (Longest land boundary: 4,096.7 km)</li>
        <li><strong>च:</strong> China (3,488 km)</li>
        <li><strong>प:</strong> Pakistan (3,323 km)</li>
        <li><strong>न:</strong> Nepal (1,751 km)</li>
        <li><strong>M:</strong> Myanmar (1,643 km)</li>
        <li><strong>B:</strong> Bhutan (699 km)</li>
        <li><strong>A:</strong> Afghanistan (Shortest land boundary: 106 km in Wakhan Corridor)</li>
      </ol>
    `,
  },
  {
    id: "cn_gen_02",
    slug: "ssc-cgl-general-awareness-strategy-45-plus",
    title: "SSC CGL General Awareness: How to Score 45+ in Tier-1",
    hindi_title: "जीएस में 45+ स्कोर कैसे करें: टॉपर्स स्ट्रेटेजी",
    excerpt: "Strategic breakdown of high-scoring sections: Static GK, Modern History, Polity Articles, Current Affairs timelines, and revision schedules.",
    type: "educational_guide",
    subject_id: "general",
    subject_name: "Quick Revision & Guides (क्विक रिवीजन)",
    chapter_number: 2,
    chapter_title: "GA 45+ Scoring Strategy",
    read_time: "5 min read",
    sort_order: 2,
    is_active: true,
    is_featured: false,
    exam_tag: "SSC CGL 2026",
    created_at: "2026-11-06T10:00:00Z",
    updated_at: "2026-11-07T12:00:00Z",
    content: `
      <h2>1. The 3 Pillars of SSC General Awareness</h2>
      <p>Modern SSC CGL General Awareness (25 Questions / 50 Marks) is heavily weighted towards three core domains:</p>
      <ul>
        <li><strong>Pillar 1 - Static GK & Culture (7-9 Questions):</strong> Musical instruments, gharanas, festivals, folk dances, sports terms, books & authors, census 2011.</li>
        <li><strong>Pillar 2 - Core GS Theory (10-12 Questions):</strong> Indian Polity (Articles 1-51A), Modern Indian History, Science (Basic Biology, Chemical formulas), Geography (Rivers, Drainage).</li>
        <li><strong>Pillar 3 - Current Affairs (4-6 Questions):</strong> Last 8-10 months of Govt schemes, sports championships, summits, and major appointments.</li>
      </ul>

      <h2>2. High-ROI Topics You Must Revise 3 Times</h2>
      <div class="callout-box alert">
        <p><strong>Top 5 Priority Topics:</strong></p>
        <ol>
          <li>Articles 1 to 51A (Citizenship, Fundamental Rights, DPSP, Fundamental Duties).</li>
          <li>Census 2011 Data (Literacy rates, sex ratio, highest/lowest population density states).</li>
          <li>Musical Instruments & Associated Maestros (Bismillah Khan, Ravi Shankar, Zakir Hussain, Hariprasad Chaurasia).</li>
          <li>Mughal Architecture and Delhi Sultanate Dynasties.</li>
          <li>Chemical Names & Formulas (Baking Soda, Bleaching Powder, Plaster of Paris, Epsom Salt).</li>
        </ol>
      </div>
    `,
  },
];

// Helper to safely write notes to JSON file
function writeNotesFile(notes: ChapterNote[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write chapter_notes.json:", err);
  }
}

// ── Public Store API Methods ──

export function getChapterNotes(options?: {
  subject_id?: string;
  type?: "chapter_note" | "educational_guide" | "all";
  active_only?: boolean;
  search?: string;
}): ChapterNote[] {
  let list: ChapterNote[] = [];

  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf8");
      list = JSON.parse(raw);
    } else {
      list = [...SEED_NOTES];
      writeNotesFile(list);
    }
  } catch (err) {
    console.error("Error reading chapter notes file, using seed notes:", err);
    list = [...SEED_NOTES];
  }

  // Filter active status
  if (options?.active_only !== false) {
    list = list.filter((n) => n.is_active !== false);
  }

  // Filter subject
  if (options?.subject_id && options.subject_id !== "all") {
    list = list.filter((n) => n.subject_id === options.subject_id);
  }

  // Filter type
  if (options?.type && options.type !== "all") {
    list = list.filter((n) => n.type === options.type);
  }

  // Filter search
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.hindi_title?.toLowerCase().includes(q) ||
        n.excerpt?.toLowerCase().includes(q) ||
        n.subject_name?.toLowerCase().includes(q)
    );
  }

  // Sort by sort_order ascending, then chapter_number ascending
  return list.sort((a, b) => {
    if ((a.sort_order || 99) !== (b.sort_order || 99)) {
      return (a.sort_order || 99) - (b.sort_order || 99);
    }
    return (a.chapter_number || 0) - (b.chapter_number || 0);
  });
}

export function getChapterNoteBySlug(slug: string): ChapterNote | null {
  const notes = getChapterNotes({ active_only: false });
  const found = notes.find((n) => n.slug === slug);
  return found || null;
}

export function saveChapterNote(data: Partial<ChapterNote>): ChapterNote {
  const list = getChapterNotes({ active_only: false });
  const now = new Date().toISOString();

  // If slug is missing, generate from title
  const cleanSlug = (data.slug || data.title || "note")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (data.id) {
    const idx = list.findIndex((n) => n.id === data.id);
    if (idx !== -1) {
      const existing = list[idx];
      const updated: ChapterNote = {
        ...existing,
        ...data,
        slug: cleanSlug || existing.slug,
        updated_at: now,
      } as ChapterNote;
      list[idx] = updated;
      writeNotesFile(list);
      return updated;
    }
  }

  // Create new note
  const newId = `cn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const subjectObj = ALL_SUBJECTS.find((s) => s.id === data.subject_id);

  const newNote: ChapterNote = {
    id: newId,
    slug: cleanSlug,
    title: data.title || "Untitled Chapter Note",
    hindi_title: data.hindi_title || "",
    excerpt: data.excerpt || "",
    content: data.content || "<p>Content coming soon...</p>",
    type: data.type || "chapter_note",
    subject_id: data.subject_id || "physics",
    subject_name: data.subject_name || (subjectObj ? `${subjectObj.name} (${subjectObj.hindi_name})` : "General Science"),
    chapter_number: Number(data.chapter_number) || 1,
    chapter_title: data.chapter_title || data.title || "Chapter Note",
    read_time: data.read_time || "6 min read",
    image_url: data.image_url || undefined,
    is_active: data.is_active !== false,
    is_featured: Boolean(data.is_featured),
    sort_order: Number(data.sort_order) || list.length + 1,
    exam_tag: data.exam_tag || "SSC CGL / CHSL",
    created_at: now,
    updated_at: now,
  };

  list.push(newNote);
  writeNotesFile(list);
  return newNote;
}

export function toggleChapterNoteStatus(id: string, is_active?: boolean): ChapterNote | null {
  const list = getChapterNotes({ active_only: false });
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  current.is_active = typeof is_active === "boolean" ? is_active : !current.is_active;
  current.updated_at = new Date().toISOString();
  list[idx] = current;
  writeNotesFile(list);
  return current;
}

export function deleteChapterNote(id: string): boolean {
  const list = getChapterNotes({ active_only: false });
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length !== list.length) {
    writeNotesFile(filtered);
    return true;
  }
  return false;
}

export function getSubjectStats() {
  const allNotes = getChapterNotes({ active_only: false });
  const activeNotes = allNotes.filter((n) => n.is_active);

  const subjectCounts: Record<string, { total: number; active: number }> = {};
  ALL_SUBJECTS.forEach((s) => {
    subjectCounts[s.id] = { total: 0, active: 0 };
  });

  allNotes.forEach((n) => {
    if (!subjectCounts[n.subject_id]) {
      subjectCounts[n.subject_id] = { total: 0, active: 0 };
    }
    subjectCounts[n.subject_id].total++;
    if (n.is_active) {
      subjectCounts[n.subject_id].active++;
    }
  });

  return {
    totalNotes: allNotes.length,
    activeNotes: activeNotes.length,
    inactiveNotes: allNotes.length - activeNotes.length,
    chapterNotesCount: allNotes.filter((n) => n.type === "chapter_note").length,
    guideNotesCount: allNotes.filter((n) => n.type === "educational_guide").length,
    subjectCounts,
  };
}
