import { supabase } from "../services/supabase.js";
import { ideas } from "./ideas.js";
import { session } from "./auth.js";
import { get } from "svelte/store";

let userId = null;
let initialized = false;

session.subscribe((s) => {
  userId = s?.user?.id ?? null;
  if (userId && !initialized) {
    loadIdeas();
    initialized = true;
  }
  if (!userId) {
    initialized = false;
    ideas.load([]);
  }
});

async function loadIdeas() {
  if (!userId) return;

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("sparky: failed to load ideas", error);
    return;
  }

  const mapped = (data || []).map((row) => ({
    id: row.id,
    rawText: row.raw_text,
    title: row.title,
    summary: row.summary || "",
    category: row.category || "geral",
    tags: row.tags || [],
    suggestedStack: row.suggested_stack || [],
    questions: row.questions || [],
    status: row.status || "idea",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  ideas.load(mapped);
}

export async function saveIdea(idea) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      user_id: userId,
      raw_text: idea.rawText,
      title: idea.title,
      summary: idea.summary || "",
      category: idea.category || "geral",
      tags: idea.tags || [],
      suggested_stack: idea.suggestedStack || [],
      questions: idea.questions || [],
      status: idea.status || "idea",
    })
    .select()
    .single();

  if (error) {
    console.warn("sparky: failed to save idea", error);
    return null;
  }

  return data;
}

export async function updateIdeaInDb(id, changes) {
  if (!userId) return;

  const dbChanges = {};
  if (changes.title !== undefined) dbChanges.title = changes.title;
  if (changes.summary !== undefined) dbChanges.summary = changes.summary;
  if (changes.category !== undefined) dbChanges.category = changes.category;
  if (changes.tags !== undefined) dbChanges.tags = changes.tags;
  if (changes.suggestedStack !== undefined) dbChanges.suggested_stack = changes.suggestedStack;
  if (changes.questions !== undefined) dbChanges.questions = changes.questions;
  if (changes.status !== undefined) dbChanges.status = changes.status;
  dbChanges.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("ideas")
    .update(dbChanges)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.warn("sparky: failed to update idea", error);
}

export async function deleteIdeaFromDb(id) {
  if (!userId) return;

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.warn("sparky: failed to delete idea", error);
}

export async function exportIdeas(format = "json") {
  const currentIdeas = get(ideas);

  if (format === "json") {
    const blob = new Blob([JSON.stringify(currentIdeas, null, 2)], { type: "application/json" });
    downloadBlob(blob, "sparky-notes-export.json");
  } else if (format === "markdown") {
    const md = currentIdeas
      .map((i) => {
        let lines = [`# ${i.title}`, "", i.summary, ""];
        if (i.tags.length) lines.push(`**Tags:** ${i.tags.join(", ")}`);
        if (i.suggestedStack.length) lines.push(`**Stack:** ${i.suggestedStack.join(", ")}`);
        if (i.questions.length) {
          lines.push("", "## Perguntas");
          i.questions.forEach((q) => lines.push(`- ${q}`));
        }
        lines.push("", "---", "");
        return lines.join("\n");
      })
      .join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    downloadBlob(blob, "sparky-notes-export.md");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { loadIdeas };
