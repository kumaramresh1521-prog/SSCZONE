export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "Exam Notification" | "Answer Key & Results" | "Preparation Strategy" | "Current Affairs";
  exam_tag?: string;
  read_time: string;
  image_url?: string;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
}

export const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "post-cgl-2026-notification",
    title: "SSC CGL 2026 Official Notification Out: Check Vacancy, Eligibility & Pattern",
    slug: "ssc-cgl-2026-official-notification-vacancy-dates",
    excerpt: "Staff Selection Commission has released the official recruitment notification for CGL 2026. Review total vacancies, age limits, syllabus updates, and how to apply online.",
    category: "Exam Notification",
    exam_tag: "SSC CGL",
    read_time: "5 min read",
    is_published: true,
    is_featured: true,
    created_at: "2026-10-25T10:00:00Z",
    content: `
      <h2>SSC CGL 2026 Official Notification Overview</h2>
      <p>The Staff Selection Commission (SSC) has officially published the Combined Graduate Level Examination (CGL) 2026 recruitment notification. Eligible candidates across India can register and submit their online applications through the official portal <code>ssc.gov.in</code>.</p>
      
      <h3>Key Dates & Exam Schedule</h3>
      <ul>
        <li><strong>Online Application Window:</strong> Active now on ssc.gov.in</li>
        <li><strong>Tier-1 Computer Based Exam:</strong> Expected in upcoming exam cycles</li>
        <li><strong>Tier-2 Mains Examination:</strong> Schedule to be released post Tier-1 results</li>
      </ul>

      <h3>Eligibility Criteria</h3>
      <p>Candidates must possess a Bachelor's Degree in any discipline from a recognized University or equivalent. Age limit varies between 18 to 30/32 years depending on post categories (Inspector, ASO, Tax Assistant, Auditor), with standard relaxations applicable for reserved categories.</p>

      <h3>Tier-1 Computer Based Exam Pattern</h3>
      <p>Tier-1 comprises 100 questions carrying 200 marks across 4 sections with 60 minutes composite duration:</p>
      <ol>
        <li>General Intelligence & Reasoning: 25 Questions (50 Marks)</li>
        <li>General Awareness (GK/GS & Current Affairs): 25 Questions (50 Marks)</li>
        <li>Quantitative Aptitude: 25 Questions (50 Marks)</li>
        <li>English Comprehension: 25 Questions (50 Marks)</li>
      </ol>
      <p>Negative marking of 0.50 marks is deducted for each incorrect answer.</p>
    `
  },
  {
    id: "post-chsl-answer-key-released",
    title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet: Objection Link Active",
    slug: "ssc-chsl-tier-1-answer-key-response-sheet-objection-link",
    excerpt: "Candidates can now download their Tier 1 response sheets and challenge tentative answer keys online. Check safe score calculations and expected cut-off trends.",
    category: "Answer Key & Results",
    exam_tag: "SSC CHSL",
    read_time: "4 min read",
    is_published: true,
    is_featured: false,
    created_at: "2026-10-22T14:30:00Z",
    content: `
      <h2>SSC CHSL Tier 1 Answer Key Released</h2>
      <p>The Staff Selection Commission has uploaded the Tentative Answer Keys along with candidates' Response Sheets for Combined Higher Secondary Level (10+2) Examination.</p>

      <h3>How to Check Response Sheet:</h3>
      <ol>
        <li>Visit the candidate login portal on the official website.</li>
        <li>Enter your Roll Number and Password (as mentioned on your Admit Card).</li>
        <li>Download and print your official Response Sheet along with marked options.</li>
      </ol>

      <h3>Objection Window Guidelines:</h3>
      <p>Representations in respect of tentative answer keys must be submitted online within the specified window upon payment of ₹100 per question/answer challenged. Late representations will not be entertained.</p>
    `
  },
  {
    id: "post-maths-topper-strategy",
    title: "How to Score 45+ in SSC Maths (Arithmetic & Advance): Complete Guide",
    slug: "how-to-score-45-plus-in-ssc-maths-arithmetic-advance",
    excerpt: "Step-by-step preparation strategy, chapter-wise weightage analysis, and speed tricks to score full marks in Quantitative Aptitude.",
    category: "Preparation Strategy",
    exam_tag: "Maths Strategy",
    read_time: "7 min read",
    is_published: true,
    is_featured: false,
    created_at: "2026-10-18T09:15:00Z",
    content: `
      <h2>Mastering SSC Quantitative Aptitude</h2>
      <p>Quantitative Aptitude tests both speed and accuracy. Under TCS pattern questions, calculation intensity has increased while standard formula questions remain predictable.</p>

      <h3>1. High-Yield Arithmetic Core:</h3>
      <ul>
        <li><strong>Percentage & Fractions:</strong> Memorize fraction to percentage conversions up to 1/20 (e.g., 1/7 = 14.28%, 1/14 = 7.14%).</li>
        <li><strong>Profit, Loss & Discount:</strong> Use multiplier factors for successive discounts.</li>
        <li><strong>Time & Work:</strong> Focus on LCM efficiency method.</li>
      </ul>

      <h3>2. Advance Maths Focus:</h3>
      <ul>
        <li><strong>Geometry:</strong> Triangle angle bisector theorem, circumcentre, incentre properties, and tangent chord theorems.</li>
        <li><strong>Trigonometry:</strong> Master Pythagorean triplets and value-putting techniques (θ = 45° or 30°/60°).</li>
        <li><strong>Algebra:</strong> Classic symmetric expressions such as if x + 1/x = a, then x³ + 1/x³ = a³ - 3a.</li>
      </ul>
    `
  },
  {
    id: "post-monthly-current-affairs",
    title: "Monthly Current Affairs Capsule: Top 100 Most Expected TCS MCQs",
    slug: "monthly-current-affairs-capsule-top-100-expected-mcqs",
    excerpt: "Curated monthly round-up covering Appointments, Sports, Awards, Government Schemes, Summits, and Science & Technology for SSC exams.",
    category: "Current Affairs",
    exam_tag: "General Awareness",
    read_time: "6 min read",
    is_published: true,
    is_featured: false,
    created_at: "2026-10-15T11:00:00Z",
    content: `
      <h2>Curated High-Yield Current Affairs Digest</h2>
      <p>TCS questions in SSC CGL, CHSL, and CPO consistently focus on national schemes, sporting tournaments, defense exercises, and scientific achievements.</p>

      <h3>Key Focus Domains:</h3>
      <ul>
        <li><strong>Government Schemes:</strong> Ministry, target year, beneficiary criteria, and allocated outlay.</li>
        <li><strong>Sports:</strong> Grand Slam tournament winners, National Games medal tally, and Olympic sports records.</li>
        <li><strong>Science & Space:</strong> ISRO launch vehicle missions, satellites, and defence test firings.</li>
        <li><strong>Summits & Bilateral Exercises:</strong> Host countries and participating naval/military branches.</li>
      </ul>
    `
  },
  {
    id: "post-polity-repeated-articles",
    title: "Top 50 Most Repeated Indian Polity Articles in SSC CGL & CHSL",
    slug: "top-50-most-repeated-indian-polity-articles-in-ssc",
    excerpt: "Direct revision cheat sheet of Fundamental Rights, DPSP, Writs, and Constitutional Amendments frequently asked by TCS examiners.",
    category: "Preparation Strategy",
    exam_tag: "Polity GS",
    read_time: "5 min read",
    is_published: true,
    is_featured: false,
    created_at: "2026-10-10T16:20:00Z",
    content: `
      <h2>Indian Polity Revision Master-List</h2>
      <p>Polity contributes 3-5 direct questions in General Awareness. Memorizing these essential articles guarantees 100% accuracy.</p>

      <h3>Guaranteed High-Yield Articles:</h3>
      <ul>
        <li><strong>Article 14:</strong> Equality before law.</li>
        <li><strong>Article 17:</strong> Abolition of Untouchability.</li>
        <li><strong>Article 21:</strong> Protection of life and personal liberty.</li>
        <li><strong>Article 21A:</strong> Right to free and compulsory education for 6-14 years.</li>
        <li><strong>Article 32:</strong> Constitutional Remedies (5 Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto).</li>
        <li><strong>Article 44:</strong> Uniform Civil Code (UCC).</li>
        <li><strong>Article 51A:</strong> Fundamental Duties (11 duties, 42nd & 86th Amendments).</li>
        <li><strong>Article 368:</strong> Power of Parliament to amend the Constitution.</li>
      </ul>
    `
  }
];
