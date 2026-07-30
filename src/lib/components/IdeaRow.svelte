<script>
  import { createEventDispatcher } from "svelte";
  import { STATUS_LABELS } from "../stores/ideas.js";

  export let idea;
  const dispatch = createEventDispatcher();

  const STATUS_DOT = {
    idea: "var(--text-ghost)",
    dev: "var(--purple-800)",
    paused: "var(--pink-400)",
    done: "#5dca75",
  };

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
</script>

<button class="row" on:click={() => dispatch("select", idea)} type="button">
  <span class="dot" style="background: {STATUS_DOT[idea.status]}" />
  <span class="row-title">{idea.title}</span>
  <span class="row-summary">{idea.summary}</span>
  <div class="row-tags">
    {#each idea.tags.slice(0, 2) as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
  <span class="row-status">{STATUS_LABELS[idea.status]}</span>
  <span class="row-date">{formatDate(idea.createdAt)}</span>
</button>

<style>
  .row {
    all: unset;
    cursor: pointer;
    display: grid;
    grid-template-columns: 8px 1fr 1.5fr auto 70px 60px;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 0.5px solid var(--glass-border);
    transition: background var(--transition-fast);
  }

  .row:hover {
    background: var(--glass-bg);
  }

  .row:focus-visible {
    outline: 2px solid var(--purple-800);
    outline-offset: -2px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .row-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-summary {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-tags {
    display: flex;
    gap: 4px;
  }

  .tag {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.15);
    padding: 1px 6px;
    border-radius: 3px;
  }

  .row-status {
    font-size: 10px;
    color: var(--text-muted);
    text-align: right;
  }

  .row-date {
    font-size: 10px;
    color: var(--text-ghost);
    font-family: var(--font-mono);
    text-align: right;
  }
</style>
