with open("src/app/layout.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old_icons = """    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [{ url: "/icon-192.png" }]
    },"""

new_icons = """    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },"""

if old_icons in c:
    c = c.replace(old_icons, new_icons, 1)
    with open("src/app/layout.tsx", "w", encoding="utf-8") as f:
        f.write(c)
    print("SUCCESS: Updated layout.tsx icons")
else:
    print("Target not found directly, checking normalized...")
    c_norm = c.replace("\r\n", "\n")
    old_norm = old_icons.replace("\r\n", "\n")
    new_norm = new_icons.replace("\r\n", "\n")
    if old_norm in c_norm:
        c_norm = c_norm.replace(old_norm, new_norm, 1)
        with open("src/app/layout.tsx", "w", encoding="utf-8") as f:
            f.write(c_norm)
        print("SUCCESS: Updated layout.tsx icons (normalized)")
    else:
        print("FAIL: could not match icons block")
