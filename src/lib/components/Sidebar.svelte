<script>
  import SparkIcon from "./SparkIcon.svelte";
  import Icon from "./Icon.svelte";
  import { activeCategory, categoryCounts, CATEGORIES } from "../stores/ideas.js";

  export let ollamaOnline = false;

  const categoryKeys = Object.keys(CATEGORIES);
</script>

<aside class="sidebar" data-tauri-drag-region>
  <div class="sidebar-header" data-tauri-drag-region>
    <div class="brand">
      <SparkIcon size={20} />
      <div class="brand-text">
        <span class="brand-name">Sparky</span>
        <span class="brand-accent">Notes</span>
      </div>
    </div>
  </div>

  <nav class="nav">
    <div class="nav-section">
      <span class="nav-label">sparks</span>
      {#each categoryKeys as key}
        <button
          class="nav-item"
          class:active={$activeCategory === key}
          on:click={() => ($activeCategory = key)}
          type="button"
        >
          <span class="nav-icon"><Icon name={CATEGORIES[key].icon} size={14} /></span>
          <span class="nav-text">{CATEGORIES[key].label}</span>
          {#if $categoryCounts[key] > 0}
            <span class="nav-count">{$categoryCounts[key]}</span>
          {/if}
        </button>
      {/each}
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="status-row">
      <span class="status-dot" class:online={ollamaOnline} />
      <span class="status-text">{ollamaOnline ? "ollama ativo" : "ollama offline"}</span>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: var(--sidebar-width);
    height: 100%;
    background: var(--glass-bg-sunken);
    backdrop-filter: var(--glass-blur-lg);
    -webkit-backdrop-filter: var(--glass-blur-lg);
    border-right: 0.5px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    user-select: none;
    position: relative;
  }

  .sidebar::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(139, 92, 246, 0.25) 30%,
      rgba(246, 92, 244, 0.18) 70%,
      transparent
    );
  }

  .sidebar-header {
    padding: 18px 16px 12px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-text {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .brand-name {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .brand-accent {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 500;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav {
    flex: 1;
    padding: 8px 8px;
    overflow-y: auto;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nav-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 12px 10px 6px;
    font-family: var(--font-display);
  }

  .nav-item {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .nav-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
  }

  .nav-item.active {
    color: var(--text-primary);
    background: rgba(139, 92, 246, 0.12);
    box-shadow: 0 0 0 0.5px rgba(139, 92, 246, 0.3) inset;
  }

  .nav-icon {
    width: 20px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: color var(--transition-fast);
  }

  .nav-item:hover .nav-icon,
  .nav-item.active .nav-icon {
    color: var(--purple-300);
  }

  .nav-text {
    flex: 1;
    font-family: var(--font-ui);
  }

  .nav-count {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    min-width: 16px;
    text-align: right;
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 0.5px solid var(--glass-border);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--pink-600);
    flex-shrink: 0;
  }

  .status-dot.online {
    background: var(--success);
    box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
  }

  .status-text {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
  }
</style>