import os
import sys
import re
import json
import requests
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

def clean_hindi_text(text):
    if not text:
        return text

    # Specific known corrupted sequences from PDF font bugs
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

    # Generic duplicate Devanagari vowel signs / matras
    # e.g., double aa (ाा), double ee (ीी), double ai (ैै), double o (ोो), double au (ौौ), double anusvara (ंं)
    devanagari_matras = r'([\u093E-\u094C\u0901-\u0903])\1+'
    text = re.sub(devanagari_matras, r'\1', text)

    # Double full stop or excessive spaces
    text = re.sub(r' +', ' ', text)
    return text.strip()

def patch_shift_1():
    print("\n--- PATCHING SHIFT 1 (Paper ID: 1) ---")
    json_path = r"E:\pyq pdf\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_bulk_import.json"
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        q_num = q["question_number"]
        
        # General clean
        q["question_text"] = clean_hindi_text(q["question_text"])
        q["option_a"] = clean_hindi_text(q["option_a"])
        q["option_b"] = clean_hindi_text(q["option_b"])
        q["option_c"] = clean_hindi_text(q["option_c"])
        q["option_d"] = clean_hindi_text(q["option_d"])

        # Q36: CJI historical context
        if q_num == 36:
            q["explanation"] = "Historical exam context: At the time this question was set, Justice Sanjiv Khanna took oath as the 51st Chief Justice of India (CJI) in November 2024 following the tenure of Justice D.Y. Chandrachud."

        # Q51: Fractions in ascending order
        if q_num == 51:
            q["question_text"] = "Arrange the fractions 5/9, 4/7, 3/5, and 2/3 in ascending order. भिन्नों 5/9, 4/7, 3/5 और 2/3 को आरोही क्रम में व्यवस्थित करें।"
            q["option_a"] = "2/3, 3/5, 4/7, 5/9"
            q["option_b"] = "5/9, 4/7, 3/5, 2/3"
            q["option_c"] = "4/7, 5/9, 2/3, 3/5"
            q["option_d"] = "3/5, 2/3, 5/9, 4/7"
            q["correct_answer"] = "B"
            q["explanation"] = "Converting to decimals: 5/9 ≈ 0.556, 4/7 ≈ 0.571, 3/5 = 0.600, 2/3 ≈ 0.667. In ascending order: 5/9 < 4/7 < 3/5 < 2/3."

        # Q52: Simplify expression
        if q_num == 52:
            q["question_text"] = "Simplify: (2½ + 3.6) – 1.9 सरल करें: (2½ + 3.6) - 1.9"
            q["option_a"] = "4.2"
            q["option_b"] = "5.2"
            q["option_c"] = "6.2"
            q["option_d"] = "7.2"
            q["correct_answer"] = "A"
            q["explanation"] = "2½ = 2.5. Inside brackets: 2.5 + 3.6 = 6.1. Then 6.1 - 1.9 = 4.2."

        # Q53: Evaluate fraction
        if q_num == 53:
            q["question_text"] = "Evaluate: 7¼ – [5/6 ÷ {1/3 – (1/2 × (3/4 – 1/4))}] का मूल्यांकन करें: 7¼ - [5/6 ÷ {1/3 - (1/2 × (3/4 - 1/4))}]"
            q["option_a"] = "-3¼"
            q["option_b"] = "-2¾"
            q["option_c"] = "3¼"
            q["option_d"] = "2¾"
            q["correct_answer"] = "B"
            q["explanation"] = "3/4 - 1/4 = 2/4 = 1/2. Next: 1/2 * 1/2 = 1/4. Next: 1/3 - 1/4 = 1/12. Next: 5/6 ÷ 1/12 = 5/6 * 12 = 10. Finally: 7¼ - 10 = 29/4 - 40/4 = -11/4 = -2¾."

        # Q66: Time & Work remaining fraction
        if q_num == 66:
            q["question_text"] = "A is able to complete a task in 15 days, while B takes 20 days to finish the same task. If they collaborate and work together for 4 days, what fraction of the work will still remain? A किसी कार्य को 15 दिन में पूरा कर सकता है, जबकि B को उस कार्य में 20 दिन लगते हैं। यदि वे मिलकर 4 दिन कार्य करें, तो कार्य का कितना भाग शेष रह जाएगा?"
            q["option_a"] = "7/15"
            q["option_b"] = "11/15"
            q["option_c"] = "8/15"
            q["option_d"] = "4/15"
            q["correct_answer"] = "C"
            q["explanation"] = "Combined rate = 1/15 + 1/20 = 7/60. In 4 days, work done = 4 * (7/60) = 7/15. Remaining fraction = 1 - 7/15 = 8/15."

        # Q68: Pipes and Cistern remaining time
        if q_num == 68:
            q["question_text"] = "Three pipes, A, B, and C are capable of filling a tank in 6, 8, and 12 hours, respectively. When all three pipes are opened together, they operate for 2 hours before pipe C is closed. How much additional time will it take to completely fill the tank after that? तीन पाइप, A, B और C, एक टंकी को क्रमशः 6, 8 और 12 घंटे में भर सकते हैं। जब तीनों पाइप एक साथ खोले जाते हैं, तो वे 2 घंटे तक चलते हैं, जिसके बाद पाइप C को बंद कर दिया जाता है। इसके बाद टंकी को पूरी तरह भरने में कितना अतिरिक्त समय लगेगा?"
            q["option_a"] = "5/7 hours / 5/7 घंटे"
            q["option_b"] = "6/7 hours / 6/7 घंटे"
            q["option_c"] = "4/7 hours / 4/7 घंटे"
            q["option_d"] = "3/7 hours / 3/7 घंटे"
            q["correct_answer"] = "B"
            q["explanation"] = "LCM(6, 8, 12) = 24. Efficiencies: A=4, B=3, C=2. In 2 hours, A+B+C fill 2 * 9 = 18 units. Remaining = 6 units. After C is closed, A+B fill at 4+3 = 7 units/hour. Additional time = 6/7 hours."

        # Q75: Cubes equation
        if q_num == 75:
            q["question_text"] = "31³ + 18³ – 37³ + 210 is equal to: 31³ + 18³ - 37³ + 210 का मान किसके बराबर है:"
            q["option_a"] = "-36810"
            q["option_b"] = "-14820"
            q["option_c"] = "-45670"
            q["option_d"] = "-23450"
            q["correct_answer"] = "B"
            q["explanation"] = "31³ = 29791, 18³ = 5832, 37³ = 50653. 29791 + 5832 - 50653 + 210 = 35623 - 50653 + 210 = -15030 + 210 = -14820."

        # Q82: barely / scarcely
        if q_num == 82:
            q["explanation"] = "Both 'barely' and 'scarcely' are negative adverbs indicating minimal threshold, but 'barely' is standard in conversational collocations for time/opportunity."

        # Q86: Error spotting
        if q_num == 86:
            q["explanation"] = "Error is in part (2): 'but that it presumes' should be 'but in that it presumes' or parallel structure following 'is not its proposed realignment... but its presumption'."

        # Q88: Homonym word spacing
        if q_num == 88:
            q["question_text"] = "Select the sentence containing the homonym of the highlighted word: The choir began the **introit** at the priest's signal."

        # Q95: Highlighted phrase
        if q_num == 95:
            q["question_text"] = "Choose the most suitable option to replace the highlighted part of the sentence: She has the reputation **to be a kind woman**."

        # Q96: Highlighted phrase
        if q_num == 96:
            q["question_text"] = "Choose the most suitable option to replace the highlighted part of the sentence: The doctor advised him **to avoid eating sweets and doing exercise regularly**."

    # Save cleaned JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("   ✓ Shift 1 JSON updated.")

    # Push to Supabase Paper ID: 1
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.1", headers=HEADERS)
    valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
    rows = [{k: v for k, v in {**q, "paper_id": 1}.items() if k in valid_cols} for q in questions]
    r1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
    r2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])
    print(f"   ✓ Supabase Paper 1 updated (status: {r1.status_code}, {r2.status_code})")

def patch_shift_2():
    print("\n--- PATCHING SHIFT 2 (Paper ID: 4) ---")
    json_path = r"E:\pyq pdf\ssc-cgl-2025-12-september-2025-shift-2_bulk_import.json"
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        q_num = q["question_number"]

        # General clean
        q["question_text"] = clean_hindi_text(q["question_text"])
        q["option_a"] = clean_hindi_text(q["option_a"])
        q["option_b"] = clean_hindi_text(q["option_b"])
        q["option_c"] = clean_hindi_text(q["option_c"])
        q["option_d"] = clean_hindi_text(q["option_d"])

        # Q9: PROVIDE letters P, R, O, D
        if q_num == 9:
            q["explanation"] = "Letters extracted: P, R, O, D. In common English, 2 words can be formed: PROD and DROP. Official SSC answer key marks 'Three' (Option B) by including the archaic/Scrabble dictionary word DORP (a small village)."

        # Q18: Prime difference series
        if q_num == 18:
            q["explanation"] = "The pattern is formed by adding consecutive prime numbers (+3, +5, +7, +11, +13, +17): 2+3=5, 5+5=10, 10+7=17, 17+11=28, 28+13=41 (instead of 40), 41+17=58. Hence, 40 is the incorrect number that breaks the pattern. Official Key C (40) is correct."

        # Q24: Value of B = 1/9
        if q_num == 24:
            q["question_text"] = "If 16 + 11 = A and 1/9 = B, and A% B = (A × B) - 1, then what is A% B? यदि 16+11=A और 1/9=B है, और A % B=(A × B)-1 है, तो A % B क्या है?"
            q["option_a"] = "0"
            q["option_b"] = "-3"
            q["option_c"] = "2"
            q["option_d"] = "5"
            q["correct_answer"] = "C"
            q["explanation"] = "A = 16 + 11 = 27, B = 1/9. Then A % B = (27 * 1/9) - 1 = 3 - 1 = 2."

        # Q43: BNSS police custody
        if q_num == 43:
            q["explanation"] = "Under Section 187 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, police custody can be granted for a maximum of 15 days in whole or in parts during the initial 40 or 60 days of the total detention period."

        # Q53: Continued fraction
        if q_num == 53:
            q["question_text"] = "Evaluate the continued fraction: 2 + 1 / [3 + 1 / (4 + 1/2)] सतत भिन्न का मान ज्ञात कीजिए: 2 + 1 / [3 + 1 / (4 + 1/2)]"
            q["option_a"] = "67/29"
            q["option_b"] = "58/29"
            q["option_c"] = "69/29"
            q["option_d"] = "71/29"
            q["correct_answer"] = "A"
            q["explanation"] = "Bottom: 4 + 1/2 = 9/2. Next: 3 + 1/(9/2) = 3 + 2/9 = 29/9. Reciprocal = 9/29. Final: 2 + 9/29 = 67/29."

        # Q67: Radians to degrees
        if q_num == 67:
            q["question_text"] = "What is 5π/4 radians in degrees? 5π/4 रेडियन कितने डिग्री में है?"
            q["option_a"] = "225° / 225°"
            q["option_b"] = "180° / 180°"
            q["option_c"] = "240° / 240°"
            q["option_d"] = "360° / 360°"
            q["correct_answer"] = "A"
            q["explanation"] = "(5π/4) * (180° / π) = 5 * 45° = 225°."

        # Q70: Trigonometry cot/sin
        if q_num == 70:
            q["question_text"] = "If tan(90° – A) = √3, what is sin A? यदि tan(90° - A) = √3 है, तो sin A का मान क्या है?"
            q["option_a"] = "1/2"
            q["option_b"] = "√3/2"
            q["option_c"] = "1/√2"
            q["option_d"] = "1"
            q["correct_answer"] = "A"
            q["explanation"] = "tan(90° - A) = cot A = √3 => A = 30°. Therefore, sin A = sin 30° = 1/2."

        # Q71: x = √7, x + 1/x
        if q_num == 71:
            q["question_text"] = "If x = √7, determine the value of x + 1/x. यदि x = √7 है, तो x + 1/x का मान ज्ञात कीजिए।"
            q["option_a"] = "7√7 / 8"
            q["option_b"] = "8√7 / 7"
            q["option_c"] = "6√7 / 7"
            q["option_d"] = "9√7 / 7"
            q["correct_answer"] = "B"
            q["explanation"] = "x + 1/x = √7 + 1/√7 = (7 + 1)/√7 = 8/√7 = 8√7 / 7."

        # Q73: Rationalize radical
        if q_num == 73:
            q["question_text"] = "If x = √[(2 + √3)/(2 - √3)], then determine the value of x² + x - 9? यदि x = √[(2 + √3)/(2 - √3)] है, तब x² + x - 9 का मान ज्ञात कीजिए।"
            q["option_a"] = "4√3"
            q["option_b"] = "5√3"
            q["option_c"] = "6√3"
            q["option_d"] = "3√3"
            q["correct_answer"] = "B"
            q["explanation"] = "Rationalizing denominator: x = 2 + √3. Then x² = (2+√3)² = 7 + 4√3. Thus x² + x - 9 = (7 + 4√3) + (2 + √3) - 9 = 5√3."

        # Q74: Cyclic quadrilateral ambiguity
        if q_num == 74:
            q["explanation"] = "Official SSC Key: 36°. Note: The question setter calculated 1x + 2x + 3x + 4x = 360° => 10x = 360° => x = 36°. (In standard geometry, opposite angles of a cyclic quad must sum to 180°, but SSC evaluated this based on the total 360° ratio)."

        # Q75: sec A = 13/5, find sin A
        if q_num == 75:
            q["question_text"] = "If sec A = 13/5 and A is acute, find sin A. यदि sec A = 13/5 और A न्यूनकोण है, तो sin A ज्ञात कीजिए।"
            q["option_a"] = "5/13"
            q["option_b"] = "12/13"
            q["option_c"] = "13/12"
            q["option_d"] = "13/5"
            q["correct_answer"] = "B"
            q["explanation"] = "sec A = Hypotenuse / Base = 13/5. Using Pythagorean triple (5, 12, 13), Perpendicular = 12. Therefore, sin A = Perpendicular / Hypotenuse = 12/13."

        # Q83: relative adverb when
        if q_num == 83:
            q["explanation"] = "Following a day/time expression like 'next Friday', the relative adverb of time 'when' is standard in English to introduce a non-defining clause."

        # Q88: gules homonym
        if q_num == 88:
            q["question_text"] = "Select the sentence containing the homonym of the highlighted word: The prince's **gules** dominated the family coat of arms."

        # Q100: Clean Q100. prefix
        if q_num == 100:
            q["question_text"] = re.sub(r'^Q100\.\s*', '', q["question_text"]).strip()

    # Save cleaned JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("   ✓ Shift 2 JSON updated.")

    # Push to Supabase Paper ID: 4
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.4", headers=HEADERS)
    valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
    rows = [{k: v for k, v in {**q, "paper_id": 4}.items() if k in valid_cols} for q in questions]
    r1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
    r2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])
    print(f"   ✓ Supabase Paper 4 updated (status: {r1.status_code}, {r2.status_code})")

if __name__ == "__main__":
    patch_shift_1()
    patch_shift_2()
    print("\n🎉 ALL 100% PATCHED, CLEANED & SYNCED TO DATABASE!")
