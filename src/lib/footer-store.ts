import fs from "fs";
import path from "path";
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from "./footer-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./footer-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FOOTER_FILE = path.join(DATA_DIR, "footer-config.json");
const SETTING_KEY = "footer_config";

function getLocalFileFallback(): FooterConfig {
  try {
    if (fs.existsSync(FOOTER_FILE)) {
      const raw = fs.readFileSync(FOOTER_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_FOOTER_CONFIG,
        ...parsed,
        columns: parsed.columns || DEFAULT_FOOTER_CONFIG.columns,
        socialLinks: parsed.socialLinks || DEFAULT_FOOTER_CONFIG.socialLinks,
        legalLinks: parsed.legalLinks || DEFAULT_FOOTER_CONFIG.legalLinks,
      };
    }
  } catch (err) {
    console.error("Error reading local footer-config.json:", err);
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function getFooterConfig(): FooterConfig {
  const cached = getSiteSettingCached<FooterConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getFooterConfigAsync(): Promise<FooterConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<FooterConfig>(SETTING_KEY, fallback);
  return {
    ...DEFAULT_FOOTER_CONFIG,
    ...dbData,
    columns: dbData.columns || DEFAULT_FOOTER_CONFIG.columns,
    socialLinks: dbData.socialLinks || DEFAULT_FOOTER_CONFIG.socialLinks,
    legalLinks: dbData.legalLinks || DEFAULT_FOOTER_CONFIG.legalLinks,
  };
}

export async function saveFooterConfigAsync(config: Partial<FooterConfig>): Promise<FooterConfig> {
  const current = await getFooterConfigAsync();
  const merged: FooterConfig = {
    ...current,
    ...config,
    columns: config.columns || current.columns,
    socialLinks: config.socialLinks || current.socialLinks,
    legalLinks: config.legalLinks || current.legalLinks,
    updatedAt: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, merged);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FOOTER_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}

export function saveFooterConfig(config: Partial<FooterConfig>): FooterConfig {
  const current = getFooterConfig();
  const merged: FooterConfig = {
    ...current,
    ...config,
    columns: config.columns || current.columns,
    socialLinks: config.socialLinks || current.socialLinks,
    legalLinks: config.legalLinks || current.legalLinks,
    updatedAt: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, merged);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FOOTER_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}
