<script>
  import { createEventDispatcher } from "svelte";
  import IdeaCard from "./IdeaCard.svelte";
  import IdeaRow from "./IdeaRow.svelte";
  import IdeaDetail from "./IdeaDetail.svelte";
  import Toolbar from "./Toolbar.svelte";
  import EmptyState from "./EmptyState.svelte";
  import Icon from "./Icon.svelte";
  import logoIcon from "../../assets/logo-icon.png";
  import {
    filteredIdeas,
    viewMode,
    activeCategory,
    categoryCounts,
    CATEGORIES,
  } from "../stores/ideas.js";

  const dispatch = createEventDispatcher();

  export let ollamaOnline = false;
  export let ideasCount = 0;
  export let wallpaper = "";

  let selectedIdea = null;
  const categoryKeys = Object.keys(CATEGORIES);

  function handleSelect(event) {
    selectedIdea = event.detail;
  }

  function handleCloseDetail() {
    selectedIdea = null;
  }
</script>

<div class="library">
  <!-- wallpaper layer -->
  {#if wallpaper}
    <div class="wallpaper" style="background-image: url({wallpaper})" aria-hidden="true" />
  {/if}
  <div class="wallpaper-overlay" aria-hidden="true" />
  <div class="lib-grid-bg" aria-hidden="true" />

  {#if selectedIdea}
    <div class="detail-wrap">
      <IdeaDetail idea={selectedIdea} on:close={handleCloseDetail} />
    </div>
  {:else}
    <div class="lib-layout">
      <!-- top bar -->
      <header class="topbar" data-tauri-drag-region>
        <div class="topbar-left">
          <button class="btn-back" on:click={() => dispatch("close")} type="button" aria-label="Voltar ao início">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <img src={logoIcon} alt="" class="topbar-logo" />
          <span class="topbar-brand">Biblioteca</span>
        </div>
        <div class="topbar-right">
          <div class="status-indicator">
            <span class="status-dot" class:online={ollamaOnline} />
            <span class="status-label">{ollamaOnline ? "ollama" : "offline"}</span>
          </div>
          <button class="btn-new" on:click={() => dispatch("close")} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            nova spark
          </button>
        </div>
      </header>

      <!-- category tabs -->
      <nav class="category-bar">
        {#each categoryKeys as key}
          <button
            class="cat-tab"
            class:active={$activeCategory === key}
            on:click={() => ($activeCategory = key)}
            type="button"
          >
            <span class="cat-icon"><Icon name={CATEGORIES[key].icon} size={13} /></span>
            <span class="cat-label">{CATEGORIES[key].label}</span>
            {#if $categoryCounts[key] > 0}
              <span class="cat-count">{$categoryCounts[key]}</span>
            {/if}
          </button>
        {/each}
      </nav>

      <!-- content -->
      <section class="panel-section">
        <Toolbar />

        <div class="ideas-container">
          {#if $filteredIdeas.length === 0}
            <EmptyState />
          {:else if $viewMode === "grid"}
            <div class="ideas-grid">
              {#each $filteredIdeas as idea, i (idea.id)}
                <div class="grid-item" style="animation-delay: {i * 40}ms">
                  <IdeaCard {idea} on:select={handleSelect} />
                </div>
              {/each}
            </div>
          {:else}
            <div class="ideas-list">
              {#each $filteredIdeas as idea (idea.id)}
                <IdeaRow {idea} on:select={handleSelect} />
              {/each}
            </div>
          {/if}
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .library {
    height: 100%;
    overflow: hidden;
    position: relative;
    animation: viewIn 350ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes viewIn {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* ── wallpaper ── */
  .wallpaper {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }

  .wallpaper-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(9, 9, 12, 0.75) 0%,
      rgba(9, 9, 12, 0.88) 40%,
      rgba(9, 9, 12, 0.95) 100%
    );
    z-index: 1;
  }

  .lib-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139, 92, 246, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139, 92, 246, 0.015) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black 10%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black 10%, transparent 70%);
    pointer-events: none;
    z-index: 2;
  }

  .detail-wrap,
  .lib-layout {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── topbar ── */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 0.5px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .btn-back {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    color: var(--text-tertiary);
    transition: all var(--transition-fast);
  }

  .btn-back:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .topbar-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .topbar-brand {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
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
    background: var(--pink-600);
  }

  .status-dot.online {
    background: var(--success);
    box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
  }

  .status-label {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .btn-new {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 500;
    color: white;
    background: var(--spark-gradient);
    padding: 7px 14px;
    border-radius: var(--radius-md);
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .btn-new:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  /* ── category tabs ── */
  .category-bar {
    display: flex;
    gap: 4px;
    padding: 10px 24px;
    border-bottom: 0.5px solid var(--border-subtle);
    overflow-x: auto;
    flex-shrink: 0;
  }

  .category-bar::-webkit-scrollbar {
    display: none;
  }

  .cat-tab {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--radius-md);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-tertiary);
    white-space: nowrap;
    transition: all var(--transition-fast);
    border: 0.5px solid transparent;
  }

  .cat-tab:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
  }

  .cat-tab.active {
    color: var(--text-primary);
    background: var(--glass-bg);
    border-color: var(--glass-border);
    box-shadow: var(--elevation-1);
  }

  .cat-tab.active .cat-icon {
    color: var(--purple-300);
  }

  .cat-icon {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .cat-label {
    font-weight: 500;
  }

  .cat-count {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.04);
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* ── content ── */
  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 24px 24px;
    flex: 1;
    min-height: 0;
  }

  .ideas-container {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .grid-item {
    animation: cardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ideas-list {
    border-top: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--glass-bg-sunken);
  }
</style>
