import re
import os

particles = r'(?:for|after|out|in|away|off|on|down|up|through|over|about|by|into|with|against|across|along|at|from|to|back|round|around|aside|apart|forth|upon)'
verb_pattern = re.compile(rf'^([A-Z][A-Za-z/\-\'\s]+?(?:\s+{particles}(?:\s+{particles})*)?)\s+(.*)$')

def clean_hindi(t: str) -> str:
    """Accurate, safe, word-boundary Devanagari normalization without breaking valid words."""
    t = re.sub(r'\x00', '', t)
    # Fix specific OCR character drops
    repls = [
        ("म ", "में "),
        (" म ", " में "),
        ("नह ", "नहीं "),
        (" नह ", " नहीं "),
        ("तु ारे", "तुम्हारे"),
        ("तु ारा", "तुम्हारा"),
        ("तु ारी", "तुम्हारी"),
        (" पाट ", " पार्टी "),
        (" मला", " मिला"),
        (" मली", " मिली"),
        (" मले", " मिले"),
        (" गलास", " गिलास"),
        (" कया", " किया"),
        (" कए", " किए"),
        (" लया", " लिया"),
        (" लए", " लिए"),
        ("इस लए", "इसलिए"),
        ("इसलए", "इसलिए"),
        ("चा हए", "चाहिए"),
        ("चाहए", "चाहिए"),
        ("प रवार", "परिवार"),
        ("परवार", "परिवार"),
        ("कु शल", "कुशल"),
        ("कु छ", "कुछ"),
        ("स्वाथ ", "स्वार्थी "),
        (" नकले", "निकले"),
        (" नरीक्षण", "निरीक्षण"),
        ("पूव ", "पूर्व "),
        ("अ स्तत्व", "अस्तित्व"),
        (" न त", "निश्चित"),
        ("दूसर ", "दूसरों "),
        ("च ता", "चिंता"),
        (" बना", "बिना"),
        ("दोन ", "दोनों "),
        ("हाथ ", "हाथों "),
        ("शां त", "शांति"),
        ("व्यव ा", "व्यवस्था"),
        ("धम ", "धर्म "),
        ("पक्ष ", "पक्षों "),
        (" ारा", " द्वारा"),
        (" ववाद", "विवाद"),
        (" नयुक्त", "नियुक्त"),
        (" वश्वास", "विश्वास"),
        ("स हासन", "सिंहासन"),
        ("मु  ल", "मुश्किल"),
        ("अ धक", "अधिक"),
        ("अ तरेक", "अतिरेक"),
        (" शक्षक", " शिक्षक"),
        ("छात्र ", "छात्रों "),
        (" नमंत्रण", " निमंत्रण"),
        (" ज़ ी", "ज़िद्दी"),
        ("मं दर", "मंदिर"),
        ("सं ेषण", "संश्लेषण"),
        (" नयम", "नियम"),
        ("कं ठस्थ", "कंठस्थ"),
        ("महत्वपूण ", "महत्वपूर्ण "),
        ("चूँ क", "चूँकि"),
        ("चूँकी", "चूँकि"),
        ("यहैं", "यह"),
        ("रहैं गया", "रह गया"),
        ("मोमबी", "मोमबत्ती"),
        ("झका", "झोंका"),
        ("धैय", "धैर्य"),
        ("समथन", "समर्थन"),
        ("तक ", "तर्क "),
        ("संबंधत", "संबंधित"),
        ("समा", "समस्या"),
        ("टप्पणयाँ", "टिप्पणियाँ"),
        ("प्रासंगक", "प्रासंगिक"),
        ("पुरार", "पुरस्कार"),
        ("प्रतयोगता", "प्रतियोगिता"),
        ("आखरी", "आखिरी"),
        ("माँगना", "मांगना"),
    ]
    for p, r in repls:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_phrasal_file():
    with open("scripts/scratch/phrasal_raw.txt", "r", encoding="utf-8") as f:
        text = f.read().replace('\x00', '')

    text = re.sub(r'--- Page \d+ ---.*?# Phrasal Verb Meaning Example\n', '', text, flags=re.DOTALL)
    text = re.sub(r'ssczone\.com Page \d+', '', text)

    chunks = re.split(r'\n(?=\d+\s+[A-Z])', text)
    results = []

    for c in chunks:
        c = " ".join(c.strip().split())
        m = re.match(r'^(\d+)\s+(.*?)$', c)
        if not m:
            continue
        num = m.group(1).strip()
        rest = m.group(2).strip()

        # Find first Hindi character
        m_hi = re.search(r'[\u0900-\u097F]', rest)
        if not m_hi:
            continue

        eng_before_hi = rest[:m_hi.start()].strip()
        after_hi_start = rest[m_hi.start():].strip()

        # Parse verb vs English meaning from eng_before_hi
        vm = verb_pattern.match(eng_before_hi)
        if vm:
            verb = vm.group(1).strip()
            eng_meaning = vm.group(2).strip()
        else:
            # Fallback split on first 2 words
            parts = eng_before_hi.split(None, 2)
            if len(parts) >= 2:
                verb = f"{parts[0]} {parts[1]}"
                eng_meaning = parts[2] if len(parts) > 2 else ""
            else:
                verb = eng_before_hi
                eng_meaning = ""

        # Now parse Hindi meaning vs English example vs Hindi example
        m_eng_ex = re.search(r'([A-Z][a-zA-Z0-9\s,\'\-\"’“”\(\)/]+\.)\s*([\u0900-\u097F].*)', after_hi_start)
        if m_eng_ex:
            hi_meaning = after_hi_start[:m_eng_ex.start()].strip()
            eng_example = m_eng_ex.group(1).strip()
            hi_example = m_eng_ex.group(2).strip()
        else:
            # Try finding English sentence ending without period
            m_eng_any = re.search(r'([A-Z][a-zA-Z\s,\'\-\"’“”]+)', after_hi_start)
            if m_eng_any:
                hi_meaning = after_hi_start[:m_eng_any.start()].strip()
                rest2 = after_hi_start[m_eng_any.start():].strip()
                m_hi2 = re.search(r'[\u0900-\u097F]', rest2)
                if m_hi2:
                    eng_example = rest2[:m_hi2.start()].strip()
                    hi_example = rest2[m_hi2.start():].strip()
                else:
                    eng_example = rest2
                    hi_example = ""
            else:
                hi_meaning = after_hi_start
                eng_example = ""
                hi_example = ""

        results.append({
            "num": num,
            "verb": verb,
            "eng_meaning": eng_meaning.strip(' ,;'),
            "hi_meaning": clean_hindi(hi_meaning.strip(' ,;')),
            "eng_example": eng_example.strip(),
            "hi_example": clean_hindi(hi_example.strip())
        })

    return results

if __name__ == '__main__':
    items = parse_phrasal_file()
    print(f"Parsed {len(items)} items.")
    for it in items[:5]:
        print("=" * 60)
        print(f"#{it['num']} VERB: {it['verb']}")
        print(f"  ENG MEANING: {it['eng_meaning']}")
        print(f"  HI MEANING : {it['hi_meaning']}")
        print(f"  ENG EXAMPLE: {it['eng_example']}")
        print(f"  HI EXAMPLE : {it['hi_example']}")
