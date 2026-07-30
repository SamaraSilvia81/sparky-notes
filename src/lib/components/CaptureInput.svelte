<script>
  import { createEventDispatcher } from "svelte";
  import SparkIcon from "./SparkIcon.svelte";

  const dispatch = createEventDispatcher();

  let rawText = "";
  let isProcessing = false;
  let isExpanded = false;
  let textareaEl;

  function handleCapture() {
    if (!rawText.trim() || isProcessing) return;
    isProcessing = true;
    dispatch("capture", { text: rawText.trim() });
  }

  export function reset() {
    rawText = "";
    isProcessing = false;
    isExpanded = false;
    if (textareaEl) textareaEl.focus();
  }

  function handleFocus() {
    isExpanded = true;
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleCapture();
    }
    if (e.key === "Escape") {
      isExpanded = false;
      textareaEl.blur();
    }
  }
</script>

<div class="capture" class:expanded={isExpanded} class:processing={isProcessing}>
  <div class="capture-bar" on:click={() => { isExpanded = true; textareaEl?.focus(); }}>
    <SparkIcon size={16} glow={isProcessing} />
    <span class="placeholder" class:hidden={isExpanded}>nova spark — despeje uma ideia...</span>
    <div class="shortcuts">
      <kbd>ctrl</kbd><kbd>shift</kbd><kbd>S</kbd>
    </div>
  </div>

  {#if isExpanded}
    <div class="capture-body">
      <textarea
        bind:this={textareaEl}
        bind:value={rawText}
        on:focus={handleFocus}
        on:keydown={handleKeydown}
        placeholder="pode ser bagunçado — um parágrafo, uma frase, um link. a sparky organiza depois."
        disabled={isProcessing}
        rows="4"
      />
      <div class="capture-actions">
        <span class="hint">
          {#if isProcessing}
            processando com ollama...
          {:else}
            ctrl+enter para capturar · esc para fechar
          {/if}
        </span>
        <button
          class="btn-capture"
          on:click={handleCapture}
          disabled={!rawText.trim() || isProcessing}
          type="button"
        >
          {#if isProcessing}
            <span class="spinner" />
          {/if}
          capturar
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .capture {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-smooth);
    overflow: hidden;
  }

  .capture:hover:not(.expanded) {
    border-color: var(--glass-border-hover);
  }

  .capture.expanded {
    border-color: var(--border-accent);
    background: var(--glass-bg-active);
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .capture.processing {
    border-color: rgba(139, 92, 246, 0.3);
  }

  .capture-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: text;
  }

  .placeholder {
    flex: 1;
    font-size: 13px;
    color: var(--text-muted);
    font-family: var(--font-ui);
  }

  .placeholder.hidden {
    display: none;
  }

  .shortcuts {
    display: flex;
    gap: 3px;
  }

  .shortcuts kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
    background: rgba(255, 255, 255, 0.03);
    border: 0.5px solid var(--border-subtle);
    padding: 2px 5px;
    border-radius: 3px;
    line-height: 1;
  }

  .capture-body {
    padding: 0 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.7;
    resize: none;
    outline: none;
    min-height: 80px;
  }

  textarea::placeholder {
    color: var(--text-ghost);
  }

  textarea:disabled {
    opacity: 0.5;
  }

  .capture-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 0.5px solid var(--border-subtle);
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-ghost);
  }

  .btn-capture {
    all: unset;
    background: var(--spark-gradient);
    color: #fff;
    padding: 6px 16px;
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .btn-capture:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-capture:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn-capture:disabled {
    opacity: 0.35;
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