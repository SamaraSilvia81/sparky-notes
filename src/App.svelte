<script>
  import { onMount } from "svelte";
  import "./styles/global.css";
  import Grain from "./lib/components/Grain.svelte";
  import HomeView from "./lib/components/HomeView.svelte";
  import LibraryView from "./lib/components/LibraryView.svelte";
  import { ideas } from "./lib/stores/ideas.js";
  import { initPersistence } from "./lib/stores/persistence.js";
  import { processIdea, checkOllamaStatus } from "./lib/services/ollama.js";

  let currentView = "home";
  let homeRef;
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
        const idea = {
          rawText: text,
          title: processed.title,
          summary: processed.summary,
          tags: processed.tags,
          suggestedStack: processed.suggestedStack,
          questions: processed.questions,
        };
        ideas.add(idea);
        homeRef?.addResponse(idea);
      } catch (err) {
        console.warn("sparky: ollama failed, saving raw", err);
        ideas.add({ rawText: text });
        homeRef?.addResponse({
          title: "Spark salva",
          summary: "Ollama offline — sua ideia foi salva sem processamento. Você pode reprocessar depois.",
          tags: [],
          suggestedStack: [],
          questions: [],
        });
      }
    } else {
      ideas.add({ rawText: text });
      homeRef?.addResponse({
        title: "Spark salva",
        summary: "Ollama offline — sua ideia foi salva sem processamento. Conecte o Ollama para processar automaticamente.",
        tags: [],
        suggestedStack: [],
        questions: [],
      });
    }

    homeRef?.reset();
  }
</script>

<div class="ambient-field" aria-hidden="true" />
<Grain />

<div class="app">
  {#if currentView === "home"}
    <HomeView
      bind:this={homeRef}
      on:capture={handleCapture}
      on:openLibrary={() => (currentView = "library")}
    >
      <span slot="count">{ideasCount}</span>
    </HomeView>
  {:else}
    <LibraryView
      {ollamaOnline}
      {ideasCount}
      on:close={() => (currentView = "home")}
    />
  {/if}
</div>

<style>
  .app {
    height: 100vh;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
</style>
