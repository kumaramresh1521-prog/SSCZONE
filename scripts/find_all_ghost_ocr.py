import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Pattern to detect Testbook OCR ghost fragments
# Characteristics of ghost fragments:
# Words that have consecutive floating matras, or strange 1-2 char Hindi syllables with detached matras:
# e.g. "ि ", " े", "ेऔ", "रोंऔ", "मेंी", "केंि", "हींि", "ओंे", "ैऔ", "्कि"
ghost_token_re = re.compile(
    r'\b[\u0900-\u097F]{1,4}(?:[ेैोौीिुूृ][औऐअओ]|(?:ि|ी|े|ै|ो|ौ|ू|ु)\s+(?:ि|ी|े|ै|ो|ौ|ू|ु)|[ेैोौीिुूृ]{2,})[\u0900-\u097F]*'
    r'|'
    r'(?:^|\s)[ेैोौीिुूृ]+(?:\s+[ेैोौीिुूृ]+)*(?:\s|$)'
    r'|'
    r'(?:[ेैोौीिुूृ][औऐअओ]|[औऐअओ][ेैोौीिुूृ])'
    r'|'
    r'(?:[क-ह]ि\s+[क-ह]ि|[क-ह]े\s+[क-ह]े)'
)

def find_ghost_strings(text):
    if not text:
        return []
    # Find all fragments that look like ghost OCR
    tokens = text.split()
    ghosts = []
    for t in tokens:
        # Check if token has an impossible Hindi pattern
        # e.g., ending with 'औ' after a matra: "रोंऔ", "ेऔ", "ैऔ"
        if re.search(r'[ा-ौ]औ', t):
            ghosts.append(t)
        # e.g., matra at start of token without consonant: "ि", "े"
        elif re.match(r'^[\u093E-\u094C\u0901-\u0903]', t):
            ghosts.append(t)
        # e.g. illegal stacking like "ेो", "ोि", "िि", "ेि"
        elif re.search(r'ेो|ोि|िि|ेि|ीि|िी|ैि|ैी', t):
            ghosts.append(t)
        # e.g. sequences of 1-letter syllables with matra: "केंि", "हींि", "वेंि", "मेंी"
        elif re.search(r'[क-ह][ा-ौ][क-ह]ि$|[क-ह][ा-ौ][क-ह]ी$', t) and t in ["केंि", "हींि", "वेंि", "मेंी", "ब्सि", "ेक्ट्रि", "रोंऔ"]:
            ghosts.append(t)
    return ghosts

all_paper_ghosts = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    found_in_paper = []
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75:
            continue
        
        fields = [
            ("question_text", q.get("question_text", "")),
            ("option_a", q.get("option_a", "")),
            ("option_b", q.get("option_b", "")),
            ("option_c", q.get("option_c", "")),
            ("option_d", q.get("option_d", "")),
            ("explanation", q.get("explanation", ""))
        ]
        
        for fname, val in fields:
            g = find_ghost_strings(val)
            if g:
                found_in_paper.append({
                    "qnum": qnum,
                    "field": fname,
                    "ghosts": g,
                    "val": val
                })
                
    all_paper_ghosts[pid] = {
        "title": title,
        "count": len(found_in_paper),
        "items": found_in_paper
    }

print("Ghost OCR detection per paper:")
for pid, d in all_paper_ghosts.items():
    print(f"\n=======================================================")
    print(f"Paper {pid:2d} ({d['title']}): {d['count']} questions with ghost OCR")
    for it in d["items"]:
        print(f"  Q{it['qnum']} [{it['field']}]: Ghost tokens: {it['ghosts']}")
        # print snippet
        snippet = it['val']
        for gt in it['ghosts']:
            idx = snippet.find(gt)
            if idx != -1:
                sub = snippet[max(0, idx-30):min(len(snippet), idx+len(gt)+30)]
                print(f"     Context: ...{sub}...")
