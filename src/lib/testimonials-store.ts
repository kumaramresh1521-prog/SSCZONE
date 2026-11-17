import fs from "fs";
import path from "path";
import { TopperTestimonial, DEFAULT_TESTIMONIALS } from "./testimonials-types";
import { supabase } from "./supabase";

export * from "./testimonials-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const TESTIMONIALS_FILE = path.join(DATA_DIR, "testimonials.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAllTestimonials(): TopperTestimonial[] {
  try {
    if (fs.existsSync(TESTIMONIALS_FILE)) {
      const raw = fs.readFileSync(TESTIMONIALS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
      }
    }
  } catch (err) {
    console.error("Error reading testimonials.json:", err);
  }
  return DEFAULT_TESTIMONIALS;
}

export function getActiveTestimonials(): TopperTestimonial[] {
  return getAllTestimonials().filter((t) => t.isActive);
}

export function saveAllTestimonials(items: TopperTestimonial[]): TopperTestimonial[] {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write testimonials.json:", err);
  }

  // Background sync to Supabase
  syncTestimonialsToSupabase(items).catch((e) =>
    console.warn("Background Supabase testimonials sync:", e?.message)
  );

  return items;
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

export function deleteTestimonial(id: string): boolean {
  const current = getAllTestimonials();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length !== current.length) {
    saveAllTestimonials(filtered);
    return true;
  }
  return false;
}

export async function syncTestimonialsToSupabase(testimonials: TopperTestimonial[]) {
  try {
    const slug = "site-topper-testimonials";
    const payload = {
      title: "SSCZone Verified Topper Testimonials & Reviews",
      slug,
      excerpt: `${testimonials.length} Topper Reviews (${testimonials.filter((t) => t.isActive).length} active)`,
      content: JSON.stringify(testimonials),
      category: "Topper Testimonial",
      keywords: ["testimonials", "toppers", "reviews", "air-rankers", "success-stories"],
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
    console.warn("syncTestimonialsToSupabase skipped/error:", err);
  }
}
