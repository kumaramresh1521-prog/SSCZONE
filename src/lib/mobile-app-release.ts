import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { mergeMobileAppConfig } from "@/lib/mobile-app-config";
import { DEFAULT_APK_CDN_URL } from "@/lib/mobile-app-showcase-data";

export interface MobileAppReleaseInfo {
  version: string;
  versionCode: number;
  packageName: string;
  sizeBytes: number;
  sizeLabel: string;
  sha256: string;
  apkDownloadUrl: string;
  versionedCdnUrl: string;
  minAndroid: string;
  releaseNotes: string;
  updatedAt?: string;
}

const RELEASE_MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "mobile-app-release.json"
);

function readLocalReleaseManifest() {
  try {
    if (fs.existsSync(RELEASE_MANIFEST_PATH)) {
      return JSON.parse(fs.readFileSync(RELEASE_MANIFEST_PATH, "utf-8"));
    }
  } catch {}
  return {
    version: "1.2.0",
    versionCode: 3,
    packageName: "com.ssczone.app",
    sizeBytes: 22691668,
    sizeLabel: "21.6 MB",
    sha256: "",
    cdnUrl: DEFAULT_APK_CDN_URL,
    versionedCdnUrl: "https://doc.ssczone.com/apk/SSCZone-v1.2.0.apk",
    minAndroid: "Android 7.0+",
  };
}

function isDirectApkUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) && /\.apk($|\?)/i.test(trimmed);
}

export async function getMobileAppReleaseInfo(): Promise<MobileAppReleaseInfo> {
  const manifest = readLocalReleaseManifest();
  let version = String(manifest.version || "1.2.0");
  let releaseNotes =
    "SSCZone official release with 125 PYQ papers, 20,480+ MCQs, 3-pillar Syllabus Tracker, Speed Drills & KaTeX math support.";
  let apkDownloadUrl = String(manifest.cdnUrl || DEFAULT_APK_CDN_URL);
  let updatedAt: string | undefined;

  try {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (sbUrl && sbKey) {
      const sb = createClient(sbUrl, sbKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data } = await sb
        .from("site_settings")
        .select("value, updated_at")
        .eq("key", "mobile_app_config")
        .maybeSingle();

      if (data?.value) {
        const cfg = mergeMobileAppConfig(data.value);
        if (cfg.version?.latestVersion) version = cfg.version.latestVersion;
        if (cfg.version?.releaseNotes) releaseNotes = cfg.version.releaseNotes;
        if (isDirectApkUrl(cfg.version?.downloadUrl)) {
          apkDownloadUrl = cfg.version.downloadUrl;
        }
        updatedAt = cfg.updatedAt || data.updated_at || undefined;
      }
    }
  } catch {
    // Graceful fallback to local manifest
  }

  return {
    version,
    versionCode: Number(manifest.versionCode || 3),
    packageName: String(manifest.packageName || "com.ssczone.app"),
    sizeBytes: Number(manifest.sizeBytes || 22691668),
    sizeLabel: String(manifest.sizeLabel || "21.6 MB"),
    sha256: String(manifest.sha256 || ""),
    apkDownloadUrl,
    versionedCdnUrl: String(manifest.versionedCdnUrl || apkDownloadUrl),
    minAndroid: String(manifest.minAndroid || "Android 7.0+"),
    releaseNotes,
    updatedAt,
  };
}
