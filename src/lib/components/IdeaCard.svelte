<script>
  import { createEventDispatcher } from "svelte";
  import { STATUS_LABELS } from "../stores/ideas.js";
  import Icon from "./Icon.svelte";

  export let idea;

  const dispatch = createEventDispatcher();

  const STATUS_STYLES = {
    idea: { bg: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "var(--glass-border)", dot: "var(--text-ghost)" },
    refining: { bg: "rgba(139,92,246,0.1)", color: "var(--purple-200)", border: "rgba(139,92,246,0.2)", dot: "var(--purple-400)" },
    ready: { bg: "rgba(246,92,244,0.1)", color: "var(--pink-200)", border: "rgba(246,92,244,0.2)", dot: "var(--pink-400)" },
    building: { bg: "rgba(139,92,246,0.12)", color: "var(--purple-200)", border: "rgba(139,92,246,0.25)", dot: "var(--purple-500)" },
    done: { bg: "rgba(52,211,153,0.1)", color: "var(--success)", border: "rgba(52,211,153,0.2)", dot: "var(--success)" },
    archived: { bg: "rgba(255,255,255,0.02)", color: "var(--text-ghost)", border: "var(--glass-border)", dot: "var(--text-ghost)" },
    // fallback for old statuses
    dev: { bg: "rgba(139,92,246,0.12)", color: "var(--purple-200)", border: "rgba(139,92,246,0.25)", dot: "var(--purple-500)" },
    paused: { bg: "rgba(246,92,244,0.1)", color: "var(--pink-200)", border: "rgba(246,92,244,0.2)", dot: "var(--pink-400)" },
  };

  const CATEGORY_ICONS = {
    projeto: "code",
    livro: "book",
    design: "pen-tool",
    estudo: "compass",
    geral: "lightbulb",
  };

  $: style = STATUS_STYLES[idea.status] || STATUS_STYLES.idea;
  $: statusLabel = STATUS_LABELS[idea.status] || idea.status;

  function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
</script>

<button class="card" on:click={() => dispatch("select", idea)} type="button">
  <div class="card-glow" style="background: radial-gradient(ellipse at top, {style.border}, transparent 70%)" />

  <div class="card-inner">
    <div class="card-top">
      <div class="card-category">
        <Icon name={CATEGORY_ICONS[idea.category] || "lightbulb"} size={12} />
      </div>
      <span class="card-time">{formatDate(idea.createdAt)}</span>
    </div>

    <h3 class="card-title">{idea.title}</h3>

    {#if idea.summary}
      <p class="card-summary">{idea.summary}</p>
    {/if}

    {#if idea.tags.length > 0 || idea.suggestedStack.length > 0}
      <div class="card-tags">
        {#each idea.tags.slice(0, 3) as tag}
          <span class="tag tag-topic">{tag}</span>
        {/each}
        {#each idea.suggestedStack.slice(0, 2) as tech}
          <span class="tag tag-tech">{tech}</span>
        {/each}
      </div>
    {/if}

    <div class="card-footer">
      <div class="status-indicator">
        <span class="status-dot" style="background: {style.dot}" />
        <span class="status-label" style="color: {style.color}">{statusLabel}</span>
      </div>
      {#if idea.questions.length > 0}
        <span class="questions-badge">{idea.questions.length} ✦</span>
      {/if}
    </div>
  </div>
</button>

<style>
  .card {
    all: unset;
    cursor: pointer;
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: var(--elevation-2);
  }

  .card:hover .card-glow {
    opacity: 1;
  }

  .card:focus-visible {
    outline: 2px solid var(--purple-500);
    outline-offset: 2px;
  }

  .card-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity var(--transition-base);
    pointer-events: none;
  }

  .card-inner {
    position: relative;
    background: rgba(10, 9, 16, 0.75);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 0.5px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    transition: border-color var(--transition-fast);
  }

  .card:hover .card-inner {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(12, 11, 20, 0.82);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-category {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.04);
    border: 0.5px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .card-time {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-ghost);
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.35;
    letter-spacing: -0.1px;
  }

  .card-summary {
    font-size: 12px;
    color: var(--text-tertiary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
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
    padding: 2px 8px;
    border-radius: 4px;
    font-family: var(--font-mono);
  }

  .tag-topic {
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.12);
  }

  .tag-tech {
    color: var(--pink-200);
    background: rgba(246, 92, 244, 0.1);
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 0.5px solid var(--border-subtle);
    margin-top: auto;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-label {
    font-size: 11px;
    font-family: var(--font-ui);
    font-weight: 500;
  }

  .questions-badge {
    font-size: 11px;
    color: var(--purple-300);
    font-family: var(--font-mono);
  }
</style>