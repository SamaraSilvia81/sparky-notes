import { ideas } from "./ideas.js";

const STORAGE_KEY = "sparky-notes-ideas";

export function initPersistence() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) ideas.load(JSON.parse(raw));
  } catch (e) {
    console.warn("sparky: load failed", e);
  }

  ideas.subscribe((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("sparky: save failed", e);
    }
  });
}