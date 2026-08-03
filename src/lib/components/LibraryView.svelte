<script>
  import { createEventDispatcher } from "svelte";
  import IdeaCard from "./IdeaCard.svelte";
  import IdeaRow from "./IdeaRow.svelte";
  import IdeaDetail from "./IdeaDetail.svelte";
  import Toolbar from "./Toolbar.svelte";
  import EmptyState from "./EmptyState.svelte";
  import Icon from "./Icon.svelte";
  import { currentUser } from "../stores/auth.js";
  import loginWp from "../../assets/login-wallpaper.jpg";
  import {
    ideas,
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

  $: userAvatar = $currentUser?.user_metadata?.avatar_url || "";
  $: userName = $currentUser?.user_metadata?.full_name || $currentUser?.user_metadata?.name || "";
  $: userInitial = userName ? userName.charAt(0).toUpperCase() : "";
  $: effectiveWallpaper = wallpaper || loginWp;
  $: devCount = $ideas.filter((i) => i.status === "dev").length;
  $: ideaStatusCount = $ideas.filter((i) => i.status === "idea").length;

  function handleSelect(event) {
    selectedIdea = event.detail;
  }

  function handleCloseDetail() {
    selectedIdea = null;
  }
</script>

<div class="library">
  <!-- wallpaper layer (hidden in detail view, so it looks like Home there) -->
  {#if !selectedIdea}
    {#if effectiveWallpaper}
      <div class="wallpaper" style="background-image: url({effectiveWallpaper})" aria-hidden="true" />
    {/if}
    <div class="wallpaper-overlay" aria-hidden="true" />
    <div class="lib-grid-bg" aria-hidden="true" />
  {/if}

  {#if selectedIdea}
    <div class="detail-wrap">
      <IdeaDetail idea={selectedIdea} on:close={handleCloseDetail} />
    </div>
  {:else}
    <div class="lib-layout">
      <!-- mini top bar -->
      <div class="mini-topbar" data-tauri-drag-region>
        <button class="btn-back" on:click={() => dispatch("close")} type="button" aria-label="Voltar ao início">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          voltar
        </button>

        <div class="topbar-right-group">
          <span class="ollama-tag" class:online={ollamaOnline}>
            <span class="o-dot" />
            {ollamaOnline ? "ollama.local" : "offline"}
          </span>
          <button class="profile-chip" on:click={() => dispatch("openProfile")} type="button">
            {#if userAvatar}
              <img src={userAvatar} alt="" class="profile-chip-avatar" referrerpolicy="no-referrer" />
            {:else}
              <span class="profile-chip-fallback">{userInitial || "?"}</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- hero -->
      <header class="lib-hero">
        <p class="hero-eyebrow">
          <span class="eyebrow-rule" aria-hidden="true" />
          painel de sparks
        </p>
        <h1 class="hero-title">
          <span>SUAS</span>
          <span class="hero-accent">SPARKS</span>
        </h1>
        <p class="hero-terminal">
          <span class="prompt">&gt;_</span>
          {$filteredIdeas.length} resultado{$filteredIdeas.length === 1 ? "" : "s"}
          <span class="dot">·</span>
          {ideasCount} no total
          <span class="dot">·</span>
          {ollamaOnline ? "ollama.local" : "offline"}
        </p>

        <div class="hero-row">
          <nav class="category-bar">
            {#each categoryKeys as key}
              <button
                class="cat-tab"
                class:active={$activeCategory === key}
                on:click={() => ($activeCategory = key)}
                type="button"
              >
                <span class="cat-slash">//</span>
                <span class="cat-icon"><Icon name={CATEGORIES[key].icon} size={13} /></span>
                <span class="cat-label">{CATEGORIES[key].label}</span>
                {#if $categoryCounts[key] > 0}
                  <span class="cat-count">{$categoryCounts[key]}</span>
                {/if}
              </button>
            {/each}
          </nav>

          <button class="btn-new" on:click={() => dispatch("close")} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            nova spark
          </button>
        </div>

        <div class="hero-stats">
          <span class="hero-stat"><i class="dot-total" />total <b>{ideasCount}</b></span>
          <span class="hero-stat"><i class="dot-dev" />em dev <b>{devCount}</b></span>
          <span class="hero-stat"><i class="dot-idea" />ideias <b>{ideaStatusCount}</b></span>
        </div>
      </header>

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

  /* ── mini topbar ── */
  .mini-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px 0;
    flex-shrink: 0;
  }

  .btn-back {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.3px;
    color: var(--text-tertiary);
    padding: 6px 4px;
    transition: color var(--transition-fast);
  }

  .btn-back:hover {
    color: var(--text-primary);
  }

  .profile-chip {
    all: unset;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg);
    transition: border-color var(--transition-fast);
  }

  .profile-chip:hover {
    border-color: var(--purple-500);
  }

  .topbar-right-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ollama-tag {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    background: rgba(15, 14, 22, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
  }

  .o-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ef4444;
  }

  .ollama-tag.online .o-dot {
    background: var(--success);
    box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);
  }

  .ollama-tag.online {
    color: var(--text-secondary);
  }

  .profile-chip-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-chip-fallback {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  /* ── editorial hero ── */
  .lib-hero {
    position: relative;
    padding: 20px 24px 18px;
    border-bottom: 0.5px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .hero-corner-tl {
    position: absolute;
    top: 0;
    left: 24px;
    width: 18px;
    height: 18px;
    border-left: 1.5px solid var(--atelier-crimson);
    border-top: 1.5px solid var(--atelier-crimson);
    opacity: 0.7;
  }

  .hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .eyebrow-rule {
    width: 20px;
    height: 1px;
    background: var(--atelier-crimson);
  }

  .hero-title {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 40px;
    line-height: 0.98;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .hero-accent {
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-terminal {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .prompt {
    color: var(--atelier-crimson-bright);
    font-weight: 600;
  }

  .hero-terminal .dot {
    color: var(--text-ghost);
  }

  .hero-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
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
    flex-shrink: 0;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .btn-new:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .hero-stats {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .hero-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .hero-stat b {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .hero-stat i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    display: inline-block;
  }

  .dot-total { background: var(--text-muted); }
  .dot-dev { background: var(--purple-400); }
  .dot-idea { background: var(--atelier-crimson-bright); }

  /* ── category tabs ── */
  .category-bar {
    display: flex;
    gap: 4px;
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
    gap: 5px;
    padding: 6px 12px;
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: 11px;
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

  .cat-tab.active .cat-icon,
  .cat-tab.active .cat-slash {
    color: var(--atelier-crimson-bright);
  }

  .cat-slash {
    color: var(--text-ghost);
    font-weight: 600;
  }

  .cat-icon {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .cat-label {
    font-family: var(--font-ui);
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