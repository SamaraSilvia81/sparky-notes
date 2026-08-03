<script>
  import { onMount } from "svelte";
  import "./styles/global.css";
  import Grain from "./lib/components/Grain.svelte";
  import SplashScreen from "./lib/components/SplashScreen.svelte";
  import AuthScreen from "./lib/components/AuthScreen.svelte";
  import HomeView from "./lib/components/HomeView.svelte";
  import LibraryView from "./lib/components/LibraryView.svelte";
  import ProfileView from "./lib/components/ProfileView.svelte";
  import { ideas } from "./lib/stores/ideas.js";
  import { initAuth, isLoggedIn, authLoading, signOut, currentUser } from "./lib/stores/auth.js";
  import { saveIdea, loadIdeas, updateIdeaInDb } from "./lib/stores/persistence.js";
  import { processIdea, refineIdea, checkOllamaStatus } from "./lib/services/ollama.js";
  import { supabase } from "./lib/services/supabase.js";

  let showSplash = true;
  let currentView = "home"; // home | library | profile
  let homeRef;
  let ollamaOnline = false;
  let ideasCount = 0;

  ideas.subscribe((val) => (ideasCount = val.length));

  function getUserContext() {
    const user = $currentUser;
    if (!user) return "";
    const meta = user.user_metadata || {};
    const parts = [];
    if (meta.full_name || meta.name) parts.push(`Nome: ${meta.full_name || meta.name}`);
    if (meta.bio) parts.push(`Bio: ${meta.bio}`);
    if (meta.area) parts.push(`Área: ${meta.area}`);
    return parts.join(". ");
  }

  onMount(() => {
    initAuth();
    checkOllamaStatus().then((ok) => (ollamaOnline = ok));
  });

  function handleSplashDone() {
    showSplash = false;
  }

  async function handleCapture(event) {
    const { text } = event.detail;
    let ideaData = { rawText: text };

    ollamaOnline = await checkOllamaStatus();

    if (ollamaOnline) {
      try {
        const processed = await processIdea(text, "llama3.1:8b", getUserContext());
        ideaData = {
          rawText: text,
          title: processed.title,
          summary: processed.summary,
          tags: processed.tags,
          suggestedStack: processed.suggestedStack,
          questions: processed.questions,
        };
      } catch (err) {
        console.warn("sparky: ollama failed", err);
      }
    }

    const saved = await saveIdea(ideaData);
    let sparkId = null;

    if (saved) {
      sparkId = saved.id;
      await loadIdeas();
    } else {
      sparkId = crypto.randomUUID();
      ideaData.id = sparkId;
      ideas.add(ideaData);
    }

    // registra eventos no histórico
    if ($currentUser && sparkId) {
      const userId = $currentUser.id;
      await supabase.from("idea_events").insert({
        user_id: userId,
        idea_id: sparkId,
        role: "user",
        kind: null,
        text: text,
        summary: null,
      });
      await supabase.from("idea_events").insert({
        user_id: userId,
        idea_id: sparkId,
        role: "sparky",
        kind: "new",
        text: ideaData.summary || "Ideia processada e salva.",
        summary: ideaData.summary || null,
      });
    }

    homeRef?.addResponse({
      id: sparkId,
      title: ideaData.title || "Spark salva",
      summary: ideaData.summary || (ollamaOnline ? "Ideia processada e salva." : "Ollama offline — salva sem processamento."),
      rawText: ideaData.rawText,
      tags: ideaData.tags || [],
      suggestedStack: ideaData.suggestedStack || [],
      questions: ideaData.questions || [],
    });
    homeRef?.reset();
  }

  async function handleRefine(event) {
    const { sparkId, sparkData, answer } = event.detail;

    ollamaOnline = await checkOllamaStatus();

    if (!ollamaOnline) {
      homeRef?.addRefinement({
        title: sparkData.title,
        summary: "Ollama offline — não foi possível refinar.",
        tags: sparkData.tags || [],
        suggestedStack: sparkData.suggestedStack || [],
        questions: sparkData.questions || [],
      });
      homeRef?.reset();
      return;
    }

    try {
      const refined = await refineIdea(sparkData, answer, "llama3.1:8b");

      if (refined) {
        const changes = {
          title: refined.title || sparkData.title,
          summary: refined.summary || sparkData.summary,
          tags: refined.tags || sparkData.tags,
          suggestedStack: refined.suggestedStack || sparkData.suggestedStack,
          questions: refined.questions || [],
        };

        ideas.updateIdea(sparkId, changes);
        await updateIdeaInDb(sparkId, changes);

        // registra resposta do usuário + refinamento no histórico
        if ($currentUser) {
          const userId = $currentUser.id;
          await supabase.from("idea_events").insert({
            user_id: userId,
            idea_id: sparkId,
            role: "user",
            kind: null,
            text: answer,
            summary: null,
          });
          await supabase.from("idea_events").insert({
            user_id: userId,
            idea_id: sparkId,
            role: "sparky",
            kind: "refined",
            text: changes.summary || "Spark atualizada.",
            summary: changes.summary || null,
          });
        }

        homeRef?.addRefinement({
          ...changes,
          rawText: sparkData.rawText,
        });
      } else {
        homeRef?.addRefinement({
          title: sparkData.title,
          summary: "Não consegui processar a refinação. Tente reformular.",
          tags: sparkData.tags || [],
          suggestedStack: sparkData.suggestedStack || [],
          questions: sparkData.questions || [],
        });
      }
    } catch (err) {
      console.warn("sparky: refine failed", err);
      homeRef?.addRefinement({
        title: sparkData.title,
        summary: "Erro ao refinar: " + err.message,
        tags: sparkData.tags || [],
        suggestedStack: sparkData.suggestedStack || [],
        questions: sparkData.questions || [],
      });
    }

    homeRef?.reset();
  }

  function navigate(view) {
    currentView = view;
  }
</script>

{#if showSplash}
  <SplashScreen onFinish={handleSplashDone} />
{/if}

<div class="ambient-field" aria-hidden="true" />
<Grain />

<div class="app" class:hidden={showSplash}>
  {#if $authLoading}
    <!-- auth check -->
  {:else if !$isLoggedIn}
    <AuthScreen />
  {:else if currentView === "profile"}
    <ProfileView on:close={() => navigate("home")} />
  {:else if currentView === "library"}
    <LibraryView
      {ollamaOnline}
      {ideasCount}
      wallpaper={$currentUser?.user_metadata?.library_wallpaper || ""}
      on:close={() => navigate("home")}
      on:openProfile={() => navigate("profile")}
    />
  {:else}
    <HomeView
      bind:this={homeRef}
      on:capture={handleCapture}
      on:refine={handleRefine}
      on:openLibrary={() => navigate("library")}
      on:openProfile={() => navigate("profile")}
    >
      <span slot="count">{ideasCount}</span>
    </HomeView>
  {/if}
</div>

<style>
  .app {
    height: 100vh;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  .app.hidden {
    visibility: hidden;
  }
</style>