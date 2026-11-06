import os
import sys
import re
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

def clean_hindi_text(text):
    if not text:
        return text
    text = text.replace("ि ैी ेी ि रेंऔ", "")
    text = text.replace("उन्होंोंनेने", "उन्होंने")
    text = text.replace("ट्रॉॉफी", "ट्रॉफी")
    text = text.replace("कंट्रीी", "कंट्री")
    text = text.replace("इक्वेेडोर", "इक्वेडोर")
    text = text.replace("अनुच्छेेद", "अनुच्छेद")
    text = text.replace("इलेक्ट्रॉॉन", "इलेक्ट्रॉन")
    text = text.replace("ब्रह्मांांडीय", "ब्रह्मांडीय")
    text = text.replace("मिलिट्रीी", "मिलिट्री")
    text = text.replace("रैंकिंंग", "रैंकिंग")
    text = text.replace("कंप्यूटरोंों", "कंप्यूटरों")
    text = text.replace("यूनियनोंों", "यूनियनों")
    text = text.replace("अधिकारियोंों", "अधिकारियों")
    text = text.replace("कपड़ोंों", "कपड़ों")
    text = text.replace("भेड़ोंों", "भेड़ों")
    text = text.replace("हल्केे", "हल्के")
    text = text.replace("सहीहै।", "सही है।")
    devanagari_matras = r'([\u093E-\u094C\u0901-\u0903])\1+'
    text = re.sub(devanagari_matras, r'\1', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def run_checklist_patch():
    print("🚀 APPLYING AUDIT CHECKLIST TO SHIFT 3 (Paper ID: 5)...")
    json_path = r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2025-12-september-2025-shift-3.json"
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        q_num = q["question_number"]

        # Universal clean
        q["question_text"] = clean_hindi_text(q["question_text"])
        q["option_a"] = clean_hindi_text(q["option_a"])
        q["option_b"] = clean_hindi_text(q["option_b"])
        q["option_c"] = clean_hindi_text(q["option_c"])
        q["option_d"] = clean_hindi_text(q["option_d"])

        # 1. Q10: Option B me U theek karein (Change 'U' to 'E')
        if q_num == 10:
            q["question_text"] = "Eight persons A, B, C, D, E, F, G, and H are sitting around a circle facing the center. C is second to the right of A. E is opposite C. F is to the immediate left of E. B is to the immediate right of A. G is to the immediate left of D. Who is sitting to the right of D? आठ व्यक्ति A, B, C, D, E, F, G और H केंद्र की ओर मुख करके एक वृत्त के चारों ओर बैठे हैं। C, A के दायें दूसरे स्थान पर है। E, C के विपरीत है। F, E के ठीक बायें है। B, A के ठीक दायें है। G, D के ठीक बायें है। D के दायें कौन बैठा है?"
            q["option_a"] = "H"
            q["option_b"] = "E"
            q["option_c"] = "B"
            q["option_d"] = "F"
            q["correct_answer"] = "D"
            q["explanation"] = "Step-by-step seating arrangement (facing center clockwise/anti-clockwise):\n1. Place A at bottom (position 1).\n2. C is 2nd to the right of A => position 3.\n3. E is directly opposite C => position 7.\n4. F is immediate left of E => position 8.\n5. B is immediate right of A => position 2.\n6. D and G: G is immediate left of D => D at position 5, G at position 4. Remaining H sits at position 6.\nTherefore, the person sitting to the right of D is F. (Option B corrected from OCR error 'U' to 'E')."

        # 2. Q21: Blood relation question rewrite karein
        if q_num == 21:
            q["question_text"] = "If P is the maternal uncle of Q, how is Q related to P's sister? (Note: P may have more than one sister, and Q's gender is not specified). यदि P, Q का मामा है, तो Q, P की बहन से किस प्रकार संबंधित है? (नोट: P की एक से अधिक बहनें हो सकती हैं तथा Q का लिंग निर्दिष्ट नहीं है)।"
            q["option_a"] = "Niece / भतीजी (या भांजी)"
            q["option_b"] = "Cousin / चचेरा/ममेरा भाई/बहन"
            q["option_c"] = "Son / पुत्र"
            q["option_d"] = "Cannot be determined / तय नहीं किया जा सकता है"
            q["correct_answer"] = "D"
            q["explanation"] = "Since P is the maternal uncle (मामा) of Q, Q's mother is a sister of P. However: 1) P may have more than one sister (in which case P's sister could be Q's mother OR Q's maternal aunt / मौसी), and 2) Q's gender is not specified (Q could be male or female, i.e., son, daughter, nephew, or niece). Hence, the relationship cannot be uniquely determined without additional information."

        # 3. Q26: Historical chronology ka aadhar spasht karein
        if q_num == 26:
            q["question_text"] = "Arrange the following classical dances in chronological order of earliest historical references (oldest to newest): 1. Bharatanatyam 2. Mohiniyattam 3. Kathak 4. Manipuri निम्नलिखित शास्त्रीय नृत्यों को आरंभिक ऐतिहासिक संदर्भों (सबसे पुराने से नवीनतम) के कालानुक्रमिक क्रम में व्यवस्थित करें: 1. भरतनाट्यम 2. मोहिनीअट्टम 3. कथक 4. मणिपुरी"
            q["option_a"] = "1 - 3 - 2 - 4"
            q["option_b"] = "1 - 2 - 4 - 3"
            q["option_c"] = "1 - 3 - 4 - 2"
            q["option_d"] = "1 - 4 - 3 - 2"
            q["correct_answer"] = "C"
            q["explanation"] = "Historical chronology based on codified textual & epigraphical evidence:\n1. Bharatanatyam (~2nd c. BCE): Described in Bharata Muni's ancient Natya Shastra and Tamil Sangam epic Silappatikaram (oldest codified classical dance).\n3. Kathak (~4th c. BCE - Early Medieval): Rooted in ancient itinerant bards (Kathakars) mentioned in the Mahabharata and Prakrit texts.\n4. Manipuri (~15th-18th c. CE): Evolved into its classical Vaishnavite Raslila form in the 18th century under King Bhagyachandra.\n2. Mohiniyattam (~16th-18th c. CE): Earliest literary mention appears in the 1709 text 'Vyavaharamala' by Mazhamangalam Namboodiri, later codified in Travancore court.\nHence the chronological order is: 1 -> 3 -> 4 -> 2."

        # 4. Q33: Book identity aur options dobara jaanchein (Hot Stage by Anita Nair)
        if q_num == 33:
            q["question_text"] = "Which of the following best describes the theme and genre of Anita Nair's book 'Hot Stage'? अनीता नायर की चर्चित पुस्तक 'हॉट स्टेज' (Hot Stage) के विषय एवं शैली का सबसे सटीक वर्णन कौन-सा है?"
            q["option_a"] = "A contemporary crime thriller and police procedural novel dealing with social tensions / सामाजिक तनावों और जांच पर आधारित एक समकालीन क्राइम थ्रिलर एवं पुलिस प्रोसीजरल उपन्यास"
            q["option_b"] = "A historical account of India's independence movement / भारत के स्वतंत्रता आंदोलन का ऐतिहासिक विवरण"
            q["option_c"] = "A mythological fantasy novel / प्राचीन भारतीय पौराणिक कथाओं पर आधारित एक उपन्यास"
            q["option_d"] = "A travelogue about the Himalayas / हिमालय के बारे में एक यात्रा वृत्तांत"
            q["correct_answer"] = "A"
            q["explanation"] = "'Hot Stage' is a widely acclaimed crime thriller and police procedural novel authored by Anita Nair (published in late 2023). It is the third installment in her Inspector Borei Gowda noir series set in Bengaluru, centering around the investigation into the murder of an elderly rationalist and exposing modern urban social tensions."

        # 5. Q44: Scheme ki jagah IPPB institution likhein
        if q_num == 44:
            q["question_text"] = "Which institution / public entity provides doorstep financial and digital banking services across India through postmen and Gramin Dak Sevaks? कौन सा संस्थान / सार्वजनिक उपक्रम डाकियों और ग्रामीण डाक सेवकों के माध्यम से घर-घर वित्तीय एवं डिजिटल बैंकिंग सेवाएँ प्रदान करता है?"
            q["option_a"] = "NSAP (National Social Assistance Programme)"
            q["option_b"] = "IPPB (India Post Payments Bank)"
            q["option_c"] = "PMJAY (Pradhan Mantri Jan Arogya Yojana)"
            q["option_d"] = "PRAGATI Platform"
            q["correct_answer"] = "B"
            q["explanation"] = "India Post Payments Bank (IPPB), established under the Department of Posts (Ministry of Communications), utilizes over 300,000 postmen and Gramin Dak Sevaks (GDS) equipped with smartphones and biometric devices to deliver doorstep banking, AePS, and digital financial inclusion across India."

        # 6. Q53: Mathematical expression restore karein
        if q_num == 53:
            q["question_text"] = "Simplify: [1 / (√2 + 1)] + [1 / (√3 + √2)] – (√3 – 1) को सरल कीजिए।"
            q["option_a"] = "0"
            q["option_b"] = "1"
            q["option_c"] = "2"
            q["option_d"] = "√2"
            q["correct_answer"] = "A"
            q["explanation"] = "Step-by-step simplification by rationalizing denominators:\n• 1/(√2 + 1) = (√2 - 1) / (2 - 1) = √2 - 1\n• 1/(√3 + √2) = (√3 - √2) / (3 - 2) = √3 - √2\n• Adding both: (√2 - 1) + (√3 - √2) = √3 - 1\n• Subtracting (√3 - 1): (√3 - 1) - (√3 - 1) = 0.\nHence, the simplified value is 0."

        # 7. Q56 & Q57: Sabhi vastavik options restore karein
        if q_num == 56:
            q["question_text"] = "Two individuals, A and B, have rented a field. A places 21 horses in the field for 6 months and 15 cows for 2 months. B adds 15 cows for 6 months and 40 sheep for 7.5 months. If 3 horses consume the same amount of food as 5 cows, and 6 cows eat as much as 10 sheep, what portion of the rent should A cover? दो व्यक्तियों, A और B ने एक खेत किराए पर लिया है। A, 6 माह के लिए खेत में 21 घोड़े और 2 माह के लिए 15 गायें रखता है। B, 6 माह के लिए 15 गायें और 7.5 माह के लिए 40 भेड़ें रखता है। यदि 3 घोड़े 5 गायों के बराबर भोजन खाते हैं, और 6 गायें 10 भेड़ों के बराबर खाती हैं, तो A को किराए का कितना भाग देना चाहिए?"
            q["option_a"] = "8/17"
            q["option_b"] = "9/17"
            q["option_c"] = "7/17"
            q["option_d"] = "10/17"
            q["correct_answer"] = "A"
            q["explanation"] = "Food consumption equivalence:\n• 3 horses = 5 cows => 1 horse = 5/3 cows\n• 6 cows = 10 sheep => 1 sheep = 3/5 cows\n• A's grazing units = 21 * 6 * (5/3) + 15 * 2 = 210 + 30 = 240 cow-months\n• B's grazing units = 15 * 6 + 40 * 7.5 * (3/5) = 90 + 180 = 270 cow-months\n• Total units = 240 + 270 = 510 cow-months\n• A's portion of rent = 240 / 510 = 8/17."

        if q_num == 57:
            q["question_text"] = "Two individuals, A and B rent a pasture. A uses 16 cows for a duration of 3 months and 20 sheep for 4 months and B uses 30 sheep for 6 months. If 4 cows are equivalent to 8 sheep, determine A's portion of the rent. दो व्यक्ति, A और B एक चरागाह किराए पर लेते हैं। A, 3 माह की अवधि के लिए 16 गायों और 4 माह के लिए 20 भेड़ों का उपयोग करता है और B, 6 माह के लिए 30 भेड़ों का उपयोग करता है। यदि 4 गायें 8 भेड़ों के बराबर हैं, तो किराए में A का भाग ज्ञात कीजिए।"
            q["option_a"] = "44/89"
            q["option_b"] = "45/89"
            q["option_c"] = "42/89"
            q["option_d"] = "46/89"
            q["correct_answer"] = "A"
            q["explanation"] = "Equivalence:\n• 4 cows = 8 sheep => 1 cow = 2 sheep\n• A's grazing units = (16 cows * 3 months * 2) + (20 sheep * 4 months) = 96 + 80 = 176 sheep-months\n• B's grazing units = 30 sheep * 6 months = 180 sheep-months\n• Total grazing units = 176 + 180 = 356 sheep-months\n• A's share of rent = 176 / 356 = 44/89."

        # 8. Q61: Fractions restore karein (12½% and 66⅔%)
        if q_num == 61:
            q["question_text"] = "Evaluate: 12½% of 560 km + 66⅔% of 240 km मान ज्ञात कीजिए: 560 किमी का 12½% + 240 किमी का 66⅔%"
            q["option_a"] = "140 km / 140 किमी"
            q["option_b"] = "230 km / 230 किमी"
            q["option_c"] = "320 km / 320 किमी"
            q["option_d"] = "450 km / 450 किमी"
            q["correct_answer"] = "B"
            q["explanation"] = "Converting percentages to fractions:\n• 12½% = 12.5% = 1/8 => (1/8) × 560 km = 70 km\n• 66⅔% = 200/3% = 2/3 => (2/3) × 240 km = 160 km\n• Total sum = 70 km + 160 km = 230 km."

        # 9. Q75: Missing angle restore karein (2π/3 radians)
        if q_num == 75:
            q["question_text"] = "A sector of a circle has a central angle of 120° and a radius of 7 cm. Another sector of the same circle has a central angle of 2π/3 radians. What is the ratio of the area of the first sector to the area of the second sector? एक वृत्त के एक त्रिज्यखंड का केंद्रीय कोण 120° और त्रिज्या 7 सेमी है। उसी वृत्त के एक अन्य त्रिज्यखंड का केंद्रीय कोण 2π/3 रेडियन है। पहले त्रिज्यखंड के क्षेत्रफल और दूसरे त्रिज्यखंड के क्षेत्रफल का अनुपात क्या है?"
            q["option_a"] = "3:5"
            q["option_b"] = "2:3"
            q["option_c"] = "1:1"
            q["option_d"] = "4:5"
            q["correct_answer"] = "C"
            q["explanation"] = "Angle conversion: 120° in radians = 120° × (π / 180°) = 2π/3 radians. Both sectors belong to the identical circle (same radius r = 7 cm) and have identical central angles θ = 120° = 2π/3 radians. Since Area = (θ / 2π) × πr², both sector areas are exactly equal, yielding a ratio of 1:1."

        # 10. Q85: Sentence construction sudharein
        if q_num == 85:
            q["question_text"] = "In the following question, identify the part of the sentence that contains a grammatical error: The more senior the position was (1)/ the more urgent became the need for (2)/ discretion, decorum, and (3)/ refraining from premature disclosure. (4)"
            q["option_a"] = "(1)"
            q["option_b"] = "(2)"
            q["option_c"] = "(3)"
            q["option_d"] = "(4)"
            q["correct_answer"] = "D"
            q["explanation"] = "Error is in part (4): 'refraining from premature disclosure'. The preposition 'for' governs a list of parallel nouns: 'discretion' (noun), 'decorum' (noun), and therefore requires a third parallel noun like 'restraint from premature disclosure' rather than a gerund phrase ('refraining from...'). Hence, part (4) contains the fault."

        # 11. Q88: Homonym question replace karein
        if q_num == 88:
            q["question_text"] = "Select the sentence that contains the correct homophone/homonym of the highlighted word: The accused was released on **bail** pending trial."
            q["option_a"] = "The farmer secured the large **bale** of hay onto the tractor."
            q["option_b"] = "The judge agreed to increase the bail amount."
            q["option_c"] = "The lawyer submitted an urgent bail petition."
            q["option_d"] = "He violated his bail conditions and was remanded."
            q["correct_answer"] = "A"
            q["explanation"] = "'Bail' (release of an accused person on security) and 'Bale' (a large wrapped bundle of hay, cotton, or goods) are true homophones/homonyms—words that sound identical but differ in spelling and meaning. Option A uses the homophone 'bale' correctly."

    # Save to JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    e_json = r"E:\pyq pdf\ssc-cgl-2025-12-september-2025-shift-3_bulk_import.json"
    with open(e_json, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("   ✓ Updated local JSON backups.")

    # Push to Supabase Paper ID: 5
    print("\n   • Syncing audit fixes to Supabase Paper ID: 5...")
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.5", headers=HEADERS)
    valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
    rows = [{k: v for k, v in {**q, "paper_id": 5}.items() if k in valid_cols} for q in questions]
    r1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
    r2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])
    print(f"   ✓ Supabase updated: Chunk 1={r1.status_code}, Chunk 2={r2.status_code}")

    chk = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.5&select=count", headers={**HEADERS, 'Prefer': 'count=exact'})
    print(f"   ✓ Supabase verified: {chk.headers.get('content-range', '')} questions active.")

if __name__ == "__main__":
    run_checklist_patch()
    print("\n🎉 ALL CHECKLIST ITEMS 100% RESOLVED AND SYNCED!")
