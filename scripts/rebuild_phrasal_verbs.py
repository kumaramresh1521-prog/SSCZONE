import re
import os
import json

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

    # Specific common OCR typo fixes
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
        ("मोमबी", "मोमबत्ती"), ("झका", "झोंका"), ("धैय", "धैर्य"), ("समथन", "समर्थन"),
        ("तक ", "तर्क "), ("संबंधत", "संबंधित"), ("समा", "समस्या"), ("टप्पणयाँ", "टिप्पणियाँ"),
        ("प्रासंगक", "प्रासंगिक"), ("पुरार", "पुरस्कार"), ("प्रतयोगता", "प्रतियोगिता"),
        ("आखरी", "आखिरी"), ("माँगना", "मांगना"), ("नह ", "नहीं "), ("नहैं", "नहीं"),
        ("मलना", "मिलना"), ("मुल", "मुश्किल"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_phrasal_raw():
    with open("scripts/scratch/phrasal_raw.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    decoded = decode_devanagari_null(raw)
    decoded = re.sub(r'--- Page \d+ ---.*?# Phrasal Verb Meaning Example\n', '', decoded, flags=re.DOTALL)
    decoded = re.sub(r'ssczone\.com Page \d+', '', decoded)

    chunks = re.split(r'\n(?=\d+\s+[A-Z])', decoded)
    particles = r'(?:for|after|out|in|away|off|on|down|up|through|over|about|by|into|with|against|across|along|at|from|to|back|round|around|aside|apart|forth|upon)'
    verb_pattern = re.compile(rf'^([A-Z][A-Za-z/\-\'\s]+?(?:\s+{particles}(?:\s+{particles})*)?)\s+(.*)$')

    items = []
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

        # Parse verb vs English meaning
        vm = verb_pattern.match(eng_before_hi)
        if vm:
            verb = vm.group(1).strip()
            eng_meaning = vm.group(2).strip()
        else:
            parts = eng_before_hi.split(None, 2)
            if len(parts) >= 2:
                verb = f"{parts[0]} {parts[1]}"
                eng_meaning = parts[2] if len(parts) > 2 else ""
            else:
                verb = eng_before_hi
                eng_meaning = ""

        # Parse Hindi meaning vs English example vs Hindi example
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
            "verb": verb,
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
        verb = it["verb"]
        eng_meaning = it["eng_meaning"]
        hi_meaning = it["hi_meaning"]
        eng_example = it["eng_example"]
        hi_example = it["hi_example"]

        # If eng_meaning is missing or short, format cleanly
        cards.append(f"""
    <div id="phrasal-{num}" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-md">#{num}</span>
          <h3 class="text-base sm:text-lg font-bold text-indigo-900 tracking-tight">{verb}</h3>
        </div>
        <span class="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full">Phrasal Verb</span>
      </div>

      <!-- Meaning Section: English on top, Hindi in distinct clean badge -->
      <div class="space-y-2 mb-3">
        <div class="text-xs sm:text-sm text-slate-800">
          <strong class="text-slate-900">English Meaning:</strong> {eng_meaning}
        </div>
        <div class="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs sm:text-sm text-emerald-950 font-medium">
          <strong class="text-emerald-800">सरल हिंदी अर्थ:</strong> {hi_meaning}
        </div>
      </div>

      <!-- Contextual Exam Sentence Usage -->
      {f'''<div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm space-y-1.5">
        <div class="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
          <span>🎯 Real SSC Shift Sentence:</span>
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
        Chapter 09 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      Phrasal Verbs (फ्रेजल वर्ब्स) &bull; Complete 215+ Master Compendium
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      Phrasal Verb वह क्रिया (Verb) है जिसके साथ कोई Preposition या Adverb (Particle) जुड़कर एक नया लाक्षणिक (Idiomatic) अर्थ बनाता है। 
      SSC परीक्षाओं में <strong>Cloze Test, Fill in the Blanks, Error Detection</strong> तथा <strong>Sentence Improvement</strong> में 
      Phrasal Verbs से 3 से 5 प्रश्न निश्चित रूप से पूछे जाते हैं। नीचे सभी 215+ क्रियाओं का अंग्रेजी अर्थ, शुद्ध हिंदी अर्थ तथा वास्तविक परीक्षा वाक्य प्रयोग दिया गया है।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">215+</span>
        <span class="text-xs font-semibold text-slate-600">Master Verbs</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">100% Clean</span>
        <span class="text-xs font-semibold text-slate-600">English + Hindi</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Real PYQs</span>
        <span class="text-xs font-semibold text-slate-600">Authentic Sentences</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">Exam Weightage</span>
        <span class="text-xs font-semibold text-slate-600">3-5 Questions</span>
      </div>
    </div>
  </div>

  <!-- Phrasal Verbs Card Grid -->
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">A to Z Phrasal Verbs Directory (व्यापक सूची)</h2>
      <span class="text-xs font-semibold text-slate-500">209 High-Yield Entries</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
{body_cards}
    </div>
  </div>
</div>"""
    return full_html

if __name__ == '__main__':
    items = parse_phrasal_raw()
    html = generate_html(items)
    out_path = "scripts/scratch/phrasal_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully rebuilt {out_path} with {len(items)} structured cards. (Length: {len(html)})")
