import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSiteSettingAsync, saveSiteSettingAsync } from "./site-settings";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at: string;
}

const CATEGORIES_FILE = path.join(process.cwd(), "src", "data", "blog_categories.json");
const SYSTEM_SLUG = "sys-blog-categories";
const SETTING_KEY = "blog_categories";

// Read from local JSON cache
export function getLocalCategories(): BlogCategory[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error("Error reading local blog categories:", err);
  }
  return [];
}

// Write to local JSON cache
export function writeLocalCategories(list: BlogCategory[]) {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local blog categories:", err);
  }
}

// Fetch categories from Supabase (with local cache fallback)
export async function getBlogCategoriesAsync(): Promise<BlogCategory[]> {
  try {
    // 1. Try fetching from site_settings first (primary persistent source)
    const dbSettings = await getSiteSettingAsync<BlogCategory[] | null>(SETTING_KEY, null);
    if (dbSettings && Array.isArray(dbSettings) && dbSettings.length > 0) {
      writeLocalCategories(dbSettings);
      return dbSettings;
    }

    // 2. Legacy fallback: sys-blog-categories in blogs table
    const { data, error } = await supabaseAdmin
      .from("blogs")
      .select("content, updated_at")
      .eq("slug", SYSTEM_SLUG)
      .maybeSingle();

    if (!error && data && data.content) {
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
          writeLocalCategories(parsed);
          void saveSiteSettingAsync(SETTING_KEY, parsed);
          return parsed;
        }
      } catch {}
    }
  } catch (err) {
    console.error("Failed to fetch blog categories from Supabase:", err);
  }

  // Fallback to local cache
  return getLocalCategories();
}

// Save categories to Supabase and update local cache
export async function saveBlogCategoriesAsync(list: BlogCategory[]): Promise<boolean> {
  // Always update local cache first
  writeLocalCategories(list);

  // 1. Save to site_settings (Primary persistent source of truth)
  await saveSiteSettingAsync(SETTING_KEY, list);

  // 2. Also keep legacy sys-blog-categories record updated
  try {
    const payload = {
      slug: SYSTEM_SLUG,
      title: "System Config: Blog Categories",
      excerpt: "System configuration for dynamic blog categories",
      content: JSON.stringify(list),
      keywords: JSON.stringify({ type: "system-config", is_system: true }),
      is_published: false,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from("blogs")
      .select("id")
      .eq("slug", SYSTEM_SLUG)
      .maybeSingle();

    if (existing?.id) {
      await supabaseAdmin.from("blogs").update(payload).eq("id", existing.id);
    } else {
      await supabaseAdmin.from("blogs").insert([payload]);
    }
    return true;
  } catch (err) {
    console.error("Failed to save blog categories to Supabase:", err);
    return false;
  }
}
