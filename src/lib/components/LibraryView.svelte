<script>
  import { createEventDispatcher } from "svelte";
  import Sidebar from "./Sidebar.svelte";
  import IdeaCard from "./IdeaCard.svelte";
  import IdeaRow from "./IdeaRow.svelte";
  import IdeaDetail from "./IdeaDetail.svelte";
  import Toolbar from "./Toolbar.svelte";
  import EmptyState from "./EmptyState.svelte";
  import Icon from "./Icon.svelte";
  import { filteredIdeas, viewMode, activeCategory, CATEGORIES } from "../stores/ideas.js";

  const dispatch = createEventDispatcher();

  export let ollamaOnline = false;
  export let ideasCount = 0;

  let selectedIdea = null;

  function handleSelect(event) {
    selectedIdea = event.detail;
  }

  function handleCloseDetail() {
    selectedIdea = null;
  }
</script>

<div class="library">
  {#if selectedIdea}
    <IdeaDetail idea={selectedIdea} on:close={handleCloseDetail} />
  {:else}
    <div class="shell">
      <Sidebar {ollamaOnline} />

      <div class="main">
        <header class="topbar" data-tauri-drag-region>
          <div class="topbar-left">
            <button class="btn-back" on:click={() => dispatch("close")} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <span class="crumb-icon"><Icon name={CATEGORIES[$activeCategory]?.icon ?? "bolt"} size={13} /></span>
            <h1 class="crumb-title">{CATEGORIES[$activeCategory]?.label ?? "Tudo"}</h1>
            <span class="counter">{ideasCount}</span>
          </div>
        </header>

        <section class="panel-section">
          <Toolbar />

          <div class="ideas-container">
            {#if $filteredIdeas.length === 0}
              <EmptyState />
            {:else if $viewMode === "grid"}
              <div class="ideas-grid">
                {#each $filteredIdeas as idea (idea.id)}
                  <IdeaCard {idea} on:select={handleSelect} />
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
    </div>
  {/if}
</div>

<style>
  .library {
    height: 100%;
    overflow: hidden;
    animation: viewIn 350ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes viewIn {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .shell {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 24px;
    border-bottom: 0.5px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .btn-back {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    color: var(--text-tertiary);
    transition: all var(--transition-fast);
    margin-right: 4px;
  }

  .btn-back:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .crumb-icon {
    display: flex;
    align-items: center;
    color: var(--text-tertiary);
    opacity: 0.9;
  }

  .crumb-title {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.1px;
  }

  .counter {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-ghost);
    background: rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-xs);
    padding: 1px 6px;
  }

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }

  .ideas-list {
    border-top: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--glass-bg-sunken);
  }
</style>
