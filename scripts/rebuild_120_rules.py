import fitz
import re
import os

def clean_hindi_text(t: str) -> str:
    t = t.replace('\x00', '')
    t = t.replace('चीज़ोंों', 'चीज़ों')
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def build_120_rules():
    doc = fitz.open('F:/ssc/eng notes/120 Rules of Grammar - Master Notes.pdf')
    full_text = '\n'.join(p.get_text() for p in doc)

    # Split by RULE \d+
    chunks = re.split(r'\n(?=RULE\s+\d+)', full_text)
    print(f"Total rule chunks in PDF: {len(chunks)}")

    rule_cards = []
    topics_count = {}

    for c in chunks:
        lines = [l.strip() for l in c.strip().splitlines() if l.strip()]
        if not lines or not lines[0].startswith("RULE"):
            continue

        rnum_m = re.match(r'^(RULE\s+\d+)', lines[0])
        rnum = rnum_m.group(1) if rnum_m else lines[0]

        rtitle = lines[1] if len(lines) > 1 else ""
        rtag = lines[2] if len(lines) > 2 and len(lines[2]) < 30 and not any(ch in lines[2] for ch in '।✗✓') else "Grammar Rule"

        # The rest of lines contain:
        # - Explanation lines (before ✗ or ✓ or TRICK)
        # - ✗ Incorrect lines
        # - ✓ Correct lines
        # - TRICK lines
        start_idx = 3 if rtag != "Grammar Rule" else 2
        body_lines = lines[start_idx:]

        expl_lines = []
        wrongs = []
        rights = []
        tricks = []

        current_mode = "expl"
        for line in body_lines:
            if line.startswith("✗"):
                current_mode = "wrong"
                wrongs.append(line[1:].strip())
            elif line.startswith("✓"):
                current_mode = "right"
                rights.append(line[1:].strip())
            elif line.startswith("TRICK:"):
                current_mode = "trick"
                tricks.append(line.replace("TRICK:", "").strip())
            elif current_mode == "wrong":
                wrongs[-1] += " " + line
            elif current_mode == "right":
                rights[-1] += " " + line
            elif current_mode == "trick":
                tricks[-1] += " " + line
            else:
                expl_lines.append(line)

        expl_text = clean_hindi_text(" ".join(expl_lines))
        topics_count[rtag] = topics_count.get(rtag, 0) + 1

        # Format wrong & right examples
        examples_html = ""
        if wrongs or rights:
            ex_items = []
            for w in wrongs:
                w_clean = clean_hindi_text(w)
                ex_items.append(f'''
            <div class="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl text-xs sm:text-sm">
              <span class="font-bold text-rose-700 flex items-center gap-1.5 mb-1">
                <span>❌ Incorrect (SSC Shift Trap):</span>
              </span>
              <p class="italic text-slate-800 font-medium">"{w_clean}"</p>
            </div>
''')
            for r in rights:
                r_clean = clean_hindi_text(r)
                ex_items.append(f'''
            <div class="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs sm:text-sm">
              <span class="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                <span>✅ Correct (Standard Form):</span>
              </span>
              <p class="italic text-slate-900 font-medium">"{r_clean}"</p>
            </div>
''')
            examples_html = f'''
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
          {"".join(ex_items)}
        </div>
'''

        # Format trick
        trick_html = ""
        if tricks:
            trick_text = clean_hindi_text(" ".join(tricks))
            trick_html = f'''
        <div class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-amber-950 font-medium">
          <strong class="text-amber-800 block mb-1">💡 SSC Exam Memory Trick (याद रखने का तरीका):</strong>
          {trick_text}
        </div>
'''

        rule_cards.append(f'''
    <!-- {rnum} Card -->
    <div id="{rnum.lower().replace(" ", "-")}" class="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all mb-6">
      <div class="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <span class="px-3 py-1 text-xs font-black bg-indigo-600 text-white rounded-lg tracking-wider">{rnum}</span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{rtitle}</h3>
        </div>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-full">{rtag}</span>
      </div>

      <!-- Explanation -->
      <div class="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl mb-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
        <strong class="text-indigo-900 block mb-1">📖 नियम की व्याख्या (Core Explanation):</strong>
        {expl_text}
      </div>

      <!-- Examples (Incorrect vs Correct) -->
      {examples_html}

      <!-- Exam Trick -->
      {trick_html}
    </div>
''')

    body_html = "\n".join(rule_cards)

    full_html = f"""<div class="space-y-8">
  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 p-6 md:p-8 rounded-2xl border border-indigo-200/70 shadow-xs">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-xs">
        Chapter 14 &bull; SSC English Master Grammar
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      120 Rules of English Grammar (व्याकरण के 120 स्वर्णिम नियम) &bull; Master Compendium
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      ये 120 नियम SSC CGL, CHSL, CPO और MTS की संपूर्ण अंग्रेजी व्याकरण का निचोड़ हैं। 
      प्रत्येक नियम में <strong>नियम की व्याख्या, ❌ परीक्षा में आने वाला अशुद्ध वाक्य (Trap), ✅ शुद्ध मानक वाक्य</strong> तथा 
      <strong>💡 Exam Memory Trick</strong> शामिल है। यदि आप इन 120 नियमों को आत्मसात कर लेते हैं, तो 
      <strong>Spotting the Error और Sentence Improvement</strong> में शत-प्रतिशत अंक प्राप्त करना सुनिश्चित है।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">120 Rules</span>
        <span class="text-xs font-semibold text-slate-600">Complete Master List</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">❌ vs ✅</span>
        <span class="text-xs font-semibold text-slate-600">Real Exam Sentences</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Memory Tricks</span>
        <span class="text-xs font-semibold text-slate-600">शॉर्टकट युक्तियाँ</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">100% Error-Free</span>
        <span class="text-xs font-semibold text-slate-600">शुद्ध हिंदी + अंग्रेजी</span>
      </div>
    </div>
  </div>

  <!-- Rules Directory -->
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">120 Rules of English Grammar (नियम 1 से 120)</h2>
      <span class="text-xs font-semibold text-slate-500">120 Master Rules with Examples &amp; Tricks</span>
    </div>

{body_html}
  </div>
</div>"""

    return full_html

if __name__ == '__main__':
    html = build_120_rules()
    out_path = "scripts/scratch/120_rules_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully rebuilt {out_path} with all 120 rules, examples, and tricks! (Length: {len(html)})")
