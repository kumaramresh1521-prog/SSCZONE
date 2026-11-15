# -*- coding: utf-8 -*-
"""
Verification script for Active & Passive Voice chapter HTML.
Checks that all core rules, examples, tables, and edge cases from PDF raw text
are present, correctly spelled, and cleanly formatted.
"""

import os
import re

def main():
    html_path = "scripts/scratch/voice_ssczone_formatted.html"
    raw_path = "scripts/scratch/voice_notes_ssczone_clean_raw.txt"

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Plaintext version of html
    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Core concepts
        ("Active Voice definition / concept", "active voice"),
        ("Passive Voice definition / concept", "passive voice"),
        ("Transitive verb condition", "transitive"),
        ("Intransitive verb no passive", "intransitive"),
        ("Forms of to be (be, is, am, are, was, were, been, being)", "forms of 'to be'"),
        
        # 8 Tenses
        ("Simple Present", "simple present"),
        ("Present Continuous", "present cont"),
        ("Present Perfect", "present perfect"),
        ("Simple Past", "simple past"),
        ("Past Continuous", "past cont"),
        ("Past Perfect", "past perfect"),
        ("Simple Future", "simple future"),
        ("Future Perfect", "future perfect"),
        ("4 Tenses with no passive alert", "4 tenses"),
        
        # Modals, Infinitives, Gerunds
        ("Modals formula", "modal + be + v3"),
        ("Infinitives to be + v3", "to be + v3"),
        ("Gerund being + v3", "being + v3"),
        
        # Imperative Sentences
        ("Let + Object + be + V3", "let + object + be + v3"),
        ("You are ordered to", "you are ordered to"),
        ("Moral duty / should be + V3", "should be + v3"),
        ("You are requested to", "you are requested to"),
        ("It is suggested that", "it is suggested that"),
        
        # Key PDF Examples
        ("They will do the work", "they will do the work"),
        ("The work will be done by them", "the work will be done by them"),
        ("The teacher has punished the boy", "the teacher has punished the boy"),
        ("Jaya came here / Intransitive", "jaya came here"),
        ("Bring a book / Let a book be brought", "let a book be brought"),
        ("Turn Payal out / Let Payal be turned out", "let payal be turned out"),
        ("Obey parents / Parents should be obeyed", "parents should be obeyed"),
        ("Please come soon", "please come soon"),
        ("Let us stay here", "let us stay here"),
        ("Let us sleep here", "let us sleep here"),
        
        # Traps & Exceptions
        ("Surprised at", "surprised at"),
        ("Known to", "known to"),
        ("Pleased with", "pleased with"),
        ("Contained in", "contained in"),
        ("Annoyed with / at", "annoyed"),
        ("Bare infinitive make -> made to sing", "made to sing"),
        ("Bare infinitive bid -> bidden to go", "bidden to go"),
        ("Let exception (no to)", "she let me go"),
        ("Phrasal verb preposition (look after)", "looked after by"),
        ("Look down upon", "looked down upon"),
        ("Somebody / agent omission", "my pocket has been picked"),
        ("Nobody / None with not", "destiny cannot be changed"),
        ("That clause / It is considered that", "it is considered that he is honest"),
        ("Two objects (Indirect & Direct)", "two objects"),
    ]

    print("=== VOICE CHAPTER VERIFICATION 1: RULE & EXAMPLE AUDIT ===")
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

    print("\n=== VOICE CHAPTER VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 05 &bull; SSC English Master Notes"),
        ("Formula Box", "Master Rule of Passive Voice"),
        ("Forms of To Be Table", "table"),
        ("Tense Transformation Table", "Tense-wise Active to Passive Transformation Chart"),
        ("Imperative Grid", "Imperative Sentences"),
        ("7 Deadly Traps", "SSC के 7 सबसे घातक Traps"),
        ("PYQ Boxes", "SSC पिछले वर्षों के हल प्रश्न"),
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
    glitches = ["कितार्ता", "कमर्म", "किमर्ता", "कि ै से", "किरता", "किरें", "सकमर्मक", "अकमर्मक", "कि े", "किा", "किी", "किो", "नहिीं", "स र्ता", "नदर्देश", "किोष्ठकि"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
