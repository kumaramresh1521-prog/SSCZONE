import re
import os

def clean_hindi(t: str) -> str:
    t = re.sub(r'\x00', '', t)
    repls = [
        ("म ", "में "), (" म ", " में "), ("नह ", "नहीं "), (" नह ", " नहीं "),
        ("तु ारे", "तुम्हारे"), ("तु ारा", "तुम्हारा"), ("तु ारी", "तुम्हारी"),
        (" पाट ", " पार्टी "), (" मला", " मिला"), (" मली", " मिली"), (" मले", " मिले"),
        (" कया", " किया"), (" कए", " किए"), (" लया", " लिया"), (" लए", " लिए"),
        ("इस लए", "इसलिए"), ("इसलए", "इसलिए"), ("चा हए", "चाहिए"), ("चाहए", "चाहिए"),
        ("प रवार", "परिवार"), ("परवार", "परिवार"), ("कु शल", "कुशल"), ("कु छ", "कुछ"),
        ("स्वाथ ", "स्वार्थी "), ("स्वाथ", "स्वार्थी"), (" नकले", "निकले"),
        (" नरीक्षण", "निरीक्षण"), ("पूव ", "पूर्व "), ("पूव", "पूर्व"),
        ("अ स्तत्व", "अस्तित्व"), ("अस्तत्व", "अस्तित्व"), (" न त", "निश्चित"),
        ("दूसर ", "दूसरों "), ("च ता", "चिंता"), (" बना", "बिना"),
        ("दोन ", "दोनों "), ("हाथ ", "हाथों "), ("शां त", "शांति"),
        ("व्यव ा", "व्यवस्था"), ("धम ", "धर्म "), ("पक्ष ", "पक्षों "),
        (" ारा", " द्वारा"), (" ववाद", "विवाद"), (" नयुक्त", "नियुक्त"),
        (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"), ("सहासन", "सिंहासन"),
        ("मु  ल", "मुश्किल"), ("मुल", "मुश्किल"), ("अ धक", "अधिक"), ("अधक", "अधिक"),
        ("अ तरेक", "अतिरेक"), ("अतरेक", "अतिरेक"), (" शक्षक", " शिक्षक"),
        ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"), (" ज़ ी", "ज़िद्दी"),
        ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"), ("संेषण", "संश्लेषण"),
        (" नयम", "नियम"), ("नयमें", "नियम"), ("कं ठस्थ", "कंठस्थ"), ("किं ठस्थ", "कंठस्थ"),
        ("महत्वपूण ", "महत्वपूर्ण "), ("महत्वपूण", "महत्वपूर्ण"), ("चूँ क", "चूँकि"),
        ("चूँकी", "चूँकि"), ("यहैं", "यह"), ("रहैं गया", "रह गया"),
        ("ज़हर", "ज़हर"), ("कहावत ", "कहावतों "), ("अथ ", "अर्थ "),
    ]
    for p, r in repls:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_idioms_file():
    with open("scripts/scratch/idioms_raw.txt", "r", encoding="utf-8") as f:
        text = f.read().replace('\x00', '')

    text = re.sub(r'--- Page \d+ ---.*?# Idiom Meaning\s+ह दी\s+म\s+Example\n', '', text, flags=re.DOTALL)
    text = re.sub(r'ssczone\.com Page \d+', '', text)
    text = re.sub(r'मुहावरे और वाक्यांश क्या ह \?', '', text)

    chunks = re.split(r'\n(?=\d+\s+[A-Z])', text)
    results = []

    for c in chunks:
        c = " ".join(c.strip().split())
        m = re.match(r'^(\d+)\s+([A-Z][a-zA-Z\s\',/’\-]+?)\s+([a-z].*)$', c)
        if not m:
            continue
        num = m.group(1).strip()
        idiom = m.group(2).strip()
        rest = m.group(3).strip()

        # Find first Hindi character
        m_hi = re.search(r'[\u0900-\u097F]', rest)
        if not m_hi:
            continue
        eng_meaning = rest[:m_hi.start()].strip()
        after_hi_start = rest[m_hi.start():].strip()

        # Find English example sentence
        m_eng_ex = re.search(r'([A-Z][a-zA-Z0-9\s,\'\-\"’“”\(\)/]+\.)\s*([\u0900-\u097F].*)', after_hi_start)
        if m_eng_ex:
            hi_meaning = after_hi_start[:m_eng_ex.start()].strip()
            eng_example = m_eng_ex.group(1).strip()
            hi_example = m_eng_ex.group(2).strip()
        else:
            # Fallback search
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
            "idiom": idiom,
            "eng_meaning": eng_meaning.strip(' ,;'),
            "hi_meaning": clean_hindi(hi_meaning.strip(' ,;')),
            "eng_example": eng_example.strip(),
            "hi_example": clean_hindi(hi_example.strip())
        })

    return results

if __name__ == '__main__':
    items = parse_idioms_file()
    print(f"Parsed {len(items)} idioms.")
    for it in items[:5]:
        print("=" * 60)
        print(f"#{it['num']} IDIOM: {it['idiom']}")
        print(f"  ENG MEANING: {it['eng_meaning']}")
        print(f"  HI MEANING : {it['hi_meaning']}")
        print(f"  ENG EXAMPLE: {it['eng_example']}")
        print(f"  HI EXAMPLE : {it['hi_example']}")
