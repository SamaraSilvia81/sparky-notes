<script>
  import { searchQuery, statusFilter, viewMode } from "../stores/ideas.js";
</script>

<div class="toolbar">
  <div class="search-box">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <input type="text" placeholder="buscar sparks..." bind:value={$searchQuery} />
  </div>

  <div class="filters">
    <button class:active={$statusFilter === "all"} on:click={() => ($statusFilter = "all")} type="button">todas</button>
    <button class:active={$statusFilter === "idea"} on:click={() => ($statusFilter = "idea")} type="button">ideias</button>
    <button class:active={$statusFilter === "dev"} on:click={() => ($statusFilter = "dev")} type="button">em dev</button>
    <button class:active={$statusFilter === "paused"} on:click={() => ($statusFilter = "paused")} type="button">pausado</button>
  </div>

  <div class="view-toggle">
    <button class:active={$viewMode === "grid"} on:click={() => ($viewMode = "grid")} type="button" aria-label="grid">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </button>
    <button class:active={$viewMode === "list"} on:click={() => ($viewMode = "list")} type="button" aria-label="lista">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 4px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 7px 12px;
    flex: 1;
    max-width: 260px;
    color: var(--text-muted);
    box-shadow: var(--elevation-1);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .search-box:focus-within {
    border-color: rgba(139, 92, 246, 0.4);
  }

  .search-box input {
    all: unset;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-primary);
    flex: 1;
  }

  .search-box input::placeholder {
    color: var(--text-ghost);
  }

  .filters {
    display: flex;
    gap: 2px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 3px;
  }

  .filters button {
    all: unset;
    cursor: pointer;
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--text-muted);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .filters button:hover {
    color: var(--text-secondary);
  }

  .filters button.active {
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.15);
  }

  .view-toggle {
    display: flex;
    gap: 2px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 3px;
    margin-left: auto;
  }

  .view-toggle button {
    all: unset;
    cursor: pointer;
    color: var(--text-ghost);
    padding: 4px 6px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    transition: all var(--transition-fast);
  }

  .view-toggle button:hover {
    color: var(--text-secondary);
  }

  .view-toggle button.active {
    color: var(--purple-400);
  }
</style>
