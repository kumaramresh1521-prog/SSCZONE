# -*- coding: utf-8 -*-
"""
Verification script for Prepositions chapter HTML.
Checks that all fundamental rules, confusion pairs, omissions, fixed prepositions,
and PYQs from PDF raw text are present, correctly spelled, and cleanly formatted.
"""

import re

def main():
    html_path = "scripts/scratch/preposition_ssczone_formatted.html"
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    plain_text = re.sub(r'<[^>]+>', ' ', html).lower()
    plain_text = ' '.join(plain_text.split())

    checks = [
        # Definition & Cases
        ("Preposition definition", "preposition"),
        ("Accusative / Objective case", "accusative"),
        ("Preposition + Gerund V1+ing", "gerund"),
        ("End position with infinitive", "live in"),
        
        # Confusion pairs
        ("Between vs Among", "between vs"),
        ("Between reciprocal relationship trap", "reciprocal"),
        ("In vs Into", "in vs"),
        ("Beside vs Besides", "beside vs"),
        ("By vs With", "by vs"),
        ("In time vs On time", "in time vs"),
        ("Since vs For vs From", "since vs"),
        
        # Omission of prepositions
        ("Discuss / Describe no preposition", "discuss the problem"),
        ("Enter no into", "entered the hall"),
        ("Order no for", "ordered two cups"),
        ("Comprise no of", "comprises 10 units"),
        ("Resemble no with/to", "resembles her mother"),
        ("Time expression omission (last, yesterday)", "last sunday"),
        
        # High-yield Fixed Prepositions
        ("Abide by", "abide by"),
        ("Accused of", "accused of"),
        ("Accustomed to", "accustomed to"),
        ("Addicted to", "addicted to"),
        ("Agree with / Agree to", "agree with"),
        ("Blind in / Blind to", "blind in"),
        ("Comply with", "comply with"),
        ("Congratulate on", "congratulated him on"),
        ("Cope with (no up)", "cope with"),
        ("Deal in / Deal with", "deals in"),
        ("Die of vs Die from", "died of"),
        ("Differ with vs Differ from", "differ with"),
        ("Dispose of (one f)", "dispose of"),
        ("Eligible for", "eligible for"),
        ("Fond of", "fond of"),
        ("Good at (not good in)", "good at"),
        ("Insist on", "insisted on"),
        ("Part from vs Part with", "parted from"),
        ("Prevent / Prohibit from", "prevented from"),
        ("Senior / Junior to", "senior to"),
        ("Tired of", "tired of"),
        ("Wait for vs Await", "waiting for"),
    ]

    print("=== PREPOSITION CHAPTER VERIFICATION 1: RULE & EXAMPLE AUDIT ===")
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

    print("\n=== PREPOSITION CHAPTER VERIFICATION 2: STRUCTURAL COMPONENT AUDIT ===")
    components = [
        ("Summary Hero Card", "Chapter 08 &bull; SSC English Master Notes"),
        ("Core Rules Grid", "Preposition की परिभाषा एवं आधारभूत व्याकरणिक नियम"),
        ("Confusion Pairs Section", "Preposition के 8 सबसे बड़े भ्रमकारी युग्म"),
        ("Omission Traps Section", "Omission of Prepositions &bull; जहाँ Preposition लगाना अपराध है!"),
        ("Fixed Prepositions Compendium", "SSC Master Fixed Prepositions Compendium"),
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
    glitches = ["पूर्वसर्व", "कमर्म", "किमर्ता", "कि ै से", "किरता", "किरें", "सकमर्मक", "अकमर्मक", "कि े", "किा", "किी", "किो", "नहिीं", "स र्ता", "नदर्देश", "किोष्ठकि", "सवर्तानाम"]
    glitch_found = 0
    for g in glitches:
        if g in html:
            glitch_found += 1
            print(f"[GLITCH] Found broken ligature: {g}")
    if glitch_found == 0:
        print("[PASS] Pure Unicode Hindi: 0 broken ligatures detected.")

if __name__ == "__main__":
    main()
