import sys, random, json
from datetime import datetime, timezone
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request

u, k = get_supabase_credentials()

# 1. Fetch valid papers
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title&order=id.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    valid_papers = json.loads(resp.read())

paper_ids = [p['id'] for p in valid_papers]
paper_map = {p['id']: p['title'] for p in valid_papers}

SECTIONS = [
    {"key": "reasoning", "name": "General Intelligence & Reasoning", "min": 1, "max": 25},
    {"key": "ga", "name": "General Awareness", "min": 26, "max": 50},
    {"key": "quant", "name": "Quantitative Aptitude", "min": 51, "max": 75},
    {"key": "english", "name": "English Comprehension", "min": 76, "max": 100},
]

today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

def normalize_ans(a):
    if not a: return "A"
    s = str(a).strip().upper()
    return s if s in ("A", "B", "C", "D") else "A"

def fetch_section_pyqs(sec, count):
    picked_papers = random.sample(paper_ids, 6)
    in_clause = ','.join(str(pid) for pid in picked_papers)
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=in.({in_clause})&question_number=gte.{sec["min"]}&question_number=lte.{sec["max"]}&limit={count * 3}&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req_q) as resp:
        rows = json.loads(resp.read())
    valid_rows = [r for r in rows if r.get('question_text') and r.get('option_a') and r.get('option_b')]
    selected = random.sample(valid_rows, min(count, len(valid_rows)))
    out = []
    for q in selected:
        p_title = paper_map.get(q['paper_id'], f"Shift #{q['paper_id']}")
        out.append({
            "id": f"pyq_{q['id']}",
            "question_text": q['question_text'].strip(),
            "option_a": q['option_a'].strip(),
            "option_b": q['option_b'].strip(),
            "option_c": (q.get('option_c') or '').strip(),
            "option_d": (q.get('option_d') or '').strip(),
            "correct_answer": normalize_ans(q.get('correct_answer')),
            "explanation": q.get('explanation') or f"Official SSC Shift Question Solution ({p_title}, Q.{q['question_number']}).",
            "source": p_title,
            "section_key": sec['key'],
            "section_name": sec['name']
        })
    return out

print("Building Daily Free Quizzes with 100% genuine Shift PYQs...")

# 1. 100-Question Mixed Mock (25 Reasoning, 25 GA, 25 Quant, 25 English)
mixed_questions = []
for sec in SECTIONS:
    sq = fetch_section_pyqs(sec, 25)
    mixed_questions.extend(sq)
    print(f"  Mixed Mock -> Section '{sec['key']}': {len(sq)} questions")

# 2. 25-Question Quant Drill
quant_questions = fetch_section_pyqs(SECTIONS[2], 25)
# 3. 25-Question Reasoning Drill
reasoning_questions = fetch_section_pyqs(SECTIONS[0], 25)
# 4. 25-Question GA Drill
ga_questions = fetch_section_pyqs(SECTIONS[1], 25)
# 5. 25-Question English Drill
english_questions = fetch_section_pyqs(SECTIONS[3], 25)

now_iso = datetime.now(timezone.utc).isoformat()

quizzes = [
    {
        "id": f"dq_{today_str}_mixed_100",
        "title": f"Daily Free Quiz: All India SSC CGL Tier-1 Shift Mock ({today_str})",
        "date": today_str,
        "subject": "Mixed Full Mock",
        "subject_key": "mixed",
        "target_exam": "SSC CGL / CHSL 2026",
        "duration_minutes": 60,
        "total_questions": len(mixed_questions),
        "is_active": True,
        "status": "approved",
        "approved_at": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "questions": mixed_questions
    },
    {
        "id": f"dq_{today_str}_quant_25",
        "title": f"Daily Free Quiz: Quantitative Aptitude Shift Drill ({today_str})",
        "date": today_str,
        "subject": "Quantitative Aptitude",
        "subject_key": "quant",
        "target_exam": "SSC CGL / CHSL 2026",
        "duration_minutes": 20,
        "total_questions": len(quant_questions),
        "is_active": True,
        "status": "approved",
        "approved_at": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "questions": quant_questions
    },
    {
        "id": f"dq_{today_str}_reasoning_25",
        "title": f"Daily Free Quiz: Reasoning & Intelligence Shift Drill ({today_str})",
        "date": today_str,
        "subject": "General Intelligence & Reasoning",
        "subject_key": "reasoning",
        "target_exam": "SSC CGL / CHSL 2026",
        "duration_minutes": 15,
        "total_questions": len(reasoning_questions),
        "is_active": True,
        "status": "approved",
        "approved_at": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "questions": reasoning_questions
    },
    {
        "id": f"dq_{today_str}_ga_25",
        "title": f"Daily Free Quiz: General Awareness & Static GK Shift Drill ({today_str})",
        "date": today_str,
        "subject": "General Awareness",
        "subject_key": "ga",
        "target_exam": "SSC CGL / CHSL 2026",
        "duration_minutes": 10,
        "total_questions": len(ga_questions),
        "is_active": True,
        "status": "approved",
        "approved_at": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "questions": ga_questions
    },
    {
        "id": f"dq_{today_str}_english_25",
        "title": f"Daily Free Quiz: English Comprehension Shift Challenge ({today_str})",
        "date": today_str,
        "subject": "English Language",
        "subject_key": "english",
        "target_exam": "SSC CGL / CHSL 2026",
        "duration_minutes": 15,
        "total_questions": len(english_questions),
        "is_active": True,
        "status": "approved",
        "approved_at": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "questions": english_questions
    }
]

file_path = "c:/ssczone/src/data/daily_quizzes.json"
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(quizzes, f, ensure_ascii=False, indent=2)

print(f"\nSUCCESS! Wrote {len(quizzes)} approved daily quizzes to {file_path}")
print(f"Total questions generated across all quizzes: {sum(q['total_questions'] for q in quizzes)}")
