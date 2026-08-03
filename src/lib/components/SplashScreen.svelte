<script>
  import { onMount } from "svelte";
  import logoIcon from "../../assets/logo-icon.png";

  export let onFinish = () => {};

  const BOOT_LINES = [
    "carregando núcleo sparky...",
    "sincronizando com supabase...",
    "montando biblioteca de ideias...",
    "pronto.",
  ];

  let phase = 0;
  let lineIndex = 0;
  let lineInterval;

  onMount(() => {
    setTimeout(() => (phase = 1), 200);   // logo + título aparecem
    setTimeout(() => (phase = 2), 600);   // linha de status aparece

    // troca a linha de status a cada 600ms
    lineInterval = setInterval(() => {
      lineIndex = Math.min(lineIndex + 1, BOOT_LINES.length - 1);
      if (lineIndex === BOOT_LINES.length - 1) clearInterval(lineInterval);
    }, 600);

    setTimeout(() => (phase = 3), 2800);  // fade out
    setTimeout(() => onFinish(), 3200);
  });
</script>

<div class="splash" class:fade={phase === 3}>
  <div class="amb-before" aria-hidden="true" />
  <div class="amb-after"  aria-hidden="true" />

  <div class="splash-center">
    <div class="logo-mark" class:visible={phase >= 1}>
      <img src={logoIcon} alt="" class="splash-logo" />
    </div>

    <h1 class="splash-title" class:visible={phase >= 1}>
      <span class="t-sparky">Sparky</span>
      <span class="t-notes">Notes</span>
    </h1>

    <p class="splash-status" class:visible={phase >= 2}>
      <span class="prompt">&gt;_</span> {BOOT_LINES[lineIndex]}
    </p>
  </div>
</div>

<style>
  .splash {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: var(--bg-base);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 400ms ease;
  }

  .splash.fade {
    opacity: 0;
    pointer-events: none;
  }

  /* ── blobs ── */
  .amb-before,
  .amb-after {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .amb-before {
    width: 520px;
    height: 520px;
    top: -180px;
    left: -140px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
    filter: blur(80px);
    opacity: 0.55;
  }

  .amb-after {
    width: 560px;
    height: 560px;
    bottom: -200px;
    right: -160px;
    background: radial-gradient(circle, rgba(246, 92, 244, 0.2), transparent 70%);
    filter: blur(80px);
    opacity: 0.5;
  }

  /* ── center ── */
  .splash-center {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .logo-mark {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.85);
    transition: all 500ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .logo-mark.visible {
    opacity: 1;
    transform: scale(1);
  }

  .splash-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.35));
  }

  .splash-title {
    display: flex;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 34px;
    letter-spacing: -0.5px;
    text-transform: uppercase;
    opacity: 0;
    transform: translateY(8px);
    transition: all 550ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .splash-title.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .t-sparky {
    color: var(--text-primary);
  }

  .t-notes {
    background: linear-gradient(135deg, var(--atelier-crimson-bright), var(--pink-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── linha de status ── */
  .splash-status {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
    letter-spacing: 0.2px;
    opacity: 0;
    transition: opacity 300ms ease;
    min-height: 18px;
  }

  .splash-status.visible {
    opacity: 1;
  }

  .prompt {
    color: var(--atelier-crimson-bright);
    font-weight: 600;
  }
</style>