import { writable, derived } from "svelte/store";

function createIdeasStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    add: (idea) => {
      update((ideas) => [
        {
          id: crypto.randomUUID(),
          rawText: idea.rawText,
          title: idea.title || "Sem título",
          summary: idea.summary || "",
          tags: idea.tags || [],
          suggestedStack: idea.suggestedStack || [],
          questions: idea.questions || [],
          status: "idea",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...ideas,
      ]);
    },
    updateIdea: (id, changes) => {
      update((ideas) =>
        ideas.map((idea) =>
          idea.id === id
            ? { ...idea, ...changes, updatedAt: new Date().toISOString() }
            : idea
        )
      );
    },
    remove: (id) => {
      update((ideas) => ideas.filter((idea) => idea.id !== id));
    },
    startProject: (id) => {
      update((ideas) =>
        ideas.map((idea) =>
          idea.id === id
            ? { ...idea, status: "dev", updatedAt: new Date().toISOString() }
            : idea
        )
      );
    },
    load: (data) => set(data),
  };
}

export const ideas = createIdeasStore();
export const searchQuery = writable("");
export const statusFilter = writable("all");
export const viewMode = writable("grid");

export const filteredIdeas = derived(
  [ideas, searchQuery, statusFilter],
  ([$ideas, $search, $status]) => {
    let result = $ideas;

    if ($status !== "all") {
      result = result.filter((idea) => idea.status === $status);
    }

    if ($search.trim()) {
      const q = $search.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.summary.toLowerCase().includes(q) ||
          idea.rawText.toLowerCase().includes(q) ||
          idea.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }
);

export const STATUS_LABELS = {
  idea: "ideia",
  dev: "em dev",
  paused: "pausado",
  done: "concluído",
};
