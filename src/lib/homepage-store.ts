import fs from "fs";
import path from "path";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "./homepage-types";

export * from "./homepage-types";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");

export function getHomepageConfig(): HomepageConfig {
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
    console.error("Error reading homepage config:", err);
  }
  return DEFAULT_HOMEPAGE_CONFIG;
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

  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}
