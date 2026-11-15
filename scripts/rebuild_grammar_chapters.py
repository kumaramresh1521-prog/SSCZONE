import re
import os
import json

def clean_hindi(t: str) -> str:
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
        (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"), ("मु  ल", "मुश्किल"),
        ("अ धक", "अधिक"), ("अधक", "अधिक"), ("अ तरेक", "अतिरेक"),
        (" शक्षक", " शिक्षक"), ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"),
        (" ज़ ी", "ज़िद्दी"), ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"),
        (" नयम", "नियम"), ("कं ठस्थ", "कंठस्थ"), ("महत्वपूण ", "महत्वपूर्ण "),
        ("चूँ क", "चूँकि"), ("यहैं", "यह"), ("नह ", "नहीं "), ("नहैं", "नहीं"),
        ("मलना", "मिलना"), ("मुल", "मुश्किल"), ("कमर्म", "कर्म"), ("किरता", "करता"),
        ("किारण", "कारण"), ("किे", "के"), ("किा", "का"), ("किी", "की"),
        ("किो", "को"), ("स र्ता", "सिर्फ"), ("सवर्तानाम", "सर्वनाम"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

# Helper to format clean rule card
def make_rule_card(num_str, title, tag, eng_rule, hi_expl, formula, wrongs_and_rights, trap_note=None):
    ex_html = ""
    if wrongs_and_rights:
        items = []
        for w, w_reason, r, r_reason in wrongs_and_rights:
            items.append(f"""
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2.5">
          <div class="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl text-xs sm:text-sm">
            <span class="font-bold text-rose-700 flex items-center gap-1.5 mb-1">
              <span>❌ Incorrect (SSC Shift Trap):</span>
            </span>
            <p class="italic text-slate-800 font-medium">"{w}"</p>
            {f'<span class="text-[11px] text-rose-600 font-semibold block mt-1">कारण: {w_reason}</span>' if w_reason else ''}
          </div>
          <div class="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs sm:text-sm">
            <span class="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
              <span>✅ Correct (Standard Form):</span>
            </span>
            <p class="italic text-slate-900 font-medium">"{r}"</p>
            {f'<span class="text-[11px] text-emerald-700 font-semibold block mt-1">कारण: {r_reason}</span>' if r_reason else ''}
          </div>
        </div>
""")
        ex_html = "".join(items)

    formula_html = f"""
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-indigo-950 font-bold mb-3.5">
        Formula: {formula}
      </div>
""" if formula else ""

    trap_html = f"""
      <div class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-amber-950 font-medium">
        <strong class="text-amber-800 block mb-1">🎯 SSC Exam Trap (सावधानी):</strong>
        {trap_note}
      </div>
""" if trap_note else ""

    return f"""
    <!-- {num_str} -->
    <div class="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs mb-6 hover:border-indigo-300 transition-all">
      <div class="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <span class="px-3 py-1 text-xs font-black bg-indigo-600 text-white rounded-lg tracking-wider">{num_str}</span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-full">{tag}</span>
      </div>

      <!-- English Rule -->
      <div class="mb-3">
        <p class="text-xs sm:text-sm md:text-base text-slate-800 leading-relaxed font-medium">
          {eng_rule}
        </p>
      </div>

      <!-- Hindi Explanation -->
      <div class="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl mb-3.5 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
        <strong class="text-emerald-800 block mb-1">💡 सरल हिंदी में समझें (Key Concept):</strong>
        {hi_expl}
      </div>

      {formula_html}
      {ex_html}
      {trap_html}
    </div>
"""

print("Defined helper make_rule_card.")
