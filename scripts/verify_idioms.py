# -*- coding: utf-8 -*-
"""
Verification script for Idioms & Phrases chapter HTML.
Checks that all thematic clusters, sample idioms, table entries,
and PYQs are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/idioms_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Hero & Core components
        ("Summary Hero Card", "Chapter 11 &bull; SSC English Master Vocabulary"),
        ("Thematic Clusters Section", "SSC के 4 सबसे लोकप्रिय Thematic Clusters"),
        ("Color Idioms", "once in a blue moon"),
        ("Animal Idioms", "dark horse"),
        ("Body Parts Idioms", "at one's wit's end"),
        ("Conflict Idioms", "bury the hatchet"),
        
        # High-yield Idiom entries
        ("At one's fingertips", "at one's fingertips"),
        ("At the spur of the moment", "at the spur of the moment"),
        ("All in all", "all in all"),
        ("At close quarters", "at close quarters"),
        ("Apple-pie order", "apple-pie order"),
        ("Above board", "above board"),
        ("Bone of contention", "bone of contention"),
        ("Cock and bull story", "cock and bull story"),
        ("Crocodile tears", "crocodile tears"),
        ("Smell a rat", "smell a rat"),
        ("Turn a deaf ear", "turn a deaf ear"),
        
        # PYQs & FAQs
        ("PYQ Section", "ssc previous year questions"),
        ("FAQ Section", "अक्सर पूछे जाने वाले सवाल"),
    ]

    print("=== IDIOMS VERIFICATION 1: RULE & IDIOM AUDIT ===")
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

    print("\n=== IDIOMS VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 11 &bull; SSC English Master Vocabulary"),
        ("Thematic Clusters", "Thematic Clusters"),
        ("Master Table", "Master Idioms &amp; Phrases Catalog"),
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
    glitches = ["वा ांश", "श  ", "प रवार", "कसी", "कं ठस्थ", "चा हए", "कु शल", "तु ारे", "तु ारा", "तु ारी", "पुर ार", "प्र तयो गता", "सम ा", " टप्प णयाँ", "संबं धत", "तक  ", "समथ न", " व ास"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
