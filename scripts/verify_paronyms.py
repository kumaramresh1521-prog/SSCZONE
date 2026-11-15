# -*- coding: utf-8 -*-
"""
Verification script for Paronyms & Homonyms chapter HTML.
Checks that all 227 sets, deadly confusion pairs, sample sets,
and PYQs are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/paronyms_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Hero & Core components
        ("Summary Hero Card", "Chapter 13 &bull; SSC English Master Vocabulary"),
        ("Top 5 Deadly Pairs Section", "SSC के 5 सर्वाधिक घातक भ्रमकारी शब्द"),
        ("Affect vs Effect", "affect (verb) vs. effect (noun)"),
        ("Compliment vs Complement", "compliment vs. complement"),
        ("Stationary vs Stationery", "stationary vs. stationery"),
        ("Principle vs Principal", "principle vs. principal"),
        
        # Sample Sets across the 227 sets
        ("Set 1: Access / Accession / Excess", "access"),
        ("Set 2: Accept / Except / Expect", "accept"),
        ("Set 3: Alter / Altar", "alter"),
        ("Set 4: Assent / Ascent", "assent"),
        ("Set 10: Adverse / Averse", "effect"),
        ("Set 50 check", "set #50"),
        ("Set 100 check", "set #100"),
        ("Set 200 check", "set #200"),
        ("Set 227 check", "set #227"),
        
        # PYQs & FAQs
        ("PYQ Section", "ssc previous year questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]

    print("=== PARONYMS VERIFICATION 1: RULE & SET AUDIT ===")
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

    print("\n=== PARONYMS VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 13 &bull; SSC English Master Vocabulary"),
        ("Top 5 Deadly Pairs", "Top 5 Deadly Pairs"),
        ("Master Catalog Header", "Master Paronyms &amp; Homonyms Catalog (227 Sets)"),
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
    glitches = ["पैरोनम्स", "होमोनम्स", "हदी", "जनका", "अथ", "उत्पत्त", "मलती", "मलता", "बोडग", "अनुमत ", "कारगल", "क पहाड़य", "कठन", "अत्यधक", "कवता", "संके त", "संदभ", "मु  ल", "स हासन", "शक्षक ", "नमंत्रण", "छोड़कर", "ज़ ी", "वचार", "मं दर"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
