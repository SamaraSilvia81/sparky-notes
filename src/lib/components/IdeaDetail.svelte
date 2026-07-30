<script>
  import { createEventDispatcher } from "svelte";
  import SparkIcon from "./SparkIcon.svelte";
  import { ideas, STATUS_LABELS } from "../stores/ideas.js";

  export let idea;

  const dispatch = createEventDispatcher();

  const STATUSES = ["idea", "dev", "paused", "done"];

  function cycleStatus() {
    const idx = STATUSES.indexOf(idea.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    ideas.updateIdea(idea.id, { status: next });
  }

  function handleDelete() {
    if (confirm("Remover esta spark?")) {
      ideas.remove(idea.id);
      dispatch("close");
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="detail">
  <div class="detail-header">
    <button class="btn-back" on:click={() => dispatch("close")} type="button">
      ← voltar
    </button>
    <button class="btn-delete" on:click={handleDelete} type="button">
      remover
    </button>
  </div>

  <div class="detail-content">
    <div class="title-row">
      <SparkIcon size={28} />
      <h2>{idea.title}</h2>
    </div>

    <button class="status-toggle" on:click={cycleStatus} type="button">
      {STATUS_LABELS[idea.status]} → {STATUS_LABELS[STATUSES[(STATUSES.indexOf(idea.status) + 1) % STATUSES.length]]}
    </button>

    {#if idea.summary}
      <section class="section">
        <h4 class="section-label">resumo</h4>
        <p class="section-text">{idea.summary}</p>
      </section>
    {/if}

    <section class="section">
      <h4 class="section-label">ideia original</h4>
      <div class="raw-text">{idea.rawText}</div>
    </section>

    {#if idea.suggestedStack.length > 0}
      <section class="section">
        <h4 class="section-label">stack sugerida</h4>
        <div class="tag-list">
          {#each idea.suggestedStack as tech}
            <span class="tag tech">{tech}</span>
          {/each}
        </div>
      </section>
    {/if}

    {#if idea.tags.length > 0}
      <section class="section">
        <h4 class="section-label">tags</h4>
        <div class="tag-list">
          {#each idea.tags as tag}
            <span class="tag topic">{tag}</span>
          {/each}
        </div>
      </section>
    {/if}

    {#if idea.questions.length > 0}
      <section class="section">
        <h4 class="section-label">perguntas para refinar</h4>
        <ul class="questions">
          {#each idea.questions as question}
            <li>{question}</li>
          {/each}
        </ul>
      </section>
    {/if}

    <div class="meta">
      <span>criado em {formatDate(idea.createdAt)}</span>
      <span>atualizado em {formatDate(idea.updatedAt)}</span>
    </div>
  </div>
</div>

<style>
  .detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 0.5px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .btn-back,
  .btn-delete {
    all: unset;
    cursor: pointer;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }

  .btn-back:hover {
    color: var(--text-primary);
  }

  .btn-delete:hover {
    color: var(--pink-400);
  }

  .detail-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-row h2 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .status-toggle {
    all: unset;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.12);
    border: 0.5px solid rgba(139, 92, 246, 0.2);
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    align-self: flex-start;
    transition: background var(--transition-fast);
  }

  .status-toggle:hover {
    background: rgba(139, 92, 246, 0.2);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .raw-text {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 0.5px solid var(--glass-border);
    white-space: pre-wrap;
    line-height: 1.7;
  }

  .tag-list {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 11px;
    font-family: var(--font-mono);
    padding: 3px 10px;
    border-radius: 4px;
  }

  .tag.tech {
    color: var(--pink-200);
    background: rgba(246, 92, 244, 0.15);
  }

  .tag.topic {
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.15);
  }

  .questions {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .questions li {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    padding-left: 16px;
    position: relative;
  }

  .questions li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    width: 5px;
    height: 5px;
    border-radius: 1px;
    background: var(--purple-400);
    transform: rotate(45deg);
  }

  .meta {
    display: flex;
    gap: 16px;
    font-size: 10px;
    color: var(--text-ghost);
    padding-top: 12px;
    border-top: 0.5px solid var(--glass-border);
  }
</style>
