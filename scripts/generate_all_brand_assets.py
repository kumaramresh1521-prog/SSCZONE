import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_brand_icons():
    # Super-sampled canvas size for pristine anti-aliasing
    canvas_size = 2048
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # 1. Create gradient background
    # Top-Left: #1E40AF (30, 64, 175) -> Bottom-Right: #2563EB (37, 99, 235)
    grad_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad_img)
    
    c1 = (30, 58, 138)  # Deep Indigo #1E3A8A
    c2 = (37, 99, 235)  # Royal Blue #2563EB
    
    # Render diagonal gradient
    for y in range(canvas_size):
        for x in range(0, canvas_size, 4):  # step by 4 for speed
            t = (x + y) / (2.0 * canvas_size)
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            grad_draw.rectangle([x, y, x + 3, y], fill=(r, g, b, 255))
            
    # 2. Mask to rounded squircle (radius ~ 24%)
    radius = int(canvas_size * 0.24)
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (canvas_size - 1, canvas_size - 1)], radius=radius, fill=255)
    
    # Composite squircle
    icon_base = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    icon_base.paste(grad_img, (0, 0), mask)
    draw = ImageDraw.Draw(icon_base)
    
    # 3. Inner border highlight
    border_width = int(canvas_size * 0.015)
    draw.rounded_rectangle(
        [(border_width, border_width), (canvas_size - 1 - border_width, canvas_size - 1 - border_width)],
        radius=radius - border_width,
        outline=(255, 255, 255, 55),
        width=border_width
    )
    
    # 4. Monogram Typography: "S" and "Z"
    font_size = int(canvas_size * 0.48)
    font_path = "C:/Windows/Fonts/segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
        
    font = ImageFont.truetype(font_path, font_size)
    
    # Calculate exact positions
    s_bbox = font.getbbox("S")
    z_bbox = font.getbbox("Z")
    
    s_w = s_bbox[2] - s_bbox[0]
    s_h = s_bbox[3] - s_bbox[1]
    z_w = z_bbox[2] - z_bbox[0]
    z_h = z_bbox[3] - z_bbox[1]
    
    # Gap between S and Z
    gap = int(canvas_size * 0.03)
    total_w = s_w + gap + z_w
    
    start_x = (canvas_size - total_w) // 2
    # Vertical center adjustment (slight optical lowering)
    center_y = (canvas_size - s_h) // 2 - s_bbox[1] + int(canvas_size * 0.01)
    
    # Draw subtle text drop shadow
    shadow_offset = int(canvas_size * 0.018)
    draw.text((start_x - s_bbox[0] + shadow_offset, center_y + shadow_offset), "S", font=font, fill=(15, 23, 42, 100))
    draw.text((start_x + s_w + gap - z_bbox[0] + shadow_offset, center_y + shadow_offset), "Z", font=font, fill=(15, 23, 42, 100))
    
    # Draw "S" in Crisp Pure White
    draw.text((start_x - s_bbox[0], center_y), "S", font=font, fill=(255, 255, 255, 255))
    
    # Draw "Z" in Golden Warm Gradient/Amber #F59E0B -> #FCD34D
    # Golden color:
    gold_color = (245, 158, 11, 255)
    draw.text((start_x + s_w + gap - z_bbox[0], center_y), "Z", font=font, fill=gold_color)
    
    # 5. Elite 4-point Sparkle Star Accent at Top-Right
    star_cx = int(canvas_size * 0.77)
    star_cy = int(canvas_size * 0.27)
    r_outer = int(canvas_size * 0.11)
    r_inner = int(canvas_size * 0.032)
    
    star_points = []
    for i in range(8):
        angle = i * (math.pi / 4.0) - (math.pi / 2.0)
        r_curr = r_outer if i % 2 == 0 else r_inner
        px = star_cx + r_curr * math.cos(angle)
        py = star_cy + r_curr * math.sin(angle)
        star_points.append((px, py))
        
    # Draw gold star
    draw.polygon(star_points, fill=(251, 191, 36, 255))
    # Draw tiny glint center
    glint_r = int(canvas_size * 0.016)
    draw.ellipse([(star_cx - glint_r, star_cy - glint_r), (star_cx + glint_r, star_cy + glint_r)], fill=(255, 255, 255, 230))
    
    # 6. Save sizes with Lanczos resampling
    os.makedirs("public", exist_ok=True)
    os.makedirs("src/app", exist_ok=True)
    
    # 512x512
    img_512 = icon_base.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save("public/icon-512.png", "PNG")
    print("Saved public/icon-512.png")
    
    # 192x192
    img_192 = icon_base.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save("public/icon-192.png", "PNG")
    print("Saved public/icon-192.png")
    
    # 180x180 (Apple touch icon)
    img_180 = icon_base.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save("public/apple-touch-icon.png", "PNG")
    print("Saved public/apple-touch-icon.png")
    
    # Multi-size Favicon .ICO (16, 32, 48)
    img_48 = icon_base.resize((48, 48), Image.Resampling.LANCZOS)
    img_32 = icon_base.resize((32, 32), Image.Resampling.LANCZOS)
    img_16 = icon_base.resize((16, 16), Image.Resampling.LANCZOS)
    
    img_48.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Saved public/favicon.ico")
    
    # 7. Write Vector SVG Icons
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="sz-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="sz-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#sz-bg)" />
  <rect width="98" height="98" x="1" y="1" rx="23" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" />
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="45" letter-spacing="-1">
    <text x="31" y="66" fill="#FFFFFF" text-anchor="middle">S</text>
    <text x="69" y="66" fill="url(#sz-gold)" text-anchor="middle">Z</text>
  </g>
  <polygon points="77,16 80,24 88,27 80,30 77,38 74,30 66,27 74,24" fill="url(#sz-gold)" />
  <circle cx="77" cy="27" r="1.5" fill="#FFFFFF" />
</svg>"""

    with open("public/favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Saved public/favicon.svg")
    
    with open("src/app/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Saved src/app/icon.svg")

if __name__ == "__main__":
    create_brand_icons()
