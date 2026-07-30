<script>
  import { onMount } from "svelte";
  import "./styles/global.css";
  import Grain from "./lib/components/Grain.svelte";
  import Icon from "./lib/components/Icon.svelte";
  import CaptureInput from "./lib/components/CaptureInput.svelte";
  import IdeaCard from "./lib/components/IdeaCard.svelte";
  import IdeaRow from "./lib/components/IdeaRow.svelte";
  import IdeaDetail from "./lib/components/IdeaDetail.svelte";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import EmptyState from "./lib/components/EmptyState.svelte";
  import { ideas, filteredIdeas, viewMode, activeCategory, CATEGORIES } from "./lib/stores/ideas.js";
  import { initPersistence } from "./lib/stores/persistence.js";
  import { processIdea, checkOllamaStatus } from "./lib/services/ollama.js";

  let captureRef;
  let selectedIdea = null;
  let ollamaOnline = false;
  let ideasCount = 0;

  ideas.subscribe((val) => (ideasCount = val.length));

  onMount(() => {
    initPersistence();
    checkOllamaStatus().then((ok) => (ollamaOnline = ok));
  });

  async function handleCapture(event) {
    const { text } = event.detail;

    if (ollamaOnline) {
      try {
        const processed = await processIdea(text);
        ideas.add({
          rawText: text,
          title: processed.title,
          summary: processed.summary,
          tags: processed.tags,
          suggestedStack: processed.suggestedStack,
          questions: processed.questions,
        });
      } catch (err) {
        console.warn("sparky: ollama failed, saving raw", err);
        ideas.add({ rawText: text });
      }
    } else {
      ideas.add({ rawText: text });
    }

    captureRef.reset();
  }

  function handleSelect(event) {
    selectedIdea = event.detail;
  }

  function handleCloseDetail() {
    selectedIdea = null;
  }
</script>

<div class="ambient-field" aria-hidden="true" />
<Grain />

<div class="app">
  {#if selectedIdea}
    <IdeaDetail idea={selectedIdea} on:close={handleCloseDetail} />
  {:else}
    <div class="shell">
      <Sidebar {ollamaOnline} />

      <div class="main">
        <header class="topbar" data-tauri-drag-region>
          <div class="topbar-left">
            <span class="crumb-icon"><Icon name={CATEGORIES[$activeCategory]?.icon ?? "bolt"} size={13} /></span>
            <h1 class="crumb-title">{CATEGORIES[$activeCategory]?.label ?? "Tudo"}</h1>
            <span class="counter">{ideasCount}</span>
          </div>
        </header>

        <section class="capture-section">
          <CaptureInput bind:this={captureRef} on:capture={handleCapture} />
        </section>

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
  .app {
    height: 100vh;
    position: relative;
    z-index: 1;
    overflow: hidden;
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

  .capture-section {
    padding: 18px 24px 14px;
    flex-shrink: 0;
  }

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0 24px 24px;
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
