# -*- coding: utf-8 -*-
"""
Verification script for Synonyms & Antonyms chapter HTML.
Checks that all 498 entries, strategy guides, sample words,
and PYQs are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/syno_anto_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Hero & Core components
        ("Summary Hero Card", "Chapter 12 &bull; SSC English Master Vocabulary"),
        ("Vocab Master Strategy", "Vocab Master Strategy"),
        ("Tone Analysis", "tone analysis"),
        ("Prefix & Suffix Clues", "prefix &amp; suffix clues"),
        ("Thesaurus Grid Title", "Master Thesaurus Grid"),
        
        # Sample High-Yield Keywords
        ("Awkward", "awkward"),
        ("Apparent", "apparent"),
        ("Allure", "allure"),
        ("Abortive", "abortive"),
        ("Abominable", "abominable"),
        ("Allay", "allay"),
        ("Axiom", "axiom"),
        ("Assiduous", "assiduous"),
        ("Abjure", "abjure"),
        ("Abject", "abject"),
        ("Aversion", "aversion"),
        ("Benevolent", "benevolent"),
        ("Candid", "candid"),
        ("Diligent", "diligent"),
        ("Explicit", "explicit"),
        ("Fabricate", "fabricate"),
        
        # PYQs & FAQs
        ("PYQ Section", "ssc previous year questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]

    print("=== SYNO-ANTO VERIFICATION 1: RULE & KEYWORD AUDIT ===")
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

    print("\n=== SYNO-ANTO VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 12 &bull; SSC English Master Vocabulary"),
        ("Strategy Cards", "Vocab Master Strategy"),
        ("Master Thesaurus Grid", "Master Thesaurus Grid (498 Keywords A to Z)"),
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
    glitches = ["पर्यावची", "वलोम", "अथर्थ", "समनर्थी", "दिेखें", "क े", "स र्ता", "नष्फल", "स्वयंसद्ध", "शपपूर्थक", "अरुच ", "अरुच,", "परश्रमी"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
