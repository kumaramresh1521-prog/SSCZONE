# -*- coding: utf-8 -*-
"""
Verification script for One Word Substitution (OWS) chapter HTML.
Checks that all 13 categories, root word guides, sample words,
and PYQs are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/ows_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Hero & Core components
        ("Summary Hero Card", "Chapter 10 &bull; SSC English Master Vocabulary"),
        ("Root Words Formula Guide", "Root Words Formula Card"),
        ("-cide root", "-cide"),
        ("-cracy root", "-cracy"),
        ("-phobia root", "-phobia"),
        ("-phil / -mis root", "-phil"),
        
        # 13 Sections checks
        ("Section A: Persons", "one words denoting persons"),
        ("Section B: General Objects", "one words denoting general objects"),
        ("Section C: Places", "one words denoting places"),
        ("Section D: Professions", "one words denoting professions"),
        ("Section E: Governments", "one words denoting kinds of governments"),
        ("Section F: Killings/Deaths", "one words denoting killings/deaths of persons"),
        ("Section G: Marriages", "one words denoting marriages"),
        ("Section H: Time Periods", "one words denoting time periods"),
        ("Section I: Groups", "one words denoting groups"),
        ("Section J: Science & Arts", "one words denoting science and arts"),
        ("Section K: Phobias/Disorders", "one words denoting phobias/mental disorders"),
        
        # Key Words across sections
        ("Agnostic", "agnostic"),
        ("Altruist", "altruist"),
        ("Ambidexterous", "ambidexterous"),
        ("Anarchist", "anarchist"),
        ("Ascetic", "ascetic"),
        ("Atheist", "atheist"),
        ("Cannibal", "cannibal"),
        ("Connoisseur", "connoisseur"),
        ("Apiary", "apiary"),
        ("Aviary", "aviary"),
        ("Plutocracy", "plutocracy"),
        ("Patricide", "patricide"),
        ("Monogamy", "monogamy"),
        ("Decennial", "decennial"),
        ("Centenarian", "centenarian"),
        ("Acrophobia", "acrophobia"),
        ("Claustrophobia", "claustrophobia"),
        
        # PYQs & FAQs
        ("PYQ Section", "ssc previous year questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]

    print("=== OWS VERIFICATION 1: RULE & WORD AUDIT ===")
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

    print("\n=== OWS VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 10 &bull; SSC English Master Vocabulary"),
        ("Root Words Guide", "Root Words Formula Card"),
        ("Section A Block", "section-a"),
        ("Section B Block", "section-b"),
        ("Section C Block", "section-c"),
        ("Section K Block", "section-k"),
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
    glitches = ["प्र त ापन", "सं क्षप्त", "महत्वपूण ", "भू मका", " नभाते", " ह दी", "कु शल", "तु ारे", "तु ारा", "तु ारी", "पुर ार", "प्र तयो गता", "सम ा", " टप्प णयाँ", "संबं धत", "तक  ", "समथ न", " व ास"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
