import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Specific typo patterns
TYPO_PATTERNS = [
    # 1. Spelling / Grammar mistakes
    (r'\bश्रंखला\b', 'शृंखला', 'Spelling: श्रंखला -> शृंखला'),
    (r'\bसंबधित\b', 'संबंधित', 'Spelling: संबधित -> संबंधित'),
    (r'\bसंबध\b', 'संबंध', 'Spelling: संबध -> संबंध'),
    (r'\bसंबधों\b', 'संबंधों', 'Spelling: संबधों -> संबंधों'),
    (r'\bउपरोक्त\b', 'उपर्युक्त', 'Spelling: उपरोक्त -> उपर्युक्त'),
    (r'\bकिये\b', 'किए', 'Grammar: किये -> किए'),
    (r'\bलिये\b', 'लिए', 'Grammar: लिये -> लिए'),
    (r'\bगये\b', 'गए', 'Grammar: गये -> गए'),
    (r'\bहुये\b', 'हुए', 'Grammar: हुये -> हुए'),
    (r'\bदीजिये\b', 'दीजिए', 'Grammar: कीजिये/दीजिये -> दीजिए'),
    (r'\bकीजिये\b', 'कीजिए', 'Grammar: कीजिये -> कीजिए'),
    (r'\bनही\b', 'नहीं', 'Bindi missing: नही -> नहीं'),
    (r'\bउन्होने\b', 'उन्होंने', 'Bindi missing: उन्होने -> उन्होंने'),
    (r'\bइन्होने\b', 'इन्होंने', 'Bindi missing: इन्होने -> इन्होंने'),
    (r'\bकिन्हे\b', 'किन्हें', 'Bindi missing: किन्हे -> किन्हें'),
    (r'\bजिन्हे\b', 'जिन्हें', 'Bindi missing: जिन्हे -> जिन्हें'),
    (r'\bउन्हे\b', 'उन्हें', 'Bindi missing: उन्हे -> उन्हें'),
    (r'\bइन्हे\b', 'इन्हें', 'Bindi missing: इन्हे -> इन्हें'),
    (r'\bदुगना\b', 'दोगुना', 'Spelling: दुगना -> दोगुना'),
    (r'\bतिगुना\b', 'तीन गुना', 'Spelling: तिगुना -> तीन गुना'),
    (r'\bप्रतिशत्\b', 'प्रतिशत', 'Spelling: प्रतिशत् -> प्रतिशत'),
    (r'\bअंकगणितीय\b', 'अंकगणितीय', 'Spelling: अंकगणितीय'),
    (r'\bकौशलो\b', 'कौशलों', 'Bindi missing: कौशलो -> कौशलों'),
    (r'\bस्थानो\b', 'स्थानों', 'Bindi missing: स्थानो -> स्थानों'),
    (r'\bशब्दो\b', 'शब्दों', 'Bindi missing: शब्दो -> शब्दों'),
    (r'\bअक्षरो\b', 'अक्षरों', 'Bindi missing: अक्षरो -> अक्षरों'),
    (r'\bसंख्याओ\b', 'संख्याओं', 'Bindi missing: संख्याओ -> संख्याओं'),
    (r'\bविकल्पो\b', 'विकल्पों', 'Bindi missing: विकल्पो -> विकल्पों'),
    (r'\bप्रश्नो\b', 'प्रश्नों', 'Bindi missing: प्रश्नो -> प्रश्नों'),

    # 2. Stray OCR ghost characters / matras
    (r'[\u0900-\u097F] [ेैोौीिुूृ]\b', ' ', 'Stray floating matra after space'),
    (r'\b[ेैोौीिुूृ] ', ' ', 'Stray floating matra before space'),
    (r'ेो', 'े', 'Corrupted stacked matras ेो -> े'),
    (r'ेे', 'े', 'Double matra ेे -> े'),
    (r'ीी', 'ी', 'Double matra ीी -> ी'),
    (r'ूू', 'ू', 'Double matra ूू -> ू'),
    (r'ुु', 'ु', 'Double matra ुु -> ु'),
    (r'ाा', 'ा', 'Double matra ाा -> ा'),
    (r'ोंों', 'ों', 'Double matra ोंों -> ों'),
    (r'ॉॉ', 'ॉ', 'Double matra ॉॉ -> ॉ'),

    # 3. Merged words (Missing space)
    (r'([क-ह]ा|[क-ह]ी|[क-ह]े|[क-ह]ै|[क-ह]ो|[क-ह]ू|[क-ह]ु|[क-ह])(है।|है,|है\?|है )', r'\1 \2', 'Space before है'),
    (r'सहीहै', 'सही है', 'Merged: सहीहै -> सही है'),
    (r'गलतहै', 'गलत है', 'Merged: गलतहै -> गलत है'),
    (r'सकताहै', 'सकता है', 'Merged: सकताहै -> सकता है'),
    (r'सकतीहै', 'सकती है', 'Merged: सकतीहै -> सकती है'),
    (r'सकतेहैं', 'सकते हैं', 'Merged: सकतेहैं -> सकते हैं'),
    (r'होताहै', 'होता है', 'Merged: होताहै -> होता है'),
    (r'होतीहै', 'होती है', 'Merged: होतीहै -> होती है'),
    (r'होतेहैं', 'होते हैं', 'Merged: होतेहैं -> होते हैं'),
    (r'कियागया', 'किया गया', 'Merged: कियागया -> किया गया'),
    (r'कहाकि', 'कहा कि', 'Merged: कहाकि -> कहा कि'),
    (r'ज्ञातकीजिए', 'ज्ञात कीजिए', 'Merged: ज्ञातकीजिए -> ज्ञात कीजिए'),
    (r'ज्ञातकरें', 'ज्ञात करें', 'Merged: ज्ञातकरें -> ज्ञात करें'),
    (r'चयनकरें', 'चयन करें', 'Merged: चयनकरें -> चयन करें'),
    (r'पहचानकरें', 'पहचान करें', 'Merged: पहचानकरें -> पहचान करें'),
    (r'दीगई', 'दी गई', 'Merged: दीगई -> दी गई'),
    (r'दिएगए', 'दिए गए', 'Merged: दिएगए -> दिए गए'),
    (r'संख्याहै', 'संख्या है', 'Merged: संख्याहै -> संख्या है'),
    (r'मानहै', 'मान है', 'Merged: मानहै -> मान है'),
    (r'बराबरहै', 'बराबर है', 'Merged: बराबरहै -> बराबर है'),
    (r'अनुपातमूल्य', 'अनुपात मूल्य', 'Merged: अनुपातमूल्य'),
    (r'क्रयमूल्य', 'क्रय मूल्य', 'Merged: क्रयमूल्य -> क्रय मूल्य'),
    (r'विक्रयमूल्य', 'विक्रय मूल्य', 'Merged: विक्रयमूल्य -> विक्रय मूल्य'),

    # 4. English / Math mashed with Hindi
    (r'([0-9]+)(वर्ष|दिन|घंटे|मिनट|सेकंड|किमी|मीटर|सेमी|किग्रा|ग्राम|लीटर|प्रतिशत|डिग्री)', r'\1 \2', 'Space between digit & Hindi unit'),
    (r'([0-9]+)%([क-ह])', r'\1% \2', 'Space after % and Hindi char'),
    (r'(त्रिभुज|कोण|बिंदु|वृत्त|जीवा)([A-Z])', r'\1 \2', 'Space between Hindi geometry word & English letter'),
]

all_found = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    paper_found = []
    
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
            if not val:
                continue
            
            for pat, repl, desc in TYPO_PATTERNS:
                matches = list(re.finditer(pat, val))
                if matches:
                    for m in matches:
                        # Extract context around match
                        start = max(0, m.start() - 25)
                        end = min(len(val), m.end() + 25)
                        context = val[start:end]
                        paper_found.append({
                            "qnum": qnum,
                            "field": fname,
                            "matched": m.group(0),
                            "replacement": repl,
                            "desc": desc,
                            "context": context
                        })
                        
    all_found[pid] = {
        "title": title,
        "count": len(paper_found),
        "items": paper_found
    }

print("Scan for true Hindi typos across all 12 papers completed:")
for pid, d in all_found.items():
    print(f"Paper {pid:2d} ({d['title']}): {d['count']} typos found")

with open("tmp_real_typos_found.json", "w", encoding="utf-8") as f:
    json.dump(all_found, f, ensure_ascii=False, indent=2)
