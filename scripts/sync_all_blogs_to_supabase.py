import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('.env.local')

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_key:
    print("Error: Missing Supabase credentials in .env.local")
    exit(1)

headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation'
}

# 1. Load notes from src/data/chapter_notes.json
with open('src/data/chapter_notes.json', 'r', encoding='utf-8') as f:
    chapter_notes = json.load(f)

notes_map = {n['slug']: n for n in chapter_notes}

# 2. Prepare Blog entries
blogs_to_sync = []

# Biology Note
if 'biology-cell-structure-organelles-division' in notes_map:
    bio = notes_map['biology-cell-structure-organelles-division']
    blogs_to_sync.append({
        'title': 'Cell Biology: Structure, Organelles & Cell Division (Complete Notes)',
        'slug': 'biology-cell-structure-organelles-division',
        'content': bio['content'],
        'excerpt': 'Comprehensive bilingual study notes covering Cell Theory, Organelles (Mitochondria, Nucleus, ER, Golgi), Plant vs Animal Cells, Mitosis & Meiosis with SSC PYQ MCQs.',
        'seo_title': 'Cell Biology Notes: Structure, Organelles & Division for SSC CGL 2026 | SSCZone',
        'keywords': json.dumps({
            'category': 'General Science & Biology',
            'focus': 'Cell Biology SSC CGL',
            'examTag': 'SSC CGL / CHSL / RRB NTPC',
            'seoScore': 95,
            'secondary': 'Cell Structure Organelles PDF, Plant vs Animal Cell Difference, Mitosis Meiosis Stages, SSC Biology Chapter Notes',
            'readTime': '15 min read',
            'hindiTitle': 'कोशिका विज्ञान: संरचना, कोशिकांग एवं कोशिका विभाजन'
        }),
        'image_url': 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
        'is_published': True,
        'created_at': bio.get('created_at', '2026-11-05T10:00:00Z'),
        'updated_at': bio.get('updated_at', '2026-11-14T12:00:00Z')
    })

# English Pronoun Note
if 'english-pronoun-complete-rules-types' in notes_map:
    pro = notes_map['english-pronoun-complete-rules-types']
    blogs_to_sync.append({
        'title': 'English Grammar: Pronoun Rules, Types & Error Spotting (Master Notes)',
        'slug': 'english-pronoun-complete-rules-types',
        'content': pro['content'],
        'excerpt': 'Comprehensive bilingual guide to Pronouns covering all 8 types, 17 Golden Rules, Order of Pronouns (231 vs 123), Relative Pronoun rules, and 15 interactive MCQs.',
        'seo_title': 'Pronoun Rules, Types & Error Spotting for SSC CGL & CHSL 2026 | SSCZone',
        'keywords': json.dumps({
            'category': 'English Language & Grammar',
            'focus': 'Pronoun Rules for SSC CGL',
            'examTag': 'SSC CGL / CHSL / CPO',
            'seoScore': 96,
            'secondary': 'Types of Pronoun PDF, Relative Pronoun Who vs Whom, Order of Pronoun 231 Rule, SSC English Error Spotting',
            'readTime': '18 min read',
            'hindiTitle': 'सर्वनाम: संपूर्ण प्रकार, 17 स्वर्णिम नियम एवं उदाहरण'
        }),
        'image_url': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        'is_published': True,
        'created_at': pro.get('created_at', '2026-11-14T10:00:00Z'),
        'updated_at': pro.get('updated_at', '2026-11-14T12:00:00Z')
    })

# English Tenses Note
if 'english-tenses-rules-structures-usage' in notes_map:
    ten = notes_map['english-tenses-rules-structures-usage']
    blogs_to_sync.append({
        'title': 'Complete English Tenses: Rules, Structures, Timelines & Usage',
        'slug': 'english-tenses-rules-structures-usage',
        'content': ten['content'],
        'excerpt': 'Master all 12 Tenses with comprehensive bilingual explanations, formula charts, stative verbs list, since vs for rules, past of the past, and 15 interactive MCQs.',
        'seo_title': 'English Tenses Rules, Structures & Chart for SSC CGL 2026 | SSCZone',
        'keywords': json.dumps({
            'category': 'English Language & Grammar',
            'focus': 'Tenses Rules for SSC CGL',
            'examTag': 'SSC CGL / CHSL / CPO',
            'seoScore': 95,
            'secondary': '12 Tenses Formula Chart PDF, Since vs For Usage, Stative Verbs List, Sequence of Tenses SSC English',
            'readTime': '16 min read',
            'hindiTitle': 'काल (Tenses): संपूर्ण 12 काल, संरचना, नियम एवं उदाहरण'
        }),
        'image_url': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
        'is_published': True,
        'created_at': ten.get('created_at', '2026-11-14T10:00:00Z'),
        'updated_at': ten.get('updated_at', '2026-11-14T12:00:00Z')
    })

# 3. Default SSC official blogs
default_blogs_raw = [
    {
        'title': 'SSC CGL 2026 Official Notification Out: Check Vacancy, Eligibility & Pattern',
        'slug': 'ssc-cgl-2026-official-notification-vacancy-dates',
        'excerpt': 'Staff Selection Commission has released the official recruitment notification for CGL 2026. Review total vacancies, age limits, syllabus updates, and how to apply online.',
        'category': 'Exam Notification',
        'exam_tag': 'SSC CGL',
        'read_time': '5 min read',
        'content': '''<h2>SSC CGL 2026 Official Notification Overview</h2>
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
<p>Negative marking of 0.50 marks is deducted for each incorrect answer.</p>'''
    },
    {
        'title': 'SSC CHSL Tier 1 Answer Key & Response Sheet: Direct Download Link',
        'slug': 'ssc-chsl-tier-1-answer-key-response-sheet-direct-link',
        'excerpt': 'Download official tentative SSC CHSL Tier-1 shift-wise answer keys and candidate response sheets. Submit objections within official window.',
        'category': 'Answer Key & Results',
        'exam_tag': 'SSC CHSL',
        'read_time': '4 min read',
        'content': '''<h2>SSC CHSL Tier-1 Answer Key Announcement</h2>
<p>Staff Selection Commission has uploaded the Tentative Answer Keys along with candidates' Response Sheets for Combined Higher Secondary Level (10+2) Examination.</p>
<h3>How to Check & Download Answer Key</h3>
<ol>
  <li>Visit the official portal at <code>ssc.gov.in</code>.</li>
  <li>Click on the login link with your Examination Roll Number and Password.</li>
  <li>Download the question paper with your marked responses.</li>
  <li>Calculate raw score using official marking scheme (+2 for correct, -0.50 for wrong).</li>
</ol>
<h3>Representation & Objection Procedure</h3>
<p>Representations in respect of tentative answer keys may be submitted online on payment of ₹100/- per question/answer challenged within the designated window.</p>'''
    },
    {
        'title': 'How to Score 45+ in Quantitative Aptitude for SSC CGL 2026',
        'slug': 'how-to-score-45-plus-in-quantitative-aptitude-ssc-cgl',
        'excerpt': 'Proven topic-wise strategy to conquer Arithmetic and Advanced Maths with speed calculation shortcuts, formula charts, and previous year shift analysis.',
        'category': 'Preparation Strategy',
        'exam_tag': 'SSC CGL',
        'read_time': '7 min read',
        'content': '''<h2>Quantitative Aptitude Preparation Blueprint</h2>
<p>Scoring 45+ out of 50 in SSC CGL Quantitative Aptitude requires dual mastery: conceptual depth and rapid speed calculations.</p>
<h3>1. High-Yield Topic Breakdown</h3>
<ul>
  <li><strong>Arithmetic:</strong> Percentage, Ratio & Proportion, Profit & Loss, SI & CI, Time & Work, Time Speed Distance.</li>
  <li><strong>Advanced Maths:</strong> Geometry & Mensuration, Trigonometry, Algebra, Coordinate Geometry.</li>
  <li><strong>Data Interpretation:</strong> Tabular charts, Bar graphs, and Pie charts.</li>
</ul>
<h3>2. Speed Calculation Shortcuts</h3>
<p>Memorize squares up to 50, cubes up to 30, and fraction-to-percentage tables from 1/2 to 1/25. This saves 5 to 7 seconds on every single calculation.</p>'''
    },
    {
        'title': 'Monthly Current Affairs & Static GK Capsule for SSC CGL & CHSL',
        'slug': 'monthly-current-affairs-static-gk-capsule-ssc-cgl-chsl',
        'excerpt': 'High-probability Static GK capsules: National Parks, Classical Dances, Constitutional Articles, Scientific Inventions, and recent government schemes.',
        'category': 'Current Affairs',
        'exam_tag': 'SSC All Exams',
        'read_time': '6 min read',
        'content': '''<h2>General Awareness High-Yield Capsule</h2>
<p>Static GK forms 60% of the General Awareness paper in SSC examinations. Focus on repeating themes rather than random trivia.</p>
<h3>Core Static GK Themes</h3>
<ul>
  <li><strong>Art & Culture:</strong> Classical dance forms, folk musical instruments, and temple architecture.</li>
  <li><strong>Polity:</strong> Fundamental Rights (Articles 12-35), Directive Principles, and Constitutional Amendments.</li>
  <li><strong>Geography:</strong> River systems, tributaries, mountain passes, and National Parks.</li>
  <li><strong>Science:</strong> Human diseases, vitamin deficiencies, chemical names of common compounds, and SI units.</li>
</ul>'''
    }
]

for b in default_blogs_raw:
    blogs_to_sync.append({
        'title': b['title'],
        'slug': b['slug'],
        'content': b['content'],
        'excerpt': b['excerpt'],
        'seo_title': f"{b['title']} | SSCZone",
        'keywords': json.dumps({
            'category': b['category'],
            'focus': b['title'][:50],
            'examTag': b['exam_tag'],
            'seoScore': 90,
            'secondary': 'SSC Exam Preparation, Previous Papers, CBT Test Series',
            'readTime': b['read_time']
        }),
        'is_published': True,
        'created_at': '2026-11-01T10:00:00Z',
        'updated_at': '2026-11-14T10:00:00Z'
    })

print(f"Total blogs prepared for Supabase sync: {len(blogs_to_sync)}")

# Check existing slugs in Supabase
req_existing = urllib.request.Request(f'{supabase_url}/rest/v1/blogs?select=id,slug', headers=headers)
with urllib.request.urlopen(req_existing) as resp:
    existing_records = json.loads(resp.read().decode())
    existing_map = {r['slug']: r['id'] for r in existing_records}
    print(f"Existing records in Supabase: {len(existing_map)}")

inserted_count = 0
updated_count = 0

for blog in blogs_to_sync:
    slug = blog['slug']
    if slug in existing_map:
        # Update existing
        rec_id = existing_map[slug]
        update_url = f'{supabase_url}/rest/v1/blogs?id=eq.{rec_id}'
        up_req = urllib.request.Request(update_url, data=json.dumps(blog).encode(), headers=headers, method='PATCH')
        with urllib.request.urlopen(up_req) as up_resp:
            print(f"Updated blog in Supabase: {slug}")
            updated_count += 1
    else:
        # Insert new
        ins_url = f'{supabase_url}/rest/v1/blogs'
        ins_req = urllib.request.Request(ins_url, data=json.dumps([blog]).encode(), headers=headers, method='POST')
        with urllib.request.urlopen(ins_req) as ins_resp:
            print(f"Inserted blog into Supabase: {slug}")
            inserted_count += 1

print(f"DONE! Total Inserted: {inserted_count}, Total Updated: {updated_count}")
