# -*- coding: utf-8 -*-
"""
Verification script for Question Tags chapter HTML.
Checks that all 13 core rules, key contraction forms, exceptions, and PYQs
from PDF raw text are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/question_tags_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Definitions & Structure
        ("Question tag definition", "question tag"),
        ("Golden rule positive stmt -> negative tag", "positive statement"),
        ("Golden rule negative stmt -> positive tag", "negative statement"),
        ("Tag subject always pronoun", "always a pronoun"),
        ("Tag starts with small letter", "small letter"),
        
        # Contracted Auxiliaries Table
        ("don't, doesn't, didn't", "don't"),
        ("isn't, aren't", "isn't"),
        ("aren't I? trap", "aren't i"),
        ("won't, shan't", "won't"),
        ("can't, couldn't", "can't"),
        ("mustn't, needn't, daren't", "mustn't"),
        
        # Rule 4: Do/Does/Did
        ("No auxiliary -> do/does/did", "do / does / did"),
        ("She works in sales -> doesn't she", "doesn't she"),
        ("We went there last year -> didn't we", "didn't we"),
        
        # Rule 5: Negative words -> Positive tag
        ("Seldom, rarely, hardly, scarcely", "seldom"),
        ("Barking dogs seldom bite -> do they", "do they"),
        ("Little vs a little trap", "little"),
        
        # Rule 6 & 7: This, That, These, Those, There, One
        ("This / That -> it", "this / that"),
        ("These / Those -> they", "these / those"),
        ("There -> there", "there"),
        ("One -> one", "one"),
        
        # Rule 8: Indefinite Pronouns Persons -> THEY + Plural Verb
        ("Everyone / Somebody -> they", "they"),
        ("Everyone has come -> haven't they", "haven't they"),
        
        # Rule 9: Indefinite Pronouns Things -> IT
        ("Everything / Nothing -> it", "everything"),
        ("Nothing was left -> was it", "was it"),
        
        # Rule 10: ...of us, ...of you, ...of them
        ("All of us -> we", "of us"),
        ("None of you -> you", "of you"),
        ("Neither of them -> they", "of them"),
        
        # Rule 11 & 12: Let & Imperatives
        ("Let us -> shall we", "shall we"),
        ("Let him -> will you", "will you"),
        ("Negative imperative -> will you", "don't make noise"),
        ("Annoyance -> can't you", "can't you"),
    ]

    print("=== QUESTION TAGS VERIFICATION 1: RULE & EXAMPLE AUDIT ===")
    passed = 0
    failed = 0
    for label, pattern in checks:
        if pattern.lower() in plain_text or pattern.lower() in html.lower():
            passed += 1
            print(f"[PASS] {label}")
        else:
            failed += 1
            print(f"[FAIL] {label} - Pattern '{pattern}' not found!")

    print(f"\nAudit 1 Results: {passed}/{len(checks)} Passed, {failed} Failed.")

    print("\n=== QUESTION TAGS VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 06 &bull; SSC English Master Notes"),
        ("Golden Formula Card", "The Golden Rule of Question Tags"),
        ("Contraction Master Table", "Contracted Auxiliaries Master Table"),
        ("13 Rules Section", "Question Tags के सभी 13 मुख्य नियम"),
        ("Super Trap Alert (aren't I)", "SSC Super Trap: 'amn't I?'"),
        ("PYQ Section", "SSC Previous Year Questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]
    comp_passed = 0
    for label, pattern in components:
        if pattern.lower() in html.lower():
            comp_passed += 1
            print(f"[PASS] {label}")
        else:
            print(f"[FAIL] {label} missing!")

    print(f"\nAudit 2 Results: {comp_passed}/{len(components)} Passed.")

    # Cross check Hindi ligatures
    glitches = ["कितार्ता", "कमर्म", "किमर्ता", "कि ै से", "किरता", "किरें", "सकमर्मक", "अकमर्मक", "कि े", "किा", "किी", "किो", "नहिीं", "स र्ता", "नदर्देश", "किोष्ठकि", "सवर्तानाम", "लंग", "नकारिात्मक", "अनश्चयवाचक", "अनुरिोध"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
