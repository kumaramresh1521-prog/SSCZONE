import fs from "fs";
import path from "path";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export interface SessionGateConfig {
  is_enabled: boolean;
  session_limit_minutes: number;
  block_test_attempts: boolean;
  show_modal_popup: boolean;
  modal_title: string;
  modal_message: string;
  exempt_logged_in: boolean;
  updated_at?: string;
}

export const DEFAULT_GATE_CONFIG: SessionGateConfig = {
  is_enabled: true,
  session_limit_minutes: 15,
  block_test_attempts: true,
  show_modal_popup: true,
  modal_title: "Save Your Test Progress & Scorecards",
  modal_message:
    "Sign in or create a free account to track your test performance, review question solutions, and save bookmarks.",
  exempt_logged_in: true,
  updated_at: new Date().toISOString(),
};

const CONFIG_FILE = path.join(process.cwd(), "src", "data", "session_gate_config.json");
const SETTING_KEY = "session_gate_config";

function getLocalFileFallback(): SessionGateConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf8");
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_GATE_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    console.error("Failed to read local session gate config:", e);
  }
  return DEFAULT_GATE_CONFIG;
}

export function getSessionGateConfig(): SessionGateConfig {
  const cached = getSiteSettingCached<SessionGateConfig | null>(SETTING_KEY, null);
  if (cached) return cached;
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getSessionGateConfigAsync(): Promise<SessionGateConfig> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<SessionGateConfig>(SETTING_KEY, fallback);
  return {
    ...DEFAULT_GATE_CONFIG,
    ...dbData,
  };
}

export async function saveSessionGateConfigAsync(data: Partial<SessionGateConfig>): Promise<SessionGateConfig> {
  const current = await getSessionGateConfigAsync();
  const updated: SessionGateConfig = {
    ...current,
    ...data,
    session_limit_minutes: Number(data.session_limit_minutes) || current.session_limit_minutes || 15,
    updated_at: new Date().toISOString(),
  };

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, updated);

  // 2. Local file backup (non-fatal)
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {}

  return updated;
}

export function saveSessionGateConfig(data: Partial<SessionGateConfig>): SessionGateConfig {
  const current = getSessionGateConfig();
  const updated: SessionGateConfig = {
    ...current,
    ...data,
    session_limit_minutes: Number(data.session_limit_minutes) || current.session_limit_minutes || 15,
    updated_at: new Date().toISOString(),
  };

  void saveSiteSettingAsync(SETTING_KEY, updated);

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch {}

  return updated;
}
