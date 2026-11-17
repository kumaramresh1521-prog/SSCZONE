import fs from "fs";
import path from "path";
import { SiteAdsConfig, DEFAULT_ADS_CONFIG } from "./ads-types";
import { supabase } from "./supabase";

export * from "./ads-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ADS_FILE = path.join(DATA_DIR, "ads-config.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAdsConfig(): SiteAdsConfig {
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
    console.error("Error reading ads-config.json:", err);
  }
  return DEFAULT_ADS_CONFIG;
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

  try {
    ensureDirectoryExists();
    fs.writeFileSync(ADS_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write ads-config.json:", err);
  }

  // Background sync to Supabase
  syncAdsToSupabase(merged).catch((e) =>
    console.warn("Background Supabase ads sync:", e?.message)
  );

  return merged;
}

export async function syncAdsToSupabase(config: SiteAdsConfig) {
  try {
    const slug = "site-ads-config";
    const payload = {
      title: "SSCZone Ad Placements & Affiliate Engine Config",
      slug,
      excerpt: `Global Ads: ${config.enabledGlobally ? "ENABLED" : "DISABLED"} | Slots: ${Object.keys(config.slots).length}`,
      content: JSON.stringify(config),
      category: "Ad Config",
      keywords: ["ads", "adsense", "affiliate", "monetization"],
      is_published: true,
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
    console.warn("syncAdsToSupabase skipped/error:", err);
  }
}
