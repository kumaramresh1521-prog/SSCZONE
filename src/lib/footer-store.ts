import fs from "fs";
import path from "path";
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from "./footer-types";
import { supabase } from "./supabase";

export * from "./footer-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FOOTER_FILE = path.join(DATA_DIR, "footer-config.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getFooterConfig(): FooterConfig {
  try {
    if (fs.existsSync(FOOTER_FILE)) {
      const raw = fs.readFileSync(FOOTER_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_FOOTER_CONFIG,
        ...parsed,
        columns: parsed.columns || DEFAULT_FOOTER_CONFIG.columns,
        socialLinks: parsed.socialLinks || DEFAULT_FOOTER_CONFIG.socialLinks,
        legalLinks: parsed.legalLinks || DEFAULT_FOOTER_CONFIG.legalLinks,
      };
    }
  } catch (err) {
    console.error("Error reading footer-config.json:", err);
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function saveFooterConfig(config: Partial<FooterConfig>): FooterConfig {
  const current = getFooterConfig();
  const merged: FooterConfig = {
    ...current,
    ...config,
    columns: config.columns || current.columns,
    socialLinks: config.socialLinks || current.socialLinks,
    legalLinks: config.legalLinks || current.legalLinks,
    updatedAt: new Date().toISOString(),
  };

  try {
    ensureDirectoryExists();
    fs.writeFileSync(FOOTER_FILE, JSON.stringify(merged, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write footer-config.json:", err);
  }

  // Sync to Supabase in background
  syncFooterToSupabase(merged).catch((e) =>
    console.warn("Background Supabase footer sync:", e?.message)
  );

  return merged;
}

// Background Sync to Supabase blogs table (category: 'Footer Config')
export async function syncFooterToSupabase(config: FooterConfig) {
  try {
    const slug = "site-footer-config";
    const payload = {
      title: "SSCZone Footer & Social Configuration",
      slug,
      excerpt: config.brandDescription,
      content: JSON.stringify(config),
      category: "Footer Config",
      exam_tag: "Site Settings",
      keywords: JSON.stringify({
        updatedAt: config.updatedAt,
        columnsCount: config.columns.length,
      }),
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase.from("blogs").update(payload).eq("slug", slug);
    } else {
      await supabase.from("blogs").insert([payload]);
    }
  } catch (err: any) {
    console.warn("Failed to sync footer with Supabase:", err?.message);
  }
}
