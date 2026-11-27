import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getMobileAppReleaseInfo } from "@/lib/mobile-app-release";
import { DEFAULT_APK_CDN_URL } from "@/lib/mobile-app-showcase-data";

export const dynamic = "force-dynamic";

/**
 * Direct APK download endpoint (`GET /api/download-apk`).
 * Redirects to the configured direct HTTPS .apk CDN link (Cloudflare R2) so
 * Cloud Run bandwidth & Docker image size stay lean while preserving a clean
 * own-domain URL (https://ssczone.com/api/download-apk and /SSCZone.apk).
 */
export async function GET() {
  try {
    const info = await getMobileAppReleaseInfo();
    const targetUrl = info.apkDownloadUrl || DEFAULT_APK_CDN_URL;

    if (/^https?:\/\//i.test(targetUrl) && /\.apk($|\?)/i.test(targetUrl)) {
      return NextResponse.redirect(targetUrl, {
        status: 302,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Local development fallback when testing without CDN
    const localCandidates = [
      path.join(process.cwd(), "apk", "SSCZone.apk"),
      path.join(process.cwd(), "public", "apk", "SSCZone.apk"),
      path.join(process.cwd(), "android-app", "SSCZone.apk"),
    ];
    for (const filePath of localCandidates) {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.android.package-archive",
            "Content-Disposition": `attachment; filename="SSCZone-v${info.version}.apk"`,
            "Content-Length": String(buffer.length),
            "Cache-Control": "no-store",
          },
        });
      }
    }

    return NextResponse.redirect(DEFAULT_APK_CDN_URL, { status: 302 });
  } catch {
    return NextResponse.redirect(DEFAULT_APK_CDN_URL, { status: 302 });
  }
}
