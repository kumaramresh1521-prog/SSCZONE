# -*- coding: utf-8 -*-
"""
Verification script for Modals chapter HTML.
Checks that all modal verbs, meanings, rules, edge cases, and PYQs
from PDF raw text are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/modals_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Definitions & Auxiliaries
        ("Modal Auxiliary definition", "modal auxiliary"),
        ("Primary vs Modal Auxiliary", "primary aux"),
        ("Modal + V1 rule", "modal + v1"),
        
        # Master functions & Modals
        ("Can present ability", "can"),
        ("Could past ability / polite", "could"),
        ("May 50% possibility / formal permission", "may"),
        ("Might remote possibility", "might"),
        ("Should advice / suggestion", "should"),
        ("Must compulsion / deduction", "must"),
        ("Ought to moral duty", "ought to"),
        ("Would polite / habit / rather", "would"),
        ("Used to past habit", "used to"),
        ("Need as modal / ordinary", "need"),
        ("Dare as modal / ordinary", "dare"),
        
        # Comparative Nuances
        ("May vs Might", "may vs"),
        ("Was/were able to specific achievement", "were able to escape"),
        ("Should vs Must vs Ought to", "should vs"),
        
        # Perfect Modals
        ("Should have + V3", "should have"),
        ("Could have + V3", "could have"),
        ("Must have + V3", "must have"),
        ("Need not have + V3", "need not have"),
        
        # Semi-modals & Traps
        ("Used to vs Be used to + V1+ing", "used to working"),
        ("Would rather ... than", "would rather"),
        ("Lest + should", "lest"),
        ("Need not without to", "need not"),
        ("Dare not without to", "dare not"),
        
        # PDF Examples
        ("Morning walk example", "morning walk"),
        ("Mercedes rich deduction", "mercedes"),
        ("Die than beg", "die than beg"),
    ]

    print("=== MODALS CHAPTER VERIFICATION 1: RULE & EXAMPLE AUDIT ===")
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

    print("\n=== MODALS CHAPTER VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 07 &bull; SSC English Master Notes"),
        ("Golden Rules Box", "3 Golden Rules of Modal Verbs"),
        ("Master Function Chart", "Modals एवं उनके अर्थ / कार्यों की मास्टर तालिका"),
        ("Deep Dive Analysis", "मुख्य Modals का गहन तुलनात्मक अध्ययन"),
        ("Perfect Modals Table", "Perfect Modals (Modal + Have + V3)"),
        ("Marginal Modals Section", "Marginal Modals / Semi-Modals"),
        ("Top SSC Traps Section", "SSC के 5 सर्वाधिक पूछे जाने वाले Modals Traps"),
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
    glitches = ["कितार्ता", "कमर्म", "किमर्ता", "कि ै से", "किरता", "किरें", "सकमर्मक", "अकमर्मक", "कि े", "किा", "किी", "किो", "नहिीं", "स र्ता", "नदर्देश", "किोष्ठकि", "सवर्तानाम", "लंग", "नकारिात्मक", "अनश्चयवाचक", "अनुरिोध", "क्ज़िरूर", "सामनिे", "क े", "दल्ली", "मले"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
