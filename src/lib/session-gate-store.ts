import fs from "fs";
import path from "path";

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

const DEFAULT_GATE_CONFIG: SessionGateConfig = {
  is_enabled: true,
  session_limit_minutes: 15,
  block_test_attempts: true,
  show_modal_popup: true,
  modal_title: "⏰ Guest Session Limit Reached (15 Mins)",
  modal_message:
    "Aapka 15-minute free guest preview complete ho chuka hai. Agla test attempt karne aur apne scorecards & bookmarks save karne ke liye kripya Free Login ya Sign Up karein.",
  exempt_logged_in: true,
  updated_at: new Date().toISOString(),
};

const CONFIG_FILE = path.join(process.cwd(), "src", "data", "session_gate_config.json");

export function getSessionGateConfig(): SessionGateConfig {
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
    console.error("Failed to read session gate config:", e);
  }
  return DEFAULT_GATE_CONFIG;
}

export function saveSessionGateConfig(data: Partial<SessionGateConfig>): SessionGateConfig {
  try {
    const current = getSessionGateConfig();
    const updated: SessionGateConfig = {
      ...current,
      ...data,
      session_limit_minutes: Number(data.session_limit_minutes) || current.session_limit_minutes || 15,
      updated_at: new Date().toISOString(),
    };

    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf8");
    return updated;
  } catch (e) {
    console.error("Failed to save session gate config:", e);
    throw e;
  }
}
