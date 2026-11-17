import fs from "fs";
import path from "path";
import { BookItem } from "./books-types";
import { supabase } from "./supabase";

export * from "./books-types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const BOOKS_FILE = path.join(DATA_DIR, "books.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeBooksFile(books: BookItem[]) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write books.json:", err);
  }
}

export function getBooks(options?: {
  active_only?: boolean;
  search?: string;
  subject?: string;
}): BookItem[] {
  let list: BookItem[] = [];

  try {
    if (fs.existsSync(BOOKS_FILE)) {
      const raw = fs.readFileSync(BOOKS_FILE, "utf8");
      list = JSON.parse(raw);
    } else {
      list = [];
    }
  } catch (err) {
    console.error("Error reading books.json:", err);
    list = [];
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

export function getBookById(id: string): BookItem | null {
  const books = getBooks({ active_only: false });
  return books.find((b) => b.id === id) || null;
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

  writeBooksFile(list);

  // Background Async Sync to Supabase
  syncSingleBookToSupabase(savedBook).catch((err) =>
    console.warn("Background Supabase sync for book:", err?.message)
  );

  return savedBook;
}

export function deleteBook(id: string): boolean {
  const list = getBooks({ active_only: false });
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length !== list.length) {
    writeBooksFile(filtered);
    // Delete from Supabase in background
    supabase
      .from("blogs")
      .delete()
      .eq("slug", `book-${id}`)
      .then(() => {})
      .catch((e) => console.warn("Supabase book delete warning:", e?.message));
    return true;
  }
  return false;
}

// Sync to Supabase blogs table (category: 'Topper Book') for seamless database persistence
export async function syncSingleBookToSupabase(book: BookItem) {
  try {
    const slug = `book-${book.id}`;
    const payload = {
      title: book.title,
      slug,
      excerpt: book.description,
      content: JSON.stringify(book),
      category: "Topper Book",
      exam_tag: book.exams?.join(", ") || "SSC Exams",
      keywords: JSON.stringify({
        hindiTitle: book.hindiTitle,
        author: book.author,
        publisher: book.publisher,
        edition: book.edition,
        subject: book.subject,
        pages: book.pages,
        rating: book.rating,
        badge: book.badge,
        coverColor: book.coverColor,
        freePdfAvailable: book.freePdfAvailable,
      }),
      is_published: book.is_active !== false,
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
    console.warn("Failed to sync book with Supabase:", err?.message);
  }
}
