import fs from "fs";
import path from "path";
import { AnnouncementConfig, DEFAULT_ANNOUNCEMENT_CONFIG } from "./announcements-types";
import { supabase } from "./supabase";

export * from "./announcements-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ANNOUNCEMENT_FILE = path.join(DATA_DIR, "announcement-config.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAnnouncementConfig(): AnnouncementConfig {
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
    console.error("Error reading announcement-config.json:", err);
  }
  return DEFAULT_ANNOUNCEMENT_CONFIG;
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

  try {
    ensureDirectoryExists();
    fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write announcement-config.json:", err);
  }

  // Background sync to Supabase
  syncAnnouncementToSupabase(merged).catch((e) =>
    console.warn("Background Supabase announcement sync:", e?.message)
  );

  return merged;
}

export async function syncAnnouncementToSupabase(config: AnnouncementConfig) {
  try {
    const slug = "site-announcement-config";
    const payload = {
      title: config.title,
      slug,
      excerpt: config.badge,
      content: JSON.stringify(config),
      category: "Announcement",
      keywords: ["announcement", "modal", "popup", "alert", "notice"],
      is_published: config.enabled,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("blogs").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("blogs").insert([payload]);
    }
  } catch (err) {
    console.warn("syncAnnouncementToSupabase skipped/error:", err);
  }
}
