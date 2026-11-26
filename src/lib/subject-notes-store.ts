import fs from "fs";
import path from "path";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";
import {
  DEFAULT_NOTE_CATEGORIES,
  NoteCategory,
  ResolvedNoteCategory,
  SubjectNote,
  slugifyNoteCategoryId,
} from "./subject-notes-types";

export * from "./subject-notes-types";

const NOTES_FILE = path.join(process.cwd(), "src", "data", "subject_notes.json");
const SETTING_KEY = "subject_notes";
const CATEGORIES_SETTING_KEY = "note_categories";

function mergeConfiguredCategories(saved: unknown): NoteCategory[] {
  const byId = new Map<string, NoteCategory>();
  DEFAULT_NOTE_CATEGORIES.forEach((cat) => byId.set(cat.id, { ...cat }));
  if (Array.isArray(saved)) {
    saved.forEach((raw: any, idx) => {
      if (!raw || !raw.id) return;
      const id = String(raw.id).trim().toLowerCase();
      if (!id) return;
      const existing = byId.get(id);
      byId.set(id, {
        id,
        name: String(raw.name || existing?.name || id).trim(),
        icon: raw.icon || existing?.icon || "📚",
        color: raw.color || existing?.color || "blue",
        sort_order: typeof raw.sort_order === "number" ? raw.sort_order : existing?.sort_order ?? 20 + idx,
        is_custom: raw.is_custom !== undefined ? Boolean(raw.is_custom) : !DEFAULT_NOTE_CATEGORIES.some((d) => d.id === id),
      });
    });
  }
  return Array.from(byId.values()).sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
}

export function getConfiguredNoteCategories(): NoteCategory[] {
  const cached = getSiteSettingCached<NoteCategory[] | null>(CATEGORIES_SETTING_KEY, null);
  return mergeConfiguredCategories(cached);
}

export async function getConfiguredNoteCategoriesAsync(): Promise<NoteCategory[]> {
  const saved = await getSiteSettingAsync<NoteCategory[]>(CATEGORIES_SETTING_KEY, []);
  return mergeConfiguredCategories(saved);
}

export function resolveNoteCategories(
  notes: SubjectNote[],
  configured: NoteCategory[]
): ResolvedNoteCategory[] {
  const map = new Map<string, ResolvedNoteCategory>();
  configured.forEach((cat) => {
    map.set(cat.id.toLowerCase(), { ...cat, count: 0 });
  });

  notes.forEach((note) => {
    const rawId = (note.subject || "general").trim().toLowerCase();
    const existing = map.get(rawId);
    if (existing) {
      existing.count += 1;
      if (!existing.name && note.subject_name) {
        existing.name = note.subject_name;
      }
    } else {
      map.set(rawId, {
        id: rawId,
        name: note.subject_name || rawId.replace(/-/g, " "),
        icon: "📚",
        color: "blue",
        sort_order: map.size + 50,
        is_custom: true,
        count: 1,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if ((a.sort_order ?? 99) !== (b.sort_order ?? 99)) {
      return (a.sort_order ?? 99) - (b.sort_order ?? 99);
    }
    return a.name.localeCompare(b.name);
  });
}

export async function getResolvedNoteCategoriesAsync(
  notes: SubjectNote[]
): Promise<ResolvedNoteCategory[]> {
  const configured = await getConfiguredNoteCategoriesAsync();
  return resolveNoteCategories(notes, configured);
}

export async function saveNoteCategoryAsync(
  input: Partial<NoteCategory>
): Promise<NoteCategory> {
  const current = await getConfiguredNoteCategoriesAsync();
  const cleanName = String(input.name || "").trim();
  const id = (input.id ? slugifyNoteCategoryId(input.id) : slugifyNoteCategoryId(cleanName));
  const idx = current.findIndex((c) => c.id === id);
  const existing = idx !== -1 ? current[idx] : null;
  const savedItem: NoteCategory = {
    id,
    name: cleanName || existing?.name || id,
    icon: input.icon?.trim() || existing?.icon || "📚",
    color: input.color?.trim() || existing?.color || "blue",
    sort_order:
      typeof input.sort_order === "number"
        ? input.sort_order
        : existing?.sort_order ?? current.length + 1,
    is_custom: existing ? Boolean(existing.is_custom || input.is_custom) : true,
  };

  if (idx !== -1) {
    current[idx] = savedItem;
  } else {
    current.push(savedItem);
  }

  await saveSiteSettingAsync(CATEGORIES_SETTING_KEY, current);
  return savedItem;
}

export async function deleteNoteCategoryAsync(id: string): Promise<boolean> {
  const targetId = id.trim().toLowerCase();
  const saved = await getSiteSettingAsync<NoteCategory[]>(CATEGORIES_SETTING_KEY, []);
  if (!Array.isArray(saved) || saved.length === 0) return false;
  const filtered = saved.filter((c) => c.id.toLowerCase() !== targetId);
  if (filtered.length !== saved.length) {
    await saveSiteSettingAsync(CATEGORIES_SETTING_KEY, filtered);
    return true;
  }
  return false;
}

function getLocalFileFallback(): SubjectNote[] {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const content = fs.readFileSync(NOTES_FILE, "utf8");
      const list: SubjectNote[] = JSON.parse(content);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.error("Failed to read local subject notes:", e);
  }
  return [];
}

export function getSubjectNotes(activeOnly: boolean = false): SubjectNote[] {
  const cached = getSiteSettingCached<SubjectNote[] | null>(SETTING_KEY, null);
  let list: SubjectNote[] = [];
  if (cached && Array.isArray(cached) && cached.length > 0) {
    list = [...cached];
  } else {
    list = getLocalFileFallback();
    primeSiteSettingCache(SETTING_KEY, list);
  }

  if (activeOnly) {
    return list.filter((n) => n.is_active !== false).sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  }
  return list.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
}

export async function getSubjectNotesAsync(activeOnly: boolean = false): Promise<SubjectNote[]> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<SubjectNote[]>(SETTING_KEY, fallback);
  let list = Array.isArray(dbData) && dbData.length > 0 ? [...dbData] : fallback;

  if (activeOnly) {
    return list.filter((n) => n.is_active !== false).sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  }
  return list.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
}

export async function saveSubjectNoteAsync(data: Partial<SubjectNote>): Promise<SubjectNote> {
  const list = await getSubjectNotesAsync(false);
  const now = new Date().toISOString();

  let savedNote: SubjectNote;

  if (data.id) {
    const index = list.findIndex((n) => n.id === data.id);
    if (index !== -1) {
      savedNote = {
        ...list[index],
        ...data,
        updated_at: now,
      } as SubjectNote;
      list[index] = savedNote;
    } else {
      savedNote = buildNewNote(data, now, list.length);
      list.unshift(savedNote);
    }
  } else {
    savedNote = buildNewNote(data, now, list.length);
    list.unshift(savedNote);
  }

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, list);

  // 2. Local file backup (non-fatal)
  try {
    const dir = path.dirname(NOTES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(NOTES_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {}

  return savedNote;
}

export function saveSubjectNote(data: Partial<SubjectNote>): SubjectNote {
  const list = getSubjectNotes(false);
  const now = new Date().toISOString();

  let savedNote: SubjectNote;

  if (data.id) {
    const index = list.findIndex((n) => n.id === data.id);
    if (index !== -1) {
      savedNote = {
        ...list[index],
        ...data,
        updated_at: now,
      } as SubjectNote;
      list[index] = savedNote;
    } else {
      savedNote = buildNewNote(data, now, list.length);
      list.unshift(savedNote);
    }
  } else {
    savedNote = buildNewNote(data, now, list.length);
    list.unshift(savedNote);
  }

  void saveSiteSettingAsync(SETTING_KEY, list);

  try {
    const dir = path.dirname(NOTES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(NOTES_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {}

  return savedNote;
}

function buildNewNote(data: Partial<SubjectNote>, now: string, currentLength: number): SubjectNote {
  return {
    id: data.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: data.title || "Untitled Note",
    hindi_title: data.hindi_title || "",
    exam: data.exam || "ssc-cgl",
    exam_name: data.exam_name || "SSC CGL",
    subject: data.subject || "quant",
    subject_name: data.subject_name || data.subject || "Quantitative Aptitude",
    topic: data.topic || "General",
    description: data.description || "",
    pdf_url: data.pdf_url || "",
    file_size: data.file_size || "1.5 MB",
    page_count: Number(data.page_count) || 12,
    language: data.language || "Bilingual",
    is_free: data.is_free !== false,
    is_featured: Boolean(data.is_featured),
    downloads_count: data.downloads_count || 0,
    sort_order: Number(data.sort_order) || currentLength + 1,
    is_active: data.is_active !== false,
    created_at: now,
    updated_at: now,
  };
}

export async function deleteSubjectNoteAsync(id: string): Promise<boolean> {
  const list = await getSubjectNotesAsync(false);
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length !== list.length) {
    await saveSiteSettingAsync(SETTING_KEY, filtered);

    try {
      const dir = path.dirname(NOTES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(NOTES_FILE, JSON.stringify(filtered, null, 2), "utf8");
    } catch {}

    return true;
  }
  return false;
}

export function deleteSubjectNote(id: string): boolean {
  const list = getSubjectNotes(false);
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length !== list.length) {
    void saveSiteSettingAsync(SETTING_KEY, filtered);

    try {
      const dir = path.dirname(NOTES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(NOTES_FILE, JSON.stringify(filtered, null, 2), "utf8");
    } catch {}

    return true;
  }
  return false;
}

export async function toggleSubjectNoteActiveAsync(id: string, isActive: boolean): Promise<SubjectNote | null> {
  const list = await getSubjectNotesAsync(false);
  const note = list.find((n) => n.id === id);
  if (note) {
    note.is_active = isActive;
    note.updated_at = new Date().toISOString();
    await saveSiteSettingAsync(SETTING_KEY, list);

    try {
      const dir = path.dirname(NOTES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(NOTES_FILE, JSON.stringify(list, null, 2), "utf8");
    } catch {}

    return note;
  }
  return null;
}

export function toggleSubjectNoteActive(id: string, isActive: boolean): SubjectNote | null {
  const list = getSubjectNotes(false);
  const note = list.find((n) => n.id === id);
  if (note) {
    note.is_active = isActive;
    note.updated_at = new Date().toISOString();
    void saveSiteSettingAsync(SETTING_KEY, list);

    try {
      const dir = path.dirname(NOTES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(NOTES_FILE, JSON.stringify(list, null, 2), "utf8");
    } catch {}

    return note;
  }
  return null;
}
