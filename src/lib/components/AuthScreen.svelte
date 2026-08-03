<script>
  import logoIcon from "../../assets/logo-icon.png";
  import loginWp from "../../assets/login-wallpaper.jpg";
  import { signInWithEmail, signUpWithEmail, authError } from "../stores/auth.js";
  import { supabase } from "../services/supabase.js";

  let email = "";
  let password = "";
  let mode = "login";
  let loading = false;

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    loading = true;

    if (mode === "signup") {
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }

    loading = false;
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) authError.set(error.message);
  }

  function handleKeydown(e) {
    if (e.key === "Enter") handleSubmit();
  }
</script>

<div class="auth-screen">
  <!-- left: wallpaper panel -->
  <div class="auth-wallpaper">
    <img src={loginWp} alt="" class="wp-img" />
    <div class="wp-overlay" />
    <div class="wp-grid" />
    <div class="wp-content">
      <div class="wp-brand">
        <img src={logoIcon} alt="" class="wp-logo" />
        <div class="wp-text">
          <span class="wp-sparky">Sparky</span>
          <span class="wp-notes">Notes</span>
        </div>
      </div>
    </div>
  </div>

  <!-- right: form panel -->
  <div class="auth-panel">
    <div class="form-wrapper">
      <div class="form-header">
        <h2 class="form-title">{mode === "login" ? "bem-vinda de volta" : "crie sua conta"}</h2>
        <p class="form-sub">{mode === "login" ? "entre para acessar suas sparks" : "comece a organizar suas ideias"}</p>
      </div>

      <!-- google button -->
      <button class="btn-google" on:click={handleGoogle} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        continuar com Google
      </button>

      <div class="divider">
        <span>ou</span>
      </div>

      <!-- email form -->
      <div class="form-fields">
        <div class="input-group">
          <label for="email">email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            on:keydown={handleKeydown}
            placeholder="seu@email.com"
            disabled={loading}
          />
        </div>

        <div class="input-group">
          <label for="password">senha</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            on:keydown={handleKeydown}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {#if $authError}
          <p class="error">{$authError}</p>
        {/if}

        <button
          class="btn-primary"
          on:click={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
          type="button"
        >
          {#if loading}
            <span class="spinner" />
          {/if}
          {mode === "login" ? "entrar" : "criar conta"}
        </button>
      </div>

      <div class="form-footer">
        {#if mode === "login"}
          <span class="footer-text">não tem conta?</span>
          <button class="btn-text" on:click={() => (mode = "signup")} type="button">criar conta</button>
        {:else}
          <span class="footer-text">já tem conta?</span>
          <button class="btn-text" on:click={() => (mode = "login")} type="button">entrar</button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .auth-screen {
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* ── wallpaper side ── */
  .auth-wallpaper {
    flex: 1.2;
    position: relative;
    background: var(--bg-base);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .wp-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .wp-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(9, 9, 12, 0.7) 0%,
      rgba(9, 9, 12, 0.55) 40%,
      rgba(9, 9, 12, 0.75) 100%
    );
    z-index: 1;
  }

  .wp-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    z-index: 2;
  }

  .wp-content {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    padding: 32px;
  }

  .wp-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .wp-logo {
    width: 32px;
    height: 32px;
    object-fit: contain;
    filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.3));
  }

  .wp-text {
    display: flex;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 16px;
  }

  .wp-sparky {
    font-weight: 700;
    color: var(--text-primary);
  }

  .wp-notes {
    font-weight: 500;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── form side ── */
  .auth-panel {
    flex: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border-left: 0.5px solid var(--border-subtle);
    padding: 40px;
  }

  .form-wrapper {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .form-sub {
    font-size: 13px;
    color: var(--text-muted);
  }

  .btn-google {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.04);
    border: 0.5px solid var(--border-default);
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-google:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: var(--border-strong);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    height: 0.5px;
    background: var(--border-subtle);
  }

  .divider span {
    font-size: 11px;
    color: var(--text-ghost);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .input-group label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: var(--font-display);
  }

  .input-group input {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    outline: none;
    transition: border-color var(--transition-fast);
  }

  .input-group input::placeholder {
    color: var(--text-ghost);
  }

  .input-group input:focus {
    border-color: var(--border-accent);
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.1);
  }

  .error {
    font-size: 12px;
    color: var(--pink-400);
  }

  .btn-primary {
    all: unset;
    background: var(--spark-gradient);
    color: white;
    text-align: center;
    padding: 10px;
    border-radius: var(--radius-md);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .form-footer {
    display: flex;
    justify-content: center;
    gap: 6px;
    align-items: center;
  }

  .footer-text {
    font-size: 12px;
    color: var(--text-muted);
  }

  .btn-text {
    all: unset;
    font-size: 12px;
    font-weight: 500;
    color: var(--purple-300);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

  .btn-text:hover {
    color: var(--purple-200);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
