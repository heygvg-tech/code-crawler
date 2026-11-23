import type { Progress } from "./types";
import { validateProgress } from "./validate";

// Progress and the API key live in SEPARATE entries,
// so exporting a Save Scroll can never leak your key.
const SAVE_KEY = "code-crawler:save";
const API_KEY = "code-crawler:api-key";

export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? validateProgress(JSON.parse(raw)) : null;
  } catch {
    return null; // corrupted or blocked storage: start fresh rather than crash
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked; the game still works this session */
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function getApiKey(): string {
  try {
    return localStorage.getItem(API_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem(API_KEY, key.trim());
    else localStorage.removeItem(API_KEY);
  } catch {
    /* ignore */
  }
}

// Save Scroll = a JSON file of your progress you can download and re-upload.
export function downloadSaveScroll(p: Progress): void {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `code-crawler-save-${p.crawler.name.replace(/\W+/g, "-").toLowerCase() || "crawler"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readSaveScroll(file: File): Promise<Progress> {
  const text = await file.text();
  return validateProgress(JSON.parse(text)); // throws if it's not a real save
}
