<script>
  import { createEventDispatcher } from "svelte";
  import {
    currentUser,
    signOut,
    updateProfile,
    uploadAvatar,
    uploadLibraryWallpaper,
    removeLibraryWallpaper,
    authError,
  } from "../stores/auth.js";
  import { ideas } from "../stores/ideas.js";
  import { exportIdeas } from "../stores/persistence.js";
  import { supabase } from "../services/supabase.js";
  import logoIcon from "../../assets/logo-icon.png";

  const dispatch = createEventDispatcher();

  let ideasCount = 0;
  let deleting = false;
  let showDeleteConfirm = false;

  let avatarInput;
  let wallpaperInput;
  let uploadingAvatar = false;
  let uploadingWallpaper = false;

  let editingName = false;
  let nameDraft = "";
  let savingName = false;

  ideas.subscribe((val) => (ideasCount = val.length));

  $: userName = $currentUser?.user_metadata?.full_name || $currentUser?.user_metadata?.name || "Usuário";
  $: userEmail = $currentUser?.email || "";
  $: userAvatar = $currentUser?.user_metadata?.avatar_url || "";
  $: libraryWallpaper = $currentUser?.user_metadata?.library_wallpaper || "";
  $: memberSince = $currentUser?.created_at
    ? new Date($currentUser.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "";

  function focusOnMount(node) {
    node.focus();
  }

  function startEditName() {
    nameDraft = userName === "Usuário" ? "" : userName;
    editingName = true;
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === userName) {
      editingName = false;
      return;
    }
    savingName = true;
    await updateProfile({ full_name: trimmed });
    savingName = false;
    editingName = false;
  }

  function handleNameKeydown(e) {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") editingName = false;
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !$currentUser) return;
    uploadingAvatar = true;
    await uploadAvatar(file, $currentUser.id);
    uploadingAvatar = false;
    e.target.value = "";
  }

  async function handleWallpaperChange(e) {
    const file = e.target.files?.[0];
    if (!file || !$currentUser) return;
    uploadingWallpaper = true;
    await uploadLibraryWallpaper(file, $currentUser.id);
    uploadingWallpaper = false;
    e.target.value = "";
  }

  async function handleRemoveWallpaper() {
    await removeLibraryWallpaper();
  }

  function handleExportJSON() {
    exportIdeas("json");
  }

  function handleExportMD() {
    exportIdeas("markdown");
  }

  async function handleLogout() {
    await signOut();
    dispatch("close");
  }

  async function handleDeleteAccount() {
    if (!showDeleteConfirm) {
      showDeleteConfirm = true;
      return;
    }
    deleting = true;

    // delete all user ideas
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("user_id", $currentUser.id);

    if (error) console.warn("sparky: failed to delete ideas", error);

    await signOut();
    deleting = false;
    dispatch("close");
  }
</script>

<div class="profile-screen">
  <div class="profile-bg" aria-hidden="true" />

  <div class="profile-layout">
    <header class="profile-topbar">
      <button class="btn-back" on:click={() => dispatch("close")} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        voltar
      </button>
    </header>

    <div class="profile-content">
      <!-- avatar + info -->
      <div class="profile-card">
        <div class="avatar-section">
          <button
            class="avatar-btn"
            type="button"
            on:click={() => avatarInput.click()}
            disabled={uploadingAvatar}
            aria-label="Trocar foto de perfil"
          >
            {#if userAvatar}
              <img src={userAvatar} alt="" class="avatar" referrerpolicy="no-referrer" />
            {:else}
              <div class="avatar avatar-fallback">
                <span>{userName.charAt(0).toUpperCase()}</span>
              </div>
            {/if}
            <div class="avatar-overlay" class:busy={uploadingAvatar}>
              {#if uploadingAvatar}
                <span class="avatar-spinner" />
              {:else}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              {/if}
            </div>
          </button>
          <input
            bind:this={avatarInput}
            type="file"
            accept="image/*"
            class="hidden-input"
            on:change={handleAvatarChange}
          />

          <div class="user-info">
            {#if editingName}
              <input
                class="name-input"
                bind:value={nameDraft}
                on:keydown={handleNameKeydown}
                on:blur={saveName}
                disabled={savingName}
                placeholder="seu nome"
                use:focusOnMount
              />
            {:else}
              <button class="user-name-btn" type="button" on:click={startEditName}>
                <h2 class="user-name">{userName}</h2>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            {/if}
            <p class="user-email">{userEmail}</p>
            <p class="user-since">membro desde {memberSince}</p>
          </div>
        </div>

        {#if $authError}
          <p class="inline-error">{$authError}</p>
        {/if}

        <div class="stats-row">
          <div class="stat">
            <span class="stat-value">{ideasCount}</span>
            <span class="stat-label">sparks</span>
          </div>
        </div>
      </div>

      <!-- export -->
      <div class="section">
        <h3 class="section-title">exportar</h3>
        <p class="section-desc">baixe suas ideias como arquivo</p>
        <div class="action-row">
          <button class="btn-action" on:click={handleExportJSON} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            exportar JSON
          </button>
          <button class="btn-action" on:click={handleExportMD} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            exportar Markdown
          </button>
        </div>
      </div>

      <!-- library wallpaper -->
      <div class="section">
        <h3 class="section-title">biblioteca</h3>
        <p class="section-desc">imagem de fundo do painel de sparks</p>

        {#if libraryWallpaper}
          <div class="wallpaper-preview">
            <img src={libraryWallpaper} alt="" />
            <div class="wallpaper-preview-actions">
              <button class="btn-action" on:click={() => wallpaperInput.click()} disabled={uploadingWallpaper} type="button">
                {uploadingWallpaper ? "enviando..." : "trocar"}
              </button>
              <button class="btn-action" on:click={handleRemoveWallpaper} type="button">remover</button>
            </div>
          </div>
        {:else}
          <button class="btn-action" on:click={() => wallpaperInput.click()} disabled={uploadingWallpaper} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {uploadingWallpaper ? "enviando..." : "adicionar wallpaper"}
          </button>
        {/if}
        <input
          bind:this={wallpaperInput}
          type="file"
          accept="image/*"
          class="hidden-input"
          on:change={handleWallpaperChange}
        />
      </div>

      <!-- session -->
      <div class="section">
        <h3 class="section-title">sessão</h3>
        <button class="btn-logout" on:click={handleLogout} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2 2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          sair da conta
        </button>
      </div>

      <!-- danger zone -->
      <div class="section danger">
        <h3 class="section-title">zona de perigo</h3>
        <p class="section-desc">essa ação apaga todas as suas sparks e dados. não pode ser desfeita.</p>
        {#if showDeleteConfirm}
          <div class="delete-confirm">
            <p class="confirm-text">tem certeza? todas as suas ideias serão apagadas permanentemente.</p>
            <div class="action-row">
              <button class="btn-cancel" on:click={() => (showDeleteConfirm = false)} type="button">cancelar</button>
              <button class="btn-delete" on:click={handleDeleteAccount} disabled={deleting} type="button">
                {deleting ? "apagando..." : "sim, apagar tudo"}
              </button>
            </div>
          </div>
        {:else}
          <button class="btn-danger" on:click={handleDeleteAccount} type="button">
            apagar conta e dados
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .profile-screen {
    height: 100%;
    position: relative;
    overflow: hidden;
    animation: viewIn 350ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes viewIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .profile-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 50% 40% at 50% 20%, black 10%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse 50% 40% at 50% 20%, black 10%, transparent 70%);
    pointer-events: none;
  }

  .profile-layout {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .profile-topbar {
    padding: 14px 24px;
    border-bottom: 0.5px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    flex-shrink: 0;
  }

  .btn-back {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

  .btn-back:hover {
    color: var(--text-primary);
  }

  .profile-content {
    max-width: 520px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px 48px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── profile card ── */
  .profile-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-xl);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hidden-input {
    display: none;
  }

  .avatar-btn {
    all: unset;
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    flex-shrink: 0;
    cursor: pointer;
  }

  .avatar-btn:disabled {
    cursor: default;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-default);
    flex-shrink: 0;
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(9, 9, 12, 0.55);
    color: var(--text-primary);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .avatar-btn:hover .avatar-overlay,
  .avatar-overlay.busy {
    opacity: 1;
  }

  .avatar-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: white;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .user-name-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--text-muted);
  }

  .user-name-btn:hover {
    color: var(--purple-300);
  }

  .user-name-btn svg {
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .user-name-btn:hover svg {
    opacity: 1;
  }

  .name-input {
    all: unset;
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: 1px solid var(--purple-500);
    padding-bottom: 2px;
  }

  .inline-error {
    font-size: 11px;
    color: var(--pink-400);
  }

  .wallpaper-preview {
    position: relative;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 0.5px solid var(--glass-border);
  }

  .wallpaper-preview img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    display: block;
  }

  .wallpaper-preview-actions {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 10px;
    background: linear-gradient(0deg, rgba(9, 9, 12, 0.75), transparent 60%);
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--spark-gradient);
    border: none;
  }

  .avatar-fallback span {
    color: white;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .user-email {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .user-since {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .stats-row {
    display: flex;
    gap: 24px;
    padding-top: 16px;
    border-top: 0.5px solid var(--border-subtle);
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* ── sections ── */
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .section-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .action-row {
    display: flex;
    gap: 8px;
  }

  .btn-action {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    border: 0.5px solid var(--glass-border);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-action:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-hover);
    color: var(--text-primary);
  }

  .btn-logout {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    border: 0.5px solid var(--glass-border);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    align-self: flex-start;
  }

  .btn-logout:hover {
    color: var(--pink-400);
    border-color: rgba(246, 92, 244, 0.2);
    background: rgba(246, 92, 244, 0.06);
  }

  /* ── danger zone ── */
  .section.danger {
    padding-top: 20px;
    border-top: 0.5px solid var(--border-subtle);
  }

  .section.danger .section-title {
    color: var(--pink-400);
  }

  .btn-danger {
    all: unset;
    padding: 9px 16px;
    border-radius: var(--radius-md);
    border: 0.5px solid rgba(246, 92, 244, 0.2);
    background: rgba(246, 92, 244, 0.06);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--pink-400);
    cursor: pointer;
    align-self: flex-start;
    transition: all var(--transition-fast);
  }

  .btn-danger:hover {
    background: rgba(246, 92, 244, 0.12);
    border-color: rgba(246, 92, 244, 0.3);
  }

  .delete-confirm {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: rgba(246, 92, 244, 0.04);
    border: 0.5px solid rgba(246, 92, 244, 0.15);
    border-radius: var(--radius-md);
  }

  .confirm-text {
    font-size: 12px;
    color: var(--pink-200);
    line-height: 1.5;
  }

  .btn-cancel {
    all: unset;
    padding: 8px 14px;
    border-radius: var(--radius-md);
    border: 0.5px solid var(--glass-border);
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .btn-delete {
    all: unset;
    padding: 8px 14px;
    border-radius: var(--radius-md);
    background: var(--pink-600);
    font-size: 12px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }

  .btn-delete:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
