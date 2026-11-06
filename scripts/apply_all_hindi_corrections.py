import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Comprehensive list of string replacements and regexes
EXACT_REPLACEMENTS = [
    # 1. Testbook OCR Ghost Strings
    ("वेंि ेमेंी रोंऔ", ""),
    ("मेंेैऔ ऑ", ""),
    ("औ ेमेंऔ र्षेमें", ""),
    ("ेहैंऔ र्य नों मेंेहैंेर्य नों में", ""),
    ("ई ेऐ औ ेऔि केंि", ""),
    ("मेंो ओं ेहैंमेंेै ेहैंि", ""),
    ("ेैच्छि र्बि", ""),
    ("मेंेि औ ेमेंी", ""),
    ("ेमेंौ न्व", ""),
    ("श्कि ैऔ श्कि", ""),
    ("ेकों मेंौ रि ेत्रों हींि", ""),
    ("त्तों ेकेंद्रों ीऔ र्शे ओं ँऔ", ""),
    ("ब्सि ेक्ट्रि ओंे ेहैं", ""),
    ("रि र्तैर्नेो र्वो ेरों", ""),
    ("मेंौ रि ॉर्न औ", ""),
    ("दूसरी ेमें गुणवत्ता", "दूसरी गुणवत्ता"),
    (" ेऔ ", " "),
    ("। ेऔ ", "। "),
    (" ेमें ", " "),
    (" मेंे ", " "),
    (" ेहैं ", " "),
    (" हींि ", " "),

    # 2. Corrupted OCR Doubled Matras
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

    # 3. Missing Plural Bindis
    ("संख्याओ", "संख्याओं"),
    ("कौशलो", "कौशलों"),
    ("स्थानो", "स्थानों"),
    ("शब्दो", "शब्दों"),
    ("अक्षरो", "अक्षरों"),
    ("विकल्पो", "विकल्पों"),
    ("प्रश्नो", "प्रश्नों"),
    ("कथनो", "कथनों"),
    ("निष्कर्षो", "निष्कर्षों"),
    ("छात्रो", "छात्रों"),
    ("दिनो", "दिनों"),
    ("वर्षो", "वर्षों"),
    ("घंटो", "घंटों"),
    ("अंको", "अंकों"),
    ("भागो", "भागों"),
    ("वर्गो", "वर्गों"),
    ("त्रिभुजो", "त्रिभुजों"),
    ("बिंदुओ", "बिंदुओं"),
    ("पंक्तियो", "पंक्तियों"),
    ("विद्यार्थियो", "विद्यार्थियों"),
    ("पुस्तको", "पुस्तकों"),
    ("भुजाओ", "भुजाओं"),
    ("कोणो", "कोणों"),

    # 4. Standard Spellings & Grammatical Bindis
    ("श्रृंखला", "शृंखला"),
    ("श्रंखला", "शृंखला"),
    ("संबधित", "संबंधित"),
    ("संबध ", "संबंध "),
    ("संबधों", "संबंधों"),
    ("सम्बन्धित", "संबंधित"),
    ("सम्बन्ध ", "संबंध "),
    ("सम्बन्धों", "संबंधों"),
    ("उपरोक्त", "उपर्युक्त"),
    ("दुगना", "दोगुना"),
    ("तिगुना", "तीन गुना"),
    ("प्रतिशत्", "प्रतिशत"),
    ("किये ", "किए "),
    ("लिये ", "लिए "),
    ("गये ", "गए "),
    ("हुये ", "हुए "),
    ("दीजिये", "दीजिए"),
    ("कीजिये", "कीजिए"),
    ("चाहिये", "चाहिए"),
    ("उन्होने", "उन्होंने"),
    ("इन्होने", "इन्होंने"),
    ("किन्हे", "किन्हें"),
    ("जिन्हे", "जिन्हें"),
    ("उन्हे", "उन्हें"),
    ("इन्हे", "इन्हें"),
    ("नही ", "नहीं "),
    ("नही,", "नहीं,"),
    ("नही।", "नहीं।"),
    ("नही?", "नहीं?"),

    # 5. Merged Words (Missing Space)
    ("सहीहै", "सही है"),
    ("गलतहै", "गलत है"),
    ("सकताहै", "सकता है"),
    ("सकतीहै", "सकती है"),
    ("सकतेहैं", "सकते हैं"),
    ("होताहै", "होता है"),
    ("होतीहै", "होती है"),
    ("होतेहैं", "होते हैं"),
    ("कियागया", "किया गया"),
    ("दिएगए", "दिए गए"),
    ("दीगई", "दी गई"),
    ("कहाकि", "कहा कि"),
    ("ज्ञातकीजिए", "ज्ञात कीजिए"),
    ("ज्ञातकरें", "ज्ञात करें"),
    ("चयनकरें", "चयन करें"),
    ("पहचानकरें", "पहचान करें"),
    ("बराबरहै", "बराबर है"),
    ("मानहै", "मान है"),
    ("संख्याहै", "संख्या है"),
    ("क्रयमूल्य", "क्रय मूल्य"),
    ("विक्रयमूल्य", "विक्रय मूल्य"),
]

REGEX_REPLACEMENTS = [
    (r'(\d+)(किमी/घंटा|किमी|मीटर|सेमी|किग्रा|ग्राम|लीटर|घंटे|दिन|वर्ष)', r'\1 \2', 'अंक और मात्रक के बीच स्पेस'),
    (r'(\d+)%([क-ह])', r'\1% \2', 'प्रतिशत (%) के बाद स्पेस'),
    (r'।([क-ह])', r'। \1', 'पूर्ण विराम (।) के बाद स्पेस'),
]

def apply_clean(text):
    if not text:
        return text, []
    logs = []
    curr = text
    
    # 1. Exact phrase replacements
    for src, tgt in EXACT_REPLACEMENTS:
        if src in curr:
            logs.append(f"'{src}' -> '{tgt}'")
            curr = curr.replace(src, tgt)
            
    # 2. Regex replacements
    for pat, repl, desc in REGEX_REPLACEMENTS:
        if re.search(pat, curr):
            matches = [m.group(0) for m in re.finditer(pat, curr)]
            logs.append(f"{desc}: {matches}")
            curr = re.sub(pat, repl, curr)
            
    # Clean multiple consecutive spaces
    curr = re.sub(r' +', ' ', curr).strip()
    return curr, logs

# Analyze and perform changes
all_results = {}

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    qs = p_item["questions"]
    
    paper_updates = []
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75: continue
        
        q_changed = False
        q_logs = []
        
        for fn in ["question_text", "option_a", "option_b", "option_c", "option_d", "explanation"]:
            val = q.get(fn, "")
            if not val: continue
            
            cleaned, logs = apply_clean(val)
            if cleaned != val:
                q[fn] = cleaned
                q_changed = True
                for l in logs:
                    q_logs.append(f"[{fn}] {l}")
                    
        if q_changed:
            paper_updates.append({
                "qnum": qnum,
                "logs": q_logs
            })
            
    all_results[pid] = {
        "title": title,
        "count": len(paper_updates),
        "updates": paper_updates
    }

print("================================================================================")
print("CORRECTION SUMMARY PER PAPER:")
print("================================================================================")
total_q = 0
for pid, d in all_results.items():
    print(f"Paper {int(pid):2d} ({d['title']}): {d['count']} questions corrected")
    total_q += d['count']
    for u in d["updates"]:
        print(f"   • Q{u['qnum']:2d}: {', '.join(u['logs'][:3])}")
    print("--------------------------------------------------------------------------------")

print(f"\nTotal questions with Hindi typo fixes: {total_q} across all 12 papers")

with open("tmp_all_corrections_log.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

with open("tmp_cleaned_database_payload.json", "w", encoding="utf-8") as f:
    json.dump(papers_data, f, ensure_ascii=False)
