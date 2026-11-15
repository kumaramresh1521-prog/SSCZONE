# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for One Word Substitution (OWS).
Parses all 500+ OWS entries across all 13 categories from PDF raw text,
cleans Hindi OCR ligatures, and adds a high-yield Root Words Guide.
"""

import re
import os

hindi_clean_map = {
    " ेज़ल": "फ्रेजल", " ह दी म  ": "हिंदी में", " ह दी": "हिंदी", "म  ": "में ", "म ": "में ",
    " जके ": "जिसके ", " जसे ": "जिससे ", " जने ": "जिसने ", " जका ": "जिसका ", " जस ": "जिस ",
    "अथ ": "अर्थ", "ह  ": "हैं ", "ह ": "हैं ", "कु शल": "कुशल", "तु ारे": "तुम्हारे",
    "तु ारा": "तुम्हारा", "तु ारी": "तुम्हारी", " म  ": " में ", " मला": " मिला", " मली": " मिली",
    " मले": " मिले", " कया": " किया", " कए": " किए", " क": " कि", "क ": "की ", "आदत ": "आदतों ",
    "पुर ार": "पुरस्कार", "प्र तयो गता": "प्रतियोगिता", "सम ा": "समस्या", "संबं धत": "संबंधित",
    "तक  ": "तर्क ", "समथ न": "समर्थन", " व ास": "विश्वास", "कया": "किया", "प रवार": "परिवार",
    "व्यव स्थत": "व्यवस्थित", "नज़दीक ": "नज़दीकी", "स्वाथ  ": "स्वार्थी", " नकले": "निकले",
    " नरीक्षण": "निरीक्षण", "पूव ": "पूर्व", "संध्या": "संध्या", "ज़हर": "ज़हर", "अ स्तत्व": "अस्तित्व",
    " न  त": "निश्चित", " दूसर ": "दूसरों ", " च ता": "चिंता", " बना": "बिना", " लए": "लिए",
    " दोन ": "दोनों ", " हाथ ": "हाथों ", " शां त": "शांति", " व्यव ा": "व्यवस्था", " धम ": "धर्म",
    " पक्ष ": "पक्षों ", "  ारा": " द्वारा", " ववाद": "विवाद", " नयुक्त": "नियुक्त", " वश्वास": "विश्वास",
    " कज़ ": "कर्ज़", " असमथ ": "असमर्थ", " धा म क": "धार्मिक", " मामल ": "मामलों ", " अ त": "अति",
    "उ ाही": "उत्साही", "नह ": "नहीं", "नह  ": "नहीं ", "प्र त ापन": "प्रतिस्थापन",
    "सं क्षप्त": "संक्षिप्त", "महत्वपूण ": "महत्वपूर्ण", "भू मका": "भूमिका", " नभाते": "निभाते"
}

def clean_text(t):
    for k, v in hindi_clean_map.items():
        t = t.replace(k, v)
    return t

def parse_ows():
    raw_path = "scripts/scratch/ows_raw.txt"
    with open(raw_path, "r", encoding="utf-8") as f:
        text = f.read().replace('\x00', '')

    # Normalize special private use bracket characters
    text = text.replace('', '(').replace('', ')').replace('ʼ', "'")

    # Split by (A) through (M)
    sections = re.split(r'\(([A-M])\)\s+([^\n]+)', text)
    
    parsed_sections = []
    for i in range(1, len(sections), 3):
        letter = sections[i]
        title = clean_text(sections[i+1].strip())
        body = sections[i+2]
        
        # parse numbered rows
        # Pattern: \n(\d+)\s+([A-Z][a-zA-Z\s\(\)\-\'\’]+?)\s+([a-z].*?)(?=\n\d+\s+[A-Z]|\Z)
        entries = re.findall(r'\n(\d+)\s+([A-Z][a-zA-Z\s\(\)\-\'\’]+?)\s+([a-z].*?)(?=\n\d+\s+[A-Z]|\Z)', body, re.DOTALL)
        if entries:
            clean_entries = []
            for num, word, desc in entries:
                clean_entries.append((num.strip(), word.strip(), clean_text(" ".join(desc.split()))))
            parsed_sections.append((letter, title, clean_entries))

    print(f"Parsed {len(parsed_sections)} sections with total {sum(len(e) for _, _, e in parsed_sections)} words.")
    return parsed_sections

def generate_ows_chapter():
    sections = parse_ows()
    
    sec_html_blocks = []
    for letter, title, entries in sections:
        rows = []
        for num, word, desc in entries:
            rows.append(f"""
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="p-2.5 font-mono text-xs font-bold text-slate-400 w-10">{num}</td>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400 w-1/4">{word}</td>
              <td class="p-2.5 text-slate-700 dark:text-slate-300 text-xs md:text-sm">{desc}</td>
            </tr>
""")
        table_rows = "".join(rows)
        
        block = f"""
      <div id="section-{letter.lower()}" class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-black">{letter}</span>
            {title}
          </h3>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{len(entries)} Words</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th class="p-2.5 font-bold">#</th>
                <th class="p-2.5 font-bold">Word</th>
                <th class="p-2.5 font-bold">Meaning in English &amp; Hindi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
{table_rows}
            </tbody>
          </table>
        </div>
      </div>
"""
        sec_html_blocks.append(block)

    all_sections_html = "\n".join(sec_html_blocks)

    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 10 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      One Word Substitution (एक शब्द प्रतिस्थापन) &bull; 500+ Category-Wise Master Compendium
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      One Word Substitution (अनेक शब्दों के लिए एक शब्द) किसी वाक्यांश, व्यक्ति, स्थान, व्यवसाय, व्यवस्था या मनोदशा के लिए 
      प्रयुक्त होने वाला एक संक्षिप्त और प्रभावशाली शब्द है। SSC CGL Tier-1 और Tier-2 में 
      <strong>One Word Substitution से 3 से 5 प्रश्न सीधे पूछे जाते हैं</strong>। 
      यहाँ सभी शब्दों को 13 प्रामाणिक श्रेणियों (Categories) में वर्गीकृत करके हिंदी अर्थ सहित प्रस्तुत किया गया है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">500+ Words</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">13 श्रेणियाँ (Categories)</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Root Words</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">-cide, -cracy, -phobia, -phil</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Bilingual</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">शुद्ध मानक हिंदी व्याख्या</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Exam Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tier-1: 2 Qs | Tier-2: 3-4 Qs</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Master Root Words Formula Guide -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Root Words Formula Card (मूल शब्द तकनीक &mdash; एक से अनेक शब्द)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        रटने के बजाय Root Words को समझें &mdash; एक उपसर्ग/प्रत्यय से दर्जनों शब्द स्वतः याद हो जाते हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-rose-600 dark:text-rose-400 text-sm block mb-1">-CIDE (Killing / हत्या)</span>
        <p class="text-slate-600 dark:text-slate-400">
          &bull; <strong>Patricide:</strong> पिता की हत्या<br>
          &bull; <strong>Matricide:</strong> माता की हत्या<br>
          &bull; <strong>Fratricide:</strong> भाई की हत्या<br>
          &bull; <strong>Regicide:</strong> राजा की हत्या
        </p>
      </div>

      <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-blue-600 dark:text-blue-400 text-sm block mb-1">-CRACY (Government / शासन)</span>
        <p class="text-slate-600 dark:text-slate-400">
          &bull; <strong>Democracy:</strong> जनता का शासन<br>
          &bull; <strong>Plutocracy:</strong> अमीरों का शासन<br>
          &bull; <strong>Theocracy:</strong> धर्मगुरुओं का शासन<br>
          &bull; <strong>Bureaucracy:</strong> अधिकारियों का शासन
        </p>
      </div>

      <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-amber-600 dark:text-amber-400 text-sm block mb-1">-PHOBIA (Fear / भय)</span>
        <p class="text-slate-600 dark:text-slate-400">
          &bull; <strong>Acrophobia:</strong> ऊँचाई का डर<br>
          &bull; <strong>Claustrophobia:</strong> बंद जगहों का डर<br>
          &bull; <strong>Hydrophobia:</strong> पानी का डर<br>
          &bull; <strong>Agoraphobia:</strong> खुली भीड़भाड़ का डर
        </p>
      </div>

      <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">-PHIL / -MIS (प्रेम / घृणा)</span>
        <p class="text-slate-600 dark:text-slate-400">
          &bull; <strong>Philanthropist:</strong> मानव प्रेमी<br>
          &bull; <strong>Bibliophile:</strong> पुस्तक प्रेमी<br>
          &bull; <strong>Misanthrope:</strong> मानव द्वेषी<br>
          &bull; <strong>Misogynist:</strong> स्त्री द्वेषी
        </p>
      </div>
    </div>
  </div>

  <!-- Section 2: All 13 Categorized OWS Sections -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        Category-Wise One Word Substitution Compendium (13 श्रेणियाँ)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        विषयवार सभी महत्वपूर्ण शब्दों की संपूर्ण प्रामाणिक सूची:
      </p>
    </div>

    <div class="space-y-6">
{all_sections_html}
    </div>
  </div>

  <!-- Section 3: Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए One Word Substitution प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Person Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> One who can use either hand with equal ease:
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Ambivalent</p>
          <p>(B) Ambidexterous</p>
          <p>(C) Ambiguous</p>
          <p>(D) Amateur</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> जो दोनों हाथों से समान कुशलता से काम कर सके, उसे <strong>Ambidexterous</strong> (सव्यसाची) कहते हैं।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Place Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> A place where bees are kept:
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Aviary</p>
          <p>(B) Apiary</p>
          <p>(C) Aquarium</p>
          <p>(D) Archive</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> मधुमक्खियों के पालने का स्थान <strong>Apiary</strong> (Apis = bee) कहलाता है। पक्षियों के रखने का स्थान Aviary कहलाता है।
        </div>
      </div>
    </div>
  </div>

  <!-- FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (OWS FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. One Word Substitution में सर्वाधिक स्कोर कैसे करें?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          OWS के 70% प्रश्न Root Words पर आधारित होते हैं। सबसे पहले Section (A) Persons, (E) Government, (F) Killings और (K) Phobias को अच्छी तरह तैयार करें।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/ows_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    generate_ows_chapter()
