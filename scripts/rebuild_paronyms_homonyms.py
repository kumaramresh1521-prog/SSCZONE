import re
import os

def decode_devanagari_null(t: str) -> str:
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

    consonants = 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'
    for c in consonants:
        t = t.replace(f'\x00{c}', f'{c}ि')
    t = t.replace('\x00', '')

    fixes = [
        ("तु ारे", "तुम्हारे"), ("तु ारा", "तुम्हारा"), ("तु ारी", "तुम्हारी"),
        (" पाट ", " पार्टी "), (" मला", " मिला"), (" मली", " मिली"), (" मले", " मिले"),
        (" कया", " किया"), (" कए", " किए"), (" लया", " लिया"), (" लए", " लिए"),
        ("इस लए", "इसलिए"), ("इसलए", "इसलिए"), ("चा हए", "चाहिए"), ("चाहए", "चाहिए"),
        ("प रवार", "परिवार"), ("परवार", "परिवार"), ("कु शल", "कुशल"), ("कु छ", "कुछ"),
        ("स्वाथ ", "स्वार्थी "), (" नकले", "निकले"), (" नरीक्षण", "निरीक्षण"),
        ("अ स्तत्व", "अस्तित्व"), ("अस्तत्व", "अस्तित्व"), (" न त", "निश्चित"),
        ("दूसर ", "दूसरों "), ("च ता", "चिंता"), (" बना", "बिना"),
        ("दोन ", "दोनों "), ("हाथ ", "हाथों "), ("शां त", "शांति"),
        ("व्यव ा", "व्यवस्था"), ("धम ", "धर्म "), ("पक्ष ", "पक्षों "),
        (" ारा", " द्वारा"), (" ववाद", "विवाद"), (" नयुक्त", "नियुक्त"),
        (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"), ("सहासन", "सिंहासन"),
        ("मु  ल", "मुश्किल"), ("मुल", "मुश्किल"), ("अ धक", "अधिक"), ("अधक", "अधिक"),
        ("अ तरेक", "अतिरेक"), ("अतरेक", "अतिरेक"), (" शक्षक", " शिक्षक"),
        ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"), (" ज़ ी", "ज़िद्दी"),
        ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"), (" नयम", "नियम"),
        ("कं ठस्थ", "कंठस्थ"), ("महत्वपूण ", "महत्वपूर्ण "), ("चूँ क", "चूँकि"),
        ("यहैं", "यह"), ("नह ", "नहीं "), ("नहैं", "नहीं"), ("मलना", "मिलना"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_paronyms_raw():
    with open("scripts/scratch/paronyms_raw.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    decoded = decode_devanagari_null(raw)
    decoded = re.sub(r'--- Page \d+ ---.*?# Word Sense\s+हिंदी\s+में\s+Example\n', '', decoded, flags=re.DOTALL)
    decoded = re.sub(r'ssczone\.com Page \d+', '', decoded)
    decoded = re.sub(r'पैरो नम्स और होमो नम्स क्या हैं \?', '', decoded)

    lines = [l.strip() for l in decoded.splitlines() if l.strip()]
    
    # Each entry in PDF starts with a number like "1 Access approach..."
    # Group by number
    sets = {}
    current_num = None

    for line in lines:
        m = re.match(r'^(\d+)\s+([A-Z][a-zA-Z\s\(\)\'\-]+?)\s+(.*)$', line)
        if m:
            num = m.group(1).strip()
            word = m.group(2).strip()
            rest = m.group(3).strip()
            current_num = num
            if num not in sets:
                sets[num] = []

            # parse rest: sense (eng), hindi, example (eng), hindi
            m_hi = re.search(r'[\u0900-\u097F]', rest)
            if m_hi:
                eng_sense = rest[:m_hi.start()].strip()
                after_hi = rest[m_hi.start():].strip()

                m_eng_ex = re.search(r'([A-Z][a-zA-Z0-9\s,\'\-\"’“”\(\)/]+\.)\s*([\u0900-\u097F].*)', after_hi)
                if m_eng_ex:
                    hi_meaning = after_hi[:m_eng_ex.start()].strip()
                    eng_example = m_eng_ex.group(1).strip()
                    hi_example = m_eng_ex.group(2).strip()
                else:
                    m_eng_any = re.search(r'([A-Z][a-zA-Z\s,\'\-\"’“”]+)', after_hi)
                    if m_eng_any:
                        hi_meaning = after_hi[:m_eng_any.start()].strip()
                        rest2 = after_hi[m_eng_any.start():].strip()
                        m_hi2 = re.search(r'[\u0900-\u097F]', rest2)
                        if m_hi2:
                            eng_example = rest2[:m_hi2.start()].strip()
                            hi_example = rest2[m_hi2.start():].strip()
                        else:
                            eng_example = rest2
                            hi_example = ""
                    else:
                        hi_meaning = after_hi
                        eng_example = ""
                        hi_example = ""
            else:
                eng_sense = rest
                hi_meaning = ""
                eng_example = ""
                hi_example = ""

            sets[num].append({
                "word": word,
                "sense": eng_sense.strip(' ,;'),
                "hi_meaning": hi_meaning.strip(' ,;'),
                "eng_example": eng_example.strip(),
                "hi_example": hi_example.strip()
            })
        elif current_num and sets[current_num]:
            # Continuation line of previous entry
            last_item = sets[current_num][-1]
            if not last_item["eng_example"]:
                m_eng_ex = re.search(r'([A-Z][a-zA-Z0-9\s,\'\-\"’“”\(\)/]+\.)\s*([\u0900-\u097F].*)', line)
                if m_eng_ex:
                    last_item["eng_example"] = m_eng_ex.group(1).strip()
                    last_item["hi_example"] = m_eng_ex.group(2).strip()
                else:
                    last_item["hi_meaning"] += " " + line
            else:
                last_item["hi_example"] += " " + line

    return sets

def generate_html(sets):
    set_cards = []
    for num, words in sorted(sets.items(), key=lambda x: int(x[0])):
        if not words:
            continue
        word_titles = " / ".join(w["word"] for w in words)
        col_count = min(len(words), 3)

        cols = []
        for w in words:
            word = w["word"]
            sense = w["sense"]
            hi_m = w["hi_meaning"]
            ex = w["eng_example"]
            hi_ex = w["hi_example"]

            cols.append(f"""
        <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
              <span class="text-base font-extrabold text-indigo-900">{word}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Confusing Term</span>
            </div>

            <div class="space-y-1.5 mb-2.5 text-xs sm:text-sm">
              {f'<div><strong class="text-slate-900">English Sense:</strong> <span class="text-slate-700">{sense}</span></div>' if sense else ''}
              <div class="p-2 bg-emerald-50/80 border border-emerald-200/70 rounded-lg text-emerald-950 font-medium">
                <strong class="text-emerald-800">हिंदी अर्थ:</strong> {hi_m}
              </div>
            </div>
          </div>

          {f'''<div class="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1 mt-2">
            <strong class="text-indigo-900 block font-bold">🎯 Real SSC Sentence:</strong>
            <p class="italic text-slate-800">"{ex}"</p>
            {f'<p class="text-slate-600 text-[11px]"><strong>हिंदी अनुवाद:</strong> {hi_ex}</p>' if hi_ex else ''}
          </div>''' if ex else ''}
        </div>
""")
        cols_html = "".join(cols)

        set_cards.append(f"""
    <!-- Set Card -->
    <div id="paronym-set-{num}" class="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs mb-6 hover:border-indigo-300 transition-all">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-md">SET #{num}</span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{word_titles}</h3>
        </div>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full">{len(words)} Words Comparative</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-{col_count} gap-3">
{cols_html}
      </div>
    </div>
""")

    body_sets = "\n".join(set_cards)

    full_html = f"""<div class="space-y-8">
  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 p-6 md:p-8 rounded-2xl border border-indigo-200/70 shadow-xs">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-xs">
        Chapter 13 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      Paronyms &amp; Homonyms (समोच्चरित एवं भ्रामक शब्द) &bull; Complete 227 Sets
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      <strong>Paronyms</strong> वे शब्द हैं जिनका अर्थ भिन्न होता है लेकिन व्युत्पत्ति या रूप समान होता है (जैसे <em>Affect / Effect</em>)। 
      <strong>Homonyms / Homophones</strong> वे शब्द हैं जिनका उच्चारण समान होता है लेकिन वर्तनी और अर्थ भिन्न होते हैं (जैसे <em>Accept / Except</em>)। 
      SSC परीक्षाओं में <strong>Fill in the Blanks, Cloze Test और Error Detection</strong> में इन शब्दों से सर्वाधिक प्रश्न पूछे जाते हैं। 
      नीचे सभी 227 भ्रमकारी जोड़ों और त्रिकों (Pairs & Triplets) का तुलनात्मक अध्ययन, शुद्ध हिंदी अर्थ तथा वाक्य प्रयोग दिया गया है।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">227 Sets</span>
        <span class="text-xs font-semibold text-slate-600">490+ Words</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">Pairs &amp; Triplets</span>
        <span class="text-xs font-semibold text-slate-600">तुलनात्मक अध्ययन</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Pure Hindi</span>
        <span class="text-xs font-semibold text-slate-600">सटीक हिंदी अर्थ</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">3-4 Questions</span>
        <span class="text-xs font-semibold text-slate-600">Exam Weightage</span>
      </div>
    </div>
  </div>

  <!-- Sets Directory -->
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">227 Sets Complete Master Comparative Directory</h2>
      <span class="text-xs font-semibold text-slate-500">227 Sets (490+ Words)</span>
    </div>

{body_sets}
  </div>
</div>"""
    return full_html

if __name__ == '__main__':
    sets = parse_paronyms_raw()
    html = generate_html(sets)
    out_path = "scripts/scratch/paronyms_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully rebuilt {out_path} with {len(sets)} comparative sets. (Length: {len(html)})")
