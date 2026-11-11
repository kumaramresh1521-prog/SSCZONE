import requests
import json
import re
import sys
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

print("=== MASTER AUDIT: ALL PAPERS IN SUPABASE ===")

# 1. Fetch all papers
res = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc", headers=HEADERS)
if not res.ok:
    print("Failed to fetch papers:", res.text)
    sys.exit(1)

papers = res.json()
print(f"Total papers registered: {len(papers)}")

total_issues = 0

for p in papers:
    pid = p['id']
    title = p['title']
    
    # Fetch questions for this paper
    res_q = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc", headers=HEADERS)
    if not res_q.ok:
        print(f"Paper {pid}: Failed to fetch questions")
        total_issues += 1
        continue
    
    qs = res_q.json()
    q_count = len(qs)
    
    paper_issues = []
    if q_count != 100:
        paper_issues.append(f"Question count is {q_count} instead of 100")
        
    for q in qs:
        qn = q['question_number']
        txt = q['question_text'] or ""
        opts = [q.get('option_a') or "", q.get('option_b') or "", q.get('option_c') or "", q.get('option_d') or ""]
        ans = q.get('correct_answer') or ""
        
        # Check text length
        if len(txt.strip()) < 10:
            paper_issues.append(f"Q{qn}: Short text ('{txt}')")
            
        # Check empty or placeholder options
        for idx, opt in enumerate(opts):
            lbl = chr(65 + idx)
            if not opt or opt.strip() == "" or opt == f"Option {lbl}":
                paper_issues.append(f"Q{qn}: Empty/placeholder option {lbl} ('{opt}')")
                
        # Check valid answer
        if ans not in ['A', 'B', 'C', 'D']:
            paper_issues.append(f"Q{qn}: Invalid answer '{ans}'")
            
        # Check Devanagari corruptions
        if "ि ैी ेी ि रेंऔ" in txt or "र्केी ेी ि ी" in txt:
            paper_issues.append(f"Q{qn}: Corrupt Hindi font cluster in text")
        if re.search(r'([\u093E-\u094C\u0901-\u0903])\1{2,}', txt):
            paper_issues.append(f"Q{qn}: Tripled Hindi matras in text")

    status_str = f"✓ {q_count}/100 questions OK" if not paper_issues else f"⚠ {len(paper_issues)} ISSUES DETECTED"
    print(f"Paper ID {pid:2d} | {title[:55]:<55} | {status_str}")
    if paper_issues:
        total_issues += len(paper_issues)
        for iss in paper_issues[:5]:
            print(f"   • {iss}")
        if len(paper_issues) > 5:
            print(f"   ... and {len(paper_issues) - 5} more issues.")

print(f"\n=======================================================")
print(f"AUDIT SUMMARY: {len(papers)} papers inspected. Total issues found: {total_issues}")
print(f"=======================================================")
