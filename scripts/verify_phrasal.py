# -*- coding: utf-8 -*-
"""
Verification script for Phrasal Verbs chapter HTML.
Checks that all core clusters, sample entries, table structure,
and PYQs from PDF raw text are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/phrasal_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Definition & Hero
        ("Phrasal verb definition", "phrasal verb"),
        ("Summary Hero Card", "Chapter 09 &bull; SSC English Master Vocabulary"),
        
        # Core Clusters
        ("Break family cluster", "break down"),
        ("Break into", "break into"),
        ("Break out", "break out"),
        ("Call off", "call off"),
        ("Call on", "call on"),
        ("Put off", "put off"),
        ("Put out", "put out"),
        ("Put up with", "put up with"),
        ("Look after", "look after"),
        ("Look into", "look into"),
        
        # High-yield Phrasal Verbs from table
        ("Account for", "account for"),
        ("Ask after", "ask after"),
        ("Back out", "back out"),
        ("Bear with", "bear with"),
        ("Blow out", "blow out"),
        ("Bring about", "bring about"),
        ("Carry out", "carry out"),
        ("Catch up with", "catch up with"),
        ("Come across", "come across"),
        ("Do away with", "do away with"),
        ("Drop in", "drop in"),
        ("Fall out", "fall out"),
        ("Get along", "get along"),
        ("Give up", "give up"),
        ("Go through", "go through"),
        ("Hold on", "hold on"),
        ("Keep up with", "keep up with"),
        ("Make out", "make out"),
        ("Pass away", "pass away"),
        ("Run out of", "run out"),
        ("Stand by", "stand by"),
        ("Take after", "take after"),
        ("Turn down", "turn down"),
        ("Wipe out", "wipe out"),
        ("Wind up", "wind up"),
        
        # PYQs & FAQs
        ("PYQ Section", "ssc previous year questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]

    print("=== PHRASAL VERBS VERIFICATION 1: RULE & ENTRY AUDIT ===")
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

    print("\n=== PHRASAL VERBS VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 09 &bull; SSC English Master Vocabulary"),
        ("Cluster Cards", "SSC के 4 सर्वाधिक पूछे जाने वाले Phrasal Verb Clusters"),
        ("Master Table", "Master Phrasal Verbs Compendium"),
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
    glitches = [" ेज़ल", " े ज़ल", "वब ", "व  ", " ह दी", "कु शल", "तु ारे", "तु ारा", "तु ारी", "पुर ार", "प्र तयो गता", "सम ा", " टप्प णयाँ", "संबं धत", "तक  ", "समथ न", " व ास"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
