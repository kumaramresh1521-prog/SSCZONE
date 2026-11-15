import json
import os
from datetime import datetime

NOTES_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "chapter_notes.json")

# SVG 1: Animal Cell vs Plant Cell Architecture
svg_cell_comparison = """
<div style="margin: 28px 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 24px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
  <div style="text-align: center; margin-bottom: 18px;">
    <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.3);">Microscopic Architecture • सूक्ष्मदर्शीय संरचना</span>
    <h3 style="color: #f8fafc; font-size: 20px; font-weight: 800; margin: 8px 0 4px 0;">Animal Cell vs. Plant Cell Comparison</h3>
    <p style="color: #94a3b8; font-size: 13px; margin: 0;">जंतु कोशिका बनाम पादप कोशिका: तुलनात्मक चित्र एवं प्रमुख कोशिकांग</p>
  </div>
  
  <svg viewBox="0 0 900 480" width="100%" height="auto" style="display: block; max-width: 100%; border-radius: 12px; overflow: hidden;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="animalBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
        <stop offset="85%" stop-color="#1e3a8a" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#1e40af" stop-opacity="0.4"/>
      </radialGradient>
      <radialGradient id="plantBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
        <stop offset="85%" stop-color="#064e3b" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#047857" stop-opacity="0.4"/>
      </radialGradient>
      <radialGradient id="nucleusGrad" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#6b21a8"/>
      </radialGradient>
      <radialGradient id="vacuoleGrad" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.75"/>
      </radialGradient>
      <linearGradient id="chloroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#c2410c"/>
      </linearGradient>
    </defs>

    <!-- LEFT PANEL: ANIMAL CELL -->
    <g transform="translate(40, 20)">
      <rect x="0" y="0" width="380" height="430" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <rect x="20" y="16" width="130" height="28" rx="6" fill="#1e3a8a" opacity="0.6"/>
      <text x="85" y="35" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">ANIMAL CELL</text>
      <text x="85" y="54" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">जंतु कोशिका (Flexible & Round)</text>

      <path d="M 190,80 C 290,75 350,140 345,240 C 340,330 270,390 190,385 C 100,380 45,320 50,220 C 55,130 110,85 190,80 Z" fill="url(#animalBg)" stroke="#60a5fa" stroke-width="3"/>

      <circle cx="190" cy="225" r="48" fill="url(#nucleusGrad)" stroke="#c084fc" stroke-width="2.5"/>
      <circle cx="185" cy="220" r="16" fill="#f3e8ff" opacity="0.9"/>
      <text x="190" y="285" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Nucleus (केंद्रक)</text>

      <g transform="translate(100, 140) rotate(-25)">
        <rect x="0" y="0" width="46" height="24" rx="12" fill="url(#mitoGrad)" stroke="#fb923c" stroke-width="1.5"/>
        <path d="M 8,12 Q 14,5 20,12 T 32,12 T 40,12" fill="none" stroke="#fed7aa" stroke-width="2"/>
      </g>
      <text x="120" y="180" fill="#fdba74" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Mitochondria (पावरहाउस)</text>

      <g transform="translate(265, 290) rotate(35)">
        <rect x="0" y="0" width="44" height="22" rx="11" fill="url(#mitoGrad)" stroke="#fb923c" stroke-width="1.5"/>
        <path d="M 8,11 Q 14,4 20,11 T 30,11 T 38,11" fill="none" stroke="#fed7aa" stroke-width="2"/>
      </g>

      <path d="M 230,195 Q 265,185 270,210 Q 275,235 240,235" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 235,180 Q 285,170 290,205 Q 295,245 245,250" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <text x="275" y="165" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Endoplasmic Reticulum</text>

      <path d="M 125,295 Q 165,310 170,290" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 120,305 Q 165,325 175,302" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/>
      <text x="110" y="340" fill="#fde047" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Golgi Body (गॉल्जी काय)</text>

      <g transform="translate(255, 120)">
        <rect x="0" y="0" width="7" height="18" rx="2" fill="#ec4899"/>
        <rect x="5" y="8" width="18" height="7" rx="2" fill="#ec4899"/>
        <text x="32" y="14" fill="#f472b6" font-family="system-ui, sans-serif" font-size="11" font-weight="800">Centrosome ⭐</text>
        <text x="32" y="26" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9">(तारककाय - केवल जंतु)</text>
      </g>

      <circle cx="100" cy="245" r="10" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <circle cx="120" cy="235" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="65" y="270" fill="#f87171" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Lysosome (आत्मघाती थैली)</text>
    </g>

    <!-- RIGHT PANEL: PLANT CELL -->
    <g transform="translate(480, 20)">
      <rect x="0" y="0" width="380" height="430" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <rect x="20" y="16" width="130" height="28" rx="6" fill="#065f46" opacity="0.6"/>
      <text x="85" y="35" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">PLANT CELL</text>
      <text x="85" y="54" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">पादप कोशिका (Rigid & Rectangular)</text>

      <polygon points="60,90 320,80 345,360 85,385 45,230" fill="none" stroke="#10b981" stroke-width="7" stroke-linejoin="round"/>
      <polygon points="65,96 315,86 339,354 89,378 51,228" fill="url(#plantBg)" stroke="#34d399" stroke-width="2" stroke-linejoin="round"/>

      <path d="M 120,170 C 230,140 270,180 260,280 C 250,335 170,350 125,320 C 95,290 80,210 120,170 Z" fill="url(#vacuoleGrad)" stroke="#38bdf8" stroke-width="2"/>
      <text x="180" y="245" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="800" text-anchor="middle">Large Central Vacuole</text>
      <text x="180" y="262" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle">विशाल केंद्रीय रसधानी (Tonoplast)</text>

      <g transform="translate(85, 115) rotate(15)">
        <rect x="0" y="0" width="46" height="26" rx="13" fill="url(#chloroGrad)" stroke="#4ade80" stroke-width="1.5"/>
        <line x1="12" y1="6" x2="12" y2="20" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="23" y1="6" x2="23" y2="20" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="34" y1="6" x2="34" y2="20" stroke="#bbf7d0" stroke-width="2"/>
      </g>
      <text x="75" y="158" fill="#4ade80" font-family="system-ui, sans-serif" font-size="10" font-weight="800">Chloroplast ⭐</text>
      <text x="75" y="169" fill="#86efac" font-family="system-ui, sans-serif" font-size="9">(हरितलवक - प्रकाश संश्लेषण)</text>

      <circle cx="280" cy="140" r="38" fill="url(#nucleusGrad)" stroke="#c084fc" stroke-width="2"/>
      <circle cx="275" cy="135" r="12" fill="#f3e8ff" opacity="0.9"/>
      <text x="280" y="190" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Nucleus (परिधीय केंद्रक)</text>

      <line x1="320" y1="80" x2="355" y2="60" stroke="#10b981" stroke-width="1.5"/>
      <text x="355" y="55" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="800">Cell Wall (कोशिका भित्ति) ⭐</text>
      <text x="355" y="68" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="9">Cellulose & Pectin निर्मित</text>
    </g>
  </svg>
</div>
"""

# SVG 2: Cell Cycle & Mitosis Flowchart
svg_cell_cycle = """
<div style="margin: 28px 0; background: linear-gradient(135deg, #090d16 0%, #111827 100%); border-radius: 16px; padding: 24px; border: 1px solid #1f2937; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
  <div style="text-align: center; margin-bottom: 18px;">
    <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(168, 85, 247, 0.3);">Cell Division Flowchart • कोशिका चक्र आरेख</span>
    <h3 style="color: #f8fafc; font-size: 20px; font-weight: 800; margin: 8px 0 4px 0;">The Eukaryotic Cell Cycle & Mitosis Stages</h3>
    <p style="color: #9ca3af; font-size: 13px; margin: 0;">Interphase (95% Duration) ➔ Prophase ➔ Metaphase ➔ Anaphase ➔ Telophase</p>
  </div>

  <svg viewBox="0 0 880 380" width="100%" height="auto" style="display: block; max-width: 100%; border-radius: 12px;" xmlns="http://www.w3.org/2000/svg">
    <!-- LEFT: Interphase Circle -->
    <g transform="translate(140, 180)">
      <circle cx="0" cy="0" r="110" fill="none" stroke="#1f2937" stroke-width="36"/>
      <path d="M 0,-110 A 110,110 0 0,1 104,35" fill="none" stroke="#3b82f6" stroke-width="32"/>
      <path d="M 104,35 A 110,110 0 0,1 -65,88" fill="none" stroke="#a855f7" stroke-width="32"/>
      <path d="M -65,88 A 110,110 0 0,1 -105,-35" fill="none" stroke="#10b981" stroke-width="32"/>
      <path d="M -105,-35 A 110,110 0 0,1 0,-110" fill="none" stroke="#f43f5e" stroke-width="38"/>

      <circle cx="0" cy="0" r="75" fill="#0f172a"/>
      <text x="0" y="-12" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="800" text-anchor="middle">INTERPHASE</text>
      <text x="0" y="8" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">अंतरावस्था (95% time)</text>

      <text x="70" y="-45" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="13" font-weight="800">G₁ Phase</text>
      <text x="70" y="-30" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9">Cell Growth</text>

      <text x="35" y="80" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="13" font-weight="800">S Phase ⭐</text>
      <text x="35" y="95" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="9">DNA Replication</text>

      <text x="-95" y="45" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="13" font-weight="800">G₂ Phase</text>
      <text x="-95" y="60" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="9">Protein Synth.</text>

      <text x="-75" y="-85" fill="#fda4af" font-family="system-ui, sans-serif" font-size="13" font-weight="800">M Phase</text>
      <text x="-75" y="-72" fill="#fecdd3" font-family="system-ui, sans-serif" font-size="9">Division (5%)</text>
    </g>

    <!-- RIGHT: 4 Stages of Mitosis -->
    <g transform="translate(320, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#2563eb"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">1. PROPHASE</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="3,3"/>
      <path d="M 50,60 L 74,80 M 74,60 L 50,80" stroke="#f43f5e" stroke-width="2.5"/>
      <text x="62" y="115" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">पूर्वावस्था</text>
      <text x="62" y="127" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">Chromosomes Condense</text>
    </g>

    <polygon points="468,112 462,108 462,116" fill="#60a5fa"/>

    <g transform="translate(475, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#7c3aed"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">2. METAPHASE ⭐</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
      <line x1="62" y1="42" x2="62" y2="98" stroke="#e9d5ff" stroke-width="1" stroke-dasharray="2,2"/>
      <rect x="54" y="55" width="16" height="6" rx="2" fill="#ec4899"/>
      <rect x="54" y="67" width="16" height="6" rx="2" fill="#38bdf8"/>
      <rect x="54" y="79" width="16" height="6" rx="2" fill="#f59e0b"/>
      <text x="62" y="115" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">मध्यावस्था</text>
      <text x="62" y="127" fill="#c084fc" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">Equatorial Alignment</text>
    </g>

    <polygon points="623,112 617,108 617,116" fill="#a855f7"/>

    <g transform="translate(630, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#eab308" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#ca8a04"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">3. ANAPHASE</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#facc15" stroke-width="1.5"/>
      <path d="M 45,58 L 40,65 L 45,72" fill="none" stroke="#ec4899" stroke-width="2.5"/>
      <path d="M 79,58 L 84,65 L 79,72" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="62" y="115" fill="#fef08a" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">पश्चावस्था</text>
      <text x="62" y="127" fill="#ca8a04" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">Chromatids Separate</text>
    </g>

    <g transform="translate(475, 210)">
      <rect x="0" y="0" width="280" height="145" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <rect x="0" y="0" width="280" height="28" rx="12" fill="#059669"/>
      <text x="140" y="19" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle">4. TELOPHASE & CYTOKINESIS (अंत्यावस्था)</text>
      <circle cx="95" cy="80" r="26" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
      <circle cx="185" cy="80" r="26" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
      <text x="140" y="122" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Furrow (Animal) / Cell Plate (Plant)</text>
      <text x="140" y="136" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Output: 2 Identical (2n) Daughter Cells</text>
    </g>

    <g transform="translate(320, 210)">
      <rect x="0" y="0" width="140" height="145" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
      <text x="70" y="24" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">⚡ MEIOSIS HIGHLIGHT</text>
      <text x="70" y="44" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Pachytene Stage:</text>
      <text x="70" y="60" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Crossing Over (जीन विनिमय)</text>
      <text x="70" y="74" fill="#818cf8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">Recombinase Enzyme</text>
      
      <line x1="15" y1="85" x2="125" y2="85" stroke="#4338ca"/>

      <text x="70" y="102" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Diplotene Stage:</text>
      <text x="70" y="118" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Chiasmata Formation</text>
      <text x="70" y="132" fill="#818cf8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">X-Shaped Contacts</text>
    </g>
  </svg>
</div>
"""

# HTML Content of the note with independent .lang-en and .lang-hi blocks
content_html_raw = """
<div class="note-intro-card">
  <h3>⚡ Chapter Quick Crux & Exam Value (अध्याय का त्वरित सार एवं परीक्षा महत्ता)</h3>
  <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 16px 0;">
    <span style="background: #eff6ff; color: #1d4ed8; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">🎯 Target Exams: SSC CGL, CHSL, CPO, Railway RRB NTPC, State PCS, CDS</span>
    <span style="background: #ecfdf5; color: #047857; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">📊 Exam Weightage: 2 to 3 Direct MCQs (4 to 6 Marks Guaranteed)</span>
    <span style="background: #fef3c7; color: #b45309; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fde68a;">⏱️ Revision Duration: 12–15 Minutes</span>
  </div>

  <div class="lang-en">
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
      <strong>Core Exam Insight:</strong> Cell Biology (Cytology) forms the foundational bedrock of General Science in every competitive examination. This chapter directly yields scoring questions from historical cell discoveries, organelle nicknames (Powerhouse, Suicide Bags, Protein Factory), comparisons between plant and animal cells, and cell cycle stages (Mitosis & Meiosis). You can toggle between <strong>English</strong>, <strong>हिंदी</strong>, or <strong>Bilingual</strong> using the language switcher at the top.
    </p>
  </div>

  <div class="lang-hi">
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
      <strong>परीक्षा का मूल मंत्र:</strong> कोशिका जीव विज्ञान (Cytology) सामान्य विज्ञान का सर्वाधिक स्कोरिंग अध्याय है। इसमें से हर सरकारी परीक्षा में खोजकर्ताओं, प्रमुख कोशिकांगों के उपनामों (पावरहाउस, आत्मघाती थैली, प्रोटीन फैक्ट्री), पादप व जंतु कोशिका में अंतर तथा समसूत्री व अर्धसूत्री विभाजन (Mitosis & Meiosis) के चरणों से सीधे 2-3 प्रश्न आते हैं। आप ऊपर दिए गए स्विच से <strong>English</strong>, <strong>हिंदी</strong> या <strong>Bilingual</strong> चुन सकते हैं।
    </p>
  </div>
</div>

<h2>1. The Cell: Fundamental Unit of Life (कोशिका: जीवन की मौलिक इकाई)</h2>

<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Master Notes</span>
    <p>A <strong>Cell</strong> is the fundamental structural, functional, and biological unit of all living organisms. It is the smallest entity capable of independent existence and executing essential life processes such as metabolism, respiration, and self-replication.</p>
    
    <p><strong>Historical Discoveries (Exam High-Yield):</strong></p>
    <ul>
      <li><strong>Robert Hooke (1665):</strong> First observed dead cork cells under a primitive compound microscope and coined the term <em>"Cell"</em> (from Latin <em>cellula</em> meaning 'little room'). Published his findings in his landmark book <em>Micrographia</em>.</li>
      <li><strong>Antonie van Leeuwenhoek (1674):</strong> First to observe and describe <strong>living cells</strong> (bacteria, protozoa, red blood cells, and human spermatozoa) using handcrafted high-magnification lenses. Universally recognized as the <em>Father of Microbiology</em>.</li>
      <li><strong>Robert Brown (1831):</strong> Discovered and named the <strong>Nucleus</strong> within plant orchid cells.</li>
      <li><strong>J. E. Purkinje (1839):</strong> Coined the term <strong>Protoplasm</strong> for the living fluid substance of the cell. Biologist T. H. Huxley famously termed Protoplasm as the <em>"Physical Basis of Life"</em>.</li>
    </ul>

    <p><strong>The Cell Theory:</strong></p>
    <p>Formulated in 1838–1839 by German botanist <strong>Matthias Schleiden</strong> and German zoologist <strong>Theodor Schwann</strong>:</p>
    <ol>
      <li>All living organisms are composed of one or more cells.</li>
      <li>The cell is the basic structural and functional unit of life.</li>
    </ol>
    <p>In 1855, German pathologist <strong>Rudolf Virchow</strong> completed the theory with the famous principle: <strong style="color: #2563eb;">"Omnis cellula-e-cellula"</strong> — meaning <em>"All cells arise only from pre-existing cells through cell division."</em></p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी सार</span>
    <p><strong>कोशिका (Cell)</strong> सभी सजीवों के शरीर की सबसे छोटी <em>संरचनात्मक (Structural)</em> और <em>कार्यात्मक (Functional)</em> इकाई है। यह स्वतंत्र रूप से जीवित रहकर जीवन की समस्त आवश्यक क्रियाएं (पोषण, श्वसन, उत्सर्जन, वृद्धि) संपन्न करने में सक्षम होती है।</p>
    
    <p><strong>प्रमुख ऐतिहासिक खोजें (सीधे परीक्षा प्रश्न):</strong></p>
    <ul>
      <li><strong>रॉबर्ट हुक (1665):</strong> पेड़ की छाल (कॉर्क) में सर्वप्रथम मृत कोशिकाओं को देखा और उन्हें <em>"Cell"</em> (छोटा कमरा) नाम दिया। इनकी प्रसिद्ध पुस्तक का नाम <strong>Micrographia</strong> है।</li>
      <li><strong>एंटनी वॉन ल्यूवेनहॉक (1674):</strong> स्वनिर्मित सूक्ष्मदर्शी द्वारा सर्वप्रथम <strong>जीवित कोशिका (Live Cell)</strong> (जीवाणु, प्रोटोजोआ, शुक्राणु, RBC) को देखा। इन्हें <em>'सूक्ष्म जीव विज्ञान का पिता' (Father of Microbiology)</em> कहा जाता है।</li>
      <li><strong>रॉबर्ट ब्राउन (1831):</strong> आर्किड पौधे की कोशिकाओं में सर्वप्रथम <strong>केंद्रक (Nucleus)</strong> की खोज की।</li>
      <li><strong>जे. ई. पुरकिंजे (1839):</strong> कोशिका के भीतर उपस्थित तरल सजीव द्रव्य को <strong>जीवद्रव्य (Protoplasm)</strong> नाम दिया। वैज्ञानिक हक्सले ने जीवद्रव्य को <em>"जीवन का भौतिक आधार" (Physical Basis of Life)</em> कहा।</li>
    </ul>

    <p><strong>कोशिका सिद्धांत (Cell Theory):</strong></p>
    <p>1838–1839 में वनस्पतिशास्त्री <strong>मथायस श्लीडेन</strong> तथा जंतुविज्ञानी <strong>थियोडोर श्वान</strong> ने दिया कि सभी जीव कोशिकाओं और उनके उत्पादों से बने हैं।</p>
    <p>1855 में <strong>रुडोल्फ विरचो</strong> ने सिद्धांत को अंतिम रूप देते हुए कहा: <strong style="color: #059669;">"Omnis cellula-e-cellula"</strong> — अर्थात <em>"सभी नई कोशिकाएं पहले से मौजूद कोशिकाओं के विभाजन से ही पैदा होती हैं।"</em></p>
  </div>
</div>

<div class="callout-box alert">
  <p><strong>🔥 Crucial Exam Exception / परीक्षा अपवाद:</strong> <br/>
  <strong>Viruses (विषाणु), Viroids, and Prions</strong> are an exception to the Cell Theory because they lack cellular organization, cytoplasm, and independent metabolic machinery outside a living host!</p>
</div>

<h2>2. Cell Dimensions & Extremes (आकार और परिमाप के रिकॉर्ड)</h2>

<p class="lang-en">Government examinations consistently test these standard dimensional benchmarks across the biological world:</p>
<p class="lang-hi">प्रतियोगी परीक्षाओं में कोशिकाओं के आकार और माप से जुड़े निम्नलिखित तथ्य बार-बार पूछे जाते हैं:</p>

<table class="notes-table">
  <thead>
    <tr>
      <th>Category (श्रेणी)</th>
      <th>Record Holder (विश्व रिकॉर्ड धारक)</th>
      <th>Dimension / Exam Note (महत्वपूर्ण तथ्य)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Smallest Cell on Earth (सबसे छोटी कोशिका)</strong></td>
      <td><em>Mycoplasma gallisepticum</em> (PPLO)</td>
      <td><strong>0.1 to 0.3 μm</strong> (Lacks a cell wall; resistant to penicillin antibiotics)</td>
    </tr>
    <tr>
      <td><strong>Largest Single Cell on Earth (सबसे बड़ी कोशिका)</strong></td>
      <td>Ostrich Egg (शुतुरमुर्ग का अंडा)</td>
      <td><strong>15 to 18 cm diameter</strong> (Single unfertilized ovum)</td>
    </tr>
    <tr>
      <td><strong>Longest Cell in Human Body (मानव की सबसे लंबी कोशिका)</strong></td>
      <td>Motor Neuron / Nerve Cell (तंत्रिका कोशिका)</td>
      <td>Can reach up to <strong>90 cm to 1 meter</strong> in length</td>
    </tr>
    <tr>
      <td><strong>Largest Cell in Human Body (मानव की सबसे बड़ी कोशिका)</strong></td>
      <td>Female Ovum / Egg Cell (मादा डिंब)</td>
      <td><strong>~120 to 150 μm</strong> (Barely visible to the unaided human eye)</td>
    </tr>
    <tr>
      <td><strong>Smallest Cell in Human Body (मानव की सबसे छोटी कोशिका)</strong></td>
      <td>Cerebellar Granule Neuron / Male Sperm (शुक्राणु)</td>
      <td><strong>~4 to 5 μm</strong></td>
    </tr>
  </tbody>
</table>

<h2>3. Prokaryotic vs. Eukaryotic Cells (प्रोकेरियोटिक बनाम यूकेरियोटिक कोशिकाएं)</h2>

<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 Conceptual Distinction</span>
    <p>All life on Earth is organized into two primary cellular plans: <strong>Prokaryotes</strong> (primitive, uncompartmentalized single-celled organisms) and <strong>Eukaryotes</strong> (advanced cells containing membrane-bound organelles and a true nucleus).</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 मूल अंतर</span>
    <p>संसार के सभी जीव दो प्रकार की कोशिकाओं से बने होते हैं: <strong>प्रोकेरियोटिक (प्राचीन/अविकसित)</strong> जिनमें स्पष्ट केंद्रक और झिल्लीदार अंगक नहीं होते, तथा <strong>यूकेरियोटिक (सत्य/विकसित)</strong> जिनमें सुस्पष्ट केंद्रक और विशिष्ट झिल्लीयुक्त कोशिकांग होते हैं।</p>
  </div>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Feature (लक्षण)</th>
      <th>Prokaryotic Cell (असीमकेन्द्रकी)</th>
      <th>Eukaryotic Cell (ससीमकेन्द्रकी)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Nucleus (केंद्रक)</strong></td>
      <td><strong>Absent.</strong> Naked circular DNA lies directly in cytoplasm in an unmembrane region called <strong>Nucleoid (केंद्रकाभ)</strong>.</td>
      <td><strong>True Nucleus Present.</strong> Linear DNA safely enveloped inside a double-membrane nuclear envelope.</td>
    </tr>
    <tr>
      <td><strong>Histone Proteins (हिस्टोन)</strong></td>
      <td>Absent (DNA is bare without basic histones).</td>
      <td>Present (DNA wraps around histone protein octamers to form chromatin).</td>
    </tr>
    <tr>
      <td><strong>Ribosomes (राइबोसोम)</strong></td>
      <td><strong>70S</strong> type (Subunits: 50S + 30S).</td>
      <td><strong>80S</strong> type in cytoplasm (60S + 40S); 70S inside mitochondria & chloroplasts.</td>
    </tr>
    <tr>
      <td><strong>Membrane-Bound Organelles</strong></td>
      <td><strong>Completely Absent</strong> (No mitochondria, Golgi, ER, lysosomes, or chloroplasts).</td>
      <td><strong>Present</strong> (Abundant compartmentalization with specialized organelles).</td>
    </tr>
    <tr>
      <td><strong>Cell Wall Composition (भित्ति)</strong></td>
      <td>Composed of <strong>Peptidoglycan (Murein)</strong> in bacteria.</td>
      <td>Composed of <strong>Cellulose</strong> in plants; <strong>Chitin</strong> in fungi; Absent in animal cells.</td>
    </tr>
    <tr>
      <td><strong>Cell Division (विभाजन)</strong></td>
      <td>Binary fission or budding (No mitotic spindle).</td>
      <td>Mitosis (Equational) and Meiosis (Reductional).</td>
    </tr>
    <tr>
      <td><strong>Examples (उदाहरण)</strong></td>
      <td>Bacteria, Blue-Green Algae (Cyanobacteria), Mycoplasma.</td>
      <td>Protists, Fungi, Plants, and Animals (including humans).</td>
    </tr>
  </tbody>
</table>

<h2>4. Master Architecture of Cell Organelles (प्रमुख कोशिकांग एवं उनकी कार्यप्रणाली)</h2>

__SVG_1__

<h3>A. Plasma Membrane / Cell Membrane (प्लाज्मा झिल्ली)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>The flexible, living outer perimeter of all cells. It is <strong>selectively permeable</strong>, allowing essential nutrients and oxygen to enter while barring harmful substances and exporting metabolic wastes.</p>
    <ul>
      <li><strong>Fluid Mosaic Model (1972):</strong> Formulated by <strong>S. J. Singer and G. L. Nicolson</strong>. It depicts proteins as dynamic icebergs floating within a fluid sea of phospholipids.</li>
      <li><strong>Phospholipid Bilayer:</strong> Polar hydrophilic (water-loving) phosphate heads face outward; non-polar hydrophobic (water-repelling) fatty acid tails face inward.</li>
      <li><strong>Transport Mechanisms:</strong> Passive transport occurs without energy along concentration gradients (diffusion & osmosis); Active transport consumes cellular ATP energy against concentration gradients (e.g., $Na^+/K^+$ ATPase pump).</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>प्रत्येक जीवित कोशिका का सबसे बाहरी लचीला सुरक्षा घेरा जो <strong>चयनात्मक पारगम्य (Selectively Permeable)</strong> होता है।</p>
    <ul>
      <li><strong>तरल मोज़ेक मॉडल (1972):</strong> वैज्ञानिक <strong>एस. जे. सिंगर एवं जी. एल. निकोलसन</strong> द्वारा प्रस्तुत किया गया। इसे <em>"फॉस्फोलिपिड के समुद्र में तैरते प्रोटीन के हिमखंड"</em> कहा जाता है।</li>
      <li><strong>संघटन:</strong> फॉस्फोलिपिड की दोहरी परत और प्रोटीनों से निर्मित। जल-स्नेही सिरे बाहर की ओर तथा जल-विरोधी सिरे अंदर की ओर होते हैं।</li>
      <li><strong>परिवहन:</strong> विसरण व परासरण (ऊर्जा रहित) तथा सक्रिय परिवहन (ATP ऊर्जा खर्च करके आयनों का आदान-प्रदान)।</li>
    </ul>
  </div>
</div>

<h3>B. Cell Wall (कोशिका भित्ति)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>A non-living, rigid, completely permeable protective barrier located outside the cell membrane. <strong>Present in plants, fungi, and bacteria; totally absent in animal cells!</strong></p>
    <ul>
      <li><strong>Plant Cell Wall:</strong> Composed of <strong>Cellulose, Hemicellulose, and Pectin</strong>. Gives plant cells high tensile strength and prevents osmotic bursting in hypotonic water.</li>
      <li><strong>Fungal Cell Wall:</strong> Composed of <strong>Chitin</strong> (a nitrogenous polysaccharide).</li>
      <li><strong>Bacterial Cell Wall:</strong> Composed of <strong>Peptidoglycan</strong>.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>यह पादप, कवक और जीवाणुओं में पाई जाने वाली निर्जीव, कठोर और <strong>पूर्णतः पारगम्य (Fully Permeable)</strong> दीवार है। <u>यह जंतु कोशिकाओं में कभी नहीं पाई जाती।</u></p>
    <ul>
      <li><strong>पादप भित्ति:</strong> मुख्य रूप से <strong>सेल्युलोज (Cellulose)</strong> और पेक्टिन की बनी होती है जो पौधे को दृढ़ता देती है।</li>
      <li><strong>कवक भित्ति:</strong> <strong>काइटिन (Chitin)</strong> नामक जटिल कार्बोहाइड्रेट से बनी होती है।</li>
      <li><strong>जीवाणु भित्ति:</strong> <strong>पेप्टिडोग्लाइकेन (Peptidoglycan)</strong> से बनी होती है।</li>
    </ul>
  </div>
</div>

<h3>C. Nucleus (केंद्रक) — The Director / Brain of the Cell</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Discovered by <strong>Robert Brown (1831)</strong>. Acts as the executive command center of the eukaryotic cell, regulating cellular metabolism, growth, and hereditary transmission.</p>
    <ul>
      <li><strong>Nuclear Envelope:</strong> A double-membrane envelope punctured by nuclear pores that regulate RNA and protein traffic between nucleus and cytoplasm.</li>
      <li><strong>Chromatin Network:</strong> Hereditary thread-like fibers composed of <strong>DNA (~40%) and basic Histone proteins (~50%)</strong> that condense into rod-shaped chromosomes during division.</li>
      <li><strong>Nucleolus:</strong> A dense non-membranous body discovered by Felice Fontana. Designated as the <strong>"Ribosome Factory"</strong> because it actively transcribes and synthesizes ribosomal RNA (rRNA).</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>रॉबर्ट ब्राउन (1831)</strong>। इसे <strong>"कोशिका का मस्तिष्क / नियंत्रक"</strong> कहा जाता है क्योंकि यह कोशिका की समस्त क्रियाओं और आनुवंशिक सूचनाओं का नियंत्रण करता है।</p>
    <ul>
      <li><strong>केंद्रक झिल्ली:</strong> दोहरी झिल्ली जिसमें छिद्र होते हैं जो RNA और प्रोटीन का आदान-प्रदान करते हैं।</li>
      <li><strong>क्रोमैटिन जाल:</strong> <strong>डीएनए और क्षारीय हिस्टोन प्रोटीन</strong> से बना धागा जो विभाजन के समय स्पष्ट <strong>गुणसूत्र (Chromosomes)</strong> में बदल जाता है।</li>
      <li><strong>केंद्रिका (Nucleolus):</strong> इसे <strong>"राइबोसोम की फैक्ट्री"</strong> कहते हैं क्योंकि यह rRNA का निर्माण करती है।</li>
    </ul>
  </div>
</div>

<h3>D. Mitochondria (माइटोकॉन्ड्रिया) — The Powerhouse of the Cell (कोशिका का ऊर्जा घर)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Discovered by <strong>Richard Altmann (1890)</strong> (named <em>'Bioblasts'</em>); the name <em>'Mitochondria'</em> was coined by <strong>Carl Benda (1898)</strong>.</p>
    <ul>
      <li><strong>Double Membrane & Cristae:</strong> The outer membrane is smooth, while the inner membrane is folded into deep finger-like ridges called <strong>Cristae</strong>, vastly increasing surface area for ATP synthase enzymes.</li>
      <li><strong>Cellular Respiration & ATP:</strong> Primary site of the <strong>Krebs Cycle (Aerobic Respiration)</strong> and oxidative phosphorylation. Converts nutrients into <strong>ATP (Adenosine Triphosphate)</strong> — universally termed the <em>"Energy Currency of the Cell"</em>.</li>
      <li><strong>Semi-Autonomous Organelle:</strong> Contains its own <strong>Circular DNA</strong> and <strong>70S Ribosomes</strong>, permitting self-replication and local protein synthesis.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>रिचर्ड अल्टमैन (1890)</strong>, नामकरण: <strong>कार्ल बेंडा (1898)</strong>। इसे <strong>"कोशिका का ऊर्जा घर (Powerhouse)"</strong> कहा जाता है।</p>
    <ul>
      <li><strong>क्रिस्टी (Cristae):</strong> इसकी भीतरी झिल्ली उंगलियों जैसी रचनाओं में मुड़ी होती है जो श्वसन सतह का क्षेत्रफल बढ़ाती हैं।</li>
      <li><strong>ATP निर्माण:</strong> यहाँ <strong>क्रेब्स चक्र (वायवीय श्वसन)</strong> द्वारा ऊर्जा <strong>ATP (Adenosine Triphosphate)</strong> के रूप में बनती है। ATP को <em>"कोशिका की ऊर्जा मुद्रा"</em> कहते हैं।</li>
      <li><strong>अर्ध-स्वायत्त अंगक:</strong> इसके पास स्वयं का <strong>वृत्ताकार डीएनए और 70S राइबोसोम</strong> होता है, जिससे यह स्वतः विभाजित हो सकता है।</li>
    </ul>
  </div>
</div>

<div class="callout-box info">
  <p><strong>💡 SSC Repeated Fact:</strong> Mature mammalian red blood cells (RBCs) lack mitochondria (and a nucleus) to ensure that 100% of the oxygen they transport is delivered to tissues without being consumed by the RBC itself!</p>
</div>

<h3>E. Endoplasmic Reticulum - ER (अंतःप्रद्रव्यी जालिका) — आंतरिक परिवहन तंत्र</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>An extensive interconnected labyrinth of membranous tubules and sacs spanning from the nuclear envelope to the plasma membrane. Discovered by <strong>Keith R. Porter (1945)</strong>.</p>
    <ul>
      <li><strong>Rough ER (RER):</strong> Surface is heavily peppered with Ribosomes. Primary role: <strong>Synthesis, folding, and sorting of proteins</strong>.</li>
      <li><strong>Smooth ER (SER):</strong> Free of ribosomes. Primary role: <strong>Synthesis of lipids, phospholipids, and steroid hormones</strong> (testosterone, estrogen), and <strong>detoxification of drugs, alcohol, and metabolic poisons</strong> in liver hepatocytes.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>कीथ पोर्टर (1945)</strong>। यह कोशिका का अंतःकंकाल और आंतरिक परिवहन राजमार्ग (Transport Highway) है।</p>
    <ul>
      <li><strong>खुरदरी अंतःप्रद्रव्यी जालिका (RER):</strong> इस पर राइबोसोम लगे होते हैं। मुख्य कार्य: <strong>प्रोटीन निर्माण एवं परिवहन</strong>।</li>
      <li><strong>चिकनी अंतःप्रद्रव्यी जालिका (SER):</strong> इस पर राइबोसोम नहीं होते। मुख्य कार्य: <strong>वसा (लिपिड) और स्टेरॉयड हार्मोन का निर्माण</strong> तथा यकृत (Liver) में <strong>दवाइयों व विषैले पदार्थों का विषहरण (Detoxification)</strong>।</li>
    </ul>
  </div>
</div>

<h3>F. Ribosomes (राइबोसोम) — The Protein Factories (प्रोटीन की फैक्ट्री)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>The smallest sub-cellular organelle, discovered by <strong>George E. Palade (1955)</strong> under electron microscopy (termed <em>Palade Granules</em>).</p>
    <ul>
      <li><strong>Membraneless Architecture:</strong> Ribosomes have <strong>NO surrounding membrane</strong>. Composed strictly of ribosomal RNA (rRNA) and structural proteins.</li>
      <li><strong>Biological Function:</strong> Translates genetic instructions carried by mRNA into polypeptide protein chains (Protein Synthesis). Universally termed the <strong>"Protein Factory of the Cell"</strong>.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>जॉर्ज पलाडे (1955)</strong>। यह कोशिका का सबसे छोटा अंगक है जिस पर <u>कोई झिल्ली नहीं होती</u>।</p>
    <ul>
      <li><strong>कार्य:</strong> यह rRNA और प्रोटीन से मिलकर बना होता है तथा mRNA के निर्देशों के अनुसार प्रोटीन का निर्माण करता है। इसीलिए इसे <strong>"कोशिका की प्रोटीन फैक्ट्री"</strong> कहते हैं।</li>
    </ul>
  </div>
</div>

<h3>G. Golgi Apparatus / Golgi Body (गॉल्जी काय / उपकरण)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Discovered by Italian physician <strong>Camillo Golgi (1898)</strong> in barn owl nerve cells (Nobel Prize in 1906). In plant cells, dispersed individual units are termed <strong>Dictyosomes</strong>.</p>
    <ul>
      <li><strong>Structure:</strong> Parallel stacks of curved, flattened membrane-bound sacs called <strong>Cisternae</strong>.</li>
      <li><strong>Exam Nicknames:</strong> <em>"Post Office of the Cell"</em> or <em>"Traffic Police / Dispatch Center"</em>.</li>
      <li><strong>Functions:</strong> Receives newly synthesized proteins and lipids from ER, modifies them (glycosylation), packages them into vesicles, and dispatches them. Also responsible for the <strong>biogenesis of Lysosomes</strong>.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>कैमिलो गॉल्जी (1898)</strong>। पादपों में इसे <strong>डिक्टियोसोम (Dictyosome)</strong> कहते हैं।</p>
    <ul>
      <li><strong>उपनाम:</strong> कोशिका का <strong>"डाकघर" (Post Office)</strong> अथवा <strong>"ट्रैफिक पुलिस"</strong>।</li>
      <li><strong>कार्य:</strong> ER से आने वाले प्रोटीन और वसा की पैकेजिंग, रूपांतरण (ग्लाइकोसिलेशन) एवं आवश्यक स्थानों पर स्रावण करना। यह <strong>लाइसोसोम का निर्माण</strong> भी करता है।</li>
    </ul>
  </div>
</div>

<h3>H. Lysosomes (लाइसोसोम) — The Suicidal Bags of the Cell (आत्मघाती थैली)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Discovered by Belgian cytologist <strong>Christian de Duve (1955)</strong> (Nobel Prize in 1974).</p>
    <ul>
      <li><strong>Structure & Enzymatic Arsenal:</strong> Spherical single-membrane vesicles packed with over 50 potent <strong>Acidic Hydrolytic Enzymes</strong> (hydrolases, proteases, nucleases, lipases) functioning optimally at an acidic <strong>pH of ~4.5 to 5.0</strong>.</li>
      <li><strong>Why "Suicidal Bags"?</strong> When a cell suffers irreparable mechanical damage, radiation injury, or starvation, its lysosomes burst, pouring hydrolytic enzymes into the cytoplasm to completely digest the host cell (Autolysis).</li>
      <li><strong>Autophagy (Cellular Scavenger):</strong> Systematically breaks down worn-out, dysfunctional organelles to recycle vital biochemical precursors.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>क्रिश्चियन डी डुवे (1955)</strong>। यह एकल झिल्ली वाली सूक्ष्म थैली है जिसमें 50 से अधिक शक्तिशाली <strong>अम्लीय हाइड्रोलाइटिक एंजाइम</strong> भरे होते हैं (pH 4.5–5.0)।</p>
    <ul>
      <li><strong>आत्मघाती थैली (Suicidal Bag) क्यों?</strong> जब कोशिका क्षतिग्रस्त या मृतप्राय हो जाती है, तो लाइसोसोम फट जाता है और इसके पाचक एंजाइम अपनी ही कोशिका को पचाकर नष्ट कर देते हैं (Autolysis)।</li>
      <li><strong>सफाईकर्मी:</strong> यह मृत और पुराने कोशिकांगों को पचाकर कोशिका की सफाई करता है (Autophagy)।</li>
    </ul>
  </div>
</div>

<h3>I. Plastids (लवक) — Plant Exclusive Organelles (केवल पादपों में)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Double-membraned pigment-bearing organelles found strictly in photosynthetic plant cells and algae. Three distinct varieties:</p>
    <ul>
      <li><strong>Chloroplasts (Kitchen of the Plant Cell):</strong> Semi-autonomous organelle with own circular DNA and 70S ribosomes. Contains <strong>Chlorophyll</strong> with a central <strong>Magnesium ($Mg^{2+}$) ion</strong>. Stacks of coin-like thylakoids called <strong>Grana</strong> perform Light reactions; the fluid matrix called <strong>Stroma</strong> performs Dark reactions (Calvin cycle).</li>
      <li><strong>Chromoplasts:</strong> Imparts vibrant non-green pigments to flowers and fruits:
        <ul>
          <li><em>Lycopene:</em> Imparts deep red color to ripe tomatoes.</li>
          <li><em>Carotene:</em> Imparts orange color to carrots.</li>
          <li><em>Betalain:</em> Imparts deep purple-red color to beetroots.</li>
          <li><em>Xanthophyll:</em> Imparts yellow color to autumn foliage.</li>
        </ul>
      </li>
      <li><strong>Leucoplasts:</strong> Colorless storage plastids found in roots and tubers (<em>Amyloplasts</em> store starch; <em>Elaioplasts</em> store lipids/oils; <em>Aleuroplasts</em> store proteins).</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>लवक केवल पादपों और शैवालों में पाए जाते हैं। ये तीन प्रकार के होते हैं:</p>
    <ul>
      <li><strong>1. हरितलवक (Chloroplast / कोशिका की रसोई):</strong> इसमें हरा वर्णक <strong>क्लोरोफिल</strong> होता है जिसके केंद्र में <strong>मैग्नीशियम ($Mg^{2+}$) धातु</strong> पाई जाती है। इसके पास स्वयं का डीएनए और 70S राइबोसोम होता है। यह प्रकाश संश्लेषण द्वारा भोजन बनाता है।</li>
      <li><strong>2. वर्णीलवक (Chromoplast):</strong> फूलों और फलों को आकर्षक रंग देने वाले वर्णक (लाइकोपीन = टमाटर का लाल रंग; कैरोटीन = गाजर का नारंगी रंग; बीटालेन = चुकंदर; जैंथोफिल = पीला रंग)।</li>
      <li><strong>3. अवर्णीलवक (Leucoplast):</strong> रंगहीन लवक जो भोजन संचय करते हैं (एमाइलोप्लास्ट = आलू में स्टार्च; इलाइओप्लास्ट = तेल व वसा; एल्यूरोप्लास्ट = मक्का में प्रोटीन)।</li>
    </ul>
  </div>
</div>

<h3>J. Vacuoles (रसधानी / रिक्तिका)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>In mature plant cells, a single <strong>Large Central Vacuole</strong> occupies up to <strong>90% of the entire cell volume</strong>, pushing the nucleus to the perimeter.</p>
    <ul>
      <li>The semi-permeable membrane enclosing the plant vacuole is termed the <strong>Tonoplast</strong>. It pumps ions against concentration gradients, sustaining cellular turgor pressure (rigidity) and osmotic balance.</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>पादप कोशिका के केंद्र में एक विशाल रिक्तिका होती है जो कोशिका का 90% स्थान घेरती है और केंद्रक को किनारे की ओर धकेल देती है।</p>
    <ul>
      <li><strong>टोनोप्लास्ट (Tonoplast):</strong> रसधानी को घेरने वाली विशिष्ट अर्ध-पारगम्य झिल्ली है जो कोशिका का स्फीति दाब (Turgor Pressure) और कड़ापन बनाए रखती है। जंतुओं में रिक्तिकाएं बहुत छोटी और अस्थायी होती हैं।</li>
    </ul>
  </div>
</div>

<h3>K. Centrosome & Centrioles (तारककाय एवं तारककेंद्र)</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Described by <strong>Theodor Boveri (1888)</strong>. <strong>Present exclusively in Animal Cells</strong> (absent in higher plant cells). Composed of two mutually perpendicular barrel-shaped <strong>Centrioles</strong> exhibiting a '9 + 0' triplet microtubule arrangement. Assembles mitotic spindle fibers that pull sister chromatids apart during mitosis.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>थियोडोर बोवेरी (1888)</strong>। <u>यह केवल जंतु कोशिकाओं में पाया जाता है</u> (उच्च पादपों में अनुपस्थित)। यह कोशिका विभाजन के समय <strong>तर्कु तंतुओं (Spindle Fibers)</strong> का निर्माण करता है जो गुणसूत्रों को दोनों ध्रुवों की ओर खींचते हैं।</p>
  </div>
</div>

<h2>5. Master Organelles Summary Cheat-Sheet (मास्टर रिवीजन सारणी)</h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Organelle (कोशिकांग)</th>
      <th>Discovered By (खोजकर्ता)</th>
      <th>Membrane (झिल्ली)</th>
      <th>Primary Duty (मुख्य कार्य)</th>
      <th>Exam Nickname (परीक्षा उपनाम)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Plasma Membrane</strong></td>
      <td>Singer & Nicolson (1972)</td>
      <td>Single Bilayer</td>
      <td>Selective transport & permeability</td>
      <td>Gatekeeper / Security Border</td>
    </tr>
    <tr>
      <td><strong>Cell Wall</strong></td>
      <td>Robert Hooke (1665)</td>
      <td>Rigid Outer Wall</td>
      <td>Structural strength & protection</td>
      <td>Protective Armor (Plants/Fungi/Bacteria)</td>
    </tr>
    <tr>
      <td><strong>Nucleus</strong></td>
      <td>Robert Brown (1831)</td>
      <td>Double Membrane</td>
      <td>Houses DNA & controls cellular processes</td>
      <td><strong>Brain / Controller of Cell</strong></td>
    </tr>
    <tr>
      <td><strong>Mitochondria</strong></td>
      <td>Altmann / Benda (1898)</td>
      <td>Double Membrane</td>
      <td>Krebs Cycle & ATP synthesis</td>
      <td><strong>Powerhouse of the Cell (ऊर्जा घर)</strong></td>
    </tr>
    <tr>
      <td><strong>Chloroplast</strong></td>
      <td>Schimper</td>
      <td>Double Membrane</td>
      <td>Photosynthesis (Contains Mg2+ ion)</td>
      <td><strong>Kitchen of the Plant Cell (रसोई)</strong></td>
    </tr>
    <tr>
      <td><strong>Ribosome</strong></td>
      <td>George Palade (1955)</td>
      <td><strong>No Membrane</strong></td>
      <td>Translation of mRNA into proteins</td>
      <td><strong>Protein Factory of the Cell</strong></td>
    </tr>
    <tr>
      <td><strong>Endoplasmic Reticulum</strong></td>
      <td>Keith Porter (1945)</td>
      <td>Tubular Network</td>
      <td>RER: Protein folding; SER: Lipid synthesis & detox</td>
      <td>Internal Highway / Cytoskeleton</td>
    </tr>
    <tr>
      <td><strong>Golgi Apparatus</strong></td>
      <td>Camillo Golgi (1898)</td>
      <td>Stacked Cisternae</td>
      <td>Packaging, glycosylation & secretion</td>
      <td><strong>Post Office / Traffic Police</strong></td>
    </tr>
    <tr>
      <td><strong>Lysosome</strong></td>
      <td>Christian de Duve (1955)</td>
      <td>Single Membrane</td>
      <td>Acidic hydrolytic digestion of wastes</td>
      <td><strong>Suicidal Bags / Scavengers (आत्मघाती थैली)</strong></td>
    </tr>
    <tr>
      <td><strong>Vacuole</strong></td>
      <td>Leeuwenhoek</td>
      <td>Single (Tonoplast)</td>
      <td>Stores cell sap & maintains turgidity</td>
      <td>Cell Reservoir / Storage Tank</td>
    </tr>
    <tr>
      <td><strong>Centrosome</strong></td>
      <td>Theodor Boveri (1888)</td>
      <td><strong>No Membrane</strong></td>
      <td>Spindle assembly during animal cell division</td>
      <td>Mitotic Architect (Animal Only)</td>
    </tr>
  </tbody>
</table>

<h2>6. Plant Cell vs. Animal Cell: Decisive Differences (पादप बनाम जंतु कोशिका)</h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Parameter (लक्षण)</th>
      <th>Plant Cell (पादप कोशिका)</th>
      <th>Animal Cell (जंतु कोशिका)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Cell Wall (कोशिका भित्ति)</strong></td>
      <td><strong>Present</strong> (Rigid, composed of Cellulose & Pectin).</td>
      <td><strong>Absent</strong> (Enclosed solely by flexible plasma membrane).</td>
    </tr>
    <tr>
      <td><strong>Shape & Size (आकार)</strong></td>
      <td>Larger, fixed, definite rectangular or polygonal shape.</td>
      <td>Smaller, irregular, flexible, round or oval shape.</td>
    </tr>
    <tr>
      <td><strong>Chloroplasts / Plastids</strong></td>
      <td><strong>Present</strong> (Conducts autotrophic photosynthesis).</td>
      <td><strong>Absent</strong> (Heterotrophic nutrition).</td>
    </tr>
    <tr>
      <td><strong>Vacuole Architecture</strong></td>
      <td>One <strong>Very Large Central Vacuole</strong> (takes up to 90% volume).</td>
      <td>Small, multiple, temporary vacuoles (if present).</td>
    </tr>
    <tr>
      <td><strong>Nucleus Position</strong></td>
      <td>Pushed to the <strong>Periphery (Side)</strong> due to central vacuole.</td>
      <td>Located at the <strong>Geometric Center</strong> of the cell.</td>
    </tr>
    <tr>
      <td><strong>Centrosome & Centrioles</strong></td>
      <td><strong>Absent</strong> in higher plants.</td>
      <td><strong>Present</strong> (Essential for organizing mitotic spindle).</td>
    </tr>
    <tr>
      <td><strong>Cytokinesis Method</strong></td>
      <td>By <strong>Cell Plate method</strong> (grows centrifugally outward).</td>
      <td>By <strong>Cleavage Furrow method</strong> (furrow deepens centripetally).</td>
    </tr>
    <tr>
      <td><strong>Reserve Food Storage</strong></td>
      <td>Stored primarily as <strong>Starch (मंड)</strong>.</td>
      <td>Stored primarily as <strong>Glycogen (ग्लाइकोजन / Animal Starch)</strong>.</td>
    </tr>
  </tbody>
</table>

<h2>7. Cell Division & The Cell Cycle (कोशिका चक्र एवं विभाजन)</h2>

__SVG_2__

<h3>A. Interphase (विश्राम या अंतरावस्था) — 95% of Duration</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>The metabolically hyperactive preparatory phase where the cell grows, synthesizes proteins, and duplicates its DNA before dividing:</p>
    <ul>
      <li><strong>$G_1$ Phase (Gap 1):</strong> Rapid cell growth, intense RNA and protein synthesis, organelle duplication. Diploid chromosome number ($2n$) remains unchanged.</li>
      <li><strong>$S$ Phase (Synthesis Phase) — <u>Exam Favorite</u>:</strong> <strong>DNA Replication occurs strictly here!</strong> The amount of DNA doubles (from $2C$ to $4C$), but the <u>chromosome count remains unchanged ($2n$)</u>. Centrioles duplicate in animal cells.</li>
      <li><strong>$G_2$ Phase (Gap 2):</strong> Synthesis of tubulin proteins for spindle fibers; final division checkpoints.</li>
      <li><strong>$G_0$ Phase (Quiescent Stage):</strong> Inactive exit stage where non-dividing mature cells reside (e.g., neurons and cardiac myocytes).</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>कोशिका चक्र का 95% समय अंतरावस्था में बीतता है जहां कोशिका विभाजन की तैयारी करती है:</p>
    <ul>
      <li><strong>$G_1$ चरण:</strong> कोशिका की तीव्र वृद्धि, RNA और प्रोटीन का निर्माण। गुणसूत्र संख्या $2n$ ही रहती है।</li>
      <li><strong>$S$ चरण (Synthesis Phase - <u>सुपर हाई-यील्ड</u>):</strong> इस चरण में <strong>डीएनए की प्रतिकृति (DNA Replication)</strong> होती है! डीएनए की मात्रा दोगुनी ($2C$ से $4C$) हो जाती है, किंतु <u>गुणसूत्रों की संख्या अपरिवर्तित ($2n$)</u> रहती है।</li>
      <li><strong>$G_2$ चरण:</strong> स्पिंडल तंतु निर्माण हेतु ट्यूबुलिन प्रोटीन का संश्लेषण।</li>
      <li><strong>$G_0$ शांत अवस्था:</strong> जो कोशिकाएं आगे विभाजित नहीं होतीं (जैसे मस्तिष्क के न्यूरॉन्स और हृदय पेशियां)।</li>
    </ul>
  </div>
</div>

<h3>B. Mitosis (समसूत्री विभाजन) — Equational Division</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Discovered by <strong>Walther Flemming (1882)</strong>. Occurs exclusively in <strong>Somatic (Body) Cells</strong> for growth, tissue repair, and wound healing.</p>
    <p><strong>1 Diploid Parent Cell ($2n$) &nbsp;➔&nbsp; 2 Genetically Identical Diploid Daughter Cells ($2n$)</strong></p>
    <p>Sub-stages (Memory Mnemonic: <strong>PMAT</strong>):</p>
    <ul>
      <li><strong>1. Prophase:</strong> Chromatin condenses into visible chromosomes. Nucleolus and nuclear membrane dissolve.</li>
      <li><strong>2. Metaphase:</strong> Spindle fibers attach to kinetochores; chromosomes align strictly along the cell equator (<strong>Equatorial Plate</strong>). <em style="color: #2563eb; font-weight: bold;">⭐ Best stage to clearly observe, count, and study chromosome morphology under microscope!</em></li>
      <li><strong>3. Anaphase:</strong> <strong>Shortest stage</strong>. Centromeres split; sister chromatids are pulled apart toward opposite poles in V, L, J shapes.</li>
      <li><strong>4. Telophase:</strong> Chromosomes uncoil; two new nuclear membranes reform around daughter nuclei.</li>
      <li><strong>Cytokinesis:</strong> Division of cytoplasm via Cleavage Furrow (animals) or Cell Plate (plants).</li>
    </ul>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>खोजकर्ता: <strong>वाल्थर फ्लेमिंग (1882)</strong>। यह शरीर की कायिक कोशिकाओं (त्वचा, मांसपेशियों, घाव भरने) में होता है।</p>
    <p><strong>1 द्विगुणित जनक कोशिका ($2n$) &nbsp;➔&nbsp; 2 समान द्विगुणित संतति कोशिकाएं ($2n$)</strong> (गुणसूत्र संख्या समान रहती है)।</p>
    <p><strong>समसूत्री विभाजन के 4 चरण (Trick: PMAT):</strong></p>
    <ul>
      <li><strong>1. Prophase (पूर्वावस्था):</strong> क्रोमैटिन धागे संघनित होकर गुणसूत्र बनाते हैं। केंद्रक झिल्ली लुप्त हो जाती है।</li>
      <li><strong>2. Metaphase (मध्यावस्था) — <u>परीक्षा पसंदीदा</u>:</strong> सभी गुणसूत्र मध्य रेखा (Equatorial Plate) पर व्यवस्थित हो जाते हैं। <em style="color: #059669; font-weight: bold;">⭐ गुणसूत्रों की आकृति, संरचना और संख्या गिनने के लिए मध्यावस्था सबसे उत्तम अवस्था है!</em></li>
      <li><strong>3. Anaphase (पश्चावस्था):</strong> <strong>सबसे छोटा चरण</strong>। गुणसूत्र बिंदु (Centromere) टूटता है और दोनों क्रोमैटिड विपरीत ध्रुवों की ओर खिंचते हैं।</li>
      <li><strong>4. Telophase (अंत्यावस्था):</strong> पूर्वावस्था का उल्टा। दोनों ध्रुवों पर नई केंद्रक झिल्लियां बन जाती हैं।</li>
      <li><strong>Cytokinesis:</strong> कोशिकाद्रव्य का विभाजन (जंतु में खांच विधि, पादप में कोशिका पट्टिका विधि)।</li>
    </ul>
  </div>
</div>

<h3>C. Meiosis (अर्धसूत्री विभाजन) — Reductional Division</h3>
<div class="lang-en">
  <div class="lang-card-en">
    <span class="lang-chip en">🌐 English Core Concept</span>
    <p>Term coined by <strong>Farmer and Moore (1905)</strong>. Occurs strictly in <strong>Germ / Reproductive Cells</strong> during gamete formation.</p>
    <p><strong>1 Diploid Parent Cell ($2n$) &nbsp;➔&nbsp; 4 Genetically Unique Haploid Daughter Cells ($n$)</strong></p>
    <p>Key sub-stages of <strong>Prophase I</strong> (Mnemonic: <strong>L-Z-P-D-D</strong>):</p>
    <ol>
      <li><strong>Leptotene:</strong> Chromatin threads condense into visible chromosomes.</li>
      <li><strong>Zygotene:</strong> Homologous chromosomes pair up side-by-side — termed <strong>Synapsis</strong>.</li>
      <li><strong>Pachytene — <u>Super High Yield</u>:</strong> Exchange of genetic segments between non-sister chromatids of homologous chromosomes occurs — termed <strong>Crossing Over (जीन विनिमय)</strong>, catalyzed by the enzyme <em>Recombinase</em>. Primary engine of biological variation and evolution!</li>
      <li><strong>Diplotene:</strong> Paired chromosomes separate but stay joined at crossing points, forming X-shaped junctions called <strong>Chiasmata</strong>.</li>
      <li><strong>Diakinesis:</strong> Chiasmata terminate at chromosome tips; nuclear envelope dissolves.</li>
    </ol>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <span class="lang-chip hi">🇮🇳 सरल हिंदी व्याख्या</span>
    <p>नामकरण: <strong>फार्मर एवं मूर (1905)</strong>। यह जनन कोशिकाओं में युग्मक (शुक्राणु, अंडाणु, परागकण) निर्माण के समय होता है।</p>
    <p><strong>1 द्विगुणित जनक कोशिका ($2n$) &nbsp;➔&nbsp; 4 अगुणित संतति कोशिकाएं ($n$)</strong> (गुणसूत्र संख्या आधी रह जाती है)।</p>
    <p><strong>Prophase-I के 5 महत्वपूर्ण उप-चरण (Trick: L-Z-P-D-D):</strong></p>
    <ol>
      <li><strong>लेप्टोटीन (Leptotene):</strong> गुणसूत्र धागे संघनित होकर स्पष्ट होते हैं।</li>
      <li><strong>जाइगोटीन (Zygotene):</strong> समजात गुणसूत्र जोड़े बनाते हैं जिसे <strong>सूत्रयुग्मन (Synapsis)</strong> कहते हैं।</li>
      <li><strong>पैकिटीन (Pachytene) — <u>अत्यंत महत्वपूर्ण</u>:</strong> समजात गुणसूत्रों के बीच आनुवंशिक खंडों का आदान-प्रदान होता है जिसे <strong>जीन विनिमय (Crossing Over)</strong> कहते हैं। यह <em>रिकॉम्बिनेज (Recombinase)</em> एंजाइम द्वारा संपन्न होता है और जैव विविधता का मुख्य कारण है।</li>
      <li><strong>डिप्लोटीन (Diplotene):</strong> गुणसूत्र अलग होने लगते हैं किंतु क्रॉसिंग स्थलों पर जुड़े रहते हैं, जिससे 'X' आकार के संपर्क बिंदु बनते हैं जिन्हें <strong>कियाज्मेटा (Chiasmata)</strong> कहते हैं।</li>
      <li><strong>डायाकाइनेसिस (Diakinesis):</strong> कियाज्मेटा सिरों पर खिसककर समाप्त हो जाते हैं।</li>
    </ol>
  </div>
</div>

<h2>8. Non-Cellular Entities: Viruses, Viroids & Prions (अकोशिकीय जैविक कण)</h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Entity (कण)</th>
      <th>Composition (संरचना)</th>
      <th>Discoverer & Year (खोजकर्ता)</th>
      <th>Key Exam Facts & Diseases (प्रमुख तथ्य एवं रोग)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Virus (विषाणु)</strong></td>
      <td><strong>Genetic Core (DNA or RNA, never both) + Protein Coat (Capsid).</strong></td>
      <td>Dmitri Ivanovsky (1892) & Beijerinck (1898); Crystallized by W.M. Stanley (1935).</td>
      <td>Borderline of living and non-living. Obligate intracellular parasites. Inert crystals outside host; fully reproductive inside living host. Diseases: Polio, Rabies, AIDS, Influenza, Smallpox, COVID-19.</td>
    </tr>
    <tr>
      <td><strong>Viroid (वाइरॉइड)</strong></td>
      <td><strong>Free Low Molecular Weight Circular RNA only</strong> (No protein capsid!).</td>
      <td>T. O. Diener (1971).</td>
      <td>Smaller than viruses. Exclusively infects plants. Classic disease: <strong>Potato Spindle Tuber Disease (आलू का तर्कु कंद रोग)</strong>.</td>
    </tr>
    <tr>
      <td><strong>Prion (प्रिओन)</strong></td>
      <td><strong>Abnormally folded Infectious Proteins only</strong> (NO DNA or RNA!).</td>
      <td>Stanley B. Prusiner (Nobel Prize 1997).</td>
      <td>Highly resistant to heat, UV, and proteases. Destroys brain tissue: <strong>Bovine Spongiform Encephalopathy (BSE / Mad Cow Disease)</strong> in cattle and <strong>Creutzfeldt-Jakob Disease (CJD)</strong> in humans.</td>
    </tr>
  </tbody>
</table>

<h2>9. 🔥 Top 10 Repeated SSC & Govt Exam PYQ Traps (बार-बार दोहराए जाने वाले 10 तथ्य)</h2>

<div class="callout-box alert">
  <ol>
    <li><strong>Q: Which cell organelle possesses its own DNA and 70S ribosomes?</strong><br/>
    👉 <strong>Ans:</strong> <em>Mitochondria</em> and <em>Chloroplasts</em> (Semi-autonomous organelles / अर्ध-स्वायत्त अंगक).</li>
    
    <li><strong>Q: Which metal ion is present at the core of Chlorophyll pigment?</strong><br/>
    👉 <strong>Ans:</strong> <strong>Magnesium ($Mg^{2+}$)</strong> (Just as Iron $Fe^{2+}$ is present in blood Hemoglobin).</li>
    
    <li><strong>Q: In which phase of the cell cycle does DNA replication take place?</strong><br/>
    👉 <strong>Ans:</strong> <strong>S Phase (Synthesis Phase)</strong> of Interphase.</li>
    
    <li><strong>Q: During which stage of Mitosis is chromosome morphology and shape best studied?</strong><br/>
    👉 <strong>Ans:</strong> <strong>Metaphase (मध्यावस्था)</strong> (When chromosomes assemble on the equatorial plate).</li>
    
    <li><strong>Q: In which sub-stage of Meiosis does Crossing Over (genetic recombination) occur?</strong><br/>
    👉 <strong>Ans:</strong> <strong>Pachytene stage (पैकिटीन)</strong> of Prophase-I (catalyzed by Recombinase enzyme).</li>
    
    <li><strong>Q: Which organelle is famously designated as the "Post Office / Traffic Police" of the cell?</strong><br/>
    👉 <strong>Ans:</strong> <strong>Golgi Apparatus (गॉल्जी काय)</strong>.</li>
    
    <li><strong>Q: Why do lysosomes fail to digest themselves under normal conditions?</strong><br/>
    👉 <strong>Ans:</strong> Their hydrolytic enzymes are safely sequestered behind a resilient single lipid membrane and only operate at an acidic pH (~5.0).</li>
    
    <li><strong>Q: The cell wall of fungi is composed of which chemical polymer?</strong><br/>
    👉 <strong>Ans:</strong> <strong>Chitin (काइटिन)</strong>.</li>
    
    <li><strong>Q: What is the primary chemical difference between plant cell walls and bacterial cell walls?</strong><br/>
    👉 <strong>Ans:</strong> Plant cell walls are made of <strong>Cellulose</strong>, whereas bacterial cell walls are made of <strong>Peptidoglycan (Murein)</strong>.</li>
    
    <li><strong>Q: Name the infectious agent that causes Mad Cow disease containing only misfolded protein and no nucleic acid:</strong><br/>
    👉 <strong>Ans:</strong> <strong>Prions (प्रिओन)</strong>.</li>
  </ol>
</div>

<h2>10. Self-Assessment Practice Quiz (5 Real PYQs)</h2>
<p style="color: #64748b; font-size: 14px; margin-bottom: 18px;">
  Test yourself with these authentic exam questions. Click <strong>'Reveal Answer'</strong> to verify your concept and learn the memory trick:
</p>

<div class="quiz-card">
  <span class="quiz-badge">⚡ SSC CGL 2023 Tier-1 • PYQ</span>
  <div class="quiz-question">
    Q1. Which of the following cellular organelles is known as the "Suicidal Bag" of a cell? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(निम्नलिखित में से किस कोशिकांग को कोशिका की "आत्मघाती थैली" कहा जाता है?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> Ribosome (राइबोसोम)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> Lysosome (लाइसोसोम)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> Golgi Apparatus (गॉल्जी उपकरण)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> Peroxisome (परऑक्सीसोम)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <strong>✅ Correct Answer: B) Lysosome (लाइसोसोम)</strong> <br/>
      <strong>Explanation:</strong> Discovered by Christian de Duve (1955). Lysosomes contain over 50 acidic hydrolytic enzymes. When a cell is severely injured or infected, lysosomes burst and their enzymes digest their own cell (Autolysis). <br/>
      <em>Why other options are incorrect?</em> Ribosomes synthesize proteins, Golgi apparatus handles packaging and secretion, and Peroxisomes detoxify hydrogen peroxide.
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ RRB NTPC CBT-1 2021 • PYQ</span>
  <div class="quiz-question">
    Q2. The aphorism "Omnis cellula-e-cellula", meaning all cells arise from pre-existing cells, was proposed by: <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(लैटिन कथन "Omnis cellula-e-cellula" किसके द्वारा प्रतिपादित किया गया था?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> Robert Hooke (रॉबर्ट हुक)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> Matthias Schleiden (मथायस श्लीडेन)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> Rudolf Virchow (रुडोल्फ विरचो)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> Theodor Schwann (थियोडोर श्वान)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <strong>✅ Correct Answer: C) Rudolf Virchow (रुडोल्फ विरचो - 1855)</strong> <br/>
      <strong>Explanation:</strong> While Schleiden (1838) and Schwann (1839) founded the classical cell theory, it was Rudolf Virchow who added the modern tenet that new cells originate only from division of existing cells. Robert Hooke discovered dead cork cells in 1665.
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ UPSC CDS / NDA 2022 • PYQ</span>
  <div class="quiz-question">
    Q3. Which one of the following cellular organelles is non-membranous and found in both prokaryotic and eukaryotic cells? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(कौन सा कोशिकांग झिल्ली रहित होता है और प्रोकेरियोटिक व यूकेरियोटिक दोनों में पाया जाता है?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> Mitochondria (माइटोकॉन्ड्रिया)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> Ribosome (राइबोसोम)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> Endoplasmic Reticulum (ER)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> Chloroplast (हरितलवक)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <strong>✅ Correct Answer: B) Ribosome (राइबोसोम)</strong> <br/>
      <strong>Explanation:</strong> Ribosomes have no outer lipid membrane. They exist as 70S particles in prokaryotes and 80S particles in eukaryotic cytoplasm. Mitochondria, ER, and Chloroplasts are membrane-bound organelles absent in prokaryotes.
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ SSC CGL Tier-2 2024 • PYQ</span>
  <div class="quiz-question">
    Q4. During which sub-stage of Meiosis does genetic recombination via 'Crossing Over' occur? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(अर्धसूत्री विभाजन के किस उप-चरण में 'जीन विनिमय' / Crossing Over संपन्न होता है?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> Leptotene (लेप्टोटीन)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> Zygotene (जाइगोटीन)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> Pachytene (पैकिटीन)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> Anaphase-I (पश्चावस्था-I)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <strong>✅ Correct Answer: C) Pachytene (पैकिटीन)</strong> <br/>
      <strong>Explanation:</strong> In Prophase-I, Crossing Over occurs specifically during Pachytene between non-sister chromatids of homologous chromosomes, catalyzed by Recombinase enzyme. Zygotene is the pairing (Synapsis) stage, while Diplotene forms Chiasmata.
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ BPSC / UPPSC PCS 2023 • PYQ</span>
  <div class="quiz-question">
    Q5. The semi-permeable membrane enclosing the large central vacuole in plant cells is termed: <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(पादप कोशिकाओं में विशाल केंद्रीय रसधानी को घेरने वाली झिल्ली क्या कहलाती है?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> Tonoplast (टोनोप्लास्ट)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> Cristae (क्रिस्टी)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> Pellicle (पेलीकल)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> Thylakoid (थाइलेकोइड)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <strong>✅ Correct Answer: A) Tonoplast (टोनोप्लास्ट)</strong> <br/>
      <strong>Explanation:</strong> The tonoplast is a specialized single semi-permeable membrane that actively regulates ion transport into the vacuole, maintaining plant turgor pressure. Cristae are folds in mitochondria; Thylakoids are disk structures in chloroplasts.
    </div>
  </details>
</div>
"""

new_note = {
    "id": "cn_bio_01",
    "slug": "biology-cell-structure-organelles-division",
    "title": "Cell Biology: Structure, Organelles & Cell Division",
    "hindi_title": "कोशिका विज्ञान: संरचना, प्रमुख कोशिकांग एवं कोशिका विभाजन",
    "excerpt": "Comprehensive bilingual study notes covering Cell Theory, Organelles (Mitochondria, Nucleus, ER, Golgi, Lysosome), Plant vs Animal Cell, and Cell Division (Mitosis & Meiosis) for SSC CGL, Railways & State PCS.",
    "type": "chapter_note",
    "subject_id": "biology",
    "subject_name": "Biology (जीव विज्ञान)",
    "chapter_number": 1,
    "chapter_title": "Cell: The Unit of Life & Cell Division",
    "read_time": "12 min read",
    "sort_order": 1,
    "is_active": False,  # DRAFT MODE - user will preview and publish manually
    "is_featured": True,
    "exam_tag": "SSC CGL / CHSL / Railway / State PCS / CDS",
    "created_at": "2026-11-14T08:50:00Z",
    "updated_at": datetime.utcnow().isoformat() + "Z",
    "content": content_html_raw.replace("__SVG_1__", svg_cell_comparison).replace("__SVG_2__", svg_cell_cycle).strip()
}

def main():
    if not os.path.exists(NOTES_FILE):
        print(f"Error: {NOTES_FILE} not found!")
        return

    with open(NOTES_FILE, "r", encoding="utf-8") as f:
        notes = json.load(f)

    existing_idx = next((i for i, n in enumerate(notes) if n.get("id") == new_note["id"] or n.get("slug") == new_note["slug"]), None)

    if existing_idx is not None:
        print(f"Updating existing note at index {existing_idx}...")
        notes[existing_idx] = new_note
    else:
        print("Inserting new Cell Biology note...")
        notes.append(new_note)

    with open(NOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(notes, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {new_note['id']} with bilingual toggle architecture!")

if __name__ == "__main__":
    main()
