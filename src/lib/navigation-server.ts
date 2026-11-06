import fs from "fs";
import path from "path";
import { NavigationConfig, DEFAULT_NAVIGATION_CONFIG } from "./navigation-types";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "navigation_config.json");

export function getNavigationConfig(): NavigationConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read navigation_config.json, using defaults:", err);
  }
  return DEFAULT_NAVIGATION_CONFIG;
}

export function saveNavigationConfig(config: NavigationConfig): boolean {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const dataToSave = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save navigation_config.json:", err);
    return false;
  }
}
