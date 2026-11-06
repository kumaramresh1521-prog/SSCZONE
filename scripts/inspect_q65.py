import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

# Let's search which page has Q.65, 68, 70
for p_idx in range(len(doc)):
    txt = doc[p_idx].get_text()
    if "hexagon is drawn" in txt or "tan 𝘼+ cot 𝘼" in txt:
        print(f"--- PAGE {p_idx+1} ---")
        blocks = doc[p_idx].get_text("blocks")
        for b in blocks:
            if any(term in b[4] for term in ["hexagon", "661.5", "tan", "𝙭2−1", "(A)", "(B)"]):
                print(f"Block rect: ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}):\n{repr(b[4])}")
