import fs from "fs";
import path from "path";

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

export function getSubjectNotes(activeOnly: boolean = false): SubjectNote[] {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const content = fs.readFileSync(NOTES_FILE, "utf8");
      const list: SubjectNote[] = JSON.parse(content);
      if (Array.isArray(list)) {
        if (activeOnly) {
          return list.filter((n) => n.is_active !== false).sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
        }
        return list.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
      }
    }
  } catch (e) {
    console.error("Failed to read subject notes:", e);
  }
  return [];
}

export function saveSubjectNote(data: Partial<SubjectNote>): SubjectNote {
  const list = getSubjectNotes(false);
  const now = new Date().toISOString();

  if (data.id) {
    // Update existing note
    const index = list.findIndex((n) => n.id === data.id);
    if (index !== -1) {
      const existing = list[index];
      const updated: SubjectNote = {
        ...existing,
        ...data,
        updated_at: now,
      } as SubjectNote;
      list[index] = updated;
      writeNotesFile(list);
      return updated;
    }
  }

  // Create new note
  const newNote: SubjectNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    sort_order: Number(data.sort_order) || list.length + 1,
    is_active: data.is_active !== false,
    created_at: now,
    updated_at: now,
  };

  list.unshift(newNote);
  writeNotesFile(list);
  return newNote;
}

export function deleteSubjectNote(id: string): boolean {
  const list = getSubjectNotes(false);
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length !== list.length) {
    writeNotesFile(filtered);
    return true;
  }
  return false;
}

export function toggleSubjectNoteActive(id: string, isActive: boolean): SubjectNote | null {
  const list = getSubjectNotes(false);
  const note = list.find((n) => n.id === id);
  if (note) {
    note.is_active = isActive;
    note.updated_at = new Date().toISOString();
    writeNotesFile(list);
    return note;
  }
  return null;
}

function writeNotesFile(list: SubjectNote[]) {
  const dir = path.dirname(NOTES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(NOTES_FILE, JSON.stringify(list, null, 2), "utf8");
}
