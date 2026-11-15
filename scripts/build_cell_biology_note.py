import json
import os
from datetime import datetime

# Path to chapter notes data
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
      <!-- Gradients -->
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
      <!-- Panel Header -->
      <rect x="0" y="0" width="380" height="430" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <rect x="20" y="16" width="130" height="28" rx="6" fill="#1e3a8a" opacity="0.6"/>
      <text x="85" y="35" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">ANIMAL CELL</text>
      <text x="85" y="54" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">जंतु कोशिका (Flexible & Round)</text>

      <!-- Cell Membrane (Irregular boundary) -->
      <path d="M 190,80 C 290,75 350,140 345,240 C 340,330 270,390 190,385 C 100,380 45,320 50,220 C 55,130 110,85 190,80 Z" fill="url(#animalBg)" stroke="#60a5fa" stroke-width="3" stroke-dasharray="none"/>

      <!-- Nucleus (Centered) -->
      <circle cx="190" cy="225" r="48" fill="url(#nucleusGrad)" stroke="#c084fc" stroke-width="2.5"/>
      <circle cx="185" cy="220" r="16" fill="#f3e8ff" opacity="0.9"/>
      <text x="190" y="285" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Nucleus (केंद्रक)</text>

      <!-- Mitochondria 1 & 2 -->
      <g transform="translate(100, 140) rotate(-25)">
        <rect x="0" y="0" width="46" height="24" rx="12" fill="url(#mitoGrad)" stroke="#fb923c" stroke-width="1.5"/>
        <path d="M 8,12 Q 14,5 20,12 T 32,12 T 40,12" fill="none" stroke="#fed7aa" stroke-width="2"/>
      </g>
      <text x="120" y="180" fill="#fdba74" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Mitochondria (पावरहाउस)</text>

      <g transform="translate(265, 290) rotate(35)">
        <rect x="0" y="0" width="44" height="22" rx="11" fill="url(#mitoGrad)" stroke="#fb923c" stroke-width="1.5"/>
        <path d="M 8,11 Q 14,4 20,11 T 30,11 T 38,11" fill="none" stroke="#fed7aa" stroke-width="2"/>
      </g>

      <!-- Endoplasmic Reticulum (Near Nucleus) -->
      <path d="M 230,195 Q 265,185 270,210 Q 275,235 240,235" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 235,180 Q 285,170 290,205 Q 295,245 245,250" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      <text x="275" y="165" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Endoplasmic Reticulum</text>

      <!-- Golgi Apparatus -->
      <path d="M 125,295 Q 165,310 170,290" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 120,305 Q 165,325 175,302" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 125,317 Q 165,338 178,315" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/>
      <text x="110" y="340" fill="#fde047" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Golgi Body (गॉल्जी काय)</text>

      <!-- Centrosome / Centrioles (Unique to animal cells) -->
      <g transform="translate(255, 120)">
        <rect x="0" y="0" width="7" height="18" rx="2" fill="#ec4899"/>
        <rect x="5" y="8" width="18" height="7" rx="2" fill="#ec4899"/>
        <circle cx="10" cy="10" r="16" fill="none" stroke="#f472b6" stroke-width="1" stroke-dasharray="2,2"/>
        <text x="32" y="14" fill="#f472b6" font-family="system-ui, sans-serif" font-size="11" font-weight="800">Centrosome ⭐</text>
        <text x="32" y="26" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9">(तारककाय - केवल जंतु में)</text>
      </g>

      <!-- Lysosomes (Suicidal bags) -->
      <circle cx="100" cy="245" r="10" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <circle cx="120" cy="235" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="65" y="270" fill="#f87171" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Lysosome (आत्मघाती थैली)</text>

      <!-- Key Label for Membrane -->
      <line x1="60" y1="120" x2="20" y2="105" stroke="#94a3b8" stroke-width="1"/>
      <text x="18" y="100" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Plasma Membrane Only</text>
      <text x="18" y="112" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9">(कोई कोशिका भित्ति नहीं)</text>
    </g>

    <!-- RIGHT PANEL: PLANT CELL -->
    <g transform="translate(480, 20)">
      <!-- Panel Header -->
      <rect x="0" y="0" width="380" height="430" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <rect x="20" y="16" width="130" height="28" rx="6" fill="#065f46" opacity="0.6"/>
      <text x="85" y="35" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">PLANT CELL</text>
      <text x="85" y="54" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">पादप कोशिका (Rigid & Rectangular)</text>

      <!-- Outer Rigid Cell Wall (Double boundary) -->
      <polygon points="60,90 320,80 345,360 85,385 45,230" fill="none" stroke="#10b981" stroke-width="7" stroke-linejoin="round"/>
      <polygon points="65,96 315,86 339,354 89,378 51,228" fill="url(#plantBg)" stroke="#34d399" stroke-width="2" stroke-linejoin="round"/>

      <!-- Large Central Vacuole (Unique feature) -->
      <path d="M 120,170 C 230,140 270,180 260,280 C 250,335 170,350 125,320 C 95,290 80,210 120,170 Z" fill="url(#vacuoleGrad)" stroke="#38bdf8" stroke-width="2"/>
      <text x="180" y="245" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="800" text-anchor="middle">Large Central Vacuole</text>
      <text x="180" y="262" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle">विशाल केंद्रीय रसधानी (Tonoplast)</text>
      <text x="180" y="276" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Occupies up to 90% volume</text>

      <!-- Chloroplasts (Unique feature) -->
      <g transform="translate(85, 115) rotate(15)">
        <rect x="0" y="0" width="46" height="26" rx="13" fill="url(#chloroGrad)" stroke="#4ade80" stroke-width="1.5"/>
        <line x1="12" y1="6" x2="12" y2="20" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="23" y1="6" x2="23" y2="20" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="34" y1="6" x2="34" y2="20" stroke="#bbf7d0" stroke-width="2"/>
      </g>
      <text x="75" y="158" fill="#4ade80" font-family="system-ui, sans-serif" font-size="10" font-weight="800">Chloroplast ⭐</text>
      <text x="75" y="169" fill="#86efac" font-family="system-ui, sans-serif" font-size="9">(हरितलवक - प्रकाश संश्लेषण)</text>

      <g transform="translate(265, 315) rotate(-20)">
        <rect x="0" y="0" width="44" height="24" rx="12" fill="url(#chloroGrad)" stroke="#4ade80" stroke-width="1.5"/>
        <line x1="11" y1="5" x2="11" y2="19" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="22" y1="5" x2="22" y2="19" stroke="#bbf7d0" stroke-width="2"/>
        <line x1="33" y1="5" x2="33" y2="19" stroke="#bbf7d0" stroke-width="2"/>
      </g>

      <!-- Nucleus (Pushed to periphery/side by vacuole) -->
      <circle cx="280" cy="140" r="38" fill="url(#nucleusGrad)" stroke="#c084fc" stroke-width="2"/>
      <circle cx="275" cy="135" r="12" fill="#f3e8ff" opacity="0.9"/>
      <text x="280" y="190" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Nucleus (परिधीय केंद्रक)</text>

      <!-- Mitochondria in plant cell -->
      <g transform="translate(265, 230) rotate(45)">
        <rect x="0" y="0" width="38" height="20" rx="10" fill="url(#mitoGrad)" stroke="#fb923c" stroke-width="1.5"/>
      </g>

      <!-- Distinctive Features Callouts -->
      <line x1="320" y1="80" x2="355" y2="60" stroke="#10b981" stroke-width="1.5"/>
      <text x="355" y="55" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="800">Cell Wall (कोशिका भित्ति) ⭐</text>
      <text x="355" y="68" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="9">Cellulose & Pectin से निर्मित</text>

      <rect x="18" y="395" width="345" height="22" rx="4" fill="#064e3b" opacity="0.7"/>
      <text x="190" y="410" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">💡 मुख्य अंतर: पादप कोशिका में तारककाय (Centrosome) नहीं होता</text>
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
    <p style="color: #9ca3af; font-size: 13px; margin: 0;">अंतरावस्था (95% समय) ➔ पूर्वावस्था ➔ मध्यावस्था ➔ पश्चावस्था ➔ अंत्यावस्था</p>
  </div>

  <svg viewBox="0 0 880 380" width="100%" height="auto" style="display: block; max-width: 100%; border-radius: 12px;" xmlns="http://www.w3.org/2000/svg">
    <!-- LEFT: Interphase Circle -->
    <g transform="translate(140, 180)">
      <circle cx="0" cy="0" r="110" fill="none" stroke="#1f2937" stroke-width="36"/>
      <path d="M 0,-110 A 110,110 0 0,1 104,35" fill="none" stroke="#3b82f6" stroke-width="32" stroke-linecap="butt"/>
      <path d="M 104,35 A 110,110 0 0,1 -65,88" fill="none" stroke="#a855f7" stroke-width="32" stroke-linecap="butt"/>
      <path d="M -65,88 A 110,110 0 0,1 -105,-35" fill="none" stroke="#10b981" stroke-width="32" stroke-linecap="butt"/>
      <path d="M -105,-35 A 110,110 0 0,1 0,-110" fill="none" stroke="#f43f5e" stroke-width="38" stroke-linecap="round"/>

      <circle cx="0" cy="0" r="75" fill="#0f172a"/>
      <text x="0" y="-12" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="800" text-anchor="middle">INTERPHASE</text>
      <text x="0" y="8" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">अंतरावस्था (95% समय)</text>
      <text x="0" y="26" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">तैयारी एवं डीएनए प्रतिकृति</text>

      <text x="70" y="-45" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="13" font-weight="800">G₁ Phase</text>
      <text x="70" y="-30" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9">Cell Growth (वृद्धि)</text>

      <text x="35" y="80" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="13" font-weight="800">S Phase ⭐</text>
      <text x="35" y="95" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="9">DNA Replication</text>

      <text x="-95" y="45" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="13" font-weight="800">G₂ Phase</text>
      <text x="-95" y="60" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="9">प्रोटीन निर्माण</text>

      <text x="-75" y="-85" fill="#fda4af" font-family="system-ui, sans-serif" font-size="13" font-weight="800">M Phase</text>
      <text x="-75" y="-72" fill="#fecdd3" font-family="system-ui, sans-serif" font-size="9">विभाजन (5% समय)</text>
    </g>

    <!-- RIGHT: 4 Stages of Mitosis -->
    <!-- Prophase -->
    <g transform="translate(320, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#2563eb"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">1. PROPHASE (पूर्वावस्था)</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="3,3"/>
      <path d="M 50,60 L 74,80 M 74,60 L 50,80" stroke="#f43f5e" stroke-width="2.5"/>
      <path d="M 56,55 L 68,85 M 68,55 L 56,85" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="62" y="115" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="600">गुणसूत्र संघनित होते हैं</text>
      <text x="62" y="127" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">केंद्रक झिल्ली विलुप्त</text>
    </g>

    <!-- Arrow 1 -->
    <polygon points="468,112 462,108 462,116" fill="#60a5fa"/>

    <!-- Metaphase -->
    <g transform="translate(475, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#7c3aed"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">2. METAPHASE ⭐</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
      <line x1="62" y1="42" x2="62" y2="98" stroke="#e9d5ff" stroke-width="1" stroke-dasharray="2,2"/>
      <rect x="54" y="55" width="16" height="6" rx="2" fill="#ec4899"/>
      <rect x="54" y="67" width="16" height="6" rx="2" fill="#38bdf8"/>
      <rect x="54" y="79" width="16" height="6" rx="2" fill="#f59e0b"/>
      <text x="62" y="115" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="700">मध्य रेखा (Equator) पर संरेखण</text>
      <text x="62" y="127" fill="#c084fc" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">आकार अध्ययन हेतु सर्वोत्तम अवस्था</text>
    </g>

    <!-- Arrow 2 -->
    <polygon points="623,112 617,108 617,116" fill="#a855f7"/>

    <!-- Anaphase -->
    <g transform="translate(630, 45)">
      <rect x="0" y="0" width="125" height="135" rx="10" fill="#1e293b" stroke="#eab308" stroke-width="2"/>
      <rect x="0" y="0" width="125" height="26" rx="10" fill="#ca8a04"/>
      <text x="62" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">3. ANAPHASE (पश्चावस्था)</text>
      <circle cx="62" cy="70" r="30" fill="#0f172a" stroke="#facc15" stroke-width="1.5"/>
      <path d="M 45,58 L 40,65 L 45,72" fill="none" stroke="#ec4899" stroke-width="2.5"/>
      <path d="M 79,58 L 84,65 L 79,72" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="62" y="115" fill="#fef08a" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" font-weight="700">क्रोमैटिड ध्रुवों की ओर खिंचते हैं</text>
      <text x="62" y="127" fill="#ca8a04" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">समसूत्री विभाजन की सबसे छोटी अवस्था</text>
    </g>

    <!-- Telophase & Cytokinesis -->
    <g transform="translate(475, 210)">
      <rect x="0" y="0" width="280" height="145" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <rect x="0" y="0" width="280" height="28" rx="12" fill="#059669"/>
      <text x="140" y="19" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle">4. TELOPHASE & CYTOKINESIS (अंत्यावस्था)</text>
      <circle cx="95" cy="80" r="26" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
      <circle cx="95" cy="80" r="10" fill="#a855f7" opacity="0.6"/>
      <circle cx="185" cy="80" r="26" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
      <circle cx="185" cy="80" r="10" fill="#a855f7" opacity="0.6"/>
      <path d="M 140,55 Q 135,80 140,105" fill="none" stroke="#6ee7b7" stroke-width="2"/>
      <text x="140" y="122" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" font-weight="700">खांच (जंतु) / कोशिका पट्टिका (पादप)</text>
      <text x="140" y="136" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">परिणाम: 2 समान द्विगुणित (2n) संतति कोशिकाएं</text>
    </g>

    <!-- Key Formula / Insight Card on Bottom Left -->
    <g transform="translate(320, 210)">
      <rect x="0" y="0" width="140" height="145" rx="12" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
      <text x="70" y="24" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">⚡ MEIOSIS ALERT</text>
      <text x="70" y="44" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Pachytene (पैकिटीन):</text>
      <text x="70" y="60" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Crossing Over (जीन विनिमय)</text>
      <text x="70" y="74" fill="#818cf8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">Recombinase एंजाइम</text>
      
      <line x1="15" y1="85" x2="125" y2="85" stroke="#4338ca"/>

      <text x="70" y="102" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">Diplotene (डिप्लोटीन):</text>
      <text x="70" y="118" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Chiasmata Formation</text>
      <text x="70" y="132" fill="#818cf8" font-family="system-ui, sans-serif" font-size="8" text-anchor="middle">X-आकार के क्रासिंग बिंदु</text>
    </g>
  </svg>
</div>
"""

# HTML Content of the note
content_html_raw = """
<div class="note-intro-card">
  <h3>⚡ Chapter Quick Crux & Exam Value (अध्याय का त्वरित सार एवं परीक्षा महत्ता)</h3>
  <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0 16px 0;">
    <span style="background: #eff6ff; color: #1d4ed8; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">🎯 लक्ष्य परीक्षाएं: SSC CGL, CHSL, CPO, Railway RRB NTPC, State PCS, CDS</span>
    <span style="background: #ecfdf5; color: #047857; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">📊 अपेक्षित प्रश्न: 2 से 3 सीधे प्रश्न (4 से 6 अंक निश्चित)</span>
    <span style="background: #fef3c7; color: #b45309; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fde68a;">⏱️ त्वरित पुनरावृत्ति समय: 12–15 मिनट</span>
  </div>
  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
    <strong>अध्याय का मूल मंत्र (Core Concept):</strong> कोशिका जीव विज्ञान (Cytology) सामान्य विज्ञान का वह सर्वाधिक स्कोरिंग आधार है जिससे हर सरकारी परीक्षा में खोजकर्ताओं (Discoveries), कोशिकांगों के उपनाम (Organelle Nicknames), पादप व जंतु कोशिका में अंतर तथा समसूत्री व अर्धसूत्री विभाजन (Mitosis & Meiosis stages) से सीधे प्रश्न पूछे जाते हैं। नीचे दी गई अवधारणाओं को द्विभाषी (Bilingual) रूप में कंठस्थ कर लें।
  </p>
</div>

<h2>1. The Cell: Fundamental Unit of Life (कोशिका: जीवन की मौलिक इकाई)</h2>
<p>Just as bricks assemble to form a building, billions of microscopic cells unite to create living organisms. A <strong>Cell</strong> is scientifically defined as the <em>structural and functional unit of all living organisms</em> capable of independent existence and executing fundamental life processes.</p>

<div class="hindi-note">
  <strong>📖 हिंदी में सरल समझ:</strong> जिस प्रकार ईंटों को जोड़कर एक विशाल भवन का निर्माण होता है, ठीक उसी प्रकार सजीवों का संपूर्ण शरीर सूक्ष्म कोशिकाओं से मिलकर बना होता है। <strong>कोशिका (Cell)</strong> जीवन की सबसे छोटी <em>संरचनात्मक (Structural)</em> और <em>कार्यात्मक (Functional)</em> इकाई है, जो स्वतंत्र रूप से जीवित रहकर सभी जैविक क्रियाएं (श्वसन, पोषण, उत्सर्जन, प्रजनन) संचालित करने में सक्षम होती है।
</div>

<div class="callout-box info">
  <p><strong>💡 Historical Discoveries That Form Direct Exam MCQs (प्रमुख ऐतिहासिक खोजें):</strong></p>
  <ul>
    <li><strong>Robert Hooke (1665):</strong> सर्वप्रथम कॉर्क (पेड़ की छाल) के पतले टुकड़े में मृत कोशिकाओं को देखा और उन्हें <em>"Cell"</em> (लैटिन शब्द <em>Cellula</em> = छोटा कमरा) नाम दिया। इनकी प्रसिद्ध पुस्तक का नाम <strong>Micrographia</strong> है।</li>
    <li><strong>Antonie van Leeuwenhoek (1674):</strong> स्वनिर्मित उन्नत सूक्ष्मदर्शी से सर्वप्रथम <strong>जीवित कोशिका (Live Cell)</strong> (जीवाणु, प्रोटोजोआ, शुक्राणु, RBC) को देखा और वर्णित किया। इन्हें <em>'सूक्ष्म जीव विज्ञान का जनक' (Father of Microbiology)</em> कहा जाता है।</li>
    <li><strong>Robert Brown (1831):</strong> आर्किड पौधे की जड़ों की कोशिकाओं में सर्वप्रथम <strong>केंद्रक (Nucleus)</strong> की खोज की।</li>
    <li><strong>J. E. Purkinje (1839):</strong> कोशिका के भीतर मौजूद तरल सजीव पदार्थ को <strong>जीवद्रव्य (Protoplasm)</strong> नाम दिया। प्रसिद्ध जीवविज्ञानी टी. एच. हक्सले ने जीवद्रव्य को <em>"जीवन का भौतिक आधार" (Physical Basis of Life)</em> कहा।</li>
  </ul>
</div>

<h3>The Classical & Modern Cell Theory (कोशिका सिद्धांत)</h3>
<p>In 1838–1839, German botanist <strong>Matthias Schleiden</strong> and British zoologist <strong>Theodor Schwann</strong> formulated the classical Cell Theory:</p>
<ol>
  <li>All living organisms (plants and animals) are composed of cells and products of cells.</li>
  <li>The cell is the basic structural and functional unit of life.</li>
</ol>
<p>However, classical cell theory could not explain <em>how new cells arise</em>. In 1855, German pathologist <strong>Rudolf Virchow</strong> gave the modern shape with his historic aphorism: <br/>
<strong style="color: #4338ca; font-size: 15px;">"Omnis cellula-e-cellula"</strong> — meaning <em>"All cells arise from pre-existing cells through cell division"</em>.</p>

<div class="hindi-note">
  <strong>📖 कोशिका सिद्धांत का हिंदी सार:</strong> श्लीडेन (1838) एवं श्वान (1839) ने प्रतिपादित किया कि सभी पौधे और जंतु कोशिकाओं से बने होते हैं। लेकिन वे यह नहीं समझा सके कि नई कोशिकाएं कैसे बनती हैं। 1855 में <strong>रुडोल्फ विरचो</strong> ने सिद्धांत को पूर्ण करते हुए कहा कि <em>"सभी नई कोशिकाएं पूर्ववर्ती (पहले से मौजूद) कोशिकाओं के विभाजन से ही उत्पन्न होती हैं" (Omnis cellula-e-cellula)</em>।
</div>

<div class="callout-box alert">
  <p><strong>🔥 Crucial Exam Exception (परीक्षा अपवाद):</strong> <strong>Viruses (विषाणु), Viroids एवं Prions</strong> कोशिका सिद्धांत के <u>अपवाद (Exception)</u> हैं क्योंकि इनमें न तो स्वतंत्र कोशिका संरचना होती है और न ही कोशिकाद्रव्य। ये जीवित पोषी के बाहर निर्जीव कणों की भांति रहते हैं!</p>
</div>

<h2>2. Cell Dimensions & Extremes (आकार और परिमाप के विश्व रिकॉर्ड)</h2>
<p>Government exams frequently test factual extremes regarding cell dimensions:</p>
<table class="notes-table">
  <thead>
    <tr>
      <th>Category (श्रेणी)</th>
      <th>Record Holder (विश्व रिकॉर्ड धारक)</th>
      <th>Approximate Dimension / Note (महत्वपूर्ण तथ्य)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Smallest Known Cell on Earth (पृथ्वी की सबसे छोटी कोशिका)</strong></td>
      <td><em>Mycoplasma gallisepticum</em> (PPLO - Pleuropneumonia-like organisms)</td>
      <td><strong>0.1 से 0.3 μm</strong> (इसमें कोशिका भित्ति नहीं होती, पेनिसिलिन का असर नहीं होता)</td>
    </tr>
    <tr>
      <td><strong>Largest Single Cell on Earth (सबसे बड़ी एकल कोशिका)</strong></td>
      <td>Ostrich Egg (शुतुरमुर्ग का अंडा)</td>
      <td><strong>15 से 18 cm व्यास</strong> (एकल अनिषेचित अंडाणु)</td>
    </tr>
    <tr>
      <td><strong>Longest Cell in Human Body (मानव शरीर की सबसे लंबी कोशिका)</strong></td>
      <td>Neuron / Nerve Cell (तंत्रिका कोशिका)</td>
      <td><strong>90 cm से 1 मीटर</strong> तक लंबी हो सकती है</td>
    </tr>
    <tr>
      <td><strong>Largest Cell in Human Body (मानव शरीर की सबसे बड़ी कोशिका)</strong></td>
      <td>Female Ovum / Egg Cell (मादा डिंब / अंडाणु)</td>
      <td><strong>~120 से 150 μm</strong> (नग्न आंखों से दृश्यमान)</td>
    </tr>
    <tr>
      <td><strong>Smallest Cell in Human Body (मानव शरीर की सबसे छोटी कोशिका)</strong></td>
      <td>Cerebellar Granule Neuron / Male Sperm cell (शुक्राणु)</td>
      <td><strong>~4 से 5 μm</strong></td>
    </tr>
  </tbody>
</table>

<h2>3. Prokaryotic vs. Eukaryotic Cells (प्रोकेरियोटिक बनाम यूकेरियोटिक)</h2>
<p>Cells in nature are fundamentally divided into two evolutionary tiers based on their nuclear organization:</p>
<table class="notes-table">
  <thead>
    <tr>
      <th>Feature (लक्षण)</th>
      <th>Prokaryotic Cell (असीमकेन्द्रकी / प्राचीन)</th>
      <th>Eukaryotic Cell (ससीमकेन्द्रकी / विकसित)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Etymology (शाब्दिक अर्थ)</strong></td>
      <td><em>Pro</em> = आदिम/प्राचीन; <em>Karyon</em> = केंद्रक</td>
      <td><em>Eu</em> = वास्तविक/सत्य; <em>Karyon</em> = केंद्रक</td>
    </tr>
    <tr>
      <td><strong>Nucleus & Membrane (केंद्रक एवं झिल्ली)</strong></td>
      <td><strong>अनुपस्थित।</strong> आनुवंशिक पदार्थ (वृत्ताकार डीएनए) कोशिकाद्रव्य में नग्न पड़ा रहता है जिसे <strong>Nucleoid (केंद्रकाभ)</strong> कहते हैं।</td>
      <td><strong>सुविकसित केंद्रक उपस्थित।</strong> रेखीय डीएनए दोहरी केंद्रक झिल्ली (Nuclear Envelope) से सुरक्षित रहता है।</td>
    </tr>
    <tr>
      <td><strong>Histone Proteins (हिस्टोन प्रोटीन)</strong></td>
      <td>अनुपस्थित (डीएनए नग्न होता है)।</td>
      <td>उपस्थित (डीएनए क्षारीय हिस्टोन प्रोटीन के साथ गुणसूत्र बनाता है)।</td>
    </tr>
    <tr>
      <td><strong>Ribosomes (राइबोसोम)</strong></td>
      <td><strong>70S</strong> प्रकार (सबयूनिट्स: 50S + 30S)।</td>
      <td>कोशिकाद्रव्य में <strong>80S</strong> (60S + 40S); माइटोकॉन्ड्रिया व क्लोरोप्लास्ट में 70S।</td>
    </tr>
    <tr>
      <td><strong>Membrane-Bound Organelles (झिल्लीयुक्त कोशिकांग)</strong></td>
      <td><strong>पूर्णतः अनुपस्थित</strong> (माइटोकॉन्ड्रिया, गॉल्जी, ईआर, लाइसोसोम, लवक कुछ नहीं होता)।</td>
      <td><strong>उपस्थित</strong> (विशिष्ट कार्यों हेतु अलग-अलग झिल्लीयुक्त अंगक होते हैं)।</td>
    </tr>
    <tr>
      <td><strong>Cell Wall (कोशिका भित्ति)</strong></td>
      <td>जीवाणुओं में <strong>पेप्टिडोग्लाइकेम (Peptidoglycan / Murein)</strong> की बनी होती है।</td>
      <td>पादपों में <strong>सेल्युलोज</strong>; कवकों में <strong>काइटिन</strong>; जंतुओं में अनुपस्थित।</td>
    </tr>
    <tr>
      <td><strong>Cell Division (कोशिका विभाजन)</strong></td>
      <td>असूत्री विभाजन / विखंडन (Amitosis / Fission, कोई स्पिंडल तंतु नहीं)।</td>
      <td>समसूत्री (Mitosis) एवं अर्धसूत्री (Meiosis) विभाजन।</td>
    </tr>
    <tr>
      <td><strong>Examples (उदाहरण)</strong></td>
      <td>जीवाणु (Bacteria), नील-हरित शैवाल (Cyanobacteria), माइकोप्लाज्मा।</td>
      <td>अमीबा, प्रोटिस्टा, कवक, सभी पादप एवं मनुष्य सहित समस्त जंतु।</td>
    </tr>
  </tbody>
</table>

<h2>4. Cell Organelles: The Cellular Machinery (प्रमुख कोशिकांग एवं उनकी कार्यप्रणाली)</h2>
<p>Inside the cytoplasm of eukaryotic cells reside specialized sub-cellular engines known as <strong>Organelles</strong>. Each performs an indispensable biochemical duty:</p>

__SVG_1__

<h3>A. Plasma Membrane / Cell Membrane (प्लाज्मा झिल्ली / कोशिका कला)</h3>
<p>The flexible, selectively permeable outer boundary of all living cells.</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह प्रत्येक जीवित कोशिका का सबसे बाहरी लचीला सुरक्षा आवरण है जो <em>चयनात्मक पारगम्य (Selectively Permeable)</em> होता है—अर्थात यह केवल उपयोगी पदार्थों (जल, ऑक्सीजन, पोषक तत्व) को अंदर आने देता है और हानिकारक अपशिष्टों को बाहर निकालता है।
</div>
<ul>
  <li><strong>Fluid Mosaic Model (तरल मोज़ेक मॉडल - 1972):</strong> वैज्ञानिक <strong>एस. जे. सिंगर एवं जी. एल. निकोलसन</strong> द्वारा प्रस्तुत किया गया। इसे <em>"फॉस्फोलिपिड के समुद्र में तैरते हुए प्रोटीन के हिमखंड"</em> कहा जाता है।</li>
  <li><strong>Composition (रासायनिक संघटन):</strong> यह मुख्य रूप से <strong>फॉस्फोलिपिड द्विपारत (Bilayer)</strong> और प्रोटीन से मिलकर बनी होती है। इसके जल-स्नेही (Hydrophilic) सिरे बाहर की ओर तथा जल-विरोधी (Hydrophobic) पूंछ अंदर की ओर होती है।</li>
  <li><strong>Functions:</strong> विसरण (Diffusion) और परासरण (Osmosis) द्वारा पदार्थों का परिवहन; सक्रिय परिवहन (Active Transport) में ATP ऊर्जा खर्च करके आयनों का आदान-प्रदान (उदा. $Na^+/K^+$ पंप)।</li>
</ul>

<h3>B. Cell Wall (कोशिका भित्ति)</h3>
<p>A non-living, rigid, fully permeable protective wall present outside the plasma membrane in plant, fungal, and bacterial cells (<strong>completely absent in animal cells</strong>).</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह पादप कोशिका को यांत्रिक मजबूती, कठोरता और निश्चित आकार प्रदान करती है तथा कोशिका को फटने से बचाती है। यह <strong>पूर्णतः पारगम्य (Fully Permeable)</strong> और निर्जीव होती है। <u>जंतु कोशिका में कोशिका भित्ति कभी नहीं पाई जाती!</u>
</div>
<ul>
  <li><strong>पादप कोशिका भित्ति (Plant Cell Wall):</strong> मुख्य रूप से <strong>सेल्युलोज (Cellulose), हेमीसेल्युलोज और पेक्टिन</strong> की बनी होती है। सेल्युलोज पृथ्वी पर सर्वाधिक पाया जाने वाला कार्बनिक बहुलक है।</li>
  <li><strong>कवक कोशिका भित्ति (Fungal Cell Wall):</strong> <strong>काइटिन (Chitin)</strong> नामक नाइट्रोजनयुक्त पॉलीसैकराइड से बनी होती है।</li>
  <li><strong>जीवाणु कोशिका भित्ति (Bacterial Cell Wall):</strong> <strong>पेप्टिडोग्लाइकेन (Peptidoglycan)</strong> की बनी होती है।</li>
</ul>

<h3>C. Nucleus (केंद्रक) — The Director / Brain of the Cell</h3>
<p>Discovered by <strong>Robert Brown (1831)</strong>. Referred to as the <em>"Brain / Controller of the Cell"</em>.</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> केंद्रक कोशिका का 'कंट्रोल रूम' अथवा 'मस्तिष्क' कहलाता है क्योंकि यह कोशिका की समस्त उपापचयी क्रियाओं और आनुवंशिक सूचनाओं का नियंत्रण करता है।
</div>
<ul>
  <li><strong>Nuclear Envelope (केंद्रक झिल्ली):</strong> दोहरी झिल्ली वाला आवरण जिसमें सूक्ष्म केंद्रक छिद्र (Nuclear Pores) होते हैं जो केंद्रक और कोशिकाद्रव्य के बीच RNA और प्रोटीन का परिवहन करते हैं।</li>
  <li><strong>Chromatin Network (क्रोमैटिन जाल):</strong> केंद्रक में धागे जैसी संरचना जो <strong>डीएनए (~40%) और क्षारीय हिस्टोन प्रोटीन (~50%)</strong> से मिलकर बनी होती है। कोशिका विभाजन के समय यही संघनित होकर स्पष्ट <strong>गुणसूत्र (Chromosomes)</strong> बनाती है।</li>
  <li><strong>Nucleolus (केंद्रिका):</strong> केंद्रक के अंदर सघन गोलाकार भाग जिसकी खोज फेलिस फोंटाना ने की थी। इसे <strong>"राइबोसोम की फैक्ट्री" (Ribosome Factory)</strong> कहा जाता है क्योंकि यह rRNA का संश्लेषण करती है।</li>
</ul>

<h3>D. Mitochondria (माइटोकॉन्ड्रिया) — The Powerhouse of the Cell (कोशिका का ऊर्जा घर)</h3>
<p>Discovered by <strong>Richard Altmann (1890)</strong> (who called them <em>'Bioblasts'</em>); the term <em>'Mitochondria'</em> was coined by <strong>Carl Benda (1898)</strong>.</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह कोशिका का श्वसन स्थल है जहां ग्लूकोज के विखंडन से ऊर्जा उत्पन्न होती है। इसी कारण इसे <strong>"कोशिका का पावरहाउस" (Powerhouse of the Cell)</strong> कहते हैं।
</div>
<ul>
  <li><strong>संरचना (Cristae):</strong> यह दोहरी झिल्ली वाला अंगक है। इसकी भीतरी झिल्ली उंगलियों जैसी रचनाओं में मुड़ी होती है जिन्हें <strong>क्रिस्टी (Cristae)</strong> कहते हैं। यह सतह का क्षेत्रफल बढ़ाती हैं।</li>
  <li><strong>ऊर्जा उत्पादन (ATP):</strong> यहां <strong>क्रेब्स चक्र (Krebs Cycle / वायवीय श्वसन)</strong> संपन्न होता है, जिससे ऊर्जा <strong>ATP (Adenosine Triphosphate)</strong> के रूप में संचित होती है। ATP को <em>"कोशिका की ऊर्जा मुद्रा" (Energy Currency of the Cell)</em> कहा जाता है।</li>
  <li><strong>अर्ध-स्वायत्त अंगक (Semi-Autonomous Organelle):</strong> माइटोकॉन्ड्रिया के पास अपना स्वयं का <strong>वृत्ताकार डीएनए (Circular DNA) और 70S राइबोसोम</strong> होता है, इसलिए यह अपने कुछ प्रोटीन स्वयं बना सकता है और स्वतः विभाजित हो सकता है!</li>
</ul>

<div class="callout-box info">
  <p><strong>💡 SSC PYQ Fact:</strong> स्तनधारियों की परिपक्व लाल रक्त कोशिकाओं (Mature Mammalian RBCs) में माइटोकॉन्ड्रिया <strong>अनुपस्थित</strong> होता है, ताकि वे जिस ऑक्सीजन को ढो रही हैं, उसका स्वयं उपभोग न कर लें!</p>
</div>

<h3>E. Endoplasmic Reticulum - ER (अंतःप्रद्रव्यी जालिका) — आंतरिक परिवहन तंत्र</h3>
<p>An intricate network of interconnected membranous tubules. Discovered by <strong>Keith R. Porter (1945)</strong>.</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह कोशिका के भीतर नलिकाओं का एक विशाल जाल है जो कोशिका कंकाल और अंतःकोशिकीय परिवहन राजमार्ग (Highway) का कार्य करता है।
</div>
<ul>
  <li><strong>खुरदरी अंतःप्रद्रव्यी जालिका (Rough ER - RER):</strong> इसकी सतह पर राइबोसोम चिपके होते हैं। इसका मुख्य कार्य <strong>प्रोटीन का संश्लेषण एवं परिवहन</strong> करना है।</li>
  <li><strong>चिकनी अंतःप्रद्रव्यी जालिका (Smooth ER - SER):</strong> इसकी सतह पर राइबोसोम नहीं होते। इसका मुख्य कार्य <strong>लिपिड (वसा), फॉस्फोलिपिड और स्टेरॉयड हार्मोन</strong> (जैसे टेस्टोस्टेरोन व एस्ट्रोजन) का निर्माण करना तथा यकृत (Liver) में <strong>दवाइयों और विषैले पदार्थों का विषहरण (Detoxification)</strong> करना है।</li>
</ul>

<h3>F. Ribosomes (राइबोसोम) — The Protein Factories (प्रोटीन की फैक्ट्री)</h3>
<p>Discovered by Romanian-American biologist <strong>George E. Palade (1955)</strong> (hence called <em>Palade Particles</em>).</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह कोशिका का सबसे छोटा अंगक है जिस पर <u>कोई झिल्ली नहीं होती</u>। यह rRNA और प्रोटीन से निर्मित होता है। इसका एकमात्र सबसे महत्वपूर्ण कार्य <strong>प्रोटीन निर्माण (Protein Synthesis)</strong> करना है, इसलिए इसे <strong>"कोशिका की प्रोटीन फैक्ट्री"</strong> कहा जाता है।
</div>

<h3>G. Golgi Apparatus / Golgi Complex (गॉल्जी उपकरण / गॉल्जी काय)</h3>
<p>Discovered by Italian physician <strong>Camillo Golgi (1898)</strong> in the nerve cells of a barn owl (Nobel Prize in 1906).</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह समानांतर थैलियों (सिस्टर्नी) का समूह है। पादपों में इसे <strong>डिक्टियोसोम (Dictyosome)</strong> कहते हैं। इसका मुख्य कार्य प्रोटीन और वसा की <em>पैकेजिंग, रूपांतरण (ग्लाइकोसिलेशन) एवं स्रावण</em> करना है। इसलिए इसे कोशिका का <strong>"डाकघर" (Post Office)</strong> अथवा <strong>"ट्रैफिक पुलिस" (Traffic Police)</strong> कहा जाता है। यह <strong>लाइसोसोम का निर्माण</strong> भी करता है।
</div>

<h3>H. Lysosomes (लाइसोसोम) — The Suicidal Bags of the Cell (आत्मघाती थैली)</h3>
<p>Discovered by Belgian cytologist <strong>Christian de Duve (1955)</strong> (Nobel Prize in 1974).</p>
<div class="hindi-note">
  <strong>📖 हिंदी में समझ:</strong> यह एकल झिल्ली वाली सूक्ष्म थैली होती है जिसमें लगभग 50 प्रकार के शक्तिशाली <strong>अम्लीय हाइड्रोलाइटिक पाचक एंजाइम (Acidic Hydrolytic Enzymes)</strong> भरे होते हैं (जो pH 4.5–5.0 पर कार्य करते हैं)।
</div>
<ul>
  <li><strong>आत्मघाती थैली (Suicidal Bag) क्यों कहते हैं?</strong> जब कोशिका क्षतिग्रस्त, वृद्ध या संक्रमित हो जाती है, तो लाइसोसोम फट जाते हैं और इसके पाचक एंजाइम अपनी ही कोशिका का पाचन करके उसे नष्ट कर देते हैं (Autolysis)।</li>
  <li><strong>सफाईकर्मी (Cell Scavenger):</strong> यह मृत व टूटे-फूटे कोशिकांगों को पचाकर कोशिका की सफाई करता है (Autophagy)।</li>
</ul>

<h3>I. Plastids (लवक) — केवल पादप कोशिकाओं में</h3>
<p>Discovered by Ernst Haeckel (1866). Found strictly in plant cells and photosynthetic algae. Categorized into 3 functional varieties:</p>
<div class="hindi-note">
  <strong>📖 लवक के तीन प्रकार (हिंदी विवरण):</strong>
  <ul>
    <li><strong>1. हरितलवक (Chloroplast / कोशिका की रसोई):</strong> दोहरी झिल्ली वाला अंगक जिसमें स्वयं का डीएनए व 70S राइबोसोम होता है। इसमें <strong>क्लोरोफिल (पर्णहरित)</strong> वर्णक होता है जिसके केंद्र में <strong>मैग्नीशियम ($Mg^{2+}$) धातु आयन</strong> पाया जाता है। यह प्रकाश संश्लेषण द्वारा भोजन बनाता है।</li>
    <li><strong>2. वर्णीलवक (Chromoplast):</strong> रंगीन वर्णक जो फूलों और फलों को आकर्षक रंग प्रदान करते हैं:
      <ul>
        <li><em>लाइकोपीन (Lycopene):</em> टमाटर का लाल रंग।</li>
        <li><em>कैरोटीन (Carotene):</em> गाजर का नारंगी रंग।</li>
        <li><em>बीटालेन (Betalain):</em> चुकंदर का गहरा बैंगनी-लाल रंग।</li>
        <li><em>जैंथोफिल (Xanthophyll):</em> पत्तियों का पीला रंग।</li>
      </ul>
    </li>
    <li><strong>3. अवर्णीलवक (Leucoplast):</strong> रंगहीन लवक जो भूमिगत जड़ों और तनों में खाद्य संचय का कार्य करते हैं (एमाइलोप्लास्ट = स्टार्च/आलू, इलाइओप्लास्ट = वसा/तेल, एल्यूरोप्लास्ट = प्रोटीन/मक्का)।</li>
  </ul>
</div>

<h3>J. Vacuoles (रसधानी / रिक्तिका)</h3>
<p>In mature plant cells, a single <strong>Large Central Vacuole</strong> occupies up to <strong>90% of the entire cell volume</strong>, pushing the nucleus to the perimeter.</p>
<div class="hindi-note">
  <strong>📖 टोनोप्लास्ट (Tonoplast) क्या है?</strong> पादप रसधानी के चारों ओर पाई जाने वाली अर्ध-पारगम्य झिल्ली को <strong>टोनोप्लास्ट</strong> कहते हैं। यह कोशिका में जल, कोशिका रस और उत्सर्जी पदार्थों का संचय करती है तथा कोशिका की स्फीति (Turgor Pressure / कड़ापन) बनाए रखती है। जंतु कोशिकाओं में रिक्तिकाएं बहुत छोटी और अस्थायी होती हैं।
</div>

<h3>K. Centrosome and Centrioles (तारककाय एवं तारककेंद्र)</h3>
<p>Discovered by Edouard Van Beneden (1883) and described by <strong>Theodor Boveri (1888)</strong>.</p>
<div class="hindi-note">
  <strong>📖 परीक्षा तथ्य:</strong> यह <u>केवल जंतु कोशिकाओं में पाया जाता है</u> (उच्च पादप कोशिकाओं में अनुपस्थित होता है)। इसमें दो तारककेंद्र (Centrioles) होते हैं जिनकी संरचना '9 + 0' सूक्ष्म नलिका प्रारूप वाली होती है। यह कोशिका विभाजन के समय <strong>तर्कु तंतुओं (Spindle Fibers)</strong> का निर्माण करता है।
</div>

<h2>5. Master Organelles Summary Cheat-Sheet (प्रमुख कोशिकांग मास्टर रिवीजन सारणी)</h2>
<p>Quick reference matrix for rapid pre-exam revision:</p>
<table class="notes-table">
  <thead>
    <tr>
      <th>Cell Organelle (कोशिकांग)</th>
      <th>Discovered By (खोजकर्ता)</th>
      <th>Membrane Layers (झिल्ली)</th>
      <th>Primary Biological Duty (मुख्य कार्य)</th>
      <th>Popular Exam Nickname (परीक्षा उपनाम)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Plasma Membrane</strong></td>
      <td>Singer & Nicolson (1972)</td>
      <td>Single Bilayer</td>
      <td>चयनात्मक पारगम्यता एवं पदार्थों का परिवहन</td>
      <td>कोशिका का द्वारपाल (Gatekeeper)</td>
    </tr>
    <tr>
      <td><strong>Cell Wall</strong></td>
      <td>Robert Hooke (1665)</td>
      <td>निर्जीव कठोर आवरण</td>
      <td>संरचनात्मक सहारा एवं सुरक्षा (केवल पादप/कवक/जीवाणु)</td>
      <td>कोशिका की रक्षा प्राचीर</td>
    </tr>
    <tr>
      <td><strong>Nucleus</strong></td>
      <td>Robert Brown (1831)</td>
      <td>दोहरी झिल्ली (Double)</td>
      <td>डीएनए संचय एवं कोशिका की समस्त क्रियाओं का नियंत्रण</td>
      <td><strong>कोशिका का मस्तिष्क / नियंत्रक</strong></td>
    </tr>
    <tr>
      <td><strong>Mitochondria</strong></td>
      <td>Altmann / Benda (1898)</td>
      <td>दोहरी झिल्ली (Double)</td>
      <td>वायवीय श्वसन एवं ATP के रूप में ऊर्जा निर्माण</td>
      <td><strong>कोशिका का पावरहाउस (ऊर्जा घर)</strong></td>
    </tr>
    <tr>
      <td><strong>Chloroplast</strong></td>
      <td>Schimper</td>
      <td>दोहरी झिल्ली (Double)</td>
      <td>प्रकाश संश्लेषण द्वारा कार्बोहाइड्रेट निर्माण</td>
      <td><strong>पादप कोशिका की रसोई (Kitchen)</strong></td>
    </tr>
    <tr>
      <td><strong>Ribosome</strong></td>
      <td>George Palade (1955)</td>
      <td><strong>झिल्ली रहित (None)</strong></td>
      <td>mRNA का अनुवाद कर प्रोटीन का संश्लेषण</td>
      <td><strong>प्रोटीन की फैक्ट्री (Protein Factory)</strong></td>
    </tr>
    <tr>
      <td><strong>Endoplasmic Reticulum</strong></td>
      <td>Keith Porter</td>
      <td>एकल झिल्ली जाल</td>
      <td>RER: प्रोटीन निर्माण; SER: वसा निर्माण व विषहरण</td>
      <td>आंतरिक परिवहन तंत्र / अंतःकंकाल</td>
    </tr>
    <tr>
      <td><strong>Golgi Apparatus</strong></td>
      <td>Camillo Golgi (1898)</td>
      <td>एकल झिल्ली थैलियां</td>
      <td>प्रोटीन व वसा की पैकेजिंग, स्रावण व लाइसोसोम निर्माण</td>
      <td><strong>कोशिका का डाकघर / ट्रैफिक पुलिस</strong></td>
    </tr>
    <tr>
      <td><strong>Lysosome</strong></td>
      <td>Christian de Duve (1955)</td>
      <td>एकल झिल्ली</td>
      <td>अम्लीय एंजाइमों द्वारा अपशिष्ट व क्षतिग्रस्त कोशिका का पाचन</td>
      <td><strong>आत्मघाती थैली / सफाईकर्मी</strong></td>
    </tr>
    <tr>
      <td><strong>Vacuole</strong></td>
      <td>Leeuwenhoek</td>
      <td>एकल (Tonoplast)</td>
      <td>जल व कोशिका रस का संचय; स्फीति दाब नियंत्रण</td>
      <td>कोशिका का जल भंडार (Reservoir)</td>
    </tr>
    <tr>
      <td><strong>Centrosome</strong></td>
      <td>Theodor Boveri (1888)</td>
      <td><strong>झिल्ली रहित (None)</strong></td>
      <td>जंतु कोशिका विभाजन में स्पिंडल तंतुओं का निर्माण</td>
      <td>विभाजन केंद्र (केवल जंतु में)</td>
    </tr>
  </tbody>
</table>

<h2>6. Plant Cell vs. Animal Cell (पादप कोशिका बनाम जंतु कोशिका)</h2>
<p>Questions comparing these two kingdoms are standard across SSC and Railways:</p>
<table class="notes-table">
  <thead>
    <tr>
      <th>Parameter (तुलनात्मक लक्षण)</th>
      <th>Plant Cell (पादप कोशिका)</th>
      <th>Animal Cell (जंतु कोशिका)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Cell Wall (कोशिका भित्ति)</strong></td>
      <td><strong>उपस्थित</strong> (कठोर, सेल्युलोज व पेक्टिन निर्मित)।</td>
      <td><strong>अनुपस्थित</strong> (केवल लचीली प्लाज्मा झिल्ली होती है)।</td>
    </tr>
    <tr>
      <td><strong>Shape & Size (आकार)</strong></td>
      <td>बड़ी, निश्चित आयताकार अथवा बहुभुजाकार।</td>
      <td>अपेक्षाकृत छोटी, अनियमित, लचीली, गोल या अंडाकार।</td>
    </tr>
    <tr>
      <td><strong>Chloroplasts (हरितलवक)</strong></td>
      <td><strong>उपस्थित</strong> (स्वपोषी प्रकाश संश्लेषण हेतु)।</td>
      <td><strong>अनुपस्थित</strong> (विषमपोषी पोषण)।</td>
    </tr>
    <tr>
      <td><strong>Vacuoles (रसधानी)</strong></td>
      <td>एक <strong>अत्यंत विशाल केंद्रीय रसधानी</strong> (90% आयतन घेरती है)।</td>
      <td>छोटी, अनेक तथा अस्थायी रसधानियां।</td>
    </tr>
    <tr>
      <td><strong>Nucleus Position (केंद्रक स्थिति)</strong></td>
      <td>बड़ी रसधानी के कारण <strong>परिधि (किनारे)</strong> की ओर खिसका हुआ।</td>
      <td>कोशिका के <strong>मध्य (केंद्र)</strong> में स्थित।</td>
    </tr>
    <tr>
      <td><strong>Centrosome (तारककाय)</strong></td>
      <td>उच्च पादपों में <strong>अनुपस्थित</strong>।</td>
      <td><strong>उपस्थित</strong> (विभाजन में अत्यंत आवश्यक)।</td>
    </tr>
    <tr>
      <td><strong>Cytokinesis (कोशिकाद्रव्य विभाजन)</strong></td>
      <td><strong>कोशिका पट्टिका विधि (Cell Plate method)</strong> द्वारा (केंद्र से बाहर की ओर)।</td>
      <td><strong>खांच विधि (Cleavage Furrow method)</strong> द्वारा (बाहर से केंद्र की ओर)।</td>
    </tr>
    <tr>
      <td><strong>Stored Food (संचित भोजन)</strong></td>
      <td><strong>मंड (Starch)</strong> के रूप में संचित।</td>
      <td><strong>ग्लाइकोजन (Glycogen / Animal Starch)</strong> के रूप में संचित।</td>
    </tr>
  </tbody>
</table>

<h2>7. Cell Division & The Cell Cycle (कोशिका चक्र एवं विभाजन)</h2>
<p>Every living organism started life as a single-celled fertilized zygote. To multiply, cells undergo the <strong>Cell Cycle</strong>:</p>

__SVG_2__

<h3>A. Interphase (विश्राम या अंतरावस्था) — 95% समय</h3>
<p>The metabolically hyperactive preparatory stage where the cell grows, synthesizes proteins, and duplicates its DNA before physical division:</p>
<div class="hindi-note">
  <strong>📖 अंतरावस्था के तीन चरण:</strong>
  <ul>
    <li><strong>1. $G_1$ चरण (Gap 1):</strong> कोशिका का तीव्र विकास, RNA एवं प्रोटीनों का संश्लेषण तथा कोशिकांगों का दोहरीकरण होता है। गुणसूत्र संख्या $2n$ ही रहती है।</li>
    <li><strong>2. $S$ चरण (Synthesis Phase - <u>सर्वाधिक पूछा जाने वाला तथ्य</u>):</strong> इस चरण में <strong>डीएनए की प्रतिकृति (DNA Replication)</strong> होती है! डीएनए की मात्रा दोगुनी ($2C$ से $4C$) हो जाती है, किंतु <u>गुणसूत्रों की संख्या अपरिवर्तित ($2n$)</u> रहती है।</li>
    <li><strong>3. $G_2$ चरण (Gap 2):</strong> स्पिंडल तंतु निर्माण हेतु ट्यूबुलिन प्रोटीन का निर्माण तथा विभाजन की अंतिम तैयारी।</li>
    <li><strong>$G_0$ चरण (शांत अवस्था / Quiescent Stage):</strong> जो कोशिकाएं विभाजन चक्र से बाहर निकल जाती हैं और विभाजित नहीं होतीं (जैसे मस्तिष्क की परिपक्व तंत्रिका कोशिकाएं व हृदय की पेशियां)। वे सक्रिय रहती हैं किंतु विभाजित नहीं होतीं।</li>
  </ul>
</div>

<h3>B. Mitosis (समसूत्री विभाजन) — Equational Division</h3>
<p>Discovered by <strong>Walther Flemming (1882)</strong>. Occurs exclusively in <strong>Somatic (Body) Cells</strong> for growth, tissue repair, and wound healing.</p>
<div class="hindi-note">
  <strong>📖 समसूत्री विभाजन का सिद्धांत:</strong> <br/>
  <strong>1 द्विगुणित जनक कोशिका ($2n$) &nbsp;➔&nbsp; 2 आनुवंशिक रूप से समान द्विगुणित संतति कोशिकाएं ($2n$)</strong> <br/>
  गुणसूत्रों की संख्या समान बनी रहती है, इसलिए इसे <em>समीकारी विभाजन (Equational Division)</em> कहते हैं। यह शरीर की कायिक कोशिकाओं (त्वचा, यकृत, मांसपेशियों) में घाव भरने और शारीरिक वृद्धि हेतु होता है।
</div>

<p><strong>समसूत्री विभाजन के 4 चरण (Trick: PMAT):</strong></p>
<ul>
  <li><strong>1. Prophase (पूर्वावस्था):</strong> सबसे लंबा चरण। क्रोमैटिन संघनित होकर गुणसूत्र बनाते हैं। केंद्रक झिल्ली और केंद्रिका लुप्त हो जाती है।</li>
  <li><strong>2. Metaphase (मध्यावस्था) — <u>परीक्षा पसंदीदा</u>:</strong> सभी गुणसूत्र कोशिका के मध्य भाग में एक रेखा में संरेखित हो जाते हैं जिसे <strong>मध्यावस्था पट्टिका (Equatorial Plate)</strong> कहते हैं। <br/>
  <em style="color: #047857; font-weight: bold;">⭐ SSC Repeated Point: गुणसूत्रों की आकृति, संरचना एवं संख्या गिनने व अध्ययन करने के लिए मध्यावस्था (Metaphase) सबसे उपयुक्त चरण है!</em></li>
  <li><strong>3. Anaphase (पश्चावस्था):</strong> <strong>समसूत्री विभाजन का सबसे छोटा चरण</strong>। गुणसूत्र बिंदु (Centromere) टूट जाता है और दोनों क्रोमैटिड स्पिंडल तंतुओं द्वारा विपरीत ध्रुवों की ओर खिंचते हैं (V, L, J आकार में)।</li>
  <li><strong>4. Telophase (अंत्यावस्था):</strong> पूर्वावस्था का ठीक उल्टा। गुणसूत्र ध्रुवों पर पहुंचकर पुनः धागेनुमा जाल बना लेते हैं और दोनों ध्रुवों पर नई केंद्रक झिल्ली बन जाती है।</li>
  <li><strong>Cytokinesis (कोशिकाद्रव्य विभाजन):</strong> जंतु में खांच विधि (Furrow) तथा पादप में कोशिका पट्टिका (Cell Plate) द्वारा कोशिका दो भागों में बंट जाती है।</li>
</ul>

<h3>C. Meiosis (अर्धसूत्री विभाजन) — Reductional Division</h3>
<p>Term coined by <strong>Farmer and Moore (1905)</strong>. Occurs strictly in <strong>Germ Cells / Reproductive Organs</strong> during gamete formation.</p>
<div class="hindi-note">
  <strong>📖 अर्धसूत्री विभाजन का सिद्धांत:</strong> <br/>
  <strong>1 द्विगुणित जनक कोशिका ($2n$) &nbsp;➔&nbsp; 4 अगुणित संतति कोशिकाएं ($n$)</strong> <br/>
  संतति कोशिकाओं में गुणसूत्रों की संख्या आधी ($2n \rightarrow n$) रह जाती है, इसीलिए इसे <em>ह्रासकारी विभाजन (Reductional Division)</em> कहते हैं। यह युग्मक निर्माण (शुक्राणु व अंडाणु, परागकण) के समय होता है, जिससे निषेचन के बाद संतति में पुनः गुणसूत्र संख्या ($n + n = 2n = 46$) संतुलित हो जाती है।
</div>

<p><strong>Prophase-I के 5 अति-महत्वपूर्ण उप-चरण (Trick: L-Z-P-D-D):</strong></p>
<ol>
  <li><strong>Leptotene (लेप्टोटीन):</strong> क्रोमैटिन धागे संघनित होकर स्पष्ट होने लगते हैं।</li>
  <li><strong>Zygotene (जाइगोटीन):</strong> समजात गुणसूत्र जोड़े बनाते हैं, इस क्रिया को <strong>सूत्रयुग्मन (Synapsis)</strong> कहते हैं।</li>
  <li><strong>Pachytene (पैकिटीन) — <u>सुपर हाई-यील्ड</u>:</strong> समजात गुणसूत्रों के गैर-संतति क्रोमैटिड्स के बीच आनुवंशिक खंडों की अदला-बदली होती है। इस ऐतिहासिक घटना को <strong>जीन विनिमय (Crossing Over)</strong> कहते हैं, जो <em>रिकॉम्बिनेज (Recombinase)</em> एंजाइम द्वारा उत्प्रेरित होती है। यही विकास और जैव विविधता का मुख्य कारण है!</li>
  <li><strong>Diplotene (डिप्लोटीन):</strong> गुणसूत्र अलग होने लगते हैं किंतु क्रॉसिंग ओवर स्थलों पर जुड़े रहते हैं, जिससे 'X' आकार की संरचनाएं बनती हैं जिन्हें <strong>कियाज्मेटा (Chiasmata)</strong> कहते हैं।</li>
  <li><strong>Diakinesis (डायाकाइनेसिस):</strong> कियाज्मेटा सिरों की ओर फिसलकर समाप्त हो जाते हैं।</li>
</ol>

<h2>8. Non-Cellular Entities: Viruses, Viroids & Prions (अकोशिकीय जैविक कण)</h2>
<p>Frequently tested biological agents that lie beyond the standard realm of cell biology:</p>
<table class="notes-table">
  <thead>
    <tr>
      <th>Entity (कण)</th>
      <th>Structural Composition (संरचना)</th>
      <th>Discoverer & Year (खोजकर्ता)</th>
      <th>Key Exam Facts & Diseases (रोग एवं तथ्य)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Virus (विषाणु)</strong></td>
      <td><strong>आनुवंशिक कोर (DNA या RNA, दोनों कभी नहीं) + प्रोटीन आवरण (Capsid)।</strong></td>
      <td>Dmitri Ivanovsky (1892) व Beijerinck (1898); क्रिस्टलीकरण: W.M. Stanley (1935)।</td>
      <td>सजीव और निर्जीव के बीच की कड़ी। अविकल्पी अंतःकोशिकीय परजीवी। बाहर निर्जीव क्रिस्टल, भीतर सजीव। रोग: पोलियो, रेबीज, एड्स, इन्फ्लूएंजा, चेचक, कोविड-19।</td>
    </tr>
    <tr>
      <td><strong>Viroid (वाइरॉइड)</strong></td>
      <td><strong>केवल नग्न वृत्ताकार एकल-रज्जुक RNA</strong> (प्रोटीन आवरण का पूर्ण अभाव!)।</td>
      <td>T. O. Diener (1971)।</td>
      <td>विषाणु से भी सूक्ष्म। केवल पादपों में रोग फैलाते हैं। प्रसिद्ध उदाहरण: <strong>आलू का तर्कु कंद रोग (Potato Spindle Tuber Disease)</strong>।</td>
    </tr>
    <tr>
      <td><strong>Prion (प्रिओन)</strong></td>
      <td><strong>केवल असामान्य रूप से मुड़े हुए संक्रामक प्रोटीन</strong> (कोई डीएनए या आरएनए नहीं!)।</td>
      <td>Stanley B. Prusiner (1982, नोबेल पुरस्कार 1997)।</td>
      <td>ताप और विकिरण के प्रति अत्यधिक प्रतिरोधी। मस्तिष्क के तंत्रिका ऊतक को नष्ट करते हैं: गायों में <strong>पागल गाय रोग (Mad Cow Disease / BSE)</strong> तथा मनुष्यों में <strong>CJD रोग</strong>।</td>
    </tr>
  </tbody>
</table>

<h2>9. 🔥 Top 10 Repeated SSC & Govt Exam PYQ Traps (बार-बार दोहराए जाने वाले 10 अचूक तथ्य)</h2>
<div class="callout-box alert">
  <p><strong>परीक्षा हॉल में जाने से पहले इन 10 बिंदुओं को अवश्य याद रखें:</strong></p>
  <ol>
    <li><strong>प्रश्न: किस कोशिकांग के पास अपना स्वयं का वृत्ताकार डीएनए और 70S राइबोसोम होता है?</strong><br/>
    👉 <strong>उत्तर:</strong> <em>माइटोकॉन्ड्रिया</em> एवं <em>क्लोरोप्लास्ट (हरितलवक)</em> (अर्ध-स्वायत्त अंगक)।</li>
    
    <li><strong>प्रश्न: क्लोरोफिल (पर्णहरित) वर्णक के केंद्र में कौन सा धातु आयन पाया जाता है?</strong><br/>
    👉 <strong>उत्तर:</strong> <strong>मैग्नीशियम ($Mg^{2+}$)</strong> (जिस प्रकार रक्त के हीमोग्लोबिन में आयरन $Fe^{2+}$ होता है)।</li>
    
    <li><strong>प्रश्न: कोशिका चक्र के किस चरण में डीएनए का प्रतिकृतिकरण (DNA Replication) होता है?</strong><br/>
    👉 <strong>उत्तर:</strong> अंतरावस्था का <strong>S चरण (Synthesis Phase)</strong>।</li>
    
    <li><strong>प्रश्न: समसूत्री विभाजन के किस चरण में गुणसूत्रों की आकारिकी और संरचना का अध्ययन सबसे उत्तम होता है?</strong><br/>
    👉 <strong>उत्तर:</strong> <strong>मध्यावस्था (Metaphase)</strong> (जब सभी गुणसूत्र मध्य रेखा पर व्यवस्थित होते हैं)।</li>
    
    <li><strong>प्रश्न: अर्धसूत्री विभाजन की किस उप-अवस्था में 'जीन विनिमय' (Crossing Over) संपन्न होता है?</strong><br/>
    👉 <strong>उत्तर:</strong> Prophase-I की <strong>पैकिटीन (Pachytene)</strong> अवस्था में (एंजाइम: रिकॉम्बिनेज)।</li>
    
    <li><strong>प्रश्न: किस कोशिकांग को कोशिका का 'डाकघर' अथवा 'ट्रैफिक पुलिस' कहा जाता है?</strong><br/>
    👉 <strong>उत्तर:</strong> <strong>गॉल्जी काय (Golgi Apparatus)</strong>।</li>
    
    <li><strong>प्रश्न: सामान्य स्थिति में लाइसोसोम स्वयं की कोशिका का पाचन क्यों नहीं करते?</strong><br/>
    👉 <strong>उत्तर:</strong> इसके पाचक एंजाइम मजबूत एकल झिल्ली में बंद रहते हैं तथा केवल अम्लीय माध्यम (pH ~5.0) में सक्रिय होते हैं।</li>
    
    <li><strong>प्रश्न: कवकों (Fungi) की कोशिका भित्ति किस रासायनिक पदार्थ से बनी होती है?</strong><br/>
    👉 <strong>उत्तर:</strong> <strong>काइटिन (Chitin)</strong>।</li>
    
    <li><strong>प्रश्न: पादप कोशिका भित्ति और जीवाणु कोशिका भित्ति में मुख्य रासायनिक अंतर क्या है?</strong><br/>
    👉 <strong>उत्तर:</strong> पादप कोशिका भित्ति <strong>सेल्युलोज</strong> से बनी होती है, जबकि जीवाणु की कोशिका भित्ति <strong>पेप्टिडोग्लाइकेन (Peptidoglycan)</strong> से बनी होती है।</li>
    
    <li><strong>प्रश्न: 'मैड काउ' (Mad Cow) रोग उत्पन्न करने वाला संक्रामक कारक जिसमें केवल प्रोटीन होता है और न्यूक्लिक अम्ल नहीं होता, क्या कहलाता है?</strong><br/>
    👉 <strong>उत्तर:</strong> <strong>प्रिओन (Prions)</strong>।</li>
  </ol>
</div>

<h2>10. Self-Assessment Practice Quiz (5 Real PYQs)</h2>
<p style="color: #64748b; font-size: 14px; margin-bottom: 18px;">नीचे दिए गए प्रश्नों को स्वयं हल करें और 'उत्तर एवं विस्तृत व्याख्या देखें' पर क्लिक करके अपने ज्ञान का स्व-मूल्यांकन करें:</p>

<div class="quiz-card">
  <span class="quiz-badge">⚡ SSC CGL 2023 Tier-1 • PYQ</span>
  <div class="quiz-question">
    Q1. निम्नलिखित में से किस कोशिकांग को कोशिका की "आत्मघाती थैली" (Suicidal Bag) कहा जाता है? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(Which cellular organelle is called the "Suicidal Bag" of a cell?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> राइबोसोम (Ribosome)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> लाइसोसोम (Lysosome)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> गॉल्जी उपकरण (Golgi Apparatus)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> परऑक्सीसोम (Peroxisome)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 उत्तर एवं विस्तृत व्याख्या देखें (Click to Reveal Answer)</summary>
    <div class="quiz-explanation">
      <strong>✅ सही उत्तर: B) लाइसोसोम (Lysosome)</strong> <br/>
      <strong>गहराई से समझें:</strong> लाइसोसोम की खोज क्रिश्चियन डी डुवे (1955) ने की थी। इसमें 50 से अधिक शक्तिशाली अम्लीय हाइड्रोलाइटिक एंजाइम होते हैं। जब कोशिका क्षतिग्रस्त या मृतप्राय हो जाती है, तो लाइसोसोम फट जाता है और इसके एंजाइम पूरी कोशिका का पाचन कर देते हैं। <br/>
      <em>गलत विकल्प क्यों हैं?</em> राइबोसोम प्रोटीन फैक्ट्री है, गॉल्जी उपकरण पैकेजिंग का कार्य करता है, तथा परऑक्सीसोम हाइड्रोजन पेरोक्साइड का अपघटन करता है।
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ RRB NTPC CBT-1 2021 • PYQ</span>
  <div class="quiz-question">
    Q2. लैटिन कथन "Omnis cellula-e-cellula", जिसका अर्थ है कि सभी कोशिकाएं पूर्ववर्ती कोशिकाओं से उत्पन्न होती हैं, किसने प्रतिपादित किया था? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(The phrase "Omnis cellula-e-cellula" was proposed by:)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> रॉबर्ट हुक (Robert Hooke)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> मथायस श्लीडेन (Matthias Schleiden)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> रुडोल्फ विरचो (Rudolf Virchow)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> थियोडोर श्वान (Theodor Schwann)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 उत्तर एवं विस्तृत व्याख्या देखें (Click to Reveal Answer)</summary>
    <div class="quiz-explanation">
      <strong>✅ सही उत्तर: C) रुडोल्फ विरचो (Rudolf Virchow)</strong> <br/>
      <strong>गहराई से समझें:</strong> 1838–39 में श्लीडेन और श्वान ने कोशिका सिद्धांत दिया किंतु वे नई कोशिकाओं की उत्पत्ति नहीं समझा पाए। 1855 में रुडोल्फ विरचो ने यह स्पष्ट किया कि कोशिका विभाजन द्वारा पूर्ववर्ती कोशिकाओं से ही नई कोशिकाएं बनती हैं। रॉबर्ट हुक ने 1665 में मृत कोशिका खोजी थी।
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ UPSC CDS / NDA 2022 • PYQ</span>
  <div class="quiz-question">
    Q3. निम्नलिखित में से कौन सा कोशिकांग झिल्ली रहित (Non-membranous) होता है और प्रोकेरियोटिक तथा यूकेरियोटिक दोनों कोशिकाओं में पाया जाता है? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(Which organelle is non-membranous and found in both prokaryotic and eukaryotic cells?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> माइटोकॉन्ड्रिया (Mitochondria)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> राइबोसोम (Ribosome)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> अंतःप्रद्रव्यी जालिका (ER)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> हरितलवक (Chloroplast)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 उत्तर एवं विस्तृत व्याख्या देखें (Click to Reveal Answer)</summary>
    <div class="quiz-explanation">
      <strong>✅ सही उत्तर: B) राइबोसोम (Ribosome)</strong> <br/>
      <strong>गहराई से समझें:</strong> राइबोसोम के चारों ओर कोई झिल्ली नहीं होती। यह प्रोकेरियोट्स में 70S तथा यूकेरियोट्स के कोशिकाद्रव्य में 80S रूप में मौजूद होता है। अन्य तीनों विकल्प (माइटोकॉन्ड्रिया, ER, क्लोरोप्लास्ट) झिल्लीयुक्त अंगक हैं जो प्रोकेरियोट्स में पूर्णतः अनुपस्थित होते हैं।
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ SSC CGL Tier-2 2024 • PYQ</span>
  <div class="quiz-question">
    Q4. अर्धसूत्री विभाजन (Meiosis) के किस विशिष्ट उप-चरण में आनुवंशिक पुनर्संयोजन हेतु 'जीन विनिमय' (Crossing Over) संपन्न होता है? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(Genetic recombination through 'Crossing Over' occurs during which stage of Meiosis?)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> लेप्टोटीन (Leptotene)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> जाइगोटीन (Zygotene)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> पैकिटीन (Pachytene)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> पश्चावस्था-I (Anaphase-I)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 उत्तर एवं विस्तृत व्याख्या देखें (Click to Reveal Answer)</summary>
    <div class="quiz-explanation">
      <strong>✅ सही उत्तर: C) पैकिटीन (Pachytene)</strong> <br/>
      <strong>गहराई से समझें:</strong> Prophase-I की पैकिटीन अवस्था में समजात गुणसूत्रों के गैर-संतति क्रोमैटिड्स के मध्य आनुवंशिक पदार्थों का आदान-प्रदान (Crossing Over) होता है, जिसे 'रिकॉम्बिनेज' एंजाइम उत्प्रेरित करता है। जाइगोटीन में सूत्रयुग्मन (Synapsis) होता है तथा डिप्लोटीन में कियाज्मेटा बनता है।
    </div>
  </details>
</div>

<div class="quiz-card">
  <span class="quiz-badge">⚡ BPSC / UPPSC PCS 2023 • PYQ</span>
  <div class="quiz-question">
    Q5. पादप कोशिकाओं में विशाल केंद्रीय रिक्तिका (Vacuole) को घेरने वाली विशिष्ट अर्ध-पारगम्य झिल्ली को क्या कहा जाता है? <br/>
    <span style="font-size: 13px; font-weight: normal; color: #64748b;">(The membrane that encloses the large central vacuole in plant cells is known as:)</span>
  </div>
  <div class="quiz-options">
    <div class="quiz-option"><span class="quiz-option-key">A</span> टोनोप्लास्ट (Tonoplast)</div>
    <div class="quiz-option"><span class="quiz-option-key">B</span> क्रिस्टी (Cristae)</div>
    <div class="quiz-option"><span class="quiz-option-key">C</span> पेलीकल (Pellicle)</div>
    <div class="quiz-option"><span class="quiz-option-key">D</span> थाइलेकोइड (Thylakoid)</div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 उत्तर एवं विस्तृत व्याख्या देखें (Click to Reveal Answer)</summary>
    <div class="quiz-explanation">
      <strong>✅ सही उत्तर: A) टोनोप्लास्ट (Tonoplast)</strong> <br/>
      <strong>गहराई से समझें:</strong> पादप रसधानी के चारों ओर पाई जाने वाली एकल चयनात्मक पारगम्य झिल्ली को टोनोप्लास्ट कहते हैं, जो कोशिका में आवश्यक स्फीति दाब (Turgidity) और परासरण संतुलन बनाए रखती है। क्रिस्टी माइटोकॉन्ड्रिया में तथा थाइलेकोइड हरितलवक में होते हैं।
    </div>
  </details>
</div>
"""

# New chapter note object
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

    # Check if cn_bio_01 already exists
    existing_idx = next((i for i, n in enumerate(notes) if n.get("id") == new_note["id"] or n.get("slug") == new_note["slug"]), None)

    if existing_idx is not None:
        print(f"Updating existing note at index {existing_idx}...")
        notes[existing_idx] = new_note
    else:
        print("Inserting new Cell Biology note...")
        notes.append(new_note)

    with open(NOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(notes, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {new_note['id']} to {NOTES_FILE}!")
    print(f"Status: is_active = {new_note['is_active']} (DRAFT MODE)")

if __name__ == "__main__":
    main()
