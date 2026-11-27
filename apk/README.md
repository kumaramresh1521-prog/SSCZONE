# SSCZone Android APK Folder

Is folder me latest Android release APK (`SSCZone.apk`) store hota hai.
Heavy `.apk` binaries Git aur Docker image (~85 MB) ko bloat na karein, isliye `.apk` files ko **Cloudflare R2 CDN** par host kiya jata hai:

- **Direct CDN Latest APK**: `https://doc.ssczone.com/apk/SSCZone.apk`
- **Website Download Route**: `https://ssczone.com/api/download-apk` (auto-redirects to latest CDN APK)
- **Website App Showcase Page**: `https://ssczone.com/download-app`

## Naya APK Version Publish Karne ka Tarika

1. Naya build `android-app/SSCZone.apk` (ya `apk/SSCZone.apk`) me rakhein aur `android-app/app.json` me version update karein.
2. Terminal me run karein:

```bash
python scripts/upload_apk_to_r2.py
```

Ye automatically:
- `apk/SSCZone.apk` (aur versioned `apk/SSCZone-v<version>.apk`) ko Cloudflare R2 par upload karega
- Proper Android package MIME type (`application/vnd.android.package-archive`) aur `PK` binary integrity verify karega
- `/admin/mobile-app` aur website ke `/download-app` metadata se sync rahega
