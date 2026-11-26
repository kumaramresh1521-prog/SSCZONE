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

export interface NoteCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_custom?: boolean;
}

export interface ResolvedNoteCategory extends NoteCategory {
  count: number;
}

export const DEFAULT_NOTE_CATEGORIES: NoteCategory[] = [
  { id: "quant", name: "Quantitative Aptitude (Maths)", icon: "📐", color: "blue", sort_order: 1 },
  { id: "english", name: "English Language", icon: "📖", color: "emerald", sort_order: 2 },
  { id: "biology", name: "General Science - Biology (जीव विज्ञान)", icon: "🧬", color: "teal", sort_order: 3 },
  { id: "science", name: "General Awareness - Science (Phy/Chem/Bio)", icon: "🔬", color: "cyan", sort_order: 4 },
  { id: "reasoning", name: "Reasoning & Mental Ability", icon: "🧠", color: "purple", sort_order: 5 },
  { id: "history", name: "General Awareness - History", icon: "🏛️", color: "amber", sort_order: 6 },
  { id: "polity", name: "General Awareness - Polity & Constitution", icon: "⚖️", color: "indigo", sort_order: 7 },
  { id: "geography", name: "General Awareness - Geography", icon: "🌍", color: "teal", sort_order: 8 },
  { id: "economy", name: "General Awareness - Economy", icon: "📈", color: "rose", sort_order: 9 },
  { id: "static-gk", name: "Static GK & Culture", icon: "✨", color: "amber", sort_order: 10 },
  { id: "computer", name: "Computer Knowledge & Aptitude", icon: "💻", color: "violet", sort_order: 11 },
];

export function slugifyNoteCategoryId(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`
  );
}
