import fs from "fs";
import path from "path";
import { NavigationConfig, DEFAULT_NAVIGATION_CONFIG } from "./navigation-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "navigation_config.json");
const SETTING_KEY = "navigation_config";

function getLocalFileFallback(): NavigationConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read local navigation_config.json, using defaults:", err);
  }
  return DEFAULT_NAVIGATION_CONFIG;
}

export function getNavigationConfig(): NavigationConfig {
  const cached = getSiteSettingCached<NavigationConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getNavigationConfigAsync(): Promise<NavigationConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<NavigationConfig>(SETTING_KEY, fallback);
  if (dbData && Array.isArray(dbData.items) && dbData.items.length > 0) {
    return dbData;
  }
  return fallback;
}

export async function saveNavigationConfigAsync(config: NavigationConfig): Promise<boolean> {
  const dataToSave = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  const saved = await saveSiteSettingAsync(SETTING_KEY, dataToSave);

  // 2. Local file backup (non-fatal)
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch {}

  return saved;
}

export function saveNavigationConfig(config: NavigationConfig): boolean {
  const dataToSave = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, dataToSave);

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch {}

  return true;
}
