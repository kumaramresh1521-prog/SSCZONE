import requests
import json
import os
import re
import sys

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

env_path = ".env.local"
supabase_url = None
supabase_key = None

with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        if "NEXT_PUBLIC_SUPABASE_URL" in line and "=" in line:
            supabase_url = line.split("=", 1)[1].strip().strip('\"\'')
        if "SUPABASE_SERVICE_ROLE_KEY" in line and "=" in line:
            supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

print("================================================================================")
print("DEEP AUDIT OF ALL 2,900 QUESTIONS ACROSS 29 PAPERS (2026)")
print("================================================================================")

# 1. Fetch all 2026 papers
res_p = requests.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title,year&order=id.asc", headers=headers)
papers = res_p.json() if res_p.ok else []
print(f"Total Papers found: {len(papers)}\n")

issues_found = []
total_qs_checked = 0
total_images_checked = 0
missing_images = []

for p_idx, p in enumerate(papers):
    p_id = p["id"]
    p_title = p["title"]
    
    # Fetch all 100 questions for this paper
    res_q = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{p_id}&select=*&order=question_number.asc", headers=headers)
    questions = res_q.json() if res_q.ok else []
    
    paper_issues = []
    
    # Check count
    if len(questions) != 100:
        paper_issues.append(f"CRITICAL: Count is {len(questions)}, expected 100!")
        
    # Check sequential numbering
    q_nums = [q["question_number"] for q in questions]
    if q_nums != list(range(1, 101)):
        missing = set(range(1, 101)) - set(q_nums)
        paper_issues.append(f"Numbering mismatch: missing {missing}")
        
    for q in questions:
        total_qs_checked += 1
        qn = q["question_number"]
        q_text = q["question_text"] or ""
        oa = q["option_a"] or ""
        ob = q["option_b"] or ""
        oc = q["option_c"] or ""
        od = q["option_d"] or ""
        ans = q["correct_answer"] or ""
        
        # 1. Answer key validity
        if ans not in ['A', 'B', 'C', 'D']:
            paper_issues.append(f"Q.{qn}: Invalid correct_answer '{ans}'")
            
        # 2. Empty question text
        if not q_text.strip():
            paper_issues.append(f"Q.{qn}: Empty question text")
            
        # 3. Dummy options ("Option A", "Option B" without any image or text)
        for let, val in [('A', oa), ('B', ob), ('C', oc), ('D', od)]:
            if val.strip() == f"Option {let}":
                paper_issues.append(f"Q.{qn}: Option {let} is fallback placeholder '{val}' (no content/image)")
            elif not val.strip():
                paper_issues.append(f"Q.{qn}: Option {let} is blank")
                
        # 4. Hindi characters check
        comb = f"{q_text} {oa} {ob} {oc} {od}"
        if any('\u0900' <= c <= '\u097F' for c in comb):
            paper_issues.append(f"Q.{qn}: Contains lingering Hindi characters")
            
        # 5. Check embedded images existence on disk
        img_urls = re.findall(r"!\[.*?\]\((/images/pyq/2026/[^\s)]+)\)", comb)
        for url in img_urls:
            total_images_checked += 1
            local_disk_path = os.path.join(r"c:\ssczone\public", url.lstrip("/").replace("/", "\\"))
            if not os.path.exists(local_disk_path):
                missing_images.append((p_title, qn, url))
                paper_issues.append(f"Q.{qn}: Missing image file on disk: {url}")
                
        # 6. Check for obvious OCR corrupt garbage
        if any(term in comb for term in ["मेंि", "रोंऔ", "र्णेहैं"]):
            paper_issues.append(f"Q.{qn}: Contains OCR corruption fragment")
            
    if paper_issues:
        print(f"[{p_idx+1}/29] ❌ {p_title} ({len(paper_issues)} issues):")
        for iss in paper_issues[:10]: # show first 10
            print(f"    - {iss}")
        if len(paper_issues) > 10:
            print(f"    ... and {len(paper_issues)-10} more issues")
        issues_found.append((p_title, paper_issues))
    else:
        print(f"[{p_idx+1}/29] ✅ {p_title}: 100/100 Perfect!")

print("\n================================================================================")
print("AUDIT SUMMARY:")
print(f"Total Papers Checked: {len(papers)}")
print(f"Total Questions Checked: {total_qs_checked}")
print(f"Total Embedded Images Checked: {total_images_checked}")
print(f"Missing Image Files on Disk: {len(missing_images)}")
print(f"Papers with Any Flagged Issues: {len(issues_found)} / {len(papers)}")
print("================================================================================")
