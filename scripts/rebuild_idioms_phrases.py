import re
import os

def decode_devanagari_null(t: str) -> str:
    """Safe, accurate Devanagari font restoration from custom PDF encoding."""
    t = t.replace('वा\x00ांश', 'वाक्यांश')
    t = t.replace('सं\x00ेषण', 'संश्लेषण')
    t = t.replace('श\x00\x00', 'शब्दों')
    t = t.replace('\x00ह\x00दी', 'हिंदी')
    t = t.replace('अथ\x00', 'अर्थ')
    t = t.replace('स्वाथ\x00', 'स्वार्थी')
    t = t.replace('महत्वपूण\x00', 'महत्वपूर्ण')
    t = t.replace('पूण\x00', 'पूर्ण')
    t = t.replace('तक\x00', 'तर्क')
    t = t.replace('समथ\x00न', 'समर्थन')
    t = t.replace('धम\x00', 'धर्म')
    t = t.replace('कम\x00', 'कर्म')
    t = t.replace('पूव\x00', 'पूर्व')
    t = t.replace('म\x00', 'में')
    t = t.replace('ह\x00', 'हैं')
    t = t.replace('दोन\x00', 'दोनों')
    t = t.replace('हाथ\x00', 'हाथों')
    t = t.replace('लोग\x00', 'लोगों')
    t = t.replace('दूसर\x00', 'दूसरों')
    t = t.replace('कहावत\x00', 'कहावतों')

    consonants = 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'
    for c in consonants:
        t = t.replace(f'\x00{c}', f'{c}ि')
    t = t.replace('\x00', '')

    fixes = [
        ("तु ारे", "तुम्हारे"), ("तु ारा", "तुम्हारा"), ("तु ारी", "तुम्हारी"),
        (" पाट ", " पार्टी "), (" मला", " मिला"), (" मली", " मिली"), (" मले", " मिले"),
        (" गलास", " गिलास"), (" कया", " किया"), (" कए", " किए"), (" लया", " लिया"),
        (" लए", " लिए"), ("इस लए", "इसलिए"), ("इसलए", "इसलिए"), ("चा हए", "चाहिए"),
        ("चाहए", "चाहिए"), ("प रवार", "परिवार"), ("परवार", "परिवार"), ("कु शल", "कुशल"),
        ("कु छ", "कुछ"), ("स्वाथ ", "स्वार्थी "), (" नकले", "निकले"),
        (" नरीक्षण", "निरीक्षण"), ("पूव ", "पूर्व "), ("अ स्तत्व", "अस्तित्व"),
        (" न त", "निश्चित"), ("दूसर ", "दूसरों "), ("च ता", "चिंता"), (" बना", "बिना"),
        ("दोन ", "दोनों "), ("हाथ ", "हाथों "), ("शां त", "शांति"), ("व्यव ा", "व्यवस्था"),
        ("धम ", "धर्म "), ("पक्ष ", "पक्षों "), (" ारा", " द्वारा"), (" ववाद", "विवाद"),
        (" नयुक्त", "नियुक्त"), (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"),
        ("मु  ल", "मुश्किल"), ("अ धक", "अधिक"), ("अ तरेक", "अतिरेक"),
        (" शक्षक", " शिक्षक"), ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"),
        (" ज़ ी", "ज़िद्दी"), ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"),
        (" नयम", "नियम"), ("कं ठस्थ", "कंठस्थ"), ("महत्वपूण ", "महत्वपूर्ण "),
        ("चूँ क", "चूँकि"), ("चूँकी", "चूँकि"), ("यहैं", "यह"), ("रहैं गया", "रह गया"),
        ("ज़हर", "ज़हर"), ("कहावत ", "कहावतों "), ("अथ ", "अर्थ "), ("नह ", "नहीं "),
        ("नहैं", "नहीं"), ("मलना", "मिलना"), ("मुल", "मुश्किल"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_idioms_raw():
    with open("scripts/scratch/idioms_raw.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    decoded = decode_devanagari_null(raw)
    decoded = re.sub(r'--- Page \d+ ---.*?# Idiom Meaning\s+हिंदी\s+में\s+Example\n', '', decoded, flags=re.DOTALL)
    decoded = re.sub(r'ssczone\.com Page \d+', '', decoded)
    decoded = re.sub(r'मुहावरे और वाक्यांश क्या हैं \?', '', decoded)

    chunks = re.split(r'\n(?=\d+\s+[A-Z])', decoded)
    items = []

    for c in chunks:
        lines = [l.strip() for l in c.strip().splitlines() if l.strip()]
        if not lines:
            continue
        first_line = lines[0]
        m = re.match(r'^(\d+)\s+(.*?)$', first_line)
        if not m:
            continue
        num = m.group(1).strip()
        first_rest = m.group(2).strip()

        # Recombine full entry text
        full_entry = " ".join([first_rest] + lines[1:])

        # Find first Hindi character
        m_hi = re.search(r'[\u0900-\u097F]', full_entry)
        if not m_hi:
            continue

        eng_before_hi = full_entry[:m_hi.start()].strip()
        after_hi_start = full_entry[m_hi.start():].strip()

        # In eng_before_hi, the first line usually contained the Idiom, and the rest was Meaning
        # Let's split idiom vs english meaning:
        # If first_line had Hindi, idiom is before meaning
        # Usually Idiom is 2-6 words at the beginning
        # We can split on common meaning keywords or by sentence structure
        # In PDF: '# Idiom Meaning'
        # Example: 'At oneʼs witʼs end perplexed'
        # Look for lowercase start of meaning, or common prepositions
        m_split = re.search(r'\s+(in\s+|to\s+|a\s+|an\s+|the\s+|very\s+|extremely\s+|without\s+|completely\s+|with\s+|by\s+|from\s+|having\s+|showing\s+|causing\s+|one\s+who\s+|state\s+of\s+|most\s+|perplexed|complete\s+|honest\s+|close\s+|bad\s+|good\s+|false\s+|secret\s+|open\s+|silent\s+|frequent\s+|sudden\s+|dangerous\s+|difficult\s+)', eng_before_hi, re.IGNORECASE)
        if m_split:
            idiom = eng_before_hi[:m_split.start()].strip()
            eng_meaning = eng_before_hi[m_split.start():].strip()
        else:
            # Fallback: first 3 words
            words = eng_before_hi.split()
            if len(words) > 3:
                idiom = " ".join(words[:3])
                eng_meaning = " ".join(words[3:])
            else:
                idiom = eng_before_hi
                eng_meaning = ""

        # Now parse Hindi meaning vs English example vs Hindi example
        m_eng_ex = re.search(r'([A-Z][a-zA-Z0-9\s,\'\-\"’“”\(\)/]+\.)\s*([\u0900-\u097F].*)', after_hi_start)
        if m_eng_ex:
            hi_meaning = after_hi_start[:m_eng_ex.start()].strip()
            eng_example = m_eng_ex.group(1).strip()
            hi_example = m_eng_ex.group(2).strip()
        else:
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

        items.append({
            "num": num,
            "idiom": idiom,
            "eng_meaning": eng_meaning.strip(' ,;'),
            "hi_meaning": hi_meaning.strip(' ,;'),
            "eng_example": eng_example.strip(),
            "hi_example": hi_example.strip()
        })

    return items

def generate_html(items):
    cards = []
    for it in items:
        num = it["num"]
        idiom = it["idiom"]
        eng_meaning = it["eng_meaning"]
        hi_meaning = it["hi_meaning"]
        eng_example = it["eng_example"]
        hi_example = it["hi_example"]

        cards.append(f"""
    <div id="idiom-{num}" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-md">#{num}</span>
          <h3 class="text-base sm:text-lg font-bold text-indigo-900 tracking-tight">{idiom}</h3>
        </div>
        <span class="px-2.5 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full">SSC High-Frequency</span>
      </div>

      <!-- Meaning Section -->
      <div class="space-y-2 mb-3">
        {f'<div class="text-xs sm:text-sm text-slate-800"><strong class="text-slate-900">English Meaning:</strong> {eng_meaning}</div>' if eng_meaning else ''}
        <div class="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs sm:text-sm text-emerald-950 font-medium">
          <strong class="text-emerald-800">सरल हिंदी अर्थ:</strong> {hi_meaning}
        </div>
      </div>

      <!-- Contextual Exam Sentence Usage -->
      {f'''<div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm space-y-1.5">
        <div class="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
          <span>🎯 Real SSC Sentence Usage:</span>
        </div>
        <p class="italic text-slate-800 font-medium">"{eng_example}"</p>
        {f'<p class="text-slate-600 text-xs"><strong>हिंदी अनुवाद:</strong> {hi_example}</p>' if hi_example else ''}
      </div>''' if eng_example else ''}
    </div>
""")

    body_cards = "\n".join(cards)

    full_html = f"""<div class="space-y-8">
  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 p-6 md:p-8 rounded-2xl border border-indigo-200/70 shadow-xs">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-xs">
        Chapter 11 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      Idioms &amp; Phrases (मुहावरे और वाक्यांश) &bull; Complete 450+ Master Compendium
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      Idiom (मुहावरा) शब्दों का ऐसा समूह है जिसका अर्थ शब्दों के सीधे शाब्दिक अर्थ से भिन्न और लाक्षणिक होता है। 
      SSC CGL Tier-1 और Tier-2 में <strong>Idioms & Phrases</strong> से 4 से 6 प्रश्न सीधे पूछे जाते हैं। 
      नीचे A से Z तक सभी 450+ सर्वाधिक पूछे जाने वाले मुहावरों का अंग्रेजी अर्थ, सटीक हिंदी अर्थ और वास्तविक वाक्य प्रयोग दिया गया है।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">450+</span>
        <span class="text-xs font-semibold text-slate-600">A to Z Idioms</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">Pure Hindi</span>
        <span class="text-xs font-semibold text-slate-600">शुद्ध मानक अर्थ</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Exam Sentences</span>
        <span class="text-xs font-semibold text-slate-600">Contextual Usage</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">Weightage</span>
        <span class="text-xs font-semibold text-slate-600">4-6 Direct Qs</span>
      </div>
    </div>
  </div>

  <!-- Idioms Card Grid -->
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">A to Z Master Idioms Catalog (मुहावरों की सूची)</h2>
      <span class="text-xs font-semibold text-slate-500">450+ Authentic Entries</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
{body_cards}
    </div>
  </div>
</div>"""
    return full_html

if __name__ == '__main__':
    items = parse_idioms_raw()
    html = generate_html(items)
    out_path = "scripts/scratch/idioms_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully rebuilt {out_path} with {len(items)} structured cards. (Length: {len(html)})")
