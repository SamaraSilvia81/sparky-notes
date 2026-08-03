<script>
  import { createEventDispatcher } from "svelte";
  import logoIcon from "../../assets/logo-icon.png";
  import { currentUser } from "../stores/auth.js";
  import { checkOllamaStatus } from "../services/ollama.js";
  import { onMount } from "svelte";
  import HistoryDrawer from "./HistoryDrawer.svelte";
  import { historyGroups, historyLoading, loadHistory } from "../stores/historyStore.js";

  const dispatch = createEventDispatcher();

  $: userAvatar = $currentUser?.user_metadata?.avatar_url || "";
  $: userName = $currentUser?.user_metadata?.full_name || $currentUser?.user_metadata?.name || "";
  $: userInitial = userName ? userName.charAt(0).toUpperCase() : "";

  let rawText = "";
  let isProcessing = false;
  let historyOpen = false;
  let textareaEl;
  let messages = [];
  let ollamaOnline = false;

  // conversation tracking
  let activeSparkId = null;
  let activeSparkData = null;

  export function reset() {
    isProcessing = false;
    rawText = "";
  }

  export function addResponse(idea) {
    activeSparkId = idea.id || null;
    activeSparkData = { ...idea };
    messages = [
      ...messages,
      {
        type: "response",
        kind: "new",
        title: idea.title,
        summary: idea.summary,
        rawText: idea.rawText || "",
        tags: idea.tags || [],
        suggestedStack: idea.suggestedStack || [],
        questions: idea.questions || [],
        timestamp: new Date(),
      },
    ];
    persistMessages();
  }

  export function addRefinement(idea) {
    activeSparkData = { ...activeSparkData, ...idea };
    messages = [
      ...messages,
      {
        type: "response",
        kind: "refined",
        title: idea.title,
        summary: idea.summary,
        tags: idea.tags || [],
        suggestedStack: idea.suggestedStack || [],
        questions: idea.questions || [],
        timestamp: new Date(),
      },
    ];
    persistMessages();
  }

  // --- persist messages across navigation ---
  const STORAGE_KEY = "sparky_chat_messages";
  const SPARK_KEY = "sparky_active_spark";

  function persistMessages() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      if (activeSparkId && activeSparkData) {
        sessionStorage.setItem(SPARK_KEY, JSON.stringify({ id: activeSparkId, data: activeSparkData }));
      }
    } catch (_) {}
  }

  function restoreMessages() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        messages = parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
      const spark = sessionStorage.getItem(SPARK_KEY);
      if (spark) {
        const { id, data } = JSON.parse(spark);
        activeSparkId = id;
        activeSparkData = data;
      }
    } catch (_) {}
  }

  onMount(async () => {
    ollamaOnline = await checkOllamaStatus();
    restoreMessages();
  });

  function clearConversation() {
    messages = [];
    activeSparkId = null;
    activeSparkData = null;
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SPARK_KEY);
  }

  function handleQuestionClick(questionText) {
    rawText = questionText;
    if (textareaEl) textareaEl.focus();
  }

  function handleSend() {
    if (!rawText.trim() || isProcessing) return;
    const text = rawText.trim();

    messages = [
      ...messages,
      { type: "user", text, timestamp: new Date() },
    ];
    persistMessages();
    isProcessing = true;

    if (activeSparkId && activeSparkData) {
      dispatch("refine", {
        sparkId: activeSparkId,
        sparkData: activeSparkData,
        answer: text,
      });
    } else {
      dispatch("capture", { text });
    }

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

  $: sparkCount = messages.filter((m) => m.type === "response" && m.kind === "new").length;
  $: placeholderText = activeSparkId
    ? "responda, refine, explore a ideia..."
    : "descreva uma ideia, cole um link, anote um pensamento...";
</script>

<div class="home">
  <div class="tech-grid" aria-hidden="true" />
  <div class="scan-line" aria-hidden="true" />

  <!-- top bar -->
  <nav class="home-topbar">
    <button class="topbar-btn" on:click={() => dispatch("openLibrary")} type="button">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      biblioteca
      <span class="topbar-count"><slot name="count" /></span>
    </button>

    <div class="topbar-right">
      <span class="ollama-chip" class:online={ollamaOnline}>
        <span class="ollama-dot" />
        {ollamaOnline ? "ollama.local" : "offline"}
      </span>
      <button class="history-btn" on:click={() => (historyOpen = true)} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
        histórico
      </button>
      <button class="profile-chip" on:click={() => dispatch("openProfile")} type="button">
        {#if userAvatar}
          <img src={userAvatar} alt="" class="profile-img" referrerpolicy="no-referrer" />
        {:else}
          <span class="profile-initial">{userInitial || "?"}</span>
        {/if}
      </button>
    </div>
  </nav>

  <div class="home-content">
    <div class="hero">
      <img src={logoIcon} alt="Sparky Notes" class="hero-logo" class:glow={isProcessing} />
      <h1 class="hero-title">
        <span class="hero-sparky">Sparky</span>
        <span class="hero-notes">Notes</span>
      </h1>
      <p class="hero-sub">despeje suas ideias — eu organizo pra você</p>
    </div>

    {#if messages.length > 0 && !isProcessing}
      <div class="session-bar">
        <span class="session-label">
          <span class="session-dot" />
          {#if activeSparkId}
            refinando spark
          {:else}
            {sparkCount} spark{sparkCount === 1 ? '' : 's'} nessa sessão
          {/if}
        </span>
        <button class="session-clear" on:click={clearConversation} type="button">
          limpar conversa
        </button>
      </div>
    {/if}

    {#if messages.length > 0}
      <div class="messages">
        {#each messages as msg}
          {#if msg.type === "user"}
            <div class="msg msg-user">
              <div class="msg-avatar msg-avatar-user">
                {#if userAvatar}
                  <img src={userAvatar} alt="" class="avatar-logo" referrerpolicy="no-referrer" />
                {:else}
                  <span class="avatar-initial">{userInitial}</span>
                {/if}
              </div>
              <div class="msg-bubble msg-bubble-user">
                <p>{msg.text}</p>
              </div>
              <span class="msg-time">{formatTime(msg.timestamp)}</span>
            </div>
          {:else}
            <div class="msg msg-spark">
              <div class="msg-avatar">
                <img src={logoIcon} alt="" class="avatar-logo-spark" />
              </div>
              <div class="msg-bubble msg-bubble-spark">
                <div class="msg-status-row">
                  <span class="spark-ready-badge" class:refined={msg.kind === "refined"}>
                    {msg.kind === "refined" ? "✦ spark atualizada" : "✦ spark pronta"}
                  </span>
                  <span class="msg-time-inline">{formatTime(msg.timestamp)}</span>
                </div>
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
                      <button class="question-btn" on:click={() => handleQuestionClick(q)} type="button">
                        <span class="question-icon">✦</span>
                        <span class="question-text">{q}</span>
                        <svg class="question-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
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
              <img src={logoIcon} alt="" class="avatar-logo-spark glow" />
            </div>
            <div class="msg-bubble msg-bubble-spark processing-bubble">
              <div class="typing">
                <span /><span /><span />
              </div>
              <span class="processing-text">{activeSparkId ? "refinando sua ideia..." : "minerando sua ideia..."}</span>
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
          placeholder={placeholderText}
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
      </div>
    </div>
  </div>
</div>

<HistoryDrawer
  bind:open={historyOpen}
  {userInitial}
  {userAvatar}
  on:navigate={(e) => dispatch("openIdea", { ideaId: e.detail.ideaId })}
/>

<style>
  .home {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

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
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139, 92, 246, 0.008) 3px, rgba(139, 92, 246, 0.008) 4px);
    pointer-events: none;
  }

  /* ── topbar ── */
  .home-topbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    flex-shrink: 0;
  }

  .topbar-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-tertiary);
    padding: 6px 12px;
    border-radius: var(--radius-md);
    border: 0.5px solid transparent;
    transition: all var(--transition-fast);
  }

  .topbar-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--glass-border);
  }

  .topbar-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
    background: rgba(255, 255, 255, 0.04);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ollama-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: var(--radius-md);
    background: rgba(15, 14, 22, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
  }

  .ollama-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ef4444;
    flex-shrink: 0;
  }

  .ollama-chip.online .ollama-dot {
    background: var(--success);
    box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
  }

  .ollama-chip.online {
    color: var(--text-secondary);
  }

  .history-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--purple-200);
    padding: 6px 12px;
    border-radius: var(--radius-md);
    border: 0.5px solid rgba(139, 92, 246, 0.25);
    background: rgba(139, 92, 246, 0.1);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .history-btn:hover {
    background: rgba(139, 92, 246, 0.18);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .history-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .profile-chip {
    all: unset;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 1.5px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg);
    transition: border-color var(--transition-fast);
  }

  .profile-chip:hover {
    border-color: var(--purple-500);
  }

  .profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-initial {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    background: var(--spark-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── content ── */
  .home-content {
    position: relative;
    z-index: 1;
    flex: 1;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    padding: 0 24px;
    min-height: 0;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 0 32px;
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

  .msg-user { flex-direction: row-reverse; }

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

  .msg-avatar-user {
    background: var(--spark-gradient-subtle);
    overflow: hidden;
  }

  .msg-avatar-user img.avatar-logo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-logo-spark {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .avatar-initial {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--purple-200);
  }

  .avatar-logo-spark.glow {
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

  .msg-bubble-user p { margin: 0; }

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

  .msg-summary { margin: 0; line-height: 1.7; }

  .msg-tags { display: flex; gap: 4px; flex-wrap: wrap; }

  .tag {
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .tag-topic { color: var(--purple-200); background: rgba(139, 92, 246, 0.15); }
  .tag-tech { color: var(--pink-200); background: rgba(246, 92, 244, 0.12); }

  .msg-questions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 6px;
    border-top: 0.5px solid var(--border-subtle);
  }

  .question-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-tertiary);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    border: 0.5px solid transparent;
    cursor: pointer;
    transition: all 180ms ease;
    width: 100%;
    box-sizing: border-box;
  }

  .question-btn:hover {
    color: var(--text-primary);
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .question-btn:hover .question-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  .question-icon {
    color: var(--purple-400);
    flex-shrink: 0;
  }

  .question-text {
    flex: 1;
    text-align: left;
    line-height: 1.5;
  }

  .question-arrow {
    opacity: 0;
    color: var(--purple-400);
    flex-shrink: 0;
    transition: all 180ms ease;
  }

  /* ── session bar ── */
  .session-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    background: rgba(139, 92, 246, 0.06);
    border: 0.5px solid rgba(139, 92, 246, 0.12);
    margin-bottom: 4px;
  }

  .session-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .session-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--purple-400);
    box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
    animation: dot-pulse 2s ease-in-out infinite;
  }

  @keyframes dot-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .session-clear {
    all: unset;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
    cursor: pointer;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .session-clear:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.04);
  }

  /* ── spark ready badge ── */
  .msg-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .spark-ready-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--success);
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.8;
  }

  .spark-ready-badge.refined {
    color: var(--purple-300);
  }

  .msg-time-inline {
    font-size: 10px;
    color: var(--text-ghost);
    font-family: var(--font-mono);
  }
  .msg-time { font-size: 10px; color: var(--text-ghost); font-family: var(--font-mono); margin-top: 6px; flex-shrink: 0; }

  .processing-bubble { display: flex; flex-direction: row; align-items: center; gap: 10px; }

  .typing { display: flex; gap: 4px; }
  .typing span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--purple-400);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .typing span:nth-child(2) { animation-delay: 0.15s; }
  .typing span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  .processing-text { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

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

  .input-wrapper textarea::placeholder { color: var(--text-ghost); }
  .input-wrapper textarea:disabled { opacity: 0.5; }

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

  .btn-send:hover:not(:disabled) { opacity: 0.9; transform: scale(1.04); }
  .btn-send:active:not(:disabled) { transform: scale(0.95); }
  .btn-send:disabled { opacity: 0.25; cursor: not-allowed; }

  .input-footer {
    display: flex;
    justify-content: center;
    padding: 0 4px;
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-ghost);
  }
</style>