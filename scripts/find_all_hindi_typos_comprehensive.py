import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Comprehensive dictionary of Hindi typo fixes
# (pattern, replacement, error_name)

SPECIFIC_FIXES = [
    # 1. OCR Ghost Strings (Testbook artifacts)
    (r'वेंि\s+ेमेंी\s+रोंऔ', '', 'Testbook ghost string: "वेंि ेमेंी रोंऔ" removed'),
    (r'मेंेैऔ\s+ऑ', '', 'Testbook ghost string: "मेंेैऔ ऑ" removed'),
    (r'\bेऔ\b', '', 'Testbook ghost string: "ेऔ" removed'),
    (r'औ\s+ेमेंऔ\s+र्षेमें', '', 'Testbook ghost string: "औ ेमेंऔ र्षेमें" removed'),
    (r'ेहैंऔ\s+र्य\s+नों\s+मेंेहैंेर्य\s+नों\s+में\s+', '', 'Testbook ghost string removed'),
    (r'ई\s+ेऐ\s+औ\s+ेऔि\s+केंि\s+', '', 'Testbook ghost string: "ई ेऐ औ ेऔि केंि" removed'),
    (r'मेंो\s+ओं\s+ेहैंमेंेै\s+ेहैंि\s+', '', 'Testbook ghost string removed'),
    (r'ेैच्छि\s+र्बि\s+', '', 'Testbook ghost string: "ेैच्छि र्बि" removed'),
    (r'मेंेि\s+औ\s+ेमेंी\s+', '', 'Testbook ghost string: "मेंेि औ ेमेंी" removed'),
    (r'ेमेंौ\s+न्व\s+', '', 'Testbook ghost string: "ेमेंौ न्व" removed'),
    (r'श्कि\s+ैऔ\s+श्कि\s+', '', 'Testbook ghost string: "श्कि ैऔ श्कि" removed'),
    (r'ेकों\s+मेंौ\s+रि\s+ेत्रों\s+हींि\s+', '', 'Testbook ghost string removed'),
    (r'त्तों\s+ेकेंद्रों\s+ीऔ\s+र्शे\s+ओं\s+ँऔ\s+', '', 'Testbook ghost string removed'),
    (r'ब्सि\s+ेक्ट्रि\s+ओंे\s+ेहैं\s+', '', 'Testbook ghost string removed'),
    (r'रि\s+र्तैर्नेो\s+र्वो\s+ेरों\s+', '', 'Testbook ghost string: "रि र्तैर्नेो र्वो ेरों" removed'),
    (r'मेंौ\s+रि\s+ॉर्न\s+औ\s+', '', 'Testbook ghost string: "मेंौ रि ॉर्न औ" removed'),
    (r'दूसरी\s+ेमें\s+गुणवत्ता', 'दूसरी गुणवत्ता', 'Testbook ghost word: "दूसरी ेमें गुणवत्ता" -> "दूसरी गुणवत्ता"'),
    (r'\bेमें\b', '', 'Ghost word: "ेमें" removed'),

    # 2. Hindi Plural Bindis (Common Hindi typos where bindi is missing on plural nouns)
    (r'\bसंख्याओ\b', 'संख्याओं', 'Typo: संख्याओ -> संख्याओं'),
    (r'\bकौशलो\b', 'कौशलों', 'Typo: कौशलो -> कौशलों'),
    (r'\bस्थानो\b', 'स्थानों', 'Typo: स्थानो -> स्थानों'),
    (r'\bशब्दो\b', 'शब्दों', 'Typo: शब्दो -> शब्दों'),
    (r'\bअक्षरो\b', 'अक्षरों', 'Typo: अक्षरो -> अक्षरों'),
    (r'\bविकल्पो\b', 'विकल्पों', 'Typo: विकल्पो -> विकल्पों'),
    (r'\bप्रश्नो\b', 'प्रश्नों', 'Typo: प्रश्नो -> प्रश्नों'),
    (r'\bकथनो\b', 'कथनों', 'Typo: कथनो -> कथनों'),
    (r'\bनिष्कर्षो\b', 'निष्कर्षों', 'Typo: निष्कर्षो -> निष्कर्षों'),
    (r'\bछात्रो\b', 'छात्रों', 'Typo: छात्रो -> छात्रों'),
    (r'\bलोगो\b', 'लोगों', 'Typo: लोगो -> लोगों'),
    (r'\bदिनो\b', 'दिनों', 'Typo: दिनो -> दिनों'),
    (r'\bवर्षो\b', 'वर्षों', 'Typo: वर्षो -> वर्षों'),
    (r'\bघंटो\b', 'घंटों', 'Typo: घंटो -> घंटों'),
    (r'\bअंको\b', 'अंकों', 'Typo: अंको -> अंकों'),
    (r'\bभागो\b', 'भागों', 'Typo: भागो -> भागों'),
    (r'\bवर्गो\b', 'वर्गों', 'Typo: वर्गो -> वर्गों'),
    (r'\bत्रिभुजो\b', 'त्रिभुजों', 'Typo: त्रिभुजो -> त्रिभुजों'),
    (r'\bअनुपातो\b', 'अनुपातों', 'Typo: अनुपातो -> अनुपातों'),
    (r'\bबिंदुओ\b', 'बिंदुओं', 'Typo: बिंदुओ -> बिंदुओं'),
    (r'\bदिशाओ\b', 'दिशाओं', 'Typo: दिशाओ -> दिशाओं'),
    (r'\bपंक्तियो\b', 'पंक्तियों', 'Typo: पंक्तियो -> पंक्तियों'),
    (r'\bलड़कियो\b', 'लड़कियों', 'Typo: लड़कियो -> लड़कियों'),

    # 3. Pronoun / Verb Bindis & Spellings
    (r'\bनही\b', 'नहीं', 'Typo: नही -> नहीं'),
    (r'\bउन्होने\b', 'उन्होंने', 'Typo: उन्होने -> उन्होंने'),
    (r'\bइन्होने\b', 'इन्होंने', 'Typo: इन्होने -> इन्होंने'),
    (r'\bकिन्हे\b', 'किन्हें', 'Typo: किन्हे -> किन्हें'),
    (r'\bजिन्हे\b', 'जिन्हें', 'Typo: जिन्हे -> जिन्हें'),
    (r'\bउन्हे\b', 'उन्हें', 'Typo: उन्हे -> उन्हें'),
    (r'\bइन्हे\b', 'इन्हें', 'Typo: इन्हे -> इन्हें'),
    (r'\bकिये\b', 'किए', 'Standardization: किये -> किए'),
    (r'\bलिये\b', 'लिए', 'Standardization: लिये -> लिए'),
    (r'\bगये\b', 'गए', 'Standardization: गये -> गए'),
    (r'\bहुये\b', 'हुए', 'Standardization: हुये -> हुए'),
    (r'\bदीजिये\b', 'दीजिए', 'Standardization: कीजिये/दीजिये -> दीजिए'),
    (r'\bकीजिये\b', 'कीजिए', 'Standardization: कीजिये -> कीजिए'),
    (r'\bचाहिये\b', 'चाहिए', 'Standardization: चाहिये -> चाहिए'),
    (r'\bश्रंखला\b', 'शृंखला', 'Spelling: श्रंखला -> शृंखला'),
    (r'\bसंबधित\b', 'संबंधित', 'Spelling: संबधित -> संबंधित'),
    (r'\bसंबध\b', 'संबंध', 'Spelling: संबध -> संबंध'),
    (r'\bसंबधों\b', 'संबंधों', 'Spelling: संबधों -> संबंधों'),
    (r'\bउपरोक्त\b', 'उपर्युक्त', 'Standardization: उपरोक्त -> उपर्युक्त'),
    (r'\bदुगना\b', 'दोगुना', 'Standardization: दुगना -> दोगुना'),
    (r'\bतिगुना\b', 'तीन गुना', 'Standardization: तिगुना -> तीन गुना'),
    (r'\bप्रतिशत्\b', 'प्रतिशत', 'Spelling: प्रतिशत् -> प्रतिशत'),

    # 4. Merged Words (Missing Space)
    (r'\bसहीहै\b', 'सही है', 'Missing space: सहीहै -> सही है'),
    (r'\bगलतहै\b', 'गलत है', 'Missing space: गलतहै -> गलत है'),
    (r'\bसकताहै\b', 'सकता है', 'Missing space: सकताहै -> सकता है'),
    (r'\bसकतीहै\b', 'सकती है', 'Missing space: सकतीहै -> सकती है'),
    (r'\bसकतेहैं\b', 'सकते हैं', 'Missing space: सकतेहैं -> सकते हैं'),
    (r'\bहोताहै\b', 'होता है', 'Missing space: होताहै -> होता है'),
    (r'\bहोतीहै\b', 'होती है', 'Missing space: होतीहै -> होती है'),
    (r'\bहोतेहैं\b', 'होते हैं', 'Missing space: होतेहैं -> होते हैं'),
    (r'\bकियागया\b', 'किया गया', 'Missing space: कियागया -> किया गया'),
    (r'\bदिएगए\b', 'दिए गए', 'Missing space: दिएगए -> दिए गए'),
    (r'\bदीगई\b', 'दी गई', 'Missing space: दीगई -> दी गई'),
    (r'\bकहाकि\b', 'कहा कि', 'Missing space: कहाकि -> कहा कि'),
    (r'\bज्ञातकीजिए\b', 'ज्ञात कीजिए', 'Missing space: ज्ञातकीजिए -> ज्ञात कीजिए'),
    (r'\bज्ञातकरें\b', 'ज्ञात करें', 'Missing space: ज्ञातकरें -> ज्ञात करें'),
    (r'\bचयनकरें\b', 'चयन करें', 'Missing space: चयनकरें -> चयन करें'),
    (r'\bपहचानकरें\b', 'पहचान करें', 'Missing space: पहचानकरें -> पहचान करें'),
    (r'\bबराबरहै\b', 'बराबर है', 'Missing space: बराबरहै -> बराबर है'),
    (r'\bमानहै\b', 'मान है', 'Missing space: मानहै -> मान है'),
    (r'\bसंख्याहै\b', 'संख्या है', 'Missing space: संख्याहै -> संख्या है'),
    (r'\bक्रयमूल्य\b', 'क्रय मूल्य', 'Missing space: क्रयमूल्य -> क्रय मूल्य'),
    (r'\bविक्रयमूल्य\b', 'विक्रय मूल्य', 'Missing space: विक्रयमूल्य -> विक्रय मूल्य'),

    # 5. Missing space after purna viram (।) or comma (,) before a Hindi word
    (r'।([क-ह])', r'। \1', 'Missing space: "।" के बाद स्पेस'),
    (r',([क-ह])', r', \1', 'Missing space: "," के बाद स्पेस'),

    # 6. Alphanumeric + Hindi mashed together (e.g., 300किमी -> 300 किमी, 25%लाभ -> 25% लाभ)
    (r'(\d+)(किमी|मीटर|सेमी|किग्रा|ग्राम|लीटर|घंटे|दिन|वर्ष)', r'\1 \2', 'Missing space: अंक और मात्रक के बीच स्पेस'),
    (r'(\d+)%([क-ह])', r'\1% \2', 'Missing space: % के बाद स्पेस'),
]

corrections_per_paper = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    paper_changes = []
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75:
            continue
            
        fields = ["question_text", "option_a", "option_b", "option_c", "option_d", "explanation"]
        
        q_modifications = []
        
        for fname in fields:
            orig_val = q.get(fname, "")
            if not orig_val:
                continue
                
            new_val = orig_val
            for pat, repl, desc in SPECIFIC_FIXES:
                if re.search(pat, new_val):
                    # Record match
                    matches = list(re.finditer(pat, new_val))
                    for m in matches:
                        q_modifications.append({
                            "field": fname,
                            "desc": desc,
                            "original_token": m.group(0),
                            "replacement": repl
                        })
                    new_val = re.sub(pat, repl, new_val)
                    
            if new_val != orig_val:
                q[fname] = new_val
                
        if q_modifications:
            paper_changes.append({
                "qnum": qnum,
                "modifications": q_modifications
            })
            
    corrections_per_paper[pid] = {
        "title": title,
        "questions_changed_count": len(paper_changes),
        "changes": paper_changes
    }

print("Summary of clean corrections across all 12 papers:")
total_qs_changed = 0
for pid, d in corrections_per_paper.items():
    print(f"Paper ID {pid:2d}: {d['title']} -> {d['questions_changed_count']} questions updated")
    total_qs_changed += d['questions_changed_count']

print(f"\nTotal questions with Hindi typo corrections across all papers: {total_qs_changed}")

with open("tmp_corrections_planned.json", "w", encoding="utf-8") as f:
    json.dump(corrections_per_paper, f, ensure_ascii=False, indent=2)

with open("tmp_papers_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(papers_data, f, ensure_ascii=False)
