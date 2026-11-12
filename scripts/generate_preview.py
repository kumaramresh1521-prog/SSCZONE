import os
from PIL import Image, ImageDraw, ImageFont

html_preview = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SSC ZONE Logo & Favicon Concepts</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
    h1 { text-align: center; font-size: 28px; margin-bottom: 8px; }
    p { text-align: center; color: #94a3b8; font-size: 14px; margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 24px; text-align: center; }
    .card.light { background: #ffffff; color: #0f172a; border-color: #e2e8f0; }
    .card h3 { font-size: 16px; margin-bottom: 16px; font-weight: 700; }
    .logo-box { padding: 30px; display: flex; align-items: center; justify-content: center; gap: 12px; }
    .favicons { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 20px; }
    .fav-item { text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <h1>SSC ZONE Branding: Logo & Favicon Concepts</h1>
  <p>Modern, authoritative, highly recognizable text-based logos & app icons</p>

  <div class="grid">
    <!-- Concept 1: Modern Royal Indigo SZ Monogram + Bold Wordmark -->
    <div class="card">
      <span style="font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">Concept 1 (Dark Theme)</span>
      <div class="logo-box">
        <svg width="44" height="44" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="100%" stop-color="#1D4ED8" />
            </linearGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FCD34D" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="26" fill="url(#g1)" />
          <rect width="100" height="100" rx="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
          <text x="32" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" text-anchor="middle">S</text>
          <text x="68" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="url(#gold)" text-anchor="middle">Z</text>
          <!-- Sparkle star top right -->
          <polygon points="76,18 80,26 88,30 80,34 76,42 72,34 64,30 72,26" fill="url(#gold)" />
        </svg>
        <div style="text-align: left;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1;">
            <span style="color: #60A5FA;">SSC</span>
            <span style="color: #F8FAFC; margin-left: 2px;">ZONE</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;">
            Govt Exam Prep
          </div>
        </div>
      </div>
      <div class="favicons">
        <div class="fav-item">
          <svg width="32" height="32" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="26" fill="#2563EB" />
            <text x="32" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" text-anchor="middle">S</text>
            <text x="68" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#F59E0B" text-anchor="middle">Z</text>
            <polygon points="76,18 80,26 88,30 80,34 76,42 72,34 64,30 72,26" fill="#F59E0B" />
          </svg>
          <div>32x32 Tab</div>
        </div>
        <div class="fav-item">
          <svg width="16" height="16" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="26" fill="#2563EB" />
            <text x="32" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" text-anchor="middle">S</text>
            <text x="68" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#F59E0B" text-anchor="middle">Z</text>
          </svg>
          <div>16x16 Favicon</div>
        </div>
      </div>
    </div>

    <!-- Concept 1 (Light Theme / Navbar View) -->
    <div class="card light">
      <span style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Concept 1 (Light / Navbar View)</span>
      <div class="logo-box">
        <svg width="44" height="44" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="g1b" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="100%" stop-color="#1D4ED8" />
            </linearGradient>
            <linearGradient id="goldb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FCD34D" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="26" fill="url(#g1b)" />
          <text x="32" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" text-anchor="middle">S</text>
          <text x="68" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="url(#goldb)" text-anchor="middle">Z</text>
          <polygon points="76,18 80,26 88,30 80,34 76,42 72,34 64,30 72,26" fill="url(#goldb)" />
        </svg>
        <div style="text-align: left;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1;">
            <span style="color: #1E40AF;">SSC</span>
            <span style="color: #0F172A; margin-left: 2px;">ZONE</span>
          </div>
          <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;">
            Govt Exam Prep
          </div>
        </div>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #64748b; font-weight: 600;">
        Clean • Modern • Highly Legible at All Screen Resolutions
      </div>
    </div>

    <!-- Concept 2: High-Tech Pill Badge Wordmark -->
    <div class="card light">
      <span style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px;">Concept 2 (Pill Badge Wordmark)</span>
      <div class="logo-box">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 28px; font-weight: 950; color: #1E3A8A; letter-spacing: -1px;">SSC</span>
          <span style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; font-size: 15px; font-weight: 900; padding: 4px 10px; border-radius: 10px; letter-spacing: 1.5px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
            ZONE
          </span>
        </div>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #64748b; font-weight: 600;">
        EdTech Style • Bold & Energetic
      </div>
    </div>

    <!-- Concept 3: Electric Sparkle Apex Monogram -->
    <div class="card">
      <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">Concept 3 (Apex Sparkle Monogram)</span>
      <div class="logo-box">
        <svg width="44" height="44" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="26" fill="#1E3A8A" />
          <path d="M28 35 C28 26, 42 24, 52 24 C62 24, 72 28, 72 38 C72 48, 54 50, 48 54 C42 58, 42 62, 42 68 L72 68" stroke="#38BDF8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <circle cx="76" cy="30" r="7" fill="#F59E0B" />
        </svg>
        <div style="text-align: left;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1;">
            <span style="color: #38BDF8;">SSC</span>
            <span style="color: #FFFFFF; margin-left: 2px;">ZONE</span>
            <span style="color: #F59E0B;">.</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;">
            Official CBT Series
          </div>
        </div>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; font-weight: 600;">
        Geometric • Modern Minimalist
      </div>
    </div>
  </div>
</body>
</html>
"""

with open("c:\\ssczone\\logo_preview.html", "w", encoding="utf-8") as f:
    f.write(html_preview)

print("Generated logo_preview.html")
