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
        (" नश्चित", "निश्चित"), ("दूसर ", "दूसरों "), ("च ता", "चिंता"),
        (" बना", "बिना"), ("दोन ", "दोनों "), ("हाथ ", "हाथों "), ("शां त", "शांति"),
        ("व्यव ा", "व्यवस्था"), ("धम ", "धर्म "), ("पक्ष ", "पक्षों "),
        (" ारा", " द्वारा"), (" ववाद", "विवाद"), (" नयुक्त", "नियुक्त"),
        (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"), ("मु  ल", "मुश्किल"),
        ("अ धक", "अधिक"), ("अधक", "अधिक"), ("अ तरेक", "अतिरेक"),
        (" शक्षक", " शिक्षक"), ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"),
        (" ज़ ी", "ज़िद्दी"), ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"),
        (" नयम", "नियम"), ("कं ठस्थ", "कंठस्थ"), ("महत्वपूण ", "महत्वपूर्ण "),
        ("चूँ क", "चूँकि"), ("यहैं", "यह"), ("नह ", "नहीं "), ("नहैं", "नहीं"),
        ("मलना", "मिलना"), ("मुल", "मुश्किल"), ("प्र त ापन", "प्रतिस्थापन"),
        ("प्र त", "प्रति"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_ows_raw():
    with open("scripts/scratch/ows_raw.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    decoded = decode_devanagari_null(raw)
    decoded = re.sub(r'--- Page \d+ ---.*?# Word Meaning\s+हिंदी\s+में\n', '', decoded, flags=re.DOTALL)
    decoded = re.sub(r'ssczone\.com Page \d+', '', decoded)

    sections = re.split(r'(?:|\()([A-M])(?:|\))\s+([^\n]+)', decoded)
    all_sections = []

    for i in range(1, len(sections), 3):
        letter = sections[i]
        title = sections[i+1].strip()
        body = sections[i+2]

        if "most asked in exams" in title:
            continue

        sec_title = f"Section ({letter}) {title}"
        entries = re.split(r'\n(?=\d+\s+[A-Z])', body)

        sec_items = []
        for e in entries:
            e = " ".join(e.strip().split())
            m = re.match(r'^(\d+)\s+([A-Z][a-zA-Z\s\(\)\'\-]+?)\s+([a-z].*)$', e)
            if not m:
                continue
            num = m.group(1).strip()
            word = m.group(2).strip()
            rest = m.group(3).strip()

            m_hi = re.search(r'[\u0900-\u097F]', rest)
            if m_hi:
                eng_def = rest[:m_hi.start()].strip()
                hi_def = rest[m_hi.start():].strip()
            else:
                eng_def = rest
                hi_def = ""

            sec_items.append({
                "num": num,
                "word": word,
                "eng_def": eng_def.strip(' ,;'),
                "hi_def": hi_def.strip(' ,;')
            })

        if sec_items:
            all_sections.append((sec_title, sec_items))

    return all_sections

def generate_html(sections):
    sec_blocks = []
    total_count = sum(len(items) for _, items in sections)

    for sec_title, items in sections:
        rows = []
        for it in items:
            num = it["num"]
            word = it["word"]
            eng_def = it["eng_def"]
            hi_def = it["hi_def"]

            rows.append(f"""
          <tr class="hover:bg-slate-50/60 transition-colors">
            <td class="p-3 font-mono font-bold text-slate-500 text-xs w-12 align-top">{num}</td>
            <td class="p-3 align-top w-1/4">
              <span class="text-base font-bold text-indigo-900 block">{word}</span>
            </td>
            <td class="p-3 align-top text-xs sm:text-sm text-slate-800 space-y-1.5">
              <div>
                <strong class="text-slate-900">Definition:</strong> {eng_def}
              </div>
              {f'''<div class="p-2 bg-emerald-50/70 border border-emerald-200/70 rounded-lg text-emerald-950 font-medium">
                <strong class="text-emerald-800">हिंदी अर्थ:</strong> {hi_def}
              </div>''' if hi_def else ''}
            </td>
          </tr>
""")
        table_rows = "".join(rows)

        sec_blocks.append(f"""
    <!-- Section Block -->
    <div class="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs mb-8">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h3 class="text-lg font-bold text-indigo-900">{sec_title}</h3>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full">{len(items)} Words</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-700 text-xs uppercase font-extrabold border-b border-slate-200">
              <th class="p-3 w-12">#</th>
              <th class="p-3 w-1/4">Substitution Word</th>
              <th class="p-3">English Definition &amp; शुद्ध हिंदी अर्थ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
{table_rows}
          </tbody>
        </table>
      </div>
    </div>
""")

    sections_html = "\n".join(sec_blocks)

    full_html = f"""<div class="space-y-8">
  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 p-6 md:p-8 rounded-2xl border border-indigo-200/70 shadow-xs">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-xs">
        Chapter 10 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      One Word Substitution (अनेक शब्दों के लिए एक शब्द) &bull; 500+ Compendium
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      One Word Substitution एक ऐसा अकेला शब्द है जो कई शब्दों के समूह के स्थान पर प्रयुक्त होकर वाक्य को संक्षिप्त, प्रभावशाली और सटीक बनाता है। 
      SSC परीक्षाओं में <strong>Error Spotting, Cloze Test, और Direct Vocabulary</strong> में 3 से 5 प्रश्न निश्चित रूप से पूछे जाते हैं। 
      नीचे 13 प्रमुख वर्गों (Persons, Phobias, Manias, Killing, Professions आदि) में विभाजित 500+ शब्दों का अंग्रेजी विवरण और शुद्ध हिंदी अर्थ दिया गया है।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">{total_count}+</span>
        <span class="text-xs font-semibold text-slate-600">Total Words</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">13 Categories</span>
        <span class="text-xs font-semibold text-slate-600">Thematic Clusters</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Flawless Hindi</span>
        <span class="text-xs font-semibold text-slate-600">मानक अर्थ सहित</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">3-5 Questions</span>
        <span class="text-xs font-semibold text-slate-600">Exam Weightage</span>
      </div>
    </div>
  </div>

  <!-- Sections List -->
  <div class="space-y-6">
{sections_html}
  </div>
</div>"""
    return full_html

if __name__ == '__main__':
    sections = parse_ows_raw()
    html = generate_html(sections)
    out_path = "scripts/scratch/ows_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    total_w = sum(len(it) for _, it in sections)
    print(f"Successfully rebuilt {out_path} with {len(sections)} sections and {total_w} words. (Length: {len(html)})")
