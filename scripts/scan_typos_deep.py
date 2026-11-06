import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Stray matras regex: combining marks appearing at word boundary or isolated
isolated_matra_re = re.compile(r'(?:^|\s)[\u093E-\u094C\u0901-\u0903]+(?:\s|$|\b)')

# Double matra or repetitive marks regex
double_matra_re = re.compile(r'[\u093E-\u094C\u0901-\u0903]{2,}')

# Missing space before common Hindi verbs/words: है, हैं, था, थी, थे, का, की, के, को, में, से, पर, और, या, जो, कि
missing_space_re = re.compile(r'([a-zA-Z0-9\u0900-\u097F])(है|हैं|था|थी|थे|होगा|होगी|होंगे|सकता|सकती|सकते|कहा|पूछा|दिया|गया|गई|गए)(?=[।,?\s]|$)')

# Hindi characters mashed directly onto English/digits without space
mashed_re = re.compile(r'([0-9a-zA-Z])([\u0904-\u0939])')

common_spelling_mistakes = [
    ("श्रंखला", "शृंखला"),
    ("संबधित", "संबंधित"),
    ("संबध", "संबंध"),
    ("उपरोक्त", "उपर्युक्त"),
    ("अधोलिखित", "निम्नलिखित"),
    ("किये", "किए"),
    ("लिये", "लिए"),
    ("गये", "गए"),
    ("हुये", "हुए"),
    ("नही ", "नहीं "),
    ("नही,", "नहीं,"),
    ("नही।", "नहीं।"),
    ("चाहिये", "चाहिए"),
    ("कीजिये", "कीजिए"),
    ("दीजिये", "दीजिए"),
    ("उन्होने", "उन्होंने"),
    ("इन्होने", "इन्होंने"),
    ("किन्हे", "किन्हें"),
    ("जिन्हे", "जिन्हें"),
    ("उन्हे", "उन्हें"),
    ("इन्हे", "इन्हें"),
    ("उन्होंोनेने", "उन्होंने"),
    ("कंट्रीी", "कंट्री"),
    ("ट्रॉॉफी", "ट्रॉफी"),
    ("इक्वेेडोर", "इक्वेडोर"),
    ("अनुच्छेेद", "अनुच्छेद"),
    ("इलेक्ट्रॉॉन", "इलेक्ट्रॉन"),
    ("ब्रह्मांांडीय", "ब्रह्मांडीय"),
    ("मिलिट्रीी", "मिलिट्री"),
    ("रैंकिंंग", "रैंकिंग"),
    ("कंप्यूटरोंों", "कंप्यूटरों"),
    ("यूनियनोंों", "यूनियनों"),
    ("अधिकारियोंों", "अधिकारियों"),
    ("कपड़ोंों", "कपड़ों"),
    ("भेड़ोंों", "भेड़ों"),
    ("हल्केे", "हल्के"),
    ("ड्रेेस", "ड्रेस"),
    ("सिद्धांांत", "सिद्धांत"),
    ("बास्केेटबॉल", "बास्केटबॉल"),
    ("मशीीनों", "मशीनों"),
    ("कंपनियोंों", "कंपनियों"),
    ("किमी/घंटा", "किमी/घंटा"),
    ("किमी/घं", "किमी/घंटा"),
]

paper_issues = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    issues = []
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75:
            # English section
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
            if not val:
                continue
            
            # 1. Check common spelling mistakes
            for wrong, correct in common_spelling_mistakes:
                if wrong in val:
                    issues.append({
                        "qnum": qnum,
                        "field": fname,
                        "type": "spelling",
                        "wrong": wrong,
                        "correct": correct,
                        "snippet": val[:100]
                    })
            
            # 2. Check stray/isolated matras
            stray_matches = isolated_matra_re.findall(val)
            if stray_matches:
                for sm in stray_matches:
                    issues.append({
                        "qnum": qnum,
                        "field": fname,
                        "type": "stray_matra",
                        "wrong": repr(sm),
                        "snippet": val[:100]
                    })
            
            # 3. Check repeated matras
            double_matches = double_matra_re.findall(val)
            if double_matches:
                # filter out valid combinations like ॉं or ों or ें
                real_doubles = [m for m in double_matches if m not in ["ों", "ें", "ौं", "ैं", "ॉं", "ां", "िं"]]
                if real_doubles:
                    issues.append({
                        "qnum": qnum,
                        "field": fname,
                        "type": "double_matra",
                        "wrong": repr(real_doubles),
                        "snippet": val[:100]
                    })
            
            # 4. Check missing space before 'है', 'हैं', etc.
            # e.g., 'सकताहै', 'कियाहै', 'है।' mashed
            merged_words = re.findall(r'[\u0904-\u0939]{3,}(?:है|हैं|था|थी|थे|होगी|होगा)', val)
            # filter out words like 'संदेह', 'विवाह'
            false_positives = ["संदेह", "विवाह", "प्रवाह", "उत्साह", "अथाह", "सराह", "समावेश", "समीह"]
            valid_merged = [w for w in merged_words if not any(w.endswith(fp) for fp in false_positives)]
            if valid_merged:
                issues.append({
                    "qnum": qnum,
                    "field": fname,
                    "type": "missing_space",
                    "wrong": repr(valid_merged),
                    "snippet": val[:100]
                })

            # 5. Check english-hindi mashed e.g. "Q.1है" or "100मीटर" or "50%"
            # Specifically digits/letters immediately followed by hindi without space
            mashed_matches = re.findall(r'[0-9a-zA-Z][\u0900-\u097F]{2,}', val)
            # filter out LaTeX or valid tokens
            clean_mashed = [m for m in mashed_matches if not m.startswith("0x") and not "frac" in m]
            if clean_mashed:
                issues.append({
                    "qnum": qnum,
                    "field": fname,
                    "type": "mashed_alphanumeric",
                    "wrong": repr(clean_mashed[:3]),
                    "snippet": val[:100]
                })

    paper_issues[pid] = {
        "title": title,
        "total_issues": len(issues),
        "issues": issues
    }

print("Scan Complete! Summary of potential Hindi typos per paper:")
for pid, d in paper_issues.items():
    print(f"Paper ID {pid:2d}: {d['title']} -> {d['total_issues']} potential typos/issues")

with open("tmp_detected_issues.json", "w", encoding="utf-8") as f:
    json.dump(paper_issues, f, ensure_ascii=False, indent=2)
