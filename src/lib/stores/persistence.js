import { ideas } from "./ideas.js";

const STORAGE_KEY = "sparky-notes-ideas";

export function loadFromDisk() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      ideas.load(JSON.parse(raw));
    }
  } catch (e) {
    console.warn("sparky: failed to load ideas from storage", e);
  }
}

export function saveToDisk(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("sparky: failed to save ideas to storage", e);
  }
}

export function initPersistence() {
  loadFromDisk();
  ideas.subscribe((currentIdeas) => {
    saveToDisk(currentIdeas);
  });
}
