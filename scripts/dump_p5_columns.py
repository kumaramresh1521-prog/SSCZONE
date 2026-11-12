import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

# Let's inspect words on page 5
page = doc[4] # page 5
words = page.get_text('words')

# Filter for x0 < 324 (left column) and x0 >= 324 (right column)
left_words = [w for w in words if w[0] < 310]
right_words = [w for w in words if w[0] >= 310]

print("=== LEFT COLUMN WORDS ===")
left_lines = {}
for w in left_words:
    y = round(w[1] / 10) * 10
    left_lines.setdefault(y, []).append(w[4])
for y in sorted(left_lines.keys()):
    print(f"{y}: {' '.join(left_lines[y])}")

print("\n=== RIGHT COLUMN WORDS ===")
right_lines = {}
for w in right_words:
    y = round(w[1] / 10) * 10
    right_lines.setdefault(y, []).append(w[4])
for y in sorted(right_lines.keys()):
    print(f"{y}: {' '.join(right_lines[y])}")
