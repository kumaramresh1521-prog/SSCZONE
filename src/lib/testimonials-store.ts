import fs from "fs";
import path from "path";
import { TopperTestimonial, DEFAULT_TESTIMONIALS } from "./testimonials-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./testimonials-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const TESTIMONIALS_FILE = path.join(DATA_DIR, "testimonials.json");
const SETTING_KEY = "testimonials_config";

function getLocalFileFallback(): TopperTestimonial[] {
  try {
    if (fs.existsSync(TESTIMONIALS_FILE)) {
      const raw = fs.readFileSync(TESTIMONIALS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
      }
    }
  } catch (err) {
    console.error("Error reading local testimonials.json:", err);
  }
  return DEFAULT_TESTIMONIALS;
}

export function getAllTestimonials(): TopperTestimonial[] {
  const cached = getSiteSettingCached<TopperTestimonial[] | null>(SETTING_KEY, null);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  }
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getAllTestimonialsAsync(): Promise<TopperTestimonial[]> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<TopperTestimonial[]>(SETTING_KEY, fallback);
  if (Array.isArray(dbData) && dbData.length > 0) {
    return dbData.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  }
  return fallback;
}

export function getActiveTestimonials(): TopperTestimonial[] {
  return getAllTestimonials().filter((t) => t.isActive);
}

export async function getActiveTestimonialsAsync(): Promise<TopperTestimonial[]> {
  const list = await getAllTestimonialsAsync();
  return list.filter((t) => t.isActive);
}

export async function saveAllTestimonialsAsync(items: TopperTestimonial[]): Promise<TopperTestimonial[]> {
  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, items);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch {}

  return items;
}

export function saveAllTestimonials(items: TopperTestimonial[]): TopperTestimonial[] {
  void saveSiteSettingAsync(SETTING_KEY, items);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch {}

  return items;
}

export async function upsertTestimonialAsync(testimonial: Partial<TopperTestimonial>): Promise<TopperTestimonial> {
  const current = await getAllTestimonialsAsync();
  let updated: TopperTestimonial;

  if (testimonial.id) {
    const idx = current.findIndex((t) => t.id === testimonial.id);
    if (idx >= 0) {
      updated = {
        ...current[idx],
        ...testimonial,
        updatedAt: new Date().toISOString(),
      };
      current[idx] = updated;
    } else {
      updated = {
        id: testimonial.id,
        name: testimonial.name || "Aspirant",
        exam: testimonial.exam || "SSC CGL",
        rank: testimonial.rank || "AIR Ranker",
        score: testimonial.score || "",
        photoUrl: testimonial.photoUrl || "",
        state: testimonial.state || "",
        badge: testimonial.badge || "Verified Topper",
        quote: testimonial.quote || "",
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive !== false,
        sortOrder: testimonial.sortOrder || current.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      current.push(updated);
    }
  } else {
    updated = {
      id: `top_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: testimonial.name || "Aspirant",
      exam: testimonial.exam || "SSC CGL",
      rank: testimonial.rank || "AIR Ranker",
      score: testimonial.score || "",
      photoUrl: testimonial.photoUrl || "",
      state: testimonial.state || "",
      badge: testimonial.badge || "Verified Topper",
      quote: testimonial.quote || "",
      rating: testimonial.rating || 5,
      isActive: testimonial.isActive !== false,
      sortOrder: testimonial.sortOrder || current.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.push(updated);
  }

  await saveAllTestimonialsAsync(current);
  return updated;
}

export function upsertTestimonial(testimonial: Partial<TopperTestimonial>): TopperTestimonial {
  const current = getAllTestimonials();
  let updated: TopperTestimonial;

  if (testimonial.id) {
    const idx = current.findIndex((t) => t.id === testimonial.id);
    if (idx >= 0) {
      updated = {
        ...current[idx],
        ...testimonial,
        updatedAt: new Date().toISOString(),
      };
      current[idx] = updated;
    } else {
      updated = {
        id: testimonial.id,
        name: testimonial.name || "Aspirant",
        exam: testimonial.exam || "SSC CGL",
        rank: testimonial.rank || "AIR Ranker",
        score: testimonial.score || "",
        photoUrl: testimonial.photoUrl || "",
        state: testimonial.state || "",
        badge: testimonial.badge || "Verified Topper",
        quote: testimonial.quote || "",
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive !== false,
        sortOrder: testimonial.sortOrder || current.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      current.push(updated);
    }
  } else {
    updated = {
      id: `top_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: testimonial.name || "Aspirant",
      exam: testimonial.exam || "SSC CGL",
      rank: testimonial.rank || "AIR Ranker",
      score: testimonial.score || "",
      photoUrl: testimonial.photoUrl || "",
      state: testimonial.state || "",
      badge: testimonial.badge || "Verified Topper",
      quote: testimonial.quote || "",
      rating: testimonial.rating || 5,
      isActive: testimonial.isActive !== false,
      sortOrder: testimonial.sortOrder || current.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.push(updated);
  }

  saveAllTestimonials(current);
  return updated;
}

export async function deleteTestimonialAsync(id: string): Promise<boolean> {
  const current = await getAllTestimonialsAsync();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length !== current.length) {
    await saveAllTestimonialsAsync(filtered);
    return true;
  }
  return false;
}

export function deleteTestimonial(id: string): boolean {
  const current = getAllTestimonials();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length !== current.length) {
    saveAllTestimonials(filtered);
    return true;
  }
  return false;
}
