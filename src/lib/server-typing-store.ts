import fs from "fs";
import path from "path";
import { DEFAULT_TYPING_PASSAGES, TypingPassage } from "./typing-store";
import {
  getSiteSettingAsync,
  saveSiteSettingAsync,
  getSiteSettingCached,
  primeSiteSettingCache,
} from "./site-settings";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "typing_passages.json");
const SETTING_KEY = "typing_passages";

function getLocalFileFallback(): TypingPassage[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading local typing_passages.json:", error);
  }
  return DEFAULT_TYPING_PASSAGES;
}

export function getServerTypingPassages(): TypingPassage[] {
  const cached = getSiteSettingCached<TypingPassage[] | null>(SETTING_KEY, null);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  const fallback = getLocalFileFallback();
  primeSiteSettingCache(SETTING_KEY, fallback);
  return fallback;
}

export async function getServerTypingPassagesAsync(): Promise<TypingPassage[]> {
  const fallback = getLocalFileFallback();
  const dbData = await getSiteSettingAsync<TypingPassage[]>(SETTING_KEY, fallback);
  if (Array.isArray(dbData) && dbData.length > 0) {
    return dbData;
  }
  return fallback;
}

export async function saveServerTypingPassageAsync(
  passage: Omit<TypingPassage, "id"> & { id?: string }
): Promise<TypingPassage> {
  const current = await getServerTypingPassagesAsync();
  const id = passage.id || `passage-${Date.now()}`;
  const wordCount = passage.content.trim().split(/\s+/).filter(Boolean).length;
  const targetKeyDepressions = passage.targetKeyDepressions || wordCount * 5;

  const newPassage: TypingPassage = {
    ...passage,
    id,
    wordCount,
    targetKeyDepressions,
    createdAt: passage.createdAt || new Date().toISOString(),
    isDefault: passage.isDefault ?? false,
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  let updated: TypingPassage[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newPassage;
  } else {
    updated = [newPassage, ...current];
  }

  // 1. Persistent DB Save
  await saveSiteSettingAsync(SETTING_KEY, updated);

  // 2. Local file backup (non-fatal)
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {}

  return newPassage;
}

export function saveServerTypingPassage(passage: Omit<TypingPassage, "id"> & { id?: string }): TypingPassage {
  const current = getServerTypingPassages();
  const id = passage.id || `passage-${Date.now()}`;
  const wordCount = passage.content.trim().split(/\s+/).filter(Boolean).length;
  const targetKeyDepressions = passage.targetKeyDepressions || wordCount * 5;

  const newPassage: TypingPassage = {
    ...passage,
    id,
    wordCount,
    targetKeyDepressions,
    createdAt: passage.createdAt || new Date().toISOString(),
    isDefault: passage.isDefault ?? false,
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  let updated: TypingPassage[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newPassage;
  } else {
    updated = [newPassage, ...current];
  }

  void saveSiteSettingAsync(SETTING_KEY, updated);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {}

  return newPassage;
}

export async function deleteServerTypingPassageAsync(id: string): Promise<boolean> {
  const current = await getServerTypingPassagesAsync();
  const updated = current.filter((p) => p.id !== id);
  await saveSiteSettingAsync(SETTING_KEY, updated);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {}

  return true;
}

export function deleteServerTypingPassage(id: string): boolean {
  const current = getServerTypingPassages();
  const updated = current.filter((p) => p.id !== id);
  void saveSiteSettingAsync(SETTING_KEY, updated);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {}

  return true;
}

export async function resetServerTypingPassagesAsync(): Promise<TypingPassage[]> {
  await saveSiteSettingAsync(SETTING_KEY, DEFAULT_TYPING_PASSAGES);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TYPING_PASSAGES, null, 2), "utf-8");
  } catch {}

  return DEFAULT_TYPING_PASSAGES;
}

export function resetServerTypingPassages(): TypingPassage[] {
  void saveSiteSettingAsync(SETTING_KEY, DEFAULT_TYPING_PASSAGES);

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TYPING_PASSAGES, null, 2), "utf-8");
  } catch {}

  return DEFAULT_TYPING_PASSAGES;
}
