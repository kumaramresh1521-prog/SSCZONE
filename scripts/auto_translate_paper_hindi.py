import sys
import os
import json
import re
import urllib.request
import urllib.parse
from dotenv import dotenv_values

sys.stdout.reconfigure(encoding="utf-8")

# Load Supabase config
env = dotenv_values(".env.local")
SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Error: Supabase environment variables missing in .env.local")
    sys.exit(1)

def translate_to_hindi(text):
    if not text or not text.strip():
        return ""
    
    # Preserve math expressions $...$, \(...\), \frac...
    math_tokens = []
    def repl(m):
        math_tokens.append(m.group(0))
        return f"___MATH_TOKEN_{len(math_tokens)-1}___"
    
    masked = re.sub(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)', repl, text)
    
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=" + urllib.parse.quote(masked)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            translated = "".join([part[0] for part in data[0] if part[0]])
            
            # Restore math expressions
            for idx, tok in enumerate(math_tokens):
                translated = translated.replace(f"___MATH_TOKEN_{idx}___", tok)
                translated = translated.replace(f"___ गणित_टोकन_{idx} ___", tok)
                translated = translated.replace(f"___गणित_टोकन_{idx}___", tok)
            return translated.strip()
    except Exception as e:
        print(f"Translation API error for text: {e}")
        return ""

def clean_english_segment(full_text):
    # Splits off any Hindi characters to get the pure English base
    hindi_match = re.search(r'[\u0900-\u097F]', full_text)
    if hindi_match:
        en = full_text[:hindi_match.start()].strip()
        if len(en) > 10:
            return en
    return full_text.strip()

def process_paper(paper_id):
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    # Fetch paper details
    paper_req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/previous_papers?id=eq.{paper_id}&select=id,title,year,duration_minutes,exams(title)", headers=headers)
    with urllib.request.urlopen(paper_req) as resp:
        papers = json.loads(resp.read().decode("utf-8"))
        if not papers:
            print(f"Paper {paper_id} not found!")
            return
        paper = papers[0]

    # Fetch questions
    q_req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&order=question_number.asc", headers=headers)
    with urllib.request.urlopen(q_req) as resp:
        questions = json.loads(resp.read().decode("utf-8"))

    print(f"\n==================================================")
    print(f"Processing Paper ID: {paper_id} - {paper.get('title')}")
    print(f"Total Questions to verify & translate: {len(questions)}")
    print(f"==================================================")

    updated_count = 0

    for q in questions:
        q_no = q["question_number"]

        # English section (Questions 76-100) must remain pure English as per SSC pattern
        if q_no > 75:
            continue

        raw_q = q["question_text"]
        en_part = clean_english_segment(raw_q)
        
        # Translate to clean Hindi
        hi_trans = translate_to_hindi(en_part)
        if not hi_trans:
            continue

        new_q_text = f"{en_part} {hi_trans}"

        # Options translation if text-heavy
        updates = {"question_text": new_q_text}

        for opt_key in ["option_a", "option_b", "option_c", "option_d"]:
            opt_val = q.get(opt_key) or ""
            # If option has English letters (more than single letter like A, B, C, D)
            if re.search(r'[A-Za-z]{2,}', opt_val) and not re.search(r'[\u0900-\u097F]', opt_val):
                hi_opt = translate_to_hindi(opt_val)
                if hi_opt and hi_opt != opt_val:
                    updates[opt_key] = f"{opt_val} / {hi_opt}"

        # Update Supabase
        patch_data = json.dumps(updates).encode("utf-8")
        patch_req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/paper_questions?id=eq.{q['id']}", data=patch_data, headers=headers, method="PATCH")
        with urllib.request.urlopen(patch_req) as resp:
            pass

        updated_count += 1
        if updated_count % 10 == 0:
            print(f"  Translated & updated {updated_count}/75 questions...")

    print(f"Completed Paper ID {paper_id}: {updated_count} questions translated into pure Hindi.")

    # Refresh local TXT and JSON backups
    try:
        from urllib.request import Request, urlopen
        sync_req = Request(f"http://localhost:3000/api/papers/questions?paperId={paper_id}")
        urlopen(sync_req)
        print(f"Local backups (.txt and .json) re-synced successfully for Paper {paper_id}.")
    except Exception as e:
        print(f"Backup sync note: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "1"
    if target == "--all":
        paper_ids = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        for pid in paper_ids:
            process_paper(pid)
    else:
        process_paper(int(target))
