import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Comprehensive list of pattern fixes
RULES = [
    # 1. Testbook OCR Ghost Strings
    (r'वेंि\s+ेमेंी\s+रोंऔ\s*', '', 'OCR Ghost: "वेंि ेमेंी रोंऔ" हटाया गया'),
    (r'मेंेैऔ\s+ऑ\s*', '', 'OCR Ghost: "मेंेैऔ ऑ" हटाया गया'),
    (r'\bेऔ\b\s*', '', 'OCR Ghost: "ेऔ" हटाया गया'),
    (r'औ\s+ेमेंऔ\s+र्षेमें\s*', '', 'OCR Ghost: "औ ेमेंऔ र्षेमें" हटाया गया'),
    (r'ेहैंऔ\s+र्य\s+नों\s+मेंेहैंेर्य\s+नों\s+में\s*', '', 'OCR Ghost: "ेहैंऔ र्य नों मेंेहैंेर्य नों में" हटाया गया'),
    (r'ई\s+ेऐ\s+औ\s+ेऔि\s+केंि\s*', '', 'OCR Ghost: "ई ेऐ औ ेऔि केंि" हटाया गया'),
    (r'मेंो\s+ओं\s+ेहैंमेंेै\s+ेहैंि\s*', '', 'OCR Ghost: "मेंो ओं ेहैंमेंेै ेहैंि" हटाया गया'),
    (r'ेैच्छि\s+र्बि\s*', '', 'OCR Ghost: "ेैच्छि र्बि" हटाया गया'),
    (r'मेंेि\s+औ\s+ेमेंी\s*', '', 'OCR Ghost: "मेंेि औ ेमेंी" हटाया गया'),
    (r'ेमेंौ\s+न्व\s*', '', 'OCR Ghost: "ेमेंौ न्व" हटाया गया'),
    (r'श्कि\s+ैऔ\s+श्कि\s*', '', 'OCR Ghost: "श्कि ैऔ श्कि" हटाया गया'),
    (r'ेकों\s+मेंौ\s+रि\s+ेत्रों\s+हींि\s*', '', 'OCR Ghost: "ेकों मेंौ रि ेत्रों हींि" हटाया गया'),
    (r'त्तों\s+ेकेंद्रों\s+ीऔ\s+र्शे\s+ओं\s+ँऔ\s*', '', 'OCR Ghost: "त्तों ेकेंद्रों ीऔ र्शे ओं ँऔ" हटाया गया'),
    (r'ब्सि\s+ेक्ट्रि\s+ओंे\s+ेहैं\s*', '', 'OCR Ghost: "ब्सि ेक्ट्रि ओंे ेहैं" हटाया गया'),
    (r'रि\s+र्तैर्नेो\s+र्वो\s+ेरों\s*', '', 'OCR Ghost: "रि र्तैर्नेो र्वो ेरों" हटाया गया'),
    (r'मेंौ\s+रि\s+ॉर्न\s+औ\s*', '', 'OCR Ghost: "मेंौ रि ॉर्न औ" हटाया गया'),
    (r'दूसरी\s+ेमें\s+गुणवत्ता', 'दूसरी गुणवत्ता', 'OCR Ghost: "दूसरी ेमें गुणवत्ता" -> "दूसरी गुणवत्ता"'),
    (r'\bेमें\b\s*', '', 'OCR Ghost: "ेमें" हटाया गया'),
    (r'\bमेंे\b\s*', '', 'OCR Ghost: "मेंे" हटाया गया'),
    (r'\bेहैं\b\s*', '', 'OCR Ghost: "ेहैं" हटाया गया'),
    (r'\bहींि\b\s*', '', 'OCR Ghost: "हींि" हटाया गया'),

    # 2. Hindi Repeated Matras & Corrupted Vowel Signs
    (r'उन्होंोनेने', 'उन्होंने', 'Typo: उन्होंोनेने -> उन्होंने'),
    (r'कंट्रीी', 'कंट्री', 'Typo: कंट्रीी -> कंट्री'),
    (r'ट्रॉॉफी', 'ट्रॉफी', 'Typo: ट्रॉॉफी -> ट्रॉफी'),
    (r'इक्वेेडोर', 'इक्वेडोर', 'Typo: इक्वेेडोर -> इक्वेडोर'),
    (r'अनुच्छेेद', 'अनुच्छेद', 'Typo: अनुच्छेेद -> अनुच्छेद'),
    (r'इलेक्ट्रॉॉन', 'इलेक्ट्रॉन', 'Typo: इलेक्ट्रॉॉन -> इलेक्ट्रॉन'),
    (r'ब्रह्मांांडीय', 'ब्रह्मांडीय', 'Typo: ब्रह्मांांडीय -> ब्रह्मांडीय'),
    (r'मिलिट्रीी', 'मिलिट्री', 'Typo: मिलिट्रीी -> मिलिट्री'),
    (r'रैंकिंंग', 'रैंकिंग', 'Typo: रैंकिंंग -> रैंकिंग'),
    (r'कंप्यूटरोंों', 'कंप्यूटरों', 'Typo: कंप्यूटरोंों -> कंप्यूटरों'),
    (r'यूनियनोंों', 'यूनियनों', 'Typo: यूनियनोंों -> यूनियनों'),
    (r'अधिकारियोंों', 'अधिकारियों', 'Typo: अधिकारियोंों -> अधिकारियों'),
    (r'कपड़ोंों', 'कपड़ों', 'Typo: कपड़ोंों -> कपड़ों'),
    (r'भेड़ोंों', 'भेड़ों', 'Typo: भेड़ोंों -> भेड़ों'),
    (r'हल्केे', 'हल्के', 'Typo: हल्केे -> हल्के'),
    (r'ड्रेेस', 'ड्रेस', 'Typo: ड्रेेस -> ड्रेस'),
    (r'सिद्धांांत', 'सिद्धांत', 'Typo: सिद्धांांत -> सिद्धांत'),
    (r'बास्केेटबॉल', 'बास्केटबॉल', 'Typo: बास्केेटबॉल -> बास्केटबॉल'),
    (r'मशीीनों', 'मशीनों', 'Typo: मशीीनों -> मशीनों'),
    (r'कंपनियोंों', 'कंपनियों', 'Typo: कंपनियोंों -> कंपनियों'),

    # 3. Missing Plural Bindis & Spellings
    (r'\bसंख्याओ\b', 'संख्याओं', 'Bindi Missing: संख्याओ -> संख्याओं'),
    (r'\bकौशलो\b', 'कौशलों', 'Bindi Missing: कौशलो -> कौशलों'),
    (r'\bस्थानो\b', 'स्थानों', 'Bindi Missing: स्थानो -> स्थानों'),
    (r'\bशब्दो\b', 'शब्दों', 'Bindi Missing: शब्दो -> शब्दों'),
    (r'\bअक्षरो\b', 'अक्षरों', 'Bindi Missing: अक्षरो -> अक्षरों'),
    (r'\bविकल्पो\b', 'विकल्पों', 'Bindi Missing: विकल्पो -> विकल्पों'),
    (r'\bप्रश्नो\b', 'प्रश्नों', 'Bindi Missing: प्रश्नो -> प्रश्नों'),
    (r'\bकथनो\b', 'कथनों', 'Bindi Missing: कथनो -> कथनों'),
    (r'\bनिष्कर्षो\b', 'निष्कर्षों', 'Bindi Missing: निष्कर्षो -> निष्कर्षों'),
    (r'\bछात्रो\b', 'छात्रों', 'Bindi Missing: छात्रो -> छात्रों'),
    (r'\bलोगो\b', 'लोगों', 'Bindi Missing: लोगो -> लोगों'),
    (r'\bदिनो\b', 'दिनों', 'Bindi Missing: दिनो -> दिनों'),
    (r'\bवर्षो\b', 'वर्षों', 'Bindi Missing: वर्षो -> वर्षों'),
    (r'\bघंटो\b', 'घंटों', 'Bindi Missing: घंटो -> घंटों'),
    (r'\bअंको\b', 'अंकों', 'Bindi Missing: अंको -> अंकों'),
    (r'\bभागो\b', 'भागों', 'Bindi Missing: भागो -> भागों'),
    (r'\bवर्गो\b', 'वर्गों', 'Bindi Missing: वर्गो -> वर्गों'),
    (r'\bत्रिभुजो\b', 'त्रिभुजों', 'Bindi Missing: त्रिभुजो -> त्रिभुजों'),
    (r'\bबिंदुओ\b', 'बिंदुओं', 'Bindi Missing: बिंदुओ -> बिंदुओं'),
    (r'\bपंक्तियो\b', 'पंक्तियों', 'Bindi Missing: पंक्तियो -> पंक्तियों'),
    (r'\bविद्यार्थियो\b', 'विद्यार्थियों', 'Bindi Missing: विद्यार्थियो -> विद्यार्थियों'),
    (r'\bपुस्तको\b', 'पुस्तकों', 'Bindi Missing: पुस्तको -> पुस्तकों'),

    # 4. Standard SSC Hindi Spellings
    (r'\bश्रृंखला\b', 'शृंखला', 'Spelling: श्रृंखला -> शृंखला'),
    (r'\bश्रंखला\b', 'शृंखला', 'Spelling: श्रंखला -> शृंखला'),
    (r'\bसंबधित\b', 'संबंधित', 'Spelling: संबधित -> संबंधित'),
    (r'\bसंबध\b', 'संबंध', 'Spelling: संबध -> संबंध'),
    (r'\bसंबधों\b', 'संबंधों', 'Spelling: संबधों -> संबंधों'),
    (r'\bसम्बन्धित\b', 'संबंधित', 'Spelling: सम्बन्धित -> संबंधित'),
    (r'\bसम्बन्ध\b', 'संबंध', 'Spelling: सम्बन्ध -> संबंध'),
    (r'\bसम्बन्धों\b', 'संबंधों', 'Spelling: सम्बन्धों -> संबंधों'),
    (r'\bउपरोक्त\b', 'उपर्युक्त', 'Standardization: उपरोक्त -> उपर्युक्त'),
    (r'\bदुगना\b', 'दोगुना', 'Standardization: दुगना -> दोगुना'),
    (r'\bतिगुना\b', 'तीन गुना', 'Standardization: तिगुना -> तीन गुना'),
    (r'\bप्रतिशत्\b', 'प्रतिशत', 'Spelling: प्रतिशत् -> प्रतिशत'),
    (r'\bकिये\b', 'किए', 'Grammar: किये -> किए'),
    (r'\bलिये\b', 'लिए', 'Grammar: लिये -> लिए'),
    (r'\bगये\b', 'गए', 'Grammar: गये -> गए'),
    (r'\bहुये\b', 'हुए', 'Grammar: हुये -> हुए'),
    (r'\bदीजिये\b', 'दीजिए', 'Grammar: कीजिये/दीजिये -> दीजिए'),
    (r'\bकीजिये\b', 'कीजिए', 'Grammar: कीजिये -> कीजिए'),
    (r'\bचाहिये\b', 'चाहिए', 'Grammar: चाहिये -> चाहिए'),
    (r'\bउन्होने\b', 'उन्होंने', 'Bindi Missing: उन्होने -> उन्होंने'),
    (r'\bइन्होने\b', 'इन्होंने', 'Bindi Missing: इन्होने -> इन्होंने'),
    (r'\bकिन्हे\b', 'किन्हें', 'Bindi Missing: किन्हे -> किन्हें'),
    (r'\bजिन्हे\b', 'जिन्हें', 'Bindi Missing: जिन्हे -> जिन्हें'),
    (r'\bउन्हे\b', 'उन्हें', 'Bindi Missing: उन्हे -> उन्हें'),
    (r'\bइन्हे\b', 'इन्हें', 'Bindi Missing: इन्हे -> इन्हें'),
    (r'\bनही\b', 'नहीं', 'Bindi Missing: नही -> नहीं'),

    # 5. Merged Words (Missing Space)
    (r'\bसहीहै\b', 'सही है', 'Space: सहीहै -> सही है'),
    (r'\bगलतहै\b', 'गलत है', 'Space: गलतहै -> गलत है'),
    (r'\bसकताहै\b', 'सकता है', 'Space: सकताहै -> सकता है'),
    (r'\bसकतीहै\b', 'सकती है', 'Space: सकतीहै -> सकती है'),
    (r'\bसकतेहैं\b', 'सकते हैं', 'Space: सकतेहैं -> सकते हैं'),
    (r'\bहोताहै\b', 'होता है', 'Space: होताहै -> होता है'),
    (r'\bहोतीहै\b', 'होती है', 'Space: होतीहै -> होती है'),
    (r'\bहोतेहैं\b', 'होते हैं', 'Space: होतेहैं -> होते हैं'),
    (r'\bकियागया\b', 'किया गया', 'Space: कियागया -> किया गया'),
    (r'\bदिएगए\b', 'दिए गए', 'Space: दिएगए -> दिए गए'),
    (r'\bदीगई\b', 'दी गई', 'Space: दीगई -> दी गई'),
    (r'\bकहाकि\b', 'कहा कि', 'Space: कहाकि -> कहा कि'),
    (r'\bज्ञातकीजिए\b', 'ज्ञात कीजिए', 'Space: ज्ञातकीजिए -> ज्ञात कीजिए'),
    (r'\bज्ञातकरें\b', 'ज्ञात करें', 'Space: ज्ञातकरें -> ज्ञात करें'),
    (r'\bचयनकरें\b', 'चयन करें', 'Space: चयनकरें -> चयन करें'),
    (r'\bपहचानकरें\b', 'पहचान करें', 'Space: पहचानकरें -> पहचान करें'),
    (r'\bबराबरहै\b', 'बराबर है', 'Space: बराबरहै -> बराबर है'),
    (r'\bमानहै\b', 'मान है', 'Space: मानहै -> मान है'),
    (r'\bसंख्याहै\b', 'संख्या है', 'Space: संख्याहै -> संख्या है'),
    (r'\bक्रयमूल्य\b', 'क्रय मूल्य', 'Space: क्रयमूल्य -> क्रय मूल्य'),
    (r'\bविक्रयमूल्य\b', 'विक्रय मूल्य', 'Space: विक्रयमूल्य -> विक्रय मूल्य'),

    # 6. Alphanumeric / Units / Symbols spacing
    (r'(\d+)(किमी/घंटा|किमी|मीटर|सेमी|किग्रा|ग्राम|लीटर|घंटे|दिन|वर्ष)', r'\1 \2', 'Space: अंक और इकाई के बीच स्पेस'),
    (r'(\d+)%([क-ह])', r'\1% \2', 'Space: प्रतिशत चिन्ह के बाद स्पेस'),
]

def clean_text(text):
    if not text:
        return text, []
    changes = []
    new_text = text
    for pat, repl, desc in RULES:
        if re.search(pat, new_text):
            matches = [m.group(0) for m in re.finditer(pat, new_text)]
            changes.append({"desc": desc, "matches": matches})
            new_text = re.sub(pat, repl, new_text)
    # clean extra double spaces
    new_text = re.sub(r' {2,}', ' ', new_text)
    return new_text.strip(), changes

all_paper_reports = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    paper_qs_changed = []
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75: continue # English section
        
        q_changed = False
        q_change_log = []
        
        for field in ["question_text", "option_a", "option_b", "option_c", "option_d", "explanation"]:
            orig = q.get(field, "")
            if not orig: continue
            cleaned, chg = clean_text(orig)
            if cleaned != orig:
                q[field] = cleaned
                q_changed = True
                for c in chg:
                    q_change_log.append({
                        "field": field,
                        "desc": c["desc"],
                        "matches": c["matches"]
                    })
                    
        if q_changed:
            paper_qs_changed.append({
                "qnum": qnum,
                "changes": q_change_log
            })
            
    all_paper_reports[pid] = {
        "title": title,
        "count": len(paper_qs_changed),
        "questions": paper_qs_changed
    }

print("Clean scan completed. Results per paper:")
total_changed = 0
for pid, d in all_paper_reports.items():
    print(f"Paper {pid:2d} ({d['title']}): {d['count']} questions updated")
    total_changed += d['count']

print(f"\nTotal questions updated across all 12 papers: {total_changed}")

with open("tmp_final_corrections.json", "w", encoding="utf-8") as f:
    json.dump(all_paper_reports, f, ensure_ascii=False, indent=2)

with open("tmp_final_cleaned_questions.json", "w", encoding="utf-8") as f:
    json.dump(papers_data, f, ensure_ascii=False)
