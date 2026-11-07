import fs from "fs";
import path from "path";
import { DEFAULT_TYPING_PASSAGES, TypingPassage } from "./typing-store";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "typing_passages.json");

export function getServerTypingPassages(): TypingPassage[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Initialize file if not found
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TYPING_PASSAGES, null, 2), "utf-8");
    return DEFAULT_TYPING_PASSAGES;
  } catch (error) {
    console.error("Error reading typing_passages.json:", error);
    return DEFAULT_TYPING_PASSAGES;
  }
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

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing typing_passages.json:", error);
  }

  return newPassage;
}

export function deleteServerTypingPassage(id: string): boolean {
  const current = getServerTypingPassages();
  const updated = current.filter((p) => p.id !== id);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error deleting passage from typing_passages.json:", error);
    return false;
  }
}

export function resetServerTypingPassages(): TypingPassage[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TYPING_PASSAGES, null, 2), "utf-8");
  } catch (error) {
    console.error("Error resetting typing_passages.json:", error);
  }
  return DEFAULT_TYPING_PASSAGES;
}
