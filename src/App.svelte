<script>
  import { onMount } from "svelte";
  import "./styles/global.css";
  import Grain from "./lib/components/Grain.svelte";
  import SparkIcon from "./lib/components/SparkIcon.svelte";
  import CaptureInput from "./lib/components/CaptureInput.svelte";
  import IdeaCard from "./lib/components/IdeaCard.svelte";
  import IdeaRow from "./lib/components/IdeaRow.svelte";
  import IdeaDetail from "./lib/components/IdeaDetail.svelte";
  import Toolbar from "./lib/components/Toolbar.svelte";
  import EmptyState from "./lib/components/EmptyState.svelte";
  import { ideas, filteredIdeas, viewMode } from "./lib/stores/ideas.js";
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

<Grain />

<div class="app" data-tauri-drag-region>
  {#if selectedIdea}
    <IdeaDetail idea={selectedIdea} on:close={handleCloseDetail} />
  {:else}
    <div class="layout">
      <header class="header" data-tauri-drag-region>
        <div class="header-left">
          <SparkIcon size={22} />
          <div class="brand">
            <span class="brand-sparky">Sparky</span>
            <span class="brand-notes">Notes</span>
          </div>
          <span class="counter">{ideasCount} sparks</span>
        </div>
        <div class="header-right">
          <span class="ollama-status" class:online={ollamaOnline}>
            {ollamaOnline ? "ollama ativo" : "ollama offline"}
          </span>
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
  {/if}
</div>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    border-bottom: 0.5px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .brand-sparky {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .brand-notes {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 500;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .counter {
    font-size: 11px;
    color: var(--text-ghost);
    font-family: var(--font-mono);
    margin-left: 4px;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .ollama-status {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-ghost);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ollama-status::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--pink-600);
  }

  .ollama-status.online::before {
    background: #5dca75;
    box-shadow: 0 0 6px rgba(93, 202, 117, 0.4);
  }

  .capture-section {
    padding: 20px 24px 16px;
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
  }
</style>
