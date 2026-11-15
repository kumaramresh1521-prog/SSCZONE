import re

pdf_official_keys = {
    1: 'b', 2: 'd', 3: 'a', 4: 'a', 5: 'b', 6: 'a',
    7: 'a', 8: 'b', 9: 'c', 10: 'd', 11: 'd', 12: 'b',
    13: 'd', 14: 'c', 15: 'a', 16: 'd', 17: 'c', 18: 'b',
    19: 'd', 20: 'c', 21: 'd', 22: 'b', 23: 'b', 24: 'c',
    25: 'c', 26: 'd', 27: 'b', 28: 'a', 29: 'b', 30: 'c',
    31: 'c', 32: 'c', 33: 'b', 34: 'b', 35: 'd', 36: 'c',
    37: 'a', 38: 'b', 39: 'a', 40: 'b', 41: 'b', 42: 'd',
    43: 'c', 44: 'd', 45: 'c', 46: 'd', 47: 'b', 48: 'c',
    49: 'a', 50: 'b', 51: 'a', 52: 'a', 53: 'c', 54: 'a',
    55: 'a', 56: 'b', 57: 'c', 58: 'c', 59: 'b', 60: 'c',
    61: 'a', 62: 'c', 63: 'a', 64: 'a', 65: 'b', 66: 'b',
    67: 'c', 68: 'c'
}

with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

pattern = re.compile(r'q\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*(\d+)\s*\)', re.DOTALL)
matches = pattern.findall(text)
print(f"Total HTML questions parsed: {len(matches)}")

idx_to_letter = {0: 'a', 1: 'b', 2: 'c', 3: 'd'}

mismatches = []
for i, (qtext, qopts, qans) in enumerate(matches):
    qnum = i + 1
    expected_letter = pdf_official_keys.get(qnum)
    actual_letter = idx_to_letter.get(int(qans))
    if expected_letter != actual_letter:
        mismatches.append((qnum, expected_letter, actual_letter, qopts))

print(f"Mismatches between PDF key and HTML ans: {len(mismatches)}")
if mismatches:
    for m in mismatches:
        print("Mismatch:", m)
else:
    print("ALL 68 QUESTIONS IN HTML 100% MATCH THE PDF OFFICIAL ANSWER KEY!")
