<script>
  import { createEventDispatcher } from 'svelte'
  import { historyGroups, historyLoading, loadHistory } from '../stores/historyStore.js'

  export let open = false
  export let userInitial = 'S'
  export let userAvatar = ''

  const dispatch = createEventDispatcher()

  $: if (open) loadHistory()

  function close() {
    open = false
  }

  function handleKey(e) {
    if (e.key === 'Escape') close()
  }

  function goToIdea(ideaId) {
    dispatch('navigate', { ideaId })
    close()
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if open}
  <div class="scrim" role="presentation" on:click={close}></div>

  <aside class="drawer" aria-label="Histórico">
    <div class="drawer-header">
      <span class="drawer-title">histórico</span>
      <button class="drawer-close" on:click={close} aria-label="Fechar histórico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="drawer-body">
      {#if $historyLoading}
        <div class="empty">carregando...</div>

      {:else if $historyGroups.length === 0}
        <div class="empty">nenhuma atividade ainda</div>

      {:else}
        {#each $historyGroups as group}
          <div class="day-label">{group.label}</div>

          {#each group.events as ev}
            <button class="h-item" on:click={() => goToIdea(ev.idea_id)}>
              <div class="h-avatar" class:spark={ev.role === 'sparky'} class:user={ev.role === 'user' && !userAvatar}>
                {#if ev.role === 'sparky'}
                  <span class="spark-icon">✦</span>
                {:else if userAvatar}
                  <img src={userAvatar} alt="" class="avatar-img" referrerpolicy="no-referrer" />
                {:else}
                  {userInitial}
                {/if}
              </div>

              <div class="h-body">
                <div class="h-idea">{ev.idea_title}</div>
                <div class="h-text">{ev.summary ?? ev.text}</div>
                {#if ev.kind === 'new'}
                  <span class="h-badge badge-new">✦ spark pronta</span>
                {:else if ev.kind === 'refined'}
                  <span class="h-badge badge-refined">✦ spark atualizada</span>
                {/if}
              </div>

              <span class="h-time">{formatTime(ev.created_at)}</span>
            </button>
          {/each}
        {/each}
      {/if}
    </div>
  </aside>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 35;
    background: rgba(0, 0, 0, 0.15);
  }

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    z-index: 40;
    background: rgba(12, 11, 18, 0.94);
    backdrop-filter: blur(24px);
    border-left: 0.5px solid rgba(255, 255, 255, 0.08);
    box-shadow: -16px 0 40px -12px rgba(0, 0, 0, 0.55);
    display: flex;
    flex-direction: column;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .drawer-title {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .drawer-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-tertiary);
    width: 20px;
    height: 20px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drawer-close svg {
    width: 16px;
    height: 16px;
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 16px;
  }

  .drawer-body::-webkit-scrollbar { width: 3px; }
  .drawer-body::-webkit-scrollbar-track { background: transparent; }
  .drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .day-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-ghost);
    padding: 12px 8px 6px;
  }

  .h-item {
    display: flex;
    gap: 10px;
    padding: 9px 8px;
    border-radius: var(--radius-md, 8px);
    cursor: pointer;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    color: inherit;
  }

  .h-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .h-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    margin-top: 1px;
  }

  .h-avatar.spark {
    background: var(--spark-gradient);
  }

  .h-avatar.user {
    background: rgba(139, 92, 246, 0.18);
    color: var(--purple-300);
    font-weight: 600;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .spark-icon {
    color: #fff;
    font-size: 10px;
    line-height: 1;
  }

  .h-body {
    flex: 1;
    min-width: 0;
  }

  .h-idea {
    font-size: 10px;
    color: var(--purple-300);
    font-family: var(--font-mono);
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .h-text {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .h-badge {
    font-size: 9px;
    font-family: var(--font-mono);
    margin-top: 3px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .badge-new    { color: var(--success); }
  .badge-refined { color: var(--purple-300); }

  .h-time {
    font-size: 9px;
    color: var(--text-ghost);
    flex-shrink: 0;
    margin-top: 1px;
    font-family: var(--font-mono);
  }

  .empty {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
    padding: 24px 8px;
    text-align: center;
  }
</style>