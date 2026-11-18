import fs from "fs";
import path from "path";
import { AnnouncementConfig, DEFAULT_ANNOUNCEMENT_CONFIG } from "./announcements-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./announcements-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ANNOUNCEMENT_FILE = path.join(DATA_DIR, "announcement-config.json");
const SETTING_KEY = "announcement_config";

function getLocalFileFallback(): AnnouncementConfig {
  try {
    if (fs.existsSync(ANNOUNCEMENT_FILE)) {
      const raw = fs.readFileSync(ANNOUNCEMENT_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ANNOUNCEMENT_CONFIG,
        ...parsed,
        primaryButton: {
          ...DEFAULT_ANNOUNCEMENT_CONFIG.primaryButton,
          ...(parsed.primaryButton || {}),
        },
        secondaryButton: {
          ...DEFAULT_ANNOUNCEMENT_CONFIG.secondaryButton,
          ...(parsed.secondaryButton || {}),
        },
      };
    }
  } catch (err) {
    console.error("Error reading local announcement-config.json:", err);
  }
  return DEFAULT_ANNOUNCEMENT_CONFIG;
}

export function getAnnouncementConfig(): AnnouncementConfig {
  const cached = getSiteSettingCached<AnnouncementConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getAnnouncementConfigAsync(): Promise<AnnouncementConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<AnnouncementConfig>(SETTING_KEY, fallback);
  return {
    ...DEFAULT_ANNOUNCEMENT_CONFIG,
    ...dbData,
    primaryButton: {
      ...DEFAULT_ANNOUNCEMENT_CONFIG.primaryButton,
      ...(dbData.primaryButton || {}),
    },
    secondaryButton: dbData.secondaryButton
      ? {
          ...DEFAULT_ANNOUNCEMENT_CONFIG.secondaryButton,
          ...dbData.secondaryButton,
        }
      : DEFAULT_ANNOUNCEMENT_CONFIG.secondaryButton,
  };
}

export async function saveAnnouncementConfigAsync(config: Partial<AnnouncementConfig>): Promise<AnnouncementConfig> {
  const current = await getAnnouncementConfigAsync();
  const merged: AnnouncementConfig = {
    ...current,
    ...config,
    version: config.version || `ann_${Date.now()}`,
    primaryButton: {
      text: config.primaryButton?.text || current.primaryButton.text,
      url: config.primaryButton?.url ?? current.primaryButton.url,
      isDismiss: config.primaryButton?.isDismiss ?? current.primaryButton.isDismiss,
      isExternal: config.primaryButton?.isExternal ?? current.primaryButton.isExternal,
    },
    secondaryButton: config.secondaryButton
      ? {
          text: config.secondaryButton.text || current.secondaryButton?.text || "Later",
          url: config.secondaryButton.url ?? current.secondaryButton?.url,
          isDismiss: config.secondaryButton.isDismiss ?? current.secondaryButton?.isDismiss ?? true,
          isExternal: config.secondaryButton.isExternal ?? current.secondaryButton?.isExternal,
        }
      : current.secondaryButton,
    updatedAt: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, merged);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}

export function saveAnnouncementConfig(config: Partial<AnnouncementConfig>): AnnouncementConfig {
  const current = getAnnouncementConfig();
  const merged: AnnouncementConfig = {
    ...current,
    ...config,
    version: config.version || `ann_${Date.now()}`,
    primaryButton: {
      text: config.primaryButton?.text || current.primaryButton.text,
      url: config.primaryButton?.url ?? current.primaryButton.url,
      isDismiss: config.primaryButton?.isDismiss ?? current.primaryButton.isDismiss,
      isExternal: config.primaryButton?.isExternal ?? current.primaryButton.isExternal,
    },
    secondaryButton: config.secondaryButton
      ? {
          text: config.secondaryButton.text || current.secondaryButton?.text || "Later",
          url: config.secondaryButton.url ?? current.secondaryButton?.url,
          isDismiss: config.secondaryButton.isDismiss ?? current.secondaryButton?.isDismiss ?? true,
          isExternal: config.secondaryButton.isExternal ?? current.secondaryButton?.isExternal,
        }
      : current.secondaryButton,
    updatedAt: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, merged);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch {}

  return merged;
}
