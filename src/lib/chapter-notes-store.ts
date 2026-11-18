import fs from "fs";
import path from "path";
import { ChapterNote, SubjectMeta, ALL_SUBJECTS } from "./chapter-notes-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export type { ChapterNote, SubjectMeta };
export { ALL_SUBJECTS };

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "chapter_notes.json");
const SETTING_KEY = "chapter_notes";

// Helper to safely write notes to JSON file and Supabase site_settings
function writeNotesFile(notes: ChapterNote[]) {
  void saveSiteSettingAsync(SETTING_KEY, notes);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write chapter_notes.json:", err);
  }
}

// ── Public Store API Methods ──

export function getChapterNotes(options?: {
  subject_id?: string;
  type?: "chapter_note" | "educational_guide" | "all";
  active_only?: boolean;
  search?: string;
}): ChapterNote[] {
  let list: ChapterNote[] = [];

  const cached = getSiteSettingCached<ChapterNote[] | null>(SETTING_KEY, null);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    list = [...cached];
  } else {
    try {
      if (fs.existsSync(FILE_PATH)) {
        const raw = fs.readFileSync(FILE_PATH, "utf8");
        list = JSON.parse(raw);
        primeSiteSettingCache(SETTING_KEY, list);
      } else {
        list = [];
      }
    } catch (err) {
      console.error("Error reading chapter notes file:", err);
      list = [];
    }
  }

  // Filter active status
  if (options?.active_only !== false) {
    list = list.filter((n) => n.is_active !== false);
  }

  // Filter subject
  if (options?.subject_id && options.subject_id !== "all") {
    list = list.filter((n) => n.subject_id === options.subject_id);
  }

  // Filter type
  if (options?.type && options.type !== "all") {
    list = list.filter((n) => n.type === options.type);
  }

  // Filter search
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.hindi_title?.toLowerCase().includes(q) ||
        n.excerpt?.toLowerCase().includes(q) ||
        n.subject_name?.toLowerCase().includes(q)
    );
  }

  // Sort by sort_order ascending, then chapter_number ascending
  return list.sort((a, b) => {
    if ((a.sort_order || 99) !== (b.sort_order || 99)) {
      return (a.sort_order || 99) - (b.sort_order || 99);
    }
    return (a.chapter_number || 0) - (b.chapter_number || 0);
  });
}

export function getChapterNoteBySlug(slug: string): ChapterNote | null {
  const notes = getChapterNotes({ active_only: false });
  const found = notes.find((n) => n.slug === slug);
  return found || null;
}

// In-memory cache to prevent Supabase egress exhaustion
let cachedNotesList: { data: ChapterNote[]; expiresAt: number } | null = null;
const singleNoteCache = new Map<string, { data: ChapterNote; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export function invalidateChapterNotesCache(slug?: string) {
  cachedNotesList = null;
  if (slug) {
    singleNoteCache.delete(slug);
  } else {
    singleNoteCache.clear();
  }
}

/**
 * Dynamic asynchronous reader that synchronizes with Supabase `blogs` table
 * Excludes heavy HTML `content` to minimize database egress on listing/sidebar requests
 */
export async function getChapterNotesAsync(options?: {
  subject_id?: string;
  type?: "chapter_note" | "educational_guide" | "all";
  active_only?: boolean;
  search?: string;
}): Promise<ChapterNote[]> {
  const now = Date.now();
  let fullList: ChapterNote[];

  if (cachedNotesList && cachedNotesList.expiresAt > now) {
    fullList = cachedNotesList.data;
  } else {
    const localNotes = getChapterNotes({ active_only: false });
    const notesMap = new Map<string, ChapterNote>();
    for (const n of localNotes) {
      notesMap.set(n.slug, n);
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      // Bandwidth optimization: Never fetch full HTML `content` when listing/indexing!
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, keywords, is_published, created_at, updated_at")
        .eq("is_published", true)
        .not("keywords", "ilike", "%system-report%")
        .not("slug", "ilike", "sys-report%");

      if (!error && data && data.length > 0) {
        for (const b of data) {
          let meta: any = {};
          if (b.keywords && typeof b.keywords === "string") {
            try {
              meta = JSON.parse(b.keywords);
            } catch {
              meta = { focus: b.keywords };
            }
          }

          const category = (meta.category || "").toLowerCase();
          let subject_id = "";
          let subject_name = "";

          if (category.includes("english") || b.slug.startsWith("english-")) {
            subject_id = "english";
            subject_name = "English Comprehension (अंग्रेजी भाषा)";
          } else if (category.includes("biology") || b.slug.startsWith("biology-")) {
            subject_id = "biology";
            subject_name = "Biology (जीव विज्ञान)";
          } else if (category.includes("physics") || b.slug.startsWith("physics-")) {
            subject_id = "physics";
            subject_name = "Physics (भौतिक विज्ञान)";
          } else if (category.includes("polity") || b.slug.startsWith("polity-")) {
            subject_id = "polity";
            subject_name = "Indian Polity & Constitution (भारतीय राजव्यवस्था)";
          } else if (category.includes("math") || b.slug.startsWith("math-")) {
            subject_id = "maths";
            subject_name = "Quantitative Aptitude (गणित)";
          }

          if (subject_id) {
            const existing = notesMap.get(b.slug);
            notesMap.set(b.slug, {
              id: b.id || `sup_${b.slug}`,
              slug: b.slug,
              title: b.title,
              hindi_title: meta.hindiTitle || existing?.hindi_title,
              excerpt: b.excerpt || existing?.excerpt || "",
              type: "chapter_note",
              subject_id: subject_id,
              subject_name: subject_name,
              chapter_number: existing?.chapter_number || 1,
              chapter_title: b.title,
              read_time: meta.readTime || existing?.read_time || "12 min read",
              sort_order: existing?.sort_order || 1,
              is_active: b.is_published,
              is_featured: existing?.is_featured ?? true,
              exam_tag: meta.examTag || existing?.exam_tag || "SSC CGL / CHSL",
              created_at: b.created_at,
              updated_at: b.updated_at || b.created_at,
              content: existing?.content || "",
            });
          }
        }
      }
    } catch (err) {
      console.error("Error reading chapter notes from Supabase:", err);
    }

    fullList = Array.from(notesMap.values());
    cachedNotesList = { data: fullList, expiresAt: now + CACHE_TTL_MS };
  }

  let list = [...fullList];

  if (options?.active_only !== false) {
    list = list.filter((n) => n.is_active !== false);
  }

  if (options?.subject_id && options.subject_id !== "all") {
    list = list.filter((n) => n.subject_id === options.subject_id);
  }

  if (options?.type && options.type !== "all") {
    list = list.filter((n) => n.type === options.type);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.hindi_title?.toLowerCase().includes(q) ||
        n.excerpt?.toLowerCase().includes(q) ||
        n.subject_name?.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => {
    if ((a.sort_order || 99) !== (b.sort_order || 99)) {
      return (a.sort_order || 99) - (b.sort_order || 99);
    }
    return (a.chapter_number || 0) - (b.chapter_number || 0);
  });
}

/**
 * Single chapter reader: fetches full content ONLY when explicitly requested for that slug
 * Uses memory cache to prevent repeated fetches
 */
export async function getChapterNoteBySlugAsync(slug: string): Promise<ChapterNote | null> {
  const now = Date.now();
  const cached = singleNoteCache.get(slug);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // 1. Check local static notes first (Physics, Polity, Maths, etc.)
  const localNote = getChapterNoteBySlug(slug);
  if (localNote && localNote.content && localNote.content.length > 200) {
    singleNoteCache.set(slug, { data: localNote, expiresAt: now + CACHE_TTL_MS });
    return localNote;
  }

  // 2. Fetch specific single note with content from Supabase
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data: b, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, content, keywords, is_published, created_at, updated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && b) {
      let meta: any = {};
      if (b.keywords && typeof b.keywords === "string") {
        try {
          meta = JSON.parse(b.keywords);
        } catch {
          meta = { focus: b.keywords };
        }
      }

      const category = (meta.category || "").toLowerCase();
      let subject_id = "general";
      let subject_name = "General Knowledge";

      if (category.includes("english") || b.slug.startsWith("english-")) {
        subject_id = "english";
        subject_name = "English Comprehension (अंग्रेजी भाषा)";
      } else if (category.includes("biology") || b.slug.startsWith("biology-")) {
        subject_id = "biology";
        subject_name = "Biology (जीव विज्ञान)";
      } else if (category.includes("physics") || b.slug.startsWith("physics-")) {
        subject_id = "physics";
        subject_name = "Physics (भौतिक विज्ञान)";
      } else if (category.includes("polity") || b.slug.startsWith("polity-")) {
        subject_id = "polity";
        subject_name = "Indian Polity & Constitution (भारतीय राजव्यवस्था)";
      } else if (category.includes("math") || b.slug.startsWith("math-")) {
        subject_id = "maths";
        subject_name = "Quantitative Aptitude (गणित)";
      }

      const resolved: ChapterNote = {
        id: b.id || `sup_${b.slug}`,
        slug: b.slug,
        title: b.title,
        hindi_title: meta.hindiTitle || localNote?.hindi_title,
        excerpt: b.excerpt || localNote?.excerpt || "",
        type: "chapter_note",
        subject_id,
        subject_name,
        chapter_number: localNote?.chapter_number || 1,
        chapter_title: b.title,
        read_time: meta.readTime || localNote?.read_time || "12 min read",
        sort_order: localNote?.sort_order || 1,
        is_active: b.is_published,
        is_featured: localNote?.is_featured ?? true,
        exam_tag: meta.examTag || localNote?.exam_tag || "SSC CGL / CHSL",
        created_at: b.created_at,
        updated_at: b.updated_at || b.created_at,
        content: b.content || localNote?.content || "<p>Content coming soon...</p>",
        english_content: localNote?.english_content || (b.content?.includes('class="lang-en"') ? b.content.match(/<div class="lang-en">([\s\S]*?)<\/div>\s*<div class="lang-hi">/)?.[1] : undefined),
        hindi_content: localNote?.hindi_content || (b.content?.includes('class="lang-hi"') ? b.content.match(/<div class="lang-hi">([\s\S]*?)<\/div>\s*$/)?.[1] : undefined),
      };

      singleNoteCache.set(slug, { data: resolved, expiresAt: now + CACHE_TTL_MS });
      return resolved;
    }
  } catch (err) {
    console.error("Error reading single chapter note from Supabase:", err);
  }

  return localNote || null;
}

export function saveChapterNote(data: Partial<ChapterNote>): ChapterNote {
  const list = getChapterNotes({ active_only: false });
  const now = new Date().toISOString();

  // If slug is missing, generate from title
  const cleanSlug = (data.slug || data.title || "note")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (data.id) {
    const idx = list.findIndex((n) => n.id === data.id);
    if (idx !== -1) {
      const existing = list[idx];
      const updated: ChapterNote = {
        ...existing,
        ...data,
        slug: cleanSlug || existing.slug,
        updated_at: now,
      } as ChapterNote;
      list[idx] = updated;
      writeNotesFile(list);
      return updated;
    }
  }

  // Create new note
  const newId = `cn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const subjectObj = ALL_SUBJECTS.find((s) => s.id === data.subject_id);

  const newNote: ChapterNote = {
    id: newId,
    slug: cleanSlug,
    title: data.title || "Untitled Chapter Note",
    hindi_title: data.hindi_title || "",
    excerpt: data.excerpt || "",
    content: data.content || "<p>Content coming soon...</p>",
    type: data.type || "chapter_note",
    subject_id: data.subject_id || "physics",
    subject_name: data.subject_name || (subjectObj ? `${subjectObj.name} (${subjectObj.hindi_name})` : "General Science"),
    chapter_number: Number(data.chapter_number) || 1,
    chapter_title: data.chapter_title || data.title || "Chapter Note",
    read_time: data.read_time || "6 min read",
    image_url: data.image_url || undefined,
    is_active: data.is_active !== false,
    is_featured: Boolean(data.is_featured),
    sort_order: Number(data.sort_order) || list.length + 1,
    exam_tag: data.exam_tag !== undefined ? (data.exam_tag?.trim() || "") : "",
    created_at: now,
    updated_at: now,
  };

  list.push(newNote);
  writeNotesFile(list);
  return newNote;
}

export function toggleChapterNoteStatus(id: string, is_active?: boolean): ChapterNote | null {
  const list = getChapterNotes({ active_only: false });
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  current.is_active = typeof is_active === "boolean" ? is_active : !current.is_active;
  current.updated_at = new Date().toISOString();
  list[idx] = current;
  writeNotesFile(list);
  return current;
}

export function deleteChapterNote(id: string): boolean {
  const list = getChapterNotes({ active_only: false });
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length !== list.length) {
    writeNotesFile(filtered);
    return true;
  }
  return false;
}

export function getSubjectStats() {
  const allNotes = getChapterNotes({ active_only: false });
  const activeNotes = allNotes.filter((n) => n.is_active);

  const subjectCounts: Record<string, { total: number; active: number }> = {};
  ALL_SUBJECTS.forEach((s) => {
    subjectCounts[s.id] = { total: 0, active: 0 };
  });

  allNotes.forEach((n) => {
    if (!subjectCounts[n.subject_id]) {
      subjectCounts[n.subject_id] = { total: 0, active: 0 };
    }
    subjectCounts[n.subject_id].total++;
    if (n.is_active) {
      subjectCounts[n.subject_id].active++;
    }
  });

  return {
    totalNotes: allNotes.length,
    activeNotes: activeNotes.length,
    inactiveNotes: allNotes.length - activeNotes.length,
    chapterNotesCount: allNotes.filter((n) => n.type === "chapter_note").length,
    guideNotesCount: allNotes.filter((n) => n.type === "educational_guide").length,
    subjectCounts,
  };
}
