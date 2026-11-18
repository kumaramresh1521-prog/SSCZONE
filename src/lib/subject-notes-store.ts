import fs from "fs";
import path from "path";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export interface SubjectNote {
  id: string;
  title: string;
  hindi_title?: string;
  exam: string; // "ssc-cgl" | "ssc-chsl" | "ssc-cpo" | "ssc-mts" | "all"
  exam_name: string; // "SSC CGL", "SSC CHSL", "All SSC Exams", etc.
  subject: string; // "quant" | "reasoning" | "english" | "ga" | "computer"
  subject_name: string; // "Quantitative Aptitude", "General Awareness", etc.
  topic: string; // "Geometry", "Modern History", "Number System"
  description: string;
  pdf_url: string; // Direct link or Supabase storage link
  pdf_url_hindi?: string;
  html_url?: string;
  html_url_hindi?: string;
  slug?: string;
  reader_url?: string;
  file_size?: string; // "2.4 MB"
  page_count?: number; // 24
  language: "Bilingual" | "English" | "Hindi";
  is_free: boolean;
  is_featured?: boolean;
  downloads_count?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const NOTES_FILE = path.join(process.cwd(), "src", "data", "subject_notes.json");
const SETTING_KEY = "subject_notes";

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
    subject_name: data.subject_name || "Quantitative Aptitude",
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
