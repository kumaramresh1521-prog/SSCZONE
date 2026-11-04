import fitz, re, sys
sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
p15 = doc[15]
stream = doc.xref_stream(521).decode('latin1', errors='ignore')

# CMaps for F6, F7, F10, F8
def load_cmap(xref):
    f_obj = doc.xref_object(xref)
    m = re.search(r'/ToUnicode\s+(\d+)\s+0\s+R', f_obj)
    if not m: return {}
    c_str = doc.xref_stream(int(m.group(1))).decode('latin1')
    cmap = {}
    for bm in re.finditer(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>', c_str):
        s = int(bm.group(1), 16)
        e = int(bm.group(2), 16)
        t = int(bm.group(3), 16)
        for i in range(e - s + 1):
            if t + i < 0x110000:
                cmap[s + i] = chr(t + i)
    return cmap

cmaps = {
    '/F6': load_cmap(504),
    '/F7': load_cmap(509),
    '/F10': load_cmap(499),
    '/F8': load_cmap(514),
}

current_font = '/F7'
current_matrix = [1, 0, 0, 1, 0, 0]

lines = stream.split('\n')
for l in lines:
    f_m = re.search(r'(/F\d+)\s+[\d\.]+\s+Tf', l)
    if f_m:
        current_font = f_m.group(1)
    
    # Check text
    hx_matches = re.finditer(r'<([0-9a-fA-F]+)>\s*Tj', l)
    for hm in hx_matches:
        h = hm.group(1)
        cm = cmaps.get(current_font, {})
        txt = ''
        for k in range(0, len(h), 4):
            code = int(h[k:k+4], 16)
            txt += cm.get(code, f"[{code:04x}]")
        if 'Q51' in txt or 'Q52' in txt or 'Arrange' in txt or 'Simplify' in txt or any(c in txt for c in '0123456789/+-=><'):
            print(f"{current_font}: {repr(txt)} (raw: {h})")
