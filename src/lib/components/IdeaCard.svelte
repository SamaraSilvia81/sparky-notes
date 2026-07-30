<script>
  import { createEventDispatcher } from "svelte";
  import { STATUS_LABELS } from "../stores/ideas.js";

  export let idea;

  const dispatch = createEventDispatcher();

  const STATUS_STYLES = {
    idea: { bg: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "var(--glass-border)" },
    dev: { bg: "rgba(139,92,246,0.12)", color: "var(--purple-200)", border: "rgba(139,92,246,0.3)" },
    paused: { bg: "rgba(246,92,244,0.12)", color: "var(--pink-200)", border: "rgba(246,92,244,0.3)" },
    done: { bg: "rgba(93,202,117,0.12)", color: "#5dca75", border: "rgba(93,202,117,0.3)" },
  };

  $: style = STATUS_STYLES[idea.status] || STATUS_STYLES.idea;
  $: topBorderColor =
    idea.status === "dev"
      ? "var(--purple-800)"
      : idea.status === "paused"
        ? "var(--pink-400)"
        : idea.status === "done"
          ? "#5dca75"
          : "var(--border-default)";

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
</script>

<button class="card" on:click={() => dispatch("select", idea)} type="button">
  <div class="top-bar" style="background: {topBorderColor}" />

  <div class="card-header">
    <h3 class="card-title">{idea.title}</h3>
    <span
      class="status-badge"
      style="background: {style.bg}; color: {style.color}; border-color: {style.border}"
    >
      {STATUS_LABELS[idea.status]}
    </span>
  </div>

  {#if idea.summary}
    <p class="card-summary">{idea.summary}</p>
  {/if}

  {#if idea.tags.length > 0 || idea.suggestedStack.length > 0}
    <div class="card-tags">
      {#each idea.tags.slice(0, 3) as tag}
        <span class="tag tag-topic">{tag}</span>
      {/each}
      {#each idea.suggestedStack.slice(0, 3) as tech}
        <span class="tag tag-tech">{tech}</span>
      {/each}
    </div>
  {/if}

  <div class="card-meta">
    <span>{formatDate(idea.createdAt)}</span>
    {#if idea.questions.length > 0}
      <span class="questions-count">{idea.questions.length} perguntas</span>
    {/if}
  </div>
</button>

<style>
  .card {
    all: unset;
    cursor: pointer;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 18px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color var(--transition-fast),
      transform var(--transition-fast),
      background var(--transition-fast);
  }

  .card:hover {
    border-color: var(--glass-border-hover);
    background: var(--glass-bg-hover);
    transform: translateY(-2px);
  }

  .card:focus-visible {
    outline: 2px solid var(--purple-800);
    outline-offset: 2px;
  }

  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .status-badge {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    border: 0.5px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .card-summary {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: var(--font-mono);
  }

  .tag-topic {
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.15);
  }

  .tag-tech {
    color: var(--pink-200);
    background: rgba(246, 92, 244, 0.15);
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: var(--text-ghost);
    margin-top: 2px;
  }

  .questions-count {
    color: var(--purple-400);
  }
</style>
