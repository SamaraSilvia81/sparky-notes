<script>
  import { createEventDispatcher } from "svelte";
  import SparkIcon from "./SparkIcon.svelte";

  const dispatch = createEventDispatcher();

  let rawText = "";
  let isProcessing = false;
  let textareaEl;

  function handleCapture() {
    if (!rawText.trim() || isProcessing) return;
    isProcessing = true;
    dispatch("capture", { text: rawText.trim() });
  }

  export function reset() {
    rawText = "";
    isProcessing = false;
    if (textareaEl) textareaEl.focus();
  }

  export function setProcessing(val) {
    isProcessing = val;
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleCapture();
    }
  }
</script>

<div class="capture">
  <div class="capture-header">
    <SparkIcon size={22} glow={isProcessing} />
    <span class="title">sparky notes</span>
    <span class="shortcut">ctrl + shift + s</span>
  </div>

  <div class="input-area">
    <textarea
      bind:this={textareaEl}
      bind:value={rawText}
      on:keydown={handleKeydown}
      placeholder="despeje sua ideia aqui... pode ser bagunçado, a sparky organiza depois ✦"
      disabled={isProcessing}
      rows="4"
    />
  </div>

  <div class="capture-footer">
    <div class="hints">
      <span class="hint">ctrl+enter para capturar</span>
    </div>
    <button
      class="btn-capture"
      on:click={handleCapture}
      disabled={!rawText.trim() || isProcessing}
    >
      {#if isProcessing}
        <span class="spinner" />
        processando
      {:else}
        capturar ✦
      {/if}
    </button>
  </div>
</div>

<style>
  .capture {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .capture-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .shortcut {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.03);
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    border: 0.5px solid var(--glass-border);
  }

  .input-area textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.7;
    resize: vertical;
    min-height: 100px;
    outline: none;
    transition: border-color var(--transition-fast);
  }

  .input-area textarea::placeholder {
    color: var(--text-ghost);
  }

  .input-area textarea:focus {
    border-color: var(--purple-800);
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.15);
  }

  .input-area textarea:disabled {
    opacity: 0.5;
  }

  .capture-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hints {
    display: flex;
    gap: 8px;
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-ghost);
  }

  .btn-capture {
    background: var(--spark-gradient);
    color: #fff;
    border: none;
    padding: 7px 20px;
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    letter-spacing: 0.3px;
  }

  .btn-capture:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .btn-capture:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn-capture:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
