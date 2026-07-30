import { writable, derived } from "svelte/store";

function createIdeasStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    add: (idea) => {
      update((items) => [
        {
          id: crypto.randomUUID(),
          rawText: idea.rawText,
          title: idea.title || "Sem título",
          summary: idea.summary || "",
          category: idea.category || "geral",
          tags: idea.tags || [],
          suggestedStack: idea.suggestedStack || [],
          questions: idea.questions || [],
          status: "spark",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...items,
      ]);
    },
    updateIdea: (id, changes) => {
      update((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, ...changes, updatedAt: new Date().toISOString() }
            : item
        )
      );
    },
    remove: (id) => {
      update((items) => items.filter((item) => item.id !== id));
    },
    load: (data) => set(data),
  };
}

export const ideas = createIdeasStore();
export const searchQuery = writable("");
export const activeCategory = writable("all");
export const activeStatus = writable("all");
export const viewMode = writable("grid");
export const selectedIdeaId = writable(null);

export const CATEGORIES = {
  all: { label: "Tudo", icon: "⚡" },
  projeto: { label: "Projetos", icon: "🔧" },
  livro: { label: "Livros", icon: "📖" },
  design: { label: "Design", icon: "✦" },
  estudo: { label: "Estudo", icon: "📐" },
  geral: { label: "Geral", icon: "💡" },
};

export const STATUSES = {
  spark: { label: "spark", color: "var(--text-muted)" },
  refining: { label: "refinando", color: "var(--purple-400)" },
  ready: { label: "pronto", color: "var(--pink-400)" },
  building: { label: "construindo", color: "var(--purple-500)" },
  done: { label: "concluído", color: "var(--success)" },
  archived: { label: "arquivado", color: "var(--text-ghost)" },
};

export const filteredIdeas = derived(
  [ideas, searchQuery, activeCategory, activeStatus],
  ([$ideas, $search, $category, $status]) => {
    let result = $ideas;

    if ($category !== "all") {
      result = result.filter((i) => i.category === $category);
    }

    if ($status !== "all") {
      result = result.filter((i) => i.status === $status);
    }

    if ($search.trim()) {
      const q = $search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.rawText.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }
);

export const categoryCounts = derived(ideas, ($ideas) => {
  const counts = { all: $ideas.length };
  for (const key of Object.keys(CATEGORIES)) {
    if (key !== "all") {
      counts[key] = $ideas.filter((i) => i.category === key).length;
    }
  }
  return counts;
});