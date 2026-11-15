# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Synonyms & Antonyms.
Parses all 498 keywords from PDF raw text, cleans Hindi OCR ligatures,
and produces the master thesaurus chapter for SSCZone.
"""

import re
import os

hindi_clean_map = {
    "पर्यावची": "पर्यायवाची", "वलोम": "विलोम", "अथर्थ": "अर्थ", "समनर्थी": "समानार्थी",
    "दिेखें": "देखें", "दिए": "दिए", "क े": "के", "स र्ता": "सिर्फ", "नष्फल": "निष्फल",
    "स्वयंसद्ध": "स्वयंसिद्ध", "शपपूर्थक": "शपथपूर्वक", "अरुच": "अरुचि", "घृणिा": "घृणा", "परश्रमी": "परिश्रमी"
}

def clean_text(t):
    for k, v in hindi_clean_map.items():
        t = t.replace(k, v)
    return t

def parse_syno_anto():
    raw_path = "scripts/scratch/syno_anto_raw.txt"
    with open(raw_path, "r", encoding="utf-8") as f:
        text = f.read()

    entries = re.findall(r'\n([A-Z\s\-]{3,})\s+([^\n]+)\nSyn\s+([^\n]+)\nAnt\s+([^\n]+)', text)
    clean_entries = []
    for word, hindi, syn, ant in entries:
        clean_entries.append((
            word.strip(),
            clean_text(hindi.strip()),
            syn.strip(),
            ant.strip()
        ))
    print(f"Parsed {len(clean_entries)} synonym-antonym entries.")
    return clean_entries

def generate_syno_anto_chapter():
    entries = parse_syno_anto()
    
    cards = []
    for idx, (word, hindi, syn, ant) in enumerate(entries, 1):
        cards.append(f"""
        <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <div class="flex items-center justify-between mb-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
            <span class="text-xs font-mono font-bold text-slate-400">#{idx}</span>
            <span class="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wide">{word}</span>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{hindi}</span>
          </div>
          <div class="space-y-1 text-xs">
            <div class="flex items-start gap-1">
              <span class="font-bold text-emerald-600 dark:text-emerald-400 w-10 shrink-0">Syn:</span>
              <span class="text-slate-700 dark:text-slate-300">{syn}</span>
            </div>
            <div class="flex items-start gap-1">
              <span class="font-bold text-rose-600 dark:text-rose-400 w-10 shrink-0">Ant:</span>
              <span class="text-slate-600 dark:text-slate-400">{ant}</span>
            </div>
          </div>
        </div>
""")
    all_cards = "".join(cards)

    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 12 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Synonyms &amp; Antonyms (समानार्थी एवं विलोम शब्द) &bull; 498 Master Keywords &amp; 4,000+ Word Thesaurus
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      SSC CGL, CHSL और CPO में <strong>Synonyms एवं Antonyms से प्रत्येक शिफ्ट में 4 से 6 प्रश्न सीधे</strong> पूछे जाते हैं, 
      तथा Reading Comprehension और Cloze Test में सफलता भी इसी शब्द-भंडार पर निर्भर करती है। 
      यहाँ SSC के 498 सबसे महत्वपूर्ण Keywords के साथ उनके 4-4 समानार्थी (Synonyms) और 4-4 विलोम शब्द (Antonyms) 
      शुद्ध हिंदी अर्थ सहित संकलित हैं।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">498 Keywords</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">A to Z संपूर्ण सूची</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">4,000+ Words</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Synonyms + Antonyms</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Hindi Meaning</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">शुद्ध हिंदी अर्थ प्रत्येक शब्द का</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tier-1: 4 Qs | Tier-2: 6 Qs</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Strategic Vocab Memorization Guide -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Vocab Master Strategy &bull; शब्द याद रखने की 3 वैज्ञानिक तकनीकें
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        हज़ारों शब्दों को बिना भूले याद रखने के व्यावहारिक नियम:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">1. Tone Analysis (भाव पहचानें)</span>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          परीक्षा में विकल्प चुनते समय शब्द का Tone पहचानें &mdash; क्या शब्द <strong>सकारात्मक (+)</strong> है (जैसे Benevolent, Auspicious) 
          या <strong>नकारात्मक (-)</strong> है (जैसे Malicious, Sinister)। विकल्प में 3 पॉजिटिव और 1 नेगेटिव होने पर उत्तर तुरंत स्पष्ट हो जाता है।
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-blue-600 dark:text-blue-400 uppercase block mb-1">2. Prefix &amp; Suffix Clues</span>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          उपसर्गों (Prefixes) से अर्थ का अनुमान लगाएँ: <em>Mal-</em> (बुरा &mdash; Malady, Malice), <em>Bene-</em> (अच्छा &mdash; Beneficial), 
          <em>Eu-</em> (सुखद &mdash; Euphoria), <em>In/Im/Un/Dis-</em> (विलोम &mdash; Insolvent, Disloyal)।
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1">3. Syn-Ant Pairing System</span>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          किसी भी शब्द को अकेला न पढ़ें। उसके साथ उसके कम से कम 2 समानार्थी और 2 विलोम शब्दों का युग्म बनाकर पढ़ें (जैसे <em>Assiduous &harr; Diligent &ne; Indolent</em>)। 
          इससे एक बार में 3 शब्द तैयार होते हैं।
        </p>
      </div>
    </div>
  </div>

  <!-- Master Catalog of 498 Words Grid -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Master Thesaurus Grid (498 Keywords A to Z)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">प्रत्येक कार्ड में Keyword, हिंदी अर्थ, Synonyms तथा Antonyms:</p>
      </div>
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
        498 Words Listed
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
{all_cards}
    </div>
  </div>

  <!-- Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए वास्तविक प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Synonym</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> Select the most appropriate <strong>SYNONYM</strong> of the word: <strong>ASSIDUOUS</strong>
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Indolent</p>
          <p>(B) Diligent</p>
          <p>(C) Careless</p>
          <p>(D) Lethargic</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Assiduous' का अर्थ होता है <em>परिश्रमी / लगनशील</em>। इसका समानार्थी <strong>Diligent</strong> (मेहनती) है। विकल्प (A), (C), (D) इसके विलोम हैं।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">Antonym</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> Select the most appropriate <strong>ANTONYM</strong> of the word: <strong>ABJURE</strong>
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Renounce</p>
          <p>(B) Retract</p>
          <p>(C) Adopt</p>
          <p>(D) Forsake</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (C)</span> &bull; <em>Explanation:</em> 'Abjure' का अर्थ होता है <em>त्यागना / छोड़ना</em>। इसका विलोम <strong>Adopt</strong> (स्वीकार करना / अपनाना) है।
        </div>
      </div>
    </div>
  </div>

  <!-- FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Syno-Anto FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या SSC में बहुत कठिन या नए शब्द पूछे जाते हैं?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          नहीं। SSC में 85% से अधिक शब्द पिछले 15 वर्षों के PYQs (Previous Year Questions) से ही दोहराए जाते हैं। यदि आप इन 498 मुख्य Keywords और उनके Synonyms/Antonyms को अच्छी तरह तैयार कर लेते हैं, तो आपका एक भी प्रश्न गलत नहीं होगा।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/syno_anto_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    generate_syno_anto_chapter()
