<script>
  import { createEventDispatcher } from "svelte";
  import logoIcon from "../../assets/logo-icon.png";

  const dispatch = createEventDispatcher();

  let rawText = "";
  let isProcessing = false;
  let textareaEl;
  let messages = [];

  export function reset() {
    isProcessing = false;
    rawText = "";
  }

  export function addResponse(idea) {
    messages = [
      ...messages,
      {
        type: "response",
        title: idea.title,
        summary: idea.summary,
        tags: idea.tags || [],
        suggestedStack: idea.suggestedStack || [],
        questions: idea.questions || [],
        timestamp: new Date(),
      },
    ];
  }

  function handleSend() {
    if (!rawText.trim() || isProcessing) return;
    messages = [
      ...messages,
      { type: "user", text: rawText.trim(), timestamp: new Date() },
    ];
    isProcessing = true;
    dispatch("capture", { text: rawText.trim() });
    rawText = "";
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  }

  function formatTime(date) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  $: if (messages.length) {
    setTimeout(() => {
      const el = document.querySelector(".messages");
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
</script>

<div class="home">
  <div class="tech-grid" aria-hidden="true" />
  <div class="scan-line" aria-hidden="true" />

  <div class="home-content">
    <div class="hero">
      <img src={logoIcon} alt="Sparky Notes" class="hero-logo" class:glow={isProcessing} />
      <h1 class="hero-title">
        <span class="hero-sparky">Sparky</span>
        <span class="hero-notes">Notes</span>
      </h1>
      <p class="hero-sub">despeje suas ideias — eu organizo pra você</p>
    </div>

    {#if messages.length > 0}
      <div class="messages">
        {#each messages as msg}
          {#if msg.type === "user"}
            <div class="msg msg-user">
              <div class="msg-bubble msg-bubble-user">
                <p>{msg.text}</p>
              </div>
              <span class="msg-time">{formatTime(msg.timestamp)}</span>
            </div>
          {:else}
            <div class="msg msg-spark">
              <div class="msg-avatar">
                <img src={logoIcon} alt="" class="avatar-logo" />
              </div>
              <div class="msg-bubble msg-bubble-spark">
                <h4 class="msg-title">{msg.title}</h4>
                <p class="msg-summary">{msg.summary}</p>
                {#if msg.tags.length > 0 || msg.suggestedStack.length > 0}
                  <div class="msg-tags">
                    {#each msg.tags as tag}
                      <span class="tag tag-topic">{tag}</span>
                    {/each}
                    {#each msg.suggestedStack as tech}
                      <span class="tag tag-tech">{tech}</span>
                    {/each}
                  </div>
                {/if}
                {#if msg.questions.length > 0}
                  <div class="msg-questions">
                    {#each msg.questions as q}
                      <p class="question">✦ {q}</p>
                    {/each}
                  </div>
                {/if}
              </div>
              <span class="msg-time">{formatTime(msg.timestamp)}</span>
            </div>
          {/if}
        {/each}

        {#if isProcessing}
          <div class="msg msg-spark">
            <div class="msg-avatar">
              <img src={logoIcon} alt="" class="avatar-logo glow" />
            </div>
            <div class="msg-bubble msg-bubble-spark processing-bubble">
              <div class="typing">
                <span /><span /><span />
              </div>
              <span class="processing-text">minerando sua ideia...</span>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <div class="input-dock">
      <div class="input-wrapper">
        <textarea
          bind:this={textareaEl}
          bind:value={rawText}
          on:keydown={handleKeydown}
          placeholder="descreva uma ideia, cole um link, anote um pensamento..."
          disabled={isProcessing}
          rows="2"
        />
        <button
          class="btn-send"
          on:click={handleSend}
          disabled={!rawText.trim() || isProcessing}
          type="button"
          aria-label="Enviar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div class="input-footer">
        <span class="hint">ctrl+enter para enviar</span>
        <button class="btn-library" on:click={() => dispatch("openLibrary")} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          biblioteca
          <span class="lib-count"><slot name="count" /></span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .home {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* ── tech grid background ── */
  .tech-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
    pointer-events: none;
  }

  .scan-line {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(139, 92, 246, 0.008) 3px,
      rgba(139, 92, 246, 0.008) 4px
    );
    pointer-events: none;
  }

  .home-content {
    position: relative;
    z-index: 1;
    height: 100%;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    padding: 0 24px;
  }

  /* ── hero ── */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 56px 0 40px;
    flex-shrink: 0;
  }

  .hero-logo {
    width: 88px;
    height: 88px;
    object-fit: contain;
    transition: filter var(--transition-base);
  }

  .hero-logo.glow {
    filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.5)) drop-shadow(0 0 32px rgba(246, 92, 244, 0.3));
    animation: logo-pulse 2s ease-in-out infinite;
  }

  @keyframes logo-pulse {
    0%, 100% { filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.4)); }
    50% { filter: drop-shadow(0 0 24px rgba(246, 92, 244, 0.5)); }
  }

  .hero-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .hero-sparky {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .hero-notes {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 500;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 15px;
    color: var(--text-tertiary);
    font-family: var(--font-ui);
  }

  /* ── messages ── */
  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    min-height: 0;
  }

  .msg {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    animation: msgIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-user {
    flex-direction: row-reverse;
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .avatar-logo {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .avatar-logo.glow {
    filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));
    animation: logo-pulse 2s ease-in-out infinite;
  }

  .msg-bubble {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    font-size: 13px;
    line-height: 1.65;
  }

  .msg-bubble-user {
    background: rgba(139, 92, 246, 0.15);
    border: 0.5px solid rgba(139, 92, 246, 0.2);
    color: var(--text-primary);
    border-bottom-right-radius: var(--radius-xs);
  }

  .msg-bubble-user p {
    margin: 0;
  }

  .msg-bubble-spark {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    color: var(--text-secondary);
    border-bottom-left-radius: var(--radius-xs);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .msg-title {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .msg-summary {
    margin: 0;
    line-height: 1.7;
  }

  .msg-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .tag-topic {
    color: var(--purple-200);
    background: rgba(139, 92, 246, 0.15);
  }

  .tag-tech {
    color: var(--pink-200);
    background: rgba(246, 92, 244, 0.12);
  }

  .msg-questions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 6px;
    border-top: 0.5px solid var(--border-subtle);
  }

  .question {
    font-size: 12px;
    color: var(--text-tertiary);
    margin: 0;
  }

  .msg-time {
    font-size: 10px;
    color: var(--text-ghost);
    font-family: var(--font-mono);
    margin-top: 6px;
    flex-shrink: 0;
  }

  .processing-bubble {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .typing {
    display: flex;
    gap: 4px;
  }

  .typing span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--purple-400);
    animation: bounce 1.2s ease-in-out infinite;
  }

  .typing span:nth-child(2) { animation-delay: 0.15s; }
  .typing span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  .processing-text {
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  /* ── input dock ── */
  .input-dock {
    flex-shrink: 0;
    padding: 16px 0 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-wrapper {
    display: flex;
    gap: 8px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.5px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 10px 12px 10px 16px;
    box-shadow: var(--elevation-2);
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }

  .input-wrapper:focus-within {
    border-color: var(--border-accent);
    box-shadow: var(--glow-accent), var(--elevation-2);
  }

  .input-wrapper textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    outline: none;
    min-height: 20px;
    max-height: 120px;
  }

  .input-wrapper textarea::placeholder {
    color: var(--text-ghost);
  }

  .input-wrapper textarea:disabled {
    opacity: 0.5;
  }

  .btn-send {
    all: unset;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--spark-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    align-self: flex-end;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .btn-send:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.04);
  }

  .btn-send:active:not(:disabled) {
    transform: scale(0.95);
  }

  .btn-send:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-ghost);
  }

  .btn-library {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-tertiary);
    padding: 5px 10px;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .btn-library:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
  }

  .lib-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }
</style>
