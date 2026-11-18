import fs from "fs";
import path from "path";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "./homepage-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./homepage-types";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");
const SETTING_KEY = "homepage_config";

function getLocalFileFallback(): HomepageConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const data = JSON.parse(raw);
      return {
        ...DEFAULT_HOMEPAGE_CONFIG,
        ...data,
        targetExamsSection: {
          ...DEFAULT_HOMEPAGE_CONFIG.targetExamsSection,
          ...(data.targetExamsSection || {}),
        },
      };
    }
  } catch (err) {
    console.error("Error reading local homepage-config.json:", err);
  }
  return DEFAULT_HOMEPAGE_CONFIG;
}

export function getHomepageConfig(): HomepageConfig {
  const cached = getSiteSettingCached<HomepageConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getHomepageConfigAsync(): Promise<HomepageConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<HomepageConfig>(SETTING_KEY, fallback);
  return {
    ...DEFAULT_HOMEPAGE_CONFIG,
    ...dbData,
    targetExamsSection: {
      ...DEFAULT_HOMEPAGE_CONFIG.targetExamsSection,
      ...(dbData.targetExamsSection || {}),
    },
  };
}

export async function saveHomepageConfigAsync(config: Partial<HomepageConfig>): Promise<HomepageConfig> {
  const current = await getHomepageConfigAsync();
  const merged: HomepageConfig = {
    ...current,
    ...config,
    targetExamsSection: {
      ...current.targetExamsSection,
      ...(config.targetExamsSection || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, merged);

  // 2. Best-effort local file backup (never fatal)
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  return merged;
}

export function saveHomepageConfig(config: Partial<HomepageConfig>): HomepageConfig {
  const current = getHomepageConfig();
  const merged: HomepageConfig = {
    ...current,
    ...config,
    targetExamsSection: {
      ...current.targetExamsSection,
      ...(config.targetExamsSection || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, merged);

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  return merged;
}
