import fs from "fs";
import path from "path";
import { SiteAdsConfig, DEFAULT_ADS_CONFIG } from "./ads-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./ads-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ADS_FILE = path.join(DATA_DIR, "ads-config.json");
const SETTING_KEY = "ads_config";

function getLocalFileFallback(): SiteAdsConfig {
  try {
    if (fs.existsSync(ADS_FILE)) {
      const raw = fs.readFileSync(ADS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADS_CONFIG,
        ...parsed,
        slots: {
          ...DEFAULT_ADS_CONFIG.slots,
          ...(parsed.slots || {}),
        },
      };
    }
  } catch (err) {
    console.error("Error reading local ads-config.json:", err);
  }
  return DEFAULT_ADS_CONFIG;
}

export function getAdsConfig(): SiteAdsConfig {
  const cached = getSiteSettingCached<SiteAdsConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getAdsConfigAsync(): Promise<SiteAdsConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<SiteAdsConfig>(SETTING_KEY, fallback);
  return {
    ...DEFAULT_ADS_CONFIG,
    ...dbData,
    slots: {
      ...DEFAULT_ADS_CONFIG.slots,
      ...(dbData.slots || {}),
    },
  };
}

export async function saveAdsConfigAsync(config: Partial<SiteAdsConfig>): Promise<SiteAdsConfig> {
  const current = await getAdsConfigAsync();
  const merged: SiteAdsConfig = {
    ...current,
    ...config,
    slots: {
      ...current.slots,
      ...(config.slots || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, merged);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADS_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}

export function saveAdsConfig(config: Partial<SiteAdsConfig>): SiteAdsConfig {
  const current = getAdsConfig();
  const merged: SiteAdsConfig = {
    ...current,
    ...config,
    slots: {
      ...current.slots,
      ...(config.slots || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, merged);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADS_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}
