import fitz

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf")
print("=== P.3 BLOCKS ===")
for b in doc[2].get_text("blocks"):
    if b[1] > 600:
        print(f"P3 ({b[0]:.1f}, {b[1]:.1f}):\n{repr(b[4])}")

print("\n=== P.4 BLOCKS ===")
for b in doc[3].get_text("blocks"):
    if b[1] < 250:
        print(f"P4 ({b[0]:.1f}, {b[1]:.1f}):\n{repr(b[4])}")
