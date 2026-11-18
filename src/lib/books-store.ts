import fs from "fs";
import path from "path";
import { BookItem } from "./books-types";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

export * from "./books-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const BOOKS_FILE = path.join(DATA_DIR, "books.json");
const SETTING_KEY = "books_config";

function getLocalFileFallback(): BookItem[] {
  try {
    if (fs.existsSync(BOOKS_FILE)) {
      const raw = fs.readFileSync(BOOKS_FILE, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error("Error reading local books.json:", err);
  }
  return [];
}

export function getBooks(options?: {
  active_only?: boolean;
  search?: string;
  subject?: string;
}): BookItem[] {
  const cached = getSiteSettingCached<BookItem[] | null>(SETTING_KEY, null);
  let list: BookItem[] = [];
  if (cached && Array.isArray(cached) && cached.length > 0) {
    list = [...cached];
  } else {
    list = getLocalFileFallback();
    primeSiteSettingCache(SETTING_KEY, list);
  }

  if (options?.active_only !== false) {
    list = list.filter((b) => b.is_active !== false);
  }

  if (options?.subject && options.subject !== "all") {
    list = list.filter((b) => b.subject.toLowerCase() === options.subject?.toLowerCase());
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.hindiTitle?.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
}

export async function getBooksAsync(options?: {
  active_only?: boolean;
  search?: string;
  subject?: string;
}): Promise<BookItem[]> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<BookItem[]>(SETTING_KEY, fallback);
  let list = Array.isArray(dbData) && dbData.length > 0 ? [...dbData] : fallback;

  if (options?.active_only !== false) {
    list = list.filter((b) => b.is_active !== false);
  }

  if (options?.subject && options.subject !== "all") {
    list = list.filter((b) => b.subject.toLowerCase() === options.subject?.toLowerCase());
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.hindiTitle?.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
}

export async function getBookByIdAsync(id: string): Promise<BookItem | null> {
  const books = await getBooksAsync({ active_only: false });
  return books.find((b) => b.id === id) || null;
}

export function getBookById(id: string): BookItem | null {
  const books = getBooks({ active_only: false });
  return books.find((b) => b.id === id) || null;
}

export async function saveBookAsync(data: Partial<BookItem>): Promise<BookItem> {
  const list = await getBooksAsync({ active_only: false });
  const now = new Date().toISOString();

  let savedBook: BookItem;

  if (data.id) {
    const idx = list.findIndex((b) => b.id === data.id);
    if (idx !== -1) {
      savedBook = {
        ...list[idx],
        ...data,
        updated_at: now,
      } as BookItem;
      list[idx] = savedBook;
    } else {
      savedBook = {
        id: data.id,
        title: data.title || "Untitled Book",
        hindiTitle: data.hindiTitle,
        author: data.author || "SSCZone Editorial",
        publisher: data.publisher || "SSCZone Publications",
        edition: data.edition || "2026 Edition",
        subject: data.subject || "PYQ Compilations",
        exams: data.exams || ["SSC CGL"],
        language: data.language || "Bilingual",
        pages: data.pages || 500,
        rating: data.rating || 4.8,
        reviewCount: data.reviewCount || 100,
        badge: data.badge,
        coverColor: data.coverColor || "from-blue-600 to-indigo-800",
        coverImage: data.coverImage,
        description: data.description || "",
        topperNote: data.topperNote,
        freePdfAvailable: data.freePdfAvailable ?? true,
        pdfUrl: data.pdfUrl,
        buyUrl: data.buyUrl,
        sampleChapters: data.sampleChapters || [],
        practiceTopicSlug: data.practiceTopicSlug,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? list.length + 1,
        created_at: data.created_at || now,
        updated_at: now,
      };
      list.push(savedBook);
    }
  } else {
    const newId = (data.title || "book")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    savedBook = {
      id: newId || `book-${Date.now()}`,
      title: data.title || "Untitled Book",
      hindiTitle: data.hindiTitle,
      author: data.author || "SSCZone Editorial",
      publisher: data.publisher || "SSCZone Publications",
      edition: data.edition || "2026 Edition",
      subject: data.subject || "PYQ Compilations",
      exams: data.exams || ["SSC CGL"],
      language: data.language || "Bilingual",
      pages: data.pages || 500,
      rating: data.rating || 4.8,
      reviewCount: data.reviewCount || 100,
      badge: data.badge,
      coverColor: data.coverColor || "from-blue-600 to-indigo-800",
      coverImage: data.coverImage,
      description: data.description || "",
      topperNote: data.topperNote,
      freePdfAvailable: data.freePdfAvailable ?? true,
      pdfUrl: data.pdfUrl,
      buyUrl: data.buyUrl,
      sampleChapters: data.sampleChapters || [],
      practiceTopicSlug: data.practiceTopicSlug,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? list.length + 1,
      created_at: now,
      updated_at: now,
    };
    list.push(savedBook);
  }

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, list);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {}

  return savedBook;
}

export function saveBook(data: Partial<BookItem>): BookItem {
  const list = getBooks({ active_only: false });
  const now = new Date().toISOString();

  let savedBook: BookItem;

  if (data.id) {
    const idx = list.findIndex((b) => b.id === data.id);
    if (idx !== -1) {
      savedBook = {
        ...list[idx],
        ...data,
        updated_at: now,
      } as BookItem;
      list[idx] = savedBook;
    } else {
      savedBook = {
        id: data.id,
        title: data.title || "Untitled Book",
        hindiTitle: data.hindiTitle,
        author: data.author || "SSCZone Editorial",
        publisher: data.publisher || "SSCZone Publications",
        edition: data.edition || "2026 Edition",
        subject: data.subject || "PYQ Compilations",
        exams: data.exams || ["SSC CGL"],
        language: data.language || "Bilingual",
        pages: data.pages || 500,
        rating: data.rating || 4.8,
        reviewCount: data.reviewCount || 100,
        badge: data.badge,
        coverColor: data.coverColor || "from-blue-600 to-indigo-800",
        coverImage: data.coverImage,
        description: data.description || "",
        topperNote: data.topperNote,
        freePdfAvailable: data.freePdfAvailable ?? true,
        pdfUrl: data.pdfUrl,
        buyUrl: data.buyUrl,
        sampleChapters: data.sampleChapters || [],
        practiceTopicSlug: data.practiceTopicSlug,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? list.length + 1,
        created_at: data.created_at || now,
        updated_at: now,
      };
      list.push(savedBook);
    }
  } else {
    const newId = (data.title || "book")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    savedBook = {
      id: newId || `book-${Date.now()}`,
      title: data.title || "Untitled Book",
      hindiTitle: data.hindiTitle,
      author: data.author || "SSCZone Editorial",
      publisher: data.publisher || "SSCZone Publications",
      edition: data.edition || "2026 Edition",
      subject: data.subject || "PYQ Compilations",
      exams: data.exams || ["SSC CGL"],
      language: data.language || "Bilingual",
      pages: data.pages || 500,
      rating: data.rating || 4.8,
      reviewCount: data.reviewCount || 100,
      badge: data.badge,
      coverColor: data.coverColor || "from-blue-600 to-indigo-800",
      coverImage: data.coverImage,
      description: data.description || "",
      topperNote: data.topperNote,
      freePdfAvailable: data.freePdfAvailable ?? true,
      pdfUrl: data.pdfUrl,
      buyUrl: data.buyUrl,
      sampleChapters: data.sampleChapters || [],
      practiceTopicSlug: data.practiceTopicSlug,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? list.length + 1,
      created_at: now,
      updated_at: now,
    };
    list.push(savedBook);
  }

  void saveSiteSettingAsync(SETTING_KEY, list);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {}

  return savedBook;
}

export async function deleteBookAsync(id: string): Promise<boolean> {
  const list = await getBooksAsync({ active_only: false });
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length !== list.length) {
    await saveSiteSettingAsync(SETTING_KEY, filtered);

    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(BOOKS_FILE, JSON.stringify(filtered, null, 2), "utf8");
    } catch {}

    return true;
  }
  return false;
}

export function deleteBook(id: string): boolean {
  const list = getBooks({ active_only: false });
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length !== list.length) {
    void saveSiteSettingAsync(SETTING_KEY, filtered);

    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(BOOKS_FILE, JSON.stringify(filtered, null, 2), "utf8");
    } catch {}

    return true;
  }
  return false;
}
